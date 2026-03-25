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
  votes: { yes: number; no: number };
  source?: string;
}

export interface PersonalAction {
  id: string;
  title: string;
  description: string;
  impact: { indicatorId: string; delta: number }[];
  category: 'diet' | 'transport' | 'energy' | 'advocacy' | 'consumption';
  effort: 'easy' | 'medium' | 'hard';
}

export const climateIndicators: ClimateIndicator[] = [
  { id: 'co2', label: 'CO₂ (ppm)', icon: '🏭', value: 421, unit: 'ppm', target: 350, direction: 'lower-is-better', status: 'critical', description: 'Atmospheric CO₂ concentration. Pre-industrial was 280 ppm.' },
  { id: 'temp', label: 'Global Temp Δ', icon: '🌡️', value: 1.45, unit: '°C', target: 1.5, direction: 'lower-is-better', status: 'off-track', description: 'Global average temperature rise above pre-industrial levels.' },
  { id: 'ice', label: 'Arctic Ice', icon: '🧊', value: 4.2, unit: 'M km²', target: 6.5, direction: 'higher-is-better', status: 'critical', description: 'September Arctic sea ice extent. 1980s average was 7.5M km².' },
  { id: 'forest', label: 'Forest Cover', icon: '🌳', value: 31, unit: '%', target: 35, direction: 'higher-is-better', status: 'off-track', description: 'Global forest cover as percentage of land area.' },
  { id: 'ocean-ph', label: 'Ocean pH', icon: '🌊', value: 8.07, unit: 'pH', target: 8.15, direction: 'higher-is-better', status: 'off-track', description: 'Ocean surface acidity. Lower pH = more acidic. Pre-industrial was 8.18.' },
  { id: 'renewables', label: 'Renewable %', icon: '⚡', value: 30, unit: '%', target: 80, direction: 'higher-is-better', status: 'off-track', description: 'Global electricity from renewable sources.' },
];

export const climatePolicies: ClimatePolicy[] = [
  { id: 'cp-1', title: 'Global Fossil Fuel Non-Proliferation Treaty', description: 'Should nations sign a binding treaty to halt new fossil fuel extraction and phase out existing production by 2040?', impact: [{ indicatorId: 'co2', delta: -8 }, { indicatorId: 'temp', delta: -0.02 }], votes: { yes: 12450, no: 3200 }, source: 'fossilfueltreaty.org' },
  { id: 'cp-2', title: 'Carbon Tax at $150/ton by 2030', description: 'Implement a global carbon price of $150/ton on all emissions, with revenue returned as climate dividends to citizens.', impact: [{ indicatorId: 'co2', delta: -5 }, { indicatorId: 'renewables', delta: 3 }], votes: { yes: 8900, no: 4100 }, source: 'IMF Climate Policy' },
  { id: 'cp-3', title: 'Amazon Rainforest Debt-for-Nature Swap', description: 'Cancel $50B in developing nation debt in exchange for legally protecting remaining primary rainforest.', impact: [{ indicatorId: 'forest', delta: 1 }, { indicatorId: 'co2', delta: -3 }], votes: { yes: 15200, no: 890 }, source: 'World Bank' },
  { id: 'cp-4', title: 'Global Methane Pledge Enforcement', description: 'Make the Global Methane Pledge legally binding with sanctions for nations exceeding targets. Methane is 80x worse than CO₂ short-term.', impact: [{ indicatorId: 'temp', delta: -0.03 }, { indicatorId: 'co2', delta: -2 }], votes: { yes: 11300, no: 2100 } },
  { id: 'cp-5', title: 'Ban Deep-Sea Mining Moratorium', description: 'Extend the deep-sea mining moratorium indefinitely to protect ocean ecosystems and carbon sequestration.', impact: [{ indicatorId: 'ocean-ph', delta: 0.01 }], votes: { yes: 9800, no: 1500 } },
  { id: 'cp-6', title: 'Universal Right to Clean Energy Access', description: 'UN resolution declaring affordable clean energy a human right, with funding mechanism for Global South transition.', impact: [{ indicatorId: 'renewables', delta: 5 }, { indicatorId: 'co2', delta: -4 }], votes: { yes: 18400, no: 620 } },
];

export const personalActions: PersonalAction[] = [
  { id: 'pa-1', title: 'Go plant-based for meals', description: 'Switching to plant-based meals reduces your food carbon footprint by up to 73%.', impact: [{ indicatorId: 'co2', delta: -0.002 }, { indicatorId: 'forest', delta: 0.0001 }], category: 'diet', effort: 'medium' },
  { id: 'pa-2', title: 'Email your rep about the Climate Bill', description: 'Contact your Congress member to support the Clean Future Act. Takes 5 minutes.', impact: [{ indicatorId: 'co2', delta: -0.5 }, { indicatorId: 'renewables', delta: 0.1 }], category: 'advocacy', effort: 'easy' },
  { id: 'pa-3', title: 'Switch to renewable energy provider', description: 'Choose a 100% renewable electricity provider or install community solar.', impact: [{ indicatorId: 'renewables', delta: 0.001 }, { indicatorId: 'co2', delta: -0.003 }], category: 'energy', effort: 'easy' },
  { id: 'pa-4', title: 'Commit to no-fly for 1 year', description: 'Aviation is 3.5% of warming. One transatlantic flight ≈ 1 ton CO₂.', impact: [{ indicatorId: 'co2', delta: -0.001 }, { indicatorId: 'temp', delta: -0.0001 }], category: 'transport', effort: 'hard' },
  { id: 'pa-5', title: 'Buy nothing new for 30 days', description: 'Manufacturing accounts for 21% of emissions. Reduce demand, reduce extraction.', impact: [{ indicatorId: 'co2', delta: -0.001 }], category: 'consumption', effort: 'medium' },
  { id: 'pa-6', title: 'Start composting', description: 'Composting diverts methane-producing waste from landfills. NYC offers free bins.', impact: [{ indicatorId: 'co2', delta: -0.001 }], category: 'consumption', effort: 'easy' },
  { id: 'pa-7', title: 'Bike or walk for trips under 3 miles', description: 'Short car trips are the most carbon-inefficient. Cold engines pollute 3x more.', impact: [{ indicatorId: 'co2', delta: -0.002 }], category: 'transport', effort: 'medium' },
  { id: 'pa-8', title: 'Call your senator about methane regulation', description: 'Support the Methane Emissions Reduction Act. Methane leaks are an urgent fixable problem.', impact: [{ indicatorId: 'temp', delta: -0.001 }, { indicatorId: 'co2', delta: -0.3 }], category: 'advocacy', effort: 'easy' },
];
