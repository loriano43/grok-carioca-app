import { useEffect, useState, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { subscribeToPlaces, CATEGORY_EMOJIS, CATEGORY_LABELS, type Place, type PlaceCategory } from "@/services/firebase";
import { Star, Crown, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function createColoredIcon(color: string, isPremium: boolean) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="32" height="42">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path d="M16 0 C7.163 0 0 7.163 0 16 C0 28 16 42 16 42 C16 42 32 28 32 16 C32 7.163 24.837 0 16 0Z" fill="${color}" filter="url(#shadow)"/>
      ${isPremium ? `<polygon points="16,6 18.2,12.5 25,12.5 19.4,16.5 21.6,23 16,19 10.4,23 12.6,16.5 7,12.5 13.8,12.5" fill="gold" stroke="none"/>` : `<circle cx="16" cy="16" r="7" fill="white" opacity="0.9"/>`}
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
  });
}

const CATEGORY_COLORS: Record<string, string> = {
  restaurant: "#ef4444",
  bar: "#f97316",
  tourism: "#3b82f6",
  hotel: "#8b5cf6",
  beach: "#06b6d4",
  other: "#6b7280",
};

function FlyToPlace({ place }: { place: Place | null }) {
  const map = useMap();
  useEffect(() => {
    if (place) {
      map.flyTo([place.latitude, place.longitude], 15, { duration: 1.2 });
    }
  }, [place, map]);
  return null;
}

interface MapViewProps {
  selectedPlace?: Place | null;
}

export function MapView({ selectedPlace }: MapViewProps) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [filter, setFilter] = useState<PlaceCategory | "all">("all");
  const markerRefs = useRef<Record<string, L.Marker>>({});

  useEffect(() => {
    const unsub = subscribeToPlaces(setPlaces);
    return unsub;
  }, []);

  const filtered = filter === "all" ? places : places.filter((p) => p.category === filter);
  const categories = ["all", "restaurant", "bar", "tourism", "hotel", "beach", "other"] as const;

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat as PlaceCategory | "all")}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
              filter === cat
                ? "bg-primary text-primary-foreground border-primary shadow"
                : "bg-card text-muted-foreground border-border hover:border-primary/50"
            )}
          >
            {cat === "all"
              ? "🗺️ All"
              : `${CATEGORY_EMOJIS[cat as PlaceCategory]} ${CATEGORY_LABELS[cat as PlaceCategory]}`}
          </button>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden border border-border shadow-xl" style={{ height: 420 }}>
        <MapContainer
          center={[-22.9068, -43.1729] as [number, number]}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {selectedPlace && <FlyToPlace place={selectedPlace} />}
          {filtered.map((place) => (
            <Marker
              key={place.id}
              position={[place.latitude, place.longitude] as [number, number]}
              icon={createColoredIcon(CATEGORY_COLORS[place.category] ?? "#6b7280", place.premium)}
              ref={(ref) => {
                if (ref) markerRefs.current[place.id] = ref;
              }}
            >
              <Popup maxWidth={280} className="rounded-xl">
                <div className="flex flex-col gap-2 min-w-[200px]">
                  {place.image && (
                    <img
                      src={place.image}
                      alt={place.name}
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        {place.premium && <Crown className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />}
                        <h3 className="font-bold text-base leading-tight">{place.name}</h3>
                      </div>
                      <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full mt-1 inline-block">
                        {CATEGORY_EMOJIS[place.category]} {CATEGORY_LABELS[place.category]}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-bold">{place.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  {place.description && (
                    <p className="text-sm text-muted-foreground leading-snug line-clamp-2">{place.description}</p>
                  )}
                  {place.address && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="line-clamp-1">{place.address}</span>
                    </div>
                  )}
                  {place.phone && (
                    <a href={`tel:${place.phone}`} className="text-xs text-primary font-medium hover:underline">
                      📞 {place.phone}
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
          {filtered.length === 0 && places.length === 0 && (
            <Marker position={[-22.9068, -43.1729] as [number, number]}>
              <Popup>
                <div className="text-center py-2">
                  <p className="font-medium">Nenhum lugar cadastrado ainda.</p>
                  <p className="text-sm text-muted-foreground">Add the first spot in Rio!</p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {filtered.length} place{filtered.length !== 1 ? "s" : ""} shown
        {places.length > 0 && filter !== "all" ? ` (${places.length} total)` : ""}
      </p>
    </div>
  );
}
