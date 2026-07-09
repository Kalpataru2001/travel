// src/utils/assistant.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { FullTripItinerary } from '../types/travel';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export async function askTravelAssistant(
  tripData: FullTripItinerary,
  history: ChatMessage[],
  newMessage: string
): Promise<string> {
  if (!apiKey) {
    throw new Error('Gemini API key not configured.');
  }

  // Create system instruction with the full context of the itinerary
  const systemInstruction = `
You are a friendly, extremely helpful local travel guide and AI assistant named "GlobeGuide". 
Your task is to help the traveler get the most out of their custom itinerary for their trip to ${tripData.metadata.destination}.

Trip Summary:
- Destination: ${tripData.metadata.destination}
- Duration: ${tripData.metadata.durationInDays} Days
- Travel Style: ${(tripData.metadata.travelStyles || [tripData.metadata.travelStyle]).join(' & ')} Escape
- Starting Point: ${tripData.metadata.startingPoint}
- Recommended Base Stay Area: ${tripData.recommendedStayArea}

Here is the exact day-by-day itinerary:
${JSON.stringify(
  tripData.itinerary.map((day) => ({
    day: day.dayNumber,
    theme: day.theme,
    activities: day.activities.map((act) => ({
      time: act.timeOfDay,
      name: act.activityName,
      description: act.description,
      transit: act.transitTimeToNextStop || 'none',
      tip: act.localTip || 'none',
    })),
  })),
  null,
  2
)}

Here are the recommended hotels:
${JSON.stringify(
  (tripData.hotels || []).map((h) => ({
    name: h.name,
    area: h.area,
    rating: h.rating,
    tags: h.tags,
    whyRecommended: h.whyRecommended,
  })),
  null,
  2
)}

Instructions:
1. Act as a local expert who is enthusiastic and knowledgeable about ${tripData.metadata.destination}.
2. Keep your answers brief, engaging, and easy to read (use bullet points, emojis, and bold text). The chat panel is narrow, so avoid long essays.
3. You can answer questions about packing, local foods, nearby restaurants/cafes, transport recommendations, cultural etiquette, phrase guides, currency/budgeting, and weather.
4. If the user asks to "swap" or "change" activities, make helpful alternative recommendations but remind them they can write down custom notes.
5. If the user asks something completely unrelated to travel or the trip, politely steer the conversation back to their journey.
`;

  // Map history to SDK format, then strip any leading model messages.
  // Gemini requires history to always start with a 'user' turn.
  // We also exclude the last message (the current newMessage the user just sent)
  // because it's delivered via chat.sendMessage() below.
  const rawHistory = history
    .filter((msg) => msg.text !== newMessage) // exclude the unsent current message if present
    .map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }));

  // Drop leading model turns so history always opens with a user turn
  let startIdx = 0;
  while (startIdx < rawHistory.length && rawHistory[startIdx].role !== 'user') {
    startIdx++;
  }
  const sdkHistory = rawHistory.slice(startIdx);

  const modelsToTry = ['gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-2.5-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`[Assistant API] Messaging assistant using model: ${modelName}`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction,
      });

      const chat = model.startChat({
        history: sdkHistory,
      });

      const result = await chat.sendMessage(newMessage);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.warn(`[Assistant API] Model ${modelName} failed. Error:`, error);
      lastError = error;
    }
  }

  throw new Error(`Failed to send message to assistant: ${lastError?.message || lastError}`);
}
