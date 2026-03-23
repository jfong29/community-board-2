import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HelpCircle, Battery } from 'lucide-react';
import SearchBar from './SearchBar';
import CalendarPanel from './CalendarPanel';
import CategoryFilters from './CategoryFilters';
import { Pin, PinCategory } from '@/data/pins';
import logoIcon from '@/assets/logo.svg';
import profileIcon from '@/assets/profile.svg';
import savedIcon from '@/assets/saved.svg';
import moonIcon from '@/assets/moon.svg';
import weatherSunny from '@/assets/weather-sunny.svg';
import weatherCloudy from '@/assets/weather-cloudy.svg';

function getWeatherIcon(): string {
  const hour = new Date().getHours();
  if (hour >= 6 && hour <= 18) return weatherSunny;
  return weatherCloudy;
}

function getSeasonName(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'Siquon';
  if (month >= 5 && month <= 7) return 'Nippon';
  if (month >= 8 && month <= 10) return 'Taquonge';
  return 'Okehocking';
}

interface EcoStatusBarProps {
  initialSearch?: string;
  onPinSelect: (pin: Pin) => void;
  activeFilters: Set<PinCategory>;
  onToggleFilter: (cat: PinCategory) => void;
}

export default function EcoStatusBar({ initialSearch = '', onPinSelect, activeFilters, onToggleFilter }: EcoStatusBarProps) {
  const navigate = useNavigate();
  const [showSeasonal, setShowSeasonal] = useState(false);
  const weatherIcon = getWeatherIcon();
  const seasonName = getSeasonName();

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 earth-panel border-b border-border/30"
        style={{ padding: '0 30px' }}
        initial={{ y: -40 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* Row 1: Nav bar */}
        <div className="flex items-center justify-between gap-3 px-2 py-2 max-w-screen-xl mx-auto">
          {/* Left: Logo + season name + moon */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <button
              onClick={() => setShowSeasonal(true)}
              className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
              title="Seasonal calendar"
            >
              <img src={logoIcon} alt="Cb" className="h-6 w-auto" />
            </button>
            <button
              onClick={() => setShowSeasonal(true)}
              className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
              title="Season & moon phase"
            >
              <span
                style={{
                  fontFamily: "'Public Sans', sans-serif",
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#F4EDE8',
                }}
              >
                {seasonName}
              </span>
              <img src={moonIcon} alt="Moon phase" style={{ width: '13px', height: '16px' }} />
            </button>
          </div>

          {/* Center: Search bar */}
          <SearchBar initialQuery={initialSearch} onPinSelect={onPinSelect} />

          {/* Right: Battery top-right, then Help, Profile, Saved */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <button
              className="hover:opacity-80 transition-opacity active:scale-95"
              title="Help"
            >
              <HelpCircle size={20} strokeWidth={1.5} color="#F4EDE8" style={{ opacity: 0.7 }} />
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="hover:opacity-80 transition-opacity active:scale-95"
              title="Profile"
            >
              <img src={profileIcon} alt="Profile" className="h-5 w-auto" />
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="hover:opacity-80 transition-opacity active:scale-95"
              title="Saved"
            >
              <img src={savedIcon} alt="Saved" className="h-5 w-auto" />
            </button>
            <div className="ml-1" title="Battery">
              <Battery size={18} strokeWidth={1.5} color="#F4EDE8" style={{ opacity: 0.6 }} />
            </div>
          </div>
        </div>

        {/* Row 2: Category filters */}
        <div className="flex items-center justify-center px-3 pb-1.5 max-w-screen-xl mx-auto">
          <CategoryFilters activeFilters={activeFilters} onToggle={onToggleFilter} />
        </div>
      </motion.div>

      <CalendarPanel open={showSeasonal} onClose={() => setShowSeasonal(false)} onPinSelect={onPinSelect} />
    </>
  );
}
