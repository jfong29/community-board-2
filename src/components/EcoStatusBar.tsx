import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SearchBar from './SearchBar';
import CalendarPanel from './CalendarPanel';
import { Pin, PinCategory } from '@/data/pins';
import moonPhaseIcon from '@/assets/moon-phase-new.svg';
import sunIcon from '@/assets/sun-icon.svg';
import batteryIcon from '@/assets/battery-icon.svg';
import logoIcon from '@/assets/logo-new.svg';
import savedIcon from '@/assets/saved-new.svg';
import profileIcon from '@/assets/profile-new.svg';
import helpIcon from '@/assets/help-new.svg';

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
        initial={{ y: -40 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <div className="screen-shell">
          {/* Row 1: Status bar */}
          <div className="status-row">
            <div className="topbar-left">
              <span className="status-time">{timeStr}</span>
              <button
                onClick={() => setShowSeasonal(true)}
                className="topbar-left hover:opacity-80 transition-opacity"
                title="Seasonal calendar"
              >
                <span className="status-location">{seasonName}</span>
                <img src={moonPhaseIcon} alt="Moon phase" className="moon-icon" />
              </button>
            </div>

            <div className="topbar-right">
              <img src={sunIcon} alt="Weather" className="status-sun" />
              <img src={batteryIcon} alt="Battery" className="status-battery-img" />
            </div>
          </div>

          {/* Row 2: Logo + Search + Actions */}
          <div className="toolbar-row">
            <button
              onClick={() => navigate('/')}
              className="hover:opacity-80 transition-opacity active:scale-95 flex-shrink-0"
              title="Home"
            >
              <img src={logoIcon} alt="Home" className="toolbar-logo" />
            </button>

            <div className="search-wrapper">
              <SearchBar initialQuery={initialSearch} onPinSelect={onPinSelect} />
            </div>

            <div className="toolbar-actions">
              <button
                onClick={() => navigate('/profile')}
                className="hover:opacity-80 transition-opacity active:scale-95"
                title="Saved"
              >
                <img src={savedIcon} alt="Saved" className="columns-left" />
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="hover:opacity-80 transition-opacity active:scale-95"
                title="Profile"
              >
                <img src={profileIcon} alt="Profile" className="columns-right" />
              </button>
              <button
                onClick={() => setShowSeasonal(true)}
                className="hover:opacity-80 transition-opacity active:scale-95"
                title="Help"
              >
                <img src={helpIcon} alt="Help" className="single-view" />
              </button>
            </div>
          </div>

        </div>

        <style>{`
          .screen-shell {
            background: linear-gradient(0deg, #322924 0%, #3B302A 46%, #221B17 100%);
            box-shadow: 0px 12px 47px rgba(0, 0, 0, 0.25);
            padding: 32px 20px 8px;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .status-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .topbar-left {
            display: flex;
            align-items: center;
            gap: 16px;
          }

          .status-time,
          .status-location {
            font-family: 'Public Sans', sans-serif;
            font-weight: 600;
            color: #E0E0E0;
            font-size: 18px;
          }

          .moon-icon {
            width: 14px;
            height: auto;
            margin-left: 4px;
          }

          .topbar-right {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .status-sun {
            width: 20px;
            height: auto;
            opacity: 0.85;
          }

          .status-battery-img {
            width: 36px;
            height: auto;
            opacity: 0.85;
          }

          .toolbar-logo {
            width: 28px;
            height: auto;
            opacity: 0.85;
          }

          .toolbar-row {
            display: flex;
            align-items: center;
            gap: 12px;
            padding-top: 8px;
            padding-bottom: 8px;
          }

          .search-wrapper {
            flex: 1;
            min-width: 0;
          }

          .toolbar-actions {
            display: flex;
            align-items: center;
            gap: 24px;
            flex-shrink: 0;
          }

          .columns-left {
            width: 20px;
            height: auto;
            opacity: 0.85;
          }

          .columns-right {
            width: 28px;
            height: auto;
            opacity: 0.85;
          }

          .single-view {
            width: 16px;
            height: auto;
            opacity: 0.85;
          }

          /* Tablet */
          @media (min-width: 768px) {
            .screen-shell {
              padding: 52px 48px 12px;
              gap: 16px;
            }

            .topbar-left {
              gap: 28px;
            }

            .status-time,
            .status-location {
              font-size: 26px;
            }

            .moon-icon {
              width: 20px;
            }

            .status-sun {
              width: 28px;
            }

            .status-battery-img {
              width: 48px;
            }

            .toolbar-row {
              gap: 28px;
              padding-top: 14px;
              padding-bottom: 14px;
            }

            .search-wrapper {
              max-width: 572px;
            }

            .toolbar-actions {
              gap: 40px;
            }

            .columns-left {
              width: 30px;
            }

            .columns-right {
              width: 44px;
            }

            .single-view {
              width: 24px;
            }
          }

          /* Large desktop */
          @media (min-width: 1280px) {
            .screen-shell {
              padding: 72px 96px 16px;
              gap: 20px;
            }

            .topbar-left {
              gap: 32px;
            }

            .status-time,
            .status-location {
              font-size: 32px;
            }

            .moon-icon {
              width: 26px;
            }

            .status-sun {
              width: 34px;
            }

            .status-battery-img {
              width: 60px;
            }

            .toolbar-row {
              gap: 40px;
            }

            .search-wrapper {
              max-width: 720px;
            }

            .toolbar-actions {
              gap: 56px;
            }

            .columns-left {
              width: 38px;
            }

            .columns-right {
              width: 56px;
            }

            .single-view {
              width: 32px;
            }
          }
        `}</style>
      </motion.div>

      <CalendarPanel open={showSeasonal} onClose={() => setShowSeasonal(false)} onPinSelect={onPinSelect} />
    </>
  );
}
