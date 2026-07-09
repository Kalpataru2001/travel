// src/components/WeatherWidget.tsx
import { useEffect, useState } from 'react';
import { fetchWeather, getWeatherEmoji, getWindLabel, extractDayForecast, daysUntil } from '../utils/weather';
import type { WeatherData, WeatherDay } from '../utils/weather';

interface WeatherWidgetProps {
  destination: string;
  startDate?: string; // ISO date string — trip start date
  coordinates?: { lat: number; lng: number };
  onWeatherLoaded?: (temp: number, condition: string) => void;
}

// ─── Seasonal climate notes (fallback when forecast not available) ───────────
const SEASONAL_HINTS: Array<{ pattern: RegExp; note: string }> = [
  { pattern: /bali|indonesia|thailand|singapore|malaysia|vietnam|cambodia|philippines/i, note: 'Tropical climate — expect warm, humid weather year-round with possible rain showers.' },
  { pattern: /japan|korea|china|taiwan/i, note: 'Temperate climate — seasons vary. Check local forecasts closer to departure.' },
  { pattern: /dubai|uae|qatar|saudi|egypt|morocco/i, note: 'Desert climate — expect very hot and dry weather. Carry sunscreen and stay hydrated.' },
  { pattern: /nepal|bhutan|tibet/i, note: 'Himalayan climate — cool to cold at altitude. Pack layers.' },
  { pattern: /maldives|mauritius|sri lanka/i, note: 'Tropical island climate — warm and sunny with monsoon seasons (May–Oct and Nov–Mar).' },
  { pattern: /paris|london|berlin|amsterdam|zurich|vienna|rome|madrid|lisbon/i, note: 'Temperate European climate — mild summers, cold winters. Check the season for your dates.' },
  { pattern: /australia|new zealand|sydney|melbourne/i, note: 'Southern Hemisphere — seasons are reversed. Summer is Dec–Feb.' },
  { pattern: /new york|chicago|toronto|boston/i, note: 'Continental climate — hot summers, very cold winters. Pack accordingly.' },
];

function getSeasonalHint(destination: string): string {
  for (const { pattern, note } of SEASONAL_HINTS) {
    if (pattern.test(destination)) return note;
  }
  return 'Weather varies — check a local forecast closer to your departure date.';
}

// ─── What mode are we in? ────────────────────────────────────────────────────
type WeatherMode =
  | 'current'               // no startDate or startDate is today
  | 'forecast-available'    // startDate within 5 days — show that day's forecast
  | 'forecast-soon'         // 6–14 days away
  | 'forecast-far';         // 15+ days away

function resolveMode(startDate: string | undefined): WeatherMode {
  if (!startDate) return 'current';
  const days = daysUntil(startDate);
  if (days <= 0) return 'current';
  if (days <= 5) return 'forecast-available';
  if (days <= 14) return 'forecast-soon';
  return 'forecast-far';
}

// ─── Shared display sub-components ──────────────────────────────────────────
function WeatherDisplay({
  day,
  label,
  city,
  country,
  isMock,
}: {
  day: WeatherDay;
  label?: string;
  city: string;
  country: string;
  isMock?: boolean;
}) {
  const emoji = getWeatherEmoji(day.condition);
  return (
    <>
      <div className="weather-header">
        <div className="weather-location">
          <span className="weather-location-icon">📍</span>
          <span>{city}, {country}</span>
        </div>
        <span className="weather-label">
          {label ?? (isMock ? 'Simulated Weather' : 'Live Weather')}
        </span>
      </div>

      <div className="weather-current">
        <div className="weather-main">
          <span className="weather-emoji">{emoji}</span>
          <div className="weather-temp-block">
            <span className="weather-temp">{day.temp}°C</span>
            <span className="weather-desc">{day.description}</span>
          </div>
        </div>

        <div className="weather-stats">
          <div className="weather-stat-item">
            <span className="weather-stat-icon">💧</span>
            <span>{day.humidity}%</span>
          </div>
          <div className="weather-stat-item">
            <span className="weather-stat-icon">💨</span>
            <span>{getWindLabel(day.windSpeed)}</span>
          </div>
          <div className="weather-stat-item">
            <span className="weather-stat-icon">🌡️</span>
            <span>{day.tempMin}° / {day.tempMax}°</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default function WeatherWidget({ destination, startDate, coordinates, onWeatherLoaded }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setWeather(null);

    fetchWeather(destination, coordinates)
      .then((data) => {
        if (!cancelled) {
          setWeather(data);
          setLoading(false);
          if (onWeatherLoaded) {
            // Always report current conditions for the packing list
            onWeatherLoaded(data.current.temp, data.current.condition);
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Could not load weather.');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [destination, coordinates, onWeatherLoaded]);

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

  const mode = resolveMode(startDate);
  const days = startDate ? daysUntil(startDate) : 0;
  const condClass = `cond-${weather.current.condition.toLowerCase().replace(/\s+/g, '-')}`;

  // ── Mode: forecast available for trip date ──────────────────────────────
  if (mode === 'forecast-available' && startDate) {
    const tripDay = extractDayForecast(weather, startDate);
    const tripDate = new Date(startDate).toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short',
    });

    return (
      <div className={`weather-widget ${condClass}`}>
        {/* Trip day forecast banner */}
        <div className="weather-trip-date-banner">
          <span>📅 Trip Day Forecast — {tripDate}</span>
          <span className="weather-trip-days-badge">{days} day{days !== 1 ? 's' : ''} away</span>
        </div>

        {tripDay ? (
          <WeatherDisplay
            day={tripDay}
            label={weather.isMock ? 'Simulated Forecast' : `Forecast for ${tripDate}`}
            city={weather.city}
            country={weather.country}
            isMock={weather.isMock}
          />
        ) : (
          // Should not happen (mode guard), but safe fallback
          <WeatherDisplay
            day={weather.current}
            label="Current Weather"
            city={weather.city}
            country={weather.country}
            isMock={weather.isMock}
          />
        )}

        {/* Forecast strip for remaining days */}
        {weather.forecast.length > 0 && (
          <div className="weather-forecast">
            {weather.forecast.map((day) => (
              <div key={day.isoDate ?? day.fullDate} className="weather-forecast-day">
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

  // ── Mode: trip 6–14 days away — show current + advisory ─────────────────
  if (mode === 'forecast-soon' && startDate) {
    const tripDate = new Date(startDate).toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long',
    });

    return (
      <div className={`weather-widget ${condClass}`}>
        <WeatherDisplay
          day={weather.current}
          label={weather.isMock ? 'Simulated Weather' : 'Current Weather'}
          city={weather.city}
          country={weather.country}
          isMock={weather.isMock}
        />

        <div className="weather-advisory weather-advisory-soon">
          <span className="weather-advisory-icon">📅</span>
          <div>
            <strong>Your trip starts {tripDate} ({days} days away)</strong>
            <p>Forecast data for your trip date isn't available yet — weather APIs typically cover 5 days. Check back closer to departure.</p>
          </div>
        </div>

        {weather.forecast.length > 0 && (
          <div className="weather-forecast">
            {weather.forecast.map((day) => (
              <div key={day.isoDate ?? day.fullDate} className="weather-forecast-day">
                <span className="weather-forecast-label">{day.date}</span>
                <span className="weather-forecast-emoji">{getWeatherEmoji(day.condition)}</span>
                <span className="weather-forecast-temp">{day.temp}°</span>
                <span className="weather-forecast-range">{day.tempMin}°/{day.tempMax}°</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Mode: trip 15+ days away — show current + seasonal hint ─────────────
  if (mode === 'forecast-far' && startDate) {
    const tripDate = new Date(startDate).toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    return (
      <div className={`weather-widget ${condClass}`}>
        <WeatherDisplay
          day={weather.current}
          label={weather.isMock ? 'Simulated Weather' : 'Current Weather'}
          city={weather.city}
          country={weather.country}
          isMock={weather.isMock}
        />

        <div className="weather-advisory weather-advisory-far">
          <span className="weather-advisory-icon">🗓️</span>
          <div>
            <strong>Trip on {tripDate} — {days} days to go!</strong>
            <p>{getSeasonalHint(destination)}</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Mode: current (no date, or date is today) ────────────────────────────
  return (
    <div className={`weather-widget ${condClass}`}>
      <WeatherDisplay
        day={weather.current}
        label={weather.isMock ? 'Simulated Weather' : 'Live Weather'}
        city={weather.city}
        country={weather.country}
        isMock={weather.isMock}
      />

      {weather.forecast.length > 0 && (
        <div className="weather-forecast">
          {weather.forecast.map((day) => (
            <div key={day.isoDate ?? day.fullDate} className="weather-forecast-day">
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
