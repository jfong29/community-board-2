export type PinCategory = 'offer' | 'request' | 'signal' | 'event';

export interface Pin {
  id: string;
  category: PinCategory;
  title: string;
  description: string;
  subcategory: string;
  distance: string;
  postedBy: string;
  x: number; // percentage position on map
  y: number;
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
    category: 'signal',
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
    category: 'signal',
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
  signal: { label: 'Signal', color: 'text-signal', glowClass: 'glow-signal' },
  event: { label: 'Event', color: 'text-event', glowClass: 'glow-event' },
};
