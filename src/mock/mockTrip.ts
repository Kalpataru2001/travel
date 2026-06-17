// src/mock/mockTrip.ts
// src/mock/mockTrip.ts
import type { FullTripItinerary } from '../types/travel';

export const mockTravelData: FullTripItinerary = {
  id: "trip_001",
  metadata: {
    destination: "Goa",
    durationInDays: 3,
    travelStyle: "Adventure",
    startingPoint: "Panaji"
  },
  recommendedStayArea: "North Goa (Candolim or Anjuna) for active watersports and beach trails.",
  localTransportAdvice: "Rent a scooter at the railway station/airport for seamless traversal through narrow beach lanes.",
  itinerary: [
    {
      dayNumber: 1,
      theme: "Coastal Exploration & Water Sports",
      activities: [
        {
          id: "act_1",
          timeOfDay: "Morning",
          activityName: "Aguada Fort Trek & Exploration",
          description: "Start early to climb the historical lighthouse fort overlooking the Arabian Sea.",
          estimatedDuration: "2 hours",
          transitTimeToNextStop: "15 mins drive",
          coordinates: { lat: 15.4921, lng: 73.7736 },
          imageKeyword: "Aguada Fort Goa historical lighthouse" // <-- Added keyword
        },
        {
          id: "act_2",
          timeOfDay: "Afternoon",
          activityName: "Scuba & Jet Skiing at Calangute",
          description: "Head to the main beach hub for pre-booked shallow water diving and speed boat rides.",
          estimatedDuration: "4 hours",
          transitTimeToNextStop: "20 mins drive",
          coordinates: { lat: 15.5441, lng: 73.7550 },
          imageKeyword: "Calangute beach Goa jet ski water sports" // <-- Added keyword
        }
      ]
    }
  ]
};