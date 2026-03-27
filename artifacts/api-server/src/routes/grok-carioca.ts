import { Router, type IRouter } from "express";

const router: IRouter = Router();

const WEATHER_CODES: Record<number, { description: string; icon: string }> = {
  0: { description: "Clear sky", icon: "☀️" },
  1: { description: "Mostly clear", icon: "🌤️" },
  2: { description: "Partly cloudy", icon: "⛅" },
  3: { description: "Overcast", icon: "☁️" },
  45: { description: "Foggy", icon: "🌫️" },
  48: { description: "Freezing fog", icon: "🌫️" },
  51: { description: "Light drizzle", icon: "🌦️" },
  53: { description: "Drizzle", icon: "🌦️" },
  55: { description: "Heavy drizzle", icon: "🌧️" },
  61: { description: "Light rain", icon: "🌧️" },
  63: { description: "Rain", icon: "🌧️" },
  65: { description: "Heavy rain", icon: "🌧️" },
  71: { description: "Light snow", icon: "🌨️" },
  73: { description: "Snowfall", icon: "❄️" },
  80: { description: "Light showers", icon: "🌦️" },
  81: { description: "Showers", icon: "🌧️" },
  82: { description: "Heavy showers", icon: "⛈️" },
  95: { description: "Thunderstorm", icon: "⛈️" },
  96: { description: "Thunderstorm w/ hail", icon: "⛈️" },
  99: { description: "Heavy thunderstorm", icon: "⛈️" },
};

const ROLE_SUGGESTIONS = [
  { suggestion: "Watch the sunset at Arpoador with a caipirinha in hand — pure magic!", category: "Beach", emoji: "🌅" },
  { suggestion: "Grab açaí at Baixo Gávea and hang with the locals!", category: "Leisure", emoji: "🍧" },
  { suggestion: "Take the cable car up Pão de Açúcar for insane views of the city!", category: "Sightseeing", emoji: "🚡" },
  { suggestion: "Hike Pedra da Gávea — are you up for the challenge?", category: "Adventure", emoji: "🏔️" },
  { suggestion: "Chill at Ipanema beach and watch the locals play futevôlei!", category: "Beach", emoji: "🏐" },
  { suggestion: "Visit Christ the Redeemer during golden hour — worth every step!", category: "Tourism", emoji: "✝️" },
  { suggestion: "Eat pastel and sugarcane juice at the Glória street market!", category: "Food", emoji: "🥟" },
  { suggestion: "Stroll through Jardim Botânico and see the giant Victoria amazonica lilies!", category: "Nature", emoji: "🌺" },
  { suggestion: "Catch a game at Maracanã — the atmosphere is absolutely wild!", category: "Sport", emoji: "⚽" },
  { suggestion: "Hit Lapa for happy hour, live samba, and real Rio nightlife!", category: "Nightlife", emoji: "🎵" },
  { suggestion: "Try stand-up paddle at Lagoa Rodrigo de Freitas!", category: "Sport", emoji: "🏄" },
  { suggestion: "Ice-cold beer by the ocean in Barra da Tijuca — tá suave!", category: "Leisure", emoji: "🍺" },
  { suggestion: "Visit Museu do Amanhã — the most impressive museum in Rio, hands down!", category: "Culture", emoji: "🔬" },
  { suggestion: "Saturday feijoada in Santa Teresa — this is non-negotiable, cara!", category: "Food", emoji: "🫕" },
  { suggestion: "Bike along the Copacabana boardwalk early morning — best way to start the day!", category: "Sport", emoji: "🚲" },
  { suggestion: "Have a cold draft beer at Confeitaria Colombo — it's like stepping into the 1900s!", category: "Culture", emoji: "☕" },
  { suggestion: "Spot dolphins at Barra da Tijuca beach at sunrise — yes, for real!", category: "Nature", emoji: "🐬" },
  { suggestion: "Take a boat tour of Guanabara Bay and see Rio from the water!", category: "Sightseeing", emoji: "⛵" },
  { suggestion: "Pizza in Gavea after a long walk through the neighborhood — proper move!", category: "Food", emoji: "🍕" },
  { suggestion: "Free outdoor show in Lapa on a Friday night — this is why people love Rio!", category: "Culture", emoji: "🎭" },
];

router.get("/weather", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=-22.9068&longitude=-43.1729&current=temperature_2m,apparent_temperature,relative_humidity_2m,windspeed_10m,weathercode&timezone=America%2FSao_Paulo&forecast_days=1"
    );

    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status}`);
    }

    const data = (await response.json()) as {
      current: {
        temperature_2m: number;
        apparent_temperature: number;
        relative_humidity_2m: number;
        windspeed_10m: number;
        weathercode: number;
      };
    };

    const current = data.current;
    const weatherCode = current.weathercode;
    const weatherInfo = WEATHER_CODES[weatherCode] ?? { description: "Tempo variável", icon: "🌡️" };

    res.json({
      temperature: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      humidity: current.relative_humidity_2m,
      windspeed: Math.round(current.windspeed_10m),
      weatherCode,
      description: weatherInfo.description,
      icon: weatherInfo.icon,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch weather");
    res.status(500).json({ error: "Erro ao buscar clima" });
  }
});

router.get("/role-suggestion", (_req, res) => {
  const suggestion = ROLE_SUGGESTIONS[Math.floor(Math.random() * ROLE_SUGGESTIONS.length)];
  res.json(suggestion);
});

export default router;
