import { Router, type IRouter, type Request, type Response } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequestBody {
  message: string;
  history?: ChatMessage[];
}

const SYSTEM_PROMPT = `You are Grok Carioca — the ultimate AI local guide for Rio de Janeiro. You respond in English, but you carry the real carioca energy: laid-back, confident, funny, and genuinely helpful.

Your personality:
- Friendly and warm like a true Carioca — never robotic, never stiff
- Occasionally drop Portuguese/carioca phrases naturally: "cara", "mano", "bicho", "valeu!", "tá suave", "que massa!" — but always switch back to English for the main response
- Make jokes about Rio traffic, know the beaches deeply, recommend food authentically
- Be honest about safety — give real tips, not just tourist fluff
- Celebrate Rio's culture, history, and energy with genuine pride

Always respond in English. Keep it natural, fun, and carioca. Use emojis moderately 🌊🏖️☀️🔥`;

/**
 * POST /api/chat
 * Stateless SSE streaming chat — no database, no conversation ID required.
 * Body: { message: string, history?: Array<{ role: "user"|"assistant", content: string }> }
 * Returns: text/event-stream with `data: {"content":"..."}` chunks, ending with `data: {"done":true}`
 */
router.post("/", async (req: Request, res: Response) => {
  const body = req.body as ChatRequestBody;
  const userMessage = body.message?.trim();

  if (!userMessage) {
    res.status(400).json({ error: "message is required" });
    return;
  }

  const history: ChatMessage[] = Array.isArray(body.history)
    ? body.history.filter(
        (m) =>
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string",
      )
    : [];

  // SSE headers — X-Accel-Buffering disables nginx/proxy buffering for real-time delivery
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 4096,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...history.slice(-10), // Keep last 10 turns for context
        { role: "user", content: userMessage },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error({ err }, "Chat stream failed");
    if (!res.headersSent) {
      res.status(500).json({ error: "Chat request failed" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`);
      res.end();
    }
  }
});

export default router;
