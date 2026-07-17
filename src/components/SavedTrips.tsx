// src/components/SavedTrips.tsx
import { useEffect, useState } from 'react';
import '../styles/SavedTrips.css';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../utils/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import type { FullTripItinerary } from '../types/travel';

interface SavedTripsProps {
  onLoadTrip: (trip: FullTripItinerary) => void;
}

const STYLE_EMOJI: Record<string, string> = {
  Adventure: '🧗', Relaxation: '🏖️', Culture: '🏛️', Luxury: '✨', Budget: '🎒',
};

const CARD_THEMES = [
  { bg: 'linear-gradient(145deg, #0f2644 0%, #1e5799 60%, #2989d8 100%)', accent: '#60a5fa', icon: '🌊' },
  { bg: 'linear-gradient(145deg, #0d4024 0%, #166534 60%, #22c55e 100%)', accent: '#4ade80', icon: '🌿' },
  { bg: 'linear-gradient(145deg, #2d0a6e 0%, #5b21b6 60%, #8b5cf6 100%)', accent: '#c4b5fd', icon: '🔮' },
  { bg: 'linear-gradient(145deg, #7c1a0a 0%, #c2410c 60%, #f97316 100%)', accent: '#fdba74', icon: '🔥' },
  { bg: 'linear-gradient(145deg, #701a75 0%, #a21caf 60%, #d946ef 100%)', accent: '#f0abfc', icon: '💜' },
  { bg: 'linear-gradient(145deg, #0c4a6e 0%, #0369a1 60%, #38bdf8 100%)', accent: '#7dd3fc', icon: '☁️' },
  { bg: 'linear-gradient(145deg, #14532d 0%, #15803d 60%, #4ade80 100%)', accent: '#86efac', icon: '🌱' },
  { bg: 'linear-gradient(145deg, #431407 0%, #9a3412 60%, #fb923c 100%)', accent: '#fed7aa', icon: '🌅' },
];

function getDestEmoji(dest: string): string {
  const d = dest.toLowerCase();
  if (/beach|goa|maldive|phuket/.test(d)) return '🏖️';
  if (/mountain|himalaya|manali|shimla|leh|ladakh/.test(d)) return '🏔️';
  if (/forest|wayanad|coorg|munnar|kodaikanal/.test(d)) return '🌲';
  if (/desert|rajasthan|jaisalmer|sam sand/.test(d)) return '🏜️';
  if (/island|andaman|lakshadweep/.test(d)) return '🏝️';
  if (/paris|rome|london|amsterdam/.test(d)) return '🗼';
  if (/dubai|abu dhabi/.test(d)) return '🏙️';
  if (/tokyo|kyoto|japan/.test(d)) return '⛩️';
  if (/bali|indonesia/.test(d)) return '🌴';
  return '✈️';
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getDaysTag(dateStr?: string): { label: string; type: 'future' | 'today' | 'past' | null } {
  if (!dateStr) return { label: '', type: null };
  const diff = Math.ceil((new Date(dateStr).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / 86400000);
  if (diff > 0) return { label: `${diff}d away`, type: 'future' };
  if (diff === 0) return { label: 'Today! 🚀', type: 'today' };
  return { label: 'Completed ✅', type: 'past' };
}

export default function SavedTrips({ onLoadTrip }: SavedTripsProps) {
  const [user] = useAuthState(auth);
  const [savedTrips, setSavedTrips] = useState<FullTripItinerary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [search, setSearch] = useState('');
  const [filterStyle, setFilterStyle] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'duration'>('newest');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [tripDocIds, setTripDocIds] = useState<Record<string, string>>({});

  useEffect(() => {
    window.addEventListener('online', () => setIsOffline(false));
    window.addEventListener('offline', () => setIsOffline(true));
  }, []);

  useEffect(() => {
    if (!user) { setIsLoading(false); return; }
    if (!navigator.onLine) {
      const c = localStorage.getItem('travel_saved_trips_cache');
      if (c) try { setSavedTrips(JSON.parse(c)); } catch {}
      setIsLoading(false);
      return;
    }
    getDocs(query(collection(db, 'trips'), where('userId', '==', user.uid))).then(snap => {
      const tripsMap = new Map<string, FullTripItinerary>(); // keyed by trip.id for dedup
      const ids: Record<string, string> = {};

      snap.forEach(d => {
        const t = d.data().tripData as FullTripItinerary;
        // Use the Firestore document ID (which is now the trip.id for new saves)
        const tripId = t.id || d.id;
        if (!tripsMap.has(tripId)) {
          // First occurrence wins; skip duplicates from old addDoc approach
          tripsMap.set(tripId, { ...t, id: tripId });
          ids[tripId] = d.id;
        }
      });

      const trips = Array.from(tripsMap.values());
      setSavedTrips(trips);
      setTripDocIds(ids);
      localStorage.setItem('travel_saved_trips_cache', JSON.stringify(trips));
    }).catch(() => {
      const c = localStorage.getItem('travel_saved_trips_cache');
      if (c) try { setSavedTrips(JSON.parse(c)); } catch {}
    }).finally(() => setIsLoading(false));
  }, [user]);

  const handleDelete = async (tripId: string) => {
    setDeletingId(tripId);
    try {
      const firestoreDocId = tripDocIds[tripId];
      if (firestoreDocId && navigator.onLine) await deleteDoc(doc(db, 'trips', firestoreDocId));
      const updated = savedTrips.filter(t => t.id !== tripId);
      setSavedTrips(updated);
      localStorage.setItem('travel_saved_trips_cache', JSON.stringify(updated));
    } catch (e) { console.error(e); }
    finally { setDeletingId(null); setConfirmDeleteId(null); }
  };

  const allStyles = Array.from(new Set(savedTrips.flatMap(t => t.metadata.travelStyles || [t.metadata.travelStyle])));

  const displayed = savedTrips
    .filter(t => {
      const q = search.toLowerCase();
      const ms = !q || t.metadata.destination.toLowerCase().includes(q) || t.metadata.startingPoint.toLowerCase().includes(q);
      const mf = filterStyle === 'All' || (t.metadata.travelStyles || [t.metadata.travelStyle]).some(s => s === filterStyle);
      return ms && mf;
    })
    .sort((a, b) => {
      if (sortBy === 'duration') return b.metadata.durationInDays - a.metadata.durationInDays;
      const da = new Date(a.metadata.startDate || 0).getTime();
      const db2 = new Date(b.metadata.startDate || 0).getTime();
      return sortBy === 'oldest' ? da - db2 : db2 - da;
    });

  const totalDays = savedTrips.reduce((s, t) => s + t.metadata.durationInDays, 0);
  const totalActivities = savedTrips.reduce((s, t) => s + (t.itinerary?.reduce((d, day) => d + (day.activities?.length || 0), 0) || 0), 0);
  const uniqueDests = new Set(savedTrips.map(t => t.metadata.destination)).size;

  if (isLoading) return (
    <div className="mytrips-loading">
      <div className="mytrips-loading-ring" />
      <span>Loading your adventures...</span>
    </div>
  );

  if (!user) return (
    <div className="mytrips-empty">
      <div className="mytrips-empty-icon">🔐</div>
      <h2>Sign in to see your trips</h2>
      <p>Your saved itineraries are stored securely in the cloud.</p>
    </div>
  );

  if (savedTrips.length === 0) return (
    <div className="mytrips-empty">
      <div className="mytrips-empty-icon">🌍</div>
      <h2>No trips saved yet!</h2>
      <p>Plan your first adventure and tap <strong>"Save Trip"</strong> to store it here.</p>
    </div>
  );

  return (
    <div className="mytrips-page">

      {/* ── Hero Header ── */}
      <div className="mytrips-hero">
        <div className="mytrips-hero-left">
          <p className="mytrips-hero-eyebrow">🗺️ MY COLLECTION {isOffline && <span className="mytrips-offline-dot">● Offline</span>}</p>
          <h1 className="mytrips-hero-title">My Adventures</h1>
          <p className="mytrips-hero-sub">{savedTrips.length} trips saved · Click any card to open</p>
        </div>
        <div className="mytrips-hero-stats">
          <div className="mytrips-stat-card">
            <span className="mytrips-stat-num">{savedTrips.length}</span>
            <span className="mytrips-stat-lbl">Trips</span>
          </div>
          <div className="mytrips-stat-card">
            <span className="mytrips-stat-num">{totalDays}</span>
            <span className="mytrips-stat-lbl">Days</span>
          </div>
          <div className="mytrips-stat-card">
            <span className="mytrips-stat-num">{uniqueDests}</span>
            <span className="mytrips-stat-lbl">Destinations</span>
          </div>
          <div className="mytrips-stat-card">
            <span className="mytrips-stat-num">{totalActivities}</span>
            <span className="mytrips-stat-lbl">Activities</span>
          </div>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="mytrips-controls">
        <div className="mytrips-search-wrap">
          <span className="mytrips-search-icon">🔍</span>
          <input
            id="mytrips-search"
            className="mytrips-search"
            type="text"
            placeholder="Search destination or city..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="mytrips-search-x" onClick={() => setSearch('')}>✕</button>}
        </div>

        <div className="mytrips-filters">
          <select id="mytrips-style-filter" className="mytrips-select" value={filterStyle} onChange={e => setFilterStyle(e.target.value)}>
            <option value="All">All Styles</option>
            {allStyles.map(s => <option key={s} value={s}>{STYLE_EMOJI[s] || '✈️'} {s}</option>)}
          </select>
          <select id="mytrips-sort" className="mytrips-select" value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}>
            <option value="newest">↓ Newest</option>
            <option value="oldest">↑ Oldest</option>
            <option value="duration">⏱ Duration</option>
          </select>
        </div>
      </div>

      {/* ── No Results ── */}
      {displayed.length === 0 && (
        <div className="mytrips-empty" style={{ minHeight: '30vh' }}>
          <div className="mytrips-empty-icon">🔭</div>
          <h2>No results</h2>
          <p>Try different keywords or clear filters.</p>
          <button className="mytrips-clear-btn" onClick={() => { setSearch(''); setFilterStyle('All'); }}>Clear Filters</button>
        </div>
      )}

      {/* ── Cards Grid ── */}
      {displayed.length > 0 && (
        <div className="mytrips-grid">
          {displayed.map((trip, idx) => {
            const theme = CARD_THEMES[idx % CARD_THEMES.length];
            const styles = trip.metadata.travelStyles || (trip.metadata.travelStyle ? [trip.metadata.travelStyle] : ['Adventure']);
            const daysTag = getDaysTag(trip.metadata.startDate);
            const isConfirm = confirmDeleteId === trip.id;
            const isDeleting = deletingId === trip.id;
            const activities = trip.itinerary?.reduce((s, d) => s + (d.activities?.length || 0), 0) || 0;

            return (
              <div
                key={trip.id || idx}
                className={`mytrips-card ${isDeleting ? 'mytrips-card--exit' : ''}`}
                style={{ '--card-accent': theme.accent } as React.CSSProperties}
                onClick={() => { if (!isConfirm) onLoadTrip(trip); }}
              >
                {/* ── Card Banner ── */}
                <div className="mytrips-card-banner" style={{ background: theme.bg }}>
                  {/* Big emoji BG */}
                  <span className="mytrips-card-bg-emoji">{getDestEmoji(trip.metadata.destination)}</span>

                  {/* Top row */}
                  <div className="mytrips-card-topbar">
                    {daysTag.type && (
                      <span className={`mytrips-days-tag mytrips-days-tag--${daysTag.type}`}>{daysTag.label}</span>
                    )}
                    {trip.unsynced && <span className="mytrips-local-tag">💾 Local</span>}

                    {/* Delete */}
                    {isConfirm ? (
                      <div className="mytrips-confirm" onClick={e => e.stopPropagation()}>
                        <button className="mytrips-confirm-yes" onClick={() => handleDelete(trip.id!)}>Delete</button>
                        <button className="mytrips-confirm-no" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                      </div>
                    ) : (
                      <button
                        id={`del-${trip.id}`}
                        className="mytrips-del-btn"
                        title="Delete trip"
                        onClick={e => { e.stopPropagation(); setConfirmDeleteId(trip.id || null); }}
                      >🗑</button>
                    )}
                  </div>

                  {/* Theme icon watermark */}
                  <span className="mytrips-card-theme-icon">{theme.icon}</span>

                  {/* Destination */}
                  <div className="mytrips-card-dest-wrap">
                    <h3 className="mytrips-card-dest">{trip.metadata.destination}</h3>
                    {trip.metadata.startDate && (
                      <p className="mytrips-card-date">📅 {formatDate(trip.metadata.startDate)}</p>
                    )}
                  </div>
                </div>

                {/* ── Card Body ── */}
                <div className="mytrips-card-body">
                  {/* Style tags */}
                  <div className="mytrips-style-tags">
                    <span className="mytrips-tag mytrips-tag--dur">🕐 {trip.metadata.durationInDays} Days</span>
                    {styles.slice(0, 2).map(s => (
                      <span key={s} className="mytrips-tag">{STYLE_EMOJI[s.trim()] || '✈️'} {s.trim()}</span>
                    ))}
                    <span className="mytrips-tag">🛫 {trip.metadata.startingPoint}</span>
                  </div>

                  {/* Inline stats */}
                  <div className="mytrips-inline-stats">
                    <div className="mytrips-istat">
                      <span className="mytrips-istat-val">{trip.itinerary?.length || trip.metadata.durationInDays}</span>
                      <span className="mytrips-istat-lbl">Days Planned</span>
                    </div>
                    <div className="mytrips-istat-divider" />
                    <div className="mytrips-istat">
                      <span className="mytrips-istat-val">{activities}</span>
                      <span className="mytrips-istat-lbl">Activities</span>
                    </div>
                    <div className="mytrips-istat-divider" />
                    <div className="mytrips-istat">
                      <span className="mytrips-istat-val">{trip.hotels?.length || 0}</span>
                      <span className="mytrips-istat-lbl">Hotels</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <button className="mytrips-open-btn">
                    <span>Open Itinerary</span>
                    <span className="mytrips-open-arrow">→</span>
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