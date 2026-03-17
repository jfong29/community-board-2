import { motion } from 'framer-motion';
import { Sun, CloudSun, Cloud, BatteryMedium, Zap } from 'lucide-react';

// Moon phase calculation
function getMoonPhase(): { icon: string; name: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  
  // Simple moon phase approximation
  const c = Math.floor(365.25 * year);
  const e = Math.floor(30.6 * month);
  const jd = c + e + day - 694039.09;
  const phase = jd / 29.5305882;
  const phaseIndex = Math.round((phase - Math.floor(phase)) * 8) % 8;
  
  const phases = [
    { icon: '🌑', name: 'New' },
    { icon: '🌒', name: 'Waxing Crescent' },
    { icon: '🌓', name: 'First Quarter' },
    { icon: '🌔', name: 'Waxing Gibbous' },
    { icon: '🌕', name: 'Full' },
    { icon: '🌖', name: 'Waning Gibbous' },
    { icon: '🌗', name: 'Last Quarter' },
    { icon: '🌘', name: 'Waning Crescent' },
  ];
  
  return phases[phaseIndex];
}

function getSolarLevel(): number {
  const hour = new Date().getHours();
  if (hour >= 10 && hour <= 14) return 92;
  if (hour >= 7 && hour <= 16) return 68;
  if (hour >= 5 && hour <= 18) return 35;
  return 8;
}

function getWeather(): { icon: React.ReactNode; label: string } {
  const hour = new Date().getHours();
  if (hour >= 6 && hour <= 10) return { icon: <CloudSun size={12} />, label: '' };
  if (hour >= 11 && hour <= 15) return { icon: <Sun size={12} />, label: '' };
  return { icon: <Cloud size={12} />, label: '' };
}

export default function EcoStatusBar() {
  const moon = getMoonPhase();
  const solar = getSolarLevel();
  const weather = getWeather();
  
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 earth-panel border-b border-border/30"
      initial={{ y: -40 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div className="flex items-center justify-between px-4 py-1.5 max-w-screen-xl mx-auto">
        {/* Left: moon + time */}
        <div className="flex items-center gap-2 text-xs font-display text-foreground">
          <span className="text-sm" title={moon.name}>{moon.icon}</span>
          <span className="text-muted-foreground">{timeStr}</span>
        </div>

        {/* Center: eco indicators */}
        <div className="flex items-center gap-3">
          {/* Air quality */}
          <div className="flex items-center gap-1 text-xs" title="Air quality">
            <span className="text-[10px]">🍃</span>
            <span className="text-observation font-display font-semibold">82</span>
          </div>
          {/* Water */}
          <div className="flex items-center gap-1 text-xs" title="Water clarity">
            <span className="text-[10px]">💧</span>
            <span className="text-primary font-display font-semibold">71</span>
          </div>
          {/* Pollinators */}
          <div className="flex items-center gap-1 text-xs" title="Pollinator index">
            <span className="text-[10px]">🐝</span>
            <span className="text-request font-display font-semibold">38</span>
          </div>
        </div>

        {/* Right: weather + solar battery */}
        <div className="flex items-center gap-2 text-xs text-foreground">
          <span className="text-muted-foreground">{weather.icon}</span>
          <div className="flex items-center gap-1" title={`Solar: ${solar}%`}>
            <Zap size={10} className="text-offer" />
            <div className="w-6 h-2.5 rounded-sm border border-border/60 overflow-hidden relative">
              <div
                className="h-full rounded-sm transition-all duration-500"
                style={{
                  width: `${solar}%`,
                  backgroundColor: solar > 50 ? 'hsl(var(--observation))' : solar > 20 ? 'hsl(var(--request))' : 'hsl(var(--destructive))',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
