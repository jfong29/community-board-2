import { motion } from 'framer-motion';
import { climateIndicators, ClimateIndicator } from '@/data/climate-global';
import arrowSvg from '@/assets/arrow.svg';

interface Props {
  onDrillIn: () => void;
}

function IndicatorRow({ ind, index }: { ind: ClimateIndicator; index: number }) {
  const color =
    ind.status === 'on-track' ? 'hsl(var(--offer))' :
    ind.status === 'off-track' ? 'hsl(var(--observation))' :
    'hsl(var(--destructive))';

  return (
    <motion.div
      className="earth-panel rounded-2xl p-4 flex items-center gap-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <span className="text-2xl shrink-0">{ind.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground" style={{ fontFamily: 'Labrada' }}>
          {ind.label}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5" style={{ fontFamily: 'Public Sans' }}>
          {ind.description.length > 60 ? ind.description.slice(0, 60) + '…' : ind.description}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-lg font-bold" style={{ fontFamily: 'Public Sans', color }}>
          {typeof ind.value === 'number' && ind.value % 1 !== 0 ? ind.value.toFixed(1) : ind.value}
        </span>
        <img src={arrowSvg} alt="" className="w-4 h-2 opacity-70" />
        <span className="text-lg font-bold text-[hsl(var(--request))]" style={{ fontFamily: 'Public Sans' }}>
          {ind.target}
        </span>
      </div>
    </motion.div>
  );
}

export default function ClimateStatsOverview({ onDrillIn }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🌡️</span>
        <h2 className="text-xl italic font-medium text-foreground" style={{ fontFamily: 'Labrada' }}>
          Climate Crisis
        </h2>
      </div>

      <p className="text-xs text-muted-foreground" style={{ fontFamily: 'Public Sans' }}>
        Where we stand on global climate indicators. Tap below to vote on policies and commit to personal actions.
      </p>

      <div className="space-y-2">
        {climateIndicators.map((ind, i) => (
          <IndicatorRow key={ind.id} ind={ind} index={i} />
        ))}
      </div>

      <motion.button
        onClick={onDrillIn}
        className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wide"
        style={{
          fontFamily: 'Public Sans',
          background: 'linear-gradient(180deg, hsla(64, 67%, 65%, 0.3), hsla(64, 67%, 45%, 0.3))',
          border: '1px solid hsl(var(--lime))',
          color: 'hsl(var(--lime))',
        }}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.01 }}
      >
        Vote on Policies & Take Action →
      </motion.button>
    </div>
  );
}
