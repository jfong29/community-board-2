import { Pin } from '@/data/pins';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, MapPin } from 'lucide-react';
import offerIcon from '@/assets/offer.svg';
import requestIcon from '@/assets/request.svg';
import observationIcon from '@/assets/observation.svg';
import gatheringIcon from '@/assets/gathering.svg';

interface DetailSheetProps {
  pin: Pin | null;
  onClose: () => void;
  onChat: (pin: Pin) => void;
  onTagClick?: (subcategory: string) => void;
}

const categoryColorMap: Record<string, string> = {
  offer: '#68D07F',
  request: '#D54E00',
  observation: '#39BBD6',
  event: '#F984CA',
};

const categoryLabels: Record<string, string> = {
  offer: 'Offer',
  request: 'Request',
  observation: 'Signal',
  event: 'Gathering',
};

const categoryIcons: Record<string, string> = {
  offer: offerIcon,
  request: requestIcon,
  observation: observationIcon,
  event: gatheringIcon,
};

// Parse structured description to extract fields
function parseDescription(desc: string) {
  const lines = desc.split('\n');
  const fields: { icon: string; label: string; value: string }[] = [];
  let mainDesc = '';

  for (const line of lines) {
    if (line.startsWith('📍 ')) fields.push({ icon: '📍', label: 'Location', value: line.slice(3) });
    else if (line.startsWith('🕐 ')) fields.push({ icon: '🕐', label: 'Timeframe', value: line.slice(3) });
    else if (line.startsWith('💬 ')) fields.push({ icon: '💬', label: 'Contact', value: line.slice(3) });
    else if (line.startsWith('📦 ')) fields.push({ icon: '📦', label: 'Fulfillment', value: line.slice(3) });
    else if (line.startsWith('#')) fields.push({ icon: '#', label: 'Quantity', value: line.slice(1) });
    else if (line.trim()) mainDesc += (mainDesc ? '\n' : '') + line;
  }

  // Reorder: quantity before location
  const ordered: typeof fields = [];
  const quantityField = fields.find(f => f.label === 'Quantity');
  const locationField = fields.find(f => f.label === 'Location');
  const rest = fields.filter(f => f.label !== 'Quantity' && f.label !== 'Location');

  if (quantityField) ordered.push(quantityField);
  if (locationField) ordered.push(locationField);
  ordered.push(...rest);

  return { mainDesc, fields: ordered };
}

export default function DetailSheet({ pin, onClose, onChat, onTagClick }: DetailSheetProps) {
  if (!pin) return null;

  const accentColor = categoryColorMap[pin.category] || '#68D07F';
  const showActions = pin.category === 'offer' || pin.category === 'request';
  const { mainDesc, fields } = parseDescription(pin.description);

  // Extract fulfillment options from description
  const fulfillmentField = fields.find(f => f.label === 'Fulfillment');
  const fulfillmentOptions = fulfillmentField ? fulfillmentField.value.split(',').map(s => s.trim()) : [];

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
                <img src={categoryIcons[pin.category]} alt={categoryLabels[pin.category]} className="w-6 h-5" />
                <span
                className="font-display font-bold uppercase tracking-wider"
                style={{ color: accentColor, fontSize: '14px' }}>
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
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-display font-semibold transition-all hover:scale-105 active:scale-95 border"
            style={{
              borderColor: accentColor,
              color: accentColor,
              backgroundColor: `${accentColor}15`,
              fontSize: '13px',
            }}>
              {pin.subcategory}
              <span className="opacity-50">→</span>
            </button>

            {/* Description */}
            {mainDesc && (
              <p className="text-muted-foreground leading-relaxed">
                {mainDesc}
              </p>
            )}

            {/* Structured fields */}
            {fields.filter(f => f.label !== 'Fulfillment').map((field, i) => (
              <div key={i} className="flex items-center gap-2 text-muted-foreground">
                <span>{field.icon}</span>
                <span className="font-display font-medium text-foreground/70">{field.label}{field.label === 'Quantity' ? ' (if applicable)' : ''}:</span>
                <span>{field.value}</span>
              </div>
            ))}

            {/* Meta */}
            <div className="flex items-center gap-4 text-muted-foreground" style={{ fontSize: '13px' }}>
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {pin.distance}
              </span>
              <span>{pin.postedBy}</span>
            </div>

            {/* Action buttons — show fulfillment options from post or chat */}
            {showActions && fulfillmentOptions.length > 0 ? (
              <div className="flex gap-2">
                {fulfillmentOptions.map((opt, i) => (
                  <button
                    key={opt}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-display font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={i === 0
                      ? { backgroundColor: accentColor, color: '#F4EDE8', fontSize: '15px' }
                      : { backgroundColor: `${accentColor}20`, color: accentColor, fontSize: '15px' }
                    }
                  >
                    <span>{opt}</span>
                  </button>
                ))}
                <button
                  onClick={() => onChat(pin)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-display font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ backgroundColor: `${accentColor}20`, color: accentColor, fontSize: '15px' }}
                >
                  <MessageCircle size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onChat(pin)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-display font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: accentColor, color: '#F4EDE8', fontSize: '15px' }}
              >
                <MessageCircle size={16} />
                <span>Chat</span>
              </button>
            )}
          </div>
        </motion.div>
      }
    </AnimatePresence>
  );
}
