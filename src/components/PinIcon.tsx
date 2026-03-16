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
  observation: '#1D8636',
  event: '#9D7AD2',
};

const glowMap: Record<PinCategory, string> = {
  offer: '0 0 14px rgba(0,131,138,0.7)',
  request: '0 0 14px rgba(213,78,0,0.7)',
  observation: '0 0 14px rgba(29,134,54,0.7)',
  event: '0 0 14px rgba(157,122,210,0.7)',
};

// Ragged/cut-paper edge shapes — organic hand-cut feel
function renderShape(category: PinCategory, size: number, color: string) {
  const s = size;
  const half = s / 2;
  switch (category) {
    case 'offer':
      // Up arrow with ragged edges
      return (
        <polygon
          points={`${half},1 ${half+3},${s*0.35} ${s-3},${s-3} ${half+1},${s*0.7} ${half-1},${s*0.7} 3,${s-3} ${half-3},${s*0.35}`}
          fill={color}
          fillOpacity={0.9}
          stroke={color}
          strokeWidth={1}
          strokeLinejoin="round"
        />
      );
    case 'request':
      // Down arrow with ragged edges
      return (
        <polygon
          points={`3,3 ${half-3},${s*0.3} ${half-1},${s*0.3} ${half},${s-1} ${half+1},${s*0.3} ${half+3},${s*0.3} ${s-3},3`}
          fill={color}
          fillOpacity={0.9}
          stroke={color}
          strokeWidth={1}
          strokeLinejoin="round"
        />
      );
    case 'observation':
      // Wide diamond with organic edges
      return (
        <polygon
          points={`${half},2 ${s-1},${half-1} ${s-2},${half+1} ${half},${s-2} 2,${half+1} 1,${half-1}`}
          fill={color}
          fillOpacity={0.9}
          stroke={color}
          strokeWidth={1}
          strokeLinejoin="round"
        />
      );
    case 'event':
      // Converging arrows with rough edges
      return (
        <>
          <polygon
            points={`1,${half} ${half-3},4 ${half-2},${half-2} ${half-2},${half+2} ${half-3},${s-4}`}
            fill={color}
            fillOpacity={0.9}
            stroke={color}
            strokeWidth={0.8}
            strokeLinejoin="round"
          />
          <polygon
            points={`${s-1},${half} ${half+3},4 ${half+2},${half-2} ${half+2},${half+2} ${half+3},${s-4}`}
            fill={color}
            fillOpacity={0.9}
            stroke={color}
            strokeWidth={0.8}
            strokeLinejoin="round"
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
