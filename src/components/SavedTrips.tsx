// src/components/SavedTrips.tsx
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../utils/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import type { FullTripItinerary } from '../types/travel';
import { initStaggerCards, initTiltCards } from '../utils/animations';

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
  'linear-gradient(145deg, #0c2340 0%, #1a4a7a 100%)',
  'linear-gradient(145deg, #064e3b 0%, #065f46 100%)',
  'linear-gradient(145deg, #1e1b4b 0%, #3730a3 100%)',
  'linear-gradient(145deg, #7c2d12 0%, #b45309 100%)',
  'linear-gradient(145deg, #4a044e 0%, #86198f 100%)',
  'linear-gradient(145deg, #0c4a6e 0%, #0369a1 100%)',
  'linear-gradient(145deg, #14532d 0%, #166534 100%)',
  'linear-gradient(145deg, #1c1917 0%, #44403c 100%)',
];

const DESTINATION_EMOJIS: Record<string, string> = {
  beach: '🏖️', mountain: '🏔️', city: '🌆', forest: '🌲',
  temple: '⛩️', desert: '🏜️', island: '🏝️', snow: '❄️',
  default: '✈️',
};

function getDestEmoji(dest: string): string {
  const d = dest.toLowerCase();
  if (d.includes('beach') || d.includes('goa') || d.includes('maldive')) return '🏖️';
  if (d.includes('mountain') || d.includes('himalaya') || d.includes('manali')) return '🏔️';
  if (d.includes('forest') || d.includes('wayanad') || d.includes('coorg')) return '🌲';
  if (d.includes('desert') || d.includes('rajasthan') || d.includes('jaisalmer')) return '🏜️';
  if (d.includes('island') || d.includes('andaman')) return '🏝️';
  return DESTINATION_EMOJIS.default;
}

function formatTripDate(dateStr?: string): string {
  if (!dateStr) return 'No date set';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getDaysUntil(dateStr?: string): string | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).setHours(0,0,0,0) - new Date().setHours(0,0,0,0);
  const days = Math.ceil(diff / 86400000);
  if (days < 0) return 'Completed';
  if (days === 0) return 'Today!';
  if (days === 1) return 'Tomorrow!';
  return `${days}d away`;
}

export default function SavedTrips({ onLoadTrip }: SavedTripsProps) {
  const [user] = useAuthState(auth);
  const [savedTrips, setSavedTrips] = useState<FullTripItinerary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStyle, setFilterStyle] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'duration'>('newest');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  // Store firestore doc IDs keyed by trip id
  const [tripDocIds, setTripDocIds] = useState<Record<string, string>>({});

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 3D stagger + tilt for trip cards after they load
  useEffect(() => {
    if (!isLoading && savedTrips.length > 0) {
      const t1 = setTimeout(() => initStaggerCards('.trip-card'), 100);
      const cleanup = initTiltCards('.trip-card', { maxTilt: 7, glowColor: 'rgba(14,165,233,0.18)' });
      return () => { clearTimeout(t1); cleanup(); };
    }
  }, [isLoading, savedTrips.length]);

  useEffect(() => {
    const fetchTrips = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      if (!navigator.onLine) {
        const cached = localStorage.getItem('travel_saved_trips_cache');
        if (cached) {
          try { setSavedTrips(JSON.parse(cached)); } catch {}
        }
        setIsLoading(false);
        return;
      }
      try {
        const q = query(collection(db, 'trips'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const trips: FullTripItinerary[] = [];
        const docIds: Record<string, string> = {};
        querySnapshot.forEach((d) => {
          const trip = d.data().tripData as FullTripItinerary;
          trips.push(trip);
          if (trip.id) docIds[trip.id] = d.id;
        });
        setSavedTrips(trips);
        setTripDocIds(docIds);
        localStorage.setItem('travel_saved_trips_cache', JSON.stringify(trips));
      } catch (error) {
        console.error('Error fetching trips:', error);
        const cached = localStorage.getItem('travel_saved_trips_cache');
        if (cached) {
          try { setSavedTrips(JSON.parse(cached)); } catch {}
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrips();
  }, [user]);

  const handleDelete = async (tripId: string) => {
    setDeletingId(tripId);
    try {
      // Remove from Firestore if we have the doc ID
      const firestoreDocId = tripDocIds[tripId];
      if (firestoreDocId && navigator.onLine) {
        await deleteDoc(doc(db, 'trips', firestoreDocId));
      }
      // Remove from state
      const updated = savedTrips.filter((t) => t.id !== tripId);
      setSavedTrips(updated);
      // Update local cache
      localStorage.setItem('travel_saved_trips_cache', JSON.stringify(updated));
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  // Filter + search + sort
  const allStyles = Array.from(
    new Set(savedTrips.flatMap((t) =>
      t.metadata.travelStyles || (t.metadata.travelStyle ? [t.metadata.travelStyle] : [])
    ))
  );

  const displayed = savedTrips
    .filter((t) => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q ||
        t.metadata.destination.toLowerCase().includes(q) ||
        t.metadata.startingPoint.toLowerCase().includes(q);
      const matchStyle = filterStyle === 'All' ||
        (t.metadata.travelStyles || [t.metadata.travelStyle]).some((s) => s === filterStyle);
      return matchSearch && matchStyle;
    })
    .sort((a, b) => {
      if (sortBy === 'duration') return b.metadata.durationInDays - a.metadata.durationInDays;
      if (sortBy === 'oldest') {
        return new Date(a.metadata.startDate || 0).getTime() - new Date(b.metadata.startDate || 0).getTime();
      }
      // newest (default) — show later start dates first
      return new Date(b.metadata.startDate || 0).getTime() - new Date(a.metadata.startDate || 0).getTime();
    });

  // ── Empty/Loading States ──────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="st-loading-wrapper">
        <div className="st-loading-orbs">
          <div className="st-orb" /><div className="st-orb" /><div className="st-orb" />
        </div>
        <div className="empty-state-icon" style={{ fontSize: '3rem' }}>🗺️</div>
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

      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="saved-trips-header">
        <div className="st-header-left">
          <div className="st-header-badge">🗺️ My Collection</div>
          <h2 className="saved-trips-title">
            My Adventures
            {isOffline && <span className="offline-badge">Offline</span>}
          </h2>
          <p className="saved-trips-subtitle">
            <span className="st-count-pill">{savedTrips.length}</span>
            {savedTrips.length === 1 ? ' trip' : ' trips'} saved
            {isOffline ? ' · Viewing cached itineraries' : ' · Click any to reload the itinerary'}
          </p>
        </div>

        {/* Summary stats */}
        <div className="st-header-stats">
          <div className="st-stat">
            <span className="st-stat-value">{savedTrips.reduce((s, t) => s + t.metadata.durationInDays, 0)}</span>
            <span className="st-stat-label">Total Days</span>
          </div>
          <div className="st-stat">
            <span className="st-stat-value">{new Set(savedTrips.map((t) => t.metadata.destination)).size}</span>
            <span className="st-stat-label">Destinations</span>
          </div>
          <div className="st-stat">
            <span className="st-stat-value">
              {savedTrips.reduce((s, t) => s + (t.itinerary?.reduce((d, day) => d + (day.activities?.length || 0), 0) || 0), 0)}
            </span>
            <span className="st-stat-label">Activities</span>
          </div>
        </div>
      </div>

      {/* ── Search + Filter Bar ──────────────────────────────────── */}
      <div className="st-controls">
        <div className="st-search-wrap">
          <span className="st-search-icon">🔍</span>
          <input
            id="saved-trips-search"
            className="st-search-input"
            type="text"
            placeholder="Search by destination or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="st-search-clear" onClick={() => setSearchQuery('')}>✕</button>
          )}
        </div>

        <div className="st-filter-row">
          <select
            id="saved-trips-style-filter"
            className="st-filter-select"
            value={filterStyle}
            onChange={(e) => setFilterStyle(e.target.value)}
          >
            <option value="All">All Styles</option>
            {allStyles.map((s) => (
              <option key={s} value={s}>{STYLE_EMOJI[s] || '✈️'} {s}</option>
            ))}
          </select>

          <select
            id="saved-trips-sort"
            className="st-filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          >
            <option value="newest">↓ Newest First</option>
            <option value="oldest">↑ Oldest First</option>
            <option value="duration">⏱ By Duration</option>
          </select>
        </div>
      </div>

      {/* ── No Results ──────────────────────────────────────────── */}
      {displayed.length === 0 && (
        <div className="empty-state" style={{ minHeight: '30vh' }}>
          <div className="empty-state-icon">🔭</div>
          <h2 className="empty-state-title">No trips match your search</h2>
          <p className="empty-state-text">Try a different keyword or clear the filters.</p>
          <button className="st-clear-btn" onClick={() => { setSearchQuery(''); setFilterStyle('All'); }}>
            Clear Filters
          </button>
        </div>
      )}

      {/* ── Trip Cards Grid ─────────────────────────────────────── */}
      {displayed.length > 0 && (
        <div className="trips-grid">
          {displayed.map((trip, index) => {
            const styles = trip.metadata.travelStyles ||
              (trip.metadata.travelStyle ? trip.metadata.travelStyle.split(', ') : ['Adventure']);
            const daysUntil = getDaysUntil(trip.metadata.startDate);
            const isConfirmingDelete = confirmDeleteId === trip.id;
            const isDeleting = deletingId === trip.id;

            return (
              <div
                key={trip.id || index}
                className={`trip-card ${isDeleting ? 'trip-card--deleting' : ''}`}
                onClick={() => {
                  if (isConfirmingDelete) return; // don't open when confirm is showing
                  onLoadTrip(trip);
                }}
              >
                {/* ── Card Header ── */}
                <div
                  className="trip-card-header"
                  style={{ background: HEADER_GRADIENTS[index % HEADER_GRADIENTS.length] }}
                >
                  {/* Big destination emoji watermark */}
                  <span className="st-card-watermark">{getDestEmoji(trip.metadata.destination)}</span>

                  {/* Top row actions */}
                  <div className="st-card-toprow">
                    {trip.unsynced && (
                      <span className="unsynced-card-badge" title="Stored locally. Syncs when online.">
                        💾 Local
                      </span>
                    )}
                    {/* Days-until pill */}
                    {daysUntil && (
                      <span className={`st-days-pill ${daysUntil === 'Completed' ? 'st-days-pill--done' : daysUntil.includes('Today') ? 'st-days-pill--today' : ''}`}>
                        {daysUntil === 'Completed' ? '✅ ' : '🗓️ '}{daysUntil}
                      </span>
                    )}
                    {/* Delete button */}
                    {!isDeleting ? (
                      isConfirmingDelete ? (
                        <div className="st-confirm-row" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="st-confirm-yes"
                            onClick={() => handleDelete(trip.id!)}
                          >Delete</button>
                          <button
                            className="st-confirm-no"
                            onClick={() => setConfirmDeleteId(null)}
                          >Cancel</button>
                        </div>
                      ) : (
                        <button
                          id={`delete-trip-${trip.id}`}
                          className="st-delete-btn"
                          title="Delete this trip"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(trip.id || null);
                          }}
                        >
                          🗑️
                        </button>
                      )
                    ) : (
                      <span className="st-deleting-spinner">⏳</span>
                    )}
                  </div>

                  {/* Destination title */}
                  <h3 className="trip-card-dest">{trip.metadata.destination}</h3>
                </div>

                {/* ── Card Body ── */}
                <div className="trip-card-body">
                  {/* Start date */}
                  {trip.metadata.startDate && (
                    <div className="st-card-date">
                      📅 {formatTripDate(trip.metadata.startDate)}
                    </div>
                  )}

                  {/* Meta pills */}
                  <div className="trip-card-meta">
                    <span className="trip-meta-pill">
                      🕐 {trip.metadata.durationInDays} Days
                    </span>
                    {styles.map((style) => {
                      const cleanStyle = style.trim();
                      return (
                        <span key={cleanStyle} className="trip-meta-pill">
                          {STYLE_EMOJI[cleanStyle] || '✈️'} {cleanStyle}
                        </span>
                      );
                    })}
                    <span className="trip-meta-pill">
                      🛫 {trip.metadata.startingPoint}
                    </span>
                  </div>

                  {/* Mini stats row */}
                  <div className="st-card-stats">
                    <div className="st-mini-stat">
                      <span className="st-mini-val">{trip.itinerary?.length || 0}</span>
                      <span className="st-mini-label">Days</span>
                    </div>
                    <div className="st-mini-stat">
                      <span className="st-mini-val">
                        {trip.itinerary?.reduce((s, d) => s + (d.activities?.length || 0), 0) || 0}
                      </span>
                      <span className="st-mini-label">Activities</span>
                    </div>
                    <div className="st-mini-stat">
                      <span className="st-mini-val">{trip.hotels?.length || 0}</span>
                      <span className="st-mini-label">Hotels</span>
                    </div>
                  </div>

                  <button className="view-trip-btn">
                    View Full Itinerary →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}