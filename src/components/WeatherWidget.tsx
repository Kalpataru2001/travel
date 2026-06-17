// src/components/WeatherWidget.tsx
import { useEffect, useState } from 'react';
import { fetchWeather, getWeatherEmoji, getWindLabel } from '../utils/weather';
import type { WeatherData } from '../utils/weather';

interface WeatherWidgetProps {
  destination: string;
}

export default function WeatherWidget({ destination }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setWeather(null);

    fetchWeather(destination)
      .then((data) => {
        if (!cancelled) {
          setWeather(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Could not load weather.');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [destination]);

  if (loading) {
    return (
      <div className="weather-widget weather-loading">
        <div className="weather-loading-dot" />
        <span>Loading weather for {destination}...</span>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="weather-widget weather-error">
        <span>🌡️</span>
        <span>{error || 'Weather unavailable'}</span>
      </div>
    );
  }

  const { current, forecast } = weather;
  const emoji = getWeatherEmoji(current.condition);

  return (
    <div className="weather-widget">
      {/* Header */}
      <div className="weather-header">
        <div className="weather-location">
          <span className="weather-location-icon">📍</span>
          <span>{weather.city}, {weather.country}</span>
        </div>
        <span className="weather-label">
          {weather.isMock ? 'Simulated Weather' : 'Live Weather'}
        </span>
      </div>

      {/* Current Conditions */}
      <div className="weather-current">
        <div className="weather-main">
          <span className="weather-emoji">{emoji}</span>
          <div className="weather-temp-block">
            <span className="weather-temp">{current.temp}°C</span>
            <span className="weather-desc">{current.description}</span>
          </div>
        </div>

        <div className="weather-stats">
          <div className="weather-stat-item">
            <span className="weather-stat-icon">💧</span>
            <span>{current.humidity}%</span>
          </div>
          <div className="weather-stat-item">
            <span className="weather-stat-icon">💨</span>
            <span>{getWindLabel(current.windSpeed)}</span>
          </div>
          <div className="weather-stat-item">
            <span className="weather-stat-icon">🌡️</span>
            <span>{current.tempMin}° / {current.tempMax}°</span>
          </div>
        </div>
      </div>

      {/* 4-Day Forecast Strip */}
      {forecast.length > 0 && (
        <div className="weather-forecast">
          {forecast.map((day) => (
            <div key={day.fullDate} className="weather-forecast-day">
              <span className="weather-forecast-label">{day.date}</span>
              <span className="weather-forecast-emoji">{getWeatherEmoji(day.condition)}</span>
              <span className="weather-forecast-temp">{day.temp}°</span>
              <span className="weather-forecast-range">
                {day.tempMin}°/{day.tempMax}°
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
