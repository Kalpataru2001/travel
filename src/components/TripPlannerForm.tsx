// src/components/TripPlannerForm.tsx
import { useState } from 'react';
import type { TripQuery } from '../types/travel';

interface FormProps {
  onSubmit: (query: TripQuery) => void;
}

export default function TripPlannerForm({ onSubmit }: FormProps) {
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState(3);
  const [travelStyle, setTravelStyle] = useState<'Adventure' | 'Relaxation' | 'Culture' | 'Luxury' | 'Budget'>('Adventure');
  const [startingPoint, setStartingPoint] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ destination, durationInDays: duration, travelStyle, startingPoint });
  };

  const inputStyle = {
    width: '100%', padding: '14px', borderRadius: '10px', 
    border: '2px solid #e2e8f0', fontSize: '1rem', 
    fontFamily: 'inherit', boxSizing: 'border-box' as const,
    backgroundColor: '#f8fafc', 
    color: '#0f172a', /* <-- This ensures the text is dark slate */
    transition: 'border-color 0.2s'
  };

  return (
    <div className="premium-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '8px', fontSize: '2rem', color: '#0f172a' }}>
        Where to next? 🌍
      </h2>
      <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '30px' }}>
        Let AI design your perfect itinerary.
      </p>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div className="form-row">
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#475569' }}>Starting From</label>
            <input type="text" required placeholder="e.g., Bengaluru" value={startingPoint} onChange={(e) => setStartingPoint(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#475569' }}>Destination</label>
            <input type="text" required placeholder="e.g., Gokarna" value={destination} onChange={(e) => setDestination(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#475569' }}>
              Duration: <span style={{ color: '#2563eb' }}>{duration} Days</span>
            </label>
            <input type="range" min="1" max="14" value={duration} onChange={(e) => setDuration(Number(e.target.value))} style={{ width: '100%', accentColor: '#2563eb' }} />
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#475569' }}>Vibe</label>
            <select value={travelStyle} onChange={(e) => setTravelStyle(e.target.value as any)} style={inputStyle}>
              <option value="Adventure">🧗‍♂️ Adventure</option>
              <option value="Relaxation">🏖️ Relaxation</option>
              <option value="Culture">🏛️ Culture</option>
              <option value="Luxury">✨ Luxury</option>
              <option value="Budget">🎒 Budget</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
          Generate Itinerary ✨
        </button>
      </form>
    </div>
  );
}