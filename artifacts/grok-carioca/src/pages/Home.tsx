import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useChat } from "@/hooks/use-chat";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WeatherWidget } from "@/components/WeatherWidget";
import { RoleSuggestion } from "@/components/RoleSuggestion";
import { cn } from "@/lib/utils";

export default function Home() {
  const { messages, sendMessage, isInitializing, isTyping, error } = useChat();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;
    
    sendMessage(input);
    setInput("");
    
    // Focus back on input after sending
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative min-h-screen bg-background flex flex-col font-sans overflow-hidden">
      {/* Background with Rio image */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-background/80 dark:bg-background/90 z-10 mix-blend-overlay"></div>
        <img 
          src={`${import.meta.env.BASE_URL}images/rio-bg.png`}
          alt="Rio Background" 
          className="w-full h-full object-cover opacity-30 dark:opacity-10 scale-105"
        />
        {/* Subtle gradients for extra depth */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full mix-blend-screen z-10 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[100px] rounded-full mix-blend-screen z-10 pointer-events-none"></div>
      </div>

      {/* App Header */}
      <header className="relative z-20 w-full px-4 sm:px-6 lg:px-8 py-4 bg-background/60 backdrop-blur-xl border-b border-border/50 sticky top-0 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary shadow-lg bg-card p-0.5">
              <img 
                src={`${import.meta.env.BASE_URL}images/grok-avatar.png`} 
                alt="Grok Carioca" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground leading-none flex items-center gap-2">
              Grok Carioca <Sparkles className="w-4 h-4 text-secondary hidden sm:block" />
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">Fala meu consagrado!</p>
          </div>
        </div>

        <div className="flex flex-1 justify-end items-center gap-3">
          <WeatherWidget className="hidden md:flex" />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto flex flex-col p-4 sm:p-6 lg:p-8 overflow-hidden">
        
        {/* Action Bar (Mobile Weather + Role Suggestion) */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <WeatherWidget className="flex md:hidden flex-1 justify-center" />
          <div className="flex-1 flex justify-center sm:justify-end">
            <RoleSuggestion />
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 bg-card/60 backdrop-blur-md rounded-3xl border border-border/50 shadow-xl overflow-y-auto mb-4 p-4 sm:p-6 scroll-smooth flex flex-col gap-6">
          
          {isInitializing ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="font-medium animate-pulse">Ajeitando a barraca na praia...</p>
            </div>
          ) : error && messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-destructive gap-3 text-center px-4">
              <AlertCircle className="w-12 h-12" />
              <p className="font-bold text-lg">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 px-4 py-2 bg-destructive/10 hover:bg-destructive/20 rounded-lg text-sm transition-colors"
              >
                Tentar de novo
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <div className="w-24 h-24 mb-6 opacity-80">
                <img 
                  src={`${import.meta.env.BASE_URL}images/grok-avatar.png`} 
                  alt="Grok Carioca" 
                  className="w-full h-full object-contain drop-shadow-xl"
                />
              </div>
              <h3 className="text-2xl font-display font-bold text-foreground mb-2">E aí, qual a boa?</h3>
              <p className="text-muted-foreground max-w-md">
                Manda sua ideia, pergunta onde comer o melhor biscoito Globo, ou pede aquela dica de trânsito na Avenida Brasil.
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => {
                const isBot = msg.role === "assistant";
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
                    className={cn(
                      "flex w-full",
                      isBot ? "justify-start" : "justify-end"
                    )}
                  >
                    <div className={cn(
                      "flex gap-3 max-w-[85%] sm:max-w-[75%]",
                      isBot ? "flex-row" : "flex-row-reverse"
                    )}>
                      {/* Avatar */}
                      <div className="flex-shrink-0 mt-auto">
                        {isBot ? (
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-card border border-primary/30 shadow-sm">
                            <img src={`${import.meta.env.BASE_URL}images/grok-avatar.png`} alt="Bot" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold shadow-md">
                            VC
                          </div>
                        )}
                      </div>

                      {/* Bubble */}
                      <div className="flex flex-col gap-1">
                        <div className={cn(
                          "px-5 py-3.5 shadow-md prose prose-sm dark:prose-invert max-w-none leading-relaxed",
                          isBot 
                            ? "bg-white dark:bg-card border border-border rounded-2xl rounded-bl-sm text-foreground" 
                            : "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-2xl rounded-br-sm prose-p:text-primary-foreground prose-strong:text-primary-foreground"
                        )}>
                          {msg.content ? (
                            msg.content.split('\n').map((paragraph, i) => (
                              <p key={i} className="m-0 min-h-[1em]">{paragraph}</p>
                            ))
                          ) : (
                            <span className="flex gap-1 items-center h-5">
                              <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                              <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                              <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                            </span>
                          )}
                        </div>
                        <span className={cn(
                          "text-[10px] text-muted-foreground font-medium px-1",
                          isBot ? "text-left" : "text-right"
                        )}>
                          {format(new Date(msg.createdAt), "HH:mm")}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} className="h-1" />
        </div>

        {/* Input Area */}
        <div className="relative">
          <form 
            onSubmit={handleSubmit}
            className="relative bg-card/80 backdrop-blur-xl border-2 border-primary/20 focus-within:border-primary/50 transition-colors rounded-3xl shadow-lg p-2 flex items-end gap-2"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isInitializing ? "Esperando conexão..." : "Fala aí, consagrado... o que tá rolando?"}
              disabled={isInitializing || isTyping}
              rows={1}
              className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none resize-none focus:ring-0 text-foreground placeholder:text-muted-foreground py-2.5 px-4 text-base scrollbar-none disabled:opacity-50"
              style={{ overflow: 'hidden' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                if(target.value === '') target.style.height = '44px';
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isInitializing || isTyping}
              className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isTyping ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5 ml-1" />
              )}
            </button>
          </form>
          
          {/* Decorative element behind input */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 blur-xl rounded-3xl"></div>
        </div>
      </main>
    </div>
  );
}
