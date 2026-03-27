import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Map, PlusCircle, List, Sun, Moon, Sparkles } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { WeatherWidget } from "@/components/WeatherWidget";
import { RoleSuggestion } from "@/components/RoleSuggestion";
import { ChatIA } from "@/components/ChatIA";
import { MapView } from "@/components/MapView";
import { AddPlaceForm } from "@/components/AddPlaceForm";
import { PlacesList } from "@/components/PlacesList";
import { type Place } from "@/services/firebase";
import { cn } from "@/lib/utils";

type Tab = "chat" | "map" | "add" | "list";

const TABS: { id: Tab; label: string; icon: React.ReactNode; mobileLabel: string }[] = [
  { id: "chat", label: "AI Chat", mobileLabel: "Chat", icon: <MessageSquare className="w-4 h-4" /> },
  { id: "map", label: "Map", mobileLabel: "Map", icon: <Map className="w-4 h-4" /> },
  { id: "list", label: "Places", mobileLabel: "Places", icon: <List className="w-4 h-4" /> },
  { id: "add", label: "Add Place", mobileLabel: "Add", icon: <PlusCircle className="w-4 h-4" /> },
];

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const handleSelectPlace = (place: Place) => {
    setSelectedPlace(place);
    setActiveTab("map");
  };

  const handleAddSuccess = () => {
    setActiveTab("list");
  };

  return (
    <div className="relative min-h-screen bg-background flex flex-col font-sans overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src={`${import.meta.env.BASE_URL}images/rio-bg.png`}
          alt=""
          aria-hidden
          className="w-full h-full object-cover opacity-20 dark:opacity-10 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background/90" />
      </div>

      {/* Header */}
      <header className="relative z-20 w-full px-4 sm:px-6 py-3 bg-background/70 backdrop-blur-xl border-b border-border/50 sticky top-0 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary shadow-md">
                <img
                  src={`${import.meta.env.BASE_URL}images/grok-avatar.png`}
                  alt="Grok Carioca"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-foreground leading-none flex items-center gap-1.5">
                Grok Carioca <Sparkles className="w-3.5 h-3.5 text-primary" />
              </h1>
              <p className="text-[11px] text-muted-foreground font-medium">Rio's smartest local guide</p>
            </div>
          </div>

          {/* Weather in center */}
          <div className="flex-1 flex justify-center">
            <WeatherWidget />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden sm:block">
              <RoleSuggestion />
            </div>
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-border bg-card/60 hover:bg-accent transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Role Suggestion */}
      <div className="sm:hidden relative z-10 px-4 pt-3 flex justify-center">
        <RoleSuggestion />
      </div>

      {/* Tab Navigation */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-4">
        <div className="flex gap-1 bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-1.5 shadow-sm">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-sm font-semibold transition-all duration-200",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden text-xs">{tab.mobileLabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === "chat" && (
              <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl p-4 sm:p-6">
                <ChatIA />
              </div>
            )}

            {activeTab === "map" && (
              <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl p-4 sm:p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Map className="w-5 h-5 text-primary" />
                  Explore Rio de Janeiro
                </h2>
                <MapView selectedPlace={selectedPlace} />
              </div>
            )}

            {activeTab === "list" && (
              <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl p-4 sm:p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <List className="w-5 h-5 text-primary" />
                  Places in Rio
                </h2>
                <PlacesList onSelectPlace={handleSelectPlace} />
              </div>
            )}

            {activeTab === "add" && (
              <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl p-4 sm:p-6">
                <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-primary" />
                  Add a Place
                </h2>
                <p className="text-sm text-muted-foreground mb-5">
                  Know a great spot in Rio? Add it to the map and share it with everyone! 🌊
                </p>
                <AddPlaceForm onSuccess={handleAddSuccess} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
