import { Router, type IRouter } from "express";

const router: IRouter = Router();

const WEATHER_CODES: Record<number, { description: string; icon: string }> = {
  0: { description: "Céu limpo", icon: "☀️" },
  1: { description: "Principalmente limpo", icon: "🌤️" },
  2: { description: "Parcialmente nublado", icon: "⛅" },
  3: { description: "Nublado", icon: "☁️" },
  45: { description: "Neblina", icon: "🌫️" },
  48: { description: "Neblina com gelo", icon: "🌫️" },
  51: { description: "Garoa leve", icon: "🌦️" },
  53: { description: "Garoa moderada", icon: "🌦️" },
  55: { description: "Garoa forte", icon: "🌧️" },
  61: { description: "Chuva leve", icon: "🌧️" },
  63: { description: "Chuva moderada", icon: "🌧️" },
  65: { description: "Chuva forte", icon: "🌧️" },
  71: { description: "Neve leve", icon: "🌨️" },
  73: { description: "Neve moderada", icon: "❄️" },
  80: { description: "Chuva passageira leve", icon: "🌦️" },
  81: { description: "Chuva passageira moderada", icon: "🌧️" },
  82: { description: "Chuva passageira forte", icon: "⛈️" },
  95: { description: "Trovoada", icon: "⛈️" },
  96: { description: "Trovoada com granizo", icon: "⛈️" },
  99: { description: "Trovoada forte com granizo", icon: "⛈️" },
};

const ROLE_SUGGESTIONS = [
  { suggestion: "Curtir o pôr do sol no Arpoador com uma caipirinha na mão!", category: "Praia", emoji: "🌅" },
  { suggestion: "Tomar açaí no Baixo Gávea e ficar de papo!", category: "Lazer", emoji: "🍧" },
  { suggestion: "Subir o Pão de Açúcar no bondinho e tirar foto da vista!", category: "Passeio", emoji: "🚡" },
  { suggestion: "Fazer trilha na Pedra da Gávea - tá preparado?", category: "Aventura", emoji: "🏔️" },
  { suggestion: "Relaxar na praia de Ipanema e assistir a galera jogando futevôlei!", category: "Praia", emoji: "🏐" },
  { suggestion: "Visitar o Cristo Redentor na hora dourada!", category: "Turismo", emoji: "✝️" },
  { suggestion: "Comer pastel e tomar caldo de cana na feira da Glória!", category: "Gastronomia", emoji: "🥟" },
  { suggestion: "Fazer um rolê no Jardim Botânico e ver as vitórias-régias!", category: "Natureza", emoji: "🌺" },
  { suggestion: "Assistir ao jogo no Maracanã - experiência inesquecível!", category: "Esporte", emoji: "⚽" },
  { suggestion: "Curtir o happy hour no Lapa com samba ao vivo!", category: "Noite", emoji: "🎵" },
  { suggestion: "Fazer stand-up paddle na Lagoa Rodrigo de Freitas!", category: "Esporte", emoji: "🏄" },
  { suggestion: "Tomar cerveja gelada olhando pro mar na Barra da Tijuca!", category: "Lazer", emoji: "🍺" },
  { suggestion: "Visitar o Museu do Amanhã no centro e se impressionar!", category: "Cultura", emoji: "🔬" },
  { suggestion: "Comer feijoada completa no sábado no Santa Teresa!", category: "Gastronomia", emoji: "🫕" },
  { suggestion: "Andar de bicicleta pela orla de Copacabana de manhãzinha!", category: "Esporte", emoji: "🚲" },
  { suggestion: "Tomar um chope na Confeitaria Colombo e se sentir na Belle Époque!", category: "Cultura", emoji: "☕" },
  { suggestion: "Ver os golfinhos na Barra da Tijuca logo cedo!", category: "Natureza", emoji: "🐬" },
  { suggestion: "Fazer um tour de barco pela Baía de Guanabara!", category: "Passeio", emoji: "⛵" },
  { suggestion: "Comer uma pizza na Gavea depois de uma boa caminhada!", category: "Gastronomia", emoji: "🍕" },
  { suggestion: "Assistir ao espetáculo gratuito na Lapa em alguma sexta-feira!", category: "Cultura", emoji: "🎭" },
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
