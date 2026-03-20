import { Landmark, LandmarkPin } from '@/data/landmarks';
import { Pin } from '@/data/pins';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import PinIcon from './PinIcon';

const categoryLabels: Record<string, string> = {
  offer: 'Offer',
  request: 'Request',
  observation: 'Observation',
  event: 'Gathering',
};

interface LandmarkSheetProps {
  landmark: Landmark | null;
  onClose: () => void;
  onPinSelect?: (pin: Pin) => void;
}

export default function LandmarkSheet({ landmark, onClose, onPinSelect }: LandmarkSheetProps) {
  const handleItemClick = (lPin: LandmarkPin) => {
    if (!onPinSelect || !landmark) return;
    const fullPin: Pin = {
      id: `${landmark.id}-${lPin.title}`,
      category: lPin.category,
      title: lPin.title,
      description: lPin.description,
      subcategory: lPin.subcategory,
      distance: lPin.distance,
      postedBy: lPin.postedBy,
      x: landmark.x,
      y: landmark.y,
    };
    onPinSelect(fullPin);
  };

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
          <div className="earth-panel rounded-2xl p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{landmark.icon}</span>
                <h2 className="font-display text-lg font-bold text-foreground">{landmark.name}</h2>
              </div>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-muted/30 transition-colors text-foreground">
                <X size={18} />
              </button>
            </div>

            {/* Description */}
            {landmark.description && (
              <p className="text-sm text-foreground/80 leading-relaxed">
                {landmark.description}
              </p>
            )}
            {landmark.source && (
              <p className="text-xs text-muted-foreground italic">
                Source: {landmark.source}
              </p>
            )}

            {/* Pins */}
            <div className="space-y-2.5">
              {landmark.pins.map((pin, i) => (
                <motion.button
                  key={i}
                  className="w-full flex items-start gap-3 p-3 rounded-xl bg-muted/20 text-left hover:bg-muted/40 transition-colors cursor-pointer"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => handleItemClick(pin)}
                >
                  <PinIcon category={pin.category} size={20} animate={false} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-display font-bold uppercase tracking-wider text-muted-foreground">
                        {categoryLabels[pin.category]}
                      </span>
                      <span className="text-xs text-muted-foreground/60">·</span>
                      <span className="text-xs text-muted-foreground/60">{pin.subcategory}</span>
                    </div>
                    <p className="font-display text-sm font-semibold text-foreground mt-0.5">{pin.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{pin.description}</p>
                  </div>
                  <span className="text-muted-foreground/40 text-sm mt-1">→</span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
