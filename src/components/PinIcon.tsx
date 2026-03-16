import { PinCategory } from '@/data/pins';
import { motion } from 'framer-motion';

interface PinIconProps {
  category: PinCategory;
  size?: number;
  onClick?: () => void;
  animate?: boolean;
}

const colorMap: Record<PinCategory, string> = {
  offer: '#00838A',
  request: '#D54E00',
  signal: '#1D8636',
  event: '#9D7AD2',
};

const glowMap: Record<PinCategory, string> = {
  offer: '0 0 14px rgba(0,131,138,0.7)',
  request: '0 0 14px rgba(213,78,0,0.7)',
  signal: '0 0 14px rgba(29,134,54,0.7)',
  event: '0 0 14px rgba(157,122,210,0.7)',
};

// Offer = up arrow, Request = down arrow, Signal = wide diamond, Event = horizontal arrows
function renderShape(category: PinCategory, size: number, color: string) {
  const s = size;
  const half = s / 2;
  switch (category) {
    case 'offer':
      return (
        <polygon
          points={`${half},2 ${s - 4},${s - 4} 4,${s - 4}`}
          fill={color}
          fillOpacity={0.85}
          stroke={color}
          strokeWidth={1.5}
        />
      );
    case 'request':
      return (
        <polygon
          points={`4,4 ${s - 4},4 ${half},${s - 2}`}
          fill={color}
          fillOpacity={0.85}
          stroke={color}
          strokeWidth={1.5}
        />
      );
    case 'signal':
      return (
        <polygon
          points={`${half},4 ${s - 2},${half} ${half},${s - 4} 2,${half}`}
          fill={color}
          fillOpacity={0.85}
          stroke={color}
          strokeWidth={1.5}
        />
      );
    case 'event':
      return (
        <>
          {/* Left arrow pointing right */}
          <polygon
            points={`2,${half} ${half - 2},6 ${half - 2},${s - 6}`}
            fill={color}
            fillOpacity={0.85}
            stroke={color}
            strokeWidth={1}
          />
          {/* Right arrow pointing left */}
          <polygon
            points={`${s - 2},${half} ${half + 2},6 ${half + 2},${s - 6}`}
            fill={color}
            fillOpacity={0.85}
            stroke={color}
            strokeWidth={1}
          />
        </>
      );
  }
}

export default function PinIcon({ category, size = 32, onClick, animate = true }: PinIconProps) {
  const color = colorMap[category];
  const glow = glowMap[category];

  return (
    <motion.div
      className="cursor-pointer relative"
      onClick={onClick}
      whileHover={{ scale: 1.3 }}
      whileTap={{ scale: 0.9 }}
      initial={animate ? { scale: 0, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      style={{ filter: `drop-shadow(${glow})` }}
    >
      {/* Pulse ring */}
      {animate && (
        <div
          className="absolute inset-0 rounded-full ripple-ring"
          style={{ backgroundColor: color, opacity: 0.3 }}
        />
      )}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {renderShape(category, size, color)}
      </svg>
    </motion.div>
  );
}
