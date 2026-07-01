// src/components/ItineraryTimeline.tsx
import { useState } from 'react';
import { useDestinationImage } from '../hooks/useDestinationImage';
import type { FullTripItinerary, Activity } from '../types/travel';
import { generateIcsFile, triggerIcsDownload } from '../utils/calendar';

interface TimelineProps {
  tripData: FullTripItinerary;
  onUpdateTripData: (trip: FullTripItinerary) => void;
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

export default function ItineraryTimeline({ tripData, onUpdateTripData }: TimelineProps) {
  const [activeDayNumber, setActiveDayNumber] = useState<number | 'all'>(1);
  const [expandedFoodIds, setExpandedFoodIds] = useState<Record<string, boolean>>({});

  const toggleFoodExpand = (id: string) => {
    setExpandedFoodIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Calendar Export States
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportStartDate, setExportStartDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });

  const handleExportCalendar = () => {
    if (!exportStartDate) return;
    try {
      const icsData = generateIcsFile(tripData, exportStartDate);
      triggerIcsDownload(tripData.metadata.destination, icsData);
      setShowExportModal(false);
    } catch (err) {
      console.error('Failed to export calendar:', err);
      alert('Failed to generate calendar. Please try again.');
    }
  };

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editTip, setEditTip] = useState('');
  const [editTransit, setEditTransit] = useState('');

  // Add custom activity state
  const [isAdding, setIsAdding] = useState(false);
  const [addName, setAddName] = useState('');
  const [addTime, setAddTime] = useState('Morning');
  const [addDuration, setAddDuration] = useState('1.5 hours');
  const [addDesc, setAddDesc] = useState('');
  const [addTip, setAddTip] = useState('');
  const [addTransit, setAddTransit] = useState('');

  // Inline edit handlers
  const startEditing = (activity: Activity) => {
    setEditingId(activity.id);
    setEditName(activity.activityName);
    setEditTime(activity.timeOfDay);
    setEditDuration(activity.estimatedDuration);
    setEditDesc(activity.description);
    setEditTip(activity.localTip || '');
    setEditTransit(activity.transitTimeToNextStop || '');
  };

  const saveEdit = (actId: string) => {
    if (!editName.trim()) return;

    const updatedItinerary = tripData.itinerary.map((day) => {
      if (day.dayNumber === activeDayNumber) {
        return {
          ...day,
          activities: day.activities.map((act) => {
            if (act.id === actId) {
              return {
                ...act,
                activityName: editName,
                timeOfDay: editTime,
                estimatedDuration: editDuration,
                description: editDesc,
                localTip: editTip.trim() || undefined,
                transitTimeToNextStop: editTransit.trim() || undefined,
              };
            }
            return act;
          }),
        };
      }
      return day;
    });

    onUpdateTripData({
      ...tripData,
      itinerary: updatedItinerary,
    });
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  // Activity deletion
  const handleDeleteActivity = (actId: string) => {
    if (!window.confirm('Are you sure you want to remove this activity?')) return;

    const updatedItinerary = tripData.itinerary.map((day) => {
      if (day.dayNumber === activeDayNumber) {
        return {
          ...day,
          activities: day.activities.filter((act) => act.id !== actId),
        };
      }
      return day;
    });

    onUpdateTripData({
      ...tripData,
      itinerary: updatedItinerary,
    });

    if (editingId === actId) {
      setEditingId(null);
    }
  };

  // Add custom activity
  const handleAddActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) return;

    const activeDay = tripData.itinerary.find((d) => d.dayNumber === activeDayNumber);
    if (!activeDay) return;

    // Coordinate calculation: copy last activity or fallback to city defaults
    let lat = 12.9716;
    let lng = 77.5946;
    if (activeDay.activities.length > 0) {
      const lastAct = activeDay.activities[activeDay.activities.length - 1];
      lat = lastAct.coordinates.lat + 0.005 * (Math.random() - 0.5); // slight offset so markers don't overlap exactly
      lng = lastAct.coordinates.lng + 0.005 * (Math.random() - 0.5);
    } else {
      const firstVal = tripData.itinerary.flatMap((d) => d.activities).find((a) => a.coordinates?.lat);
      if (firstVal) {
        lat = firstVal.coordinates.lat + 0.005;
        lng = firstVal.coordinates.lng + 0.005;
      }
    }

    const newActivity: Activity = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      activityName: addName,
      timeOfDay: addTime,
      estimatedDuration: addDuration,
      description: addDesc,
      localTip: addTip.trim() || undefined,
      transitTimeToNextStop: addTransit.trim() || undefined,
      coordinates: { lat, lng },
      imageKeyword: addName,
    };

    const updatedItinerary = tripData.itinerary.map((day) => {
      if (day.dayNumber === activeDayNumber) {
        return {
          ...day,
          activities: [...day.activities, newActivity],
        };
      }
      return day;
    });

    onUpdateTripData({
      ...tripData,
      itinerary: updatedItinerary,
    });

    // Reset Form
    setAddName('');
    setAddTime('Morning');
    setAddDuration('1.5 hours');
    setAddDesc('');
    setAddTip('');
    setAddTransit('');
    setIsAdding(false);
  };

  const activeDay = activeDayNumber === 'all'
    ? null
    : tripData.itinerary.find((d) => d.dayNumber === activeDayNumber);

  return (
    <div className="timeline-container">
      {/* Timeline Header Row */}
      <div className="timeline-header no-print">
        {/* Day Selector Tabs */}
        <div className="day-tabs-container">
          <button
            className={`day-tab-btn ${activeDayNumber === 'all' ? 'active' : ''}`}
            onClick={() => {
              setActiveDayNumber('all');
              setIsAdding(false);
              setEditingId(null);
            }}
          >
            Show All Days
          </button>
          {tripData.itinerary.map((day) => (
            <button
              key={day.dayNumber}
              className={`day-tab-btn ${activeDayNumber === day.dayNumber ? 'active' : ''}`}
              onClick={() => {
                setActiveDayNumber(day.dayNumber);
                setIsAdding(false);
                setEditingId(null);
              }}
            >
              Day {day.dayNumber}
            </button>
          ))}
        </div>

        {/* Calendar Export Button */}
        <button
          className="export-calendar-btn"
          onClick={() => setShowExportModal(true)}
          title="Export itinerary to Google/Apple Calendar"
        >
          📅 Export to Calendar
        </button>
      </div>

      <div className="timeline-scroll">
        {/* Render Single Active Day */}
        {activeDayNumber !== 'all' && activeDay && (
          <div className="day-group">
            {/* Day Header */}
            <div className="day-header planner-day-header">
              <div className="day-badge">Day {activeDay.dayNumber}</div>
              <h3 className="day-theme">{activeDay.theme}</h3>
            </div>

            {/* Empty State */}
            {activeDay.activities.length === 0 && (
              <div className="empty-day-placeholder">
                <div className="empty-day-icon">🏝️</div>
                <p>No activities scheduled for this day yet.</p>
                <p className="empty-day-sub">Use the card below to add custom stops!</p>
              </div>
            )}

            {/* Activities List */}
            <div className="activity-trail">
              {activeDay.activities.map((activity, index) => {
                const isEditing = editingId === activity.id;

                return (
                  <div
                    key={activity.id}
                    className="activity-item"
                  >
                    {/* Vertical connecting line */}
                    {index !== activeDay.activities.length - 1 && <div className="trail-line" />}

                    {/* Timeline Dot Indicator */}
                    <div className="trail-dot" />

                    {/* Activity Card */}
                    <div className="activity-card">
                      {isEditing ? (
                        /* Inline Editing Form */
                        <div className="activity-edit-form">
                          <h4 className="edit-form-title">Edit Activity Details</h4>
                          
                          <div className="edit-form-row">
                            <div className="edit-form-field">
                              <label>Activity Title</label>
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder="e.g. Visit the Beach"
                                className="edit-input"
                              />
                            </div>
                            <div className="edit-form-field">
                              <label>Time of Day</label>
                              <input
                                type="text"
                                value={editTime}
                                onChange={(e) => setEditTime(e.target.value)}
                                placeholder="e.g. Morning, 10:00 AM"
                                className="edit-input"
                              />
                            </div>
                          </div>

                          <div className="edit-form-row">
                            <div className="edit-form-field">
                              <label>Estimated Duration</label>
                              <input
                                type="text"
                                value={editDuration}
                                onChange={(e) => setEditDuration(e.target.value)}
                                placeholder="e.g. 2 hours"
                                className="edit-input"
                              />
                            </div>
                            <div className="edit-form-field">
                              <label>Transit to Next Stop</label>
                              <input
                                type="text"
                                value={editTransit}
                                onChange={(e) => setEditTransit(e.target.value)}
                                placeholder="e.g. 15 mins taxi, walking"
                                className="edit-input"
                              />
                            </div>
                          </div>

                          <div className="edit-form-field">
                            <label>Description</label>
                            <textarea
                              value={editDesc}
                              onChange={(e) => setEditDesc(e.target.value)}
                              placeholder="Describe what you will do..."
                              rows={3}
                              className="edit-textarea"
                            />
                          </div>

                          <div className="edit-form-field">
                            <label>💡 Local Tip (Optional)</label>
                            <input
                              type="text"
                              value={editTip}
                              onChange={(e) => setEditTip(e.target.value)}
                              placeholder="e.g. Visit early to avoid crowds"
                              className="edit-input"
                            />
                          </div>

                          <div className="edit-form-actions">
                            <button className="edit-btn-save" onClick={() => saveEdit(activity.id)}>
                              Save
                            </button>
                            <button className="edit-btn-cancel" onClick={cancelEdit}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Normal Activity Card Rendering */
                        <>
                          {/* Image */}
                          <ActivityImage activity={activity} />

                          {/* Body */}
                          <div className="activity-body">
                            {/* Card Control Actions (Edit & Delete buttons visible on hover) */}
                            <div className="activity-actions-overlay no-print">
                              <button
                                className="act-action-btn edit-btn"
                                onClick={() => startEditing(activity)}
                                title="Edit activity"
                              >
                                ✏️
                              </button>
                              <button
                                className="act-action-btn delete-btn"
                                onClick={() => handleDeleteActivity(activity.id)}
                                title="Delete activity"
                              >
                                🗑️
                              </button>
                            </div>

                            <div className="activity-meta">
                              <span className="activity-time">{activity.timeOfDay}</span>
                              <span className="activity-duration">⏱ {activity.estimatedDuration}</span>
                            </div>

                            <h4 className="activity-name">{activity.activityName}</h4>
                            <p className="activity-desc">{activity.description}</p>

                            {/* Local Tip */}
                            {activity.localTip && (
                              <div className="activity-tip">
                                💡 <span>{activity.localTip}</span>
                              </div>
                            )}

                            {/* Transit details */}
                            {activity.transitTimeToNextStop && (
                              <div className="activity-transit" style={{ marginTop: activity.localTip ? '8px' : '0' }}>
                                🚗 Next stop: {activity.transitTimeToNextStop}
                              </div>
                            )}

                            {/* Eat Nearby Expandable Panel */}
                            <div className="activity-restaurants-section">
                              <button
                                className={`activity-restaurants-toggle ${expandedFoodIds[activity.id] ? 'expanded' : ''}`}
                                onClick={() => toggleFoodExpand(activity.id)}
                              >
                                <span className="toggle-title">🍽️ Eat Nearby</span>
                                <span className="toggle-chevron">{expandedFoodIds[activity.id] ? '▲' : '▼'}</span>
                              </button>
                              
                              {expandedFoodIds[activity.id] && (
                                <div className="activity-restaurants-panel">
                                  {activity.nearbyRestaurants && activity.nearbyRestaurants.length > 0 ? (
                                    <div className="restaurants-list">
                                      {activity.nearbyRestaurants.map((res, rIdx) => (
                                        <div key={rIdx} className="restaurant-item-card">
                                          <div className="restaurant-item-header">
                                            <span className="restaurant-name">{res.name}</span>
                                            <span className="restaurant-price-badge">{res.priceRange}</span>
                                          </div>
                                          <div className="restaurant-cuisine">🍳 {res.cuisine}</div>
                                          <p className="restaurant-special">{res.whySpecial}</p>
                                          <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(res.name + ' ' + tripData.metadata.destination)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="restaurant-maps-link"
                                          >
                                            🌐 Open in Maps
                                          </a>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="restaurant-empty-state">
                                      <p>No food recommendations loaded for this stop.</p>
                                      <button
                                        className="ask-assistant-btn"
                                        type="button"
                                        onClick={() => {
                                          alert("Ask our AI assistant GlobeGuide (in the bottom-right chat bubble) for restaurants near " + activity.activityName + "!");
                                        }}
                                      >
                                        💬 Ask Assistant
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* "+ Add Custom Stop" Collapsible Card */}
            <div className="add-activity-wrapper no-print">
              {!isAdding ? (
                <button className="add-activity-toggle-btn" onClick={() => setIsAdding(true)}>
                  ➕ Add Custom Stop
                </button>
              ) : (
                <form onSubmit={handleAddActivitySubmit} className="add-activity-form">
                  <h4 className="add-form-title">🆕 Add Custom Stop</h4>
                  
                  <div className="edit-form-row">
                    <div className="edit-form-field">
                      <label>Activity Title *</label>
                      <input
                        type="text"
                        value={addName}
                        onChange={(e) => setAddName(e.target.value)}
                        placeholder="e.g. Watch Sunset at Viewpoint"
                        required
                        className="edit-input"
                      />
                    </div>
                    <div className="edit-form-field">
                      <label>Time of Day</label>
                      <input
                        type="text"
                        value={addTime}
                        onChange={(e) => setAddTime(e.target.value)}
                        placeholder="e.g. Morning, 3:00 PM"
                        className="edit-input"
                      />
                    </div>
                  </div>

                  <div className="edit-form-row">
                    <div className="edit-form-field">
                      <label>Estimated Duration</label>
                      <input
                        type="text"
                        value={addDuration}
                        onChange={(e) => setAddDuration(e.target.value)}
                        placeholder="e.g. 1.5 hours"
                        className="edit-input"
                      />
                    </div>
                    <div className="edit-form-field">
                      <label>Transit to Next Stop</label>
                      <input
                        type="text"
                        value={addTransit}
                        onChange={(e) => setAddTransit(e.target.value)}
                        placeholder="e.g. 10 mins walk"
                        className="edit-input"
                      />
                    </div>
                  </div>

                  <div className="edit-form-field">
                    <label>Description</label>
                    <textarea
                      value={addDesc}
                      onChange={(e) => setAddDesc(e.target.value)}
                      placeholder="What will you do here?"
                      rows={3}
                      className="edit-textarea"
                    />
                  </div>

                  <div className="edit-form-field">
                    <label>💡 Local Tip (Optional)</label>
                    <input
                      type="text"
                      value={addTip}
                      onChange={(e) => setAddTip(e.target.value)}
                      placeholder="e.g. Buy tickets online in advance"
                      className="edit-input"
                    />
                  </div>

                  <p className="add-coordinates-hint">
                    📍 Note: Location snaps to current day itinerary coordinate path.
                  </p>

                  <div className="edit-form-actions">
                    <button type="submit" className="edit-btn-save">
                      Add Stop
                    </button>
                    <button type="button" className="edit-btn-cancel" onClick={() => setIsAdding(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Render Show All Days View */}
        {activeDayNumber === 'all' && (
          <div className="all-days-trail">
            {tripData.itinerary.map((day) => (
              <div key={day.dayNumber} className="day-group">
                {/* Day Header */}
                <div className="day-header">
                  <div className="day-badge">Day {day.dayNumber}</div>
                  <h3 className="day-theme">{day.theme}</h3>
                </div>

                {/* Day Activities (Static / print-friendly) */}
                <div className="activity-trail">
                  {day.activities.map((activity, index) => (
                    <div key={activity.id} className="activity-item">
                      {index !== day.activities.length - 1 && <div className="trail-line" />}
                      <div className="trail-dot" />

                      <div className="activity-card">
                        <ActivityImage activity={activity} />
                        <div className="activity-body">
                          <div className="activity-meta">
                            <span className="activity-time">{activity.timeOfDay}</span>
                            <span className="activity-duration">⏱ {activity.estimatedDuration}</span>
                          </div>

                          <h4 className="activity-name">{activity.activityName}</h4>
                          <p className="activity-desc">{activity.description}</p>

                          {activity.localTip && (
                            <div className="activity-tip">
                              💡 <span>{activity.localTip}</span>
                            </div>
                          )}

                          {activity.transitTimeToNextStop && (
                            <div className="activity-transit" style={{ marginTop: activity.localTip ? '8px' : '0' }}>
                              🚗 Next stop: {activity.transitTimeToNextStop}
                            </div>
                          )}

                          {/* Eat Nearby Expandable Panel */}
                          <div className="activity-restaurants-section">
                            <button
                              className={`activity-restaurants-toggle ${expandedFoodIds[activity.id] ? 'expanded' : ''}`}
                              onClick={() => toggleFoodExpand(activity.id)}
                            >
                              <span className="toggle-title">🍽️ Eat Nearby</span>
                              <span className="toggle-chevron">{expandedFoodIds[activity.id] ? '▲' : '▼'}</span>
                            </button>
                            
                            {expandedFoodIds[activity.id] && (
                              <div className="activity-restaurants-panel">
                                {activity.nearbyRestaurants && activity.nearbyRestaurants.length > 0 ? (
                                  <div className="restaurants-list">
                                    {activity.nearbyRestaurants.map((res, rIdx) => (
                                      <div key={rIdx} className="restaurant-item-card">
                                        <div className="restaurant-item-header">
                                          <span className="restaurant-name">{res.name}</span>
                                          <span className="restaurant-price-badge">{res.priceRange}</span>
                                        </div>
                                        <div className="restaurant-cuisine">🍳 {res.cuisine}</div>
                                        <p className="restaurant-special">{res.whySpecial}</p>
                                        <a
                                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(res.name + ' ' + tripData.metadata.destination)}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="restaurant-maps-link"
                                        >
                                          🌐 Open in Maps
                                        </a>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="restaurant-empty-state">
                                    <p>No food recommendations loaded for this stop.</p>
                                    <button
                                      className="ask-assistant-btn"
                                      type="button"
                                      onClick={() => {
                                        alert("Ask our AI assistant GlobeGuide (in the bottom-right chat bubble) for restaurants near " + activity.activityName + "!");
                                      }}
                                    >
                                      💬 Ask Assistant
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Local Transport Advice Box */}
        <div className="local-tip-box">
          <div className="local-tip-title">💡 Local Expert Tip</div>
          <p className="local-tip-text">{tripData.localTransportAdvice}</p>
        </div>
      </div>

      {/* Calendar Export Modal */}
      {showExportModal && (
        <div className="calendar-modal-overlay">
          <div className="calendar-modal">
            <div className="calendar-modal-header">
              <h3>📅 Export to Calendar</h3>
              <button className="calendar-modal-close" onClick={() => setShowExportModal(false)}>✕</button>
            </div>
            <div className="calendar-modal-body">
              <p>
                Set the start date for your trip to <strong>{tripData.metadata.destination}</strong>. 
                All itinerary days will be scheduled consecutively starting from this date.
              </p>
              <div className="calendar-date-input-group">
                <label htmlFor="calendar-start-date">Trip Start Date</label>
                <input
                  type="date"
                  id="calendar-start-date"
                  value={exportStartDate}
                  onChange={(e) => setExportStartDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="calendar-modal-footer">
              <button className="calendar-modal-cancel" onClick={() => setShowExportModal(false)}>
                Cancel
              </button>
              <button className="calendar-modal-submit" onClick={handleExportCalendar}>
                Download Calendar File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}