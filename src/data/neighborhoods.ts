export interface Neighborhood {
  id: string;
  /** Lenape / indigenous name */
  indigenousName: string;
  /** Modern name */
  modernName: string;
  /** Short description of the modern neighborhood */
  description: string;
  /** Attribution source */
  source?: string;
  /** Bounding box in lat/lng */
  bounds: {
    south: number;
    north: number;
    west: number;
    east: number;
  };
}

export const neighborhoods: Neighborhood[] = [
  {
    id: 'kapsee',
    indigenousName: 'Kapsee',
    modernName: 'Battery Park / Financial District',
    description:
      'Kapsee, meaning "rocky ledge" in Lenape, was the southernmost tip of Manahatta. Today it is the Financial District — home to Wall Street and Battery Park. Before colonization, this area featured tidal marshes, oyster beds, and was a key Lenape trading point at the mouth of the North River.',
    source: 'Welikia Project / Sanderson, Mannahatta (2009)',
    bounds: { south: 40.700, north: 40.712, west: -74.020, east: -74.005 },
  },
  {
    id: 'werpoes',
    indigenousName: 'Werpoes',
    modernName: 'Collect Pond / Civic Center',
    description:
      'Werpoes was a Lenape settlement near Collect Pond (Kalch-Hook), once the primary freshwater source for lower Manahatta. The 60-foot-deep spring-fed pond was filled in by 1817. Today the area is home to City Hall, the courthouses, and Foley Square — built directly atop the buried pond.',
    source: 'Wikipedia: Collect Pond',
    bounds: { south: 40.712, north: 40.722, west: -74.010, east: -73.998 },
  },
  {
    id: 'sapokanikan',
    indigenousName: 'Sapokanikan',
    modernName: 'Greenwich Village',
    description:
      'Sapokanikan was a Lenape village and planting ground along the bank of a creek in what is now Greenwich Village. The name means "tobacco field." The village sat near present-day Gansevoort Street. The area later became a bohemian enclave known for its role in the American counterculture, LGBTQ+ rights movement, and arts scene.',
    source: 'Wikipedia: Greenwich Village; Sanderson, Mannahatta (2009)',
    bounds: { south: 40.728, north: 40.738, west: -74.010, east: -73.995 },
  },
  {
    id: 'konaande-kongh',
    indigenousName: 'Konaande Kongh',
    modernName: 'SoHo / NoLIta',
    description:
      'SoHo, short for "South of Houston Street," is a neighborhood in Lower Manhattan. Since the 1970s, the neighborhood has been the location of many artists\' lofts and art galleries. The area\'s history is an archetypal example of inner-city regeneration and gentrification. Before colonization, this was part of the Lenape trail system connecting Werpoes to Sapokanikan.',
    source: 'Wikipedia: SoHo, Manhattan',
    bounds: { south: 40.718, north: 40.728, west: -74.005, east: -73.993 },
  },
  {
    id: 'nechtanc',
    indigenousName: 'Nechtanc',
    modernName: 'East Village / Lower East Side',
    description:
      'Nechtanc was a sandy, elevated area along the East River shore. The landscape featured salt marshes and tidal flats rich with shellfish. Today the East Village and Lower East Side are known for their immigrant history, punk rock legacy, and community gardens — some of which sit on land that was once marshland.',
    source: 'Welikia Project',
    bounds: { south: 40.718, north: 40.732, west: -73.993, east: -73.972 },
  },
  {
    id: 'mannahatta-midtown',
    indigenousName: 'Manahatta',
    modernName: 'Midtown',
    description:
      'The heart of Manahatta — "island of many hills" in Lenape. This central spine of the island was covered in chestnut-oak forest and criss-crossed by streams flowing east and west. Today it is the most densely built commercial district in the world, home to Times Square, the Empire State Building, and Grand Central Terminal.',
    source: 'Sanderson, Mannahatta (2009)',
    bounds: { south: 40.738, north: 40.760, west: -74.000, east: -73.968 },
  },
  {
    id: 'minetta',
    indigenousName: 'Minetta (Brook)',
    modernName: 'Washington Square',
    description:
      'Minetta Brook was a freshwater stream that flowed through what is now Washington Square Park and south through SoHo to the Hudson. The brook still flows underground. Washington Square Park sits atop what was once a potter\'s field and before that, a Lenape campsite near the brook\'s headwaters.',
    source: 'Wikipedia: Minetta Brook',
    bounds: { south: 40.728, north: 40.736, west: -74.002, east: -73.993 },
  },
  {
    id: 'shorakapkok',
    indigenousName: 'Shorakapkok',
    modernName: 'Inwood',
    description:
      'Shorakapkok, at the northern tip of Manhattan, is traditionally cited as the location where Peter Minuit purchased Manhattan from the Lenape in 1626. Inwood Hill Park still contains the last natural forest and salt marsh on Manhattan island — the closest living echo of what all of Manahatta once looked like.',
    source: 'Wikipedia: Inwood, Manhattan',
    bounds: { south: 40.860, north: 40.878, west: -73.930, east: -73.910 },
  },
];

/**
 * Find the neighborhood that contains the given lat/lng.
 * Falls back to the closest neighborhood if none contains the point.
 */
export function getNeighborhoodAtCoords(lat: number, lng: number): Neighborhood {
  for (const n of neighborhoods) {
    const { south, north, west, east } = n.bounds;
    if (lat >= south && lat <= north && lng >= west && lng <= east) return n;
  }
  // fallback — find closest center
  let best = neighborhoods[0];
  let bestDist = Infinity;
  for (const n of neighborhoods) {
    const cy = (n.bounds.south + n.bounds.north) / 2;
    const cx = (n.bounds.west + n.bounds.east) / 2;
    const d = (lat - cy) ** 2 + (lng - cx) ** 2;
    if (d < bestDist) { bestDist = d; best = n; }
  }
  return best;
}
