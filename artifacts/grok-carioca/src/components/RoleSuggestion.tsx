import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, X, Sparkles, Loader2 } from "lucide-react";
import { useGetRoleSuggestion } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

export function RoleSuggestion() {
  const [isOpen, setIsOpen] = useState(false);
  const { data, refetch, isFetching } = useGetRoleSuggestion({
    query: {
      enabled: false // Only fetch when clicked
    }
  });

  const handleOpen = async () => {
    setIsOpen(true);
    await refetch();
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02, translateY: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleOpen}
        className="group relative flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground font-display font-bold text-lg rounded-2xl shadow-lg shadow-secondary/25 hover:shadow-xl hover:shadow-secondary/40 border border-secondary/20 transition-all duration-300"
      >
        <Map className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        What to do in Rio?
        
        {/* Sparkle effect decoration */}
        <div className="absolute -top-1 -right-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          <Sparkles className="w-4 h-4 animate-pulse" />
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-md bg-card rounded-3xl shadow-2xl border-2 border-border/50 overflow-hidden"
            >
              {/* Header */}
              <div className="relative h-24 bg-gradient-to-br from-primary via-accent to-secondary p-6">
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-2xl font-display font-bold text-white drop-shadow-md">
                  What to do in Rio? 🌊
                </h3>
              </div>

              {/* Content */}
              <div className="p-8 min-h-[200px] flex flex-col items-center justify-center text-center">
                {isFetching ? (
                  <div className="flex flex-col items-center gap-4 text-muted-foreground">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="font-medium animate-pulse">Asking the locals... 🤙</p>
                  </div>
                ) : data ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center text-4xl shadow-inner mb-2">
                      {data.emoji || "🏖️"}
                    </div>
                    <span className="px-3 py-1 bg-accent/10 text-accent font-bold text-xs uppercase tracking-wider rounded-full">
                      {data.category}
                    </span>
                    <p className="text-xl font-medium text-foreground leading-relaxed">
                      {data.suggestion}
                    </p>
                  </motion.div>
                ) : (
                  <p className="text-destructive font-medium">Something went wrong, try again!</p>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-muted/30 border-t border-border flex justify-center">
                <button
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="text-sm font-bold text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                >
                  Give me another idea! 🎲
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
