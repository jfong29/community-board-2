import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { climateIndicators, climatePolicies, personalActions, ClimateIndicator, ClimatePolicy, PersonalAction } from '@/data/climate-global';
import { Check, X, Vote, Leaf, Mail, Bike, ShoppingBag, Zap, Plane, Utensils } from 'lucide-react';

const categoryIcons: Record<string, React.ReactNode> = {
  diet: <Utensils size={14} />,
  transport: <Bike size={14} />,
  energy: <Zap size={14} />,
  advocacy: <Mail size={14} />,
  consumption: <ShoppingBag size={14} />,
};

const effortColors: Record<string, string> = {
  easy: 'status-healthy',
  medium: 'text-observation',
  hard: 'text-request',
};

interface DeltaAnimation {
  id: string;
  indicatorId: string;
  delta: number;
  key: number;
}

export default function GlobalClimateView() {
  const [indicators, setIndicators] = useState(climateIndicators.map(i => ({ ...i })));
  const [policies, setPolicies] = useState<(ClimatePolicy & { userVote?: 'yes' | 'no' })[]>(climatePolicies.map(p => ({ ...p, votes: { ...p.votes } })));
  const [committedActions, setCommittedActions] = useState<Set<string>>(new Set());
  const [deltaAnims, setDeltaAnims] = useState<DeltaAnimation[]>([]);
  const [isSticky, setIsSticky] = useState(false);
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
    setTimeout(() => {
      setDeltaAnims(prev => prev.filter(a => !newAnims.find(n => n.key === a.key)));
    }, 1500);
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
  };

  const handleCommit = (action: PersonalAction) => {
    const isCommitted = committedActions.has(action.id);
    setCommittedActions(prev => {
      const next = new Set(prev);
      if (isCommitted) next.delete(action.id); else next.add(action.id);
      return next;
    });
    applyDeltas(action.impact, isCommitted ? -1 : 1);
  };

  const getIndicatorColor = (ind: ClimateIndicator) => {
    if (ind.status === 'on-track') return 'hsl(141, 65%, 32%)';
    if (ind.status === 'off-track') return 'hsl(22, 100%, 42%)';
    return 'hsl(0, 84%, 60%)';
  };

  const getProgress = (ind: ClimateIndicator) => {
    if (ind.direction === 'lower-is-better') {
      return Math.max(0, Math.min(1, 1 - (ind.value - ind.target) / ind.target));
    }
    return Math.max(0, Math.min(1, ind.value / ind.target));
  };

  return (
    <div className="space-y-6">
      {/* Indicators sentinel */}
      <div ref={headerRef} />

      {/* Sticky minimized indicators bar */}
      <AnimatePresence>
        {isSticky && (
          <motion.div
            className="fixed top-[52px] left-0 right-0 z-20 earth-panel border-b border-border/30 backdrop-blur-md"
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <div className="max-w-2xl mx-auto px-4 py-2 flex items-center gap-3 overflow-x-auto scrollbar-hide">
              {indicators.map(ind => (
                <div key={ind.id} className="flex items-center gap-1.5 shrink-0 relative">
                  <span className="text-sm">{ind.icon}</span>
                  <span className="text-xs font-display font-bold" style={{ color: getIndicatorColor(ind) }}>
                    {typeof ind.value === 'number' && ind.value % 1 !== 0 ? ind.value.toFixed(2) : ind.value}
                  </span>
                  {/* Delta animations */}
                  <AnimatePresence>
                    {deltaAnims.filter(a => a.indicatorId === ind.id).map(anim => (
                      <motion.span
                        key={anim.key}
                        className="absolute -top-3 right-0 text-[10px] font-display font-bold"
                        style={{ color: anim.delta < 0 ? 'hsl(141, 65%, 50%)' : 'hsl(0, 84%, 60%)' }}
                        initial={{ opacity: 1, y: 0 }}
                        animate={{ opacity: 0, y: -16 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2 }}
                      >
                        {anim.delta > 0 ? '+' : ''}{typeof anim.delta === 'number' && Math.abs(anim.delta) < 0.01 ? anim.delta.toFixed(4) : anim.delta}
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full indicators grid */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {indicators.map((ind, i) => {
            const progress = getProgress(ind);
            const color = getIndicatorColor(ind);
            const radius = 38;
            const circ = 2 * Math.PI * radius;

            return (
              <motion.div
                key={ind.id}
                className="earth-panel rounded-2xl p-5 flex flex-col items-center gap-3 relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                {/* Delta animations on cards */}
                <AnimatePresence>
                  {deltaAnims.filter(a => a.indicatorId === ind.id).map(anim => (
                    <motion.div
                      key={anim.key}
                      className="absolute top-2 right-3 font-display font-bold text-sm z-10"
                      style={{ color: anim.delta < 0 ? 'hsl(141, 65%, 50%)' : 'hsl(0, 84%, 60%)' }}
                      initial={{ opacity: 1, y: 0, scale: 1.2 }}
                      animate={{ opacity: 0, y: -24, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.5 }}
                    >
                      {anim.delta > 0 ? '+' : ''}{Math.abs(anim.delta) < 0.01 ? anim.delta.toFixed(4) : anim.delta}
                    </motion.div>
                  ))}
                </AnimatePresence>

                <div className="relative">
                  <svg width="90" height="90" viewBox="0 0 90 90">
                    <circle cx="45" cy="45" r={radius} fill="none" stroke="hsl(30, 10%, 18%)" strokeWidth="6" />
                    <motion.circle
                      cx="45" cy="45" r={radius} fill="none"
                      stroke={color} strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={circ}
                      initial={{ strokeDashoffset: circ }}
                      animate={{ strokeDashoffset: circ - progress * circ }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      transform="rotate(-90 45 45)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl">{ind.icon}</span>
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <p className="font-display text-sm font-semibold text-foreground">{ind.label}</p>
                  <motion.span
                    className="text-lg font-display font-bold"
                    style={{ color }}
                    key={ind.value}
                    initial={{ scale: 1.15 }}
                    animate={{ scale: 1 }}
                  >
                    {typeof ind.value === 'number' && ind.value % 1 !== 0 ? ind.value.toFixed(2) : ind.value}{ind.unit !== '%' && ind.unit !== 'ppm' && ind.unit !== '°C' && ind.unit !== 'pH' ? '' : ''} {ind.unit}
                  </motion.span>
                  <p className="text-[10px] text-muted-foreground">Target: {ind.target} {ind.unit}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Personal Actions */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <Leaf size={16} className="status-healthy" />
          <h2 className="font-display text-sm font-semibold text-foreground uppercase tracking-widest">Your Commitments</h2>
        </div>
        {personalActions.map((action, i) => {
          const isCommitted = committedActions.has(action.id);
          return (
            <motion.div
              key={action.id}
              className={`earth-panel rounded-2xl p-4 space-y-2 transition-all border ${
                isCommitted ? 'border-offer/40' : 'border-transparent'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.06 }}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted/40">
                  {categoryIcons[action.category]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm font-semibold text-foreground">{action.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                </div>
                <motion.button
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-display font-semibold transition-all ${
                    isCommitted
                      ? 'bg-offer/20 text-offer border border-offer/30'
                      : 'bg-muted/30 text-muted-foreground hover:bg-offer/10'
                  }`}
                  onClick={() => handleCommit(action)}
                  whileTap={{ scale: 0.93 }}
                >
                  {isCommitted ? '✓ Committed' : 'Commit'}
                </motion.button>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
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

      {/* Climate Policies */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <Vote size={16} className="text-observation" />
          <h2 className="font-display text-sm font-semibold text-foreground uppercase tracking-widest">Climate Policies</h2>
        </div>
        {policies.map((policy, i) => {
          const total = policy.votes.yes + policy.votes.no;
          const yesP = total > 0 ? Math.round((policy.votes.yes / total) * 100) : 0;
          return (
            <motion.div
              key={policy.id}
              className="earth-panel rounded-2xl p-4 space-y-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
            >
              <p className="font-display text-sm font-semibold text-foreground">{policy.title}</p>
              <p className="text-xs text-muted-foreground">{policy.description}</p>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{yesP}% support</span>
                  <span>{total.toLocaleString()} votes</span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-observation"
                    initial={{ width: 0 }}
                    animate={{ width: `${yesP}%` }}
                    transition={{ duration: 0.7 }}
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <motion.button
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-display font-semibold transition-all ${
                      policy.userVote === 'yes' ? 'bg-observation text-foreground' : 'bg-muted/30 text-muted-foreground hover:bg-observation/20'
                    }`}
                    onClick={() => handlePolicyVote(policy.id, 'yes')}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Check size={14} />
                    <span>{policy.votes.yes.toLocaleString()}</span>
                  </motion.button>
                  <motion.button
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-display font-semibold transition-all ${
                      policy.userVote === 'no' ? 'bg-request text-foreground' : 'bg-muted/30 text-muted-foreground hover:bg-request/20'
                    }`}
                    onClick={() => handlePolicyVote(policy.id, 'no')}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X size={14} />
                    <span>{policy.votes.no.toLocaleString()}</span>
                  </motion.button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>Impact:</span>
                {policy.impact.map(imp => {
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
