// src/components/ItineraryTimeline.tsx
import { useDestinationImage } from '../hooks/useDestinationImage';
import type { FullTripItinerary, Activity } from '../types/travel';

interface TimelineProps {
  tripData: FullTripItinerary;
}

const FALLBACK_IMG = 'https://picsum.photos/seed/travel/600/400';

// Individual activity image component using the smart hook
function ActivityImage({ activity }: { activity: Activity }) {
  const { src, isLoading, isReal } = useDestinationImage(activity.imageKeyword, 600, 400);

  return (
    <div className="activity-img-wrapper">
      <img
        src={src}
        alt={activity.activityName}
        className={`activity-img ${isLoading ? 'img-resolving' : ''}`}
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).src = FALLBACK_IMG;
        }}
      />
      {/* Real photo badge */}
      {isReal && (
        <div className="real-photo-badge" title="Real destination photo">
          📸
        </div>
      )}
      <div className="activity-img-label">
        📍 {activity.activityName}
      </div>
    </div>
  );
}

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

                  {/* Photo Header — async smart image */}
                  <ActivityImage activity={activity} />

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