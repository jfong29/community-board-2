import { useState } from 'react';
import { PinCategory, Pin } from '@/data/pins';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import PinIcon from './PinIcon';

interface AddPinModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (pin: Omit<Pin, 'id' | 'x' | 'y'>) => void;
}

const categories: PinCategory[] = ['offer', 'request', 'signal', 'event'];
const categoryLabels: Record<PinCategory, string> = {
  offer: 'Offer',
  request: 'Request',
  signal: 'Signal',
  event: 'Event',
};

export default function AddPinModal({ open, onClose, onSubmit }: AddPinModalProps) {
  const [category, setCategory] = useState<PinCategory>('offer');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subcategory, setSubcategory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      category,
      title,
      description,
      subcategory: subcategory || 'General',
      distance: 'Nearby',
      postedBy: 'You',
    });
    setTitle('');
    setDescription('');
    setSubcategory('');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Modal */}
          <motion.div
            className="fixed inset-x-4 top-1/2 z-50 md:max-w-md md:mx-auto"
            initial={{ y: '-40%', opacity: 0, scale: 0.9 }}
            animate={{ y: '-50%', opacity: 1, scale: 1 }}
            exit={{ y: '-40%', opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-lg font-bold text-foreground">
                  Add to the Board
                </h2>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-muted/30 text-foreground">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category selector */}
                <div className="flex gap-2">
                  {categories.map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-display font-medium transition-all ${
                        category === cat ? 'bg-muted/50 ring-1 ring-foreground/20' : 'hover:bg-muted/20'
                      }`}
                    >
                      <PinIcon category={cat} size={14} animate={false} />
                      <span className="text-foreground">{categoryLabels[cat]}</span>
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-muted/30 border border-border/40 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-body"
                />

                <input
                  type="text"
                  placeholder="Category (e.g. Food, Air Quality)"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full bg-muted/30 border border-border/40 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-body"
                />

                <textarea
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-muted/30 border border-border/40 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-body resize-none"
                />

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-display font-semibold text-sm bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] transition-transform"
                >
                  Place on Map
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
