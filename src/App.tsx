// src/App.tsx
import { useState } from 'react';
import './App.css';
import TravelMap from './components/TravelMap';
import ItineraryTimeline from './components/ItineraryTimeline';
import TripPlannerForm from './components/TripPlannerForm';
import Navbar from './components/Navbar';
import SavedTrips from './components/SavedTrips';
import { generateTravelItinerary } from './utils/gemini';
import type { FullTripItinerary } from './types/travel';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from './utils/firebase';
import { signInWithPopup } from 'firebase/auth';

function App() {
  const [tripData, setTripData] = useState<FullTripItinerary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'planner' | 'saved'>('planner');

  const [user] = useAuthState(auth);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleFormSubmit = async (query: any) => {
    setIsLoading(true);
    setError(null);
    setTripData(null);
    try {
      const generatedTrip = await generateTravelItinerary(query);
      setTripData(generatedTrip);
    } catch (err) {
      setError("Oops! The AI got lost finding your route. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!tripData) return;
    // If not logged in, prompt login via Google popup
    if (!user) {
      setSaveMessage('🔐 Sign in to save your trip!');
      setTimeout(() => setSaveMessage(''), 3000);
      try {
        await signInWithPopup(auth, googleProvider);
      } catch {
        // user dismissed popup — that's fine
      }
      return;
    }
    setIsSaving(true);
    setSaveMessage('');
    try {
      await addDoc(collection(db, 'trips'), {
        userId: user.uid,
        tripData: tripData,
        createdAt: serverTimestamp(),
      });
      setSaveMessage('✅ Saved!');
    } catch (error) {
      console.error('Error saving trip:', error);
      setSaveMessage('❌ Failed to save.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handleLoadSavedTrip = (trip: FullTripItinerary) => {
    setTripData(trip);
    setActiveView('planner');
  };

  const handleBackToPlanner = () => {
    setTripData(null);
    setError(null);
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
      />

      <div className="app-content">

        {/* ── SAVED TRIPS VIEW ── */}
        {activeView === 'saved' && (
          <SavedTrips onLoadTrip={handleLoadSavedTrip} />
        )}

        {/* ── PLANNER VIEW ── */}
        {activeView === 'planner' && (
          <>
            {/* 1. Landing / Form — no trip, not loading */}
            {!tripData && !isLoading && (
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
            {tripData && !isLoading && (
              <div style={{ animation: 'fadeIn 0.5s ease' }}>

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

                  {/* Right: Interactive Map */}
                  <div className="map-panel">
                    <div className="map-panel-header">
                      <div className="map-dot" />
                      <span className="map-panel-title">Interactive Route Map</span>
                    </div>
                    <TravelMap tripData={tripData} />
                  </div>

                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;