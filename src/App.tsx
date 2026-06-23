// src/App.tsx
import { useState, useEffect } from 'react';
import './App.css';
import TravelMap from './components/TravelMap';
import ItineraryTimeline from './components/ItineraryTimeline';
import TripPlannerForm from './components/TripPlannerForm';
import Navbar from './components/Navbar';
import SavedTrips from './components/SavedTrips';
import HotelRecommendations from './components/HotelRecommendations';
import WeatherWidget from './components/WeatherWidget';
import CurrencyConverter from './components/CurrencyConverter';
import PackingList from './components/PackingList';
import TravelAssistant from './components/TravelAssistant';
import BudgetTracker from './components/BudgetTracker';
import LanguagePhrasebook from './components/LanguagePhrasebook';
import { generateTravelItinerary } from './utils/gemini';
import type { FullTripItinerary } from './types/travel';
import { syncOfflineTrips } from './utils/sync';
import { generateDefaultBudget } from './utils/budget';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { auth, db, googleProvider } from './utils/firebase';
import { signInWithPopup } from 'firebase/auth';

function App() {
  const [tripData, setTripData] = useState<FullTripItinerary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'planner' | 'saved'>('planner');
  const [currentTemp, setCurrentTemp] = useState<number | undefined>(undefined);
  const [currentCondition, setCurrentCondition] = useState<string | undefined>(undefined);

  const [user] = useAuthState(auth);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const [isSaved, setIsSaved] = useState(false);
  const [isSharedView, setIsSharedView] = useState(false);
  const [isSharedLoading, setIsSharedLoading] = useState(false);
  const [sharedError, setSharedError] = useState<string | null>(null);

  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [syncMessage, setSyncMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get('share');
    if (shareId) {
      setIsSharedView(true);
      setIsSharedLoading(true);
      setSharedError(null);

      const fetchSharedTrip = async () => {
        try {
          const q = query(collection(db, 'trips'), where('tripData.id', '==', shareId));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const docData = querySnapshot.docs[0].data();
            const trip = docData.tripData as FullTripItinerary;
            if (!trip.budgetData) {
              trip.budgetData = generateDefaultBudget(
                trip.metadata.durationInDays,
                trip.metadata.travelStyles || [trip.metadata.travelStyle],
                trip.metadata.destination,
                localStorage.getItem('travel_user_preferred_currency') || 'INR'
              );
            }
            setTripData(trip);
            setIsSaved(true);
          } else {
            setSharedError("Shared trip not found. The link might be invalid or expired.");
          }
        } catch (err) {
          console.error("Error loading shared trip:", err);
          setSharedError("Could not load shared trip. Please try again.");
        } finally {
          setIsSharedLoading(false);
        }
      };

      fetchSharedTrip();
    } else {
      const cachedTrip = localStorage.getItem('travel_active_trip_cache');
      const cachedSaved = localStorage.getItem('travel_active_trip_is_saved');
      if (cachedTrip) {
        try {
          const trip = JSON.parse(cachedTrip);
          if (!trip.budgetData) {
            trip.budgetData = generateDefaultBudget(
              trip.metadata.durationInDays,
              trip.metadata.travelStyles || [trip.metadata.travelStyle],
              trip.metadata.destination,
              localStorage.getItem('travel_user_preferred_currency') || 'INR'
            );
          }
          setTripData(trip);
          if (cachedSaved) {
            setIsSaved(JSON.parse(cachedSaved));
          }
        } catch (err) {
          console.warn('Error reading active trip cache:', err);
        }
      }
    }
  }, []);

  // Save active trip to cache when it changes
  useEffect(() => {
    if (tripData) {
      localStorage.setItem('travel_active_trip_cache', JSON.stringify(tripData));
      localStorage.setItem('travel_active_trip_is_saved', JSON.stringify(isSaved));
    } else {
      localStorage.removeItem('travel_active_trip_cache');
      localStorage.removeItem('travel_active_trip_is_saved');
    }
  }, [tripData, isSaved]);

  // Track connection state & auto sync when coming back online
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      if (user) {
        triggerSync(user.uid);
      }
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  // Trigger sync on logged-in mount
  useEffect(() => {
    if (user && !isOffline) {
      triggerSync(user.uid);
    }
  }, [user, isOffline]);

  const triggerSync = async (userId: string) => {
    try {
      const syncedCount = await syncOfflineTrips(userId);
      if (syncedCount > 0) {
        setSyncMessage(`Synced ${syncedCount} offline trip${syncedCount === 1 ? '' : 's'} to cloud!`);
        setTimeout(() => setSyncMessage(''), 4000);
      }
    } catch (err) {
      console.error('Auto sync failed:', err);
    }
  };

  const getPreferredCurrency = () =>
    localStorage.getItem('travel_user_preferred_currency') || 'INR';

  const handleFormSubmit = async (query: any) => {
    setIsLoading(true);
    setError(null);
    setTripData(null);
    setCurrentTemp(undefined);
    setCurrentCondition(undefined);
    setIsSaved(false);
    try {
      const generatedTrip = await generateTravelItinerary(query);
      generatedTrip.id = `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      generatedTrip.budgetData = generateDefaultBudget(
        generatedTrip.metadata.durationInDays,
        generatedTrip.metadata.travelStyles || [generatedTrip.metadata.travelStyle],
        generatedTrip.metadata.destination,
        getPreferredCurrency()
      );
      setTripData(generatedTrip);
    } catch (err) {
      setError("Oops! The AI got lost finding your route. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!tripData) return;
    if (!user) {
      setSaveMessage('🔐 Sign in to save your trip!');
      setTimeout(() => setSaveMessage(''), 3000);
      try {
        await signInWithPopup(auth, googleProvider);
      } catch {
        // user dismissed popup
      }
      return;
    }
    setIsSaving(true);
    setSaveMessage('');

    if (!navigator.onLine) {
      try {
        const cached = localStorage.getItem('travel_saved_trips_cache');
        let trips: FullTripItinerary[] = [];
        if (cached) {
          trips = JSON.parse(cached);
        }

        const existsIdx = trips.findIndex((t) => t.id === tripData.id);
        const tripWithSyncFlag = { ...tripData, unsynced: true };

        if (existsIdx >= 0) {
          trips[existsIdx] = tripWithSyncFlag;
        } else {
          trips.push(tripWithSyncFlag);
        }

        localStorage.setItem('travel_saved_trips_cache', JSON.stringify(trips));
        setSaveMessage('✅ Saved locally (offline)!');
        setIsSaved(true);
      } catch (err) {
        console.error('Offline save failed:', err);
        setSaveMessage('❌ Failed to save locally.');
      } finally {
        setIsSaving(false);
        setTimeout(() => setSaveMessage(''), 3000);
      }
      return;
    }

    try {
      await addDoc(collection(db, 'trips'), {
        userId: user.uid,
        tripData: tripData,
        createdAt: serverTimestamp(),
      });
      setSaveMessage('✅ Saved!');
      setIsSaved(true);

      // Cache locally as well
      const cached = localStorage.getItem('travel_saved_trips_cache');
      let trips: FullTripItinerary[] = [];
      if (cached) {
        trips = JSON.parse(cached);
      }
      const existsIdx = trips.findIndex((t) => t.id === tripData.id);
      if (existsIdx >= 0) {
        trips[existsIdx] = tripData;
      } else {
        trips.push(tripData);
      }
      localStorage.setItem('travel_saved_trips_cache', JSON.stringify(trips));
    } catch (error) {
      console.error('Error saving trip:', error);
      setSaveMessage('❌ Failed to save.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handleSaveSharedTrip = async () => {
    if (!tripData) return;
    if (!user) {
      setSaveMessage('🔐 Sign in to copy this trip!');
      setTimeout(() => setSaveMessage(''), 3000);
      try {
        await signInWithPopup(auth, googleProvider);
      } catch {
        // user dismissed popup
      }
      return;
    }
    setIsSaving(true);
    setSaveMessage('');
    try {
      const clonedTrip = {
        ...tripData,
        id: `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      await addDoc(collection(db, 'trips'), {
        userId: user.uid,
        tripData: clonedTrip,
        createdAt: serverTimestamp(),
      });
      setSaveMessage('🎉 Saved to My Trips!');
      setTripData(clonedTrip);
      setIsSaved(true);
      setIsSharedView(false);
      window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
    } catch (error) {
      console.error('Error copying shared trip:', error);
      setSaveMessage('❌ Failed to copy.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handleExitShareView = () => {
    window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
    setTripData(null);
    setIsSharedView(false);
    setSharedError(null);
    setIsSaved(false);
    setActiveView('planner');
  };

  const handleLoadSavedTrip = (trip: FullTripItinerary) => {
    if (!trip.budgetData) {
      trip.budgetData = generateDefaultBudget(
        trip.metadata.durationInDays,
        trip.metadata.travelStyles || [trip.metadata.travelStyle],
        trip.metadata.destination,
        localStorage.getItem('travel_user_preferred_currency') || 'INR'
      );
    }
    setTripData(trip);
    setCurrentTemp(undefined);
    setCurrentCondition(undefined);
    setIsSaved(true);
    setIsSharedView(false);
    setActiveView('planner');
  };

  const handleBackToPlanner = () => {
    setTripData(null);
    setError(null);
    setCurrentTemp(undefined);
    setCurrentCondition(undefined);
    setIsSaved(false);
    setIsSharedView(false);
  };

  return (
    <div className="app-shell">
      {/* Navbar — contains Save Trip button when trip is loaded */}
      <Navbar
        currentView={activeView}
        onViewChange={setActiveView}
        tripData={tripData}
        onSaveTrip={handleSaveTrip}
        isSaving={isSaving}
        saveMessage={saveMessage}
        isSaved={isSaved}
        isSharedView={isSharedView}
        onSaveSharedTrip={handleSaveSharedTrip}
        onExitShareView={handleExitShareView}
        isOffline={isOffline}
      />

      <div className="app-content">

        {/* ── SAVED TRIPS VIEW ── */}
        {activeView === 'saved' && (
          <SavedTrips onLoadTrip={handleLoadSavedTrip} />
        )}

        {/* ── PLANNER VIEW ── */}
        {activeView === 'planner' && (
          <>
            {/* Shared Trip Loading State */}
            {isSharedLoading && (
              <div className="loading-wrapper">
                <div className="loading-blob">🧭</div>
                <h2 className="loading-title">Loading shared adventure...</h2>
                <p className="loading-subtitle">
                  We are fetching this itinerary from the cloud database.
                </p>
                <div className="loading-bar">
                  <div className="loading-bar-fill" />
                </div>
              </div>
            )}

            {/* Shared Trip Error State */}
            {sharedError && !isSharedLoading && (
              <div className="empty-state" style={{ padding: '60px 20px', animation: 'fadeIn 0.5s ease' }}>
                <div className="empty-state-icon">⚠️</div>
                <h2 className="empty-state-title">Unable to Load Trip</h2>
                <p className="empty-state-text" style={{ maxWidth: 450, margin: '8px auto 24px auto' }}>{sharedError}</p>
                <button className="save-trip-btn" onClick={handleExitShareView}>
                  🛫 Plan Your Own Journey
                </button>
              </div>
            )}

            {/* 1. Landing / Form — no trip, not loading, no shared views loading/errored */}
            {!tripData && !isLoading && !isSharedLoading && !sharedError && (
              <div className="landing-hero">
                <h1 className="hero-title">
                  Your Next<br />
                  <span>Adventure Awaits</span>
                </h1>
                <p className="hero-subtitle">
                  Tell us where you want to go and we'll craft a personalized day-by-day itinerary with maps, local tips, and hidden gems — in seconds.
                </p>

                <TripPlannerForm onSubmit={handleFormSubmit} />

                {error && (
                  <div className="error-banner" style={{ maxWidth: 680, marginTop: 16 }}>
                    ⚠️ {error}
                  </div>
                )}
              </div>
            )}

            {/* 2. Loading State */}
            {isLoading && (
              <div className="loading-wrapper">
                <div className="loading-blob">🧭</div>
                <h2 className="loading-title">Crafting your perfect journey...</h2>
                <p className="loading-subtitle">
                  Our AI is scouting locations, calculating optimal routes, and uncovering hidden gems. This takes about 10–15 seconds.
                </p>
                <div className="loading-bar">
                  <div className="loading-bar-fill" />
                </div>
              </div>
            )}

            {/* 3. Dashboard — trip loaded */}
            {tripData && !isLoading && !isSharedLoading && (
              <div style={{ animation: 'fadeIn 0.5s ease' }}>

                {/* Sync Alert Banner */}
                {syncMessage && (
                  <div className="sync-alert-banner">
                    <span className="sync-banner-icon">✨</span>
                    <span>{syncMessage}</span>
                  </div>
                )}

                {/* Shared View Banner */}
                {isSharedView && (
                  <div className="shared-trip-banner">
                    <span className="shared-banner-icon">🌍</span>
                    <span className="shared-banner-text">
                      You are viewing a shared travel preview. Click <strong>"Save to My Trips"</strong> in the top bar to save a copy to your account!
                    </span>
                  </div>
                )}

                {/* Hero Trip Header */}
                <div className="trip-header">
                  <div className="trip-header-bg" />
                  <div className="trip-header-overlay" />

                  {/* Top-left Back button — inside header, not fighting navbar */}
                  <div className="trip-header-actions">
                    <button className="back-btn" onClick={handleBackToPlanner}>
                      ← Change Destination
                    </button>
                  </div>

                  <div className="trip-header-content">
                    <div className="trip-style-badge">
                      {tripData.metadata.travelStyle} Escape
                    </div>
                    <h1 className="trip-destination">
                      {tripData.metadata.destination}
                    </h1>
                    <p className="trip-subtitle">
                      Your custom {tripData.metadata.durationInDays}-day journey,
                      starting from {tripData.metadata.startingPoint}
                    </p>
                    <div className="trip-stats">
                      <div className="trip-stat">
                        📅 {tripData.metadata.durationInDays} Days
                      </div>
                      <div className="trip-stat">
                        🗺️ {tripData.itinerary.length} Day Itinerary
                      </div>
                      {tripData.recommendedStayArea && (
                        <div className="trip-stat">
                          🏨 Stay: {tripData.recommendedStayArea}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Widgets Grid: Weather & Currency */}
                <div className="widgets-grid no-print">
                  <WeatherWidget
                    destination={tripData.metadata.destination}
                    onWeatherLoaded={(temp, cond) => {
                      setCurrentTemp(temp);
                      setCurrentCondition(cond);
                    }}
                  />
                  <CurrencyConverter destination={tripData.metadata.destination} />
                </div>

                {/* Dashboard Grid */}
                <div className="dashboard-grid">

                  {/* Left: Itinerary Timeline */}
                  <div className="timeline-panel">
                    <div className="timeline-panel-header">
                      <div className="map-dot" />
                      <span className="timeline-panel-title">Day-by-Day Itinerary</span>
                    </div>
                    <ItineraryTimeline tripData={tripData} />
                  </div>

                  {/* Right: Interactive Map — passes hotel markers too */}
                  <div className="map-panel">
                    <div className="map-panel-header">
                      <div className="map-dot" />
                      <span className="map-panel-title">Interactive Route Map</span>
                      {tripData.hotels && tripData.hotels.length > 0 && (
                        <span style={{
                          marginLeft: 'auto',
                          fontSize: '0.72rem',
                          color: '#f59e0b',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                          Hotels
                        </span>
                      )}
                    </div>
                    <TravelMap tripData={tripData} hotels={tripData.hotels} />
                  </div>

                </div>

                {/* Budget & Expense Tracker — stacked below the grid */}
                <BudgetTracker
                  tripData={tripData}
                  onUpdateTripData={setTripData}
                />

                {/* Local Phrasebook & Audio Pronunciation — stacked below budget */}
                <LanguagePhrasebook tripData={tripData} />

                {/* Hotel Recommendations — below the grid */}
                {tripData.hotels && tripData.hotels.length > 0 && (
                  <HotelRecommendations
                    hotels={tripData.hotels}
                    destination={tripData.metadata.destination}
                    travelStyle={tripData.metadata.travelStyle}
                  />
                )}

                {/* Packing Checklist — stacked below hotels */}
                <PackingList
                  tripData={tripData}
                  onUpdateTripData={setTripData}
                  currentTemp={currentTemp}
                  currentCondition={currentCondition}
                />

                {/* AI Travel Assistant floating trigger & side panel */}
                <TravelAssistant tripData={tripData} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;