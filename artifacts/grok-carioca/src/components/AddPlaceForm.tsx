import { useState } from "react";
import { addPlace, CATEGORY_LABELS, type NewPlace, type PlaceCategory } from "@/services/firebase";
import { MapPin, Star, Crown, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const CATEGORIES: PlaceCategory[] = ["restaurant", "bar", "tourism", "hotel", "beach", "other"];

const defaultForm: NewPlace = {
  name: "",
  category: "restaurant",
  description: "",
  address: "",
  latitude: -22.9068,
  longitude: -43.1729,
  phone: "",
  image: "",
  rating: 4.0,
  premium: false,
};

export function AddPlaceForm({ onSuccess }: { onSuccess?: () => void }) {
  const [form, setForm] = useState<NewPlace>(defaultForm);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const set = (field: keyof NewPlace, value: NewPlace[keyof NewPlace]) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setStatus("loading");
    try {
      await addPlace(form);
      setStatus("success");
      setForm(defaultForm);
      setTimeout(() => {
        setStatus("idle");
        onSuccess?.();
      }, 2000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to save. Check your Firebase config.");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground";
  const labelClass = "block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AnimatePresence mode="wait">
        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400"
          >
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">Place added successfully! 🎉</p>
              <p className="text-xs opacity-80">It will appear on the map right away.</p>
            </div>
          </motion.div>
        )}
        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{errorMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={labelClass}>Place Name *</label>
          <input
            type="text"
            className={inputClass}
            placeholder="Ex: Bar do Zé, Praia do Leblon..."
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Category</label>
          <select
            className={inputClass}
            value={form.category}
            onChange={(e) => set("category", e.target.value as PlaceCategory)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>
            <Star className="w-3 h-3 inline mr-1" />
            Rating (0–5)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={5}
              step={0.5}
              value={form.rating}
              onChange={(e) => set("rating", parseFloat(e.target.value))}
              className="flex-1 accent-primary"
            />
            <span className="text-sm font-bold w-8 text-right text-primary">{form.rating.toFixed(1)}</span>
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Description</label>
          <textarea
            className={cn(inputClass, "resize-none")}
            placeholder="Tell us what makes this place special..."
            rows={2}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>
            <MapPin className="w-3 h-3 inline mr-1" />
            Address
          </label>
          <input
            type="text"
            className={inputClass}
            placeholder="Rua, number, neighborhood..."
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>Latitude</label>
          <input
            type="number"
            step="any"
            className={inputClass}
            placeholder="-22.9068"
            value={form.latitude}
            onChange={(e) => set("latitude", parseFloat(e.target.value) || 0)}
          />
        </div>

        <div>
          <label className={labelClass}>Longitude</label>
          <input
            type="number"
            step="any"
            className={inputClass}
            placeholder="-43.1729"
            value={form.longitude}
            onChange={(e) => set("longitude", parseFloat(e.target.value) || 0)}
          />
        </div>

        <div>
          <label className={labelClass}>Phone</label>
          <input
            type="tel"
            className={inputClass}
            placeholder="(21) 99999-9999"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>Image URL</label>
          <input
            type="url"
            className={inputClass}
            placeholder="https://..."
            value={form.image}
            onChange={(e) => set("image", e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div
              onClick={() => set("premium", !form.premium)}
              className={cn(
                "relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0",
                form.premium ? "bg-yellow-400" : "bg-muted"
              )}
            >
              <div
                className={cn(
                  "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200",
                  form.premium ? "translate-x-6" : "translate-x-0"
                )}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-sm">
                <Crown className="w-4 h-4 text-yellow-500" />
                Premium Place
              </div>
              <p className="text-xs text-muted-foreground">Premium spots get a special gold star marker on the map</p>
            </div>
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={status === "loading" || status === "success"}
        className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <MapPin className="w-4 h-4" />
            Add Place to Map
          </>
        )}
      </button>
    </form>
  );
}
