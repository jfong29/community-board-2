import { motion } from 'framer-motion';
import { Plus, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FloatingDockProps {
  onAdd: () => void;
}

export default function FloatingDock({ onAdd }: FloatingDockProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      className="fixed left-1/2 -translate-x-1/2 z-40"
      style={{ bottom: 'var(--grid-gap)' }}
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.3 }}
    >
      <div className="earth-panel rounded-full px-3 py-2 flex items-center gap-2">
        {/* Observations dashboard */}
        <button
          onClick={() => navigate('/observations')}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-observation/20 text-observation hover:scale-110 active:scale-95 transition-transform"
          title="Observations"
        >
          <BarChart3 size={18} />
        </button>

        {/* Add button */}
        <button
          onClick={onAdd}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:scale-110 active:scale-95 transition-transform"
          style={{ backgroundColor: '#DAE16B', color: '#322924' }}
          title="Add"
        >
          <Plus size={20} />
        </button>
      </div>
    </motion.div>
  );
}
