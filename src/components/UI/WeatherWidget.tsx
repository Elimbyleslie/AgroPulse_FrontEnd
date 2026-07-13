import React, { useEffect, useState } from "react";
import { Cloud, Sun, CloudRain, Wind, Droplets, Thermometer } from "lucide-react";

interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  code: number;
}

interface Props {
  farmName: string;
}

const getWeatherIcon = (code: number) => {
  if (code <= 1) return <Sun size={32} className="text-yellow-400" />;
  if (code <= 3) return <Cloud size={32} className="text-gray-400" />;
  return <CloudRain size={32} className="text-blue-400" />;
};

const WeatherWidget: React.FC<Props> = ({ farmName }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!farmName) return;

    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Géocodage : nom de ferme → coordonnées
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(farmName)}&count=1&language=fr`
        );
        const geoData = await geoRes.json();

        let lat: number;
        let lon: number;

        if (geoData.results?.length) {
          lat = geoData.results[0].latitude;
          lon = geoData.results[0].longitude;
        } else {
          // Fallback : Douala, Cameroun
          lat = 4.0511;
          lon = 9.7679;
        }

        // 2. Météo depuis Open-Meteo (gratuit, sans clé API)
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&wind_speed_unit=kmh&timezone=auto`
        );
        const weatherData = await weatherRes.json();
        const c = weatherData.current;

        setWeather({
          temp: Math.round(c.temperature_2m),
          feelsLike: Math.round(c.apparent_temperature),
          humidity: c.relative_humidity_2m,
          windSpeed: Math.round(c.wind_speed_10m),
          description: getWeatherDescription(c.weather_code),
          code: c.weather_code,
        });
      } catch {
        setError("Météo indisponible");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [farmName]);

  const getWeatherDescription = (code: number): string => {
    if (code === 0) return "Ciel dégagé";
    if (code <= 2) return "Partiellement nuageux";
    if (code <= 3) return "Nuageux";
    if (code <= 48) return "Brouillard";
    if (code <= 67) return "Pluie";
    if (code <= 77) return "Neige";
    if (code <= 82) return "Averses";
    return "Orage";
  };

  if (loading)
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-green-400 animate-spin" />
        <p className="text-sm text-gray-400 font-medium">Chargement météo...</p>
      </div>
    );

  if (error)
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm text-gray-400">{error}</p>
      </div>
    );

  if (!weather) return null;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-sky-100 rounded-2xl border border-blue-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-bold text-blue-400 uppercase tracking-wide mb-0.5">
            Météo — {farmName}
          </p>
          <p className="text-sm text-blue-600 font-medium">{weather.description}</p>
        </div>
        {getWeatherIcon(weather.code)}
      </div>

      <div className="flex items-end gap-2 mb-4">
        <span className="text-5xl font-black text-blue-700">{weather.temp}°</span>
        <span className="text-lg text-blue-400 mb-1">C</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/60 rounded-xl p-2.5 text-center">
          <Thermometer size={14} className="text-orange-400 mx-auto mb-1" />
          <p className="text-xs font-black text-gray-700">{weather.feelsLike}°C</p>
          <p className="text-[10px] text-gray-400 font-medium">Ressenti</p>
        </div>
        <div className="bg-white/60 rounded-xl p-2.5 text-center">
          <Droplets size={14} className="text-blue-400 mx-auto mb-1" />
          <p className="text-xs font-black text-gray-700">{weather.humidity}%</p>
          <p className="text-[10px] text-gray-400 font-medium">Humidité</p>
        </div>
        <div className="bg-white/60 rounded-xl p-2.5 text-center">
          <Wind size={14} className="text-gray-400 mx-auto mb-1" />
          <p className="text-xs font-black text-gray-700">{weather.windSpeed} km/h</p>
          <p className="text-[10px] text-gray-400 font-medium">Vent</p>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;