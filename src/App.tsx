// src/App.tsx
import { useState, useEffect, lazy, Suspense } from 'react';
import './App.css';
import './styles/3d-pages.css';
import './styles/3d-remaining.css';

// ── Always-needed (above-fold / on every page) ─────────────────────────────
import TripPlannerForm from './components/TripPlannerForm';
import Navbar from './components/Navbar';
import HeroScene from './components/HeroScene';
import OnboardingModal from './components/OnboardingModal';
import TripCountdown from './components/TripCountdown';
import VisaInfo from './components/VisaInfo';
import WeatherWidget from './components/WeatherWidget';
import CurrencyConverter from './components/CurrencyConverter';
import EmergencyInfo from './components/EmergencyInfo';

// ── Lazy-loaded: only downloaded when a trip is shown ──────────────────────
const ItineraryTimeline  = lazy(() => import('./components/ItineraryTimeline'));
const TravelMap          = lazy(() => import('./components/TravelMap'));
const BudgetTracker      = lazy(() => import('./components/BudgetTracker'));
const LanguagePhrasebook = lazy(() => import('./components/LanguagePhrasebook'));
const HotelRecommendations = lazy(() => import('./components/HotelRecommendations'));
const PackingList        = lazy(() => import('./components/PackingList'));
const TravelAssistant    = lazy(() => import('./components/TravelAssistant'));
const LocalEvents        = lazy(() => import('./components/LocalEvents'));
const TransportGuide     = lazy(() => import('./components/TransportGuide'));
const PreTripChecklist   = lazy(() => import('./components/PreTripChecklist'));

// ── Lazy-loaded: page-level views ──────────────────────────────────────────
const UserProfile  = lazy(() => import('./components/UserProfile'));
const SavedTrips   = lazy(() => import('./components/SavedTrips'));

import { generateTravelItinerary } from './utils/gemini';
import type { FullTripItinerary } from './types/travel';
import { syncOfflineTrips } from './utils/sync';
import { generateDefaultBudget } from './utils/budget';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { auth, db, googleProvider } from './utils/firebase';
import { signInWithPopup } from 'firebase/auth';
import { useDestinationImage } from './hooks/useDestinationImage';
import { initScrollReveal, initCardReveal } from './utils/animations';

/** Minimal inline loader shown while lazy chunks are downloading */
function ComponentLoader() {
  return (
    <div className="component-loader" aria-busy="true">
      <div className="component-loader-dot" />
      <div className="component-loader-dot" />
      <div className="component-loader-dot" />
    </div>
  );
}

function App() {
  const [tripData, setTripData] = useState<FullTripItinerary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'planner' | 'saved' | 'profile'>('planner');
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
  // Show onboarding modal once — only after first login on this device
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Show onboarding modal on first login (travel_profile_onboarded not set yet)
  useEffect(() => {
    if (user && !localStorage.getItem('travel_profile_onboarded')) {
      // Small delay so the page renders first
      const t = setTimeout(() => setShowOnboarding(true), 800);
      return () => clearTimeout(t);
    }
  }, [user]);

  // Trigger scroll-reveal for new widget cards after tripData loads
  useEffect(() => {
    if (!tripData) return;
    // Small delay so Suspense lazy chunks finish rendering before observer runs
    const t = setTimeout(() => initCardReveal(), 400);
    return () => clearTimeout(t);
  }, [tripData]);

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
      {/* Aurora background orbs — purely decorative, pointer-events:none */}
      <div className="aurora-layer" aria-hidden="true">
        <div className="aurora-orb aurora-orb-1" />
        <div className="aurora-orb aurora-orb-2" />
        <div className="aurora-orb aurora-orb-3" />
      </div>

      {/* One-time post-login onboarding modal — shown only once per device */}
      {showOnboarding && (
        <OnboardingModal
          userName={user?.displayName ?? undefined}
          onDone={() => setShowOnboarding(false)}
        />
      )}
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

        {/* ── PROFILE VIEW ── */}
        {activeView === 'profile' && (
          <Suspense fallback={<ComponentLoader />}>
            <UserProfile onBackToPlanner={() => setActiveView('planner')} />
          </Suspense>
        )}

        {/* ── SAVED TRIPS VIEW ── */}
        {activeView === 'saved' && (
          <Suspense fallback={<ComponentLoader />}>
            <SavedTrips onLoadTrip={handleLoadSavedTrip} />
          </Suspense>
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
                {/* ── Full-width 3D globe fills the entire hero ── */}
                <div className="hero-globe-bg">
                  <HeroScene />
                </div>

                {/* ── Overlay: Left content panel ── */}
                <div className="hero-overlay">
                  <div className="hero-content-panel">
                    <div className="hero-badge">✈️ AI-Powered Travel Planner</div>
                    <h1 className="hero-title">
                      Your Next<br />
                      <span>Adventure Awaits</span>
                    </h1>
                    <p className="hero-subtitle">
                      Tell us where you want to go and we'll craft a personalized day-by-day itinerary with maps, local tips, and hidden gems — in seconds.
                    </p>
                    <TripPlannerForm onSubmit={handleFormSubmit} />
                    {error && (
                      <div className="error-banner" style={{ marginTop: 16 }}>
                        ⚠️ {error}
                      </div>
                    )}
                  </div>

                  {/* Floating destination tags — right side, over the globe */}
                  <div className="hero-tags-panel">
                    <span className="hero-globe-tag" style={{ animationDelay: '0s' }}>🗺️ Tokyo</span>
                    <span className="hero-globe-tag" style={{ animationDelay: '0.5s' }}>✈️ Paris</span>
                    <span className="hero-globe-tag" style={{ animationDelay: '1s' }}>🌴 Bali</span>
                    <span className="hero-globe-tag" style={{ animationDelay: '1.5s' }}>🏔️ Dubai</span>
                    <span className="hero-globe-tag" style={{ animationDelay: '2s' }}>🗽 New York</span>
                    <span className="hero-globe-tag" style={{ animationDelay: '0.3s' }}>🌸 Kyoto</span>
                  </div>
                </div>
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
              <TripDashboard
                tripData={tripData}
                syncMessage={syncMessage}
                isSharedView={isSharedView}
                currentTemp={currentTemp}
                currentCondition={currentCondition}
                setCurrentTemp={setCurrentTemp}
                setCurrentCondition={setCurrentCondition}
                setTripData={setTripData}
                handleBackToPlanner={handleBackToPlanner}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// TripDashboard — pulled out to use hooks at proper component level
// ─────────────────────────────────────────────────────────────────
function TripDashboard({
  tripData,
  syncMessage,
  isSharedView,
  currentTemp,
  currentCondition,
  setCurrentTemp,
  setCurrentCondition,
  setTripData,
  handleBackToPlanner,
}: {
  tripData: FullTripItinerary;
  syncMessage: string;
  isSharedView: boolean;
  currentTemp: number | undefined;
  currentCondition: string | undefined;
  setCurrentTemp: (t: number | undefined) => void;
  setCurrentCondition: (c: string | undefined) => void;
  setTripData: (t: FullTripItinerary) => void;
  handleBackToPlanner: () => void;
}) {
  // Resolve a real hero image for the destination
  const { src: heroBg } = useDestinationImage(
    `${tripData.metadata.destination} landmark skyline`,
    1600,
    900
  );

  // 3D scroll reveal for activity items
  useEffect(() => {
    const timer = setTimeout(() => {
      const cleanup = initScrollReveal('.activity-item');
      return cleanup;
    }, 400);
    return () => clearTimeout(timer);
  }, [tripData]);

  return (
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

      {/* Hero Trip Header — with real destination photo */}
      <div className="trip-header">
        <div
          className="trip-header-bg"
          style={{
            backgroundImage: `url('${heroBg}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
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

        {/* Countdown Timer */}
        <TripCountdown
          startDate={tripData.metadata.startDate}
          destination={tripData.metadata.destination}
        />

        {/* Visa Info Banner — context-aware passport country detection */}
        <VisaInfo
          destination={tripData.metadata.destination}
          startingPoint={tripData.metadata.startingPoint}
          homeCity={localStorage.getItem('travel_profile_home_city') ?? undefined}
          nationality={localStorage.getItem('travel_profile_nationality') ?? undefined}
        />

        {/* Local Events, Transport, Checklist — lazy-loaded */}
        <Suspense fallback={<ComponentLoader />}>
          <LocalEvents
            destination={tripData.metadata.destination}
            startDate={tripData.metadata.startDate}
            durationDays={tripData.metadata.durationInDays}
          />
          <TransportGuide destination={tripData.metadata.destination} />
          <PreTripChecklist
            tripId={tripData.id}
            destination={tripData.metadata.destination}
            startDate={tripData.metadata.startDate}
            durationDays={tripData.metadata.durationInDays}
          />
        </Suspense>

        {/* Widgets Grid: Weather & Currency */}
        <div className="widgets-grid no-print">
          <WeatherWidget
            destination={tripData.metadata.destination}
            startDate={tripData.metadata.startDate}
            onWeatherLoaded={(temp, cond) => {
              setCurrentTemp(temp);
              setCurrentCondition(cond);
            }}
          />
          <CurrencyConverter destination={tripData.metadata.destination} />
        </div>

        {/* Dashboard Grid + heavy below-fold components — all lazy */}
        <Suspense fallback={<ComponentLoader />}>
          <div className="dashboard-grid">

            {/* Left: Itinerary Timeline */}
            <div className="timeline-panel">
              <div className="timeline-panel-header">
                <div className="map-dot" />
                <span className="timeline-panel-title">Day-by-Day Itinerary</span>
              </div>
              <ItineraryTimeline tripData={tripData} onUpdateTripData={setTripData} />
            </div>

            {/* Right: Interactive Map */}
            <div className="map-panel">
              <div className="map-panel-header">
                <div className="map-dot" />
                <span className="map-panel-title">Interactive Route Map</span>
                {tripData.hotels && tripData.hotels.length > 0 && (
                  <span style={{
                    marginLeft: 'auto', fontSize: '0.72rem',
                    color: '#f59e0b', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: '4px'
                  }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                    Hotels
                  </span>
                )}
              </div>
              <TravelMap tripData={tripData} hotels={tripData.hotels} />
            </div>

          </div>

          <BudgetTracker tripData={tripData} onUpdateTripData={setTripData} />
          <LanguagePhrasebook tripData={tripData} />

          {tripData.hotels && tripData.hotels.length > 0 && (
            <HotelRecommendations
              hotels={tripData.hotels}
              destination={tripData.metadata.destination}
              travelStyle={tripData.metadata.travelStyle}
            />
          )}

          <PackingList
            tripData={tripData}
            onUpdateTripData={setTripData}
            currentTemp={currentTemp}
            currentCondition={currentCondition}
          />

          <EmergencyInfo destination={tripData.metadata.destination} />
          <TravelAssistant tripData={tripData} />
        </Suspense>
      </div>
  );
}

export default App;