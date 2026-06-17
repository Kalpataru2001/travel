// src/components/ItineraryTimeline.tsx
import type { FullTripItinerary } from '../types/travel';

interface TimelineProps {
  tripData: FullTripItinerary;
}

// Uses Unsplash Source API for real keyword-based images
function getActivityImage(keyword: string): string {
  const encoded = encodeURIComponent(keyword);
  return `https://source.unsplash.com/featured/600x400/?${encoded}`;
}

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80';

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