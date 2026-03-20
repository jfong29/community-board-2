import { PinCategory } from './pins';

export interface Landmark {
  id: string;
  name: string;
  icon: string;
  x: number;
  y: number;
  lat: number;
  lng: number;
  description?: string;
  source?: string;
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
  // ── Manhattan ──
  {
    id: 'union-sq',
    name: 'Union Square',
    icon: '🌳',
    x: 48, y: 42,
    lat: 40.7359, lng: -73.9911,
    description: 'Once a wetland at the confluence of two Lenape trails. The square became a public gathering space in 1839. Today it hosts the city\'s largest greenmarket and remains a center of political assembly.',
    source: 'NYC Parks; Sanderson, Mannahatta (2009)',
    pins: [
      { category: 'offer', title: 'Plant Water Available', description: 'Rain barrel reserves open for community garden irrigation.', subcategory: 'Water', distance: 'On site', postedBy: 'Garden Keeper' },
      { category: 'request', title: 'Volunteers Needed', description: 'Help maintain native plantings along the eastern beds.', subcategory: 'Labor', distance: 'On site', postedBy: 'Park Council' },
      { category: 'observation', title: 'Low Water Levels', description: 'Rainfall 40% below seasonal average. Soil moisture critically low.', subcategory: 'Water Quality', distance: 'On site', postedBy: 'Water Watcher' },
    ],
  },
  {
    id: 'collect-pond',
    name: 'Collect Pond',
    icon: '💧',
    x: 45, y: 28,
    lat: 40.7145, lng: -74.0015,
    description: 'Kalch-Hook, a 60-foot-deep spring-fed freshwater pond — the primary water source for lower Manahatta. Filled in by 1817, it now lies beneath Foley Square and the courthouses. In a restored future, the pond reemerges as a living water commons.',
    source: 'Wikipedia: Collect Pond; Welikia Project',
    pins: [
      { category: 'observation', title: 'Oyster Colony Expanding', description: 'New spat observed on restored reef structures.', subcategory: 'Water Quality', distance: 'On site', postedBy: 'Reef Monitor' },
      { category: 'event', title: 'Water Ceremony', description: 'Seasonal water blessing at the next full moon.', subcategory: 'Gathering', distance: 'On site', postedBy: 'Council' },
    ],
  },
  {
    id: 'tompkins',
    name: 'Tompkins Square',
    icon: '🐝',
    x: 62, y: 38,
    lat: 40.7265, lng: -73.9817,
    description: 'A 10.5-acre park in the East Village, formerly salt marsh along the East River. Named after Daniel D. Tompkins. Known for its community gardens, the Hare Krishna tree, and the 1988 riots against gentrification.',
    source: 'NYC Parks; Wikipedia',
    pins: [
      { category: 'offer', title: 'Native Seed Packets', description: 'Milkweed and aster seeds free for pollinator gardens.', subcategory: 'Seeds', distance: 'On site', postedBy: 'Pollinator Guild' },
      { category: 'observation', title: 'Monarch Sighting', description: 'First monarchs of the season spotted on milkweed.', subcategory: 'Pollinators', distance: 'On site', postedBy: 'Butterfly Watch' },
      { category: 'request', title: 'Bee Box Repair', description: 'Community hive needs structural repair before swarm season.', subcategory: 'Materials', distance: 'On site', postedBy: 'Bee Keeper' },
    ],
  },
  {
    id: 'kapsee-point',
    name: 'Kapsee Point',
    icon: '🦅',
    x: 30, y: 72,
    lat: 40.7033, lng: -74.0170,
    description: 'The rocky southern tip of Manahatta, meaning "rocky ledge" in Lenape. Once lined with oyster beds and tidal marshes, it was a key trading post. Today it is Battery Park — the departure point for the Statue of Liberty ferries.',
    source: 'Welikia Project; Sanderson, Mannahatta (2009)',
    pins: [
      { category: 'observation', title: 'Osprey Nesting', description: 'Pair returned to the platform. Eggs expected within two weeks.', subcategory: 'Bird Migration', distance: 'On site', postedBy: 'Bird Watcher' },
      { category: 'event', title: 'Shoreline Assembly', description: 'Discuss tidal restoration and oyster reef expansion.', subcategory: 'Assembly', distance: 'On site', postedBy: 'Shore Council' },
    ],
  },
  {
    id: 'minetta-brook',
    name: 'Minetta Brook',
    icon: '🌊',
    x: 42, y: 45,
    lat: 40.7308, lng: -73.9973,
    description: 'A freshwater stream that still flows underground through Greenwich Village. It fed the Lenape campsite where Washington Square Park now sits. Basements along Minetta Lane still flood — the brook remembers its path.',
    source: 'Wikipedia: Minetta Brook',
    pins: [
      { category: 'observation', title: 'Spring Fed Active', description: 'Underground spring flow detected — seasonal indicator of healthy aquifer.', subcategory: 'Water Quality', distance: 'On site', postedBy: 'Aquifer Monitor' },
      { category: 'offer', title: 'Medicinal Herbs', description: 'Elderberry and yarrow surplus from the brook garden.', subcategory: 'Medicine', distance: 'On site', postedBy: 'Herbalist' },
    ],
  },
  {
    id: 'central-park',
    name: 'Seneca Village',
    icon: '🏘️',
    x: 40, y: 20,
    lat: 40.7812, lng: -73.9665,
    description: 'A thriving community of African American, Irish, and German residents established in 1825. It was demolished in 1857 to build Central Park. Over 250 people were displaced. Archaeological digs have uncovered building foundations and personal artifacts.',
    source: 'Wikipedia: Seneca Village; Central Park Conservancy',
    pins: [
      { category: 'observation', title: 'Old-Growth Canopy', description: 'Tulip trees in the North Woods estimated at 150+ years — among Manhattan\'s oldest living organisms.', subcategory: 'Forest Health', distance: 'North Woods', postedBy: 'Tree Census' },
      { category: 'event', title: 'Remembrance Walk', description: 'Guided walk through the former Seneca Village site.', subcategory: 'Gathering', distance: 'On site', postedBy: 'History Circle' },
      { category: 'request', title: 'Trail Restoration Help', description: 'Erosion along the Loch needs volunteer stone-setters.', subcategory: 'Labor', distance: 'The Loch', postedBy: 'Park Stewards' },
    ],
  },
  {
    id: 'inwood-hill',
    name: 'Shorakapkok',
    icon: '🌲',
    x: 30, y: 5,
    lat: 40.8686, lng: -73.9246,
    description: 'The last natural forest and salt marsh on Manhattan island. Traditionally cited as where Peter Minuit "purchased" Manhattan from the Lenape in 1626. Inwood Hill Park contains tulip trees over 200 years old and the Shorakkopoch rock.',
    source: 'Wikipedia: Inwood; Welikia Project',
    pins: [
      { category: 'observation', title: 'Salt Marsh Health', description: 'Spartina grass coverage expanding after 3 years of tidal gate restoration.', subcategory: 'Wetlands', distance: 'On site', postedBy: 'Marsh Monitor' },
      { category: 'offer', title: 'Guided Forest Walk', description: 'Free walk through the last old-growth forest. Meet at the tulip tree.', subcategory: 'Education', distance: 'On site', postedBy: 'Inwood Naturalists' },
    ],
  },
  {
    id: 'highline',
    name: 'The High Line',
    icon: '🌿',
    x: 32, y: 35,
    lat: 40.7480, lng: -74.0048,
    description: 'An elevated freight rail line built in 1934, abandoned in 1980, and reopened in 2009 as a 1.45-mile-long park. The wildflowers that grew during abandonment inspired the garden design — a case study in ecological succession on infrastructure.',
    source: 'Friends of the High Line',
    pins: [
      { category: 'observation', title: 'Pollinator Corridor Active', description: 'Over 30 species of native bees documented along the northern section this season.', subcategory: 'Pollinators', distance: 'On site', postedBy: 'Bee Survey' },
      { category: 'offer', title: 'Free Seedlings', description: 'Native perennial seedlings from the High Line nursery — first come, first served.', subcategory: 'Seeds', distance: 'Gansevoort end', postedBy: 'Nursery Crew' },
    ],
  },

  // ── Brooklyn ──
  {
    id: 'prospect-park',
    name: 'Prospect Park',
    icon: '🦌',
    x: 50, y: 90,
    lat: 40.6602, lng: -73.9690,
    description: 'A 526-acre park designed by Olmsted & Vaux in 1867. It contains Brooklyn\'s only remaining forest (the Ravine), a 60-acre lake, and the LeFrak Center. Before colonization, this was Canarsie territory — dense hardwood forest with freshwater streams.',
    source: 'Prospect Park Alliance; Welikia Project',
    pins: [
      { category: 'observation', title: 'Great Blue Heron', description: 'Breeding pair confirmed at the lake. Third consecutive year nesting here.', subcategory: 'Bird Migration', distance: 'Prospect Lake', postedBy: 'Birder Network' },
      { category: 'event', title: 'Ravine Restoration Day', description: 'Help clear invasive plants from the forest understory.', subcategory: 'Gathering', distance: 'The Ravine', postedBy: 'Park Alliance' },
      { category: 'request', title: 'Canoe Repair', description: 'Community fishing canoe needs hull patching before spring season.', subcategory: 'Materials', distance: 'Boathouse', postedBy: 'Lake Stewards' },
    ],
  },
  {
    id: 'gowanus',
    name: 'Gowanus Canal',
    icon: '🧪',
    x: 40, y: 85,
    lat: 40.6738, lng: -73.9885,
    description: 'Originally Gowanus Creek — a tidal estuary and oyster bed used by the Lenape. Industrialized in the 1860s, it became one of America\'s most polluted waterways. Now a Superfund site under active remediation, with oyster restoration pilot programs underway.',
    source: 'EPA Superfund; Gowanus Canal Conservancy',
    pins: [
      { category: 'observation', title: 'Water Oxygen Rising', description: 'Dissolved oxygen levels at 4.2 mg/L — highest reading in 50 years.', subcategory: 'Water Quality', distance: 'On site', postedBy: 'Canal Monitor' },
      { category: 'request', title: 'Rain Garden Volunteers', description: 'Sponge Park needs planting help to expand bioswale capacity.', subcategory: 'Labor', distance: '2nd St Bridge', postedBy: 'Conservancy' },
    ],
  },
  {
    id: 'brooklyn-bridge-park',
    name: 'Brooklyn Bridge Park',
    icon: '🌉',
    x: 42, y: 75,
    lat: 40.6983, lng: -73.9971,
    description: 'An 85-acre park on reclaimed piers and cargo docks along the Brooklyn waterfront. The salt marsh at Pier 1 is a designed ecosystem — a new tidal habitat where ribbed mussels and fiddler crabs have colonized naturally.',
    source: 'Brooklyn Bridge Park Conservancy',
    pins: [
      { category: 'observation', title: 'Salt Marsh Colonization', description: 'Fiddler crab burrows counted at the Pier 1 marsh — population tripled since last year.', subcategory: 'Wetlands', distance: 'Pier 1', postedBy: 'Marsh Watch' },
      { category: 'offer', title: 'Free Kayak Access', description: 'Community kayak program — paddle the East River, no experience needed.', subcategory: 'Recreation', distance: 'Pier 2', postedBy: 'Boathouse' },
    ],
  },

  // ── Queens ──
  {
    id: 'flushing-meadows',
    name: 'Flushing Meadows',
    icon: '🦩',
    x: 85, y: 30,
    lat: 40.7462, lng: -73.8448,
    description: 'Originally a vast tidal marsh — "Flushing" derives from the Dutch "Vlissingen." Filled with ash and garbage to create the 1939 World\'s Fair site. Now a 897-acre park surrounding Meadow Lake, the largest lake in Queens. The Matinecock people fished these waters.',
    source: 'NYC Parks; Wikipedia',
    pins: [
      { category: 'observation', title: 'Night Heron Colony', description: 'Black-crowned night herons roosting at Willow Lake — 40+ individuals counted at dusk.', subcategory: 'Bird Migration', distance: 'Willow Lake', postedBy: 'Queens Birders' },
      { category: 'event', title: 'Meadow Restoration', description: 'Planting native grasses to rebuild the original tidal meadow character.', subcategory: 'Gathering', distance: 'North Meadow', postedBy: 'Parks Dept' },
    ],
  },
  {
    id: 'jamaica-bay',
    name: 'Jamaica Bay',
    icon: '🐚',
    x: 75, y: 95,
    lat: 40.6170, lng: -73.8253,
    description: 'A 26-square-mile wetland estuary — one of the most important bird habitats on the Atlantic coast. Over 330 species recorded. The Jameco people (a Lenape subgroup) harvested shellfish here for millennia. The bay is losing 44 acres of marsh per year to sea level rise.',
    source: 'NPS Gateway NRA; NYC Audubon',
    pins: [
      { category: 'observation', title: 'Horseshoe Crab Spawning', description: 'Peak spawning observed on Plumb Beach. Thousands of crabs mating at high tide.', subcategory: 'Marine Life', distance: 'Plumb Beach', postedBy: 'Bay Monitor' },
      { category: 'request', title: 'Beach Cleanup Crew', description: 'Plastic debris accumulating on Dead Horse Bay. Volunteers needed with bags and gloves.', subcategory: 'Labor', distance: 'Dead Horse Bay', postedBy: 'Bay Guardians' },
    ],
  },

  // ── Governors Island ──
  {
    id: 'governors-island',
    name: 'Pagganck',
    icon: '🏝️',
    x: 35, y: 68,
    lat: 40.6892, lng: -74.0167,
    description: 'Called "Pagganck" (nut island) by the Lenape for its abundant hickory and chestnut trees. Used as a military base from 1783 to 1996. Now a public park with the Hills — artificial landforms built from recycled demolition material, offering Manhattan skyline views.',
    source: 'Trust for Governors Island; Welikia Project',
    pins: [
      { category: 'observation', title: 'Meadow Establishment', description: 'Native prairie grasses seeded 2 years ago now self-sustaining on the Hills.', subcategory: 'Forest Health', distance: 'The Hills', postedBy: 'Island Ecologist' },
      { category: 'event', title: 'Island Gathering', description: 'Monthly community assembly on the south lawn. All are welcome.', subcategory: 'Assembly', distance: 'South Lawn', postedBy: 'Island Council' },
    ],
  },

  // ── Bronx ──
  {
    id: 'pelham-bay',
    name: 'Siwanoy Shores',
    icon: '🦀',
    x: 80, y: 5,
    lat: 40.8714, lng: -73.8097,
    description: 'Pelham Bay Park — NYC\'s largest park at 2,772 acres — sits on ancestral Siwanoy land. It includes Orchard Beach, a glacial erratic field, and the last remnants of coastal grassland in the city. The Thomas Pell Treaty of 1654 was signed nearby.',
    source: 'NYC Parks; Wikipedia',
    pins: [
      { category: 'observation', title: 'Diamondback Terrapin', description: 'Nesting females spotted on the Hunter Island causeway — endangered species recovery.', subcategory: 'Marine Life', distance: 'Hunter Island', postedBy: 'Reptile Survey' },
      { category: 'offer', title: 'Fishing Gear Exchange', description: 'Surplus rods and tackle available at the boathouse. Take what you need.', subcategory: 'Materials', distance: 'Orchard Beach', postedBy: 'Anglers Guild' },
    ],
  },
  {
    id: 'bronx-river',
    name: 'Aquehung',
    icon: '🐟',
    x: 72, y: 8,
    lat: 40.8560, lng: -73.8790,
    description: 'The Bronx River — "Aquehung" (high bluffs) to the Lenape — is the only freshwater river in NYC. After a century of industrial abuse, alewife herring have returned for the first time since the Civil War, thanks to dam removal and community-led restoration.',
    source: 'Bronx River Alliance; Wikipedia',
    pins: [
      { category: 'observation', title: 'Alewife Run', description: 'Herring migration in progress — thousands passing through the fish ladder at 182nd St.', subcategory: 'Water Quality', distance: 'Bronx Zoo area', postedBy: 'River Alliance' },
      { category: 'event', title: 'River Paddle', description: 'Free guided canoe trip from Shoelace Park to Starlight Park. Bring sunscreen.', subcategory: 'Gathering', distance: 'Shoelace Park', postedBy: 'Paddle Crew' },
    ],
  },
];
