// src/App.tsx
import { useState } from 'react';
import './App.css';
import TravelMap from './components/TravelMap';
import ItineraryTimeline from './components/ItineraryTimeline';
import TripPlannerForm from './components/TripPlannerForm';
import { generateTravelItinerary } from './utils/gemini';
import type { FullTripItinerary } from './types/travel';

function App() {
  // We now store the FULL fetched trip data, not just the form query
  const [tripData, setTripData] = useState<FullTripItinerary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (query: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call our new utility function!
      const generatedTrip = await generateTravelItinerary(query);
      setTripData(generatedTrip);
    } catch (err) {
      setError("Oops! The AI got lost finding your route. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* 1. Show Form if no data and not loading */}
      {!tripData && !isLoading && (
        <div style={{ marginTop: '10%' }}>
          <TripPlannerForm onSubmit={handleFormSubmit} />
          {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '15px' }}>{error}</p>}
        </div>
      )}

      {/* 2. Show Premium Loading State */}
      {isLoading && (
        <div style={{ textAlign: 'center', marginTop: '15vh' }}>
          <div className="loading-blob">🧭</div>
          <h2 style={{ fontSize: '2rem', color: '#0f172a', marginBottom: '10px' }}>
            Designing your perfect trip...
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto' }}>
            Our AI is currently scouting locations, calculating optimal routes, and finding hidden gems. This usually takes about 10-15 seconds.
          </p>
        </div>
      )}

      {/* 3. Show Dashboard when data arrives */}
      {tripData && !isLoading && (
        <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
          
          {/* Premium Hero Header */}
          <header style={{ 
            marginBottom: '40px', 
            padding: '50px 30px', 
            borderRadius: '24px', 
            background: 'linear-gradient(rgba(4, 120, 87, 0.8), rgba(6, 95, 70, 0.9)), url("https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: 'white',
            position: 'relative',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <button 
              onClick={() => setTripData(null)} 
              style={{ position: 'absolute', left: '30px', top: '30px', padding: '10px 20px', cursor: 'pointer', borderRadius: '12px', border: 'none', backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(5px)', fontWeight: 'bold', transition: 'background 0.2s' }}
            >
              ← Change Destination
            </button>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <span style={{ backgroundColor: '#10b981', padding: '6px 16px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {tripData.metadata.travelStyle} Escape
              </span>
              <h1 style={{ fontSize: '3.5rem', margin: '15px 0', textShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                {tripData.metadata.destination}
              </h1>
              <p style={{ fontSize: '1.3rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                Your custom {tripData.metadata.durationInDays}-day journey, starting from {tripData.metadata.startingPoint}.
              </p>
            </div>
          </header>

          {/* Grid Layout */}
          <main style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start' }}>
            <div style={{ width: '100%' }}>
              <ItineraryTimeline tripData={tripData} />
            </div>
            
            {/* Map Container Enhancement */}
            <div style={{ width: '100%', position: 'sticky', top: '40px', padding: '10px', backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <TravelMap tripData={tripData} />
              </div>
            </div>
          </main>
        </div>
      )}

    </div>
  );
}

export default App;