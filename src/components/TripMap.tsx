import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for start and end points
const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const endIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface TripMapProps {
  startLocation: { lat: number; lng: number; name: string };
  endLocation: { lat: number; lng: number; name: string };
  route: { lat: number; lng: number }[];
}

const TripMap: React.FC<TripMapProps> = ({ startLocation, endLocation, route }) => {
  const center = [
    (startLocation.lat + endLocation.lat) / 2,
    (startLocation.lng + endLocation.lng) / 2
  ] as [number, number];

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Start marker */}
        <Marker position={[startLocation.lat, startLocation.lng]} icon={startIcon}>
          <Popup>
            <div className="text-center">
              <strong>Trip Start</strong>
              <br />
              {startLocation.name}
            </div>
          </Popup>
        </Marker>
        
        {/* End marker */}
        <Marker position={[endLocation.lat, endLocation.lng]} icon={endIcon}>
          <Popup>
            <div className="text-center">
              <strong>Trip End</strong>
              <br />
              {endLocation.name}
            </div>
          </Popup>
        </Marker>
        
        {/* Route polyline */}
        <Polyline
          positions={route.map(point => [point.lat, point.lng])}
          color="#3B82F6"
          weight={4}
          opacity={0.8}
        />
      </MapContainer>
    </div>
  );
};

export default TripMap;