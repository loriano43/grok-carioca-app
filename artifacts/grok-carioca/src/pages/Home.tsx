import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";

/* =========================
   FIREBASE
========================= */

const firebaseConfig = {
apiKey: "AIzaSyCoh6Swv_jo3eHSMaHcgE243B4FRM78aLA",
  authDomain: "grok-carioca-app.firebaseapp.com",
  projectId: "grok-carioca-app",
  storageBucket: "grok-carioca-app.firebasestorage.app",
  messagingSenderId: "729407683397",
  appId: "1:729407683397:web:d0bfe0598995110faadc2c"

};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* =========================
   TYPES
========================= */

type Place = {
  id?: string;
  name: string;
  lat: number;
  lng: number;
  category: string;
  rating: number;
  price: number;
  description: string;
};

/* =========================
   FIX ICON
========================= */

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
});

/* =========================
   MAP CLICK
========================= */

function MapClick({ onAdd }: { onAdd: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onAdd(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/* =========================
   VOZ (AVATAR)
========================= */

function speak(text: string) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "pt-BR";
  utter.rate = 1;
  speechSynthesis.speak(utter);
}

/* =========================
   IA CARIOCA
========================= */

function gerarResposta(pergunta: string, places: Place[]) {
  const texto = pergunta.toLowerCase();

  if (texto.includes("bar")) {
    const bars = places.filter((p) => p.category.includes("bar"));
    if (!bars.length) return "Ih, ainda não tem bar cadastrado, cria um aí!";

    const melhor = bars.sort((a, b) => b.rating - a.rating)[0];
    return `Vai no ${melhor.name}, bom demais, papo reto!`;
  }

  if (texto.includes("barato")) {
    const barato = places.sort((a, b) => a.price - b.price)[0];
    return `Quer economizar? Cola no ${barato.name}, preço suave!`;
  }

  if (places.length) {
    const aleatorio = places[Math.floor(Math.random() * places.length)];
    return `Testa o ${aleatorio.name}, vibe boa demais!`;
  }

  return "Ainda não tem lugar cadastrado, bora adicionar!";
}

/* =========================
   APP
========================= */

export default function App() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [selected, setSelected] = useState<any>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [rating, setRating] = useState(5);
  const [price, setPrice] = useState(20);
  const [description, setDescription] = useState("");

  const [pergunta, setPergunta] = useState("");
  const [resposta, setResposta] = useState("");

  /* =========================
     LOAD
  ========================= */

  const loadPlaces = async () => {
    const snapshot = await getDocs(collection(db, "places"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Place[];

    setPlaces(data);
  };

  useEffect(() => {
    loadPlaces();
  }, []);

  /* =========================
     SAVE
  ========================= */

  const handleSave = async () => {
    if (!selected || !name) return alert("Preencha tudo");

    await addDoc(collection(db, "places"), {
      name,
      lat: selected.lat,
      lng: selected.lng,
      category,
      rating,
      price,
      description,
    });

    setSelected(null);
    setName("");
    setCategory("");
    setDescription("");

    loadPlaces();
  };

  /* =========================
     IA
  ========================= */

  const perguntarIA = () => {
    const resp = gerarResposta(pergunta, places);
    setResposta(resp);
    speak(resp);
  };

  return (
    <div className="h-screen flex flex-col bg-black text-white">

      {/* HEADER */}
      <div className="p-4 border-b border-white/10 flex justify-between">
        <h1>🔥 Grok Carioca</h1>
        <span>🤖 Avatar ativo</span>
      </div>

      {/* MAP */}
      <div className="flex-1">
        <MapContainer
          center={[-22.97, -43.18]}
          zoom={13}
          className="h-full"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapClick onAdd={(lat, lng) => setSelected({ lat, lng })} />

          {places.map((p) => (
            <Marker key={p.id} position={[p.lat, p.lng]}>
              <Popup>
                <b>{p.name}</b>
                <br />
                🍽️ {p.category}
                <br />
                💰 R${p.price}
                <br />
                ⭐ {p.rating}
                <br />
                {p.description}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* FORM */}
      {selected && (
        <div className="p-3 flex flex-col gap-2 bg-black border-t border-white/10">
          <input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} className="p-2 bg-white/10 rounded"/>
          <input placeholder="Categoria" value={category} onChange={(e) => setCategory(e.target.value)} className="p-2 bg-white/10 rounded"/>
          <input type="number" placeholder="Preço" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="p-2 bg-white/10 rounded"/>
          <input type="number" placeholder="Nota" value={rating} onChange={(e) => setRating(Number(e.target.value))} className="p-2 bg-white/10 rounded"/>
          <input placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} className="p-2 bg-white/10 rounded"/>

          <button onClick={handleSave} className="bg-green-500 p-2 rounded">
            Salvar lugar
          </button>
        </div>
      )}

      {/* IA */}
      <div className="p-3 border-t border-white/10 flex flex-col gap-2">
        <input
          placeholder="Pergunta pra IA (ex: bar barato)"
          value={pergunta}
          onChange={(e) => setPergunta(e.target.value)}
          className="p-2 bg-white/10 rounded"
        />

        <button onClick={perguntarIA} className="bg-blue-500 p-2 rounded">
          Perguntar
        </button>

        {resposta && <p className="text-sm">🤖 {resposta}</p>}
      </div>
    </div>
  );
}