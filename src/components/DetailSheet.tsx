import { Pin, categoryConfig } from '@/data/pins';
import { motion, AnimatePresence } from 'framer-motion';
import PinIcon from './PinIcon';
import { MessageCircle, X, MapPin } from 'lucide-react';

interface DetailSheetProps {
  pin: Pin | null;
  onClose: () => void;
  onChat: (pin: Pin) => void;
}

const categoryColorMap: Record<string, string> = {
  offer: '#00838A',
  request: '#D54E00',
  observation: '#1D8636',
  event: '#9D7AD2',
};

export default function DetailSheet({ pin, onClose, onChat }: DetailSheetProps) {
  return (
    <AnimatePresence>
      {pin && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 md:px-0 md:max-w-md md:mx-auto"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="earth-panel rounded-2xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <PinIcon category={pin.category} size={28} animate={false} />
                <span className="text-xs text-muted-foreground">{pin.subcategory}</span>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-muted/30 transition-colors text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <h2 className="font-display text-xl font-bold text-foreground leading-tight">
              {pin.title}
            </h2>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {pin.description}
            </p>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {pin.distance}
              </span>
              <span>{pin.postedBy}</span>
            </div>

            <button
              onClick={() => onChat(pin)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-display font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: categoryColorMap[pin.category],
                color: 'hsl(40, 20%, 85%)',
              }}
            >
              <MessageCircle size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
