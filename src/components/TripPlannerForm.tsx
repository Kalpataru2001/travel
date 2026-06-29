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
  const [destinations, setDestinations] = useState<string[]>(() => {
    const cached = localStorage.getItem('last_destinations');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // ignore
      }
    }
    const legacyDest = localStorage.getItem('last_dest') || '';
    return legacyDest ? [legacyDest] : [''];
  });
  const [duration, setDuration] = useState(
    () => Number(localStorage.getItem('last_duration')) || 3
  );
  const [travelStyles, setTravelStyles] = useState<TripQuery['travelStyle'][]>(() => {
    const cachedStyles = localStorage.getItem('last_styles');
    if (cachedStyles) {
      try {
        return JSON.parse(cachedStyles);
      } catch (e) {
        // ignore
      }
    }
    const legacyStyle = localStorage.getItem('last_style') as TripQuery['travelStyle'];
    return legacyStyle ? [legacyStyle] : ['Adventure'];
  });

  const handleAddDestination = () => {
    if (destinations.length >= 4) return;
    setDestinations([...destinations, '']);
  };

  const handleRemoveDestination = (index: number) => {
    if (destinations.length <= 1) return;
    setDestinations(destinations.filter((_, i) => i !== index));
  };

  const handleChangeDestination = (index: number, value: string) => {
    const updated = [...destinations];
    updated[index] = value;
    setDestinations(updated);
  };

  const handleToggleStyle = (value: TripQuery['travelStyle']) => {
    setTravelStyles((prev) => {
      if (prev.includes(value)) {
        if (prev.length <= 1) return prev; // min 1
        return prev.filter((style) => style !== value);
      } else {
        if (prev.length >= 3) return prev; // max 3
        return [...prev, value];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredDestinations = destinations.filter((d) => d.trim() !== '');
    if (filteredDestinations.length === 0) return;

    localStorage.setItem('last_start', startingPoint);
    localStorage.setItem('last_destinations', JSON.stringify(filteredDestinations));
    
    // Legacy fallback
    const fullDestString = filteredDestinations.join(' → ');
    localStorage.setItem('last_dest', fullDestString);
    localStorage.setItem('last_duration', duration.toString());
    localStorage.setItem('last_styles', JSON.stringify(travelStyles));
    
    const primaryStyle = travelStyles[0] || 'Adventure';
    localStorage.setItem('last_style', primaryStyle);

    onSubmit({
      destination: fullDestString,
      destinations: filteredDestinations,
      durationInDays: duration,
      travelStyle: travelStyles.join(', ') as any,
      travelStyles,
      startingPoint,
    });
  };

  return (
    <div className="form-card">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Starting Point + Dynamic Destinations */}
        <div className="form-column-inputs" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
            <label className="form-label">📍 Destination(s)</label>
            <div className="destinations-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {destinations.map((dest, index) => (
                <div key={index} className="destination-input-row" style={{ display: 'flex', gap: '8px', alignItems: 'center', animation: 'fadeIn 0.25s ease' }}>
                  <input
                    type="text"
                    required
                    placeholder={index === 0 ? "e.g., Mysore" : `e.g., Destination ${index + 1}`}
                    value={dest}
                    onChange={(e) => handleChangeDestination(index, e.target.value)}
                    className="form-input"
                    style={{ flex: 1 }}
                  />
                  {destinations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDestination(index)}
                      className="remove-destination-btn"
                      title="Remove destination"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              
              {destinations.length < 4 && (
                <button
                  type="button"
                  onClick={handleAddDestination}
                  className="add-destination-btn"
                >
                  ➕ Add Another City
                </button>
              )}
            </div>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label className="form-label" style={{ margin: 0 }}>🎨 Travel Vibe</label>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>
              Select 1 to 3 styles
            </span>
          </div>
          <div className="style-grid">
            {TRAVEL_STYLES.map((style) => {
              const isSelected = travelStyles.includes(style.value);
              return (
                <button
                  key={style.value}
                  type="button"
                  className={`style-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleToggleStyle(style.value)}
                >
                  <span className="style-card-emoji">{style.emoji}</span>
                  <span>{style.label}</span>
                </button>
              );
            })}
          </div>
          {travelStyles.includes('Budget') && travelStyles.includes('Luxury') && (
            <div className="vibe-tip-banner">
              ✨ <strong>Flashpacker Blend!</strong> You selected Budget and Luxury. We will blend hostel/homestay ideas with premium dinner/activities.
            </div>
          )}
          {travelStyles.length >= 3 && (
            <div className="vibe-limit-banner">
              🔒 Vibe limit reached (max 3 selected for focused itineraries).
            </div>
          )}
        </div>

        {/* Submit */}
        <button type="submit" className="btn-primary">
          Generate My Itinerary ✨
        </button>
      </form>
    </div>
  );
}