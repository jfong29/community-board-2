import { useState } from 'react';
import { observationData, communityActions, ObservationData, CommunityAction } from '@/data/pins';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Users, Vote, Calendar, Check, X, Globe, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlobalClimateView from '@/components/GlobalClimateView';
import DataTopicsView from '@/components/DataTopicsView';
import ClimateStatsOverview from '@/components/ClimateStatsOverview';
import FloatingDock from '@/components/FloatingDock';

type GlobalSubView = 'topics' | 'climate-overview' | 'climate-detail';

function StatusRing({ data }: { data: ObservationData }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const progress = (data.value / data.maxValue) * circumference;
  const statusColor = data.status === 'healthy' ? 'hsl(141, 65%, 32%)' : data.status === 'declining' ? 'hsl(22, 100%, 42%)' : 'hsl(0, 84%, 60%)';

  return (
    <motion.div
      className="earth-panel rounded-2xl p-5 flex flex-col items-center gap-3 relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="relative">
        <svg width="90" height="90" viewBox="0 0 90 90">
          <circle cx="45" cy="45" r={radius} fill="none" stroke="hsl(30, 10%, 18%)" strokeWidth="6" />
          <circle
            cx="45" cy="45" r={radius} fill="none"
            stroke={statusColor} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={circumference - progress}
            transform="rotate(-90 45 45)" className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl">{data.icon}</span>
        </div>
      </div>

      <div className="text-center space-y-1">
        <p className="font-display text-sm font-semibold text-foreground">{data.indicator}</p>
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-lg font-display font-bold" style={{ color: statusColor }}>{data.value}</span>
          {data.trend === 'up' && <TrendingUp size={14} className="status-healthy" />}
          {data.trend === 'down' && <TrendingDown size={14} className="status-declining" />}
          {data.trend === 'stable' && <Minus size={14} className="text-muted-foreground" />}
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Users size={10} />
        <span>{data.observers}</span>
        <span>·</span>
        <span>{data.lastUpdated}</span>
      </div>
    </motion.div>
  );
}

function ActionCard({ action, onVote }: { action: CommunityAction & { userVote?: 'yes' | 'no' }; onVote?: (id: string, vote: 'yes' | 'no') => void }) {
  const isVote = action.type === 'vote';
  const totalVotes = isVote && action.votes ? action.votes.yes + action.votes.no : 0;
  const yesPercent = isVote && action.votes ? Math.round((action.votes.yes / totalVotes) * 100) : 0;

  return (
    <motion.div
      className="earth-panel rounded-2xl p-4 space-y-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          isVote ? 'status-bg-declining' : 'status-bg-healthy'
        }`}>
          {isVote ? <Vote size={16} className="status-declining" /> : <Calendar size={16} className="status-healthy" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display text-sm font-semibold text-foreground">{action.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
        </div>
      </div>

      {isVote && action.votes && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{yesPercent}% support</span>
            <span>{totalVotes} votes</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${yesPercent}%` }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              style={{ backgroundColor: 'hsl(var(--observation))' }}
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <motion.button
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-display font-semibold transition-all ${
                action.userVote === 'yes'
                  ? 'bg-observation text-foreground'
                  : 'bg-muted/30 text-muted-foreground hover:bg-observation/20'
              }`}
              onClick={() => onVote?.(action.id, 'yes')}
              whileTap={{ scale: 0.95 }}
            >
              <Check size={14} />
              <span>{action.votes.yes}</span>
            </motion.button>
            <motion.button
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-display font-semibold transition-all ${
                action.userVote === 'no'
                  ? 'bg-request text-foreground'
                  : 'bg-muted/30 text-muted-foreground hover:bg-request/20'
              }`}
              onClick={() => onVote?.(action.id, 'no')}
              whileTap={{ scale: 0.95 }}
            >
              <X size={14} />
              <span>{action.votes.no}</span>
            </motion.button>
          </div>
        </div>
      )}

      {!isVote && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar size={10} />
            {action.date}
          </span>
          <span className="flex items-center gap-1">
            <Users size={10} />
            {action.participants}
          </span>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground/60 italic">← {action.relatedObservation}</p>
    </motion.div>
  );
}

export default function ObservationsDashboard() {
  const navigate = useNavigate();
  const [view, setView] = useState<'local' | 'global'>('global');
  const [globalSubView, setGlobalSubView] = useState<GlobalSubView>('topics');
  const [actions, setActions] = useState<(CommunityAction & { userVote?: 'yes' | 'no' })[]>(
    communityActions.map(a => ({ ...a }))
  );

  const handleVote = (actionId: string, vote: 'yes' | 'no') => {
    setActions(prev => prev.map(a => {
      if (a.id !== actionId || a.type !== 'vote' || !a.votes) return a;
      const prevVote = a.userVote;
      const votes = { ...a.votes };
      if (prevVote === 'yes') votes.yes--;
      if (prevVote === 'no') votes.no--;
      if (prevVote === vote) return { ...a, votes, userVote: undefined };
      if (vote === 'yes') votes.yes++;
      if (vote === 'no') votes.no++;
      return { ...a, votes, userVote: vote };
    }));
  };

  const healthyCount = observationData.filter(d => d.status === 'healthy').length;
  const decliningCount = observationData.filter(d => d.status === 'declining').length;
  const criticalCount = observationData.filter(d => d.status === 'critical').length;

  const handleBack = () => {
    if (view === 'global') {
      if (globalSubView === 'climate-detail') setGlobalSubView('climate-overview');
      else if (globalSubView === 'climate-overview') setGlobalSubView('topics');
      else navigate('/');
    } else {
      navigate('/');
    }
  };

  const headerTitle = view === 'local' ? 'Data' :
    globalSubView === 'topics' ? 'Data' :
    globalSubView === 'climate-overview' ? 'Climate Crisis' :
    'Climate Policies';

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 earth-panel border-b border-border/30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-1.5 rounded-full hover:bg-muted/30 text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
          </button>

          <span className="text-lg font-semibold text-foreground" style={{ fontFamily: 'Labrada' }}>
            {headerTitle}
          </span>

          {/* Local / Global toggle */}
          <div className="flex items-center bg-muted/30 rounded-full p-0.5 gap-0.5 ml-auto">
            <button
              onClick={() => setView('local')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-semibold transition-all ${
                view === 'local' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              <MapPin size={12} />
              Local
            </button>
            <button
              onClick={() => { setView('global'); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-semibold transition-all ${
                view === 'global' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              <Globe size={12} />
              Global
            </button>
          </div>

          {view === 'local' && (
            <div className="flex items-center gap-2">
              <span className="status-bg-healthy px-2 py-1 rounded-full text-xs font-display status-healthy">{healthyCount}</span>
              <span className="status-bg-declining px-2 py-1 rounded-full text-xs font-display status-declining">{decliningCount}</span>
              {criticalCount > 0 && (
                <span className="status-bg-critical px-2 py-1 rounded-full text-xs font-display status-critical">{criticalCount}</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {view === 'local' ? (
            <motion.div
              key="local"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              <section>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {observationData.map((obs, i) => (
                    <motion.div key={obs.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                      <StatusRing data={obs} />
                    </motion.div>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">⟶</span>
                  <h2 className="font-display text-sm font-semibold text-foreground uppercase tracking-widest">Responses</h2>
                </div>
                {actions.map((action, i) => (
                  <motion.div key={action.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.1 }}>
                    <ActionCard action={action} onVote={handleVote} />
                  </motion.div>
                ))}
              </section>
            </motion.div>
          ) : (
            <motion.div
              key={`global-${globalSubView}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {globalSubView === 'topics' && (
                <DataTopicsView onSelectTopic={(id) => {
                  if (id === 'climate') setGlobalSubView('climate-overview');
                }} />
              )}
              {globalSubView === 'climate-overview' && (
                <ClimateStatsOverview onDrillIn={() => setGlobalSubView('climate-detail')} />
              )}
              {globalSubView === 'climate-detail' && (
                <GlobalClimateView />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer dock */}
      <FloatingDock onAdd={() => {}} activeTab="data" />
    </div>
  );
}
