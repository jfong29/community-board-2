import { Landmark } from '@/data/landmarks';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import PinIcon from './PinIcon';

interface LandmarkSheetProps {
  landmark: Landmark | null;
  onClose: () => void;
}

export default function LandmarkSheet({ landmark, onClose }: LandmarkSheetProps) {
  return (
    <AnimatePresence>
      {landmark && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 md:px-0 md:max-w-md md:mx-auto"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="earth-panel rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{landmark.icon}</span>
                <h2 className="font-display text-lg font-bold text-foreground">{landmark.name}</h2>
              </div>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-muted/30 transition-colors text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2.5">
              {landmark.pins.map((pin, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl bg-muted/20"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <PinIcon category={pin.category} size={20} animate={false} />
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm font-semibold text-foreground">{pin.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{pin.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
