// src/utils/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { TripQuery, FullTripItinerary } from '../types/travel';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

function cleanJSONResponse(text: string): string {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1);
  }
  return text.trim();
}

export async function generateTravelItinerary(query: TripQuery): Promise<FullTripItinerary> {

  const styles = query.travelStyles || [query.travelStyle];
  const hotelHints = styles.map((s) => {
    if (s === 'Budget') return 'budget guesthouses, hostels, and homestays';
    if (s === 'Luxury') return '5-star hotels, boutique resorts, and luxury properties';
    if (s === 'Adventure') return 'eco-lodges, campsites, and nature resorts';
    if (s === 'Culture') return 'heritage hotels, havelis, and locally-owned guesthouses';
    if (s === 'Relaxation') return 'spa resorts, beachside hotels, and wellness retreats';
    return 'well-rated hotels';
  });
  const hotelTypeHint = hotelHints.join(', or ');
  const combinedVibeText = styles.join(' & ');

  // Dynamic guidelines for active travel styles
  const vibeInstructionList: string[] = [];
  styles.forEach((style) => {
    if (style === 'Adventure') {
      vibeInstructionList.push("- **Adventure**: Include active, outdoor, and thrilling experiences. For example, if Goa or a beach destination is selected, you MUST include water sports (like scuba diving, paragliding, jet skiing, parasailing, kayaking), jungle trekking, spice plantation tours, or hiking rather than just passive sightseeing.");
    }
    if (style === 'Relaxation') {
      vibeInstructionList.push("- **Relaxation**: Include leisurely activities, beach lounging, spa treatments, yoga sessions, sunset viewpoints, and slow walks.");
    }
    if (style === 'Budget') {
      vibeInstructionList.push("- **Budget**: Include low-cost or free experiences, local street markets, walking tours, public park visits, and pocket-friendly tips.");
    }
    if (style === 'Culture') {
      vibeInstructionList.push("- **Culture**: Include heritage temples, churches, historical museums, local art workshops, cooking classes, or traditional food tours.");
    }
    if (style === 'Luxury') {
      vibeInstructionList.push("- **Luxury**: Include premium beach clubs, private cruises, high-end fine dining, helicopter tours, or exclusive private guide bookings.");
    }
  });
  const dynamicVibeGuidelines = vibeInstructionList.length > 0
    ? `\n    VIBE SATISFACTION RULES:
    You MUST satisfy all of the selected travel vibes in the activities:
    ${vibeInstructionList.join('\n    ')}`
    : '';

  const isMultiDest = query.destinations && query.destinations.length > 1;
  const destinationText = isMultiDest
    ? `covering these destinations in sequence: ${query.destinations!.join(', ')}`
    : `to ${query.destination}`;

  const multiDestInstructions = isMultiDest
    ? `\n    MULTIPLE DESTINATIONS RULES:
    1. Distribute the ${query.durationInDays} days logically across these destinations in the order listed: ${query.destinations!.join(', ')}. E.g. spend consecutive days in each city (Day 1-2 in Mysore, Day 3-5 in Coorg).
    2. Group activities consecutively by destination. Do not mix cities on the same day unless transitioning.
    3. Clearly describe the travel/transition from one city to the next (e.g. "3 hours driving to Coorg") as part of the transitTimeToNextStop or activity descriptions.
    4. Provide hotel recommendations that represent each of the cities visited (e.g. recommend 2 hotels in Mysore and 2 hotels in Coorg, indicating the city name in their area/address).`
    : '';

  const prompt = `
    You are an expert travel guide. Create a highly realistic, logical ${query.durationInDays}-day itinerary for a trip ${destinationText}, starting from ${query.startingPoint}, blending elements of ${combinedVibeText} travel vibes.
    ${multiDestInstructions}
    ${dynamicVibeGuidelines}

    You MUST return ONLY a valid JSON object matching this EXACT structure. Do NOT include markdown fences or any extra text.

    {
      "id": "trip_unique_id",
      "metadata": {
        "destination": "${query.destination}",
        "destinations": ${JSON.stringify(query.destinations || [query.destination])},
        "durationInDays": ${query.durationInDays},
        "travelStyle": "${query.travelStyle}",
        "travelStyles": ${JSON.stringify(styles)},
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
          "whyRecommended": "One sentence explaining why this suits a traveller looking for ${combinedVibeText} vibes",
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
              "localTip": "A practical insider tip that most tourists miss",
              "nearbyRestaurants": [
                {
                  "name": "Local Restaurant Name",
                  "cuisine": "e.g. Seafood, Cafés, South Indian, Fine Dining",
                  "priceRange": "e.g. ₹200–500/person",
                  "whySpecial": "One sentence explaining why it is recommended (e.g. famous for crab curry, overlooks the bay) for ${combinedVibeText} travelers"
                }
              ]
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
    3. Price range should be realistic for ${combinedVibeText} travel in this region (use local currency ₹ for India).
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
    9. For every activity, generate exactly 2-3 nearby authentic restaurant suggestions matching the local vibe and budget of ${combinedVibeText} in a 'nearbyRestaurants' array. Always use ₹ for Indian destinations.

    LANGUAGE RULES:
    1. Set 'localLanguageCode' to the BCP-47 tag for the primary local language spoken at the destination (e.g. 'fr-FR' for France, 'ja-JP' for Japan, 'th-TH' for Thailand).
    2. In 'localPhrases', translate exactly these 10 standard phrases: 'Hello / Welcome', 'Thank you', 'Please', 'Excuse me / Sorry', 'Yes', 'No', 'How much is this?', 'Where is the bathroom?', 'Do you speak English?', 'Delicious!'. Provide a phonetic pronunciation guide for each.
  `;

  const modelsToTry = ['gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-2.5-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`[Gemini API] Generating itinerary using model: ${modelName}`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: 'application/json' },
      });
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const cleanedJSON = cleanJSONResponse(responseText);
      return JSON.parse(cleanedJSON) as FullTripItinerary;
    } catch (error) {
      console.warn(`[Gemini API] Model ${modelName} failed. Error:`, error);
      lastError = error;
    }
  }

  console.error('Error asking Gemini:', lastError);
  throw new Error(`Failed to generate travel itinerary. Gemini API is currently unavailable: ${lastError?.message || lastError}`);
}