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
  onExpandChange?: (expanded: boolean) => void;
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

export default function CategoryFilters({ activeFilters, onToggle, onExpandChange }: CategoryFiltersProps) {
  const [expanded, setExpanded] = useState(false);
  const hasActiveFilters = activeFilters.size > 0;

  const toggleExpanded = () => {
    const next = !expanded;
    setExpanded(next);
    onExpandChange?.(next);
  };

  return (
    <div
      className="flex items-center w-full relative py-[15px] px-[10px] font-serif"
      style={{ minHeight: 48 }}
    >
      {/* Y toggle button - always on left */}
      <button
        onClick={toggleExpanded}
        className="flex-shrink-0 flex items-center justify-center transition-all active:scale-95 relative z-10"
        style={{
          width: 40,
          height: 38,
          borderRadius: 11,
          background: 'linear-gradient(0deg, rgba(50,41,36,0.80) 0%, rgba(59,48,42,0.80) 46%, rgba(34,27,23,0.80) 100%)',
          border: `0.68px solid ${DARK_WOOD}`,
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
        {expanded && (
          <motion.div
            key="filters"
            className="flex items-center gap-[3px] ml-2 flex-1 min-w-0"
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
                  className="h-[28px] px-3 rounded-full border font-sans font-bold text-[11px] flex items-center justify-center whitespace-nowrap transition-all active:scale-95"
                  style={{
                    background: gradient,
                    border: border,
                    boxShadow: shadow,
                    color: DARK_WOOD,
                    opacity: isActive ? 1 : 0.4,
                    flex: '1 1 0',
                    minWidth: 0,
                  }}
                >
                  <span className="flex items-center gap-[4px]">
                    <img
                      src={icon}
                      alt={label}
                      className="w-[12px] h-[10px] flex-shrink-0"
                      style={{ filter: 'brightness(0) saturate(100%)' }}
                    />
                    <span>{label}</span>
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
