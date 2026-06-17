// src/components/TravelMap.tsx
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // CRUCIAL: The map will break without this CSS
import type { FullTripItinerary } from '../types/travel';
import L from 'leaflet';

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
interface TravelMapProps {
  tripData: FullTripItinerary;
}

export default function TravelMap({ tripData }: TravelMapProps) {
  // Extract all coordinates from Day 1 to draw our path
  const dayOneActivities = tripData.itinerary[0].activities;
  const pathCoordinates = dayOneActivities.map(act => [act.coordinates.lat, act.coordinates.lng] as [number, number]);

  // Center the map on the first activity
  const startLocation = pathCoordinates[0];

  return (
    <div style={{ height: '500px', width: '100%', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <MapContainer 
        center={startLocation} 
        zoom={12} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        {/* This TileLayer provides the actual visual map from OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Draw a dashed line connecting the locations */}
        <Polyline 
          positions={pathCoordinates} 
          pathOptions={{ color: 'blue', dashArray: '10, 10', weight: 4 }} 
        />

        {/* Drop a pin for every activity in the itinerary */}
        {dayOneActivities.map((activity, index) => (
          <Marker 
            key={activity.id} 
            position={[activity.coordinates.lat, activity.coordinates.lng]}
            icon={customIcon} 
          >
            <Popup>
              <strong>Step {index + 1}: {activity.timeOfDay}</strong><br />
              {activity.activityName}<br />
              <em>Transit to next: {activity.transitTimeToNextStop || 'N/A'}</em>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}