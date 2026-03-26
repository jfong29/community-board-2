export interface DataTopic {
  id: string;
  title: string;
  icon: string;
  color: string; // HSL var reference
  description: string;
  stats: { label: string; value: string; status: 'critical' | 'off-track' | 'on-track' }[];
  available: boolean;
}

export const dataTopics: DataTopic[] = [
  {
    id: 'climate',
    title: 'Climate Crisis',
    icon: '🌡️',
    color: 'var(--observation)',
    description: 'Global greenhouse gas emissions, warming projections, and policy tracking.',
    stats: [
      { label: 'GHG Emissions', value: '55 GtCO₂e/yr', status: 'critical' },
      { label: 'Warming Δ', value: '+2.6 °C projected', status: 'critical' },
      { label: 'Renewables', value: '30%', status: 'off-track' },
    ],
    available: true,
  },
  {
    id: 'biodiversity',
    title: 'Biodiversity Loss',
    icon: '🦋',
    color: 'var(--event)',
    description: 'Species decline, habitat destruction, and conservation efforts globally.',
    stats: [
      { label: 'Species at Risk', value: '1M+ threatened', status: 'critical' },
      { label: 'Deforestation', value: '10M ha/yr', status: 'critical' },
      { label: 'Protected Land', value: '17%', status: 'off-track' },
    ],
    available: false,
  },
  {
    id: 'water',
    title: 'Water Crisis',
    icon: '💧',
    color: 'var(--primary)',
    description: 'Clean water access, pollution levels, and watershed health indicators.',
    stats: [
      { label: 'Without Safe Water', value: '2.2B people', status: 'critical' },
      { label: 'Ocean Dead Zones', value: '500+', status: 'off-track' },
      { label: 'Freshwater Decline', value: '-1%/yr', status: 'off-track' },
    ],
    available: false,
  },
  {
    id: 'food',
    title: 'Food Systems',
    icon: '🌾',
    color: 'var(--offer)',
    description: 'Food insecurity, agricultural emissions, and sustainable farming data.',
    stats: [
      { label: 'Food Insecure', value: '735M people', status: 'critical' },
      { label: 'Ag Emissions', value: '10 GtCO₂e/yr', status: 'off-track' },
      { label: 'Food Waste', value: '1/3 produced', status: 'off-track' },
    ],
    available: false,
  },
  {
    id: 'housing',
    title: 'Housing & Equity',
    icon: '🏠',
    color: 'var(--request)',
    description: 'NYC housing affordability, displacement, and community land trust data.',
    stats: [
      { label: 'Rent Burdened', value: '54% NYC', status: 'critical' },
      { label: 'Homeless', value: '88K+ NYC', status: 'critical' },
      { label: 'Affordable Units', value: '-2.4%/yr', status: 'off-track' },
    ],
    available: false,
  },
  {
    id: 'air',
    title: 'Air Quality',
    icon: '💨',
    color: 'var(--observation)',
    description: 'Real-time AQI, particulate matter levels, and respiratory health impacts.',
    stats: [
      { label: 'Deaths/yr', value: '6.7M globally', status: 'critical' },
      { label: 'PM2.5 Avg', value: '12.4 µg/m³ NYC', status: 'off-track' },
      { label: 'Clean Air Days', value: '68%', status: 'off-track' },
    ],
    available: false,
  },
];
