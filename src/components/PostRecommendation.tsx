import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pin, samplePins } from '@/data/pins';
import offerNoOutline from '@/assets/offer-no-outline.svg';
import requestNoOutline from '@/assets/request-no-outline.svg';
import observationNoOutline from '@/assets/signal-no-outline.svg';
import gatheringNoOutline from '@/assets/gathering.svg';
import checkmarkIcon from '@/assets/checkmark.svg';
import xMarkIcon from '@/assets/x-mark.svg';

const categoryColorMap: Record<string, string> = {
  offer: '#79E824',
  request: '#FF48B5',
  observation: '#FF6C2F',
  event: '#B036FF',
};

const categoryIcons: Record<string, string> = {
  offer: offerNoOutline,
  request: requestNoOutline,
  observation: observationNoOutline,
  event: gatheringNoOutline,
};

const categoryLabels: Record<string, string> = {
  offer: 'Offer',
  request: 'Request',
  observation: 'Observation',
  event: 'Gathering',
};

const WATER_DRINKING_KEYWORDS = [
  'drinking', 'fresh water', 'gallons', 'potable', 'fountain', 'supply',
  'purif', 'filter', 'boil', 'tap water', 'water supply',
];

function computeRelevance(pin: Pin, title: string, description: string, subcategory: string): number {
  const pinText = `${pin.title} ${pin.description} ${pin.subcategory}`.toLowerCase();
  const searchText = `${title} ${description} ${subcategory}`.toLowerCase();
  const searchWords = searchText.split(/\s+/).filter(w => w.length > 3);
  
  let score = 0;
  
  // Subcategory exact match
  if (pin.subcategory.toLowerCase() === subcategory.toLowerCase()) score += 10;
  
  // Word overlap
  for (const word of searchWords) {
    if (pinText.includes(word)) score += 2;
    if (pin.title.toLowerCase().includes(word)) score += 3;
  }
  
  // Water-specific boosting
  if (searchText.includes('water')) {
    const isConsumable = WATER_DRINKING_KEYWORDS.some(kw => pinText.includes(kw));
    if (isConsumable) score += 5;
  }
  
  // Prefer offers when the new post is a request
  if (pin.category === 'offer') score += 2;
  
  // Urgency boost
  if (pin.urgency === 'critical' || pin.urgency === 'high') score += 1;
  
  return score;
}

interface PostRecommendationProps {
  open: boolean;
  newPost: {
    category: string;
    title: string;
    description: string;
    subcategory: string;
  };
  onAccept: (pin: Pin) => void;
  onSkip: () => void;
}

export default function PostRecommendation({ open, newPost, onAccept, onSkip }: PostRecommendationProps) {
  const [dismissed, setDismissed] = useState(false);

  const recommendation = useMemo(() => {
    if (!newPost.title) return null;
    
    // Find the best matching pin that could fulfill this request
    const oppositeCategory = newPost.category === 'request' ? 'offer' : 
                            newPost.category === 'offer' ? 'request' : null;
    
    const candidates = samplePins
      .filter(p => {
        // Prefer opposite category (offer for request, request for offer)
        if (oppositeCategory && p.category === oppositeCategory) return true;
        // Also allow same category for solidarity matches
        if (p.category === newPost.category) return true;
        return false;
      })
      .map(p => ({
        pin: p,
        score: computeRelevance(p, newPost.title, newPost.description, newPost.subcategory),
      }))
      .filter(r => r.score > 4) // Only strong matches
      .sort((a, b) => b.score - a.score);
    
    return candidates[0]?.pin || null;
  }, [newPost]);

  if (!open || !recommendation || dismissed) return null;

  const accentColor = categoryColorMap[recommendation.category] || '#68D07F';

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-background/70" onClick={onSkip} />
        
        <motion.div
          className="relative z-10 w-[min(90vw,360px)]"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
        >
          {/* Question header */}
          <div className="text-center mb-4">
            <p className="text-foreground font-display text-lg font-semibold">
              Is this relevant?
            </p>
            <p className="text-muted-foreground text-xs font-body mt-1">
              We found a post that might fulfill your {newPost.category}
            </p>
          </div>

          {/* Recommended pin card */}
          <div
            className="rounded-[7.8px] overflow-hidden"
            style={{
              background: 'hsla(15, 18%, 16%, 0.90)',
              border: `1px solid ${accentColor}`,
              boxShadow: `1px 4px 24px 10px rgba(0, 0, 0, 0.55)`,
            }}
          >
            <div style={{ padding: '17px 20px' }} className="space-y-[7.5px]">
              {/* Category row */}
              <div className="flex items-center gap-[5px]">
                <img src={categoryIcons[recommendation.category]} alt="" style={{ width: '15px', height: '13px' }} />
                <span
                  style={{
                    color: accentColor,
                    fontSize: '12px',
                    fontFamily: "'Public Sans', sans-serif",
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    lineHeight: '14.4px',
                  }}
                >
                  {categoryLabels[recommendation.category]}
                </span>
                <span
                  className="rounded-full"
                  style={{
                    border: `0.94px solid ${accentColor}`,
                    backgroundColor: `${accentColor}18`,
                    color: accentColor,
                    fontSize: '10px',
                    fontFamily: "'Public Sans', sans-serif",
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    lineHeight: '12px',
                  }}
                >
                  {recommendation.subcategory}
                </span>
              </div>

              {/* Title */}
              <p
                className="text-foreground"
                style={{
                  fontSize: '20px',
                  fontFamily: "'Labrada', serif",
                  fontWeight: 600,
                  lineHeight: '24px',
                }}
              >
                {recommendation.title}
              </p>

              {/* Description */}
              <p
                className="text-foreground"
                style={{
                  fontSize: '12px',
                  fontFamily: "'Public Sans', sans-serif",
                  fontWeight: 400,
                }}
              >
                {recommendation.description.split('\n')[0]}
              </p>

              {/* Location */}
              <p
                style={{
                  opacity: 0.8,
                  color: '#F4EDE8',
                  fontSize: '10px',
                  fontFamily: "'Public Sans', sans-serif",
                  fontWeight: 400,
                  lineHeight: '12px',
                }}
              >
                {recommendation.distance}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-6 mt-5">
            <button
              onClick={() => { setDismissed(true); onSkip(); }}
              className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style={{
                background: 'hsla(15, 16%, 17%, 0.92)',
                border: '2px solid hsla(15, 12%, 30%, 0.5)',
              }}
            >
              <img src={xMarkIcon} alt="Skip" className="w-5 h-5" />
            </button>
            <button
              onClick={() => { setDismissed(true); onAccept(recommendation); }}
              className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style={{
                background: '#DAE16B',
                border: '2px solid #DAE16B',
              }}
            >
              <img src={checkmarkIcon} alt="Accept" className="w-6 h-6" style={{ filter: 'brightness(0)' }} />
            </button>
          </div>

          <p className="text-center text-muted-foreground text-[10px] mt-3 font-body">
            Skip to upload your post without connecting
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
