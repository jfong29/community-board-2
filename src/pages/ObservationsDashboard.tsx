import { observationData, communityActions, ObservationData, CommunityAction } from '@/data/pins';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Users, Vote, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
          <circle
            cx="45" cy="45" r={radius}
            fill="none"
            stroke="hsl(30, 10%, 18%)"
            strokeWidth="6"
          />
          <circle
            cx="45" cy="45" r={radius}
            fill="none"
            stroke={statusColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            transform="rotate(-90 45 45)"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl">{data.icon}</span>
        </div>
      </div>

      <div className="text-center space-y-1">
        <p className="font-display text-sm font-semibold text-foreground">{data.indicator}</p>
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-lg font-display font-bold" style={{ color: statusColor }}>
            {data.value}
          </span>
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

function ActionCard({ action }: { action: CommunityAction }) {
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
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{yesPercent}%</span>
            <span>{totalVotes}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${yesPercent}%`,
                backgroundColor: 'hsl(var(--observation))',
              }}
            />
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

      <p className="text-[10px] text-muted-foreground/60 italic">
        ← {action.relatedObservation}
      </p>
    </motion.div>
  );
}

export default function ObservationsDashboard() {
  const navigate = useNavigate();

  const healthyCount = observationData.filter(d => d.status === 'healthy').length;
  const decliningCount = observationData.filter(d => d.status === 'declining').length;
  const criticalCount = observationData.filter(d => d.status === 'critical').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 earth-panel border-b border-border/30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-1.5 rounded-full hover:bg-muted/30 text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-display text-lg font-bold text-foreground">🌿</h1>
          
          {/* Summary chips */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="status-bg-healthy px-2 py-1 rounded-full text-xs font-display status-healthy">
              {healthyCount}
            </span>
            <span className="status-bg-declining px-2 py-1 rounded-full text-xs font-display status-declining">
              {decliningCount}
            </span>
            {criticalCount > 0 && (
              <span className="status-bg-critical px-2 py-1 rounded-full text-xs font-display status-critical">
                {criticalCount}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* Observation rings grid */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {observationData.map((obs, i) => (
              <motion.div
                key={obs.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <StatusRing data={obs} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Community responses */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">⟶</span>
            <h2 className="font-display text-sm font-semibold text-foreground uppercase tracking-widest">
              Responses
            </h2>
          </div>
          {communityActions.map((action, i) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              <ActionCard action={action} />
            </motion.div>
          ))}
        </section>
      </div>
    </div>
  );
}
