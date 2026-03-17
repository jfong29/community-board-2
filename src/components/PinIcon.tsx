import { PinCategory } from '@/data/pins';
import { motion } from 'framer-motion';

interface PinIconProps {
  category: PinCategory;
  size?: number;
  onClick?: () => void;
  animate?: boolean;
  advertisement?: boolean;
}

const colorMap: Record<PinCategory, string> = {
  offer: '#00838A',
  request: '#D54E00',
  observation: '#1D8636',
  event: '#9D7AD2',
};

const glowMap: Record<PinCategory, string> = {
  offer: '0 0 18px rgba(0,131,138,0.8)',
  request: '0 0 18px rgba(213,78,0,0.8)',
  observation: '0 0 10px rgba(29,134,54,0.5)',
  event: '0 0 14px rgba(157,122,210,0.6)',
};

function renderShape(category: PinCategory, size: number, color: string, isAd: boolean) {
  const s = size;
  const half = s / 2;

  if (isAd && (category === 'offer' || category === 'request')) {
    // Advertisement style: bold filled shape with inner detail
    const isOffer = category === 'offer';
    return (
      <>
        {/* Outer glow ring */}
        <circle cx={half} cy={half} r={half - 2} fill="none" stroke={color} strokeWidth={2} strokeOpacity={0.4}>
          <animate attributeName="r" values={`${half - 4};${half - 1};${half - 4}`} dur="2s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
        {/* Main shape */}
        {isOffer ? (
          <polygon
            points={`${half},3 ${s - 4},${s - 4} 4,${s - 4}`}
            fill={color}
            stroke={color}
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        ) : (
          <polygon
            points={`4,4 ${s - 4},4 ${half},${s - 3}`}
            fill={color}
            stroke={color}
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        )}
        {/* Inner accent */}
        <circle cx={half} cy={isOffer ? half + 3 : half - 2} r={3} fill="hsla(40,20%,85%,0.9)" />
      </>
    );
  }

  switch (category) {
    case 'offer':
      return (
        <polygon
          points={`${half},1 ${half + 3},${s * 0.35} ${s - 3},${s - 3} ${half + 1},${s * 0.7} ${half - 1},${s * 0.7} 3,${s - 3} ${half - 3},${s * 0.35}`}
          fill={color}
          fillOpacity={0.9}
          stroke={color}
          strokeWidth={1}
          strokeLinejoin="round"
        />
      );
    case 'request':
      return (
        <polygon
          points={`3,3 ${half - 3},${s * 0.3} ${half - 1},${s * 0.3} ${half},${s - 1} ${half + 1},${s * 0.3} ${half + 3},${s * 0.3} ${s - 3},3`}
          fill={color}
          fillOpacity={0.9}
          stroke={color}
          strokeWidth={1}
          strokeLinejoin="round"
        />
      );
    case 'observation':
      return (
        <polygon
          points={`${half},2 ${s - 1},${half - 1} ${s - 2},${half + 1} ${half},${s - 2} 2,${half + 1} 1,${half - 1}`}
          fill={color}
          fillOpacity={0.7}
          stroke={color}
          strokeWidth={0.8}
          strokeLinejoin="round"
        />
      );
    case 'event':
      return (
        <>
          <polygon
            points={`1,${half} ${half - 3},4 ${half - 2},${half - 2} ${half - 2},${half + 2} ${half - 3},${s - 4}`}
            fill={color}
            fillOpacity={0.9}
            stroke={color}
            strokeWidth={0.8}
            strokeLinejoin="round"
          />
          <polygon
            points={`${s - 1},${half} ${half + 3},4 ${half + 2},${half - 2} ${half + 2},${half + 2} ${half + 3},${s - 4}`}
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

export default function PinIcon({ category, size = 32, onClick, animate = true, advertisement = false }: PinIconProps) {
  const color = colorMap[category];
  const glow = advertisement ? glowMap[category].replace(')', ', 1)').replace('0.', '0.') : glowMap[category];

  return (
    <motion.div
      className="cursor-pointer relative"
      onClick={onClick}
      whileHover={{ scale: 1.3 }}
      whileTap={{ scale: 0.9 }}
      initial={animate ? { scale: 0, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      style={{ filter: `drop-shadow(${glowMap[category]})` }}
    >
      {animate && (
        <div
          className="absolute inset-0 rounded-full ripple-ring"
          style={{ backgroundColor: color, opacity: advertisement ? 0.5 : 0.3 }}
        />
      )}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {renderShape(category, size, color, advertisement)}
      </svg>
    </motion.div>
  );
}
