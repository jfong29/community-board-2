import { useState } from 'react';
import { PinCategory, Pin } from '@/data/pins';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import LocationPicker from './LocationPicker';
import PostRecommendation from './PostRecommendation';
import offerIcon from '@/assets/offer.svg';
import requestIcon from '@/assets/request.svg';
import observationIcon from '@/assets/observation.svg';
import gatheringIcon from '@/assets/gathering.svg';

interface AddPinModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (pin: Omit<Pin, 'id' | 'x' | 'y'> & { lat?: number; lng?: number }) => void;
}

const categories: { value: PinCategory; label: string; hint: string; icon: string }[] = [
  { value: 'offer', label: 'Offer', hint: 'Share something with the community', icon: offerIcon },
  { value: 'request', label: 'Request', hint: 'Ask the community for help', icon: requestIcon },
  { value: 'observation', label: 'Signal', hint: 'Report what you notice', icon: observationIcon },
  { value: 'event', label: 'Gathering', hint: 'Organize a community event', icon: gatheringIcon },
];

const subcategorySuggestions: Record<PinCategory, string[]> = {
  offer: ['Food', 'Water', 'Materials', 'Tools', 'Seeds', 'Medicine', 'Shelter', 'Skills'],
  request: ['Food', 'Water', 'Materials', 'Tools', 'Labor', 'Medicine', 'Transport', 'Knowledge'],
  observation: ['Air Quality', 'Water Quality', 'Wildlife', 'Plants', 'Soil', 'Weather', 'Sound'],
  event: ['Assembly', 'Harvest', 'Planting', 'Workshop', 'Ceremony', 'Cleanup', 'Exchange'],
};

const fulfillmentOptions: Record<string, string[]> = {
  offer: ['Meet-up', 'Drop-off spot'],
  request: ['Meet-up', 'Drop-off spot', 'Delivery'],
};

export default function AddPinModal({ open, onClose, onSubmit }: AddPinModalProps) {
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [category, setCategory] = useState<PinCategory>('offer');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [contact, setContact] = useState('');
  const [location, setLocation] = useState('');
  const [fulfillment, setFulfillment] = useState<string[]>([]);
  const [timeframe, setTimeframe] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('low');
  const [quantity, setQuantity] = useState('');
  const [pinLat, setPinLat] = useState<number | null>(null);
  const [pinLng, setPinLng] = useState<number | null>(null);

  const handleLocationChange = (lat: number, lng: number) => {
    setPinLat(lat);
    setPinLng(lng);
  };

  const toggleFulfillment = (opt: string) => {
    setFulfillment(prev =>
      prev.includes(opt) ? prev.filter(f => f !== opt) : [...prev, opt]
    );
  };

  const pendingSubmitData = () => ({
    category,
    title,
    description: [
      description,
      quantity && `#${quantity}`,
      location && `📍 ${location}`,
      timeframe && `🕐 ${timeframe}`,
      contact && `💬 ${contact}`,
      fulfillment.length > 0 && (category === 'offer' || category === 'request') && `📦 ${fulfillment.join(', ')}`,
    ].filter(Boolean).join('\n'),
    subcategory: subcategory || 'General',
    distance: 'Nearby',
    postedBy: 'You',
    lat: pinLat ?? undefined,
    lng: pinLng ?? undefined,
  });

  const doSubmit = () => {
    onSubmit(pendingSubmitData());
    setTitle(''); setDescription(''); setSubcategory(''); setContact('');
    setLocation(''); setFulfillment([]); setTimeframe(''); setQuantity('');
    setPinLat(null); setPinLng(null);
    setShowRecommendation(false);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    // For requests, show recommendation first
    if (category === 'request') {
      setShowRecommendation(true);
    } else {
      doSubmit();
    }
  };

  const inputClass = "w-full bg-muted/30 border border-border/40 rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-lime font-body";
  const limeColor = '#DAE16B';

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
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <div className="earth-panel rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-bold text-foreground">New Post</h2>
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
                      onClick={() => { setCategory(cat.value); setSubcategory(''); setFulfillment([]); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-display font-medium transition-all ${
                        category === cat.value ? 'ring-1 ring-lime/40 bg-lime/10' : 'hover:bg-muted/20'
                      }`}
                    >
                      <img src={cat.icon} alt={cat.label} className="w-4 h-3.5" />
                      <span className="text-foreground" style={{ fontSize: '13px' }}>{cat.label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-muted-foreground font-body" style={{ fontSize: '12px' }}>
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
                  <p className="text-muted-foreground mb-1.5 font-display" style={{ fontSize: '12px' }}>Tag</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {subcategorySuggestions[category].map((sub) => (
                      <button
                        type="button"
                        key={sub}
                        onClick={() => setSubcategory(sub === subcategory ? '' : sub)}
                        className="px-2.5 py-1 rounded-full font-display font-medium border transition-all"
                        style={subcategory === sub ? {
                          borderColor: `${limeColor}80`,
                          backgroundColor: `${limeColor}20`,
                          color: limeColor,
                          fontSize: '12px',
                        } : {
                          borderColor: 'hsla(15, 10%, 24%, 0.4)',
                          color: 'hsl(25, 15%, 55%)',
                          fontSize: '12px',
                        }}
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
                    <input
                      type="text"
                      placeholder="Quantity, if applicable (e.g. 2 baskets, plenty)"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className={inputClass}
                    />
                    <div>
                      <p className="text-muted-foreground mb-1.5 font-display" style={{ fontSize: '12px' }}>
                        {category === 'offer' ? 'How to get it' : 'How to receive it'}
                      </p>
                      <div className="flex gap-1.5 flex-wrap">
                        {(fulfillmentOptions[category] || []).map((opt) => (
                          <button
                            type="button"
                            key={opt}
                            onClick={() => toggleFulfillment(opt)}
                            className="px-2.5 py-1 rounded-full font-display font-medium border transition-all"
                            style={fulfillment.includes(opt) ? {
                              borderColor: `${limeColor}80`,
                              backgroundColor: `${limeColor}20`,
                              color: limeColor,
                              fontSize: '12px',
                            } : {
                              borderColor: 'hsla(15, 10%, 24%, 0.4)',
                              color: 'hsl(25, 15%, 55%)',
                              fontSize: '12px',
                            }}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Location input */}
                <input
                  type="text"
                  placeholder={category === 'observation' ? 'Location observed' : 'Location (e.g. Union Square, Eastern ridge)'}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={inputClass}
                />

                {/* Map pin picker */}
                <LocationPicker
                  lat={pinLat}
                  lng={pinLng}
                  onLocationChange={handleLocationChange}
                  locationText={location}
                />

                {category === 'request' && (
                  <div>
                    <p className="text-muted-foreground mb-1.5 font-display" style={{ fontSize: '12px' }}>Urgency</p>
                    <div className="flex gap-1.5">
                      {(['low', 'medium', 'high'] as const).map((u) => (
                        <button
                          type="button"
                          key={u}
                          onClick={() => setUrgency(u)}
                          className="px-3 py-1 rounded-full font-display font-medium border transition-all"
                          style={urgency === u
                            ? u === 'high'
                              ? { borderColor: 'hsl(0, 84%, 60%)', backgroundColor: 'hsla(0, 84%, 60%, 0.15)', color: 'hsl(0, 84%, 60%)', fontSize: '12px' }
                              : { borderColor: `${limeColor}80`, backgroundColor: `${limeColor}20`, color: limeColor, fontSize: '12px' }
                            : { borderColor: 'hsla(15, 10%, 24%, 0.4)', color: 'hsl(25, 15%, 55%)', fontSize: '12px' }
                          }
                        >
                          {u.charAt(0).toUpperCase() + u.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {(category === 'event' || category === 'offer') && (
                  <input
                    type="text"
                    placeholder={category === 'event' ? 'When? (e.g. Next full moon, Saturday)' : 'Available until? (e.g. end of week, ongoing)'}
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
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

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-display font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  style={{ backgroundColor: limeColor, color: '#322924', fontSize: '15px' }}
                >
                  Post to Community
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}

      {/* Recommendation overlay for requests */}
      <PostRecommendation
        open={showRecommendation}
        newPost={{ category, title, description, subcategory: subcategory || 'General' }}
        onAccept={(pin) => {
          // User accepted recommendation - still upload their post too
          doSubmit();
        }}
        onSkip={() => {
          // User skipped - proceed with upload
          doSubmit();
        }}
      />
    </AnimatePresence>
  );
}
