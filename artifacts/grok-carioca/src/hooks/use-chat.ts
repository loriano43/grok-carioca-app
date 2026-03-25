import { useState, useEffect, useRef } from 'react';
import { createOpenaiConversation, getOpenaiConversation, type OpenaiMessage } from "@workspace/api-client-react";

export function useChat() {
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<OpenaiMessage[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        // Create a new conversation each session for simplicity
        const conv = await createOpenaiConversation({ title: "Conversa Carioca" });
        if (!mounted) return;
        
        setConversationId(conv.id);
        
        // Fetch history just in case, though it's new
        const data = await getOpenaiConversation(conv.id);
        if (mounted) {
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error("Failed to init conversation:", err);
        if (mounted) setError("Ih, deu ruim na conexão, consagrado!");
      } finally {
        if (mounted) setIsInitializing(false);
      }
    }
    init();

    return () => { mounted = false; };
  }, []);

  const sendMessage = async (content: string) => {
    if (!conversationId || !content.trim()) return;

    const userMsg: OpenaiMessage = {
      id: Date.now(),
      conversationId,
      role: "user",
      content,
      createdAt: new Date().toISOString()
    };

    const botMsgId = Date.now() + 1;
    const botMsg: OpenaiMessage = {
      id: botMsgId,
      conversationId,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg, botMsg]);
    setIsTyping(true);
    setError(null);

    try {
      const res = await fetch(`/api/openai/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let botContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(line => line.trim().startsWith("data: "));

        for (const line of lines) {
          const dataStr = line.replace("data: ", "").trim();
          if (!dataStr) continue;

          try {
            const data = JSON.parse(dataStr);
            if (data.done) {
              setIsTyping(false);
            } else if (data.content) {
              botContent += data.content;
              setMessages(prev => prev.map(msg =>
                msg.id === botMsgId ? { ...msg, content: botContent } : msg
              ));
            }
          } catch (e) {
            // Ignore incomplete chunks, standard in SSE parsing
          }
        }
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setIsTyping(false);
      setMessages(prev => prev.map(msg => 
        msg.id === botMsgId ? { ...msg, content: "Putz, a internet aqui no calçadão falhou. Tenta de novo aí!" } : msg
      ));
    }
  };

  return { messages, sendMessage, isInitializing, isTyping, error };
}
