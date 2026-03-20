/**
 * Curated GeoJSON-style ecological features based on the Welikia Project's
 * research into Manahatta's pre-colonial landscape (~1609).
 * Sources: welikia.org shapefiles, Sanderson "Mannahatta" (2009).
 */

export interface EcoFeature {
  id: string;
  type: 'pond' | 'stream' | 'marsh' | 'forest' | 'shoreline' | 'meadow';
  name: string;
  indigenousName?: string;
  description: string;
  /** GeoJSON-style coordinates: [lng, lat] pairs */
  coords: [number, number][] | [number, number][][];
  /** For rendering */
  color: string;
  fillOpacity: number;
}

/** Historical ponds */
const ponds: EcoFeature[] = [
  {
    id: 'collect-pond',
    type: 'pond',
    name: 'Collect Pond (Kalch-Hook)',
    indigenousName: 'Kalch-Hook',
    description: 'A 60-foot-deep spring-fed freshwater pond — the primary water source for lower Manahatta. Drained and filled by 1817. Now buried beneath Foley Square and the civic center.',
    coords: [
      [-74.0025, 40.7145], [-74.0035, 40.7150], [-74.0040, 40.7160],
      [-74.0038, 40.7170], [-74.0028, 40.7175], [-74.0015, 40.7172],
      [-74.0008, 40.7162], [-74.0010, 40.7150], [-74.0025, 40.7145],
    ],
    color: 'hsl(200, 70%, 45%)',
    fillOpacity: 0.35,
  },
  {
    id: 'stuyvesant-marsh-pond',
    type: 'pond',
    name: 'Stuyvesant Marsh Pond',
    description: 'A small seasonal pond in the marshlands east of the Bowery trail, fed by tidal seepage from the East River.',
    coords: [
      [-73.9835, 40.7255], [-73.9842, 40.7260], [-73.9845, 40.7268],
      [-73.9840, 40.7273], [-73.9830, 40.7270], [-73.9828, 40.7260],
      [-73.9835, 40.7255],
    ],
    color: 'hsl(200, 70%, 45%)',
    fillOpacity: 0.3,
  },
  {
    id: 'sunfish-pond',
    type: 'pond',
    name: 'Sunfish Pond',
    description: 'A vernal pond near present-day Murray Hill, surrounded by chestnut-oak forest. Important breeding ground for amphibians.',
    coords: [
      [-73.9790, 40.7470], [-73.9798, 40.7475], [-73.9800, 40.7482],
      [-73.9795, 40.7487], [-73.9785, 40.7484], [-73.9783, 40.7475],
      [-73.9790, 40.7470],
    ],
    color: 'hsl(200, 70%, 45%)',
    fillOpacity: 0.3,
  },
];

/** Historical streams & brooks */
const streams: EcoFeature[] = [
  {
    id: 'minetta-brook',
    type: 'stream',
    name: 'Minetta Brook',
    indigenousName: 'Manetta',
    description: 'A freshwater stream flowing from present-day Washington Square south through SoHo to the Hudson. Still flows underground today — occasionally flooding basements on Minetta Lane.',
    coords: [
      [-73.9975, 40.7315], [-73.9978, 40.7305], [-73.9982, 40.7290],
      [-73.9990, 40.7275], [-74.0000, 40.7260], [-74.0010, 40.7240],
      [-74.0025, 40.7220], [-74.0040, 40.7200],
    ],
    color: 'hsl(200, 60%, 50%)',
    fillOpacity: 0.6,
  },
  {
    id: 'collect-outflow',
    type: 'stream',
    name: 'Collect Pond Outflow (Canal Street)',
    description: 'The natural drainage from Collect Pond flowing west to the Hudson River. Its path became Canal Street — literally named for the canal built to drain the filled pond.',
    coords: [
      [-74.0025, 40.7170], [-74.0040, 40.7190], [-74.0060, 40.7205],
      [-74.0080, 40.7215], [-74.0100, 40.7220],
    ],
    color: 'hsl(200, 60%, 50%)',
    fillOpacity: 0.6,
  },
  {
    id: 'saw-kill',
    type: 'stream',
    name: 'Saw Kill',
    description: 'A stream flowing east through present-day East Village to the East River, supporting freshwater marsh habitat along its banks.',
    coords: [
      [-73.9920, 40.7280], [-73.9900, 40.7275], [-73.9880, 40.7268],
      [-73.9860, 40.7260], [-73.9840, 40.7255], [-73.9810, 40.7248],
    ],
    color: 'hsl(200, 60%, 50%)',
    fillOpacity: 0.6,
  },
  {
    id: 'old-wreck-brook',
    type: 'stream',
    name: 'Old Wreck Brook',
    description: 'A stream flowing through present-day Lower East Side into the East River. Its valley created a natural pathway later used as a street grid.',
    coords: [
      [-73.9920, 40.7200], [-73.9900, 40.7190], [-73.9875, 40.7180],
      [-73.9850, 40.7175], [-73.9830, 40.7170],
    ],
    color: 'hsl(200, 60%, 50%)',
    fillOpacity: 0.6,
  },
];

/** Historical marshes */
const marshes: EcoFeature[] = [
  {
    id: 'lispenard-marsh',
    type: 'marsh',
    name: 'Lispenard Meadows',
    description: 'A vast salt marsh stretching from Collect Pond west to the Hudson River, roughly along present-day Canal Street. Teeming with waterfowl and shellfish.',
    coords: [
      [
        [-74.0050, 40.7195], [-74.0030, 40.7185], [-74.0010, 40.7180],
        [-73.9990, 40.7185], [-73.9985, 40.7200], [-74.0000, 40.7210],
        [-74.0020, 40.7215], [-74.0045, 40.7210], [-74.0050, 40.7195],
      ],
    ],
    color: 'hsl(160, 40%, 35%)',
    fillOpacity: 0.3,
  },
  {
    id: 'stuyvesant-marsh',
    type: 'marsh',
    name: 'Stuyvesant Salt Marsh',
    description: 'Tidal salt marsh along the East River near present-day Stuyvesant Town. Rich in cordgrass, fiddler crabs, and wading birds.',
    coords: [
      [
        [-73.9780, 40.7300], [-73.9770, 40.7290], [-73.9760, 40.7280],
        [-73.9755, 40.7270], [-73.9750, 40.7280], [-73.9755, 40.7295],
        [-73.9765, 40.7305], [-73.9780, 40.7300],
      ],
    ],
    color: 'hsl(160, 40%, 35%)',
    fillOpacity: 0.3,
  },
  {
    id: 'gramercy-marsh',
    type: 'marsh',
    name: 'Gramercy Swamp',
    description: 'A freshwater swamp near present-day Gramercy Park, fed by underground springs. The name "Gramercy" derives from the Dutch "Krom Moerasje" meaning "little crooked swamp."',
    coords: [
      [
        [-73.9870, 40.7370], [-73.9860, 40.7360], [-73.9845, 40.7358],
        [-73.9835, 40.7365], [-73.9840, 40.7378], [-73.9855, 40.7382],
        [-73.9870, 40.7370],
      ],
    ],
    color: 'hsl(160, 40%, 35%)',
    fillOpacity: 0.3,
  },
];

/** Historical forest zones */
const forests: EcoFeature[] = [
  {
    id: 'greenwich-forest',
    type: 'forest',
    name: 'Sapokanikan Oak Forest',
    description: 'Dense chestnut-oak forest covering the hills of present-day Greenwich Village. Lenape cultivated tobacco fields in clearings here.',
    coords: [
      [
        [-74.0010, 40.7320], [-73.9990, 40.7310], [-73.9970, 40.7315],
        [-73.9960, 40.7330], [-73.9965, 40.7345], [-73.9985, 40.7350],
        [-74.0005, 40.7340], [-74.0010, 40.7320],
      ],
    ],
    color: 'hsl(130, 45%, 28%)',
    fillOpacity: 0.25,
  },
  {
    id: 'murray-hill-forest',
    type: 'forest',
    name: 'Murray Hill Forest',
    description: 'Upland hardwood forest covering the high ground of present-day Murray Hill and Midtown. Dominated by tulip trees, oaks, and hickories.',
    coords: [
      [
        [-73.9830, 40.7480], [-73.9810, 40.7470], [-73.9790, 40.7475],
        [-73.9780, 40.7490], [-73.9790, 40.7505], [-73.9815, 40.7510],
        [-73.9835, 40.7500], [-73.9830, 40.7480],
      ],
    ],
    color: 'hsl(130, 45%, 28%)',
    fillOpacity: 0.25,
  },
  {
    id: 'east-village-woods',
    type: 'forest',
    name: 'Nechtanc Woodland',
    description: 'Mixed hardwood forest on the sandy uplands east of the Bowery trail. Red maple, sweetgum, and black cherry dominated.',
    coords: [
      [
        [-73.9870, 40.7250], [-73.9850, 40.7240], [-73.9830, 40.7245],
        [-73.9825, 40.7260], [-73.9835, 40.7275], [-73.9855, 40.7278],
        [-73.9870, 40.7265], [-73.9870, 40.7250],
      ],
    ],
    color: 'hsl(130, 45%, 28%)',
    fillOpacity: 0.25,
  },
];

/** Meadow / grasslands */
const meadows: EcoFeature[] = [
  {
    id: 'union-sq-meadow',
    type: 'meadow',
    name: 'Union Meadow',
    description: 'An open grassland and wildflower meadow near present-day Union Square, maintained by periodic Lenape burns for hunting.',
    coords: [
      [
        [-73.9930, 40.7345], [-73.9915, 40.7338], [-73.9900, 40.7342],
        [-73.9895, 40.7355], [-73.9905, 40.7368], [-73.9922, 40.7370],
        [-73.9930, 40.7358], [-73.9930, 40.7345],
      ],
    ],
    color: 'hsl(75, 50%, 40%)',
    fillOpacity: 0.2,
  },
];

/** Approximate historical shoreline (lower Manhattan) */
const shoreline: EcoFeature[] = [
  {
    id: 'west-shore',
    type: 'shoreline',
    name: 'Hudson River Shore (West)',
    description: 'The original Hudson River shoreline — approximately 2 blocks east of today\'s waterfront due to centuries of landfill.',
    coords: [
      [-74.0130, 40.7050], [-74.0120, 40.7100], [-74.0110, 40.7150],
      [-74.0100, 40.7200], [-74.0090, 40.7250], [-74.0080, 40.7300],
      [-74.0070, 40.7350], [-74.0060, 40.7400],
    ],
    color: 'hsl(200, 50%, 40%)',
    fillOpacity: 0.5,
  },
  {
    id: 'east-shore',
    type: 'shoreline',
    name: 'East River Shore',
    description: 'The original East River shoreline — much closer to the interior of the island, with extensive tidal flats and oyster beds.',
    coords: [
      [-73.9980, 40.7050], [-73.9960, 40.7100], [-73.9840, 40.7150],
      [-73.9800, 40.7200], [-73.9770, 40.7250], [-73.9750, 40.7300],
      [-73.9740, 40.7350], [-73.9730, 40.7400],
    ],
    color: 'hsl(200, 50%, 40%)',
    fillOpacity: 0.5,
  },
];

export const ecoFeatures: EcoFeature[] = [
  ...ponds,
  ...streams,
  ...marshes,
  ...forests,
  ...meadows,
  ...shoreline,
];

export const ecoTypeLabels: Record<EcoFeature['type'], string> = {
  pond: 'Historical Pond',
  stream: 'Historical Stream',
  marsh: 'Salt Marsh / Swamp',
  forest: 'Old-Growth Forest',
  meadow: 'Grassland / Meadow',
  shoreline: 'Original Shoreline',
};
