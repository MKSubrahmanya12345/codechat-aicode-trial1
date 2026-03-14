// ??$$$ RouteMap - Leaflet map with a single route visualization
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const RouteMap = ({ route }) => {
  if (!route) return null;

  const points = [
    [route.origin.lat, route.origin.lon],
    ...(route.waypoints || []).map((w) => [w.lat, w.lon]),
    [route.destination.lat, route.destination.lon],
  ];

  const center = [(route.origin.lat + route.destination.lat) / 2, (route.origin.lon + route.destination.lon) / 2];

  return (
    <div style={{ height: '300px', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)' }}>
      <MapContainer center={center} zoom={7} style={{ height: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Polyline positions={points} color="#3b82f6" weight={4} />
        <Marker position={[route.origin.lat, route.origin.lon]}>
          <Popup>🟢 Origin</Popup>
        </Marker>
        <Marker position={[route.destination.lat, route.destination.lon]}>
          <Popup>🔴 Destination</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default RouteMap;
