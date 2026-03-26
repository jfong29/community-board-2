import { motion } from 'framer-motion';
import { dataTopics, DataTopic } from '@/data/data-topics';
import { Lock } from 'lucide-react';

interface DataTopicsViewProps {
  onSelectTopic: (topicId: string) => void;
}

function TopicCard({ topic, onClick }: { topic: DataTopic; onClick: () => void }) {
  const statusColor = (s: string) =>
    s === 'critical' ? 'hsl(var(--destructive))' :
    s === 'off-track' ? 'hsl(var(--observation))' :
    'hsl(var(--offer))';

  return (
    <motion.button
      onClick={topic.available ? onClick : undefined}
      className={`w-full text-left earth-panel rounded-2xl p-5 space-y-3 transition-all border border-transparent relative overflow-hidden ${
        topic.available ? 'hover:border-border/50 active:scale-[0.98]' : 'opacity-50 cursor-not-allowed'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={topic.available ? { scale: 1.01 } : undefined}
    >
      {!topic.available && (
        <div className="absolute top-3 right-3">
          <Lock size={14} className="text-muted-foreground" />
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="text-2xl">{topic.icon}</span>
        <h3 className="text-lg font-medium italic text-foreground" style={{ fontFamily: 'Labrada' }}>
          {topic.title}
        </h3>
      </div>

      <p className="text-xs text-muted-foreground" style={{ fontFamily: 'Public Sans' }}>
        {topic.description}
      </p>

      {/* Quick stats */}
      <div className="flex flex-wrap gap-2">
        {topic.stats.map((stat, i) => (
          <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-full"
            style={{ background: 'hsla(15, 10%, 20%, 0.8)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor(stat.status) }} />
            <span className="text-[10px] font-semibold text-foreground/70" style={{ fontFamily: 'Public Sans' }}>
              {stat.label}:
            </span>
            <span className="text-[10px] font-bold" style={{ fontFamily: 'Public Sans', color: statusColor(stat.status) }}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {!topic.available && (
        <p className="text-[10px] italic text-muted-foreground" style={{ fontFamily: 'Public Sans' }}>
          Coming soon — data collection in progress
        </p>
      )}
    </motion.button>
  );
}

export default function DataTopicsView({ onSelectTopic }: DataTopicsViewProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-foreground/60" style={{ fontFamily: 'Public Sans' }}>
        Data Topics
      </h2>
      <div className="space-y-3">
        {dataTopics.map((topic, i) => (
          <motion.div key={topic.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}>
            <TopicCard topic={topic} onClick={() => onSelectTopic(topic.id)} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
