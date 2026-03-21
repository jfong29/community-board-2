import { Pin, categoryConfig } from '@/data/pins';
import { motion, AnimatePresence } from 'framer-motion';
import PinIcon from './PinIcon';
import { MessageCircle, X, MapPin, Package, Truck } from 'lucide-react';

interface DetailSheetProps {
  pin: Pin | null;
  onClose: () => void;
  onChat: (pin: Pin) => void;
  onTagClick?: (subcategory: string) => void;
}

const categoryColorMap: Record<string, string> = {
  offer: '#00838A',
  request: '#D54E00',
  observation: '#1D8636',
  event: '#9D7AD2'
};

const categoryLabels: Record<string, string> = {
  offer: 'Offer',
  request: 'Request',
  observation: 'Observation',
  event: 'Gathering'
};

export default function DetailSheet({ pin, onClose, onChat, onTagClick }: DetailSheetProps) {
  if (!pin) return null;

  const accentColor = categoryColorMap[pin.category] || '#00838A';
  const showActions = pin.category === 'offer' || pin.category === 'request';

  return (
    <AnimatePresence>
      {pin &&
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 md:px-0 md:max-w-md md:mx-auto"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
        
          <div className="earth-panel rounded-2xl p-6 space-y-4">
            {/* Category label + close */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <PinIcon category={pin.category} size={28} animate={false} />
                <span
                className="font-display text-sm font-bold uppercase tracking-wider"
                style={{ color: accentColor }}>
                
                  {categoryLabels[pin.category]}
                </span>
              </div>
              <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-muted/30 transition-colors text-foreground">
              
                <X size={18} />
              </button>
            </div>

            {/* Title */}
            <h2 className="font-display text-xl font-bold text-foreground leading-tight">
              {pin.title}
            </h2>

            {/* Clickable subcategory tag */}
            <button
            onClick={() => onTagClick?.(pin.subcategory)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-display font-semibold transition-all hover:scale-105 active:scale-95 border"
            style={{
              borderColor: accentColor,
              color: accentColor,
              backgroundColor: `${accentColor}15`
            }}>
            
              {pin.subcategory}
              <span className="opacity-50">→</span>
            </button>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {pin.description}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {pin.distance}
              </span>
              <span>{pin.postedBy}</span>
            </div>

            {/* Action buttons */}
            {showActions ?
          <div className="flex gap-2">
                <button
              onClick={() => onChat(pin)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-display font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>
              
                  <MessageCircle size={16} />
                  <span>Chat</span>
                </button>
                <button
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-display font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] text-lg"
              style={{ backgroundColor: accentColor, color: 'hsl(40, 20%, 85%)' }}>
              
                  <Package size={16} />
                  <span>Pickup</span>
                </button>
                <button
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-display font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: `${accentColor}40`, color: accentColor }}>
              
                  <Truck size={16} />
                  <span>Delivery</span>
                </button>
              </div> :

          <button
            onClick={() => onChat(pin)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-display font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: accentColor, color: 'hsl(40, 20%, 85%)' }}>
            
                <MessageCircle size={16} />
              </button>
          }
          </div>
        </motion.div>
      }
    </AnimatePresence>);

}