import React, { useState, useEffect } from "react";
import { Search, MapPin, Thermometer, Wind, Droplets, Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Compass } from "lucide-react";
import { ThemeConfig } from "../types";

interface WeatherWidgetProps {
  theme: ThemeConfig;
}

interface WeatherData {
  city: string;
  temp: number; // Celsius
  condition: string;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  high: number;
  low: number;
}

export default function WeatherWidget({ theme }: WeatherWidgetProps) {
  const [cityInput, setCityInput] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCelsius, setIsCelsius] = useState(true);

  // Default to Tokyo, London, or New York
  const [currentCity, setCurrentCity] = useState(() => {
    return localStorage.getItem("weather_widget_city") || "San Francisco";
  });

  const fetchWeather = async (cityName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Geocoding search (get lat, lon, and official name)
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error("City not found. Try another city name.");
      }

      const result = geoData.results[0];
      const { latitude, longitude, name, country } = result;
      const resolvedCity = `${name}, ${country || ""}`;

      // 2. Weather lookup
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
      const weatherRes = await fetch(weatherUrl);
      const weatherData = await weatherRes.json();

      if (!weatherData.current) {
        throw new Error("Unable to retrieve weather data.");
      }

      const current = weatherData.current;
      const daily = weatherData.daily;

      // Interpret weather code (WMO weather interpretation codes)
      let condition = "Clear";
      const code = current.weather_code;
      if (code === 0) condition = "Sunny";
      else if (code >= 1 && code <= 3) condition = "Partly Cloudy";
      else if (code >= 45 && code <= 48) condition = "Foggy";
      else if (code >= 51 && code <= 57) condition = "Drizzle";
      else if (code >= 61 && code <= 67) condition = "Rainy";
      else if (code >= 71 && code <= 77) condition = "Snowy";
      else if (code >= 80 && code <= 82) condition = "Showers";
      else if (code >= 95 && code <= 99) condition = "Thunderstorm";

      setWeather({
        city: resolvedCity,
        temp: Math.round(current.temperature_2m),
        condition,
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        windDirection: current.wind_direction_10m,
        high: Math.round(daily.temperature_2m_max[0]),
        low: Math.round(daily.temperature_2m_min[0]),
      });

      // Save to local storage
      localStorage.setItem("weather_widget_city", name);
      setCurrentCity(name);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch weather data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(currentCity);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (cityInput.trim()) {
      fetchWeather(cityInput.trim());
      setCityInput("");
    }
  };

  const getWeatherIcon = (cond: string) => {
    const iconSize = 40;
    const style = { color: theme.accentColor };
    switch (cond) {
      case "Sunny":
        return <Sun size={iconSize} style={style} className="animate-spin-slow" />;
      case "Partly Cloudy":
      case "Foggy":
        return <Cloud size={iconSize} style={style} />;
      case "Drizzle":
      case "Rainy":
      case "Showers":
        return <CloudRain size={iconSize} style={style} className="animate-bounce-slow" />;
      case "Snowy":
        return <CloudSnow size={iconSize} style={style} />;
      case "Thunderstorm":
        return <CloudLightning size={iconSize} style={style} />;
      default:
        return <Sun size={iconSize} style={style} />;
    }
  };

  const convertTemp = (celsius: number) => {
    if (isCelsius) return `${celsius}°C`;
    const fahr = Math.round((celsius * 9) / 5 + 32);
    return `${fahr}°F`;
  };

  return (
    <div className="flex flex-col h-full justify-between p-5" id="widget-weather-root">
      {/* Header with Search and Unit Toggle */}
      <div className="flex items-center justify-between gap-2">
        <form onSubmit={handleSearch} className="flex-1 flex items-center bg-white/5 border border-white/10 rounded-lg px-2 py-1 focus-within:border-white/30 transition-all">
          <input
            type="text"
            placeholder="Search city..."
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            className="bg-transparent text-xs w-full focus:outline-none focus:ring-0 placeholder:text-white/40 font-sans"
            style={{ color: theme.textColor }}
          />
          <button type="submit" className="p-1 text-white/60 hover:text-white">
            <Search size={14} />
          </button>
        </form>

        <button
          onClick={() => setIsCelsius(!isCelsius)}
          className="text-xs font-mono font-bold px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10"
          style={{ color: theme.textColor }}
        >
          {isCelsius ? "°C" : "°F"}
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center my-auto py-4">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${theme.accentColor}44`, borderTopColor: theme.accentColor }} />
          <span className="text-xs font-mono mt-2 opacity-50" style={{ color: theme.textColor }}>Locating atmospheric data...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center text-center my-auto py-2">
          <span className="text-xs text-red-400 font-mono font-semibold px-2">{error}</span>
          <button
            onClick={() => fetchWeather(currentCity)}
            className="text-xs underline mt-2 hover:opacity-80"
            style={{ color: theme.textColor }}
          >
            Retry
          </button>
        </div>
      ) : weather ? (
        <div className="flex flex-col justify-between h-full pt-3">
          {/* Main Temp & Icon Info */}
          <div className="flex items-center justify-around gap-2">
            <div>
              <div className="flex items-start">
                <span className="text-4xl font-extrabold tracking-tight" style={{ color: theme.textColor }}>
                  {convertTemp(weather.temp)}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-0.5 opacity-80" style={{ color: theme.textColor }}>
                <MapPin size={11} style={{ color: theme.accentColor }} />
                <span className="text-xs font-medium max-w-[130px] truncate">{weather.city}</span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              {getWeatherIcon(weather.condition)}
              <span className="text-[11px] font-semibold mt-1 font-mono tracking-wide" style={{ color: theme.textColor }}>{weather.condition}</span>
            </div>
          </div>

          {/* Forecast details & metadata */}
          <div className="grid grid-cols-3 gap-1 border-t border-white/5 pt-3 mt-3 text-center">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-mono opacity-55 flex items-center gap-1" style={{ color: theme.textColor }}>
                <Thermometer size={10} /> Hi/Lo
              </span>
              <span className="text-xs font-bold font-mono mt-0.5" style={{ color: theme.textColor }}>
                {convertTemp(weather.high)} / {convertTemp(weather.low)}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-mono opacity-55 flex items-center gap-1" style={{ color: theme.textColor }}>
                <Wind size={10} /> Wind
              </span>
              <span className="text-xs font-bold font-mono mt-0.5" style={{ color: theme.textColor }}>
                {weather.windSpeed} km/h
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-mono opacity-55 flex items-center gap-1" style={{ color: theme.textColor }}>
                <Droplets size={10} /> Humid
              </span>
              <span className="text-xs font-bold font-mono mt-0.5" style={{ color: theme.textColor }}>
                {weather.humidity}%
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
