// src/components/ItineraryTimeline.tsx
import type { FullTripItinerary } from '../types/travel';

interface TimelineProps {
  tripData: FullTripItinerary;
}

// Generates a deterministic Picsum photo URL based on the keyword.
// Picsum Photos (picsum.photos) is free and does not require an API key.
// We derive a stable numeric seed from the string so the same activity
// always shows the same image across page loads.
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

function getActivityImage(keyword: string): string {
  const seed = hashCode(keyword) % 1000; // Picsum has ~1000 curated photos
  return `https://picsum.photos/seed/${seed}/600/400`;
}

const FALLBACK_IMG = 'https://picsum.photos/seed/travel/600/400';

export default function ItineraryTimeline({ tripData }: TimelineProps) {
  return (
    <div className="timeline-scroll">
      {tripData.itinerary.map((day) => (
        <div key={day.dayNumber} className="day-group">

          {/* Day Header */}
          <div className="day-header">
            <div className="day-badge">Day {day.dayNumber}</div>
            <h3 className="day-theme">{day.theme}</h3>
          </div>

          {/* Activity Trail */}
          <div className="activity-trail">
            {day.activities.map((activity, index) => (
              <div key={activity.id} className="activity-item">

                {/* Vertical connecting line (not on last item) */}
                {index !== day.activities.length - 1 && (
                  <div className="trail-line" />
                )}

                {/* Dot marker */}
                <div className="trail-dot" />

                {/* Activity Card */}
                <div className="activity-card">

                  {/* Photo Header */}
                  <div className="activity-img-wrapper">
                    <img
                      src={getActivityImage(activity.imageKeyword)}
                      alt={activity.activityName}
                      className="activity-img"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_IMG;
                      }}
                    />
                    <div className="activity-img-label">
                      📍 {activity.activityName}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="activity-body">
                    <div className="activity-meta">
                      <span className="activity-time">{activity.timeOfDay}</span>
                      <span className="activity-duration">
                        ⏱ {activity.estimatedDuration}
                      </span>
                    </div>

                    <h4 className="activity-name">{activity.activityName}</h4>
                    <p className="activity-desc">{activity.description}</p>

                    {/* Local Tip */}
                    {activity.localTip && (
                      <div className="activity-tip">
                        💡 <span>{activity.localTip}</span>
                      </div>
                    )}

                    {/* Transit to next stop */}
                    {activity.transitTimeToNextStop && (
                      <div className="activity-transit" style={{ marginTop: activity.localTip ? '8px' : '0' }}>
                        🚗 Next stop: {activity.transitTimeToNextStop}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Local Transport Advice Box */}
      <div className="local-tip-box">
        <div className="local-tip-title">
          💡 Local Expert Tip
        </div>
        <p className="local-tip-text">{tripData.localTransportAdvice}</p>
      </div>
    </div>
  );
}