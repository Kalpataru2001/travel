// src/components/TripPlannerForm.tsx
import { useState } from 'react';
import type { TripQuery } from '../types/travel';

interface FormProps {
  onSubmit: (query: TripQuery) => void;
}

const TRAVEL_STYLES: { value: TripQuery['travelStyle']; emoji: string; label: string }[] = [
  { value: 'Adventure', emoji: '🧗', label: 'Adventure' },
  { value: 'Relaxation', emoji: '🏖️', label: 'Relaxation' },
  { value: 'Culture', emoji: '🏛️', label: 'Culture' },
  { value: 'Luxury', emoji: '✨', label: 'Luxury' },
  { value: 'Budget', emoji: '🎒', label: 'Budget' },
];

export default function TripPlannerForm({ onSubmit }: FormProps) {
  const [startingPoint, setStartingPoint] = useState(
    () => localStorage.getItem('last_start') || ''
  );
  const [destination, setDestination] = useState(
    () => localStorage.getItem('last_dest') || ''
  );
  const [duration, setDuration] = useState(
    () => Number(localStorage.getItem('last_duration')) || 3
  );
  const [travelStyle, setTravelStyle] = useState<TripQuery['travelStyle']>(
    () => (localStorage.getItem('last_style') as TripQuery['travelStyle']) || 'Adventure'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('last_start', startingPoint);
    localStorage.setItem('last_dest', destination);
    localStorage.setItem('last_duration', duration.toString());
    localStorage.setItem('last_style', travelStyle);
    onSubmit({ destination, durationInDays: duration, travelStyle, startingPoint });
  };

  return (
    <div className="form-card">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Starting Point + Destination */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">🛫 Starting From</label>
            <input
              type="text"
              required
              placeholder="e.g., Bengaluru"
              value={startingPoint}
              onChange={(e) => setStartingPoint(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">📍 Destination</label>
            <input
              type="text"
              required
              placeholder="e.g., Gokarna"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        {/* Duration Slider */}
        <div>
          <label className="form-label">🗓️ Duration</label>
          <div className="duration-display">
            <span>{duration}</span> {duration === 1 ? 'Day' : 'Days'}
          </div>
          <input
            type="range"
            min="1"
            max="14"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#0ea5e9', cursor: 'pointer' }}
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.35)',
            marginTop: '6px'
          }}>
            <span>1 Day</span>
            <span>7 Days</span>
            <span>14 Days</span>
          </div>
        </div>

        {/* Travel Style Cards */}
        <div>
          <label className="form-label">🎨 Travel Vibe</label>
          <div className="style-grid">
            {TRAVEL_STYLES.map((style) => (
              <button
                key={style.value}
                type="button"
                className={`style-card ${travelStyle === style.value ? 'selected' : ''}`}
                onClick={() => setTravelStyle(style.value)}
              >
                <span className="style-card-emoji">{style.emoji}</span>
                <span>{style.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button type="submit" className="btn-primary">
          Generate My Itinerary ✨
        </button>
      </form>
    </div>
  );
}