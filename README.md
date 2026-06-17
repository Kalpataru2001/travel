# 🗺️ AI Travel Companion & Planner

A beautiful, interactive, and responsive web application that generates custom day-by-day travel itineraries using the Gemini AI, complete with route maps, hotel recommendations, and live weather forecast tracking.

## 🚀 Features

- **🤖 AI Trip Generator**: Automatically plans custom multi-day journeys based on destination, duration, starting point, and travel style.
- **📍 Interactive Route Maps**: Color-coded routes and markers visualizing daily travel activities using Leaflet.
- **🌦️ Live Weather Forecast**: Fetches real-time weather conditions and a 4-day forecast for the destination (uses OpenWeatherMap API). Falls back gracefully to simulated climate-aware weather if no API key is present.
- **🏨 Style-Matched Hotel recommendations**: Suggests handpicked hotels matching the traveler's chosen budget/luxury preferences.
- **💾 Saved Trips Dashboard**: Save your plans to Firestore and load them anytime to view maps and weather.

## 🛠️ Setup & Local Development

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_WEATHER_API_KEY=your_openweathermap_api_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
