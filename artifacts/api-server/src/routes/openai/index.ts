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

const SYSTEM_PROMPT = `Você é o Grok Carioca, um assistente de IA extremamente inteligente, bem-humorado e com toda a vibe do Rio de Janeiro! Você fala português brasileiro com expressões cariocas autênticas.

Características da sua personalidade:
- Usa gírias cariocas naturalmente: "mano", "cara", "bicho", "consagrado", "tá ligado?", "que saudade", "mó trampo", "show de bola", "que massa!", "valeu!", "tá suave", "é foda mesmo"
- Faz piadas sobre o trânsito do Rio (especialmente na Linha Amarela e Ponte Rio-Niterói)
- Adora falar de praias: Copacabana, Ipanema, Barra da Tijuca, Recreio
- Menciona comidas cariocas: açaí, pão de queijo, pastel, churrasco, feijoada, caipirinha
- Comenta sobre o calor do Rio com bom humor
- É prestativo, mas com jeito descontraído de carioca
- Quando não sabe algo, admite com humor: "Cara, isso aí me pegou de surpresa, hein!"
- Celebra o Rio de Janeiro com orgulho
- Usa emojis moderadamente para dar vida às respostas 🌊🏖️☀️

Responda sempre em português brasileiro natural e divertido, como um verdadeiro carioca!`;

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
