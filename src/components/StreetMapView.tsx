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
import { motion, AnimatePresence } from 'framer-motion';
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
const MAX_ZOOM = 16;

/* ── Category visuals ── */
const categoryColor: Record<string, string> = {
  offer: '#68D07F', request: '#D54E00', observation: '#39BBD6', event: '#F984CA',
};
const categoryGlow: Record<string, string> = {
  offer: 'rgba(104,208,127,0.6)', request: 'rgba(213,78,0,0.6)',
  observation: 'rgba(57,187,214,0.5)', event: 'rgba(249,132,202,0.5)',
};

/* ── Pin SVG builder ── */
function pinSvg(category: string, size: number, dim = false): string {
  const color = categoryColor[category] || '#888';
  const opacity = dim ? 0.6 : 1;

  switch (category) {
    case 'offer':
      return `<svg width="${size}" height="${size}" viewBox="0 0 21 18" xmlns="http://www.w3.org/2000/svg" opacity="${opacity}">
        <path d="M5.15488 8.79268C8.16928 4.39553 10.2204 0 10.5971 0C11.3509 0 15.4886 6.68996 16.8074 8.79268C18.705 11.8181 20.9429 16.9746 20.6651 17.3974C20.3873 17.8203 4.64486 17.3974 0.0458554 17.3974C-0.330963 17.3974 1.63608 13.9256 5.15488 8.79268Z" fill="${color}"/>
      </svg>`;
    case 'request':
      return `<svg width="${size}" height="${size}" viewBox="0 0 21 19" xmlns="http://www.w3.org/2000/svg" opacity="${opacity}">
        <path d="M15.937 10.2477C13.4362 15.1371 10.9826 18.56 10.223 18.5625C9.46328 18.565 6.5407 13.0567 5.20421 10.8611C3.28123 7.70192 -0.263081 0.836818 0.0154676 0.393478C0.294015 -0.0498635 16.2437 -0.178414 20.7978 0.325091C21.1753 0.366827 18.8678 4.51793 15.937 10.2477Z" fill="${color}"/>
      </svg>`;
    case 'observation':
      return `<svg width="${size}" height="${Math.round(size * 0.62)}" viewBox="0 0 34 21" xmlns="http://www.w3.org/2000/svg" opacity="${opacity}">
        <path d="M16.5088 0.0206971C19.8265 -0.108465 21.9836 0.288067 26.9024 3.49238C31.6451 6.58203 32.4625 8.84754 33.0313 9.55878C33.0664 9.56406 33.0892 9.56999 33.0996 9.57636C33.1291 9.59484 33.1327 9.6326 33.1143 9.68769C33.1425 9.7519 33.1282 9.78648 33.0655 9.7912C32.4817 10.803 28.109 15.4025 25.4258 17.4211C23.3535 18.9801 21.0308 20.5385 17.0752 20.673C12.7498 20.8201 11.05 19.885 6.95902 16.7219C2.95795 13.6283 0.738805 11.6629 0.109406 10.9328C0.0754985 10.9274 0.0530707 10.9211 0.0430002 10.9143C0.00857911 10.8908 -0.00205135 10.8459 0.00686737 10.7814C-0.00533738 10.7475 -0.00156893 10.7232 0.0205392 10.7102C0.28807 9.79675 3.36599 6.28794 6.03909 4.11249C8.10592 2.43045 10.6048 0.250616 16.5088 0.0206971ZM16.4278 2.80683C12.7199 2.95472 11.1571 4.57246 9.86429 5.81953C8.19227 7.43256 6.27122 10.0387 6.10648 10.7189C6.09256 10.7286 6.08992 10.7463 6.09769 10.7717C6.09229 10.8198 6.09941 10.8536 6.12113 10.8713C6.12757 10.8763 6.14127 10.8809 6.16214 10.885C6.5596 11.4322 7.32122 12.8731 9.84476 15.1984C12.4246 17.5756 14.1342 18.3152 16.8506 18.2228C19.3346 18.1384 21.4339 16.711 22.7305 15.5559C22.7305 15.5559 26.9591 10.7358 26.96 10.3107C26.9606 9.88522 25.9564 7.7643 22.9678 5.43964C19.8678 3.02831 18.5113 2.72378 16.4278 2.80683Z" fill="${color}"/>
        <path d="M22.0382 9.76578C21.458 7.60359 19.1372 5.44141 16.8164 5.44141C12.1748 5.98195 12.1748 9.11712 12.1748 10.8469C12.1748 13.0091 15.0758 15.7118 17.3966 15.1712C19.7174 14.6307 22.6184 11.928 22.0382 9.76578Z" fill="${color}"/>
      </svg>`;
    case 'event':
      return `<svg width="${size}" height="${Math.round(size * 0.63)}" viewBox="0 0 30 19" xmlns="http://www.w3.org/2000/svg" opacity="${opacity}">
        <path d="M0.273336 0.0361198C0.308554 -0.303863 3.44773 1.80074 7.78017 4.4746C11.4785 6.75716 14.1737 9.28239 14.1737 9.62108C14.1703 9.96181 9.88401 13.0049 8.21767 14.2099C5.81904 15.9445 0.608562 19.1377 0.273336 18.8838C-0.0616529 18.6221 -0.119428 4.16358 0.273336 0.0361198ZM21.4726 3.54491C24.0705 1.81161 28.498 -0.232225 28.8612 0.0214714C29.2243 0.27524 28.8612 14.6552 28.8612 18.8564C28.8612 19.2006 25.8802 17.4038 21.4726 14.1894C17.6967 11.4359 14.1737 9.92125 14.1737 9.57714C14.1755 9.23177 19.6672 4.74942 21.4726 3.54491Z" fill="${color}"/>
      </svg>`;
    default:
      return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" opacity="${opacity}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="${color}" fill-opacity="0.7"/></svg>`;
  }
}

function createPinIcon(category: string, dim = false, urgent = false, highlighted = false) {
  const baseSize = category === 'offer' || category === 'request' ? 44 : category === 'event' ? 40 : 32;
  const size = highlighted ? Math.round(baseSize * 1.6) : baseSize;
  const glow = categoryGlow[category] || 'rgba(0,0,0,0.3)';
  const glowStr = dim ? 'none' : `drop-shadow(0 0 ${highlighted ? '20' : '12'}px ${glow})`;
  const pulseClass = urgent ? 'pin-urgent-pulse' : '';
  const highlightRing = highlighted
    ? `<div style="position:absolute;inset:-6px;border-radius:50%;border:2px solid ${categoryColor[category] || '#888'};opacity:0.6;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>`
    : '';
  return L.divIcon({
    html: `<div class="${pulseClass}" style="filter:${glowStr};cursor:pointer;position:relative;">${highlightRing}${pinSvg(category, size, dim)}</div>`,
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

/*
 * ── Zoom tiers (4 zoom levels: 13–16) ──
 * Zoom 16 (most zoomed in): Tier 1 — all pins, no landmarks
 * Zoom 15: Tier 1b — landmarks + urgent pulsing pins
 * Zoom 14: landmarks + gradients, no pins
 * Zoom 13 (most zoomed out): just gradients, no landmarks
 */
type ZoomTier = 'all-pins' | 'landmarks-urgent' | 'landmarks-gradient' | 'gradient-only';
function getZoomTier(zoom: number): ZoomTier {
  if (zoom >= 16) return 'all-pins';
  if (zoom >= 15) return 'landmarks-urgent';
  if (zoom >= 14) return 'landmarks-gradient';
  return 'gradient-only';
}

/* ── Urgency scoring ── */
const urgencyScore: Record<string, number> = { critical: 3, high: 2, medium: 1, low: 0 };
function pinUrgency(pin: Pin): number {
  return urgencyScore[pin.urgency ?? 'low'] ?? 0;
}

/* ── Heatmap layer ── */
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

/* ── Smooth zoom handler ── */
function SmoothZoomHandler() {
  const map = useMap();

  useEffect(() => {
    let isZooming = false;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (isZooming) return;

      const delta = e.deltaY > 0 ? -1 : 1;
      const currentZoom = map.getZoom();
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, currentZoom + delta));
      if (newZoom === currentZoom) return;

      isZooming = true;
      map.flyTo(map.getCenter(), newZoom, { duration: 0.4 });

      map.once('zoomend', () => {
        isZooming = false;
      });
    };

    const container = map.getContainer();
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [map]);

  return null;
}

/* ── Map events ── */
function MapEvents({
  onMove, onZoom, onAtMinZoom, onAtMaxZoom,
}: {
  onMove: (lat: number, lng: number) => void;
  onZoom: (zoom: number) => void;
  onAtMinZoom: (atMin: boolean) => void;
  onAtMaxZoom: (atMax: boolean) => void;
}) {
  const map = useMap();

  useEffect(() => {
    map.setMaxBounds(MAX_BOUNDS.pad(0.15));
    map.setMinZoom(MIN_ZOOM);
    map.setMaxZoom(MAX_ZOOM);
    map.options.bounceAtZoomLimits = false;

    const handleDragEnd = () => {
      const center = map.getCenter();
      if (!MAX_BOUNDS.contains(center)) {
        map.panInsideBounds(MAX_BOUNDS, { animate: true, duration: 0.5 });
      }
    };

    map.on('dragend', handleDragEnd);

    return () => {
      map.off('dragend', handleDragEnd);
    };
  }, [map]);

  useMapEvents({
    moveend(e) {
      const c = e.target.getCenter();
      onMove(c.lat, c.lng);
      const z = e.target.getZoom();
      onZoom(z);
      onAtMinZoom(z <= MIN_ZOOM);
      onAtMaxZoom(z >= MAX_ZOOM);
    },
    zoomend(e) {
      const z = e.target.getZoom();
      onZoom(z);
      onAtMinZoom(z <= MIN_ZOOM);
      onAtMaxZoom(z >= MAX_ZOOM);
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
  onZoomChange?: (zoom: number) => void;
  highlightedPinId?: string | null;
}

function MapControls({ atMinZoom, atMaxZoom, onRequestCity }: {
  atMinZoom: boolean;
  atMaxZoom: boolean;
  onRequestCity: () => void;
}) {
  const map = useMap();

  const handleZoomIn = () => {
    if (atMaxZoom) return;
    map.flyTo(map.getCenter(), Math.min(map.getZoom() + 1, MAX_ZOOM), { duration: 0.4 });
  };
  const handleZoomOut = () => {
    if (atMinZoom) {
      onRequestCity();
      return;
    }
    map.flyTo(map.getCenter(), Math.max(map.getZoom() - 1, MIN_ZOOM), { duration: 0.4 });
  };
  const handleLocate = () => map.flyTo(YOU_LOCATION, 17, { duration: 0.8 });

  const btnBase: React.CSSProperties = {
    background: 'hsla(15,16%,17%,0.92)',
    border: '1px solid hsla(15,12%,30%,0.5)',
  };
  const dimOutStyle: React.CSSProperties = atMinZoom
    ? { ...btnBase, opacity: 0.4, cursor: 'default' }
    : btnBase;
  const dimInStyle: React.CSSProperties = atMaxZoom
    ? { ...btnBase, opacity: 0.4, cursor: 'default' }
    : btnBase;

  return (
    <div className="leaflet-control" style={{ position: 'absolute', right: 'var(--grid-gap, 16px)', top: 'calc(var(--grid-gap, 16px) * 2 + 64px + 48px)', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <button onClick={handleZoomIn}
        className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors active:scale-95"
        style={dimInStyle} title={atMaxZoom ? 'Maximum zoom reached' : 'Zoom in'}>
        <Plus size={16} color={atMaxZoom ? 'rgba(244,237,232,0.3)' : '#F4EDE8'} />
      </button>
      <button onClick={handleZoomOut}
        className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors active:scale-95"
        style={dimOutStyle} title={atMinZoom ? 'Area limit reached' : 'Zoom out'}>
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

function FlyToHandler({ target, zoom }: { target: [number, number] | null; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo(target, zoom ?? MAX_ZOOM, { duration: 1.2 });
    }
  }, [target, map, zoom]);
  return null;
}

export default function StreetMapView({
  pins, landmarks, onPinClick, onLandmarkClick, layer, onMapMove, onZoomChange, highlightedPinId,
}: StreetMapViewProps) {
  const navigate = useNavigate();
  const [zoom, setZoomLocal] = useState(13);
  const setZoom = useCallback((z: number) => {
    setZoomLocal(z);
    onZoomChange?.(z);
  }, [onZoomChange]);
  const [atMinZoom, setAtMinZoom] = useState(true);
  const [atMaxZoom, setAtMaxZoom] = useState(false);
  const [showRequestCity, setShowRequestCity] = useState(false);
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [flyZoom, setFlyZoom] = useState<number | undefined>(undefined);
  const tier = getZoomTier(zoom);

  const pinLatLng = useCallback((pin: Pin): [number, number] => {
    if (pin.lat != null && pin.lng != null) return [pin.lat, pin.lng];
    const { lat, lng } = xyToLatLng(pin.x, pin.y);
    return [lat, lng];
  }, []);

  // When highlightedPinId changes, fly to that pin
  useEffect(() => {
    if (highlightedPinId) {
      const pin = pins.find(p => p.id === highlightedPinId);
      if (pin) {
        const ll = pinLatLng(pin);
        setFlyTarget(ll);
        setFlyZoom(MAX_ZOOM);
      }
    }
  }, [highlightedPinId, pins, pinLatLng]);

  const streetOpacity = layer === 'streets' ? 1 : layer === 'both' ? 1 : 0.15;
  const welikiaOpacity = layer === 'trees' ? 0.9 : layer === 'both' ? 0.55 : 0;

  const visiblePins = useMemo(() => {
    if (tier === 'gradient-only' || tier === 'landmarks-gradient') return [];
    if (tier === 'landmarks-urgent') {
      return pins.filter((p) => pinUrgency(p) >= 2);
    }
    return pins;
  }, [pins, tier]);

  const showLandmarks = tier === 'landmarks-gradient' || tier === 'landmarks-urgent';
  const showHeatmap = tier === 'gradient-only' || tier === 'landmarks-gradient';

  const handleLandmarkClick = useCallback((lm: Landmark) => {
    setFlyTarget([lm.lat, lm.lng]);
    setFlyZoom(16);
    onLandmarkClick(lm);
  }, [onLandmarkClick]);

  useEffect(() => {
    if (flyTarget) {
      const t = setTimeout(() => { setFlyTarget(null); setFlyZoom(undefined); }, 1500);
      return () => clearTimeout(t);
    }
  }, [flyTarget]);

  return (
    <div className="w-full h-full" style={{ zIndex: 0 }}>
      <MapContainer
        center={CENTER}
        zoom={13}
        style={{ width: '100%', height: '100%', zIndex: 0 }}
        zoomControl={false}
        attributionControl={false}
        zoomSnap={1}
        zoomDelta={1}
        maxBoundsViscosity={0.8}
        bounceAtZoomLimits={false}
        scrollWheelZoom={false}
        zoomAnimation={true}
        markerZoomAnimation={true}
        fadeAnimation={true}
      >
        {onMapMove && (
          <MapEvents
            onMove={onMapMove}
            onZoom={setZoom}
            onAtMinZoom={setAtMinZoom}
            onAtMaxZoom={setAtMaxZoom}
          />
        )}

        <SmoothZoomHandler />
        <FlyToHandler target={flyTarget} zoom={flyZoom} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          opacity={streetOpacity}
          keepBuffer={6}
        />

        <TileLayer
          url="https://d17l30qqe4mnqp.cloudfront.net/overlays/1609Sat/tiles_60k_new/{z}/{x}/{y}.png"
          opacity={welikiaOpacity}
          maxZoom={17}
          minZoom={8}
          keepBuffer={6}
        />

        {showHeatmap && <HeatmapLayer pins={pins} />}

        <Marker position={YOU_LOCATION} icon={createYouIcon()} />

        {visiblePins.map((pin) => {
          const isDim = tier === 'all-pins' && pinUrgency(pin) <= 1;
          const isUrgent = pinUrgency(pin) >= 2;
          const isHighlighted = pin.id === highlightedPinId;
          return (
            <Marker
              key={pin.id}
              position={pinLatLng(pin)}
              icon={createPinIcon(pin.category, isDim, isUrgent, isHighlighted)}
              eventHandlers={{ click: () => onPinClick(pin) }}
            />
          );
        })}

        {showLandmarks && landmarks.map((lm) => (
          <Marker
            key={lm.id}
            position={[lm.lat, lm.lng]}
            icon={createLandmarkIcon(lm.icon, lm.pins.length)}
            eventHandlers={{ click: () => handleLandmarkClick(lm) }}
          />
        ))}

        <MapControls
          atMinZoom={atMinZoom}
          atMaxZoom={atMaxZoom}
          onRequestCity={() => setShowRequestCity(true)}
        />
      </MapContainer>

      {/* Map source attribution */}
      <div
        className="fixed z-30 font-display text-muted-foreground/60"
        style={{ bottom: 'var(--grid-gap)', left: 'var(--grid-gap)', fontSize: '10px' }}
      >
        {streetOpacity > 0.2 && <span>Streets: <a href="https://carto.com" target="_blank" rel="noopener" className="underline hover:text-foreground/60">CARTO</a> / <a href="https://www.openstreetmap.org" target="_blank" rel="noopener" className="underline hover:text-foreground/60">OSM</a></span>}
        {streetOpacity > 0.2 && welikiaOpacity > 0 && <span className="mx-1">·</span>}
        {welikiaOpacity > 0 && <span>Ecology: <a href="https://welikia.org" target="_blank" rel="noopener" className="underline hover:text-foreground/60">Welikia Project</a></span>}
      </div>

      <RequestCityModal open={showRequestCity} onClose={() => setShowRequestCity(false)} />
    </div>
  );
}
