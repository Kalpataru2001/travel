import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { FullTripItinerary, HotelRecommendation } from '../types/travel';
import L from 'leaflet';

// Fix Leaflet default icon broken in Vite/Webpack builds
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// A palette of colors for different days
const DAY_COLORS = [
  '#0ea5e9', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ef4444', // red
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#f97316', // orange
];

function createDayIcon(color: string, dayNumber: number) {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        background: ${color};
        color: white;
        width: 28px;
        height: 28px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="
          transform: rotate(45deg);
          font-size: 10px;
          font-weight: 800;
          font-family: 'Outfit', sans-serif;
        ">${dayNumber}</span>
      </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
  });
}

// Gold hotel marker icon
const hotelIcon = L.divIcon({
  className: '',
  html: `
    <div style="
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 3px 12px rgba(245,158,11,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    ">🏨</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -20],
});

interface TravelMapProps {
  tripData: FullTripItinerary;
  hotels?: HotelRecommendation[];
}

export default function TravelMap({ tripData, hotels }: TravelMapProps) {
  const [routedPolylines, setRoutedPolylines] = useState<{ dayNumber: number; color: string; positions: [number, number][] }[]>([]);
  const [useRoadRouting, setUseRoadRouting] = useState(true);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Collect ALL activities across all days
  const allActivities = tripData.itinerary.flatMap((day) =>
    day.activities.map((act) => ({ ...act, dayNumber: day.dayNumber, dayTheme: day.theme }))
  );

  // Build straight fallback polylines (renders instantly)
  const straightPolylines = tripData.itinerary.map((day) => ({
    dayNumber: day.dayNumber,
    color: DAY_COLORS[(day.dayNumber - 1) % DAY_COLORS.length],
    positions: day.activities
      .filter((a) => a.coordinates?.lat && a.coordinates?.lng)
      .map((a) => [a.coordinates.lat, a.coordinates.lng] as [number, number]),
  }));

  // Fetch driving routes dynamically on load/destination change
  useEffect(() => {
    let cancelled = false;

    // Set fallback straight polylines initially
    setRoutedPolylines(straightPolylines);

    const fetchRoadRoutes = async () => {
      setIsLoadingRoutes(true);
      try {
        const routesData = await Promise.all(
          tripData.itinerary.map(async (day) => {
            const color = DAY_COLORS[(day.dayNumber - 1) % DAY_COLORS.length];
            const coords = day.activities
              .filter((a) => a.coordinates?.lat && a.coordinates?.lng)
              .map((a) => ({ lat: a.coordinates.lat, lng: a.coordinates.lng }));

            if (coords.length < 2) {
              return {
                dayNumber: day.dayNumber,
                color,
                positions: coords.map((c) => [c.lat, c.lng] as [number, number]),
              };
            }

            const coordString = coords.map((c) => `${c.lng},${c.lat}`).join(';');
            const url = `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`;

            try {
              const res = await fetch(url);
              if (!res.ok) throw new Error('OSRM routing request failed');
              const data = await res.json();
              if (data.code === 'Ok' && data.routes?.[0]?.geometry?.coordinates) {
                const routedCoords = data.routes[0].geometry.coordinates.map(
                  (c: [number, number]) => [c[1], c[0]] as [number, number]
                );
                return {
                  dayNumber: day.dayNumber,
                  color,
                  positions: routedCoords,
                };
              }
            } catch (err) {
              console.warn(`Could not compute road routing for Day ${day.dayNumber}:`, err);
            }

            // Fallback to straight line coordinates
            return {
              dayNumber: day.dayNumber,
              color,
              positions: coords.map((c) => [c.lat, c.lng] as [number, number]),
            };
          })
        );

        if (!cancelled) {
          setRoutedPolylines(routesData);
        }
      } catch (err) {
        console.error('Error fetching road routes:', err);
      } finally {
        if (!cancelled) {
          setIsLoadingRoutes(false);
        }
      }
    };

    fetchRoadRoutes();

    return () => {
      cancelled = true;
    };
  }, [tripData]);

  // Center map on the first valid coordinate
  const firstValid = allActivities.find(
    (a) => a.coordinates?.lat && a.coordinates?.lng
  );
  const center: [number, number] = firstValid
    ? [firstValid.coordinates.lat, firstValid.coordinates.lng]
    : [20.5937, 78.9629]; // India fallback

  return (
    <div style={{ position: 'relative', height: '520px', width: '100%' }}>
      {/* Route Control Panel Overlay */}
      <div className="map-routing-toggle no-print">
        <label className="routing-toggle-label">
          <input
            type="checkbox"
            checked={useRoadRouting}
            onChange={(e) => setUseRoadRouting(e.target.checked)}
            className="routing-toggle-checkbox"
          />
          <span className="routing-toggle-icon">🚗</span>
          <span className="routing-toggle-text">
            {isLoadingRoutes ? '⏳ Loading roads...' : 'Follow Roads'}
          </span>
        </label>
      </div>

      {/* Offline Map Warning Banner */}
      {isOffline && (
        <div className="map-offline-banner no-print">
          <span className="map-offline-icon">🔌</span>
          <span className="map-offline-text">
            Offline Mode: Using cached map tiles. Route points remain active.
          </span>
        </div>
      )}

      <MapContainer
        center={center}
        zoom={11}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        {/* Dark-styled tile layer for a premium feel */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Color-coded polylines (either snap-to-road or straight line) */}
        {(useRoadRouting ? routedPolylines : straightPolylines).map((day) =>
          day.positions.length > 1 ? (
            <Polyline
              key={`line-${day.dayNumber}`}
              positions={day.positions}
              pathOptions={{
                color: day.color,
                dashArray: useRoadRouting ? undefined : '8, 6',
                weight: useRoadRouting ? 4 : 3,
                opacity: useRoadRouting ? 0.9 : 0.85,
              }}
            />
          ) : null
        )}

        {/* Activity markers — colored by day */}
        {allActivities.map((activity) => {
          if (!activity.coordinates?.lat || !activity.coordinates?.lng) return null;
          const color = DAY_COLORS[(activity.dayNumber - 1) % DAY_COLORS.length];
          return (
            <Marker
              key={activity.id}
              position={[activity.coordinates.lat, activity.coordinates.lng]}
              icon={createDayIcon(color, activity.dayNumber)}
            >
              <Popup>
                <div style={{ fontFamily: 'Outfit, sans-serif', minWidth: '160px' }}>
                  <div style={{
                    fontWeight: 700,
                    color: color,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '4px'
                  }}>
                    Day {activity.dayNumber} · {activity.timeOfDay}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: '4px' }}>
                    {activity.activityName}
                  </div>
                  {activity.transitTimeToNextStop && (
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      🚗 {activity.transitTimeToNextStop} to next
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Hotel markers — gold pins */}
        {hotels?.map((hotel, i) => {
          if (!hotel.coordinates?.lat || !hotel.coordinates?.lng) return null;
          return (
            <Marker
              key={hotel.id || `hotel-${i}`}
              position={[hotel.coordinates.lat, hotel.coordinates.lng]}
              icon={hotelIcon}
            >
              <Popup>
                <div style={{ fontFamily: 'Outfit, sans-serif', minWidth: '170px' }}>
                  <div style={{
                    fontWeight: 700,
                    color: '#d97706',
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '4px'
                  }}>
                    🏨 Hotel
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: '2px' }}>
                    {hotel.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>
                    📍 {hotel.area}
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#d97706' }}>
                    {hotel.priceRange}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}