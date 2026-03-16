import { PinCategory } from '@/data/pins';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import PinIcon from './PinIcon';

interface FloatingDockProps {
  activeFilter: PinCategory | null;
  onFilter: (cat: PinCategory | null) => void;
  onAdd: () => void;
}

const categories: PinCategory[] = ['offer', 'request', 'signal', 'event'];
const labels: Record<PinCategory, string> = {
  offer: 'Offer',
  request: 'Request',
  signal: 'Signal',
  event: 'Event',
};

export default function FloatingDock({ activeFilter, onFilter, onAdd }: FloatingDockProps) {
  return (
    <motion.div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.3 }}
    >
      <div className="glass rounded-full px-3 py-2 flex items-center gap-1 md:gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onFilter(activeFilter === cat ? null : cat)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full transition-all text-xs font-display font-medium ${
              activeFilter === cat
                ? 'bg-muted/40'
                : 'hover:bg-muted/20'
            }`}
          >
            <PinIcon category={cat} size={16} animate={false} />
            <span className="hidden sm:inline text-foreground">{labels[cat]}</span>
          </button>
        ))}

        {/* Divider */}
        <div className="w-px h-6 bg-border/40 mx-1" />

        {/* Add button */}
        <button
          onClick={onAdd}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground hover:scale-110 active:scale-95 transition-transform"
        >
          <Plus size={20} />
        </button>
      </div>
    </motion.div>
  );
}
