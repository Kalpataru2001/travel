// src/components/LocalEvents.tsx
import { useState, useMemo } from 'react';
import { getLocalEvents, getMonthName } from '../utils/events';
import type { LocalEvent } from '../utils/events';

interface LocalEventsProps {
  destination: string;
  startDate?: string;   // ISO string from TripQuery
  durationDays?: number;
}

const TYPE_CHIP_CLASS: Record<string, string> = {
  festival: 'le-chip-festival',
  holiday: 'le-chip-holiday',
  season: 'le-chip-season',
  warning: 'le-chip-warning',
};

const TYPE_CARD_CLASS: Record<string, string> = {
  festival: 'le-event-card-festival',
  holiday: 'le-event-card-holiday',
  season: 'le-event-card-season',
  warning: 'le-event-card-warning',
};

function EventCard({ event }: { event: LocalEvent }) {
  const monthLabel =
    event.endMonth && event.endMonth !== event.month
      ? `${getMonthName(event.month)}–${getMonthName(event.endMonth)}`
      : getMonthName(event.month);

  return (
    <div className={`le-event-card ${TYPE_CARD_CLASS[event.type] || ''}`}>
      <span className="le-event-emoji">{event.emoji}</span>
      <div className="le-event-details">
        <span className="le-event-name">{event.name}</span>
        <p className="le-event-desc">{event.description}</p>
        {event.impact && (
          <p className="le-event-impact">⚠ {event.impact}</p>
        )}
      </div>
      <span className="le-event-month">{monthLabel}</span>
    </div>
  );
}

export default function LocalEvents({ destination, startDate, durationDays }: LocalEventsProps) {
  const [expanded, setExpanded] = useState(false);

  const { tripMonth, tripEndMonth } = useMemo(() => {
    if (!startDate) return { tripMonth: new Date().getMonth() + 1, tripEndMonth: undefined };
    const start = new Date(startDate);
    const month = start.getMonth() + 1;
    if (durationDays && durationDays > 0) {
      const endDate = new Date(start);
      endDate.setDate(endDate.getDate() + durationDays);
      const endMonth = endDate.getMonth() + 1;
      return { tripMonth: month, tripEndMonth: endMonth !== month ? endMonth : undefined };
    }
    return { tripMonth: month, tripEndMonth: undefined };
  }, [startDate, durationDays]);

  const events = useMemo(
    () => getLocalEvents(destination, tripMonth, tripEndMonth),
    [destination, tripMonth, tripEndMonth]
  );

  // Sort: warnings and holidays first, then festivals, then seasons
  const sorted = useMemo(() => {
    const order: Record<string, number> = { warning: 0, holiday: 1, festival: 2, season: 3 };
    return [...events].sort((a, b) => (order[a.type] ?? 4) - (order[b.type] ?? 4));
  }, [events]);

  const highlights = useMemo(() => sorted.slice(0, 4), [sorted]);

  // Header subtitle
  const monthRangeLabel = tripEndMonth
    ? `${getMonthName(tripMonth)} – ${getMonthName(tripEndMonth)}`
    : getMonthName(tripMonth);

  const hasWarnings = events.some(e => e.type === 'warning');
  const hasFestivals = events.some(e => e.type === 'festival' || e.type === 'holiday');

  return (
    <div className="le-card">
      {/* Header — always visible */}
      <button
        className="le-header"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <span className="le-icon">
          {hasWarnings ? '⚠️' : hasFestivals ? '🎉' : '📅'}
        </span>
        <div className="le-header-text">
          <h3 className="le-title">Events & Holidays in {destination}</h3>
          <p className="le-subtitle">
            During your trip ({monthRangeLabel}) ·{' '}
            {events.length > 0
              ? `${events.length} event${events.length > 1 ? 's' : ''} to know about`
              : 'No specific events found for this period'}
          </p>
        </div>
        <span className={`le-chevron ${expanded ? 'open' : ''}`}>›</span>
      </button>

      {/* Quick chip highlights — always visible */}
      {events.length > 0 && (
        <div className="le-highlights">
          {highlights.map((e, i) => (
            <span key={i} className={`le-highlight-chip ${TYPE_CHIP_CLASS[e.type]}`}>
              {e.emoji} {e.name.split('—')[0].trim()}
            </span>
          ))}
          {events.length > 4 && (
            <span
              className="le-highlight-chip le-chip-season"
              style={{ cursor: 'pointer' }}
              onClick={() => setExpanded(true)}
            >
              +{events.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Expanded full list */}
      {expanded && (
        <div className="le-body">
          {sorted.length > 0 ? (
            sorted.map((event, i) => <EventCard key={i} event={event} />)
          ) : (
            <div className="le-no-events">
              <span>No events or holidays found for {destination} in {monthRangeLabel}.</span>
              <br />
              <span style={{ fontSize: '0.7rem', marginTop: 4, display: 'block', opacity: 0.6 }}>
                This may be a quiet period — great for avoiding crowds!
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
