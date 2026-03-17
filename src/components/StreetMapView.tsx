import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Pin } from '@/data/pins';
import { Landmark, landmarks as defaultLandmarks } from '@/data/landmarks';

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const categoryEmoji: Record<string, string> = {
  offer: '↑',
  request: '↓',
  observation: '◆',
  event: '⟷',
};

const categoryColor: Record<string, string> = {
  offer: '#00838A',
  request: '#D54E00',
  observation: '#1D8636',
  event: '#9D7AD2',
};

function createPinIcon(category: string) {
  const color = categoryColor[category] || '#888';
  return L.divIcon({
    html: `<div style="
      width: 28px; height: 28px; border-radius: 8px;
      background: ${color}; display: flex; align-items: center; justify-content: center;
      color: hsl(40,20%,85%); font-size: 14px; font-weight: bold;
      box-shadow: 0 0 12px ${color}88; border: 2px solid ${color}cc;
    ">${categoryEmoji[category] || '•'}</div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function createLandmarkIcon(emoji: string, count: number) {
  return L.divIcon({
    html: `<div style="
      width: 36px; height: 36px; border-radius: 10px;
      background: hsla(30,12%,7%,0.9); border: 1px solid hsla(30,15%,25%,0.6);
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; position: relative;
    ">${emoji}<span style="
      position: absolute; top: -4px; right: -4px;
      width: 16px; height: 16px; border-radius: 50%;
      background: hsl(184,100%,27%); color: hsl(40,20%,85%);
      font-size: 9px; display: flex; align-items: center; justify-content: center;
      font-weight: bold; font-family: Labrada, serif;
    ">${count}</span></div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

// Manhattan center
const CENTER: [number, number] = [40.7280, -73.9960];

interface StreetMapViewProps {
  pins: Pin[];
  landmarks: Landmark[];
  onPinClick: (pin: Pin) => void;
  onLandmarkClick: (landmark: Landmark) => void;
}

export default function StreetMapView({ pins, landmarks, onPinClick, onLandmarkClick }: StreetMapViewProps) {
  // Approximate pin lat/lng from percentage positions
  const pinLatLng = (pin: Pin): [number, number] => {
    const lat = 40.75 - (pin.y / 100) * 0.06;
    const lng = -74.02 + (pin.x / 100) * 0.06;
    return [lat, lng];
  };

  return (
    <div className="w-full h-full pt-9">
      <MapContainer
        center={CENTER}
        zoom={14}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {pins.map((pin) => (
          <Marker
            key={pin.id}
            position={pinLatLng(pin)}
            icon={createPinIcon(pin.category)}
            eventHandlers={{ click: () => onPinClick(pin) }}
          />
        ))}

        {landmarks.map((lm) => (
          <Marker
            key={lm.id}
            position={[lm.lat, lm.lng]}
            icon={createLandmarkIcon(lm.icon, lm.pins.length)}
            eventHandlers={{ click: () => onLandmarkClick(lm) }}
          />
        ))}
      </MapContainer>
    </div>
  );
}
