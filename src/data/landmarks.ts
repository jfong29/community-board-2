import { PinCategory } from './pins';

export interface Landmark {
  id: string;
  name: string;
  icon: string;
  x: number; // percent on welikia map
  y: number;
  lat: number; // real coordinates
  lng: number;
  pins: LandmarkPin[];
}

export interface LandmarkPin {
  category: PinCategory;
  title: string;
  description: string;
  subcategory: string;
  distance: string;
  postedBy: string;
}

export const landmarks: Landmark[] = [
  {
    id: 'union-sq',
    name: 'Union Square',
    icon: '🌳',
    x: 48,
    y: 42,
    lat: 40.7359,
    lng: -73.9911,
    pins: [
      { category: 'offer', title: 'Plant Water Available', description: 'Rain barrel reserves open for community garden irrigation.', subcategory: 'Water', distance: 'On site', postedBy: 'Garden Keeper' },
      { category: 'request', title: 'Volunteers Needed', description: 'Help maintain native plantings along the eastern beds.', subcategory: 'Labor', distance: 'On site', postedBy: 'Park Council' },
      { category: 'observation', title: 'Low Water Levels', description: 'Rainfall 40% below seasonal average. Soil moisture critically low.', subcategory: 'Water Quality', distance: 'On site', postedBy: 'Water Watcher' },
    ],
  },
  {
    id: 'central-park-south',
    name: 'Collect Pond',
    icon: '💧',
    x: 45,
    y: 28,
    lat: 40.7145,
    lng: -74.0015,
    pins: [
      { category: 'observation', title: 'Oyster Colony Expanding', description: 'New spat observed on restored reef structures.', subcategory: 'Water Quality', distance: 'On site', postedBy: 'Reef Monitor' },
      { category: 'event', title: 'Water Ceremony', description: 'Seasonal water blessing at the next full moon.', subcategory: 'Gathering', distance: 'On site', postedBy: 'Council' },
    ],
  },
  {
    id: 'tompkins',
    name: 'Tompkins Square',
    icon: '🐝',
    x: 62,
    y: 38,
    lat: 40.7265,
    lng: -73.9817,
    pins: [
      { category: 'offer', title: 'Native Seed Packets', description: 'Milkweed and aster seeds free for pollinator gardens.', subcategory: 'Seeds', distance: 'On site', postedBy: 'Pollinator Guild' },
      { category: 'observation', title: 'Monarch Sighting', description: 'First monarchs of the season spotted on milkweed.', subcategory: 'Pollinators', distance: 'On site', postedBy: 'Butterfly Watch' },
      { category: 'request', title: 'Bee Box Repair', description: 'Community hive needs structural repair before swarm season.', subcategory: 'Materials', distance: 'On site', postedBy: 'Bee Keeper' },
    ],
  },
  {
    id: 'battery-park',
    name: 'Kapsee Point',
    icon: '🦅',
    x: 30,
    y: 72,
    lat: 40.7033,
    lng: -74.0170,
    pins: [
      { category: 'observation', title: 'Osprey Nesting', description: 'Pair returned to the platform. Eggs expected within two weeks.', subcategory: 'Bird Migration', distance: 'On site', postedBy: 'Bird Watcher' },
      { category: 'event', title: 'Shoreline Assembly', description: 'Discuss tidal restoration and oyster reef expansion.', subcategory: 'Assembly', distance: 'On site', postedBy: 'Shore Council' },
    ],
  },
  {
    id: 'washington-sq',
    name: 'Minetta Brook',
    icon: '🌊',
    x: 42,
    y: 45,
    lat: 40.7308,
    lng: -73.9973,
    pins: [
      { category: 'observation', title: 'Spring Fed Active', description: 'Underground spring flow detected — seasonal indicator of healthy aquifer.' },
      { category: 'offer', title: 'Medicinal Herbs', description: 'Elderberry and yarrow surplus from the brook garden.' },
    ],
  },
];
