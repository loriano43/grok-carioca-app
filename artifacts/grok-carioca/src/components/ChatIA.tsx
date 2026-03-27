import { useRef, useEffect, useState } from "react";
import { useChat } from "@/hooks/use-chat";
import { Send, Loader2, AlertCircle, Bot, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const QUICK_PROMPTS = [
  "Best beach in Rio right now? 🏖️",
  "Where to eat authentic carioca food?",
  "Cheapest happy hour near Lapa?",
  "Is it safe to go to Santa Teresa at night?",
  "Best viewpoint in the city?",
];

export function ChatIA() {
  const { messages, isInitializing, isTyping, error, sendMessage } = useChat();
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isTyping || isInitializing) return;
    setInput("");
    sendMessage(text);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0" style={{ height: "calc(100vh - 280px)", minHeight: 400 }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 px-1 pb-2 scroll-smooth">
        {isInitializing ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3 py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium animate-pulse">Connecting to Grok Carioca...</p>
          </div>
        ) : error && messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-destructive gap-3 text-center py-12 px-4">
            <AlertCircle className="w-10 h-10" />
            <p className="font-bold">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-1 px-4 py-2 bg-destructive/10 hover:bg-destructive/20 rounded-lg text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 gap-6">
            <div className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary shadow-xl">
                <img
                  src={`${import.meta.env.BASE_URL}images/grok-avatar.png`}
                  alt="Grok Carioca"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-lg flex items-center gap-1.5 justify-center">
                  Grok Carioca <Sparkles className="w-4 h-4 text-primary" />
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Your AI local guide with that real Rio energy. Ask me anything about the city! 🌊
                </p>
              </div>
            </div>

            <div className="w-full max-w-sm flex flex-col gap-2">
              <p className="text-xs text-muted-foreground text-center font-semibold uppercase tracking-wide">Try asking</p>
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => { setInput(prompt); setTimeout(() => handleSubmit(), 0); }}
                  className="w-full text-left px-4 py-2.5 rounded-xl bg-card border border-border text-sm hover:border-primary/50 hover:bg-accent transition-all text-foreground"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isBot = msg.role === "assistant";
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, type: "spring", bounce: 0.3 }}
                  className={cn("flex w-full", isBot ? "justify-start" : "justify-end")}
                >
                  <div className={cn("flex gap-2.5 max-w-[85%]", isBot ? "flex-row" : "flex-row-reverse")}>
                    <div className="flex-shrink-0 mt-auto">
                      {isBot ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/30 bg-card shadow-sm">
                          <img
                            src={`${import.meta.env.BASE_URL}images/grok-avatar.png`}
                            alt="AI"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow">
                          YOU
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <div
                        className={cn(
                          "px-4 py-3 shadow-sm leading-relaxed text-sm",
                          isBot
                            ? "bg-card border border-border rounded-2xl rounded-bl-sm text-foreground"
                            : "bg-primary text-primary-foreground rounded-2xl rounded-br-sm"
                        )}
                      >
                        {msg.content ? (
                          msg.content.split("\n").map((line, i) => (
                            <p key={i} className={cn("m-0", i > 0 && "mt-1.5")}>
                              {line || <br />}
                            </p>
                          ))
                        ) : (
                          <span className="flex gap-1 items-center h-4">
                            {[0, 0.2, 0.4].map((delay) => (
                              <motion.span
                                key={delay}
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ repeat: Infinity, duration: 1.2, delay }}
                                className="w-1.5 h-1.5 bg-primary rounded-full"
                              />
                            ))}
                          </span>
                        )}
                      </div>
                      <span className={cn("text-[10px] text-muted-foreground px-1", isBot ? "text-left" : "text-right")}>
                        {format(new Date(msg.createdAt), "HH:mm")}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="pt-3 flex-shrink-0">
        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-2 bg-card border-2 border-border focus-within:border-primary/50 rounded-2xl p-2 shadow transition-colors"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isInitializing
                ? "Connecting..."
                : "Ask Grok Carioca anything about Rio..."
            }
            disabled={isInitializing || isTyping}
            rows={1}
            className="flex-1 bg-transparent border-none resize-none focus:outline-none text-sm text-foreground placeholder:text-muted-foreground py-2 px-2 max-h-28 scrollbar-none disabled:opacity-50"
            onInput={(e) => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = "auto";
              t.style.height = Math.min(t.scrollHeight, 112) + "px";
              if (!t.value) t.style.height = "auto";
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping || isInitializing}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-primary text-primary-foreground rounded-xl shadow hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
          </button>
        </form>
        <p className="text-[10px] text-muted-foreground text-center mt-1.5">
          Powered by Replit AI · Carioca vibes included 🌊
        </p>
      </div>
    </div>
  );
}
