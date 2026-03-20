import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Pin, xyToLatLng } from '@/data/pins';
import { Landmark } from '@/data/landmarks';
import { renderToString } from 'react-dom/server';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const categoryColor: Record<string, string> = {
  offer: '#00838A', request: '#D54E00', observation: '#1D8636', event: '#9D7AD2',
};

const categoryGlow: Record<string, string> = {
  offer: 'rgba(0,131,138,0.6)', request: 'rgba(213,78,0,0.6)', observation: 'rgba(29,134,54,0.4)', event: 'rgba(157,122,210,0.5)',
};

function pinSvg(category: string, size: number): string {
  const color = categoryColor[category] || '#888';
  const half = size / 2;
  const isAd = category === 'offer' || category === 'request';

  if (isAd) {
    const isOffer = category === 'offer';
    const points = isOffer
      ? `${half},3 ${size - 4},${size - 4} 4,${size - 4}`
      : `4,4 ${size - 4},4 ${half},${size - 3}`;
    const cy = isOffer ? half + 3 : half - 2;
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${half}" cy="${half}" r="${half - 2}" fill="none" stroke="${color}" stroke-width="2" stroke-opacity="0.4"/>
      <polygon points="${points}" fill="${color}" stroke="${color}" stroke-width="1.5" stroke-linejoin="round"/>
      <circle cx="${half}" cy="${cy}" r="3" fill="hsla(40,20%,85%,0.9)"/>
    </svg>`;
  }

  let shape = '';
  switch (category) {
    case 'observation':
      shape = `<polygon points="${half},2 ${size - 1},${half - 1} ${size - 2},${half + 1} ${half},${size - 2} 2,${half + 1} 1,${half - 1}" fill="${color}" fill-opacity="0.7" stroke="${color}" stroke-width="0.8" stroke-linejoin="round"/>`;
      break;
    case 'event':
      shape = `<polygon points="1,${half} ${half - 3},4 ${half - 2},${half - 2} ${half - 2},${half + 2} ${half - 3},${size - 4}" fill="${color}" fill-opacity="0.9" stroke="${color}" stroke-width="0.8" stroke-linejoin="round"/>
        <polygon points="${size - 1},${half} ${half + 3},4 ${half + 2},${half - 2} ${half + 2},${half + 2} ${half + 3},${size - 4}" fill="${color}" fill-opacity="0.9" stroke="${color}" stroke-width="0.8" stroke-linejoin="round"/>`;
      break;
    default:
      shape = `<circle cx="${half}" cy="${half}" r="${half - 2}" fill="${color}" fill-opacity="0.7"/>`;
  }

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">${shape}</svg>`;
}

function createPinIcon(category: string) {
  const isAd = category === 'offer' || category === 'request';
  const size = isAd ? 44 : category === 'event' ? 40 : 32;
  const glow = categoryGlow[category] || 'rgba(0,0,0,0.3)';
  return L.divIcon({
    html: `<div style="filter:drop-shadow(0 0 12px ${glow});cursor:pointer;">${pinSvg(category, size)}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function createLandmarkIcon(emoji: string, count: number) {
  return L.divIcon({
    html: `<div style="width:36px;height:36px;border-radius:10px;background:hsla(30,12%,7%,0.9);border:1px solid hsla(30,15%,25%,0.6);display:flex;align-items:center;justify-content:center;font-size:18px;position:relative;cursor:pointer;">${emoji}<span style="position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;background:hsl(184,100%,27%);color:hsl(40,20%,85%);font-size:9px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-family:Labrada,serif;">${count}</span></div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

const CENTER: [number, number] = [40.7280, -73.9960];

interface StreetMapViewProps {
  pins: Pin[];
  landmarks: Landmark[];
  onPinClick: (pin: Pin) => void;
  onLandmarkClick: (landmark: Landmark) => void;
}

export default function StreetMapView({ pins, landmarks, onPinClick, onLandmarkClick }: StreetMapViewProps) {
  const pinLatLng = (pin: Pin): [number, number] => {
    if (pin.lat != null && pin.lng != null) return [pin.lat, pin.lng];
    const { lat, lng } = xyToLatLng(pin.x, pin.y);
    return [lat, lng];
  };

  return (
    <div className="w-full h-full" style={{ zIndex: 0 }}>
      <MapContainer
        center={CENTER}
        zoom={14}
        style={{ width: '100%', height: '100%', zIndex: 0 }}
        zoomControl={true}
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
