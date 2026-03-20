import { Landmark } from '@/data/landmarks';
import { motion } from 'framer-motion';

interface LandmarkPinProps {
  landmark: Landmark;
  onClick: () => void;
  index: number;
}

export default function LandmarkPin({ landmark, onClick, index }: LandmarkPinProps) {
  return (
    <motion.div
      className="cursor-pointer flex flex-col items-center gap-0.5"
      onClick={onClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.3 + index * 0.1, type: 'spring', stiffness: 300, damping: 20 }}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}>
      
      <div className="relative">
        <div className="w-10 h-10 rounded-xl earth-panel flex items-center justify-center text-lg shadow-lg">
          {landmark.icon}
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#DAE16B' }}>
          <span className="text-[9px] font-display font-bold" style={{ color: '#322924' }}>{landmark.pins.length}</span>
        </div>
      </div>
      <span className="text-[9px] font-display font-semibold text-foreground/80 text-center max-w-16 leading-tight">
        {landmark.name}
      </span>
    </motion.div>);
}
