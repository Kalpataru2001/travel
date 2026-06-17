// src/components/ItineraryTimeline.tsx
// src/components/ItineraryTimeline.tsx
import type { FullTripItinerary } from '../types/travel';

interface TimelineProps {
    tripData: FullTripItinerary;
}

export default function ItineraryTimeline({ tripData }: TimelineProps) {
    return (
        <div style={{ padding: '10px', height: '650px', overflowY: 'auto', paddingRight: '15px' }}>

            {tripData.itinerary.map((day) => (
                <div key={day.dayNumber} style={{ marginBottom: '40px' }}>
                    {/* Day Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                        <div style={{ backgroundColor: '#059669', color: 'white', padding: '10px 20px', borderRadius: '30px', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 10px rgba(5, 150, 105, 0.3)' }}>
                            Day {day.dayNumber}
                        </div>
                        <h3 style={{ color: '#0f172a', margin: 0, fontSize: '1.4rem' }}>{day.theme}</h3>
                    </div>

                    {/* The Connected Trail */}
                    <div style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {day.activities.map((activity, index) => {
                            // 1. We only keep the variable we are actually using
                            const safeKeyword = encodeURIComponent(activity.imageKeyword);

                            return (
                                <div key={activity.id} style={{ position: 'relative', paddingLeft: '30px' }}>

                                    {/* The Journey Line */}
                                    {index !== day.activities.length - 1 && (
                                        <div style={{ position: 'absolute', left: '7px', top: '30px', bottom: '-40px', width: '3px', backgroundColor: '#a7f3d0', borderRadius: '2px' }}></div>
                                    )}

                                    {/* The Map Pin Dot */}
                                    <div style={{ position: 'absolute', left: '0', top: '24px', width: '17px', height: '17px', borderRadius: '50%', backgroundColor: '#10b981', border: '4px solid #ecfdf5', boxShadow: '0 0 0 1px #059669' }}></div>

                                    {/* Upgraded Card with Photography Container */}
                                    <div style={{
                                        backgroundColor: 'white',
                                        borderRadius: '20px',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
                                        overflow: 'hidden',
                                        marginBottom: '25px'
                                    }}>

                                        {/* Card Image Header */}
                                        <div style={{ width: '100%', height: '200px', overflow: 'hidden', position: 'relative' }}>
                                            <img
                                                // 2. We inject the safeKeyword directly here
                                                src={`https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=600&q=80&keyword=${safeKeyword}`}
                                                alt={activity.activityName}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80';
                                                }}
                                            />
                                            <div style={{ position: 'absolute', bottom: '12px', left: '15px', backgroundColor: 'rgba(15, 23, 42, 0.75)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', backdropFilter: 'blur(4px)' }}>
                                                📍 {activity.activityName}
                                            </div>
                                        </div>

                                        {/* Content Body */}
                                        <div style={{ padding: '20px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                <strong style={{ color: '#047857', fontSize: '1.1rem' }}>{activity.timeOfDay}</strong>
                                                <span style={{ fontSize: '0.85em', color: '#065f46', backgroundColor: '#d1fae5', padding: '6px 12px', borderRadius: '20px', fontWeight: 'bold' }}>
                                                    ⏱️ {activity.estimatedDuration}
                                                </span>
                                            </div>

                                            <p style={{ margin: '0 0 15px 0', color: '#475569', fontSize: '0.95rem', lineHeight: '1.6' }}>
                                                {activity.description}
                                            </p>

                                            {activity.transitTimeToNextStop && (
                                                <div style={{ display: 'inline-block', fontSize: '0.85em', color: '#b45309', backgroundColor: '#fef3c7', padding: '6px 12px', borderRadius: '8px', fontWeight: '600' }}>
                                                    🚙 Transit: {activity.transitTimeToNextStop}
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* Local Tip Box */}
            <div style={{ marginTop: '30px', padding: '25px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', borderRadius: '16px', boxShadow: '0 10px 20px rgba(5, 150, 105, 0.2)' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>💡 Local Expert Tip</h4>
                <p style={{ margin: 0, lineHeight: '1.5', opacity: 0.9 }}>{tripData.localTransportAdvice}</p>
            </div>
        </div>
    );
}