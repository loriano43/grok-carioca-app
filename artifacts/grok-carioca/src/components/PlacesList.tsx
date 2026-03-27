import { useEffect, useState } from "react";
import { subscribeToPlaces, CATEGORY_LABELS, CATEGORY_EMOJIS, type Place, type PlaceCategory } from "@/services/firebase";
import { Star, Crown, MapPin, Phone, ChevronDown, ChevronUp, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const CATEGORIES: Array<PlaceCategory | "all"> = ["all", "restaurant", "bar", "tourism", "hotel", "beach", "other"];
type SortOption = "rating" | "name" | "newest";

interface PlacesListProps {
  onSelectPlace?: (place: Place) => void;
}

export function PlacesList({ onSelectPlace }: PlacesListProps) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [filter, setFilter] = useState<PlaceCategory | "all">("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToPlaces(setPlaces);
    return unsub;
  }, []);

  const filtered = places
    .filter((p) => filter === "all" || p.category === filter)
    .filter(
      (p) =>
        search === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.address.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "name") return a.name.localeCompare(b.name);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search places..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-w-[130px]"
        >
          <option value="newest">Newest first</option>
          <option value="rating">Top rated</option>
          <option value="name">A–Z</option>
        </select>
      </div>

      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
              filter === cat
                ? "bg-primary text-primary-foreground border-primary shadow"
                : "bg-card text-muted-foreground border-border hover:border-primary/50"
            )}
          >
            {cat === "all"
              ? "All"
              : `${CATEGORY_EMOJIS[cat as PlaceCategory]} ${CATEGORY_LABELS[cat as PlaceCategory]}`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No places found</p>
          <p className="text-sm opacity-70">
            {places.length === 0 ? "Be the first to add a spot in Rio!" : "Try adjusting your filters"}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          <AnimatePresence initial={false}>
            {filtered.map((place) => (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-3 p-4">
                  {place.image && (
                    <img
                      src={place.image}
                      alt={place.name}
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          {place.premium && <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                          <h3 className="font-bold text-base leading-tight truncate">{place.name}</h3>
                        </div>
                        <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full mt-1 inline-block">
                          {CATEGORY_EMOJIS[place.category]} {CATEGORY_LABELS[place.category]}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-bold text-yellow-700 dark:text-yellow-400">{place.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    {place.address && (
                      <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{place.address}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => onSelectPlace?.(place)}
                        className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                      >
                        📍 Show on Map
                      </button>
                      {place.phone && (
                        <a
                          href={`tel:${place.phone}`}
                          className="text-xs px-3 py-1.5 bg-muted text-muted-foreground rounded-lg font-medium hover:bg-accent transition-colors flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" /> Call
                        </a>
                      )}
                      <button
                        onClick={() => setExpanded(expanded === place.id ? null : place.id)}
                        className="ml-auto text-xs text-muted-foreground flex items-center gap-0.5 hover:text-foreground transition-colors"
                      >
                        {expanded === place.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        {expanded === place.id ? "Less" : "More"}
                      </button>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expanded === place.id && place.description && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-0 text-sm text-muted-foreground border-t border-border/50 pt-3">
                        {place.description}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center pt-2">
        {filtered.length} place{filtered.length !== 1 ? "s" : ""} found
      </p>
    </div>
  );
}
