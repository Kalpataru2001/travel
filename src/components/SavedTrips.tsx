// src/components/SavedTrips.tsx
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../utils/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import type { FullTripItinerary } from '../types/travel';

interface SavedTripsProps {
  onLoadTrip: (trip: FullTripItinerary) => void;
}

const STYLE_EMOJI: Record<string, string> = {
  Adventure: '🧗',
  Relaxation: '🏖️',
  Culture: '🏛️',
  Luxury: '✨',
  Budget: '🎒',
};

const HEADER_GRADIENTS = [
  'linear-gradient(135deg, #0c2340 0%, #1a4a7a 100%)',
  'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
  'linear-gradient(135deg, #1e1b4b 0%, #3730a3 100%)',
  'linear-gradient(135deg, #7c2d12 0%, #b45309 100%)',
  'linear-gradient(135deg, #4a044e 0%, #86198f 100%)',
  'linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)',
];

export default function SavedTrips({ onLoadTrip }: SavedTripsProps) {
  const [user] = useAuthState(auth);
  const [savedTrips, setSavedTrips] = useState<FullTripItinerary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const q = query(collection(db, 'trips'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);

        const trips: FullTripItinerary[] = [];
        querySnapshot.forEach((doc) => {
          trips.push(doc.data().tripData as FullTripItinerary);
        });

        setSavedTrips(trips);
      } catch (error) {
        console.error('Error fetching trips:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();
  }, [user]);

  if (isLoading) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🗺️</div>
        <h2 className="empty-state-title">Loading your adventures...</h2>
        <p className="empty-state-text">Fetching your saved trips from the cloud.</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔐</div>
        <h2 className="empty-state-title">Sign in to see your trips</h2>
        <p className="empty-state-text">
          Your saved itineraries are stored securely. Sign in with Google to access them.
        </p>
      </div>
    );
  }

  if (savedTrips.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🌍</div>
        <h2 className="empty-state-title">No trips saved yet!</h2>
        <p className="empty-state-text">
          Plan your first adventure and tap <strong>"Save Trip"</strong> in the top bar to store it here.
        </p>
      </div>
    );
  }

  return (
    <div className="saved-trips-wrapper">
      <div className="saved-trips-header">
        <h2 className="saved-trips-title">My Adventures</h2>
        <p className="saved-trips-subtitle">
          {savedTrips.length} saved {savedTrips.length === 1 ? 'trip' : 'trips'} · Click any to reload the itinerary
        </p>
      </div>

      <div className="trips-grid">
        {savedTrips.map((trip, index) => (
          <div key={index} className="trip-card" onClick={() => onLoadTrip(trip)}>

            {/* Card Header with gradient */}
            <div
              className="trip-card-header"
              style={{ background: HEADER_GRADIENTS[index % HEADER_GRADIENTS.length] }}
            >
              <h3 className="trip-card-dest">{trip.metadata.destination}</h3>
            </div>

            {/* Card Body */}
            <div className="trip-card-body">
              <div className="trip-card-meta">
                <span className="trip-meta-pill">
                  📅 {trip.metadata.durationInDays} Days
                </span>
                <span className="trip-meta-pill">
                  {STYLE_EMOJI[trip.metadata.travelStyle] || '✈️'} {trip.metadata.travelStyle}
                </span>
                <span className="trip-meta-pill">
                  🛫 {trip.metadata.startingPoint}
                </span>
              </div>

              <button className="view-trip-btn">
                View Full Itinerary →
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}