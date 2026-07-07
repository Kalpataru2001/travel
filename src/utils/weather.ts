// src/utils/weather.ts

export interface WeatherDay {
  date: string;          // e.g. "Mon"
  fullDate: string;      // e.g. "Jun 17"
  isoDate: string;       // e.g. "2025-08-15" — used for date matching
  temp: number;          // Celsius
  tempMin: number;
  tempMax: number;
  condition: string;     // e.g. "Clear", "Rain"
  description: string;   // e.g. "clear sky"
  icon: string;          // OpenWeatherMap icon code e.g. "01d"
  humidity: number;
  windSpeed: number;     // m/s
}

export interface WeatherData {
  city: string;
  country: string;
  current: WeatherDay;
  forecast: WeatherDay[]; // next 4 days (raw from API)
  isMock?: boolean;
}

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

// Map OWM condition codes to our emoji set
export function getWeatherEmoji(condition: string): string {
  const c = condition.toLowerCase();
  if (c.includes('thunderstorm')) return '⛈️';
  if (c.includes('drizzle'))      return '🌦️';
  if (c.includes('rain'))         return '🌧️';
  if (c.includes('snow'))         return '❄️';
  if (c.includes('mist') || c.includes('fog') || c.includes('haze')) return '🌫️';
  if (c.includes('clear'))        return '☀️';
  if (c.includes('few clouds'))   return '🌤️';
  if (c.includes('scattered'))    return '⛅';
  if (c.includes('clouds'))       return '☁️';
  return '🌡️';
}

export function getWindLabel(speed: number): string {
  if (speed < 2)  return 'Calm';
  if (speed < 6)  return 'Light breeze';
  if (speed < 12) return 'Moderate';
  if (speed < 20) return 'Strong';
  return 'Very strong';
}

/** Days between today and a target ISO date string (negative if past) */
export function daysUntil(isoDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(isoDate);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Find the forecast entry closest to the given ISO date.
 * Returns null if the target date is beyond the forecast window (> 5 days)
 * or if the weather data has no forecast entries.
 */
export function extractDayForecast(weather: WeatherData, targetISO: string): WeatherDay | null {
  const days = daysUntil(targetISO);
  if (days < 0 || days > 5) return null;

  // Day 0 → current; Day 1–5 → scan forecast by isoDate
  if (days === 0) return weather.current;

  // Find closest forecast entry by isoDate
  const target = new Date(targetISO);
  target.setHours(0, 0, 0, 0);

  let best: WeatherDay | null = null;
  let bestDiff = Infinity;

  for (const day of [weather.current, ...weather.forecast]) {
    if (!day.isoDate) continue;
    const d = new Date(day.isoDate);
    d.setHours(0, 0, 0, 0);
    const diff = Math.abs(d.getTime() - target.getTime());
    if (diff < bestDiff) { bestDiff = diff; best = day; }
  }
  return best;
}

export function generateMockWeather(destination: string): WeatherData {
  // Simple deterministic hash based on destination name
  let hash = 0;
  for (let i = 0; i < destination.length; i++) {
    hash = destination.charCodeAt(i) + ((hash << 5) - hash);
  }
  const seed = Math.abs(hash);

  // Determine climate type from destination name / seed
  const climates = [
    { type: 'Tropical', tempBase: 29, humidity: 82, conditions: ['Rain', 'Clouds', 'Clear', 'Drizzle'] },
    { type: 'Temperate', tempBase: 19, humidity: 62, conditions: ['Clear', 'Clouds', 'Few Clouds', 'Scattered Clouds'] },
    { type: 'Cold', tempBase: 6, humidity: 58, conditions: ['Snow', 'Clouds', 'Mist', 'Clear'] },
    { type: 'Desert', tempBase: 33, humidity: 28, conditions: ['Clear', 'Clear', 'Clear', 'Haze'] },
  ];
  const climate = climates[seed % climates.length];

  const now = new Date();
  
  const generateDay = (offset: number): WeatherDay => {
    const d = new Date();
    d.setDate(now.getDate() + offset);
    
    // Vary conditions slightly based on day offset and seed
    const daySeed = seed + offset;
    const condIdx = daySeed % climate.conditions.length;
    const condition = climate.conditions[condIdx];
    
    // Vary temp slightly
    const tempVar = (daySeed % 7) - 3; // -3 to +3
    const temp = Math.round(climate.tempBase + tempVar);
    const tempMin = temp - (2 + (daySeed % 3));
    const tempMax = temp + (2 + (daySeed % 3));
    
    const descriptions: Record<string, string> = {
      'Clear': 'clear sky',
      'Clouds': 'broken clouds',
      'Few Clouds': 'few clouds',
      'Scattered Clouds': 'scattered clouds',
      'Rain': 'moderate rain',
      'Drizzle': 'light intensity drizzle',
      'Snow': 'light snow',
      'Mist': 'misty',
      'Haze': 'haze',
    };

    return {
      date: d.toLocaleDateString('en-US', { weekday: 'short' }),
      fullDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      isoDate: d.toISOString().slice(0, 10),
      temp,
      tempMin,
      tempMax,
      condition,
      description: descriptions[condition] || condition.toLowerCase(),
      icon: '01d',
      humidity: Math.min(100, Math.max(10, climate.humidity + (daySeed % 11) - 5)),
      windSpeed: Math.round(3 + (daySeed % 12)),
    };
  };

  const current = generateDay(0);
  const forecast: WeatherDay[] = [];
  for (let i = 1; i <= 4; i++) {
    forecast.push(generateDay(i));
  }

  // Extract city and country
  const parts = destination.split(',').map(p => p.trim());
  const city = parts[0] || destination;
  const country = parts[1] || 'Forecast';

  return {
    city,
    country,
    current,
    forecast,
    isMock: true
  };
}

export async function fetchWeather(destination: string): Promise<WeatherData> {
  const isPlaceholder = !API_KEY || API_KEY === 'your_openweathermap_key_here' || API_KEY.trim() === '';

  if (isPlaceholder) {
    // Return mock weather after a short delay to simulate network loading
    await new Promise((resolve) => setTimeout(resolve, 600));
    return generateMockWeather(destination);
  }

  // Fetch 5-day / 3-hour forecast (gives us today + next 4 days)
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(destination)}&appid=${API_KEY}&units=metric&cnt=40`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`Weather API fetch failed with status ${res.status}. Falling back to mock data.`);
      return generateMockWeather(destination);
    }

    const data = await res.json();

    // Group by day
    const dayMap = new Map<string, any[]>();
    for (const item of data.list) {
      const d = new Date(item.dt * 1000);
      const key = d.toISOString().slice(0, 10); // "2024-06-17"
      if (!dayMap.has(key)) dayMap.set(key, []);
      dayMap.get(key)!.push(item);
    }

    const days = Array.from(dayMap.entries()).slice(0, 5);

    const formatDay = (dateStr: string, entries: any[]): WeatherDay => {
      const d = new Date(dateStr);
      const temps = entries.map((e: any) => e.main.temp);
      // Pick midday entry for main condition
      const midday = entries.find((e: any) => {
        const h = new Date(e.dt * 1000).getHours();
        return h >= 11 && h <= 14;
      }) || entries[Math.floor(entries.length / 2)];

      return {
        date: d.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isoDate: dateStr,
        temp: Math.round(midday.main.temp),
        tempMin: Math.round(Math.min(...temps)),
        tempMax: Math.round(Math.max(...temps)),
        condition: midday.weather[0].main,
        description: midday.weather[0].description,
        icon: midday.weather[0].icon,
        humidity: midday.main.humidity,
        windSpeed: Math.round(midday.wind.speed),
      };
    };

    const [todayEntry, ...forecastEntries] = days;
    const current = formatDay(todayEntry[0], todayEntry[1]);
    const forecast = forecastEntries.map(([date, entries]) => formatDay(date, entries));

    return {
      city: data.city.name,
      country: data.city.country,
      current,
      forecast,
    };
  } catch (error) {
    console.warn('Weather API request error. Falling back to mock data:', error);
    return generateMockWeather(destination);
  }
}
