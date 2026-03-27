import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  type QuerySnapshot,
  type DocumentData,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCoh6Swv_jo3eHSMaHcgE243B4FRM78aLA",
  authDomain: "grok-carioca-app.firebaseapp.com",
  projectId: "grok-carioca-app",
  storageBucket: "grok-carioca-app.firebasestorage.app",
  messagingSenderId: "729407683397",
  appId: "1:729407683397:web:d0bfe0598995110faadc2c",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);

export type PlaceCategory = "restaurant" | "bar" | "tourism" | "hotel" | "beach" | "other";

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  image: string;
  rating: number;
  premium: boolean;
  createdAt: string;
}

export type NewPlace = Omit<Place, "id" | "createdAt">;

export async function addPlace(place: NewPlace): Promise<string> {
  const docRef = await addDoc(collection(db, "locais"), {
    ...place,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function getPlaces(): Promise<Place[]> {
  const snapshot: QuerySnapshot<DocumentData> = await getDocs(
    query(collection(db, "locais"), orderBy("createdAt", "desc"))
  );
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Place));
}

export function subscribeToPlaces(callback: (places: Place[]) => void) {
  const q = query(collection(db, "locais"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const places = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Place));
    callback(places);
  });
}

export const CATEGORY_LABELS: Record<PlaceCategory | "other", string> = {
  restaurant: "Restaurant",
  bar: "Bar",
  tourism: "Tourism",
  hotel: "Hotel",
  beach: "Beach",
  other: "Other",
};

export const CATEGORY_EMOJIS: Record<PlaceCategory | "other", string> = {
  restaurant: "🍽️",
  bar: "🍺",
  tourism: "🏛️",
  hotel: "🏨",
  beach: "🏖️",
  other: "📍",
};
