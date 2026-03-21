import { Pin, samplePins, categoryConfig } from '@/data/pins';
import { landmarks } from '@/data/landmarks';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import offerIcon from '@/assets/offer.svg';
import requestIcon from '@/assets/request.svg';
import observationIcon from '@/assets/observation.svg';
import gatheringIcon from '@/assets/gathering.svg';

interface SubcategorySheetProps {
  subcategory: string | null;
  onClose: () => void;
  onPinSelect: (pin: Pin) => void;
}

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

export default function SubcategorySheet({ subcategory, onClose, onPinSelect }: SubcategorySheetProps) {
  if (!subcategory) return null;

  const matchingPins: Pin[] = samplePins.filter(
    (p) => p.subcategory.toLowerCase() === subcategory.toLowerCase()
  );

  const landmarkPins: Pin[] = landmarks.flatMap((lm) =>
    lm.pins
      .filter((lp) => lp.subcategory.toLowerCase() === subcategory.toLowerCase())
      .map((lp) => ({
        id: `${lm.id}-${lp.title}`,
        category: lp.category,
        title: lp.title,
        description: lp.description,
        subcategory: lp.subcategory,
        distance: lp.distance,
        postedBy: lp.postedBy,
        x: lm.x,
        y: lm.y,
      }))
  );

  const allItems = [...matchingPins, ...landmarkPins];

  return (
    <AnimatePresence>
      {subcategory && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 md:px-0 md:max-w-md md:mx-auto max-h-[70vh]"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="earth-panel rounded-2xl p-5 space-y-4 max-h-[65vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-foreground">
                {subcategory} <span className="text-muted-foreground font-normal" style={{ fontSize: '14px' }}>nearby</span>
              </h2>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-muted/30 transition-colors text-foreground">
                <X size={18} />
              </button>
            </div>

            {allItems.length === 0 ? (
              <p className="text-muted-foreground">No nearby items found.</p>
            ) : (
              <div className="space-y-2">
                {allItems.map((item, i) => (
                  <motion.button
                    key={item.id}
                    className="w-full flex items-start gap-3 p-3 rounded-xl bg-muted/20 text-left hover:bg-muted/40 transition-colors cursor-pointer"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => {
                      onPinSelect(item);
                      onClose();
                    }}
                  >
                    <img src={categoryIcons[item.category]} alt={categoryLabels[item.category]} className="w-5 h-4 mt-1" />
                    <div className="flex-1 min-w-0">
                      <span className="font-display font-bold uppercase tracking-wider text-muted-foreground" style={{ fontSize: '11px' }}>
                        {categoryLabels[item.category]}
                      </span>
                      <p className="font-display font-semibold text-foreground mt-0.5">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-muted-foreground" style={{ fontSize: '13px' }}>
                        <span>{item.distance}</span>
                        <span>·</span>
                        <span>{item.postedBy}</span>
                      </div>
                    </div>
                    <span className="text-muted-foreground/40 mt-1" style={{ fontSize: '13px' }}>→</span>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
