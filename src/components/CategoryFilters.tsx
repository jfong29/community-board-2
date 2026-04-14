import { useState } from 'react';
import { PinCategory } from '@/data/pins';
import { motion, AnimatePresence } from 'framer-motion';
import offerNoOutline from '@/assets/offer-no-outline.svg';
import requestNoOutline from '@/assets/request-no-outline.svg';
import observationNoOutline from '@/assets/signal-no-outline.svg';
import gatheringIcon from '@/assets/gathering.svg';
import yFilter from '@/assets/y-filter.svg';
import yFilterLime from '@/assets/y-filter-lime.svg';

interface CategoryFiltersProps {
  activeFilters: Set<PinCategory>;
  onToggle: (cat: PinCategory) => void;
  neighborhoodLabel?: string;
}

const categories: { key: PinCategory; label: string; icon: string; gradient: string; border: string; shadow: string }[] = [
  {
    key: 'offer',
    label: 'OFFERS',
    icon: offerNoOutline,
    gradient: 'linear-gradient(180deg, #C6FF9A 0%, #82D345 63%)',
    border: '0.67px solid #49A800',
    shadow: '0px 4px 4px rgba(182, 223, 150, 0.50) inset',
  },
  {
    key: 'request',
    label: 'REQUESTS',
    icon: requestNoOutline,
    gradient: 'linear-gradient(0deg, rgba(0,0,0,0.10) 0%, rgba(102,102,102,0.10) 100%), linear-gradient(180deg, #FF84CE 0%, #FF61BF 100%)',
    border: '0.67px solid #EC5BB2',
    shadow: '0px 4px 4px rgba(182, 223, 150, 0.20) inset',
  },
  {
    key: 'observation',
    label: 'OBSERVATIONS',
    icon: observationNoOutline,
    gradient: 'linear-gradient(180deg, rgba(255,117,60,0.90) 0%, rgba(255,85,14,0.90) 100%)',
    border: '0.67px solid rgba(208,110,69,0.90)',
    shadow: '0px 4px 4px rgba(244, 237, 232, 0.20) inset',
  },
  {
    key: 'event',
    label: 'GATHERINGS',
    icon: gatheringIcon,
    gradient: 'linear-gradient(180deg, #C16EFA 0%, #BF5BFF 52%, #71459B 100%)',
    border: '0.67px solid rgba(0,0,0,0.20)',
    shadow: '0px 4px 4px rgba(244, 237, 232, 0.20) inset',
  },
];

const DARK_WOOD = '#221B17';

export default function CategoryFilters({ activeFilters, onToggle, neighborhoodLabel }: CategoryFiltersProps) {
  const [expanded, setExpanded] = useState(false);
  const hasActiveFilters = activeFilters.size > 0;

  // Split label into indigenous name and modern name
  const labelParts = neighborhoodLabel?.split(': ') ?? [];
  const indigenousName = labelParts[0] ?? '';
  const modernName = labelParts[1] ?? '';

  return (
    <div
      className="flex items-center w-full relative"
      style={{ padding: '10px 21px', minHeight: 48 }}
    >
      {/* Y toggle button - always on left */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex-shrink-0 flex items-center justify-center transition-all active:scale-95 relative z-10"
        style={{
          width: 40,
          height: 38,
          borderRadius: 11,
          background: 'linear-gradient(0deg, rgba(50,41,36,0.80) 0%, rgba(59,48,42,0.80) 46%, rgba(34,27,23,0.80) 100%)',
          border: `0.68px solid ${DARK_WOOD}`,
          opacity: expanded || hasActiveFilters ? 1 : 0.5,
        }}
        title="Filter categories"
      >
        <img
          src={expanded || hasActiveFilters ? yFilterLime : yFilter}
          alt="Filter"
          className="w-[20px] h-[20px]"
        />
      </button>

      <AnimatePresence mode="wait">
        {!expanded ? (
          /* Location label - centered in the full row, with padding to avoid crashing into filter icon */
          <motion.div
            key="location"
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              paddingLeft: 70,
              paddingRight: 21,
            }}
          >
            {neighborhoodLabel && (
              <div className="text-center">
                <span
                  className="font-display text-sm font-semibold"
                  style={{ color: '#E0E0E0' }}
                >
                  {indigenousName}
                </span>
                {modernName && (
                  <>
                    <span style={{ color: 'rgba(224,224,224,0.5)' }}>{': '}</span>
                    <span
                      className="font-display text-sm font-medium"
                      style={{ color: 'rgba(224,224,224,0.7)' }}
                    >
                      {modernName}
                    </span>
                  </>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="filters"
            className="flex items-center gap-[5px] ml-3 overflow-x-auto scrollbar-none"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.15 }}
          >
            {categories.map(({ key, label, icon, gradient, border, shadow }) => {
              const isActive = activeFilters.size === 0 || activeFilters.has(key);
              return (
                <button
                  key={key}
                  onClick={() => onToggle(key)}
                  className="flex-shrink-0 flex items-center gap-[3px] transition-all active:scale-95"
                  style={{
                    height: 28,
                    paddingTop: 4,
                    paddingBottom: 5,
                    paddingLeft: 11,
                    paddingRight: 13,
                    background: gradient,
                    borderRadius: 39,
                    border: border,
                    boxShadow: shadow,
                    opacity: isActive ? 1 : 0.4,
                  }}
                >
                  <img
                    src={icon}
                    alt={label}
                    className="w-[15px] h-[12px]"
                    style={{ filter: 'brightness(0) saturate(100%)' }}
                  />
                  <span
                    className="font-display font-bold text-[13px] leading-none whitespace-nowrap"
                    style={{ color: DARK_WOOD }}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
