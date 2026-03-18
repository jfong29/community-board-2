import { useState } from 'react';
import { PinCategory, Pin } from '@/data/pins';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown } from 'lucide-react';
import PinIcon from './PinIcon';

interface AddPinModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (pin: Omit<Pin, 'id' | 'x' | 'y'>) => void;
}

const categories: { value: PinCategory; label: string; hint: string }[] = [
  { value: 'offer', label: 'Offer', hint: 'Share something with the community' },
  { value: 'request', label: 'Request', hint: 'Ask the community for help' },
  { value: 'observation', label: 'Observation', hint: 'Report what you notice' },
  { value: 'event', label: 'Gathering', hint: 'Organize a community event' },
];

const subcategorySuggestions: Record<PinCategory, string[]> = {
  offer: ['Food', 'Water', 'Materials', 'Tools', 'Seeds', 'Medicine', 'Shelter', 'Skills'],
  request: ['Food', 'Water', 'Materials', 'Tools', 'Labor', 'Medicine', 'Transport', 'Knowledge'],
  observation: ['Air Quality', 'Water Quality', 'Wildlife', 'Plants', 'Soil', 'Weather', 'Sound'],
  event: ['Assembly', 'Harvest', 'Planting', 'Workshop', 'Ceremony', 'Cleanup', 'Exchange'],
};

const fulfillmentOptions = ['Pickup', 'Delivery', 'Meet-up', 'Drop-off spot'];

export default function AddPinModal({ open, onClose, onSubmit }: AddPinModalProps) {
  const [category, setCategory] = useState<PinCategory>('offer');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [contact, setContact] = useState('');
  const [location, setLocation] = useState('');
  const [fulfillment, setFulfillment] = useState('Pickup');
  const [timeframe, setTimeframe] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('low');
  const [quantity, setQuantity] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      category,
      title,
      description: [
        description,
        location && `📍 ${location}`,
        timeframe && `🕐 ${timeframe}`,
        contact && `💬 ${contact}`,
        fulfillment && (category === 'offer' || category === 'request') && `📦 ${fulfillment}`,
        quantity && `#${quantity}`,
      ].filter(Boolean).join('\n'),
      subcategory: subcategory || 'General',
      distance: 'Nearby',
      postedBy: 'You',
    });
    // Reset
    setTitle(''); setDescription(''); setSubcategory(''); setContact('');
    setLocation(''); setFulfillment('Pickup'); setTimeframe(''); setQuantity('');
    onClose();
  };

  const inputClass = "w-full bg-muted/30 border border-border/40 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-body";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-background/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-4 top-1/2 z-50 md:max-w-md md:mx-auto max-h-[85vh] overflow-y-auto"
            initial={{ y: '-40%', opacity: 0, scale: 0.9 }}
            animate={{ y: '-50%', opacity: 1, scale: 1 }}
            exit={{ y: '-40%', opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <div className="earth-panel rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-base font-bold text-foreground">
                  New Post
                </h2>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-muted/30 text-foreground">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Category selector */}
                <div className="flex gap-1.5 flex-wrap">
                  {categories.map((cat) => (
                    <button
                      type="button"
                      key={cat.value}
                      onClick={() => { setCategory(cat.value); setSubcategory(''); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-medium transition-all ${
                        category === cat.value ? 'bg-muted/50 ring-1 ring-foreground/20' : 'hover:bg-muted/20'
                      }`}
                    >
                      <PinIcon category={cat.value} size={14} animate={false} />
                      <span className="text-foreground">{cat.label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground font-body">
                  {categories.find(c => c.value === category)?.hint}
                </p>

                {/* Title */}
                <input
                  type="text"
                  placeholder={category === 'offer' ? 'What are you offering?' : category === 'request' ? 'What do you need?' : category === 'observation' ? 'What did you notice?' : "What's the gathering?"}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClass}
                  required
                />

                {/* Subcategory tags */}
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1.5 font-display">Tag</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {subcategorySuggestions[category].map((sub) => (
                      <button
                        type="button"
                        key={sub}
                        onClick={() => setSubcategory(sub === subcategory ? '' : sub)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-display font-medium border transition-all ${
                          subcategory === sub
                            ? 'border-primary/50 bg-primary/15 text-primary'
                            : 'border-border/40 text-muted-foreground hover:border-foreground/20'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <textarea
                  placeholder="Describe in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className={`${inputClass} resize-none`}
                />

                {/* Category-specific fields */}
                {(category === 'offer' || category === 'request') && (
                  <>
                    {/* Quantity */}
                    <input
                      type="text"
                      placeholder="Quantity (e.g. 2 baskets, plenty)"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className={inputClass}
                    />

                    {/* Fulfillment */}
                    <div>
                      <p className="text-[11px] text-muted-foreground mb-1.5 font-display">How to get it</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {fulfillmentOptions.map((opt) => (
                          <button
                            type="button"
                            key={opt}
                            onClick={() => setFulfillment(opt)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-display font-medium border transition-all ${
                              fulfillment === opt
                                ? 'border-primary/50 bg-primary/15 text-primary'
                                : 'border-border/40 text-muted-foreground hover:border-foreground/20'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Location */}
                    <input
                      type="text"
                      placeholder="Pickup/meetup location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className={inputClass}
                    />
                  </>
                )}

                {category === 'request' && (
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-1.5 font-display">Urgency</p>
                    <div className="flex gap-1.5">
                      {(['low', 'medium', 'high'] as const).map((u) => (
                        <button
                          type="button"
                          key={u}
                          onClick={() => setUrgency(u)}
                          className={`px-3 py-1 rounded-full text-[11px] font-display font-medium border transition-all ${
                            urgency === u
                              ? u === 'high' ? 'border-destructive/50 bg-destructive/15 text-destructive' : 'border-primary/50 bg-primary/15 text-primary'
                              : 'border-border/40 text-muted-foreground hover:border-foreground/20'
                          }`}
                        >
                          {u.charAt(0).toUpperCase() + u.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {category === 'event' && (
                  <>
                    <input
                      type="text"
                      placeholder="When? (e.g. Next full moon, Saturday)"
                      value={timeframe}
                      onChange={(e) => setTimeframe(e.target.value)}
                      className={inputClass}
                    />
                    <input
                      type="text"
                      placeholder="Where? (e.g. Eastern ridge, Union Square)"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className={inputClass}
                    />
                  </>
                )}

                {category === 'observation' && (
                  <input
                    type="text"
                    placeholder="Location observed"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={inputClass}
                  />
                )}

                {/* Contact */}
                <input
                  type="text"
                  placeholder="How to reach you (optional)"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className={inputClass}
                />

                {/* Timeframe for offers */}
                {category === 'offer' && (
                  <input
                    type="text"
                    placeholder="Available until? (e.g. end of week, ongoing)"
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    className={inputClass}
                  />
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-display font-semibold text-sm bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] transition-transform"
                >
                  Post to Community
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
