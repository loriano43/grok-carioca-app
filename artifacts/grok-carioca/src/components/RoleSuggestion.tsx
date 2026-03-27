import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Map, X, Sparkles, Loader2 } from "lucide-react";
import { useGetRoleSuggestion } from "@workspace/api-client-react";

export function RoleSuggestion() {
  const [isOpen, setIsOpen] = useState(false);
  const { data, refetch, isFetching } = useGetRoleSuggestion({
    query: { enabled: false },
  });

  const handleOpen = async () => {
    setIsOpen(true);
    await refetch();
  };

  const modal = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Full-screen dark overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9998,
              backgroundColor: "rgba(0,0,0,0.7)",
            }}
          />

          {/* Modal card — centered, responsive */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 24 }}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 9999,
              width: "min(90vw, 28rem)",
            }}
            className="bg-card rounded-3xl shadow-2xl border-2 border-border/50 overflow-hidden"
          >
            {/* Header */}
            <div className="relative h-24 bg-gradient-to-br from-primary via-accent to-secondary p-6 flex items-end">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-2xl font-bold text-white drop-shadow-md leading-none">
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
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center text-4xl shadow-inner">
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
  );

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
        <div className="absolute -top-1 -right-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          <Sparkles className="w-4 h-4 animate-pulse" />
        </div>
      </motion.button>

      {createPortal(modal, document.body)}
    </>
  );
}
