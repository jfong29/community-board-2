import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  MapContainer, TileLayer, Marker, Polyline, Polygon,
  useMap, useMapEvents, ZoomControl,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Pin, xyToLatLng } from '@/data/pins';
import { Landmark } from '@/data/landmarks';
import { useNavigate } from 'react-router-dom';
import { Locate, Plus, Minus } from 'lucide-react';
import RequestCityModal from './RequestCityModal';

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

/* ── Constants ── */
const CENTER: [number, number] = [40.7359, -73.9911];
const YOU_LOCATION: [number, number] = [40.7359, -73.9911];

const MAX_BOUNDS = L.latLngBounds(
  [40.5700, -74.0800],
  [40.9000, -73.7500],
);
const MIN_ZOOM = 13;
const MAX_ZOOM = 18;

/* ── Category visuals ── */
const categoryColor: Record<string, string> = {
  offer: '#00838A', request: '#D54E00', observation: '#1D8636', event: '#9D7AD2',
};
const categoryGlow: Record<string, string> = {
  offer: 'rgba(0,131,138,0.6)', request: 'rgba(213,78,0,0.6)',
  observation: 'rgba(29,134,54,0.4)', event: 'rgba(157,122,210,0.5)',
};

/* ── Pin SVG builder ── */
function pinSvg(category: string, size: number, dim = false): string {
  const color = categoryColor[category] || '#888';
  const half = size / 2;
  const opacity = dim ? 0.35 : 1;
  const isAd = category === 'offer' || category === 'request';
  if (isAd) {
    const isOffer = category === 'offer';
    const points = isOffer
      ? `${half},3 ${size - 4},${size - 4} 4,${size - 4}`
      : `4,4 ${size - 4},4 ${half},${size - 3}`;
    const cy = isOffer ? half + 3 : half - 2;
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" opacity="${opacity}">
      <circle cx="${half}" cy="${half}" r="${half - 2}" fill="none" stroke="${color}" stroke-width="2" stroke-opacity="0.4"/>
      <polygon points="${points}" fill="${color}" stroke="${color}" stroke-width="1.5" stroke-linejoin="round"/>
      <circle cx="${half}" cy="${cy}" r="3" fill="hsla(25,40%,93%,0.9)"/>
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
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" opacity="${opacity}">${shape}</svg>`;
}

function createPinIcon(category: string, dim = false) {
  const isAd = category === 'offer' || category === 'request';
  const size = isAd ? 44 : category === 'event' ? 40 : 32;
  const glow = categoryGlow[category] || 'rgba(0,0,0,0.3)';
  const glowStr = dim ? 'none' : `drop-shadow(0 0 12px ${glow})`;
  return L.divIcon({
    html: `<div style="filter:${glowStr};cursor:pointer;">${pinSvg(category, size, dim)}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function createLandmarkIcon(emoji: string, count: number) {
  return L.divIcon({
    html: `<div style="width:44px;height:44px;border-radius:12px;background:hsla(15,16%,17%,0.92);border:1px solid hsla(15,12%,30%,0.6);display:flex;align-items:center;justify-content:center;font-size:22px;position:relative;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.4);">${emoji}<span style="position:absolute;top:-5px;right:-5px;min-width:18px;height:18px;border-radius:9px;background:#DAE16B;color:#322924;font-size:10px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-family:Labrada,serif;padding:0 3px;">${count}</span></div>`,
    className: '',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

function createYouIcon() {
  return L.divIcon({
    html: `<div style="width:30px;height:30px;border-radius:50%;background:#DAE16B;border:3px solid #F4EDE8;display:flex;align-items:center;justify-content:center;box-shadow:0 0 16px rgba(218,225,107,0.6);cursor:pointer;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#322924" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    </div>`,
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

/* ── Zoom tiers ── */
// Tier 1: 13–14 (zoomed out), Tier 2: 15–16, Tier 3: 17–18
type ZoomTier = 1 | 2 | 3;
function getZoomTier(zoom: number): ZoomTier {
  if (zoom <= 14) return 1;
  if (zoom <= 16) return 2;
  return 3;
}

/* ── Urgency scoring ── */
const urgencyScore: Record<string, number> = { critical: 3, high: 2, medium: 1, low: 0 };
function pinUrgency(pin: Pin): number {
  return urgencyScore[pin.urgency ?? 'low'] ?? 0;
}

/* ── Heatmap layer — fixed to map coordinates ── */
function HeatmapLayer({ pins }: { pins: Pin[] }) {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!pins.length) return;
    const pane = map.getPane('overlayPane');
    if (!pane) return;

    const canvas = L.DomUtil.create('canvas');
    canvas.style.position = 'absolute';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '200';
    pane.appendChild(canvas);
    canvasRef.current = canvas;

    function draw() {
      const size = map.getSize();
      const topLeft = map.containerPointToLayerPoint([0, 0]);
      canvas.style.transform = `translate(${topLeft.x}px, ${topLeft.y}px)`;
      canvas.width = size.x;
      canvas.height = size.y;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, size.x, size.y);

      pins.forEach(pin => {
        const ll = pin.lat != null && pin.lng != null
          ? L.latLng(pin.lat, pin.lng)
          : L.latLng(xyToLatLng(pin.x, pin.y).lat, xyToLatLng(pin.x, pin.y).lng);
        const pt = map.latLngToContainerPoint(ll);
        const r = 80;
        const gradient = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, r);
        const c = categoryColor[pin.category] || '#888';
        gradient.addColorStop(0, c + 'CC');
        gradient.addColorStop(0.3, c + '88');
        gradient.addColorStop(0.6, c + '33');
        gradient.addColorStop(1, c + '00');
        ctx.fillStyle = gradient;
        ctx.fillRect(pt.x - r, pt.y - r, r * 2, r * 2);
      });
    }

    draw();
    map.on('move zoom moveend zoomend', draw);

    let frame: number;
    let opacity = 0.6;
    let dir = 1;
    function pulse() {
      opacity += dir * 0.003;
      if (opacity > 0.8) dir = -1;
      if (opacity < 0.5) dir = 1;
      canvas.style.opacity = String(opacity);
      frame = requestAnimationFrame(pulse);
    }
    pulse();

    return () => {
      map.off('move zoom moveend zoomend', draw);
      cancelAnimationFrame(frame);
      if (pane && canvas.parentNode === pane) pane.removeChild(canvas);
    };
  }, [map, pins]);

  return null;
}

/* ── Map events ── */
function MapEvents({
  onMove, onZoom, onAtMinZoom,
}: {
  onMove: (lat: number, lng: number) => void;
  onZoom: (zoom: number) => void;
  onAtMinZoom: (atMin: boolean) => void;
}) {
  const map = useMap();

  useEffect(() => {
    map.setMaxBounds(MAX_BOUNDS.pad(0.15));
    map.setMinZoom(MIN_ZOOM);
    map.setMaxZoom(MAX_ZOOM);

    const handleDragEnd = () => {
      const center = map.getCenter();
      if (!MAX_BOUNDS.contains(center)) {
        map.panInsideBounds(MAX_BOUNDS, { animate: true, duration: 0.5 });
      }
    };
    map.on('dragend', handleDragEnd);
    return () => { map.off('dragend', handleDragEnd); };
  }, [map]);

  useMapEvents({
    moveend(e) {
      const c = e.target.getCenter();
      onMove(c.lat, c.lng);
      const z = e.target.getZoom();
      onZoom(z);
      onAtMinZoom(z <= MIN_ZOOM);
    },
    zoomend(e) {
      const z = e.target.getZoom();
      onZoom(z);
      onAtMinZoom(z <= MIN_ZOOM);
    },
  });
  return null;
}

/* ── Main component ── */
export type MapLayer = 'streets' | 'both' | 'trees';

interface StreetMapViewProps {
  pins: Pin[];
  landmarks: Landmark[];
  onPinClick: (pin: Pin) => void;
  onLandmarkClick: (landmark: Landmark) => void;
  layer: MapLayer;
  onMapMove?: (lat: number, lng: number) => void;
}

function MapControls({ atMinZoom, onRequestCity }: {
  atMinZoom: boolean;
  onRequestCity: () => void;
}) {
  const map = useMap();

  const handleZoomIn = () => {
    if (map.getZoom() < MAX_ZOOM) map.zoomIn();
  };
  const handleZoomOut = () => {
    if (atMinZoom) {
      onRequestCity();
      return;
    }
    map.zoomOut();
  };
  const handleLocate = () => map.flyTo(YOU_LOCATION, 18, { duration: 0.8 });

  const btnBase: React.CSSProperties = {
    background: 'hsla(15,16%,17%,0.92)',
    border: '1px solid hsla(15,12%,30%,0.5)',
  };
  const dimStyle: React.CSSProperties = atMinZoom
    ? { ...btnBase, opacity: 0.4, cursor: 'default' }
    : btnBase;

  return (
    <div className="leaflet-control" style={{ position: 'absolute', right: 12, top: 80, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <button onClick={handleZoomIn}
        className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors active:scale-95"
        style={btnBase} title="Zoom in">
        <Plus size={16} color="#F4EDE8" />
      </button>
      <button onClick={handleZoomOut}
        className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors active:scale-95"
        style={dimStyle} title={atMinZoom ? 'Area limit reached' : 'Zoom out'}>
        <Minus size={16} color={atMinZoom ? 'rgba(244,237,232,0.3)' : '#F4EDE8'} />
      </button>
      <button onClick={handleLocate}
        className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors active:scale-95"
        style={btnBase} title="Go to your location">
        <Locate size={16} color="#DAE16B" />
      </button>
    </div>
  );
}

function FlyToHandler({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo(target, 18, { duration: 1.2 });
    }
  }, [target, map]);
  return null;
}

export default function StreetMapView({
  pins, landmarks, onPinClick, onLandmarkClick, layer, onMapMove,
}: StreetMapViewProps) {
  const navigate = useNavigate();
  const [zoom, setZoom] = useState(14);
  const [atMinZoom, setAtMinZoom] = useState(false);
  const [showRequestCity, setShowRequestCity] = useState(false);
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const tier = getZoomTier(zoom);

  const pinLatLng = useCallback((pin: Pin): [number, number] => {
    if (pin.lat != null && pin.lng != null) return [pin.lat, pin.lng];
    const { lat, lng } = xyToLatLng(pin.x, pin.y);
    return [lat, lng];
  }, []);

  const showStreets = layer === 'streets' || layer === 'both';
  const showWelikia = layer === 'both' || layer === 'trees';
  const welikiaOpacity = layer === 'trees' ? 0.9 : 0.55;

  // Tier 1: no pins, just heatmap + landmarks
  // Tier 2: urgent pins only (critical/high)
  // Tier 3: all pins, low urgency ones are dim
  const visiblePins = useMemo(() => {
    if (tier === 1) return [];
    if (tier === 2) {
      return pins.filter(p => pinUrgency(p) >= 2); // critical or high
    }
    return pins;
  }, [pins, tier]);

  const showLandmarks = tier <= 2;
  const showHeatmap = tier === 1;

  const handleLandmarkClick = useCallback((lm: Landmark) => {
    setFlyTarget([lm.lat, lm.lng]);
    onLandmarkClick(lm);
  }, [onLandmarkClick]);

  useEffect(() => {
    if (flyTarget) {
      const t = setTimeout(() => setFlyTarget(null), 1500);
      return () => clearTimeout(t);
    }
  }, [flyTarget]);

  return (
    <div className="w-full h-full" style={{ zIndex: 0 }}>
      <MapContainer
        center={CENTER}
        zoom={14}
        style={{ width: '100%', height: '100%', zIndex: 0 }}
        zoomControl={false}
        attributionControl={false}
        zoomSnap={1}
        zoomDelta={1}
        maxBoundsViscosity={0.8}
      >
        {onMapMove && (
          <MapEvents
            onMove={onMapMove}
            onZoom={setZoom}
            onAtMinZoom={setAtMinZoom}
          />
        )}

        <FlyToHandler target={flyTarget} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          opacity={showStreets ? 1 : 0.15}
        />

        {showWelikia && (
          <TileLayer
            url="https://d17l30qqe4mnqp.cloudfront.net/overlays/1609Sat/tiles_60k_new/{z}/{x}/{y}.png"
            opacity={welikiaOpacity}
            maxZoom={16}
            minZoom={8}
          />
        )}

        {showHeatmap && <HeatmapLayer pins={pins} />}

        {/* "You" marker — always visible */}
        <Marker position={YOU_LOCATION} icon={createYouIcon()} />

        {visiblePins.map((pin) => {
          const isDim = tier === 3 && pinUrgency(pin) <= 1;
          return (
            <Marker key={pin.id} position={pinLatLng(pin)} icon={createPinIcon(pin.category, isDim)}
              eventHandlers={{ click: () => onPinClick(pin) }} />
          );
        })}

        {showLandmarks && landmarks.map((lm) => (
          <Marker key={lm.id} position={[lm.lat, lm.lng]}
            icon={createLandmarkIcon(lm.icon, lm.pins.length)}
            eventHandlers={{ click: () => handleLandmarkClick(lm) }} />
        ))}

        <MapControls
          atMinZoom={atMinZoom}
          onRequestCity={() => setShowRequestCity(true)}
        />
      </MapContainer>

      <RequestCityModal open={showRequestCity} onClose={() => setShowRequestCity(false)} />
    </div>
  );
}
