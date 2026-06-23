// src/types/travel.ts

export interface TripQuery {
  destination: string;
  durationInDays: number;
  travelStyle: 'Adventure' | 'Relaxation' | 'Budget' | 'Culture' | 'Luxury';
  startingPoint: string;
}

export interface Activity {
  id: string;
  timeOfDay: string; // Flexible — AI may return "Late Afternoon", "Evening", etc.
  activityName: string;
  description: string;
  estimatedDuration: string;
  transitTimeToNextStop?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  imageKeyword: string;
  localTip?: string;
}

export interface DayItinerary {
  dayNumber: number;
  theme: string;
  imageKeyword?: string;
  activities: Activity[];
}

export interface HotelRecommendation {
  id: string;
  name: string;
  area: string;
  priceRange: string;       // e.g. "₹800–1,200/night"
  rating: number;           // 1–5
  tags: string[];           // e.g. ["Free WiFi", "Pool", "Breakfast Included"]
  whyRecommended: string;   // 1-sentence reason tailored to travel style
  imageKeyword: string;     // Unsplash search keyword
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface PackingItem {
  id: string;
  item: string;
  category: 'Essentials' | 'Clothing' | 'Toiletries' | 'Gear';
  packed: boolean;
  isCustom?: boolean;
}

export interface FullTripItinerary {
  id: string;
  metadata: TripQuery;
  recommendedStayArea: string;
  localTransportAdvice: string;
  itinerary: DayItinerary[];
  hotels?: HotelRecommendation[];
  packingList?: PackingItem[];
  unsynced?: boolean;
  budgetData?: BudgetData;
  localLanguageCode?: string;
  localPhrases?: TravelPhrase[];
}

export interface TravelPhrase {
  english: string;
  translation: string;
  phonetic: string;
}

export interface ExpenseItem {
  id: string;
  amount: number;
  category: 'Accommodation' | 'Transport' | 'Food' | 'Activities' | 'Shopping' | 'Others';
  description: string;
  dayNumber?: number;
}

export interface BudgetData {
  totalBudget: number;
  categoryBudgets: Record<string, number>;
  expenses: ExpenseItem[];
}