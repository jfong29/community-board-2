import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SearchBar from './SearchBar';
import CalendarPanel from './CalendarPanel';
import CategoryFilters from './CategoryFilters';
import { Pin, PinCategory } from '@/data/pins';
import logoIcon from '@/assets/logo-new.svg';
import moonPhaseIcon from '@/assets/moon-phase-new.svg';
import sunIcon from '@/assets/sun-icon.svg';
import batteryIcon from '@/assets/battery-icon.svg';
import savedIcon from '@/assets/saved-new.svg';
import profileIcon from '@/assets/profile-new.svg';
import logoAlt from '@/assets/logo-alt.svg';

function getSeasonName(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'Siquon';
  if (month >= 5 && month <= 7) return 'Nippon';
  if (month >= 8 && month <= 10) return 'Taquonge';
  return 'Okehocking';
}

function getTimeStr(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
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
  const seasonName = getSeasonName();
  const timeStr = getTimeStr();

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 z-[60]"
        style={{
          background: 'linear-gradient(0deg, #322924 0%, #3B302A 46%, #221B17 100%)',
          boxShadow: '0px 12px 47px rgba(0, 0, 0, 0.25)',
          padding: '0 30px',
        }}
        initial={{ y: -40 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* Row 1: Time + Season | Weather + Battery */}
        <div className="flex items-center justify-between pt-4 pb-2 max-w-screen-xl mx-auto">
          {/* Left: Time + Season + Moon */}
          <div className="flex items-center gap-6 md:gap-10">
            <span
              style={{
                fontFamily: "'Public Sans', sans-serif",
                fontSize: 'clamp(20px, 3.5vw, 40px)',
                fontWeight: 600,
                color: '#E0E0E0',
              }}
            >
              {timeStr}
            </span>
            <button
              onClick={() => setShowSeasonal(true)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              title="Seasonal calendar"
            >
              <span
                style={{
                  fontFamily: "'Public Sans', sans-serif",
                  fontSize: 'clamp(20px, 3.5vw, 40px)',
                  fontWeight: 600,
                  color: '#E0E0E0',
                }}
              >
                {seasonName}
              </span>
              <img
                src={moonPhaseIcon}
                alt="Moon phase"
                style={{ width: 'clamp(16px, 2.5vw, 32px)', height: 'auto' }}
              />
            </button>
          </div>

          {/* Right: Weather + Battery */}
          <div className="flex items-center gap-3 md:gap-4">
            <img
              src={sunIcon}
              alt="Weather"
              style={{ width: 'clamp(24px, 3vw, 44px)', height: 'auto', opacity: 0.85 }}
            />
            <img
              src={batteryIcon}
              alt="Battery"
              style={{ width: 'clamp(36px, 5vw, 68px)', height: 'auto', opacity: 0.85 }}
            />
          </div>
        </div>

        {/* Row 2: Search bar | Icons */}
        <div className="flex items-center justify-between gap-4 md:gap-8 pb-4 max-w-screen-xl mx-auto">
          {/* Search bar - takes most space */}
          <div className="flex-1 max-w-2xl">
            <SearchBar initialQuery={initialSearch} onPinSelect={onPinSelect} />
          </div>

          {/* Right icons: Help + Profile + Logo */}
          <div className="flex items-center gap-4 md:gap-8 flex-shrink-0">
            <button
              onClick={() => navigate('/profile')}
              className="hover:opacity-80 transition-opacity active:scale-95"
              title="Saved"
            >
              <img
                src={savedIcon}
                alt="Saved"
                style={{ width: 'clamp(20px, 3vw, 42px)', height: 'auto', opacity: 0.85 }}
              />
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="hover:opacity-80 transition-opacity active:scale-95"
              title="Profile"
            >
              <img
                src={profileIcon}
                alt="Profile"
                style={{ width: 'clamp(28px, 4.5vw, 65px)', height: 'auto', opacity: 0.85 }}
              />
            </button>
            <button
              onClick={() => setShowSeasonal(true)}
              className="hover:opacity-80 transition-opacity active:scale-95"
              title="Community Board"
            >
              <img
                src={logoAlt}
                alt="Community Board"
                style={{ width: 'clamp(28px, 4.5vw, 65px)', height: 'auto', opacity: 0.85 }}
              />
            </button>
          </div>
        </div>

        {/* Row 3: Category filters */}
        <div className="flex items-center justify-center pb-2 max-w-screen-xl mx-auto">
          <CategoryFilters activeFilters={activeFilters} onToggle={onToggleFilter} />
        </div>
      </motion.div>

      <CalendarPanel open={showSeasonal} onClose={() => setShowSeasonal(false)} onPinSelect={onPinSelect} />
    </>
  );
}
