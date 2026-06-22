// src/utils/sync.ts
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { FullTripItinerary } from '../types/travel';

/**
 * Uploads locally saved trips that have the `unsynced` flag set to true.
 * Returns the number of successfully synced trips.
 */
export async function syncOfflineTrips(userId: string): Promise<number> {
  const cached = localStorage.getItem('travel_saved_trips_cache');
  if (!cached) return 0;

  try {
    const trips: FullTripItinerary[] = JSON.parse(cached);
    const unsyncedTrips = trips.filter((t) => t.unsynced);

    if (unsyncedTrips.length === 0) return 0;

    let syncCount = 0;

    for (const trip of unsyncedTrips) {
      const cleanTrip = { ...trip };
      delete cleanTrip.unsynced;

      await addDoc(collection(db, 'trips'), {
        userId: userId,
        tripData: cleanTrip,
        createdAt: serverTimestamp(),
      });

      // Update the local synced state
      trip.unsynced = false;
      syncCount++;
    }

    // Rewrite the updated cache list
    localStorage.setItem('travel_saved_trips_cache', JSON.stringify(trips));
    return syncCount;
  } catch (err) {
    console.error('Error during offline sync:', err);
    throw err;
  }
}
