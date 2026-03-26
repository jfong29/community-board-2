import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  climateIndicators, climatePolicies, personalActions,
  emissionsDataByScope, scopeEmissions,
  ClimateIndicator, ClimatePolicy, PersonalAction,
  PolicyScope, EmissionsProjection,
} from '@/data/climate-global';
import { Leaf, Mail, Bike, ShoppingBag, Zap, Utensils, ExternalLink } from 'lucide-react';
import requestIcon from '@/assets/request-no-outline.svg';
import checkmarkIcon from '@/assets/checkmark.svg';
import arrowSvg from '@/assets/arrow.svg';
import leftArrow from '@/assets/left-arrow.svg';
import rightArrow from '@/assets/right-arrow.svg';
import NestedPinTag, { ConnectedPinTags } from '@/components/NestedPinTag';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

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

const scopeLabels: Record<PolicyScope, string> = {
  international: 'International',
  national: 'National: United States',
  state: 'State: New York',
  personal: 'Personal Commitments',
};

interface DeltaAnimation {
  id: string;
  indicatorId: string;
  delta: number;
  key: number;
}

interface GhostLine {
  id: string;
  path: string;
  opacity: number;
  solid: boolean; // true = voted yes, draw solid
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

/* ─── Emissions Chart ─── */
function EmissionsChart({
  scope,
  activePolicy,
  ghostLines,
  supportedPolicyIds,
}: {
  scope: Exclude<PolicyScope, 'personal'>;
  activePolicy?: ClimatePolicy & { userVote?: 'yes' | 'no' };
  ghostLines: GhostLine[];
  supportedPolicyIds: Set<string>;
}) {
  const data = emissionsDataByScope[scope];
  const width = 280;
  const height = 140;
  const pad = { top: 10, right: 10, bottom: 20, left: 0 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;

  const years = data.map(d => d.year);
  const minY = Math.min(...data.map(d => Math.min(d.currentPolicy, d.withGoals))) * 0.85;
  const maxY = Math.max(...data.map(d => Math.max(d.currentPolicy, d.withGoals))) * 1.1;

  const xScale = (year: number) => pad.left + ((year - years[0]) / (years[years.length - 1] - years[0])) * w;
  const yScale = (val: number) => pad.top + h - ((val - minY) / (maxY - minY)) * h;

  const makePath = (points: { year: number; value: number }[]) =>
    points.map((p, i) => `${i === 0 ? 'M' : 'L'}${xScale(p.year)},${yScale(p.value)}`).join(' ');

  const currentPath = makePath(data.map(d => ({ year: d.year, value: d.currentPolicy })));
  const goalsPath = makePath(data.map(d => ({ year: d.year, value: d.withGoals })));

  // Active policy line (dashed if not voted, solid if voted yes)
  let policyPath: string | null = null;
  const isActiveSupported = activePolicy?.userVote === 'yes';
  if (activePolicy) {
    const ghgDelta = activePolicy.impact.find(i => i.indicatorId === 'ghg')?.delta || 0;
    policyPath = makePath(data.map(d => {
      const progress = Math.max(0, (d.year - 2025) / (2050 - 2025));
      return { year: d.year, value: d.currentPolicy + ghgDelta * progress };
    }));
  }

  const yearLabels = [years[0], 2025, years[years.length - 1]];
  const lastData = data[data.length - 1];

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-semibold uppercase text-[hsl(var(--observation))]" style={{ fontFamily: 'Public Sans' }}>
          {scope === 'state' ? 'GtCO₂e/year (NYC)' : scope === 'national' ? 'GtCO₂e/year (US)' : 'Gigatons CO₂e/year'}
        </span>
      </div>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Grid */}
        {Array.from({ length: 4 }, (_, i) => {
          const v = minY + ((maxY - minY) / 5) * (i + 1);
          return <line key={i} x1={pad.left} y1={yScale(v)} x2={width - pad.right} y2={yScale(v)}
            stroke="hsla(15, 10%, 30%, 0.3)" strokeWidth="0.5" />;
        })}

        {/* Ghost lines from previously supported policies */}
        {ghostLines.map(ghost => (
          <motion.path key={ghost.id} d={ghost.path} fill="none" stroke="hsl(var(--request))"
            strokeWidth={ghost.solid ? '2' : '1.5'}
            strokeDasharray={ghost.solid ? 'none' : '4,3'}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: ghost.opacity }}
            transition={{ duration: 2 }} />
        ))}

        {/* Current policy line */}
        <motion.path d={currentPath} fill="none" stroke="hsl(var(--observation))" strokeWidth="2"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2 }} />

        {/* With-goals baseline (always dashed) */}
        <motion.path d={goalsPath} fill="none" stroke="hsl(var(--request))" strokeWidth="1.5"
          strokeDasharray="4,3" opacity={0.35}
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 0.2 }} />

        {/* Active policy line — dashed if not voted, solid if yes */}
        {policyPath && (
          <motion.path
            d={policyPath}
            fill="none"
            stroke="hsl(var(--request))"
            strokeWidth={isActiveSupported ? '2.5' : '2'}
            strokeDasharray={isActiveSupported ? 'none' : '6,4'}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            key={`${activePolicy?.id}-${isActiveSupported}`}
          />
        )}

        {/* End dots */}
        <circle cx={xScale(lastData.year)} cy={yScale(lastData.currentPolicy)} r="3" fill="hsl(var(--observation))" />
        <circle cx={xScale(lastData.year)} cy={yScale(lastData.withGoals)} r="3" fill="hsl(var(--request))" />

        {/* Year labels */}
        {yearLabels.filter(yr => yr >= years[0] && yr <= years[years.length - 1]).map(yr => (
          <text key={yr} x={xScale(yr)} y={height - 4} fill="hsl(var(--observation))"
            fontSize="8" fontFamily="Public Sans" fontWeight="600" textAnchor="middle">
            {yr}
          </text>
        ))}

        {/* Annotations */}
        <text x={xScale(lastData.year) - 5} y={yScale(lastData.currentPolicy) - 8} fill="hsl(var(--observation))"
          fontSize="7" fontFamily="Public Sans" fontWeight="600" textAnchor="end">Current Action</text>
        {policyPath && activePolicy && (
          <text x={xScale(lastData.year) - 5}
            y={yScale(lastData.currentPolicy + (activePolicy.impact.find(i => i.indicatorId === 'ghg')?.delta || 0)) + 14}
            fill="hsl(var(--request))" fontSize="7" fontFamily="Public Sans" fontWeight="600" textAnchor="end">
            {isActiveSupported ? '✓ ' : ''}{activePolicy.title.length > 18 ? activePolicy.title.slice(0, 18) + '…' : activePolicy.title}
          </text>
        )}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2 text-[9px]" style={{ fontFamily: 'Public Sans' }}>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-[2px] bg-[hsl(var(--observation))]" />
          <span className="text-[hsl(var(--observation))] font-semibold">Current Action</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-[2px] border-t-2 border-dashed border-[hsl(var(--request))]" />
          <span className="text-[hsl(var(--request))] font-semibold">Proposed Policy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-[2px] bg-[hsl(var(--request))]" />
          <span className="text-[hsl(var(--request))] font-semibold">Supported</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Personal Carbon Tracker ─── */
function PersonalTracker({
  actions, committedActions, onCommit, deltaAnims,
}: {
  actions: PersonalAction[];
  committedActions: Set<string>;
  onCommit: (a: PersonalAction) => void;
  deltaAnims: DeltaAnimation[];
}) {
  const totalSaved = actions
    .filter(a => committedActions.has(a.id))
    .reduce((sum, a) => sum + a.personalKgCO2e, 0);

  const baseline = 16000;
  const current = baseline - totalSaved;
  const pct = Math.round((totalSaved / baseline) * 100);

  return (
    <div className="space-y-5">
      <div className="earth-panel rounded-2xl p-5 space-y-3">
        <h3 className="text-lg italic font-medium text-foreground" style={{ fontFamily: 'Labrada' }}>
          Your Carbon Footprint
        </h3>
        <div className="flex items-end justify-between">
          <div>
            <motion.span className="text-[28px] font-semibold text-[hsl(var(--observation))]"
              style={{ fontFamily: 'Public Sans' }}
              key={current}>
              {(current / 1000).toFixed(1)}
            </motion.span>
            <span className="text-xs text-foreground/60 ml-1" style={{ fontFamily: 'Public Sans' }}>tCO₂e/yr</span>
          </div>
          {totalSaved > 0 && (
            <motion.div className="text-right"
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
              <span className="text-lg font-semibold text-[hsl(var(--offer))]" style={{ fontFamily: 'Public Sans' }}>
                -{(totalSaved / 1000).toFixed(1)}
              </span>
              <span className="text-[10px] text-[hsl(var(--offer))] ml-1">saved</span>
              <p className="text-[10px] text-foreground/60">{pct}% reduced</p>
            </motion.div>
          )}
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'hsla(15, 10%, 20%, 0.8)' }}>
          <motion.div className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, hsl(var(--offer)), hsl(var(--lime)))' }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(pct, 100)}%` }}
            transition={{ duration: 0.7 }} />
        </div>
        <p className="text-[9px] text-foreground/50" style={{ fontFamily: 'Public Sans' }}>
          US average: 16 tCO₂e/yr · Global average: 4.7 tCO₂e/yr · Target: 2.5 tCO₂e/yr
        </p>
      </div>

      {actions.map((action, i) => {
        const isCommitted = committedActions.has(action.id);
        return (
          <motion.div key={action.id}
            className={`earth-panel rounded-2xl p-4 space-y-2 transition-all border ${
              isCommitted ? 'border-[hsl(var(--offer))]/40' : 'border-transparent'
            }`}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted/40">
                {categoryIcons[action.category]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground" style={{ fontFamily: 'Labrada' }}>{action.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: 'Public Sans' }}>{action.description}</p>
                {action.personalKgCO2e > 0 && (
                  <p className="text-[10px] text-[hsl(var(--offer))] mt-1 font-semibold" style={{ fontFamily: 'Public Sans' }}>
                    −{action.personalKgCO2e.toLocaleString()} kg CO₂e/yr
                    {action.equivalent && <span className="font-normal text-foreground/50 ml-1">· {action.equivalent}</span>}
                  </p>
                )}
              </div>
              <motion.button
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isCommitted ? 'text-[#322924]' : 'text-muted-foreground hover:opacity-80'
                }`}
                style={{
                  fontFamily: 'Public Sans',
                  background: isCommitted ? 'hsl(var(--offer))' : 'hsla(91, 81%, 53%, 0.15)',
                  border: isCommitted ? 'none' : '1px solid hsla(91, 81%, 53%, 0.3)',
                }}
                onClick={() => onCommit(action)}
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
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
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
            policy.userVote === 'yes' ? 'text-[#322924]' : 'text-[hsl(var(--lime))] hover:opacity-80'
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
          Oppose ({policy.votes.no.toLocaleString()})
        </motion.button>
      </div>

      {/* Connected pins */}
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
  const [scope, setScope] = useState<PolicyScope>('international');
  const [policyIndex, setPolicyIndex] = useState(0);
  const [ghostLines, setGhostLines] = useState<GhostLine[]>([]);
  const [pressedArrow, setPressedArrow] = useState<'left' | 'right' | null>(null);
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

  useEffect(() => {
    setPolicyIndex(0);
  }, [scope]);

  const scopePolicies = policies.filter(p => p.scope === scope);
  const currentPolicy = scopePolicies[policyIndex];
  const supportedPolicyIds = new Set(policies.filter(p => p.userVote === 'yes').map(p => p.id));

  const applyDeltas = useCallback((deltas: { indicatorId: string; delta: number }[], multiply: number) => {
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
  }, []);

  const createGhostPath = useCallback((policy: ClimatePolicy) => {
    if (scope === 'personal') return '';
    const chartScope = scope as Exclude<PolicyScope, 'personal'>;
    const data = emissionsDataByScope[chartScope];
    const years = data.map(d => d.year);
    const minY2 = Math.min(...data.map(d => Math.min(d.currentPolicy, d.withGoals))) * 0.85;
    const maxY2 = Math.max(...data.map(d => Math.max(d.currentPolicy, d.withGoals))) * 1.1;
    const w = 270;
    const h2 = 110;
    const xS = (yr: number) => ((yr - years[0]) / (years[years.length - 1] - years[0])) * w;
    const yS = (v: number) => 10 + h2 - ((v - minY2) / (maxY2 - minY2)) * h2;
    const ghgDelta = policy.impact.find(i => i.indicatorId === 'ghg')?.delta || 0;
    return data.map((d, i) => {
      const progress = Math.max(0, (d.year - 2025) / (2050 - 2025));
      return `${i === 0 ? 'M' : 'L'}${xS(d.year)},${yS(d.currentPolicy + ghgDelta * progress)}`;
    }).join(' ');
  }, [scope]);

  const handlePolicyVote = (policyId: string, vote: 'yes' | 'no') => {
    const policy = policies.find(p => p.id === policyId);
    if (!policy) return;

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

    // Add ghost line if supported
    if (vote === 'yes' && policy.userVote !== 'yes') {
      const ghostId = `ghost-${policyId}-${Date.now()}`;
      const path = createGhostPath(policy);
      if (path) {
        setGhostLines(prev => [...prev, { id: ghostId, path, opacity: 0.4, solid: true }]);
        setTimeout(() => {
          setGhostLines(prev => prev.map(g => g.id === ghostId ? { ...g, opacity: 0.1 } : g));
        }, 500);
        setTimeout(() => {
          setGhostLines(prev => prev.filter(g => g.id !== ghostId));
        }, 30000);
      }
    }
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

  const canPrev = policyIndex > 0;
  const canNext = policyIndex < scopePolicies.length - 1;
  const navPrev = () => { if (canPrev) setPolicyIndex(i => i - 1); };
  const navNext = () => { if (canNext) setPolicyIndex(i => i + 1); };

  const currentEmissions = indicators.find(i => i.id === 'ghg')?.value ?? 55;
  const projectedTemp = indicators.find(i => i.id === 'temp')?.value ?? 2.6;
  const scopeInfo = scopeEmissions[scope];
  const isPersonal = scope === 'personal';

  return (
    <div className="space-y-6 pb-8">
      {/* Sentinel */}
      <div ref={headerRef} />

      {/* Sticky bar */}
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

      {/* Climate Crisis tag */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="px-3 py-1.5 rounded-full text-base italic font-medium text-[#D9D9D9]"
          style={{ fontFamily: 'Labrada', background: '#362D26' }}>
          Global
        </span>
        <NestedPinTag tag={{
          category: 'climate',
          label: 'Climate Crisis',
          children: [{ category: 'observation', label: 'Greenhouse Gas Emissions' }],
        }} />
      </div>

      {/* Hero Data Section */}
      <section className="space-y-6">
        <h1 className="text-3xl md:text-4xl italic font-medium leading-[35px] text-foreground"
          style={{ fontFamily: 'Labrada' }}>
          Greenhouse Gas{'\n'}Net Emissions Data
        </h1>

        {/* Big numbers with arrow between */}
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

          <img src={arrowSvg} alt="→" className="w-5 h-2.5 mt-4 shrink-0" />

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
        {!isPersonal && (
          <EmissionsChart
            scope={scope as Exclude<PolicyScope, 'personal'>}
            activePolicy={currentPolicy}
            ghostLines={ghostLines}
            supportedPolicyIds={supportedPolicyIds}
          />
        )}

        {/* Source */}
        {!isPersonal && (
          <div className="opacity-80 space-y-1">
            <p className="text-[9.36px] font-semibold text-foreground" style={{ fontFamily: 'Public Sans' }}>
              Currently showing [<span className="text-[hsl(var(--request))]">
                {currentPolicy?.title || 'Select a policy'}
              </span>]
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
        )}
      </section>

      {/* ─── Scope Dropdown ─── */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Select value={scope} onValueChange={(v) => setScope(v as PolicyScope)}>
            <SelectTrigger
              className="w-auto inline-flex gap-2 rounded-full border-0 h-auto py-1.5 px-4 text-base"
              style={{ background: '#362D26', fontFamily: 'Labrada' }}>
              <SelectValue>
                <span className="italic font-medium text-[#D9D9D9]">{scopeLabels[scope]}</span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent style={{ background: '#362D26', border: '1px solid #4a3f37' }}>
              {(Object.entries(scopeLabels) as [PolicyScope, string][]).map(([key, label]) => (
                <SelectItem key={key} value={key}
                  className="text-[#D9D9D9] focus:bg-[#4a3f37] focus:text-[#D9D9D9] cursor-pointer"
                  style={{ fontFamily: 'Labrada' }}>
                  <span className="italic">{label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Policy Carousel (non-personal) */}
        {!isPersonal && scopePolicies.length > 0 && (
          <div className="relative">
            {/* Custom arrow buttons */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={navPrev}
                onPointerDown={() => setPressedArrow('left')}
                onPointerUp={() => setPressedArrow(null)}
                onPointerLeave={() => setPressedArrow(null)}
                disabled={!canPrev}
                className="p-2 transition-all active:scale-90"
              >
                <img
                  src={leftArrow}
                  alt="Previous"
                  className="h-4 w-auto transition-all"
                  style={{
                    opacity: canPrev ? 1 : 0.25,
                    filter: pressedArrow === 'left'
                      ? 'brightness(0.6)'
                      : 'none',
                  }}
                />
              </button>
              <span className="text-[10px] text-foreground/50" style={{ fontFamily: 'Public Sans' }}>
                {policyIndex + 1} / {scopePolicies.length}
              </span>
              <button
                onClick={navNext}
                onPointerDown={() => setPressedArrow('right')}
                onPointerUp={() => setPressedArrow(null)}
                onPointerLeave={() => setPressedArrow(null)}
                disabled={!canNext}
                className="p-2 transition-all active:scale-90"
              >
                <img
                  src={rightArrow}
                  alt="Next"
                  className="h-4 w-auto transition-all"
                  style={{
                    opacity: canNext ? 1 : 0.25,
                    filter: pressedArrow === 'right'
                      ? 'brightness(0.6)'
                      : 'none',
                  }}
                />
              </button>
            </div>

            {/* Single policy card */}
            <AnimatePresence mode="wait">
              {currentPolicy && (
                <PolicyCard
                  key={currentPolicy.id}
                  policy={currentPolicy}
                  onVote={handlePolicyVote}
                />
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Personal Commitments */}
        {isPersonal && (
          <PersonalTracker
            actions={personalActions}
            committedActions={committedActions}
            onCommit={handleCommit}
            deltaAnims={deltaAnims}
          />
        )}
      </section>
    </div>
  );
}
