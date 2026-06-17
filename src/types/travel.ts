export interface TripQuery {
  destination: string;
  durationInDays: number;
  travelStyle: 'Adventure' | 'Relaxation' | 'Budget' | 'Culture' | 'Luxury';
  startingPoint: string;
}

export interface Activity {
  id: string;
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening';
  activityName: string;
  description: string;
  estimatedDuration: string; // e.g., "2 hours"
  transitTimeToNextStop?: string; // e.g., "15 mins drive"
  coordinates: {
    lat: number;
    lng: number;
  };
  imageKeyword: string;
  localTip?: string;
}

export interface DayItinerary {
  dayNumber: number;
  theme: string; // e.g., "Exploring Old Town Heritage"
  activities: Activity[];
}

export interface FullTripItinerary {
  id: string;
  metadata: TripQuery;
  recommendedStayArea: string;
  localTransportAdvice: string;
  itinerary: DayItinerary[];
}