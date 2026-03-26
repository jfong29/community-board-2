import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  climateIndicators, climatePolicies, personalActions, emissionsData,
  ClimateIndicator, ClimatePolicy, PersonalAction
} from '@/data/climate-global';
import { Check, X, Leaf, Mail, Bike, ShoppingBag, Zap, Utensils, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import arrowRight from '@/assets/arrow-right.svg';
import requestIcon from '@/assets/request-no-outline.svg';
import offerIcon from '@/assets/offer-no-outline.svg';
import observationIcon from '@/assets/observation.svg';
import checkmarkIcon from '@/assets/checkmark.svg';
import NestedPinTag, { ConnectedPinTags } from '@/components/NestedPinTag';

const categoryIcons: Record<string, React.ReactNode> = {
  diet: <Utensils size={14} />,
  transport: <Bike size={14} />,
  energy: <Zap size={14} />,
  advocacy: <Mail size={14} />,
  consumption: <ShoppingBag size={14} />,
};

const effortColors: Record<string, string> = {
  easy: 'text-[hsl(var(--offer))]',
  medium: 'text-[hsl(var(--observation))]',
  hard: 'text-[hsl(var(--request))]',
};

interface DeltaAnimation {
  id: string;
  indicatorId: string;
  delta: number;
  key: number;
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

/* ─── Emissions Chart ─── */
function EmissionsChart({ activePolicyId }: { activePolicyId?: string }) {
  const width = 280;
  const height = 140;
  const pad = { top: 10, right: 10, bottom: 20, left: 0 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;

  const xScale = (year: number) => pad.left + ((year - 1990) / (2100 - 1990)) * w;
  const yScale = (val: number) => pad.top + h - ((val - 25) / (65 - 25)) * h;

  const currentPath = emissionsData.map((d, i) =>
    `${i === 0 ? 'M' : 'L'}${xScale(d.year)},${yScale(d.currentPolicy)}`
  ).join(' ');

  const goalsPath = emissionsData.map((d, i) =>
    `${i === 0 ? 'M' : 'L'}${xScale(d.year)},${yScale(d.withGoals)}`
  ).join(' ');

  const yearLabels = [1990, 2027, 2100];

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-semibold uppercase text-[hsl(var(--observation))]" style={{ fontFamily: 'Public Sans' }}>
          Gigatons CO₂e/year
        </span>
      </div>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Grid lines */}
        {[30, 40, 50, 60].map(v => (
          <line key={v} x1={pad.left} y1={yScale(v)} x2={width - pad.right} y2={yScale(v)}
            stroke="hsla(15, 10%, 30%, 0.3)" strokeWidth="0.5" />
        ))}

        {/* Current policy line */}
        <motion.path d={currentPath} fill="none" stroke="hsl(var(--observation))" strokeWidth="2"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }} />

        {/* With-goals line */}
        <motion.path d={goalsPath} fill="none" stroke="hsl(var(--request))" strokeWidth="2" strokeDasharray="4,3"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.3 }} />

        {/* End dots */}
        <circle cx={xScale(2100)} cy={yScale(62.28)} r="3" fill="hsl(var(--observation))" />
        <circle cx={xScale(2100)} cy={yScale(29.23)} r="3" fill="hsl(var(--request))" />

        {/* Year labels */}
        {yearLabels.map(yr => (
          <text key={yr} x={xScale(yr)} y={height - 4} fill="hsl(var(--observation))"
            fontSize="8" fontFamily="Public Sans" fontWeight="600" textAnchor="middle">
            {yr}
          </text>
        ))}

        {/* Annotations */}
        <text x={xScale(2080)} y={yScale(62) - 6} fill="hsl(var(--observation))"
          fontSize="8" fontFamily="Public Sans" fontWeight="600">Current Action</text>
        <text x={xScale(2080)} y={yScale(32) + 14} fill="hsl(var(--request))"
          fontSize="8" fontFamily="Public Sans" fontWeight="600">With Policy</text>
      </svg>
    </div>
  );
}

/* ─── Sticky Indicators Bar ─── */
function StickyIndicatorsBar({ indicators, deltaAnims }: {
  indicators: ClimateIndicator[];
  deltaAnims: DeltaAnimation[];
}) {
  const getColor = (ind: ClimateIndicator) => {
    if (ind.status === 'on-track') return 'hsl(var(--offer))';
    if (ind.status === 'off-track') return 'hsl(var(--observation))';
    return 'hsl(var(--destructive))';
  };

  return (
    <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-2">
      {indicators.map(ind => (
        <div key={ind.id} className="flex items-center gap-1.5 shrink-0 relative">
          <span className="text-sm">{ind.icon}</span>
          <span className="text-xs font-bold" style={{ fontFamily: 'Public Sans', color: getColor(ind) }}>
            {typeof ind.value === 'number' && ind.value % 1 !== 0 ? ind.value.toFixed(2) : ind.value}
          </span>
          <AnimatePresence>
            {deltaAnims.filter(a => a.indicatorId === ind.id).map(anim => (
              <motion.span
                key={anim.key}
                className="absolute -top-3 right-0 text-[10px] font-bold"
                style={{ fontFamily: 'Public Sans', color: anim.delta < 0 ? 'hsl(var(--offer))' : 'hsl(var(--destructive))' }}
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 0, y: -16 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2 }}
              >
                {anim.delta > 0 ? '+' : ''}{Math.abs(anim.delta) < 0.01 ? anim.delta.toFixed(4) : anim.delta}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

/* ─── Policy Card ─── */
function PolicyCard({ policy, onVote }: {
  policy: ClimatePolicy & { userVote?: 'yes' | 'no' };
  onVote: (id: string, vote: 'yes' | 'no') => void;
}) {
  const total = policy.votes.yes + policy.votes.no;
  const yesP = total > 0 ? Math.round((policy.votes.yes / total) * 100) : 0;
  const days = daysUntil(policy.deadline);
  const isUrgent = policy.urgency === 'urgent';

  return (
    <motion.div
      className="rounded-[10px] p-5 flex flex-col gap-4"
      style={{
        background: 'hsla(326, 100%, 64%, 0.10)',
        boxShadow: '1px 4px 24px 10px rgba(0, 0, 0, 0.25)',
        border: '1px solid hsl(326, 40%, 40%)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
    >
      {/* Header badge */}
      <div className="flex items-center gap-2">
        <img src={requestIcon} alt="" className="w-4 h-3" />
        <span className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--request))]"
          style={{ fontFamily: 'Public Sans' }}>
          {isUrgent ? 'Urgent Vote' : 'Vote'}
        </span>
        {days > 0 && (
          <span className="ml-auto text-[10px] text-[hsl(var(--request))] opacity-80"
            style={{ fontFamily: 'Public Sans', fontStyle: 'italic' }}>
            {days} days left
          </span>
        )}
      </div>

      {/* Title & description */}
      <div className="space-y-1.5">
        <h3 className="text-lg font-semibold uppercase leading-tight text-[#FF69C3]"
          style={{ fontFamily: 'Public Sans' }}>
          {policy.title}
        </h3>
        <p className="text-xs text-[hsl(var(--request))]" style={{ fontFamily: 'Public Sans' }}>
          {policy.description}
        </p>
        <p className="text-[10px] opacity-80 text-[hsl(var(--request))]" style={{ fontFamily: 'Public Sans' }}>
          {policy.impactLabel}
        </p>
      </div>

      {/* Vote bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] text-foreground/60" style={{ fontFamily: 'Public Sans' }}>
          <span>{yesP}% support</span>
          <span>{total.toLocaleString()} votes</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div className="h-full rounded-full"
            style={{ background: 'hsl(var(--observation))' }}
            initial={{ width: 0 }}
            animate={{ width: `${yesP}%` }}
            transition={{ duration: 0.7 }}
          />
        </div>
      </div>

      {/* Action button */}
      <div className="flex items-center gap-2">
        <motion.button
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] text-xs font-bold transition-all ${
            policy.userVote === 'yes'
              ? 'text-[#322924]'
              : 'text-[hsl(var(--lime))] hover:opacity-80'
          }`}
          style={{
            fontFamily: 'Public Sans',
            background: policy.userVote === 'yes'
              ? 'hsl(var(--lime))'
              : 'linear-gradient(0deg, hsla(64, 67%, 50%, 0.2), hsla(64, 67%, 35%, 0.2))',
            border: '1px solid hsl(64, 67%, 55%)',
          }}
          onClick={() => onVote(policy.id, 'yes')}
          whileTap={{ scale: 0.95 }}
        >
          <img src={checkmarkIcon} alt="" className="w-3.5 h-3" style={{ filter: policy.userVote === 'yes' ? 'brightness(0.3)' : 'none' }} />
          Support ({policy.votes.yes.toLocaleString()})
        </motion.button>
        <motion.button
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] text-xs font-bold transition-all ${
            policy.userVote === 'no'
              ? 'bg-[hsl(var(--request))] text-foreground'
              : 'bg-muted/30 text-muted-foreground hover:bg-[hsl(var(--request))]/20'
          }`}
          style={{ fontFamily: 'Public Sans' }}
          onClick={() => onVote(policy.id, 'no')}
          whileTap={{ scale: 0.95 }}
        >
          <X size={14} />
          Oppose ({policy.votes.no.toLocaleString()})
        </motion.button>
      </div>

      {/* Connected pins as nested tags */}
      {policy.connectedPins && policy.connectedPins.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <span className="text-[13px] text-white/80 capitalize shrink-0" style={{ fontFamily: 'Public Sans' }}>
            Connected Pins:
          </span>
          <ConnectedPinTags
            parentCategory="request"
            parentLabel={policy.title.length > 20 ? policy.title.slice(0, 20) + '…' : policy.title}
            children={policy.connectedPins.map(pin => ({
              category: 'offer' as const,
              label: pin,
              onClick: () => {},
            }))}
            compact
          />
        </div>
      )}

      {/* Source */}
      {policy.source && (
        <div className="flex items-center gap-1 text-[9px] text-foreground/60" style={{ fontFamily: 'Public Sans' }}>
          <span>Source:</span>
          {policy.sourceUrl ? (
            <a href={policy.sourceUrl} target="_blank" rel="noopener noreferrer"
              className="underline hover:text-foreground/80 flex items-center gap-0.5">
              {policy.source}
              <ExternalLink size={8} />
            </a>
          ) : (
            <span>{policy.source}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}

/* ─── Main Component ─── */
export default function GlobalClimateView() {
  const [indicators, setIndicators] = useState(climateIndicators.map(i => ({ ...i })));
  const [policies, setPolicies] = useState<(ClimatePolicy & { userVote?: 'yes' | 'no' })[]>(
    climatePolicies.map(p => ({ ...p, votes: { ...p.votes } }))
  );
  const [committedActions, setCommittedActions] = useState<Set<string>>(new Set());
  const [deltaAnims, setDeltaAnims] = useState<DeltaAnimation[]>([]);
  const [isSticky, setIsSticky] = useState(false);
  const [showAllPolicies, setShowAllPolicies] = useState(false);
  const [activePolicyForChart, setActivePolicyForChart] = useState<string>();
  const headerRef = useRef<HTMLDivElement>(null);
  const animKey = useRef(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-60px 0px 0px 0px' }
    );
    if (headerRef.current) observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  const applyDeltas = (deltas: { indicatorId: string; delta: number }[], multiply: number) => {
    const newAnims: DeltaAnimation[] = [];
    setIndicators(prev => prev.map(ind => {
      const match = deltas.find(d => d.indicatorId === ind.id);
      if (!match) return ind;
      const actualDelta = match.delta * multiply;
      animKey.current++;
      newAnims.push({ id: ind.id, indicatorId: ind.id, delta: actualDelta, key: animKey.current });
      return { ...ind, value: Math.round((ind.value + actualDelta) * 1000) / 1000 };
    }));
    setDeltaAnims(prev => [...prev, ...newAnims]);
    setTimeout(() => setDeltaAnims(prev => prev.filter(a => !newAnims.find(n => n.key === a.key))), 1500);
  };

  const handlePolicyVote = (policyId: string, vote: 'yes' | 'no') => {
    setPolicies(prev => prev.map(p => {
      if (p.id !== policyId) return p;
      const votes = { ...p.votes };
      const prevVote = p.userVote;
      if (prevVote === 'yes') votes.yes--;
      if (prevVote === 'no') votes.no--;
      if (prevVote === vote) return { ...p, votes, userVote: undefined };
      if (vote === 'yes') { votes.yes++; applyDeltas(p.impact, 1); }
      if (vote === 'no') { votes.no++; }
      return { ...p, votes, userVote: vote };
    }));
    setActivePolicyForChart(policyId);
  };

  const handleCommit = (action: PersonalAction) => {
    const isCommitted = committedActions.has(action.id);
    setCommittedActions(prev => {
      const next = new Set(prev);
      isCommitted ? next.delete(action.id) : next.add(action.id);
      return next;
    });
    applyDeltas(action.impact, isCommitted ? -1 : 1);
  };

  const usPolicies = policies.filter(p => p.country === 'United States of America');
  const globalPolicies = policies.filter(p => p.country === 'Global');

  const currentEmissions = indicators.find(i => i.id === 'ghg')?.value ?? 55;
  const projectedTemp = indicators.find(i => i.id === 'temp')?.value ?? 2.6;

  return (
    <div className="space-y-6 pb-8">
      {/* Sentinel for sticky */}
      <div ref={headerRef} />

      {/* Sticky minimized bar */}
      <AnimatePresence>
        {isSticky && (
          <motion.div
            className="fixed top-[52px] left-0 right-0 z-20 border-b border-border/30 backdrop-blur-md"
            style={{ background: 'hsla(15, 20%, 10%, 0.95)' }}
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <div className="max-w-2xl mx-auto px-4">
              <StickyIndicatorsBar indicators={indicators} deltaAnims={deltaAnims} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Climate Crisis Tag (Nested) ─── */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="px-3 py-1.5 rounded-full text-base italic font-medium text-[#D9D9D9]"
          style={{ fontFamily: 'Labrada', background: '#362D26' }}>
          Global
        </span>
        <NestedPinTag tag={{
          category: 'climate',
          label: 'Climate Crisis',
          children: [{
            category: 'observation',
            label: 'Greenhouse Gas Emissions',
          }],
        }} />
      </div>

      {/* ─── Hero Data Section ─── */}
      <section className="space-y-6">
        <h1 className="text-3xl md:text-4xl italic font-medium leading-[35px] text-foreground"
          style={{ fontFamily: 'Labrada' }}>
          Greenhouse Gas{'\n'}Net Emissions Data
        </h1>

        {/* Big numbers */}
        <div className="flex items-start justify-between px-4 md:px-8">
          <div className="flex flex-col">
            <motion.span className="text-[30px] font-semibold leading-9 text-[hsl(var(--observation))]"
              style={{ fontFamily: 'Public Sans' }}
              key={currentEmissions}
              initial={{ scale: 1.1 }} animate={{ scale: 1 }}>
              {currentEmissions.toFixed(2)}
            </motion.span>
            <span className="text-[10px] uppercase text-foreground/80" style={{ fontFamily: 'Public Sans' }}>
              projected: +{projectedTemp.toFixed(1)} °C
            </span>
            {/* Delta anims on main number */}
            <AnimatePresence>
              {deltaAnims.filter(a => a.indicatorId === 'ghg').map(anim => (
                <motion.span key={anim.key}
                  className="text-sm font-bold"
                  style={{ fontFamily: 'Public Sans', color: anim.delta < 0 ? 'hsl(var(--offer))' : 'hsl(var(--destructive))' }}
                  initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: -20 }}
                  transition={{ duration: 1.5 }}>
                  {anim.delta > 0 ? '+' : ''}{anim.delta}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>

          <img src={requestIcon} alt="" className="w-5 h-3 mt-3 opacity-70" />

          <div className="flex flex-col items-end">
            <span className="text-[30px] font-semibold leading-9 text-[hsl(var(--request))]"
              style={{ fontFamily: 'Public Sans' }}>
              29.23
            </span>
            <span className="text-[10px] uppercase text-[hsl(var(--request))]" style={{ fontFamily: 'Public Sans' }}>
              With Policy: +1.7 °C
            </span>
          </div>
        </div>

        {/* Emissions chart */}
        <EmissionsChart activePolicyId={activePolicyForChart} />

        {/* Source */}
        <div className="opacity-80 space-y-1">
          <p className="text-[9.36px] font-semibold text-foreground" style={{ fontFamily: 'Public Sans' }}>
            Currently showing [<span className="text-[hsl(var(--request))]">COP28 Energy & Methane Goals</span>]
          </p>
          <p className="text-[9.36px] font-semibold text-foreground" style={{ fontFamily: 'Public Sans' }}>
            Source:{' '}
            <a href="https://climateactiontracker.org/publications/cop30-briefing-energy-methane-goals/"
              target="_blank" rel="noopener noreferrer"
              className="underline hover:text-foreground/80">
              Climate Action Tracker
            </a>
          </p>
        </div>
      </section>

      {/* ─── Full Indicators Grid ─── */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {indicators.map((ind, i) => {
            const getProgress = () => {
              if (ind.direction === 'lower-is-better') return Math.max(0, Math.min(1, 1 - (ind.value - ind.target) / ind.target));
              return Math.max(0, Math.min(1, ind.value / ind.target));
            };
            const progress = getProgress();
            const color = ind.status === 'on-track' ? 'hsl(var(--offer))' : ind.status === 'off-track' ? 'hsl(var(--observation))' : 'hsl(var(--destructive))';
            const radius = 38;
            const circ = 2 * Math.PI * radius;

            return (
              <motion.div key={ind.id}
                className="earth-panel rounded-2xl p-4 flex flex-col items-center gap-2 relative"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}>
                <AnimatePresence>
                  {deltaAnims.filter(a => a.indicatorId === ind.id).map(anim => (
                    <motion.div key={anim.key}
                      className="absolute top-2 right-3 font-bold text-sm z-10"
                      style={{ fontFamily: 'Public Sans', color: anim.delta < 0 ? 'hsl(var(--offer))' : 'hsl(var(--destructive))' }}
                      initial={{ opacity: 1, y: 0, scale: 1.2 }}
                      animate={{ opacity: 0, y: -24, scale: 1 }}
                      transition={{ duration: 1.5 }}>
                      {anim.delta > 0 ? '+' : ''}{Math.abs(anim.delta) < 0.01 ? anim.delta.toFixed(4) : anim.delta}
                    </motion.div>
                  ))}
                </AnimatePresence>
                <svg width="80" height="80" viewBox="0 0 90 90">
                  <circle cx="45" cy="45" r={radius} fill="none" stroke="hsl(15, 10%, 18%)" strokeWidth="5" />
                  <motion.circle cx="45" cy="45" r={radius} fill="none"
                    stroke={color} strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: circ - progress * circ }}
                    transition={{ duration: 1 }}
                    transform="rotate(-90 45 45)" />
                  <text x="45" y="50" textAnchor="middle" fontSize="22">{ind.icon}</text>
                </svg>
                <div className="text-center space-y-0.5">
                  <p className="text-xs font-semibold text-foreground" style={{ fontFamily: 'Labrada' }}>{ind.label}</p>
                  <motion.span className="text-base font-bold block" style={{ fontFamily: 'Public Sans', color }}
                    key={ind.value} initial={{ scale: 1.15 }} animate={{ scale: 1 }}>
                    {typeof ind.value === 'number' && ind.value % 1 !== 0 ? ind.value.toFixed(2) : ind.value} {ind.unit}
                  </motion.span>
                  <p className="text-[9px] text-muted-foreground" style={{ fontFamily: 'Public Sans' }}>
                    Target: {ind.target} {ind.unit}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─── National Policies: USA ─── */}
      <section className="space-y-4">
        <div className="px-3 py-1.5 rounded-full inline-flex items-center gap-1"
          style={{ background: '#362D26' }}>
          <span className="text-base italic font-medium text-[#D9D9D9]" style={{ fontFamily: 'Labrada' }}>
            National Policies:
          </span>
          <span className="text-xs italic font-medium text-[#D9D9D9]/80 ml-1" style={{ fontFamily: 'Public Sans' }}>
            United States of America
          </span>
        </div>

        <div className="space-y-4">
          {usPolicies.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}>
              <PolicyCard policy={p} onVote={handlePolicyVote} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Global Policies ─── */}
      <section className="space-y-4">
        <div className="px-3 py-1.5 rounded-full inline-flex items-center gap-1"
          style={{ background: '#362D26' }}>
          <span className="text-base italic font-medium text-[#D9D9D9]" style={{ fontFamily: 'Labrada' }}>
            Global Policies:
          </span>
          <span className="text-xs italic font-medium text-[#D9D9D9]/80 ml-1" style={{ fontFamily: 'Public Sans' }}>
            COP28 Agreed Goals
          </span>
        </div>

        <div className="space-y-4">
          {globalPolicies.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}>
              <PolicyCard policy={p} onVote={handlePolicyVote} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Personal Actions ─── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <Leaf size={16} className="text-[hsl(var(--offer))]" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-foreground"
            style={{ fontFamily: 'Labrada' }}>Your Commitments</h2>
        </div>
        {personalActions.map((action, i) => {
          const isCommitted = committedActions.has(action.id);
          return (
            <motion.div key={action.id}
              className={`earth-panel rounded-2xl p-4 space-y-2 transition-all border ${
                isCommitted ? 'border-[hsl(var(--offer))]/40' : 'border-transparent'
              }`}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.06 }}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted/40">
                  {categoryIcons[action.category]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground" style={{ fontFamily: 'Labrada' }}>{action.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: 'Public Sans' }}>{action.description}</p>
                </div>
                <motion.button
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isCommitted
                      ? 'text-[#322924]'
                      : 'text-muted-foreground hover:opacity-80'
                  }`}
                  style={{
                    fontFamily: 'Public Sans',
                    background: isCommitted ? 'hsl(var(--offer))' : 'hsla(91, 81%, 53%, 0.15)',
                    border: isCommitted ? 'none' : '1px solid hsla(91, 81%, 53%, 0.3)',
                  }}
                  onClick={() => handleCommit(action)}
                  whileTap={{ scale: 0.93 }}>
                  {isCommitted ? '✓ Committed' : 'Commit'}
                </motion.button>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground" style={{ fontFamily: 'Public Sans' }}>
                <span className={effortColors[action.effort]}>{action.effort}</span>
                <span>·</span>
                {action.impact.map(imp => {
                  const ind = climateIndicators.find(c => c.id === imp.indicatorId);
                  return (
                    <span key={imp.indicatorId} className="flex items-center gap-0.5">
                      {ind?.icon} {imp.delta > 0 ? '+' : ''}{imp.delta}
                    </span>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </section>
    </div>
  );
}
