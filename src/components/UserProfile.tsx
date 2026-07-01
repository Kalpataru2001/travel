// src/components/UserProfile.tsx
import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../utils/firebase';
import type { FullTripItinerary, TripQuery } from '../types/travel';
import { POPULAR_CURRENCIES } from '../utils/currency';
import { initTiltCards } from '../utils/animations';

interface UserProfileProps {
  onBackToPlanner: () => void;
}

const ALL_VIBES: TripQuery['travelStyle'][] = [
  'Adventure',
  'Relaxation',
  'Culture',
  'Luxury',
  'Budget',
];

export default function UserProfile({ onBackToPlanner }: UserProfileProps) {
  const [user] = useAuthState(auth);
  const [savedTrips, setSavedTrips] = useState<FullTripItinerary[]>([]);
  
  // Profile settings state
  const [homeCity, setHomeCity] = useState('');
  const [preferredCurrency, setPreferredCurrency] = useState('INR');
  const [preferredVibes, setPreferredVibes] = useState<TripQuery['travelStyle'][]>([]);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Load cache on mount
  useEffect(() => {
    // Load trips cache
    const cachedTrips = localStorage.getItem('travel_saved_trips_cache');
    if (cachedTrips) {
      try {
        setSavedTrips(JSON.parse(cachedTrips));
      } catch (e) {
        // ignore
      }
    }

    // Load profile settings
    const cachedHome = localStorage.getItem('travel_profile_home_city') || '';
    const cachedCurrency = localStorage.getItem('travel_user_preferred_currency') || 'INR';
    const cachedVibes = localStorage.getItem('travel_profile_preferred_vibes');

    setHomeCity(cachedHome);
    setPreferredCurrency(cachedCurrency);
    if (cachedVibes) {
      try {
        setPreferredVibes(JSON.parse(cachedVibes));
      } catch (e) {
        setPreferredVibes(['Adventure']);
      }
    } else {
      setPreferredVibes(['Adventure']);
    }

    // 3D tilt on profile cards and stat boxes
    const cleanupCards = initTiltCards('.profile-card', { maxTilt: 5, glowColor: 'rgba(14,165,233,0.14)' });
    const cleanupStats = initTiltCards('.dashboard-stat-box', { maxTilt: 12, perspective: 500, glowColor: 'rgba(14,165,233,0.2)' });
    return () => { cleanupCards(); cleanupStats(); };
  }, []);

  const handleToggleVibe = (vibe: TripQuery['travelStyle']) => {
    setPreferredVibes((prev) => {
      if (prev.includes(vibe)) {
        if (prev.length <= 1) return prev; // keep at least 1
        return prev.filter((v) => v !== vibe);
      } else {
        if (prev.length >= 3) return prev; // max 3
        return [...prev, vibe];
      }
    });
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('travel_profile_home_city', homeCity.trim());
    localStorage.setItem('travel_user_preferred_currency', preferredCurrency);
    localStorage.setItem('travel_profile_preferred_vibes', JSON.stringify(preferredVibes));

    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  // Compute analytics
  const totalTrips = savedTrips.length;
  const totalDays = savedTrips.reduce((acc, t) => acc + (t.metadata.durationInDays || 0), 0);
  
  // Sum budget amounts (attempting currency symbol match/conversions isn't needed; we show base sum)
  const totalBudgetPlanned = savedTrips.reduce((acc, t) => {
    return acc + (t.budgetData?.totalBudget || 0);
  }, 0);

  // Extract all visited destinations
  const visitedDestinations = Array.from(
    new Set(
      savedTrips.flatMap((t) => {
        if (t.metadata.destinations && t.metadata.destinations.length > 0) {
          return t.metadata.destinations;
        }
        return t.metadata.destination ? [t.metadata.destination] : [];
      })
    )
  );

  // Count vibe style frequency
  const vibeCounts: Record<string, number> = {};
  ALL_VIBES.forEach(v => { vibeCounts[v] = 0; });
  let totalVibeSelections = 0;

  savedTrips.forEach((t) => {
    const styles = t.metadata.travelStyles || (t.metadata.travelStyle ? [t.metadata.travelStyle] : []);
    styles.forEach((s) => {
      // Split legacy combined tags if any
      const splitStyles = String(s).split(',').map(item => item.trim() as TripQuery['travelStyle']);
      splitStyles.forEach(style => {
        if (ALL_VIBES.includes(style)) {
          vibeCounts[style] = (vibeCounts[style] || 0) + 1;
          totalVibeSelections++;
        }
      });
    });
  });

  return (
    <div className="profile-container" style={{ animation: 'fadeIn 0.5s ease' }}>
      
      {/* Profile Header banner */}
      <div className="profile-header-banner">
        <button className="profile-back-btn no-print" onClick={onBackToPlanner}>
          ← Back to Itinerary Planner
        </button>
        <h1 className="profile-title">Travel Profile & Analytics</h1>
        <p className="profile-subtitle">Personalize your guides, pre-set starting points, and track your global explorations.</p>
      </div>

      <div className="profile-grid-layout">
        
        {/* Left Card: User & Preferences */}
        <div className="profile-card settings-card">
          <div className="profile-user-summary">
            <img
              src={
                user?.photoURL ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'U')}&background=0ea5e9&color=fff`
              }
              alt="Avatar"
              className="profile-large-avatar"
            />
            <div className="profile-user-meta">
              <h2 className="profile-username">{user?.displayName || 'Adventurer'}</h2>
              <span className="profile-email">{user?.email || 'Logged in via Google'}</span>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="profile-form">
            <h3 className="profile-section-heading">🎨 Customizer Preferences</h3>

            <div className="profile-form-group">
              <label>🛫 Home Base / Default Starting City</label>
              <input
                type="text"
                value={homeCity}
                onChange={(e) => setHomeCity(e.target.value)}
                placeholder="e.g. Bengaluru, India"
                className="profile-input"
              />
              <span className="profile-input-help">Auto-fills the starting city when creating new trips.</span>
            </div>

            <div className="profile-form-group">
              <label>🪙 Preferred Currency</label>
              <select
                value={preferredCurrency}
                onChange={(e) => setPreferredCurrency(e.target.value)}
                className="profile-select"
              >
                {POPULAR_CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.code} — {curr.name}
                  </option>
                ))}
              </select>
              <span className="profile-input-help">Sets the default monetary unit in estimators and converter tools.</span>
            </div>

            <div className="profile-form-group">
              <label>🧗 Default Travel Vibes (Select 1-3)</label>
              <div className="profile-vibes-selector-grid">
                {ALL_VIBES.map((vibe) => {
                  const isChecked = preferredVibes.includes(vibe);
                  return (
                    <button
                      key={vibe}
                      type="button"
                      onClick={() => handleToggleVibe(vibe)}
                      className={`profile-vibe-pill-btn ${isChecked ? 'selected' : ''}`}
                    >
                      {vibe}
                    </button>
                  );
                })}
              </div>
              <span className="profile-input-help">Pre-selects these styles automatically in planner forms.</span>
            </div>

            {showSaveSuccess && (
              <div className="profile-success-banner">
                ✨ Preferences saved successfully! Defaults updated.
              </div>
            )}

            <button type="submit" className="profile-save-btn">
              Save Preferences
            </button>
          </form>
        </div>

        {/* Right Card: Travel History & Analytics */}
        <div className="profile-card stats-card">
          <h3 className="profile-section-heading">📊 Travel Analytics</h3>
          
          {/* Stats Boxes Grid */}
          <div className="profile-stats-dashboard-grid">
            <div className="dashboard-stat-box">
              <span className="stat-box-emoji">🛫</span>
              <span className="stat-box-value">{totalTrips}</span>
              <span className="stat-box-label">Trips Saved</span>
            </div>
            <div className="dashboard-stat-box">
              <span className="stat-box-emoji">🗓️</span>
              <span className="stat-box-value">{totalDays}</span>
              <span className="stat-box-label">Total Days</span>
            </div>
            <div className="dashboard-stat-box">
              <span className="stat-box-emoji">💰</span>
              <span className="stat-box-value">
                {preferredCurrency === 'INR' ? '₹' : '$'}
                {totalBudgetPlanned.toLocaleString()}
              </span>
              <span className="stat-box-label">Total Budget</span>
            </div>
          </div>

          {/* Visited Places Badges */}
          <div className="profile-destinations-stats-section">
            <h4 className="profile-sub-heading">🗺️ Destinations Visited ({visitedDestinations.length})</h4>
            {visitedDestinations.length > 0 ? (
              <div className="profile-destination-badges-grid">
                {visitedDestinations.map((dest, index) => (
                  <span key={index} className="profile-dest-badge-pill">
                    📍 {dest}
                  </span>
                ))}
              </div>
            ) : (
              <div className="profile-empty-dest-help">
                No destinations logged yet. Create and save a trip to see badges!
              </div>
            )}
          </div>

          {/* Vibe Breakdowns Progress */}
          <div className="profile-vibes-breakdown-section">
            <h4 className="profile-sub-heading">📊 Travel Vibe Breakdown</h4>
            <div className="profile-vibes-progress-list">
              {ALL_VIBES.map((vibe) => {
                const count = vibeCounts[vibe] || 0;
                const percentage = totalVibeSelections > 0 
                  ? Math.round((count / totalVibeSelections) * 100) 
                  : 0;

                return (
                  <div key={vibe} className="profile-vibe-progress-item">
                    <div className="progress-item-labels">
                      <span className="vibe-label-text">{vibe}</span>
                      <span className="vibe-percentage-text">{percentage}% ({count})</span>
                    </div>
                    <div className="progress-item-bar-bg">
                      <div 
                        className={`progress-item-bar-fill fill-${vibe.toLowerCase()}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}
