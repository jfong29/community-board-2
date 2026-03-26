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
  deadline: string;
  urgency: 'urgent' | 'normal';
  connectedPins?: string[];
  country?: string;
  scope: 'international' | 'national' | 'state';
}

export interface PersonalAction {
  id: string;
  title: string;
  description: string;
  impact: { indicatorId: string; delta: number }[];
  category: 'diet' | 'transport' | 'energy' | 'advocacy' | 'consumption';
  effort: 'easy' | 'medium' | 'hard';
  /** Annual kg CO2e saved per person */
  personalKgCO2e: number;
  /** Equivalent description */
  equivalent?: string;
}

export interface EmissionsProjection {
  year: number;
  currentPolicy: number;
  withGoals: number;
}

export type PolicyScope = 'international' | 'national' | 'state' | 'personal';

// Scope-level emissions baselines (GtCO2e/yr for intl/national, MtCO2e for state, tCO2e for personal)
export const scopeEmissions: Record<PolicyScope, { current: number; unit: string; projectedTemp: string }> = {
  international: { current: 55.0, unit: 'GtCO₂e/yr', projectedTemp: '+2.6 °C' },
  national: { current: 5.98, unit: 'GtCO₂e/yr', projectedTemp: '+0.15 °C US share' },
  state: { current: 0.047, unit: 'GtCO₂e/yr', projectedTemp: 'NYC share' },
  personal: { current: 16.0, unit: 'tCO₂e/yr', projectedTemp: 'US avg per capita' },
};

// Emissions projections by scope
export const emissionsDataByScope: Record<Exclude<PolicyScope, 'personal'>, EmissionsProjection[]> = {
  international: [
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
  ],
  national: [
    { year: 1990, currentPolicy: 6.17, withGoals: 6.17 },
    { year: 2000, currentPolicy: 7.15, withGoals: 7.15 },
    { year: 2005, currentPolicy: 7.26, withGoals: 7.26 },
    { year: 2010, currentPolicy: 6.88, withGoals: 6.88 },
    { year: 2020, currentPolicy: 5.78, withGoals: 5.78 },
    { year: 2025, currentPolicy: 5.98, withGoals: 5.50 },
    { year: 2030, currentPolicy: 5.60, withGoals: 3.40 },
    { year: 2035, currentPolicy: 5.30, withGoals: 2.50 },
    { year: 2040, currentPolicy: 5.10, withGoals: 1.80 },
    { year: 2050, currentPolicy: 4.80, withGoals: 0.90 },
  ],
  state: [
    { year: 2005, currentPolicy: 0.063, withGoals: 0.063 },
    { year: 2010, currentPolicy: 0.057, withGoals: 0.057 },
    { year: 2015, currentPolicy: 0.052, withGoals: 0.052 },
    { year: 2020, currentPolicy: 0.045, withGoals: 0.045 },
    { year: 2025, currentPolicy: 0.047, withGoals: 0.043 },
    { year: 2030, currentPolicy: 0.044, withGoals: 0.032 },
    { year: 2035, currentPolicy: 0.042, withGoals: 0.023 },
    { year: 2040, currentPolicy: 0.040, withGoals: 0.015 },
    { year: 2050, currentPolicy: 0.038, withGoals: 0.000 },
  ],
};

// Keep legacy export
export const emissionsData = emissionsDataByScope.international;

export const climateIndicators: ClimateIndicator[] = [
  { id: 'ghg', label: 'GHG Emissions', icon: '🏭', value: 55.0, unit: 'GtCO₂e/yr', target: 29, direction: 'lower-is-better', status: 'critical', description: 'Global greenhouse gas emissions. Must halve by 2030 for 1.5°C.' },
  { id: 'temp', label: 'Warming Δ', icon: '🌡️', value: 2.6, unit: '°C projected', target: 1.5, direction: 'lower-is-better', status: 'critical', description: 'Projected end-of-century warming under current policies.' },
  { id: 'renewables', label: 'Renewables', icon: '⚡', value: 30, unit: '%', target: 90, direction: 'higher-is-better', status: 'off-track', description: 'Global electricity from renewables. COP28 agreed to triple by 2030.' },
  { id: 'efficiency', label: 'Energy Efficiency', icon: '📉', value: 2.2, unit: '%/yr', target: 4.4, direction: 'higher-is-better', status: 'off-track', description: 'Annual rate of energy efficiency improvement. COP28 goal: double it.' },
  { id: 'methane', label: 'Methane', icon: '💨', value: 380, unit: 'Mt/yr', target: 250, direction: 'lower-is-better', status: 'off-track', description: 'Global methane emissions. Cutting methane slows warming fastest.' },
  { id: 'warming-rate', label: 'Warming Rate', icon: '📈', value: 0.25, unit: '°C/decade', target: 0.12, direction: 'lower-is-better', status: 'critical', description: 'Current rate of warming. Goals would halve this by 2040.' },
];

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
    scope: 'national',
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
    scope: 'national',
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
    scope: 'international',
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
    scope: 'national',
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
    scope: 'international',
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
    scope: 'international',
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
    scope: 'state',
  },
  {
    id: 'cp-8',
    title: 'NY Climate Leadership & Community Protection Act',
    description: 'Ensure NY CLCPA goals: 70% renewable electricity by 2030, 100% zero-emission by 2040, economy-wide carbon neutral by 2050.',
    impact: [{ indicatorId: 'renewables', delta: 3 }, { indicatorId: 'ghg', delta: -0.5 }],
    impactLabel: '-0.5 GtCO₂e/yr NY share',
    votes: { yes: 16200, no: 3400 },
    source: 'NY Climate Act',
    deadline: '2026-08-15',
    urgency: 'normal',
    connectedPins: ['Solar Panel Installation'],
    country: 'United States of America',
    scope: 'state',
  },
  {
    id: 'cp-9',
    title: 'NYC Congestion Pricing Revenue for Transit',
    description: 'Direct congestion pricing revenue to MTA for cleaner transit, reducing car dependency and transport emissions in the city.',
    impact: [{ indicatorId: 'ghg', delta: -0.3 }],
    impactLabel: '-0.3 GtCO₂e/yr NYC transport',
    votes: { yes: 12800, no: 5600 },
    source: 'MTA',
    deadline: '2026-12-01',
    urgency: 'normal',
    country: 'United States of America',
    scope: 'state',
  },
];

export const personalActions: PersonalAction[] = [
  {
    id: 'pa-1', title: 'Go plant-based for meals',
    description: 'Switching to plant-based meals reduces your food carbon footprint by up to 73%. Beef produces 60 kg CO₂e per kg.',
    impact: [{ indicatorId: 'ghg', delta: -0.002 }], category: 'diet', effort: 'medium',
    personalKgCO2e: 900,
    equivalent: 'Like removing a car from the road for 2.5 months',
  },
  {
    id: 'pa-2', title: 'Email your rep about the IRA',
    description: 'Contact your Congress member to protect Inflation Reduction Act clean energy funding.',
    impact: [{ indicatorId: 'ghg', delta: -0.5 }, { indicatorId: 'renewables', delta: 0.1 }], category: 'advocacy', effort: 'easy',
    personalKgCO2e: 0,
    equivalent: 'Systemic impact: amplifies policy change',
  },
  {
    id: 'pa-3', title: 'Switch to renewable energy provider',
    description: 'Choose a 100% renewable electricity provider or install community solar.',
    impact: [{ indicatorId: 'renewables', delta: 0.001 }, { indicatorId: 'ghg', delta: -0.003 }], category: 'energy', effort: 'easy',
    personalKgCO2e: 2400,
    equivalent: 'Like planting 40 trees per year',
  },
  {
    id: 'pa-4', title: 'Commit to no-fly for 1 year',
    description: 'Aviation is 3.5% of warming. One round-trip NYC→London ≈ 1,600 kg CO₂.',
    impact: [{ indicatorId: 'ghg', delta: -0.001 }, { indicatorId: 'warming-rate', delta: -0.0001 }], category: 'transport', effort: 'hard',
    personalKgCO2e: 1600,
    equivalent: 'Equivalent to 1 round-trip transatlantic flight',
  },
  {
    id: 'pa-5', title: 'Buy nothing new for 30 days',
    description: 'Manufacturing accounts for 21% of emissions. Average American: 8.1 tCO₂e/yr from consumption.',
    impact: [{ indicatorId: 'ghg', delta: -0.001 }], category: 'consumption', effort: 'medium',
    personalKgCO2e: 680,
    equivalent: 'Like skipping 280 kg of new clothing per year',
  },
  {
    id: 'pa-6', title: 'Start composting',
    description: 'Composting diverts methane-producing waste from landfills. NYC offers free bins.',
    impact: [{ indicatorId: 'methane', delta: -0.001 }], category: 'consumption', effort: 'easy',
    personalKgCO2e: 210,
    equivalent: 'Prevents 210 kg CO₂e of methane from landfills',
  },
  {
    id: 'pa-7', title: 'Bike or walk for trips under 3 miles',
    description: 'Short car trips are the most carbon-inefficient. Cold engines pollute 3x more.',
    impact: [{ indicatorId: 'ghg', delta: -0.002 }], category: 'transport', effort: 'medium',
    personalKgCO2e: 720,
    equivalent: 'Like saving 300 liters of gasoline per year',
  },
  {
    id: 'pa-8', title: 'Call your senator about methane regulation',
    description: 'Support EPA methane rules for oil & gas. Methane leaks are an urgent fixable problem.',
    impact: [{ indicatorId: 'methane', delta: -0.3 }, { indicatorId: 'warming-rate', delta: -0.001 }], category: 'advocacy', effort: 'easy',
    personalKgCO2e: 0,
    equivalent: 'Systemic impact: amplifies policy change',
  },
];
