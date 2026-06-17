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
  imageKeyword?: string; // Optional day-level image keyword
  activities: Activity[];
}

export interface FullTripItinerary {
  id: string;
  metadata: TripQuery;
  recommendedStayArea: string;
  localTransportAdvice: string;
  itinerary: DayItinerary[];
}