// src/utils/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { TripQuery, FullTripItinerary } from '../types/travel';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export async function generateTravelItinerary(query: TripQuery): Promise<FullTripItinerary> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' },
  });

  const prompt = `
    You are an expert travel guide. Create a highly realistic, logical ${query.durationInDays}-day itinerary for a ${query.travelStyle} style trip to ${query.destination}, starting from ${query.startingPoint}.

    You MUST return ONLY a valid JSON object matching this EXACT structure. Do NOT include markdown fences or any extra text.

    {
      "id": "trip_unique_id",
      "metadata": {
        "destination": "${query.destination}",
        "durationInDays": ${query.durationInDays},
        "travelStyle": "${query.travelStyle}",
        "startingPoint": "${query.startingPoint}"
      },
      "recommendedStayArea": "Specific neighborhood or area to stay",
      "localTransportAdvice": "Best ways to get around locally with practical tips",
      "itinerary": [
        {
          "dayNumber": 1,
          "theme": "Descriptive theme for the day",
          "activities": [
            {
              "id": "act_1_1",
              "timeOfDay": "Morning",
              "activityName": "Specific Place or Activity Name",
              "description": "Engaging 2-3 sentence description of what to do and why it is special",
              "estimatedDuration": "2 hours",
              "transitTimeToNextStop": "15 mins by auto-rickshaw",
              "coordinates": { "lat": 14.5678, "lng": 74.3210 },
              "imageKeyword": "descriptive photography keyword e.g. Kudle Beach Gokarna sunset ocean",
              "localTip": "A practical insider tip that most tourists miss"
            }
          ]
        }
      ]
    }

    RULES:
    1. Generate exactly ${query.durationInDays} day(s) in the itinerary array.
    2. Each day must have 3-4 activities covering Morning, Afternoon, and Evening.
    3. Every activity MUST have real, accurate GPS coordinates (lat/lng) on solid land in ${query.destination}.
    4. DO NOT place coordinates in the ocean, sea, river, or open water unless the activity is a boat ride.
    5. The route each day must be geographically logical — minimize unnecessary backtracking.
    6. imageKeyword must be a vivid, specific phrase that describes the location visually for a photo search.
    7. Provide a localTip for every activity — make it practical and specific.
    8. The last activity on the last day should be departure preparation.
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return JSON.parse(responseText) as FullTripItinerary;
  } catch (error) {
    console.error('Error asking Gemini:', error);
    throw new Error('Failed to generate travel itinerary. Please try again.');
  }
}