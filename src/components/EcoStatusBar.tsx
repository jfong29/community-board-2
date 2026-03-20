import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, CloudSun, Cloud, Zap, User } from 'lucide-react';
import SearchBar from './SearchBar';
import SeasonalIndicators from './SeasonalIndicators';
import { Pin } from '@/data/pins';

function getMoonPhase(): { icon: string; name: string } {
  const now = new Date();
  const c = Math.floor(365.25 * now.getFullYear());
  const e = Math.floor(30.6 * (now.getMonth() + 1));
  const jd = c + e + now.getDate() - 694039.09;
  const phase = jd / 29.5305882;
  const phaseIndex = Math.round((phase - Math.floor(phase)) * 8) % 8;
  const phases = [
    { icon: '🌑', name: 'New' }, { icon: '🌒', name: 'Waxing Crescent' },
    { icon: '🌓', name: 'First Quarter' }, { icon: '🌔', name: 'Waxing Gibbous' },
    { icon: '🌕', name: 'Full' }, { icon: '🌖', name: 'Waning Gibbous' },
    { icon: '🌗', name: 'Last Quarter' }, { icon: '🌘', name: 'Waning Crescent' },
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

function getWeather(): { icon: React.ReactNode } {
  const hour = new Date().getHours();
  if (hour >= 6 && hour <= 10) return { icon: <CloudSun size={12} /> };
  if (hour >= 11 && hour <= 15) return { icon: <Sun size={12} /> };
  return { icon: <Cloud size={12} /> };
}

interface EcoStatusBarProps {
  initialSearch?: string;
  onPinSelect: (pin: Pin) => void;
}

export default function EcoStatusBar({ initialSearch = '', onPinSelect }: EcoStatusBarProps) {
  const navigate = useNavigate();
  const [showSeasonal, setShowSeasonal] = useState(false);
  const moon = getMoonPhase();
  const solar = getSolarLevel();
  const weather = getWeather();
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 earth-panel border-b border-border/30"
        initial={{ y: -40 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <div className="flex items-center justify-between gap-2 px-3 py-1.5 max-w-screen-xl mx-auto">
          {/* Left: moon + time + seasonal day */}
          <button
            className="flex items-center gap-1.5 text-sm font-display text-foreground hover:bg-muted/20 rounded-lg px-1.5 py-0.5 transition-colors flex-shrink-0"
            onClick={() => setShowSeasonal(true)}
            title="View seasonal indicators"
          >
            <span className="text-sm" title={moon.name}>{moon.icon}</span>
            <span className="text-muted-foreground text-sm">{timeStr}</span>
            <span className="text-xs font-medium hidden sm:inline" style={{ color: '#DAE16B' }}>· Siquon</span>
          </button>

          {/* Center: search bar */}
          <SearchBar initialQuery={initialSearch} onPinSelect={onPinSelect} />

          {/* Right: eco indicators + profile */}
          <div className="flex items-center gap-2 text-sm flex-shrink-0">
            <div className="hidden sm:flex items-center gap-2">
              <span title="Air quality" className="flex items-center gap-0.5">
                <span className="text-xs">🍃</span>
                <span className="text-observation font-display font-semibold">82</span>
              </span>
              <span title="Water" className="flex items-center gap-0.5">
                <span className="text-xs">💧</span>
                <span className="text-primary font-display font-semibold">71</span>
              </span>
            </div>
            <span className="text-muted-foreground">{weather.icon}</span>
            <div className="flex items-center gap-1" title={`Solar: ${solar}%`}>
              <Zap size={10} style={{ color: '#DAE16B' }} />
              <div className="w-5 h-2 rounded-sm border border-border/60 overflow-hidden">
                <div
                  className="h-full rounded-sm transition-all duration-500"
                  style={{
                    width: `${solar}%`,
                    backgroundColor: solar > 50 ? 'hsl(var(--observation))' : solar > 20 ? 'hsl(var(--request))' : 'hsl(var(--destructive))',
                  }}
                />
              </div>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
              style={{ backgroundColor: 'rgba(218,225,107,0.2)', border: '1px solid rgba(218,225,107,0.4)' }}
              title="Profile"
            >
              <User size={13} style={{ color: '#DAE16B' }} />
            </button>
          </div>
        </div>
      </motion.div>

      <SeasonalIndicators open={showSeasonal} onClose={() => setShowSeasonal(false)} />
    </>
  );
}
