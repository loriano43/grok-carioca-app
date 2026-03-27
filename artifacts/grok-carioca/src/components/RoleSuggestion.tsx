import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Map, X, Sparkles, Loader2 } from "lucide-react";
import { useGetRoleSuggestion } from "@workspace/api-client-react";

export function RoleSuggestion() {
  const [isOpen, setIsOpen] = useState(false);
  const { data, refetch, isFetching } = useGetRoleSuggestion({
    query: { enabled: false },
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleOpen = async () => {
    setIsOpen(true);
    await refetch();
  };

  const close = () => setIsOpen(false);

  const modal = (
    <AnimatePresence>
      {isOpen && (
        /*
         * Single fixed layer: covers the full viewport, acts as the dark
         * overlay, AND flexbox-centers the card.  No positioning tricks
         * are needed on the card itself, so Framer Motion can animate
         * scale/opacity/y without any transform conflicts.
         */
        <motion.div
          key="role-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={close}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 99999,
            backgroundColor: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          {/* Card — stop click bubbling so it doesn't close the modal */}
          <motion.div
            key="role-modal-card"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "28rem",
              position: "relative",
              zIndex: 100000,
            }}
            className="bg-card rounded-3xl shadow-2xl border-2 border-border/50 overflow-hidden"
          >
            {/* Header */}
            <div className="relative h-24 bg-gradient-to-br from-primary via-accent to-secondary p-6 flex items-end">
              <button
                onClick={close}
                aria-label="Close modal"
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-colors"
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
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
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
        </motion.div>
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
