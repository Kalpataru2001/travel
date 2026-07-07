// src/components/TripCountdown.tsx
import { useState, useEffect } from 'react';

interface TripCountdownProps {
  startDate?: string; // ISO date string
  destination: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number; // ms
}

function calcTimeLeft(startDate: string): TimeLeft {
  const target = new Date(startDate);
  target.setHours(0, 0, 0, 0);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: diff };

  return {
    total: diff,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function Tile({ value, label }: { value: number; label: string }) {
  return (
    <div className="countdown-tile">
      <div className="countdown-tile-inner">
        <span className="countdown-number">{String(value).padStart(2, '0')}</span>
      </div>
      <span className="countdown-label">{label}</span>
    </div>
  );
}

export default function TripCountdown({ startDate, destination }: TripCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    if (!startDate) return;

    const update = () => setTimeLeft(calcTimeLeft(startDate));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startDate]);

  if (!startDate) return null;

  const isToday = timeLeft?.total !== undefined && timeLeft.total <= 0 && timeLeft.total > -86400000;
  const isPast = timeLeft?.total !== undefined && timeLeft.total <= -86400000;

  return (
    <div className="trip-countdown-card">
      <div className="countdown-header">
        <span className="countdown-plane">✈️</span>
        <div className="countdown-header-text">
          {isPast ? (
            <>
              <span className="countdown-title">Trip Completed 🎉</span>
              <span className="countdown-subtitle">Your adventure in {destination} — hope it was amazing!</span>
            </>
          ) : isToday ? (
            <>
              <span className="countdown-title">Today's the Day! 🚀</span>
              <span className="countdown-subtitle">Your trip to {destination} starts now — have an incredible journey!</span>
            </>
          ) : (
            <>
              <span className="countdown-title">Your trip to {destination} starts in</span>
              <span className="countdown-subtitle">
                {new Date(startDate).toLocaleDateString('en-IN', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                })}
              </span>
            </>
          )}
        </div>
      </div>

      {!isPast && !isToday && timeLeft && (
        <div className="countdown-tiles">
          <Tile value={timeLeft.days}    label="DAYS" />
          <div className="countdown-separator">:</div>
          <Tile value={timeLeft.hours}   label="HRS" />
          <div className="countdown-separator">:</div>
          <Tile value={timeLeft.minutes} label="MIN" />
          <div className="countdown-separator">:</div>
          <Tile value={timeLeft.seconds} label="SEC" />
        </div>
      )}

      {(isToday || isPast) && (
        <div className="countdown-celebrate">
          {isToday ? '🎊🌍🎒' : '🏆🗺️✈️'}
        </div>
      )}
    </div>
  );
}
