import { useState, useMemo, useCallback } from 'react';
import { Pin } from '@/data/pins';
import { motion, AnimatePresence } from 'framer-motion';
import offerNoOutline from '@/assets/offer-no-outline.svg';
import requestNoOutline from '@/assets/request-no-outline.svg';
import observationNoOutline from '@/assets/signal-no-outline.svg';
import gatheringNoOutline from '@/assets/gathering.svg';
import checkmarkIcon from '@/assets/checkmark.svg';
import xMarkIcon from '@/assets/x-mark.svg';
import nextPostArrow from '@/assets/next-post-arrow.svg';
import closeTab from '@/assets/close-tab.svg';

const DARK_WOOD = '#221B17';

const categoryColorMap: Record<string, string> = {
  offer: '#79E824',
  request: '#FF48B5',
  observation: '#FF6C2F',
  event: '#B036FF',
};

const categoryIconMap: Record<string, string> = {
  offer: offerNoOutline,
  request: requestNoOutline,
  observation: observationNoOutline,
  event: gatheringNoOutline,
};

const categoryLabel: Record<string, string> = {
  offer: 'Offer',
  request: 'Request',
  observation: 'Observation',
  event: 'Gathering',
};

// Match DetailSheet popup gradients
const categoryStyles: Record<string, { gradient: string; backgroundBlendMode?: string; border: string }> = {
  request: {
    gradient: 'linear-gradient(0deg, rgba(0,0,0,0.10) 0%, rgba(102,102,102,0.10) 100%), linear-gradient(180deg, #FF84CE 0%, #FF61BF 100%)',
    backgroundBlendMode: 'darken, normal',
    border: '#EC5BB2',
  },
  offer: {
    gradient: 'linear-gradient(180deg, #C6FF9A 0%, #82D345 63%)',
    border: '#49A800',
  },
  observation: {
    gradient: 'linear-gradient(180deg, rgba(255,117,60,0.90) 0%, rgba(255,85,14,0.90) 100%)',
    border: 'rgba(208,110,69,0.90)',
  },
  event: {
    gradient: 'linear-gradient(180deg, #C16EFA 0%, #BF5BFF 52%, #71459B 100%)',
    border: 'rgba(0,0,0,0.20)',
  },
};

interface PostPairing {
  post1: Pin;
  post2: Pin;
  reason: string;
}

function generatePairings(pins: Pin[]): PostPairing[] {
  const pairings: PostPairing[] = [];
  const requests = pins.filter(p => p.category === 'request');
  const offers = pins.filter(p => p.category === 'offer');

  // Match requests with offers that share subcategory or keywords
  for (const req of requests) {
    for (const off of offers) {
      const sharedSub = req.subcategory === off.subcategory;
      const titleOverlap = req.title.toLowerCase().split(' ').some(w =>
        w.length > 3 && off.title.toLowerCase().includes(w)
      ) || off.title.toLowerCase().split(' ').some(w =>
        w.length > 3 && req.title.toLowerCase().includes(w)
      );
      const descOverlap = req.description.toLowerCase().split(' ').some(w =>
        w.length > 4 && off.description.toLowerCase().includes(w)
      );
      if (sharedSub || titleOverlap || descOverlap) {
        pairings.push({
          post1: req,
          post2: off,
          reason: sharedSub ? `Both in ${req.subcategory}` : 'Related topics',
        });
      }
    }
  }

  // Also pair similar requests for solidarity
  for (let i = 0; i < requests.length; i++) {
    for (let j = i + 1; j < requests.length; j++) {
      if (requests[i].subcategory === requests[j].subcategory) {
        pairings.push({
          post1: requests[i],
          post2: requests[j],
          reason: `Similar ${requests[i].subcategory} requests`,
        });
      }
    }
  }

  // Shuffle for variety
  for (let i = pairings.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairings[i], pairings[j]] = [pairings[j], pairings[i]];
  }
  return pairings;
}

// Mycelium SVG lines between two cards
function MyceliumLines({ color1, color2 }: { color1: string; color2: string }) {
  return (
    <svg width="100%" height="60" viewBox="0 0 300 60" preserveAspectRatio="none" className="absolute left-0" style={{ top: 'calc(50% - 30px)', zIndex: 5 }}>
      <defs>
        <linearGradient id="myc-grad" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor={color1} stopOpacity="0.8" />
          <stop offset="100%" stopColor={color2} stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <motion.path
        d="M30 30 C80 10, 120 50, 150 30 S220 10, 270 30"
        stroke="url(#myc-grad)" strokeWidth="2" fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
      />
      <motion.path
        d="M30 35 C90 55, 130 15, 150 35 S210 55, 270 35"
        stroke="url(#myc-grad)" strokeWidth="1.5" fill="none" opacity="0.6"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.6 }}
        transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.3 }}
      />
      <motion.path
        d="M30 25 C70 5, 140 45, 150 25 S230 5, 270 25"
        stroke="url(#myc-grad)" strokeWidth="1" fill="none" opacity="0.4"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.4 }}
        transition={{ duration: 1.8, ease: 'easeInOut', delay: 0.5 }}
      />
      {/* Small branching nodes */}
      {[60, 110, 150, 200, 240].map((cx, i) => (
        <motion.circle
          key={i} cx={cx} cy={20 + (i % 3) * 15} r="2.5"
          fill="url(#myc-grad)" opacity="0.5"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.5 }}
          transition={{ delay: 0.8 + i * 0.15, duration: 0.3 }}
        />
      ))}
    </svg>
  );
}

function PostCard({ pin, glow }: { pin: Pin; glow: boolean; side: 'left' | 'right' }) {
  const color = categoryColorMap[pin.category] || '#888';
  const icon = categoryIconMap[pin.category] || offerNoOutline;
  const label = categoryLabel[pin.category] || pin.category;
  const isUrgent = pin.category === 'request' && (pin.urgency === 'critical' || pin.urgency === 'high');
  const cardStyle = categoryStyles[pin.category] || categoryStyles.offer;
  const darkIconFilter = 'brightness(0) saturate(100%)';

  return (
    <motion.div
      className="relative overflow-hidden"
      style={{
        background: cardStyle.gradient,
        backgroundBlendMode: cardStyle.backgroundBlendMode || 'normal',
        borderRadius: '16px',
        padding: '20px 20px 18px 20px',
        outline: `1.6px solid ${glow ? color : cardStyle.border}`,
        outlineOffset: '-1.6px',
        boxShadow: glow
          ? `0px 4px 20px rgba(0,0,0,0.25), 0px 1.6px 10px rgba(232,237,163,0.6) inset, 0 0 30px ${color}55`
          : `0px 4px 20px rgba(0,0,0,0.25), 0px 1.6px 10px rgba(232,237,163,0.6) inset`,
        flex: 1,
        minWidth: 0,
      }}
      animate={glow ? {
        boxShadow: [
          `0px 4px 20px rgba(0,0,0,0.25), 0px 1.6px 10px rgba(232,237,163,0.6) inset, 0 0 30px ${color}55`,
          `0px 4px 20px rgba(0,0,0,0.25), 0px 1.6px 10px rgba(232,237,163,0.6) inset, 0 0 50px ${color}80`,
          `0px 4px 20px rgba(0,0,0,0.25), 0px 1.6px 10px rgba(232,237,163,0.6) inset, 0 0 30px ${color}55`,
        ],
      } : {}}
      transition={glow ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
    >
      {/* Category header */}
      <div className="flex items-center gap-[8px] mb-2">
        <img src={icon} alt="" style={{ width: '15px', height: '13px', filter: darkIconFilter }} />
        <span style={{
          color: DARK_WOOD,
          fontSize: '13px',
          fontFamily: "'Public Sans', sans-serif",
          fontWeight: 700,
          textTransform: 'uppercase',
          lineHeight: '16px',
        }}>
          {isUrgent ? 'Urgent ' : ''}{label}
        </span>
      </div>

      {/* Title */}
      <h3 style={{
        color: DARK_WOOD,
        fontSize: '18px',
        fontFamily: "'Public Sans', sans-serif",
        fontWeight: 700,
        textTransform: 'capitalize',
        lineHeight: '22px',
        marginBottom: '6px',
      }}>
        {pin.title}
      </h3>

      {/* Description */}
      <p style={{
        color: DARK_WOOD,
        fontSize: '12px',
        fontFamily: "'Public Sans', sans-serif",
        fontWeight: 400,
        lineHeight: '16px',
        marginBottom: '10px',
        opacity: 0.9,
      }}>
        {pin.description.split('\n')[0]}
      </p>

      {/* Posted by */}
      <div className="flex items-center gap-2" style={{ opacity: 0.8 }}>
        <span style={{
          color: DARK_WOOD,
          fontSize: '11px',
          fontFamily: "'Public Sans', sans-serif",
          fontWeight: 500,
          textDecoration: 'underline',
          textUnderlineOffset: '2px',
        }}>
          {pin.postedBy}
        </span>
      </div>
    </motion.div>
  );
}

interface ConnectingPostsProps {
  open: boolean;
  onClose: () => void;
  pins: Pin[];
}

export default function ConnectingPosts({ open, onClose, pins }: ConnectingPostsProps) {
  const pairings = useMemo(() => generatePairings(pins), [pins]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [matched, setMatched] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [matchedPairs, setMatchedPairs] = useState<Set<number>>(new Set());

  const pairing = pairings[currentIdx] || null;

  const handleMatch = useCallback(() => {
    setMatched(true);
    setShowCelebration(true);
    setMatchedPairs(prev => new Set(prev).add(currentIdx));
    setTimeout(() => {
      setShowCelebration(false);
    }, 3000);
  }, [currentIdx]);

  const handleReject = useCallback(() => {
    goNext();
  }, []);

  const goNext = useCallback(() => {
    setMatched(false);
    setShowCelebration(false);
    setCurrentIdx(prev => (prev + 1) % Math.max(pairings.length, 1));
  }, [pairings.length]);

  const goPrev = useCallback(() => {
    setMatched(false);
    setShowCelebration(false);
    setCurrentIdx(prev => (prev - 1 + pairings.length) % Math.max(pairings.length, 1));
  }, [pairings.length]);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex flex-col"
          style={{ background: 'hsla(15, 16%, 10%, 0.97)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-[30px] pt-6 pb-1">
            <h2 style={{
              fontFamily: 'Labrada, serif',
              fontWeight: 600,
              fontSize: '24px',
              color: '#F4EDE8',
            }}>
              Connecting Posts
            </h2>
            <button
              onClick={onClose}
              className="hover:opacity-80 transition-opacity active:scale-95"
            >
              <img src={closeTab} alt="Close" style={{ width: '22px', height: '22px' }} />
            </button>
          </div>

          {/* Prompt under title */}
          <div className="px-[30px] pb-3">
            <span style={{
              fontFamily: "'Public Sans', sans-serif",
              fontSize: '14px',
              fontWeight: 500,
              color: '#F4EDE8',
              opacity: 0.7,
            }}>
              Do these connect?
            </span>
          </div>

          {/* Reason label */}
          {pairing && (
            <div className="px-[30px] mb-4">
              <span style={{
                fontFamily: "'Public Sans', sans-serif",
                fontSize: '13px',
                color: '#DAE16B',
                opacity: 0.8,
              }}>
                {pairing.reason}
              </span>
              <span style={{
                fontFamily: "'Public Sans', sans-serif",
                fontSize: '13px',
                color: '#F4EDE8',
                opacity: 0.5,
                marginLeft: '12px',
              }}>
                {currentIdx + 1} / {pairings.length}
              </span>
            </div>
          )}

          {/* Cards area */}
          <div className="flex-1 flex flex-col items-center justify-center px-[30px] relative">
            {pairing ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIdx}
                  className="w-full max-w-lg flex flex-col gap-0 relative"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  <PostCard pin={pairing.post1} glow={matched} side="left" />

                  {/* Connection zone */}
                  <div className="relative h-[40px] w-full flex items-center justify-center">
                    {matched && (
                      <MyceliumLines
                        color1={categoryColorMap[pairing.post1.category] || '#888'}
                        color2={categoryColorMap[pairing.post2.category] || '#888'}
                      />
                    )}
                  </div>

                  <PostCard pin={pairing.post2} glow={matched} side="right" />
                </motion.div>
              </AnimatePresence>
            ) : (
              <p style={{ fontFamily: "'Public Sans', sans-serif", fontSize: '16px', color: '#F4EDE8', opacity: 0.6 }}>
                No more pairings to show
              </p>
            )}

            {/* Celebration overlay */}
            <AnimatePresence>
              {showCelebration && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <motion.div
                    className="text-center"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                  >
                    <h2 style={{
                      fontFamily: 'Labrada, serif',
                      fontWeight: 700,
                      fontSize: '36px',
                      color: '#DAE16B',
                      textShadow: '0 0 40px rgba(218,225,107,0.5)',
                    }}>
                      It's a Match!
                    </h2>
                    <p style={{
                      fontFamily: "'Public Sans', sans-serif",
                      fontSize: '14px',
                      color: '#F4EDE8',
                      opacity: 0.7,
                      marginTop: '8px',
                    }}>
                      These posts are now connected
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom controls */}
          <div className="flex items-center justify-center gap-6 pb-8 pt-4 px-[30px]">
            {/* Previous arrow */}
            <button
              onClick={goPrev}
              className="flex items-center justify-center transition-all active:scale-90"
              style={{ width: '40px', height: '40px' }}
            >
              <img
                src={nextPostArrow}
                alt="Previous"
                style={{ width: '17px', height: '26px', transform: 'scaleX(-1)' }}
              />
            </button>

            {/* Reject (X) */}
            <button
              onClick={handleReject}
              className="flex items-center justify-center rounded-full transition-all active:scale-90"
              style={{
                width: '56px',
                height: '56px',
                background: 'hsla(0, 60%, 50%, 0.15)',
                border: '1.5px solid hsla(0, 60%, 50%, 0.4)',
              }}
            >
              <img src={xMarkIcon} alt="Not a match" style={{ width: '22px', height: '22px', filter: 'brightness(0) invert(0.4) sepia(1) saturate(5) hue-rotate(330deg)' }} />
            </button>

            {/* Match (checkmark) */}
            <button
              onClick={handleMatch}
              className="flex items-center justify-center rounded-full transition-all active:scale-90"
              style={{
                width: '56px',
                height: '56px',
                background: 'hsla(65, 60%, 60%, 0.15)',
                border: '1.5px solid #DAE16B',
              }}
            >
              <img src={checkmarkIcon} alt="Match" style={{ width: '24px', height: '22px', filter: 'brightness(0) invert(0.85) sepia(1) saturate(3) hue-rotate(25deg)' }} />
            </button>

            {/* Next arrow */}
            <button
              onClick={goNext}
              className="flex items-center justify-center transition-all active:scale-90"
              style={{ width: '40px', height: '40px' }}
            >
              <img src={nextPostArrow} alt="Next" style={{ width: '17px', height: '26px' }} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
