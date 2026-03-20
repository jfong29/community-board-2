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
  urgency?: 'critical' | 'high' | 'medium' | 'low';
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
  // ── Union Square area ──
  // SW corner — gatherings & events
  { id: 'usq-1', category: 'event', title: 'Watershed Assembly', description: 'Monthly gathering to discuss water stewardship and shared resources.', subcategory: 'Assembly', distance: 'On site', postedBy: 'Council', x: 48, y: 42, lat: 40.7352, lng: -73.9918, urgency: 'high' },
  { id: 'usq-2', category: 'event', title: 'Seed Exchange Circle', description: 'Bring saved seeds for the seasonal exchange. Focus on drought-resistant varieties.', subcategory: 'Gathering', distance: 'On site', postedBy: 'Seed Keeper', x: 48, y: 43, lat: 40.7348, lng: -73.9920, urgency: 'medium' },
  // N side — offers (greenmarket)
  { id: 'usq-3', category: 'offer', title: 'Wild Persimmon Harvest', description: 'Abundance of ripe persimmons. Come gather — more than enough for the watershed.', subcategory: 'Food', distance: 'On site', postedBy: 'River Keeper', x: 48, y: 41, lat: 40.7368, lng: -73.9903, urgency: 'low' },
  { id: 'usq-4', category: 'offer', title: 'Surplus Hickory Nuts', description: 'Dried and shelled hickory nuts at the greenmarket tent.', subcategory: 'Food', distance: 'On site', postedBy: 'Nut Gatherer', x: 49, y: 41, lat: 40.7370, lng: -73.9899, urgency: 'low' },
  { id: 'usq-5', category: 'request', title: 'Volunteers Needed', description: 'Help maintain native plantings along the eastern beds.', subcategory: 'Labor', distance: 'On site', postedBy: 'Park Council', x: 49, y: 42, lat: 40.7362, lng: -73.9905, urgency: 'high' },
  { id: 'usq-6', category: 'observation', title: 'Low Water Levels', description: 'Rainfall 40% below seasonal average. Soil moisture critically low.', subcategory: 'Water Quality', distance: 'On site', postedBy: 'Water Watcher', x: 48, y: 42, lat: 40.7355, lng: -73.9915, urgency: 'critical' },

  // ── Tompkins Square ──
  { id: 'tomp-1', category: 'offer', title: 'Native Seed Packets', description: 'Milkweed and aster seeds free for pollinator gardens.', subcategory: 'Seeds', distance: 'On site', postedBy: 'Pollinator Guild', x: 62, y: 38, lat: 40.7268, lng: -73.9815, urgency: 'low' },
  { id: 'tomp-2', category: 'observation', title: 'Monarch Sighting', description: 'First monarchs of the season spotted on milkweed.', subcategory: 'Pollinators', distance: 'On site', postedBy: 'Butterfly Watch', x: 63, y: 38, lat: 40.7262, lng: -73.9822, urgency: 'medium' },
  { id: 'tomp-3', category: 'request', title: 'Bee Box Repair', description: 'Community hive needs structural repair before swarm season.', subcategory: 'Materials', distance: 'On site', postedBy: 'Bee Keeper', x: 62, y: 39, lat: 40.7260, lng: -73.9810, urgency: 'high' },
  { id: 'tomp-4', category: 'event', title: 'Punk Rock Seed Swap', description: 'Music and seed trading at the bandshell. All ages welcome.', subcategory: 'Gathering', distance: 'On site', postedBy: 'Tompkins Crew', x: 63, y: 39, lat: 40.7258, lng: -73.9818, urgency: 'low' },

  // ── Washington Square / Minetta Brook ──
  { id: 'wash-1', category: 'observation', title: 'Spring Fed Active', description: 'Underground spring flow detected — seasonal indicator of healthy aquifer.', subcategory: 'Water Quality', distance: 'On site', postedBy: 'Aquifer Monitor', x: 42, y: 45, lat: 40.7308, lng: -73.9973, urgency: 'medium' },
  { id: 'wash-2', category: 'offer', title: 'Medicinal Herbs', description: 'Elderberry and yarrow surplus from the brook garden.', subcategory: 'Medicine', distance: 'On site', postedBy: 'Herbalist', x: 42, y: 44, lat: 40.7312, lng: -73.9975, urgency: 'low' },
  { id: 'wash-3', category: 'event', title: 'Jazz in the Square', description: 'Weekly acoustic gathering under the arch. Bring instruments.', subcategory: 'Gathering', distance: 'On site', postedBy: 'Music Circle', x: 41, y: 44, lat: 40.7310, lng: -73.9980, urgency: 'low' },

  // ── Collect Pond / Foley Square ──
  { id: 'col-1', category: 'observation', title: 'Oyster Colony Expanding', description: 'New spat observed on restored reef structures.', subcategory: 'Water Quality', distance: 'On site', postedBy: 'Reef Monitor', x: 45, y: 28, lat: 40.7148, lng: -74.0012, urgency: 'medium' },
  { id: 'col-2', category: 'event', title: 'Water Ceremony', description: 'Seasonal water blessing at the next full moon.', subcategory: 'Gathering', distance: 'On site', postedBy: 'Council', x: 45, y: 29, lat: 40.7142, lng: -74.0018, urgency: 'high' },
  { id: 'col-3', category: 'request', title: 'Clay for Pottery', description: 'Seeking riverbank clay for an upcoming ceramics teaching.', subcategory: 'Materials', distance: 'On site', postedBy: 'Clay Worker', x: 44, y: 28, lat: 40.7145, lng: -74.0020, urgency: 'low' },

  // ── Battery Park / Kapsee Point ──
  { id: 'bat-1', category: 'observation', title: 'Osprey Nesting', description: 'Pair returned to the platform. Eggs expected within two weeks.', subcategory: 'Bird Migration', distance: 'On site', postedBy: 'Bird Watcher', x: 30, y: 72, lat: 40.7035, lng: -74.0168, urgency: 'medium' },
  { id: 'bat-2', category: 'event', title: 'Shoreline Assembly', description: 'Discuss tidal restoration and oyster reef expansion.', subcategory: 'Assembly', distance: 'On site', postedBy: 'Shore Council', x: 31, y: 72, lat: 40.7030, lng: -74.0175, urgency: 'high' },
  { id: 'bat-3', category: 'offer', title: 'Fresh Fish Share', description: 'Morning catch surplus — striped bass and bluefish. Come by the south pier.', subcategory: 'Food', distance: 'South pier', postedBy: 'Harbor Fisher', x: 30, y: 73, lat: 40.7025, lng: -74.0172, urgency: 'medium' },

  // ── Central Park / Seneca Village ──
  { id: 'cp-1', category: 'observation', title: 'Old-Growth Canopy', description: 'Tulip trees in the North Woods estimated at 150+ years.', subcategory: 'Forest Health', distance: 'North Woods', postedBy: 'Tree Census', x: 40, y: 20, lat: 40.7815, lng: -73.9662, urgency: 'low' },
  { id: 'cp-2', category: 'event', title: 'Remembrance Walk', description: 'Guided walk through the former Seneca Village site.', subcategory: 'Gathering', distance: 'On site', postedBy: 'History Circle', x: 41, y: 20, lat: 40.7808, lng: -73.9670, urgency: 'medium' },
  { id: 'cp-3', category: 'request', title: 'Trail Restoration Help', description: 'Erosion along the Loch needs volunteer stone-setters.', subcategory: 'Labor', distance: 'The Loch', postedBy: 'Park Stewards', x: 39, y: 19, lat: 40.7820, lng: -73.9658, urgency: 'high' },
  { id: 'cp-4', category: 'offer', title: 'Foraged Mushrooms', description: 'Chicken-of-the-woods found near the Great Hill. Sharing at the boathouse.', subcategory: 'Food', distance: 'Great Hill', postedBy: 'Forager', x: 40, y: 19, lat: 40.7830, lng: -73.9665, urgency: 'low' },

  // ── High Line ──
  { id: 'hl-1', category: 'observation', title: 'Pollinator Corridor', description: 'Over 30 species of native bees documented along the northern section.', subcategory: 'Pollinators', distance: 'On site', postedBy: 'Bee Survey', x: 32, y: 35, lat: 40.7482, lng: -74.0045, urgency: 'low' },
  { id: 'hl-2', category: 'offer', title: 'Free Seedlings', description: 'Native perennial seedlings from the High Line nursery.', subcategory: 'Seeds', distance: 'Gansevoort end', postedBy: 'Nursery Crew', x: 32, y: 36, lat: 40.7395, lng: -74.0082, urgency: 'low' },
  { id: 'hl-3', category: 'request', title: 'Bench Repair Wood', description: 'Reclaimed wood needed to fix seating along the Chelsea section.', subcategory: 'Materials', distance: 'Chelsea', postedBy: 'High Line Friends', x: 33, y: 35, lat: 40.7470, lng: -74.0050, urgency: 'medium' },

  // ── Inwood / Shorakapkok ──
  { id: 'inw-1', category: 'observation', title: 'Salt Marsh Health', description: 'Spartina grass expanding after tidal gate restoration.', subcategory: 'Wetlands', distance: 'On site', postedBy: 'Marsh Monitor', x: 30, y: 5, lat: 40.8688, lng: -73.9248, urgency: 'medium' },
  { id: 'inw-2', category: 'offer', title: 'Guided Forest Walk', description: 'Free walk through the last old-growth forest. Meet at the tulip tree.', subcategory: 'Education', distance: 'On site', postedBy: 'Inwood Naturalists', x: 31, y: 5, lat: 40.8682, lng: -73.9240, urgency: 'low' },
  { id: 'inw-3', category: 'event', title: 'Full Moon Drum Circle', description: 'Monthly gathering at Shorakkopoch Rock. All are welcome.', subcategory: 'Gathering', distance: 'On site', postedBy: 'Inwood Circle', x: 30, y: 6, lat: 40.8678, lng: -73.9252, urgency: 'low' },

  // ── Prospect Park ──
  { id: 'pp-1', category: 'observation', title: 'Great Blue Heron', description: 'Breeding pair confirmed at the lake for third consecutive year.', subcategory: 'Bird Migration', distance: 'Prospect Lake', postedBy: 'Birder Network', x: 50, y: 90, lat: 40.6605, lng: -73.9688, urgency: 'medium' },
  { id: 'pp-2', category: 'event', title: 'Ravine Restoration Day', description: 'Help clear invasive plants from the forest understory.', subcategory: 'Gathering', distance: 'The Ravine', postedBy: 'Park Alliance', x: 51, y: 89, lat: 40.6620, lng: -73.9695, urgency: 'high' },
  { id: 'pp-3', category: 'request', title: 'Canoe Repair', description: 'Community fishing canoe needs hull patching before spring.', subcategory: 'Materials', distance: 'Boathouse', postedBy: 'Lake Stewards', x: 49, y: 90, lat: 40.6595, lng: -73.9700, urgency: 'medium' },
  { id: 'pp-4', category: 'offer', title: 'Wildflower Bouquets', description: 'Sustainably gathered from the meadow. Free at the boathouse entrance.', subcategory: 'Food', distance: 'Boathouse', postedBy: 'Meadow Crew', x: 50, y: 91, lat: 40.6590, lng: -73.9685, urgency: 'low' },

  // ── Gowanus Canal ──
  { id: 'gow-1', category: 'observation', title: 'Water Oxygen Rising', description: 'Dissolved oxygen at 4.2 mg/L — highest in 50 years.', subcategory: 'Water Quality', distance: 'On site', postedBy: 'Canal Monitor', x: 40, y: 85, lat: 40.6740, lng: -73.9882, urgency: 'high' },
  { id: 'gow-2', category: 'request', title: 'Rain Garden Volunteers', description: 'Sponge Park needs planting to expand bioswale capacity.', subcategory: 'Labor', distance: '2nd St Bridge', postedBy: 'Conservancy', x: 41, y: 85, lat: 40.6735, lng: -73.9890, urgency: 'critical' },

  // ── Brooklyn Bridge Park ──
  { id: 'bbp-1', category: 'observation', title: 'Salt Marsh Colonization', description: 'Fiddler crab burrows tripled since last year at Pier 1.', subcategory: 'Wetlands', distance: 'Pier 1', postedBy: 'Marsh Watch', x: 42, y: 75, lat: 40.6985, lng: -73.9968, urgency: 'low' },
  { id: 'bbp-2', category: 'offer', title: 'Free Kayak Access', description: 'Paddle the East River, no experience needed.', subcategory: 'Recreation', distance: 'Pier 2', postedBy: 'Boathouse', x: 43, y: 75, lat: 40.6980, lng: -73.9975, urgency: 'low' },

  // ── Governors Island / Pagganck ──
  { id: 'gov-1', category: 'observation', title: 'Meadow Self-Sustaining', description: 'Native prairie grasses seeded 2 years ago now thriving.', subcategory: 'Forest Health', distance: 'The Hills', postedBy: 'Island Ecologist', x: 35, y: 68, lat: 40.6894, lng: -74.0165, urgency: 'low' },
  { id: 'gov-2', category: 'event', title: 'Island Gathering', description: 'Monthly community assembly on the south lawn.', subcategory: 'Assembly', distance: 'South Lawn', postedBy: 'Island Council', x: 35, y: 69, lat: 40.6888, lng: -74.0170, urgency: 'medium' },

  // ── Flushing Meadows ──
  { id: 'fm-1', category: 'observation', title: 'Night Heron Colony', description: '40+ black-crowned night herons roosting at Willow Lake at dusk.', subcategory: 'Bird Migration', distance: 'Willow Lake', postedBy: 'Queens Birders', x: 85, y: 30, lat: 40.7465, lng: -73.8445, urgency: 'medium' },
  { id: 'fm-2', category: 'event', title: 'Meadow Restoration', description: 'Planting native grasses to rebuild original tidal meadow.', subcategory: 'Gathering', distance: 'North Meadow', postedBy: 'Parks Dept', x: 85, y: 31, lat: 40.7458, lng: -73.8452, urgency: 'high' },
  { id: 'fm-3', category: 'offer', title: 'Cricket Equipment', description: 'Surplus bats and balls available at the south field house.', subcategory: 'Recreation', distance: 'South Field', postedBy: 'Cricket Club', x: 86, y: 30, lat: 40.7460, lng: -73.8440, urgency: 'low' },

  // ── Pelham Bay / Siwanoy Shores ──
  { id: 'pb-1', category: 'observation', title: 'Diamondback Terrapin', description: 'Nesting females on the causeway — endangered species recovery.', subcategory: 'Marine Life', distance: 'Hunter Island', postedBy: 'Reptile Survey', x: 80, y: 5, lat: 40.8716, lng: -73.8095, urgency: 'critical' },
  { id: 'pb-2', category: 'offer', title: 'Fishing Gear Exchange', description: 'Surplus rods and tackle at the boathouse.', subcategory: 'Materials', distance: 'Orchard Beach', postedBy: 'Anglers Guild', x: 81, y: 5, lat: 40.8710, lng: -73.8100, urgency: 'low' },

  // ── Bronx River / Aquehung ──
  { id: 'br-1', category: 'observation', title: 'Alewife Run', description: 'Herring migration in progress — thousands passing the fish ladder.', subcategory: 'Water Quality', distance: 'Bronx Zoo area', postedBy: 'River Alliance', x: 72, y: 8, lat: 40.8562, lng: -73.8788, urgency: 'high' },
  { id: 'br-2', category: 'event', title: 'River Paddle', description: 'Free guided canoe trip from Shoelace Park to Starlight Park.', subcategory: 'Gathering', distance: 'Shoelace Park', postedBy: 'Paddle Crew', x: 73, y: 8, lat: 40.8555, lng: -73.8795, urgency: 'medium' },

  // ── Jamaica Bay ──
  { id: 'jb-1', category: 'observation', title: 'Horseshoe Crab Spawning', description: 'Peak spawning on Plumb Beach. Thousands mating at high tide.', subcategory: 'Marine Life', distance: 'Plumb Beach', postedBy: 'Bay Monitor', x: 75, y: 95, lat: 40.6172, lng: -73.8250, urgency: 'high' },
  { id: 'jb-2', category: 'request', title: 'Beach Cleanup Crew', description: 'Plastic debris on Dead Horse Bay. Volunteers needed.', subcategory: 'Labor', distance: 'Dead Horse Bay', postedBy: 'Bay Guardians', x: 76, y: 95, lat: 40.6168, lng: -73.8258, urgency: 'critical' },

  // ── East Village / LES scattered ──
  { id: 'ev-1', category: 'offer', title: 'Rooftop Honey', description: 'Spring harvest from our East Village hives. Jars at the community fridge.', subcategory: 'Food', distance: '2 blocks', postedBy: 'Roof Bees', x: 60, y: 40, lat: 40.7245, lng: -73.9830, urgency: 'low' },
  { id: 'ev-2', category: 'request', title: 'Compost Pickup', description: 'Building has 20 gallons of kitchen scraps. Need a bike pickup.', subcategory: 'Materials', distance: '1 block', postedBy: 'Green Tenants', x: 58, y: 42, lat: 40.7240, lng: -73.9845, urgency: 'medium' },
  { id: 'les-1', category: 'event', title: 'Community Garden Potluck', description: 'Harvest dinner at the Liz Christy Garden. Bring a dish to share.', subcategory: 'Gathering', distance: '3 blocks', postedBy: 'Garden Collective', x: 55, y: 38, lat: 40.7240, lng: -73.9900, urgency: 'low' },

  // ── Chinatown / Canal St area ──
  { id: 'chi-1', category: 'offer', title: 'Dried Medicinal Roots', description: 'Surplus astragalus and ginseng from the herbalist cooperative.', subcategory: 'Medicine', distance: 'Canal St', postedBy: 'Herb Co-op', x: 48, y: 32, lat: 40.7185, lng: -73.9975, urgency: 'low' },
  { id: 'chi-2', category: 'observation', title: 'Rat Activity Increase', description: 'Burrows proliferating near the old canal. Composting attracting them.', subcategory: 'Urban Wildlife', distance: 'Canal St', postedBy: 'Block Watch', x: 47, y: 33, lat: 40.7180, lng: -73.9980, urgency: 'critical' },

  // ── Midtown scattered ──
  { id: 'mid-1', category: 'request', title: 'Green Roof Materials', description: 'Seeking lightweight soil mix and sedum trays for a rooftop garden.', subcategory: 'Materials', distance: 'Hell\'s Kitchen', postedBy: 'Roof Growers', x: 38, y: 28, lat: 40.7590, lng: -73.9935, urgency: 'medium' },
  { id: 'mid-2', category: 'observation', title: 'Peregrine Falcon Nest', description: 'Active nest on the MetLife building. 3 chicks visible from street level.', subcategory: 'Bird Migration', distance: 'Grand Central', postedBy: 'Raptor Watch', x: 45, y: 30, lat: 40.7527, lng: -73.9772, urgency: 'medium' },

  // ── Harlem ──
  { id: 'har-1', category: 'event', title: 'Marcus Garvey Park Drum Circle', description: 'Saturday afternoon drums at the fire tower. Bring percussion.', subcategory: 'Gathering', distance: 'On site', postedBy: 'Harlem Drummers', x: 50, y: 15, lat: 40.8043, lng: -73.9431, urgency: 'low' },
  { id: 'har-2', category: 'offer', title: 'Community Fridge Restock', description: 'Fresh produce donated from the Frederick Douglass Blvd market.', subcategory: 'Food', distance: '125th St', postedBy: 'Fridge Keepers', x: 48, y: 14, lat: 40.8085, lng: -73.9510, urgency: 'high' },
  { id: 'har-3', category: 'request', title: 'Mural Paint Supplies', description: 'Looking for exterior-grade paint for a building mural project.', subcategory: 'Materials', distance: '135th St', postedBy: 'Art Collective', x: 47, y: 13, lat: 40.8145, lng: -73.9465, urgency: 'low' },

  // ── Williamsburg / Greenpoint ──
  { id: 'wburg-1', category: 'offer', title: 'Bike Parts Surplus', description: 'Tubes, tires, and brake pads free at the community bike shop.', subcategory: 'Materials', distance: 'Bedford Ave', postedBy: 'Bike Kitchen', x: 62, y: 58, lat: 40.7142, lng: -73.9610, urgency: 'low' },
  { id: 'wburg-2', category: 'observation', title: 'Newtown Creek Cleanup', description: 'Water clarity improving after the latest remediation phase.', subcategory: 'Water Quality', distance: 'Newtown Creek', postedBy: 'Creek Watch', x: 65, y: 52, lat: 40.7230, lng: -73.9520, urgency: 'medium' },
  { id: 'gp-1', category: 'request', title: 'Mushroom Substrate', description: 'Need spent coffee grounds for oyster mushroom cultivation.', subcategory: 'Materials', distance: 'Greenpoint', postedBy: 'Fungi Lab', x: 63, y: 48, lat: 40.7305, lng: -73.9545, urgency: 'low' },

  // ── Red Hook ──
  { id: 'rh-1', category: 'offer', title: 'Fresh Oysters', description: 'Harvest from the Red Hook reef restoration. Limited quantity.', subcategory: 'Food', distance: 'Pier 44', postedBy: 'Reef Farmers', x: 38, y: 82, lat: 40.6760, lng: -74.0060, urgency: 'medium' },
  { id: 'rh-2', category: 'observation', title: 'Flood Resilience Test', description: 'Bioswale performance after last storm — 95% runoff captured.', subcategory: 'Water Quality', distance: 'Van Brunt St', postedBy: 'Resilience Lab', x: 37, y: 83, lat: 40.6748, lng: -74.0068, urgency: 'low' },

  // ── Astoria / Long Island City ──
  { id: 'ast-1', category: 'event', title: 'Socrates Park Assembly', description: 'Community forum on waterfront access and park stewardship.', subcategory: 'Assembly', distance: 'Socrates Park', postedBy: 'Park Collective', x: 65, y: 22, lat: 40.7695, lng: -73.9380, urgency: 'high' },
  { id: 'lic-1', category: 'observation', title: 'Cormorant Colony', description: 'Nesting colony on old pier pilings. 20+ nests active.', subcategory: 'Bird Migration', distance: 'Gantry Park', postedBy: 'LIC Birders', x: 60, y: 30, lat: 40.7485, lng: -73.9590, urgency: 'low' },
];

export const categoryConfig: Record<PinCategory, { label: string; color: string; glowClass: string }> = {
  offer: { label: 'Offer', color: 'text-offer', glowClass: 'glow-offer' },
  request: { label: 'Request', color: 'text-request', glowClass: 'glow-request' },
  observation: { label: 'Observation', color: 'text-observation', glowClass: 'glow-observation' },
  event: { label: 'Event', color: 'text-event', glowClass: 'glow-event' },
};

export const observationData: ObservationData[] = [
  { id: 'obs-1', indicator: 'Air Quality', icon: '🍃', status: 'healthy', value: 82, maxValue: 100, trend: 'up', lastUpdated: '2h ago', observers: 14, description: 'Fructicose lichens thriving on old-growth bark. Strong indicator of clean air corridors.' },
  { id: 'obs-2', indicator: 'Water Clarity', icon: '💧', status: 'healthy', value: 71, maxValue: 100, trend: 'up', lastUpdated: '4h ago', observers: 8, description: 'Oyster beds expanding downstream. Macroinvertebrate diversity increasing steadily.' },
  { id: 'obs-3', indicator: 'Pollinators', icon: '🐝', status: 'declining', value: 38, maxValue: 100, trend: 'down', lastUpdated: '1h ago', observers: 22, description: 'Bee sightings down 30% from last moon cycle. Native wildflower corridors thinning.' },
  { id: 'obs-4', indicator: 'Seasonal Bloom', icon: '🌸', status: 'healthy', value: 65, maxValue: 100, trend: 'stable', lastUpdated: '6h ago', observers: 11, description: 'Dogwood flowering early — signals warm current arriving sooner this cycle.' },
  { id: 'obs-5', indicator: 'Soil Health', icon: '🪱', status: 'critical', value: 24, maxValue: 100, trend: 'down', lastUpdated: '3h ago', observers: 6, description: 'Earthworm counts dropping in eastern plots. Compaction from recent foot traffic.' },
  { id: 'obs-6', indicator: 'Bird Migration', icon: '🦅', status: 'healthy', value: 88, maxValue: 100, trend: 'up', lastUpdated: '5h ago', observers: 19, description: 'Osprey returned on schedule. Nesting pairs up from last season.' },
];

export const communityActions: CommunityAction[] = [
  { id: 'act-1', type: 'event', title: 'Plant Native Wildflowers', description: 'Pollinator corridors need restoration. Community planting along the western ridge.', relatedObservation: 'Pollinators', date: 'Next new moon', participants: 34 },
  { id: 'act-2', type: 'vote', title: 'Restrict Eastern Trail Access', description: 'Soil compaction harming earthworm populations. Vote to redirect foot traffic.', relatedObservation: 'Soil Health', votes: { yes: 67, no: 12 } },
  { id: 'act-3', type: 'event', title: 'Oyster Bed Monitoring', description: 'Volunteer to count and map expanding oyster colonies downstream.', relatedObservation: 'Water Clarity', date: 'This quarter moon', participants: 9 },
];
