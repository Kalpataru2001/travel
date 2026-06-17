// src/utils/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { TripQuery, FullTripItinerary } from '../types/travel';

// Vite requires 'import.meta.env' to read environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export async function generateTravelItinerary(query: TripQuery): Promise<FullTripItinerary> {
  // We use 1.5-flash because it is extremely fast and great at JSON generation
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `
    You are an expert travel guide. Create a highly realistic, logical ${query.durationInDays}-day itinerary for a ${query.travelStyle} style trip to ${query.destination}, starting from ${query.startingPoint}.
    
    You MUST return ONLY a valid JSON object that matches this exact structure. Do not include markdown formatting.
    {
      "id": "generate_a_random_id",
      "metadata": {
        "destination": "${query.destination}",
        "durationInDays": ${query.durationInDays},
        "travelStyle": "${query.travelStyle}",
        "startingPoint": "${query.startingPoint}"
      },
      "recommendedStayArea": "Specific neighborhood recommendation",
      "localTransportAdvice": "Best way to get around",
      "itinerary": [
        {
          "dayNumber": 1,
          "theme": "Day Theme",
          "
          "imageKeyword": "A highly descriptive photography search keyword combining the place and destination, e.g., 'Kudle Beach Gokarna ocean sunset'",": [
            {
              "id": "act_1",
              "timeOfDay": "Morning",
              "activityName": "Specific Place Name",
              "description": "Engaging description of what to do",
              "estimatedDuration": "e.g., 2 hours",
              "transitTimeToNextStop": "e.g., 15 mins by taxi",
              "coordinates": { "lat": 0.0000, "lng": 0.0000 },
              "imageKeyword": "A highly descriptive photography search keyword combining the place and destination, e.g., 'Kudle Beach Gokarna ocean sunset'",
              "localTip": "A useful insider tip"
            }
          ]
        }
      ]
    }
    
    ABSOLUTELY CRITICAL GEOGRAPHY RULES: 
    1. You must provide highly accurate, real-world latitude and longitude coordinates for EVERY activity. 
    2. VERIFY that every single coordinate is located strictly on solid land within ${query.destination}. 
    3. DO NOT output coordinates that fall in the ocean, sea, or open water unless the activity is specifically a boat ride.
    4. Ensure the physical route makes geographical sense (no unnecessary backtracking).
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    // Parse the string response directly into our TypeScript object
    return JSON.parse(responseText) as FullTripItinerary;
  } catch (error) {
    console.error("Error asking Gemini:", error);
    throw new Error("Failed to generate travel itinerary. Please try again.");
  }
}