// src/utils/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { TripQuery, FullTripItinerary } from '../types/travel';
import { retryWithBackoff } from './retry';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export async function generateTravelItinerary(query: TripQuery): Promise<FullTripItinerary> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' },
  });

  const hotelTypeHint =
    query.travelStyle === 'Budget'      ? 'budget guesthouses, hostels, and homestays' :
    query.travelStyle === 'Luxury'      ? '5-star hotels, boutique resorts, and luxury properties' :
    query.travelStyle === 'Adventure'   ? 'eco-lodges, campsites, and nature resorts' :
    query.travelStyle === 'Culture'     ? 'heritage hotels, havelis, and locally-owned guesthouses' :
    query.travelStyle === 'Relaxation'  ? 'spa resorts, beachside hotels, and wellness retreats' :
    'well-rated hotels and guesthouses';

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
      "hotels": [
        {
          "id": "hotel_1",
          "name": "Exact Hotel or Hostel Name",
          "area": "Neighborhood or locality name",
          "priceRange": "e.g. ₹800–1,200/night or $30–50/night",
          "rating": 4.3,
          "tags": ["Free WiFi", "Rooftop View", "Breakfast Included"],
          "whyRecommended": "One sentence explaining why this suits a ${query.travelStyle} traveller",
          "imageKeyword": "descriptive photo keyword e.g. boutique hotel goa pool",
          "coordinates": { "lat": 15.2993, "lng": 74.1240 }
        }
      ],
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
      ],
      "localLanguageCode": "fr-FR",
      "localPhrases": [
        {
          "english": "Hello / Welcome",
          "translation": "Bonjour",
          "phonetic": "bon-zhoor"
        }
      ]
    }

    HOTEL RULES:
    1. Generate exactly 4 hotel recommendations — focus on ${hotelTypeHint}.
    2. All hotels must be real, existing properties in or near ${query.destination}.
    3. Price range should be realistic for ${query.travelStyle} travel in this region (use local currency ₹ for India).
    4. Rating must be between 3.5 and 5.0.
    5. Tags should be 2-4 relevant amenity tags per hotel.
    6. Hotel coordinates must be real locations in ${query.destination} on solid land.

    ITINERARY RULES:
    1. Generate exactly ${query.durationInDays} day(s) in the itinerary array.
    2. Each day must have 3-4 activities covering Morning, Afternoon, and Evening.
    3. Every activity MUST have real, accurate GPS coordinates (lat/lng) on solid land in ${query.destination}.
    4. DO NOT place coordinates in the ocean, sea, river, or open water unless the activity is a boat ride.
    5. The route each day must be geographically logical — minimize unnecessary backtracking.
    6. imageKeyword must be a vivid, specific phrase that describes the location visually for a photo search.
    7. Provide a localTip for every activity — make it practical and specific.
    8. The last activity on the last day should be departure preparation.

    LANGUAGE RULES:
    1. Set 'localLanguageCode' to the BCP-47 tag for the primary local language spoken at the destination (e.g. 'fr-FR' for France, 'ja-JP' for Japan, 'th-TH' for Thailand).
    2. In 'localPhrases', translate exactly these 10 standard phrases: 'Hello / Welcome', 'Thank you', 'Please', 'Excuse me / Sorry', 'Yes', 'No', 'How much is this?', 'Where is the bathroom?', 'Do you speak English?', 'Delicious!'. Provide a phonetic pronunciation guide for each.
  `;

  try {
    const result = await retryWithBackoff(() => model.generateContent(prompt));
    const responseText = result.response.text();
    return JSON.parse(responseText) as FullTripItinerary;
  } catch (error) {
    console.error('Error asking Gemini:', error);
    throw new Error('Failed to generate travel itinerary. Please try again.');
  }
}