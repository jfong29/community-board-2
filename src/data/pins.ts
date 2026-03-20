export type PinCategory = 'offer' | 'request' | 'observation' | 'event';

export interface Pin {
  id: string;
  category: PinCategory;
  title: string;
  description: string;
  subcategory: string;
  distance: string;
  postedBy: string;
  x: number;
  y: number;
  lat?: number;
  lng?: number;
}

// Convert lat/lng to Welikia map x/y percentages
export function latLngToXY(lat: number, lng: number): { x: number; y: number } {
  const y = ((40.75 - lat) / 0.06) * 100;
  const x = ((lng + 74.02) / 0.06) * 100;
  return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
}

// Convert Welikia map x/y to lat/lng
export function xyToLatLng(x: number, y: number): { lat: number; lng: number } {
  const lat = 40.75 - (y / 100) * 0.06;
  const lng = -74.02 + (x / 100) * 0.06;
  return { lat, lng };
}

export interface ObservationData {
  id: string;
  indicator: string;
  icon: string;
  status: 'healthy' | 'declining' | 'critical';
  value: number;
  maxValue: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
  observers: number;
  description: string;
}

export interface CommunityAction {
  id: string;
  type: 'vote' | 'event';
  title: string;
  description: string;
  relatedObservation: string;
  votes?: { yes: number; no: number };
  date?: string;
  participants?: number;
}

export const samplePins: Pin[] = [
  {
    id: '1',
    category: 'offer',
    title: 'Wild Persimmon Harvest',
    description: 'Abundance of ripe persimmons along the southern ridge. Come gather — more than enough for the watershed.',
    subcategory: 'Food',
    distance: '2 blocks',
    postedBy: 'River Keeper',
    x: 28,
    y: 35,
  },
  {
    id: '2',
    category: 'request',
    title: 'Need Cedar Bark for Weaving',
    description: 'Seeking sustainably harvested cedar bark strips for basket weaving. Teaching a youth workshop next moon cycle.',
    subcategory: 'Materials',
    distance: '5 blocks',
    postedBy: 'Basket Weaver',
    x: 55,
    y: 22,
  },
  {
    id: '3',
    category: 'observation',
    title: 'Fructicose Lichen Bloom',
    description: 'Dense fructicose lichen colonies emerging on old-growth oaks — indicating excellent air quality in this corridor.',
    subcategory: 'Air Quality',
    distance: '1 block',
    postedBy: 'Lichen Observer',
    x: 72,
    y: 58,
  },
  {
    id: '4',
    category: 'event',
    title: 'Watershed Assembly',
    description: 'Monthly gathering to discuss water stewardship, seasonal planting cycles, and shared resource allocation.',
    subcategory: 'Assembly',
    distance: '3 blocks',
    postedBy: 'Council',
    x: 40,
    y: 68,
  },
  {
    id: '5',
    category: 'offer',
    title: 'Surplus Hickory Nuts',
    description: 'Dried and shelled hickory nuts available at the eastern storehouse. First come, first served.',
    subcategory: 'Food',
    distance: '4 blocks',
    postedBy: 'Nut Gatherer',
    x: 82,
    y: 40,
  },
  {
    id: '6',
    category: 'observation',
    title: 'Stream Clarity Rising',
    description: 'Macroinvertebrate diversity increasing in the north brook — water quality improving after last season\'s restoration.',
    subcategory: 'Water Quality',
    distance: '6 blocks',
    postedBy: 'Water Watcher',
    x: 18,
    y: 15,
  },
  {
    id: '7',
    category: 'event',
    title: 'Seed Exchange Circle',
    description: 'Bring your saved seeds for the seasonal exchange. Focus on drought-resistant varieties this cycle.',
    subcategory: 'Gathering',
    distance: '2 blocks',
    postedBy: 'Seed Keeper',
    x: 62,
    y: 78,
  },
  {
    id: '8',
    category: 'request',
    title: 'Clay for Pottery Workshop',
    description: 'Seeking riverbank clay deposits for an upcoming ceramics teaching. Any leads on clean sources appreciated.',
    subcategory: 'Materials',
    distance: '3 blocks',
    postedBy: 'Clay Worker',
    x: 35,
    y: 50,
  },
];

export const categoryConfig: Record<PinCategory, { label: string; color: string; glowClass: string }> = {
  offer: { label: 'Offer', color: 'text-offer', glowClass: 'glow-offer' },
  request: { label: 'Request', color: 'text-request', glowClass: 'glow-request' },
  observation: { label: 'Observation', color: 'text-observation', glowClass: 'glow-observation' },
  event: { label: 'Event', color: 'text-event', glowClass: 'glow-event' },
};

export const observationData: ObservationData[] = [
  {
    id: 'obs-1',
    indicator: 'Air Quality',
    icon: '🍃',
    status: 'healthy',
    value: 82,
    maxValue: 100,
    trend: 'up',
    lastUpdated: '2h ago',
    observers: 14,
    description: 'Fructicose lichens thriving on old-growth bark. Strong indicator of clean air corridors.',
  },
  {
    id: 'obs-2',
    indicator: 'Water Clarity',
    icon: '💧',
    status: 'healthy',
    value: 71,
    maxValue: 100,
    trend: 'up',
    lastUpdated: '4h ago',
    observers: 8,
    description: 'Oyster beds expanding downstream. Macroinvertebrate diversity increasing steadily.',
  },
  {
    id: 'obs-3',
    indicator: 'Pollinators',
    icon: '🐝',
    status: 'declining',
    value: 38,
    maxValue: 100,
    trend: 'down',
    lastUpdated: '1h ago',
    observers: 22,
    description: 'Bee sightings down 30% from last moon cycle. Native wildflower corridors thinning.',
  },
  {
    id: 'obs-4',
    indicator: 'Seasonal Bloom',
    icon: '🌸',
    status: 'healthy',
    value: 65,
    maxValue: 100,
    trend: 'stable',
    lastUpdated: '6h ago',
    observers: 11,
    description: 'Dogwood flowering early — signals warm current arriving sooner this cycle.',
  },
  {
    id: 'obs-5',
    indicator: 'Soil Health',
    icon: '🪱',
    status: 'critical',
    value: 24,
    maxValue: 100,
    trend: 'down',
    lastUpdated: '3h ago',
    observers: 6,
    description: 'Earthworm counts dropping in eastern plots. Compaction from recent foot traffic.',
  },
  {
    id: 'obs-6',
    indicator: 'Bird Migration',
    icon: '🦅',
    status: 'healthy',
    value: 88,
    maxValue: 100,
    trend: 'up',
    lastUpdated: '5h ago',
    observers: 19,
    description: 'Osprey returned on schedule. Nesting pairs up from last season.',
  },
];

export const communityActions: CommunityAction[] = [
  {
    id: 'act-1',
    type: 'event',
    title: 'Plant Native Wildflowers',
    description: 'Pollinator corridors need restoration. Community planting along the western ridge.',
    relatedObservation: 'Pollinators',
    date: 'Next new moon',
    participants: 34,
  },
  {
    id: 'act-2',
    type: 'vote',
    title: 'Restrict Eastern Trail Access',
    description: 'Soil compaction harming earthworm populations. Vote to redirect foot traffic.',
    relatedObservation: 'Soil Health',
    votes: { yes: 67, no: 12 },
  },
  {
    id: 'act-3',
    type: 'event',
    title: 'Oyster Bed Monitoring',
    description: 'Volunteer to count and map expanding oyster colonies downstream.',
    relatedObservation: 'Water Clarity',
    date: 'This quarter moon',
    participants: 9,
  },
];
