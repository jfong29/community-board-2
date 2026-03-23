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
import zoomInIcon from '@/assets/zoom-in.svg';
import zoomOutIcon from '@/assets/zoom-out.svg';
import recenterIcon from '@/assets/recenter.svg';
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
  offer: '#79E824', request: '#FF48B5', observation: '#FF6C2F', event: '#B036FF',
};
const categoryGlow: Record<string, string> = {
  offer: 'rgba(121,232,36,0.6)', request: 'rgba(255,72,181,0.6)',
  observation: 'rgba(255,108,47,0.5)', event: 'rgba(176,54,255,0.5)',
};

/* ── Pin SVG builder ── */
function pinSvg(category: string, size: number, dim = false): string {
  const color = categoryColor[category] || '#888';
  const opacity = dim ? 0.6 : 1;

  switch (category) {
    case 'offer':
      return `<svg width="${size}" height="${Math.round(size * 33/37)}" viewBox="0 0 37 33" xmlns="http://www.w3.org/2000/svg" opacity="${opacity}">
        <path d="M9.97159 16.5C14.9255 8.99862 17 1.5 18.9155 1.5C21.5 1.5 26.9541 12.9128 29.1215 16.5C32.24 21.6613 35.9179 30.458 35.4614 31.1794C35.0048 31.9008 9.13342 31.1794 1.57536 31.1794C0.95609 31.1794 4.18876 25.2565 9.97159 16.5Z" fill="${color}" stroke="black" stroke-width="3"/>
      </svg>`;
    case 'request':
      return `<svg width="${size}" height="${Math.round(size * 26/32)}" viewBox="0 0 32 26" xmlns="http://www.w3.org/2000/svg" opacity="${opacity}">
        <path d="M24.4635 14.1795C20.6214 20.948 16.8528 25.6868 15.6864 25.6907C14.5201 25.6945 10.0357 18.072 7.98491 15.0338C5.03411 10.6622 -0.404111 1.16213 0.0237687 0.548366C0.451647 -0.065392 24.9395 -0.251254 31.9312 0.44337C32.5107 0.500949 28.9659 6.24756 24.4635 14.1795Z" fill="${color}" stroke="black" stroke-width="3"/>
      </svg>`;
    case 'observation':
      return `<svg width="${size}" height="${size}" viewBox="0 0 33 33" xmlns="http://www.w3.org/2000/svg" opacity="${opacity}">
        <path d="M16.1543 1.5C19.6253 1.49998 23.0776 1.62452 25.7686 1.86914C27.1181 1.99183 28.2425 2.14144 29.0693 2.3125C29.4843 2.39835 29.7898 2.48326 29.9971 2.55859C30.0249 2.56871 30.0484 2.58045 30.0693 2.58887C30.0791 2.61257 30.0933 2.63922 30.1055 2.67188C30.1847 2.88529 30.2741 3.19868 30.3662 3.62109C30.5496 4.46255 30.7165 5.60586 30.8584 6.97461C31.1414 9.70445 31.3119 13.203 31.3428 16.7012C31.3736 20.2018 31.2642 23.6587 30.998 26.3115C30.8643 27.6442 30.696 28.7262 30.501 29.4932C30.411 29.847 30.3239 30.0915 30.2539 30.2471C30.2065 30.2608 30.1469 30.2809 30.0713 30.2988C29.8068 30.3614 29.4477 30.424 28.9922 30.4844C28.083 30.6048 26.8834 30.7021 25.4756 30.7754C22.6652 30.9217 19.1195 30.9686 15.6055 30.9375C12.0926 30.9064 8.6357 30.7978 6.00488 30.6357C4.68582 30.5545 3.59694 30.4615 2.82031 30.3613C2.63999 30.3381 2.48354 30.3139 2.34961 30.292C2.32464 30.1513 2.29768 29.986 2.27051 29.7949C2.15814 29.0047 2.0478 27.8974 1.94727 26.5596C1.7467 23.8906 1.5914 20.3885 1.5293 16.8486C1.46713 13.3054 1.49942 9.75469 1.66797 6.98145C1.75252 5.59032 1.86937 4.43079 2.01758 3.5791C2.09196 3.15174 2.16757 2.83889 2.2373 2.62891C2.24294 2.61194 2.2498 2.59634 2.25488 2.58203C2.27202 2.57531 2.29038 2.56629 2.31152 2.55859C2.51869 2.48327 2.82517 2.39837 3.24023 2.3125C4.06689 2.1415 5.19078 1.99182 6.54004 1.86914C9.23086 1.6245 12.6832 1.50003 16.1543 1.5Z" fill="${color}" stroke="black" stroke-width="3"/>
      </svg>`;
    case 'event':
      return `<svg width="${size}" height="${Math.round(size * 39/57)}" viewBox="0 0 57 39" xmlns="http://www.w3.org/2000/svg" opacity="${opacity}">
        <path d="M25.1576 5.35345C22.6179 7.10569 21.0595 10.4598 21.0595 14.8234C21.0595 19.1869 25.1576 22.3663 25.1576 22.3663C25.1576 22.3663 17.9603 26.4878 17.1008 27.3121C16.2413 28.1364 13.3643 36.9978 13.9881 37.8909L42.3725 38.9212C42.3064 37.818 41.5069 29.9921 40.3216 28.4809C39.1363 26.9696 33.3893 22.9158 33.3893 22.9158C33.3893 22.9158 38.0447 20.6218 38.4842 14.8234C38.9237 9.0249 35.6616 5.92712 33.3893 4.81104C31.117 3.69496 27.6973 3.60122 25.1576 5.35345Z" fill="${color}"/>
        <path d="M38.6534 1.35317C41.2894 -0.399018 44.8387 -0.30482 47.1973 0.811178C49.5559 1.92729 52.9425 5.02461 52.4864 10.8229C52.03 16.6211 47.1973 18.9157 47.1973 18.9157C47.2251 18.9324 51.9931 21.8053 53.2198 23.3122C54.45 24.8245 56.4535 33.816 56.5225 34.9206L45.0459 34.5182C45.0063 34.2418 44.9656 33.9622 44.9219 33.6823C44.7369 32.4968 44.5063 31.2332 44.2295 30.1344C44.0915 29.5864 43.9284 29.028 43.7364 28.5163C43.5635 28.0559 43.2846 27.4053 42.834 26.8307C42.308 26.1601 41.4846 25.431 40.792 24.8493C40.0903 24.2599 39.2907 23.6354 38.5352 23.0592C39.9936 21.3462 41.4076 18.8197 41.668 15.3844C42.1255 9.34717 39.3529 5.43315 36.5664 3.3561C37.1592 2.5542 37.8596 1.8808 38.6534 1.35317Z" fill="${color}"/>
      </svg>`;
    default:
      return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" opacity="${opacity}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="${color}" fill-opacity="0.7"/></svg>`;
  }
}

function urgentRequestSvg(size: number): string {
  return `<svg width="${size}" height="${Math.round(size * 72/38)}" viewBox="0 0 38 72" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.5255 70.2381C18.1489 70.2042 17.8523 70.058 17.6789 69.9576C17.4591 69.8304 17.2639 69.6741 17.1023 69.5289C16.7775 69.2371 16.4407 68.8574 16.1134 68.453C15.4514 67.6353 14.6865 66.5402 13.9197 65.3899C13.1481 64.2325 12.3507 62.9818 11.6248 61.8418C10.8927 60.6921 10.2408 59.6668 9.74215 58.928C8.2362 56.697 6.11648 53.1903 4.42814 50.1681C3.58424 48.6575 2.83386 47.2427 2.31726 46.1536C2.06177 45.6149 1.8454 45.1184 1.7051 44.7142C1.63704 44.5181 1.56741 44.2889 1.5301 44.0605C1.51159 43.9471 1.492 43.7834 1.50318 43.5967C1.5131 43.4315 1.55514 43.0868 1.79335 42.7451C2.01079 42.4332 2.28592 42.2868 2.37665 42.2403C2.50092 42.1765 2.61462 42.1372 2.68874 42.1142C2.83979 42.0674 2.99579 42.036 3.12396 42.0142C3.38997 41.9688 3.7269 41.932 4.1021 41.8996C4.86255 41.834 5.91007 41.7781 7.15039 41.7314C9.63758 41.6377 12.9746 41.5782 16.5083 41.56C23.5464 41.5237 31.4941 41.6494 35.0802 42.0057C35.4566 42.0432 35.86 42.223 36.1495 42.5881C36.4026 42.9075 36.4667 43.241 36.4852 43.4239C36.5197 43.7656 36.441 44.0616 36.4057 44.1869C36.3181 44.4975 36.1602 44.8559 35.995 45.201C35.6493 45.9229 35.0966 46.9349 34.409 48.1515C33.0638 50.5313 30.9711 54.0944 28.7684 57.9748C26.8213 61.4051 24.8801 64.3436 23.2591 66.4432C22.4522 67.4884 21.6993 68.3586 21.0448 68.9827C20.7198 69.2926 20.3852 69.5739 20.0533 69.7877C19.768 69.9716 19.2798 70.2434 18.6915 70.2453L18.5255 70.2381Z" fill="#FF48B5" stroke="black" stroke-width="3"/>
    <path d="M16.9071 36C16.7617 35.9286 16.4708 35.7857 16.0344 35.5714C15.598 35.3571 15.3071 35.1786 15.1617 35.0357C15.1253 34.5 15.089 33.8214 15.0526 33C15.0526 32.1786 15.0344 31.3214 14.998 30.4286C14.998 29.5357 14.998 28.6964 14.998 27.9107C15.1799 27.7321 15.3799 27.5714 15.598 27.4286C15.8162 27.2857 16.0162 27.1429 16.198 27C17.5071 27 18.8162 27.0179 20.1253 27.0536C21.4708 27.0893 22.5799 27.1429 23.4526 27.2143C23.5617 27.6071 23.6708 28.5714 23.7799 30.1071C23.9253 31.6071 23.998 33.25 23.998 35.0357C23.6708 35.1786 23.1617 35.3036 22.4708 35.4107C21.8162 35.5179 21.1071 35.6071 20.3435 35.6786C19.5799 35.7857 18.8708 35.8571 18.2162 35.8929C17.598 35.9643 17.1617 36 16.9071 36Z" fill="#FF48B5" stroke="black" stroke-width="3"/>
    <path d="M24.7139 1.5L25.0479 1.68164C25.2717 1.80308 25.5725 1.98571 25.9316 2.21289C26.3352 2.44716 26.7153 2.69514 27.0039 2.95605L27.6016 3.49609L27.4814 4.29199C27.1555 6.45319 26.7575 8.72555 26.2881 11.1084C25.8178 13.4958 25.293 15.8516 24.7139 18.1748C24.1334 20.5034 23.5145 22.6753 22.8574 24.6885L22.6309 25.3848L21.9424 25.6338C21.5499 25.7757 21.0738 25.9302 20.5215 26.0967L20.4932 26.1045L20.4639 26.1123C19.9332 26.2494 19.402 26.3696 18.8701 26.4727L18.1875 26.6045L17.6455 26.1689L16.6787 25.3926L16.2822 25.0742L16.1611 24.5811L11.541 5.78613L11.3271 4.91602L11.9922 4.31543L13.2812 3.15039L13.5586 2.89941L13.9219 2.80762C14.6388 2.62759 15.5027 2.47356 16.5 2.33984C17.4756 2.17716 18.4847 2.03041 19.5273 1.90039C20.5829 1.76877 21.5372 1.6685 22.3887 1.60156H22.3936C23.2532 1.5368 23.9126 1.5 24.333 1.5H24.7139Z" fill="#FF48B5" stroke="black" stroke-width="3"/>
  </svg>`;
}

function createPinIcon(category: string, dim = false, urgent = false, highlighted = false) {
  const baseSize = category === 'offer' || category === 'request' ? 44 : category === 'event' ? 40 : 32;
  const size = highlighted ? Math.round(baseSize * 1.6) : baseSize;
  const glow = categoryGlow[category] || 'rgba(0,0,0,0.3)';
  const glowStr = dim ? 'none' : `drop-shadow(0 0 ${highlighted ? '20' : '12'}px ${glow})`;
  const pulseClass = (urgent && category === 'request') ? 'pin-urgent-pulse' : '';

  // Use urgent request SVG for urgent requests
  const svgContent = (urgent && category === 'request')
    ? urgentRequestSvg(size)
    : pinSvg(category, size, dim);

  // Highlighted pins get a subtle gradient glow behind them instead of a ring
  const highlightGlow = highlighted
    ? `<div style="position:absolute;inset:-12px;border-radius:50%;background:radial-gradient(circle, ${categoryColor[category] || '#888'}44 0%, transparent 70%);pointer-events:none;"></div>`
    : '';

  return L.divIcon({
    html: `<div class="${pulseClass}" style="filter:${glowStr};cursor:pointer;position:relative;">${highlightGlow}${svgContent}</div>`,
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
function HeatmapLayer({ pins, zoom }: { pins: Pin[]; zoom: number }) {
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
    canvas.style.mixBlendMode = 'screen';
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
      ctx.globalCompositeOperation = 'screen';

      // Radius based on zoom: smaller at higher zooms so gradients don't overlap
      const r = zoom <= 13 ? 100 : 55;

      // Group pins by category for fluid merging
      const byCategory: Record<string, { x: number; y: number }[]> = {};
      pins.forEach(pin => {
        const ll = pin.lat != null && pin.lng != null
          ? L.latLng(pin.lat, pin.lng)
          : L.latLng(xyToLatLng(pin.x, pin.y).lat, xyToLatLng(pin.x, pin.y).lng);
        const pt = map.latLngToContainerPoint(ll);
        const cat = pin.category;
        if (!byCategory[cat]) byCategory[cat] = [];
        byCategory[cat].push({ x: pt.x, y: pt.y });
      });

      // Draw each category as a merged layer
      Object.entries(byCategory).forEach(([cat, points]) => {
        const c = categoryColor[cat] || '#888';
        const r = 120;
        points.forEach(pt => {
          const gradient = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, r);
          gradient.addColorStop(0, c + 'AA');
          gradient.addColorStop(0.2, c + '77');
          gradient.addColorStop(0.5, c + '33');
          gradient.addColorStop(0.8, c + '11');
          gradient.addColorStop(1, c + '00');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
          ctx.fill();
        });
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
    <div className="leaflet-control" style={{ position: 'absolute', right: 30, top: 'calc(30px * 2 + 64px + 48px)', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <button onClick={handleZoomIn}
        className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors active:scale-95"
        style={dimInStyle} title={atMaxZoom ? 'Maximum zoom reached' : 'Zoom in'}>
        <img src={zoomInIcon} alt="Zoom in" className="w-4 h-4" style={atMaxZoom ? { opacity: 0.3 } : {}} />
      </button>
      <button onClick={handleZoomOut}
        className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors active:scale-95"
        style={dimOutStyle} title={atMinZoom ? 'Area limit reached' : 'Zoom out'}>
        <img src={zoomOutIcon} alt="Zoom out" className="w-4 h-auto" style={atMinZoom ? { opacity: 0.3 } : {}} />
      </button>
      <button onClick={handleLocate}
        className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors active:scale-95"
        style={btnBase} title="Go to your location">
        <img src={recenterIcon} alt="Recenter" className="w-5 h-5" />
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
      return pins.filter((p) => p.category === 'request' && pinUrgency(p) >= 2);
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

        {/* Dark OSM tiles – free, no API key needed */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          opacity={streetOpacity}
          keepBuffer={6}
          className="dark-tiles-bg"
        />

        <TileLayer
          url="https://d17l30qqe4mnqp.cloudfront.net/overlays/1609Sat/tiles_60k_new/{z}/{x}/{y}.png"
          opacity={welikiaOpacity}
          maxZoom={16}
          minZoom={8}
          keepBuffer={6}
        />

        {showHeatmap && <HeatmapLayer pins={pins} zoom={zoom} />}

        <Marker position={YOU_LOCATION} icon={createYouIcon()} />

        {visiblePins.map((pin) => {
          const isDim = tier === 'all-pins' && pinUrgency(pin) <= 1;
          const isUrgent = pin.category === 'request' && pinUrgency(pin) >= 2;
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
        className="fixed z-30 text-muted-foreground/60"
        style={{ bottom: 30, left: 30, fontSize: '10px', fontFamily: "'Public Sans', sans-serif" }}
      >
        {streetOpacity > 0.2 && <span>Streets: <a href="https://carto.com" target="_blank" rel="noopener" className="underline hover:text-foreground/60">CARTO</a> / <a href="https://www.openstreetmap.org" target="_blank" rel="noopener" className="underline hover:text-foreground/60">OSM</a></span>}
        {streetOpacity > 0.2 && welikiaOpacity > 0 && <span className="mx-1">·</span>}
        {welikiaOpacity > 0 && <span>Ecology: <a href="https://welikia.org" target="_blank" rel="noopener" className="underline hover:text-foreground/60">Welikia Project</a></span>}
      </div>

      <RequestCityModal open={showRequestCity} onClose={() => setShowRequestCity(false)} />
    </div>
  );
}
