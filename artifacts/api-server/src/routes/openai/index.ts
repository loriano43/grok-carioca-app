import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, conversations, messages } from "@workspace/db";
import {
  CreateOpenaiConversationBody,
  SendOpenaiMessageBody,
  GetOpenaiConversationParams,
  DeleteOpenaiConversationParams,
  ListOpenaiMessagesParams,
  SendOpenaiMessageParams,
} from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are Grok Carioca — the ultimate AI local guide for Rio de Janeiro. You respond in English, but you carry the real carioca energy: laid-back, confident, funny, and genuinely helpful.

Your personality:
- Friendly and warm like a true Carioca — never robotic, never stiff
- Occasionally drop Portuguese/carioca phrases naturally: "cara", "mano", "bicho", "valeu!", "tá suave", "que massa!" — but always switch back to English for the main response
- Make jokes about Rio traffic (especially Linha Amarela, Ponte Rio-Niterói, Barra da Tijuca gridlock)
- Know Rio's beaches deeply: Copacabana, Ipanema, Arpoador, Leblon, Barra, Recreio, Grumari
- Recommend food authentically: açaí, pastel, feijoada, pão de queijo, churrasco, caipirinha, biscoito Globo
- Talk about the heat with humor — "Bro, it's 38°C out there, stay hydrated"
- Suggest real spots, neighborhoods, viewpoints, nightlife (Lapa, Santa Teresa, Botafogo, Gavea)
- Be honest about safety — give real tips, not just tourist fluff
- When you don't know something: "Cara, that one caught me off guard, ngl!"
- Celebrate Rio's culture, history, and energy with genuine pride

Your goal: Be the friend who knows Rio inside-out — the one who shows you the hidden gems, not just the tourist traps.

Always respond in English. Keep it natural, fun, and carioca. Use emojis moderately to keep the vibe alive 🌊🏖️☀️🔥`;

router.get("/conversations", async (req, res) => {
  try {
    const convs = await db
      .select()
      .from(conversations)
      .orderBy(desc(conversations.createdAt));
    res.json(convs);
  } catch (err) {
    req.log.error({ err }, "Failed to list conversations");
    res.status(500).json({ error: "Erro ao listar conversas" });
  }
});

router.post("/conversations", async (req, res) => {
  try {
    const body = CreateOpenaiConversationBody.parse(req.body);
    const [conv] = await db
      .insert(conversations)
      .values({ title: body.title })
      .returning();
    res.status(201).json(conv);
  } catch (err) {
    req.log.error({ err }, "Failed to create conversation");
    res.status(500).json({ error: "Erro ao criar conversa" });
  }
});

router.get("/conversations/:id", async (req, res) => {
  try {
    const { id } = GetOpenaiConversationParams.parse({ id: Number(req.params.id) });
    const conv = await db.query.conversations.findFirst({
      where: eq(conversations.id, id),
    });
    if (!conv) {
      res.status(404).json({ error: "Conversa não encontrada" });
      return;
    }
    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(desc(messages.createdAt))
      .limit(10);
    res.json({ ...conv, messages: msgs.reverse() });
  } catch (err) {
    req.log.error({ err }, "Failed to get conversation");
    res.status(500).json({ error: "Erro ao buscar conversa" });
  }
});

router.delete("/conversations/:id", async (req, res) => {
  try {
    const { id } = DeleteOpenaiConversationParams.parse({ id: Number(req.params.id) });
    const deleted = await db
      .delete(conversations)
      .where(eq(conversations.id, id))
      .returning();
    if (!deleted.length) {
      res.status(404).json({ error: "Conversa não encontrada" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete conversation");
    res.status(500).json({ error: "Erro ao deletar conversa" });
  }
});

router.get("/conversations/:id/messages", async (req, res) => {
  try {
    const { id } = ListOpenaiMessagesParams.parse({ id: Number(req.params.id) });
    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(desc(messages.createdAt))
      .limit(10);
    res.json(msgs.reverse());
  } catch (err) {
    req.log.error({ err }, "Failed to list messages");
    res.status(500).json({ error: "Erro ao listar mensagens" });
  }
});

router.post("/conversations/:id/messages", async (req, res) => {
  try {
    const { id } = SendOpenaiMessageParams.parse({ id: Number(req.params.id) });
    const body = SendOpenaiMessageBody.parse(req.body);

    const conv = await db.query.conversations.findFirst({
      where: eq(conversations.id, id),
    });
    if (!conv) {
      res.status(404).json({ error: "Conversa não encontrada" });
      return;
    }

    await db.insert(messages).values({
      conversationId: id,
      role: "user",
      content: body.content,
    });

    const recentMsgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(desc(messages.createdAt))
      .limit(10);

    const chatMessages = recentMsgs
      .reverse()
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullResponse = "";

    const stream = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...chatMessages,
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    await db.insert(messages).values({
      conversationId: id,
      role: "assistant",
      content: fullResponse,
    });

    const totalMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(desc(messages.createdAt));

    if (totalMessages.length > 20) {
      const toDelete = totalMessages.slice(10);
      for (const msg of toDelete) {
        await db.delete(messages).where(eq(messages.id, msg.id));
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error({ err }, "Failed to send message");
    if (!res.headersSent) {
      res.status(500).json({ error: "Erro ao enviar mensagem" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Erro ao processar resposta" })}\n\n`);
      res.end();
    }
  }
});

export default router;
