export interface ClimateIndicator {
  id: string;
  label: string;
  icon: string;
  value: number;
  unit: string;
  target: number;
  direction: 'lower-is-better' | 'higher-is-better';
  status: 'on-track' | 'off-track' | 'critical';
  description: string;
}

export interface ClimatePolicy {
  id: string;
  title: string;
  description: string;
  impact: { indicatorId: string; delta: number }[];
  impactLabel: string;
  votes: { yes: number; no: number };
  source?: string;
  sourceUrl?: string;
  deadline: string; // ISO date
  urgency: 'urgent' | 'normal';
  connectedPins?: string[];
  country?: string;
}

export interface PersonalAction {
  id: string;
  title: string;
  description: string;
  impact: { indicatorId: string; delta: number }[];
  category: 'diet' | 'transport' | 'energy' | 'advocacy' | 'consumption';
  effort: 'easy' | 'medium' | 'hard';
}

export interface EmissionsProjection {
  year: number;
  currentPolicy: number; // GtCO2e/yr
  withGoals: number;
}

// Real data from Climate Action Tracker COP30 Briefing (Nov 2025)
export const emissionsData: EmissionsProjection[] = [
  { year: 1990, currentPolicy: 38.2, withGoals: 38.2 },
  { year: 2000, currentPolicy: 42.1, withGoals: 42.1 },
  { year: 2010, currentPolicy: 50.8, withGoals: 50.8 },
  { year: 2020, currentPolicy: 52.4, withGoals: 52.4 },
  { year: 2025, currentPolicy: 55.0, withGoals: 53.5 },
  { year: 2030, currentPolicy: 57.2, withGoals: 46.2 },
  { year: 2035, currentPolicy: 58.8, withGoals: 43.0 },
  { year: 2040, currentPolicy: 59.5, withGoals: 38.5 },
  { year: 2050, currentPolicy: 60.1, withGoals: 32.0 },
  { year: 2075, currentPolicy: 61.5, withGoals: 28.0 },
  { year: 2100, currentPolicy: 62.28, withGoals: 29.23 },
];

export const climateIndicators: ClimateIndicator[] = [
  { id: 'ghg', label: 'GHG Emissions', icon: '🏭', value: 55.0, unit: 'GtCO₂e/yr', target: 29, direction: 'lower-is-better', status: 'critical', description: 'Global greenhouse gas emissions. Must halve by 2030 for 1.5°C.' },
  { id: 'temp', label: 'Warming Δ', icon: '🌡️', value: 2.6, unit: '°C projected', target: 1.5, direction: 'lower-is-better', status: 'critical', description: 'Projected end-of-century warming under current policies.' },
  { id: 'renewables', label: 'Renewables', icon: '⚡', value: 30, unit: '%', target: 90, direction: 'higher-is-better', status: 'off-track', description: 'Global electricity from renewables. COP28 agreed to triple by 2030.' },
  { id: 'efficiency', label: 'Energy Efficiency', icon: '📉', value: 2.2, unit: '%/yr', target: 4.4, direction: 'higher-is-better', status: 'off-track', description: 'Annual rate of energy efficiency improvement. COP28 goal: double it.' },
  { id: 'methane', label: 'Methane', icon: '💨', value: 380, unit: 'Mt/yr', target: 250, direction: 'lower-is-better', status: 'off-track', description: 'Global methane emissions. Cutting methane slows warming fastest.' },
  { id: 'warming-rate', label: 'Warming Rate', icon: '📈', value: 0.25, unit: '°C/decade', target: 0.12, direction: 'lower-is-better', status: 'critical', description: 'Current rate of warming. Goals would halve this by 2040.' },
];

// Real US-relevant policies from CAT findings + current US climate landscape
export const climatePolicies: ClimatePolicy[] = [
  {
    id: 'cp-1',
    title: 'Inflation Reduction Act Full Implementation',
    description: 'Ensure full deployment of IRA clean energy tax credits and incentives. Currently at risk of partial repeal.',
    impact: [{ indicatorId: 'ghg', delta: -4.2 }, { indicatorId: 'renewables', delta: 8 }],
    impactLabel: '-4.2 GtCO₂e/yr by 2030',
    votes: { yes: 24300, no: 8100 },
    source: 'Climate Action Tracker',
    sourceUrl: 'https://climateactiontracker.org',
    deadline: '2026-07-15',
    urgency: 'urgent',
    connectedPins: ['Solar Panel Installation', 'EV Charging Network'],
    country: 'United States of America',
  },
  {
    id: 'cp-2',
    title: 'EPA Methane Rule for Oil & Gas',
    description: 'Enforce EPA\'s methane emissions standards for oil and gas operations. Methane is 80x more potent than CO₂ short-term.',
    impact: [{ indicatorId: 'methane', delta: -28 }, { indicatorId: 'warming-rate', delta: -0.02 }],
    impactLabel: '-28 Mt methane/yr',
    votes: { yes: 18700, no: 5400 },
    source: 'Climate Action Tracker',
    sourceUrl: 'https://climateactiontracker.org',
    deadline: '2026-06-01',
    urgency: 'urgent',
    connectedPins: ['Air Quality Monitoring'],
    country: 'United States of America',
  },
  {
    id: 'cp-3',
    title: 'Triple Renewable Energy Capacity by 2030',
    description: 'COP28 agreed goal. The G20 implementing this would deliver ~40% of needed emissions reductions—11 GtCO₂e by 2030.',
    impact: [{ indicatorId: 'renewables', delta: 15 }, { indicatorId: 'ghg', delta: -4.4 }],
    impactLabel: '-4.4 GtCO₂e/yr globally',
    votes: { yes: 31200, no: 2900 },
    source: 'COP28 Global Stocktake',
    sourceUrl: 'https://climateactiontracker.org/publications/cop30-briefing-energy-methane-goals/',
    deadline: '2026-11-30',
    urgency: 'normal',
    connectedPins: ['Wind Turbines Workshop', 'Solar Panel Installation'],
    country: 'Global',
  },
  {
    id: 'cp-4',
    title: 'US Rejoining Paris Agreement NDC Enhancement',
    description: 'Support stronger US Nationally Determined Contribution aligned with 1.5°C. Current US target is insufficient.',
    impact: [{ indicatorId: 'ghg', delta: -3.8 }, { indicatorId: 'temp', delta: -0.1 }],
    impactLabel: '-3.8 GtCO₂e/yr US share',
    votes: { yes: 22100, no: 6800 },
    source: 'Climate Action Tracker',
    sourceUrl: 'https://climateactiontracker.org',
    deadline: '2026-02-01',
    urgency: 'urgent',
    country: 'United States of America',
  },
  {
    id: 'cp-5',
    title: 'Double Energy Efficiency Rate by 2030',
    description: 'COP28 agreed goal. G20 doubling efficiency delivers ~40% of reductions, half through electrification of end-use sectors.',
    impact: [{ indicatorId: 'efficiency', delta: 1.5 }, { indicatorId: 'ghg', delta: -4.4 }],
    impactLabel: '-4.4 GtCO₂e/yr globally',
    votes: { yes: 19800, no: 3100 },
    source: 'COP28 Global Stocktake',
    sourceUrl: 'https://climateactiontracker.org/publications/cop30-briefing-energy-methane-goals/',
    deadline: '2026-11-30',
    urgency: 'normal',
    connectedPins: ['Building Retrofit Program'],
    country: 'Global',
  },
  {
    id: 'cp-6',
    title: 'Global Methane Pledge Enforcement',
    description: 'Make the COP28 methane pledge legally binding. Cutting methane delivers 20% of needed reductions and slows warming fastest.',
    impact: [{ indicatorId: 'methane', delta: -76 }, { indicatorId: 'warming-rate', delta: -0.04 }],
    impactLabel: '-76 Mt methane/yr, halves warming rate',
    votes: { yes: 27400, no: 4200 },
    source: 'Climate Action Tracker',
    sourceUrl: 'https://climateactiontracker.org/publications/cop30-briefing-energy-methane-goals/',
    deadline: '2026-11-30',
    urgency: 'normal',
    country: 'Global',
  },
  {
    id: 'cp-7',
    title: 'NYC Climate Mobilization Act Enforcement',
    description: 'Ensure Local Law 97 penalties are enforced for buildings exceeding carbon limits. NYC buildings = 70% of city emissions.',
    impact: [{ indicatorId: 'ghg', delta: -0.8 }],
    impactLabel: '-0.8 GtCO₂e/yr NYC share',
    votes: { yes: 14500, no: 2300 },
    source: 'NYC Mayor\'s Office of Climate',
    deadline: '2026-05-01',
    urgency: 'urgent',
    connectedPins: ['Building Retrofit Program', 'Green Roof Initiative'],
    country: 'United States of America',
  },
];

export const personalActions: PersonalAction[] = [
  { id: 'pa-1', title: 'Go plant-based for meals', description: 'Switching to plant-based meals reduces your food carbon footprint by up to 73%.', impact: [{ indicatorId: 'ghg', delta: -0.002 }], category: 'diet', effort: 'medium' },
  { id: 'pa-2', title: 'Email your rep about the IRA', description: 'Contact your Congress member to protect Inflation Reduction Act clean energy funding.', impact: [{ indicatorId: 'ghg', delta: -0.5 }, { indicatorId: 'renewables', delta: 0.1 }], category: 'advocacy', effort: 'easy' },
  { id: 'pa-3', title: 'Switch to renewable energy provider', description: 'Choose a 100% renewable electricity provider or install community solar.', impact: [{ indicatorId: 'renewables', delta: 0.001 }, { indicatorId: 'ghg', delta: -0.003 }], category: 'energy', effort: 'easy' },
  { id: 'pa-4', title: 'Commit to no-fly for 1 year', description: 'Aviation is 3.5% of warming. One transatlantic flight ≈ 1 ton CO₂.', impact: [{ indicatorId: 'ghg', delta: -0.001 }, { indicatorId: 'warming-rate', delta: -0.0001 }], category: 'transport', effort: 'hard' },
  { id: 'pa-5', title: 'Buy nothing new for 30 days', description: 'Manufacturing accounts for 21% of emissions. Reduce demand, reduce extraction.', impact: [{ indicatorId: 'ghg', delta: -0.001 }], category: 'consumption', effort: 'medium' },
  { id: 'pa-6', title: 'Start composting', description: 'Composting diverts methane-producing waste from landfills. NYC offers free bins.', impact: [{ indicatorId: 'methane', delta: -0.001 }], category: 'consumption', effort: 'easy' },
  { id: 'pa-7', title: 'Bike or walk for trips under 3 miles', description: 'Short car trips are the most carbon-inefficient. Cold engines pollute 3x more.', impact: [{ indicatorId: 'ghg', delta: -0.002 }], category: 'transport', effort: 'medium' },
  { id: 'pa-8', title: 'Call your senator about methane regulation', description: 'Support EPA methane rules for oil & gas. Methane leaks are an urgent fixable problem.', impact: [{ indicatorId: 'methane', delta: -0.3 }, { indicatorId: 'warming-rate', delta: -0.001 }], category: 'advocacy', effort: 'easy' },
];
