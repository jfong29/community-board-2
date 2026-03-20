import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  MapContainer, TileLayer, Marker, Polyline, Polygon,
  useMap, useMapEvents, ZoomControl,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Pin, xyToLatLng } from '@/data/pins';
import { Landmark } from '@/data/landmarks';
import { ecoFeatures, EcoFeature } from '@/data/welikia-ecology';
import { useNavigate } from 'react-router-dom';
import { User, Locate, Plus, Minus } from 'lucide-react';

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

/* ── Category visuals ── */
const categoryColor: Record<string, string> = {
  offer: '#00838A', request: '#D54E00', observation: '#1D8636', event: '#9D7AD2',
};
const categoryGlow: Record<string, string> = {
  offer: 'rgba(0,131,138,0.6)', request: 'rgba(213,78,0,0.6)',
  observation: 'rgba(29,134,54,0.4)', event: 'rgba(157,122,210,0.5)',
};

/* ── Pin SVG builder ── */
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
    html: `<div style="width:40px;height:40px;border-radius:12px;background:hsla(30,12%,7%,0.92);border:1px solid hsla(30,15%,25%,0.6);display:flex;align-items:center;justify-content:center;font-size:20px;position:relative;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.4);">${emoji}<span style="position:absolute;top:-5px;right:-5px;min-width:18px;height:18px;border-radius:9px;background:hsl(184,100%,27%);color:hsl(40,20%,85%);font-size:10px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-family:Labrada,serif;padding:0 3px;">${count}</span></div>`,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

function createYouIcon() {
  return L.divIcon({
    html: `<div style="width:28px;height:28px;border-radius:50%;background:hsl(184,100%,27%);border:3px solid hsl(40,20%,85%);display:flex;align-items:center;justify-content:center;box-shadow:0 0 16px rgba(0,131,138,0.6);cursor:pointer;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(40,20%,85%)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    </div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

/* ── Zoom tiers ── */
type ZoomTier = 1 | 2 | 3;
function getZoomTier(zoom: number): ZoomTier {
  if (zoom <= 13) return 1;
  if (zoom <= 15) return 2;
  return 3;
}

/* ── Urgency scoring for tier 2 filtering ── */
const urgencyScore: Record<string, number> = { critical: 3, high: 2, medium: 1, low: 0 };
function pinUrgency(pin: Pin): number {
  return urgencyScore[(pin as any).urgency ?? 'low'] ?? 0;
}

/* ── Heatmap layer via canvas ── */
function HeatmapLayer({ pins }: { pins: Pin[] }) {
  const map = useMap();

  useEffect(() => {
    if (!pins.length) return;

    const canvas = L.DomUtil.create('canvas');
    const size = map.getSize();
    canvas.width = size.x;
    canvas.height = size.y;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '200';
    canvas.style.opacity = '0.6';

    const pane = map.getPane('overlayPane');
    if (pane) pane.appendChild(canvas);

    function draw() {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const s = map.getSize();
      canvas.width = s.x;
      canvas.height = s.y;
      ctx.clearRect(0, 0, s.x, s.y);

      pins.forEach(pin => {
        const ll = pin.lat != null && pin.lng != null
          ? L.latLng(pin.lat, pin.lng)
          : L.latLng(xyToLatLng(pin.x, pin.y).lat, xyToLatLng(pin.x, pin.y).lng);
        const pt = map.latLngToContainerPoint(ll);
        const radius = 60;
        const gradient = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, radius);
        const c = categoryColor[pin.category] || '#888';
        gradient.addColorStop(0, c + 'AA');
        gradient.addColorStop(0.4, c + '44');
        gradient.addColorStop(1, c + '00');
        ctx.fillStyle = gradient;
        ctx.fillRect(pt.x - radius, pt.y - radius, radius * 2, radius * 2);
      });
    }

    draw();
    map.on('moveend zoomend', draw);

    // Pulse animation
    let frame: number;
    let opacity = 0.5;
    let dir = 1;
    function pulse() {
      opacity += dir * 0.004;
      if (opacity > 0.7) dir = -1;
      if (opacity < 0.4) dir = 1;
      canvas.style.opacity = String(opacity);
      frame = requestAnimationFrame(pulse);
    }
    pulse();

    return () => {
      map.off('moveend zoomend', draw);
      cancelAnimationFrame(frame);
      if (pane && canvas.parentNode === pane) pane.removeChild(canvas);
    };
  }, [map, pins]);

  return null;
}

/* ── Eco features renderer ── */
function EcoLayer({ layer }: { layer: MapLayer }) {
  if (layer === 'streets') return null;
  const opacity = layer === 'trees' ? 1 : 0.6;

  return (
    <>
      {ecoFeatures.map(f => {
        if (f.type === 'stream' || f.type === 'shoreline') {
          return (
            <Polyline
              key={f.id}
              positions={(f.coords as [number, number][]).map(([lng, lat]) => [lat, lng] as [number, number])}
              pathOptions={{
                color: f.color,
                weight: f.type === 'shoreline' ? 2 : 3,
                opacity: opacity * f.fillOpacity,
                dashArray: f.type === 'shoreline' ? '6 4' : undefined,
              }}
            />
          );
        }
        // polygon features
        const rings = f.type === 'pond'
          ? [(f.coords as [number, number][]).map(([lng, lat]) => [lat, lng] as [number, number])]
          : (f.coords as [number, number][][]).map(ring =>
              ring.map(([lng, lat]) => [lat, lng] as [number, number])
            );
        return (
          <Polygon
            key={f.id}
            positions={rings}
            pathOptions={{
              color: f.color,
              fillColor: f.color,
              fillOpacity: opacity * f.fillOpacity,
              weight: 1.5,
              opacity: opacity * 0.6,
            }}
          />
        );
      })}
    </>
  );
}

/* ── Map events ── */
function MapEvents({
  onMove,
  onZoom,
}: {
  onMove: (lat: number, lng: number) => void;
  onZoom: (zoom: number) => void;
}) {
  useMapEvents({
    moveend(e) {
      const c = e.target.getCenter();
      onMove(c.lat, c.lng);
      onZoom(e.target.getZoom());
    },
    zoomend(e) {
      onZoom(e.target.getZoom());
    },
  });
  return null;
}

/* ── Main component ── */
export type MapLayer = 'streets' | 'both' | 'trees';

const CENTER: [number, number] = [40.7359, -73.9911]; // Union Square
const YOU_LOCATION: [number, number] = [40.7359, -73.9911];

interface StreetMapViewProps {
  pins: Pin[];
  landmarks: Landmark[];
  onPinClick: (pin: Pin) => void;
  onLandmarkClick: (landmark: Landmark) => void;
  layer: MapLayer;
  onMapMove?: (lat: number, lng: number) => void;
}

/** Inner controls rendered inside the map */
function MapControls({ onProfile }: { onProfile: () => void }) {
  const map = useMap();

  const handleZoomIn = () => map.zoomIn();
  const handleZoomOut = () => map.zoomOut();
  const handleLocate = () => map.flyTo(YOU_LOCATION, 15, { duration: 0.8 });

  return (
    <div
      className="leaflet-control"
      style={{
        position: 'absolute',
        right: 12,
        bottom: 80,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <button
        onClick={handleZoomIn}
        className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors active:scale-95"
        style={{ background: 'hsla(30,12%,7%,0.9)', border: '1px solid hsla(30,15%,25%,0.5)' }}
        title="Zoom in"
      >
        <Plus size={16} color="hsl(40,20%,85%)" />
      </button>
      <button
        onClick={handleZoomOut}
        className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors active:scale-95"
        style={{ background: 'hsla(30,12%,7%,0.9)', border: '1px solid hsla(30,15%,25%,0.5)' }}
        title="Zoom out"
      >
        <Minus size={16} color="hsl(40,20%,85%)" />
      </button>
      <button
        onClick={handleLocate}
        className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors active:scale-95"
        style={{ background: 'hsla(30,12%,7%,0.9)', border: '1px solid hsla(30,15%,25%,0.5)' }}
        title="Go to your location"
      >
        <Locate size={16} color="hsl(184,100%,27%)" />
      </button>
      <button
        onClick={onProfile}
        className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors active:scale-95"
        style={{ background: 'hsla(184,100%,27%,0.2)', border: '1px solid hsla(184,100%,27%,0.4)' }}
        title="Your profile"
      >
        <User size={16} color="hsl(184,100%,27%)" />
      </button>
    </div>
  );
}

export default function StreetMapView({
  pins,
  landmarks,
  onPinClick,
  onLandmarkClick,
  layer,
  onMapMove,
}: StreetMapViewProps) {
  const navigate = useNavigate();
  const [zoom, setZoom] = useState(14);
  const tier = getZoomTier(zoom);

  const pinLatLng = useCallback((pin: Pin): [number, number] => {
    if (pin.lat != null && pin.lng != null) return [pin.lat, pin.lng];
    const { lat, lng } = xyToLatLng(pin.x, pin.y);
    return [lat, lng];
  }, []);

  const showStreets = layer === 'streets' || layer === 'both';

  // Tier-based filtering
  const visiblePins = useMemo(() => {
    if (tier === 1) return []; // heatmap only at zoom 1
    if (tier === 2) {
      // Show top urgent pins (urgency >= medium or all if few)
      const sorted = [...pins].sort((a, b) => pinUrgency(b) - pinUrgency(a));
      return sorted.slice(0, Math.max(12, Math.floor(pins.length * 0.3)));
    }
    return pins; // tier 3: show all
  }, [pins, tier]);

  const showLandmarks = tier <= 2;
  const showHeatmap = tier === 1;

  return (
    <div className="w-full h-full" style={{ zIndex: 0 }}>
      <MapContainer
        center={CENTER}
        zoom={14}
        style={{ width: '100%', height: '100%', zIndex: 0 }}
        zoomControl={false}
        attributionControl={false}
      >
        {onMapMove && (
          <MapEvents
            onMove={onMapMove}
            onZoom={setZoom}
          />
        )}

        {/* Street tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          opacity={showStreets ? 1 : 0.15}
        />

        {/* Ecological features overlay */}
        <EcoLayer layer={layer} />

        {/* Heatmap at tier 1 */}
        {showHeatmap && <HeatmapLayer pins={pins} />}

        {/* "You" marker */}
        <Marker position={YOU_LOCATION} icon={createYouIcon()} />

        {/* Pins — visible at tier 2 (urgent) and tier 3 (all) */}
        {visiblePins.map((pin) => (
          <Marker
            key={pin.id}
            position={pinLatLng(pin)}
            icon={createPinIcon(pin.category)}
            eventHandlers={{ click: () => onPinClick(pin) }}
          />
        ))}

        {/* Landmarks — visible at tier 1 & 2, hidden at tier 3 */}
        {showLandmarks &&
          landmarks.map((lm) => (
            <Marker
              key={lm.id}
              position={[lm.lat, lm.lng]}
              icon={createLandmarkIcon(lm.icon, lm.pins.length)}
              eventHandlers={{ click: () => onLandmarkClick(lm) }}
            />
          ))}

        <MapControls onProfile={() => navigate('/profile')} />
      </MapContainer>
    </div>
  );
}
