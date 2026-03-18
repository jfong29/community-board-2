import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const [phase, setPhase] = useState<'lock' | 'dismiss'>('lock');
  const navigate = useNavigate();

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Moon phase
  const c = Math.floor(365.25 * now.getFullYear());
  const e = Math.floor(30.6 * (now.getMonth() + 1));
  const jd = c + e + now.getDate() - 694039.09;
  const phaseVal = jd / 29.5305882;
  const phaseIndex = Math.round((phaseVal - Math.floor(phaseVal)) * 8) % 8;
  const moonIcons = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];

  const handleNotificationTap = () => {
    navigate('/?search=Water');
  };

  const handleDismiss = () => {
    navigate('/');
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center select-none">
      {/* Lock screen top */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex flex-col items-center pt-16"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <span className="text-2xl mb-1">{moonIcons[phaseIndex]}</span>
        <p className="font-display text-5xl font-light text-foreground tracking-tight">{timeStr}</p>
        <p className="font-display text-sm text-muted-foreground mt-1">Siquon · Waxing Moon</p>
      </motion.div>

      {/* Notification */}
      <motion.div
        className="w-full max-w-sm px-4 mt-24"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 300, damping: 25 }}
      >
        <button
          onClick={handleNotificationTap}
          className="w-full earth-panel rounded-2xl p-4 text-left hover:bg-muted/20 transition-colors group"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Droplets size={20} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-display text-xs font-bold text-primary uppercase tracking-wider">Community Board</span>
                <span className="text-[10px] text-muted-foreground">now</span>
              </div>
              <p className="font-display text-sm font-semibold text-foreground mt-0.5">
                Water source found nearby
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                Fresh spring water available at Mannahatta Spring, 2 blocks from you. Tap to see all water sources.
              </p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground/50 mt-2 group-hover:text-foreground transition-colors" />
          </div>
        </button>
      </motion.div>

      {/* Swipe hint */}
      <motion.div
        className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <button
          onClick={handleDismiss}
          className="font-display text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Tap to enter the board →
        </button>
      </motion.div>

      {/* Eco indicators at bottom */}
      <motion.div
        className="absolute bottom-4 left-0 right-0 flex justify-center gap-6 text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1.2 }}
      >
        <span>🍃 82</span>
        <span>💧 71</span>
        <span>🐝 38</span>
      </motion.div>
    </div>
  );
}
