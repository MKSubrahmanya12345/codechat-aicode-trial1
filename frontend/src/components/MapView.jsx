// ??$$$ MapView - Leaflet map showing all active driver positions
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState } from 'react';

// Fix leaflet default icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ??$$$ Custom colored marker factory
const createColoredIcon = (color) =>
  L.divIcon({
    className: '',
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

const driverIcon = createColoredIcon('#3b82f6');
const originIcon = createColoredIcon('#10b981');
const destIcon = createColoredIcon('#ef4444');

const MapView = ({ drivers = [], routes = [], liveLocations = {} }) => {
  const defaultCenter = [20.5937, 78.9629]; // India center

  return (
    <div className="map-container">
      <MapContainer
        center={defaultCenter}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        id="main-map"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* Draw route lines */}
        {routes.map((route) => {
          const points = [
            [route.origin.lat, route.origin.lon],
            ...(route.waypoints || []).map((w) => [w.lat, w.lon]),
            [route.destination.lat, route.destination.lon],
          ];
          return (
            <Polyline key={route._id} positions={points} color="#3b82f6" weight={3} opacity={0.7} dashArray="6">
              <Popup>
                <strong>{route.name}</strong><br />
                {route.distanceKm?.toFixed(1)} km · {route.durationMinutes} min
              </Popup>
            </Polyline>
          );
        })}

        {/* Route origin / destination markers */}
        {routes.map((route) => (
          <div key={`markers-${route._id}`}>
            <Marker position={[route.origin.lat, route.origin.lon]} icon={originIcon}>
              <Popup>🟢 Origin: {route.name}</Popup>
            </Marker>
            <Marker position={[route.destination.lat, route.destination.lon]} icon={destIcon}>
              <Popup>🔴 Destination: {route.name}</Popup>
            </Marker>
          </div>
        ))}

        {/* Live driver positions (from socket updates) */}
        {Object.entries(liveLocations).map(([driverId, loc]) => (
          <Marker key={driverId} position={[loc.lat, loc.lon]} icon={driverIcon}>
            <Popup>
              🚗 Driver: {driverId.slice(-6)}<br />
              Speed: {loc.speedKmh?.toFixed(0)} km/h<br />
              {new Date(loc.timestamp).toLocaleTimeString()}
            </Popup>
          </Marker>
        ))}

        {/* Driver markers from DB location */}
        {drivers.filter(d => d.currentLocation?.lat).map((driver) => (
          <Marker
            key={driver._id}
            position={[driver.currentLocation.lat, driver.currentLocation.lon]}
            icon={driverIcon}
          >
            <Popup>
              🚗 {driver.firstName} {driver.lastName}<br />
              Status: {driver.status}<br />
              Score: {driver.behaviorScore}/100
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
