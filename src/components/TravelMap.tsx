// src/components/TravelMap.tsx
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
  // Collect ALL activities across all days
  const allActivities = tripData.itinerary.flatMap((day) =>
    day.activities.map((act) => ({ ...act, dayNumber: day.dayNumber, dayTheme: day.theme }))
  );

  // Build one polyline per day for color-coded routes
  const dayPolylines = tripData.itinerary.map((day) => ({
    dayNumber: day.dayNumber,
    color: DAY_COLORS[(day.dayNumber - 1) % DAY_COLORS.length],
    positions: day.activities
      .filter((a) => a.coordinates?.lat && a.coordinates?.lng)
      .map((a) => [a.coordinates.lat, a.coordinates.lng] as [number, number]),
  }));

  // Center map on the first valid coordinate
  const firstValid = allActivities.find(
    (a) => a.coordinates?.lat && a.coordinates?.lng
  );
  const center: [number, number] = firstValid
    ? [firstValid.coordinates.lat, firstValid.coordinates.lng]
    : [20.5937, 78.9629]; // India fallback

  return (
    <div style={{ height: '520px', width: '100%' }}>
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

        {/* Color-coded polyline per day */}
        {dayPolylines.map((day) =>
          day.positions.length > 1 ? (
            <Polyline
              key={`line-${day.dayNumber}`}
              positions={day.positions}
              pathOptions={{
                color: day.color,
                dashArray: '8, 6',
                weight: 3,
                opacity: 0.85,
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