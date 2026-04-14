import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SearchBar from './SearchBar';
import CalendarPanel from './CalendarPanel';
import CategoryFilters from './CategoryFilters';
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
  neighborhoodLabel?: string;
}

export default function EcoStatusBar({ initialSearch = '', onPinSelect, activeFilters, onToggleFilter, neighborhoodLabel }: EcoStatusBarProps) {
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
                className="topbar-season-btn hover:opacity-80 transition-opacity"
                title="Seasonal calendar"
              >
                <img src={moonPhaseIcon} alt="Moon phase" className="moon-icon" />
                <span className="status-location">{seasonName}</span>
              </button>
            </div>

            <div className="topbar-right">
              <img src={sunIcon} alt="Weather" className="status-sun" />
              <img src={batteryIcon} alt="Battery" className="status-battery-img" />
            </div>
          </div>

          {/* Row 2: Logo + Search + Actions */}
          <div className="toolbar-row">
            <div className="toolbar-left">
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
            </div>

            <div className="toolbar-actions">
              <button
                onClick={() => setShowSeasonal(true)}
                className="hover:opacity-80 transition-opacity active:scale-95"
                title="Help"
              >
                <img src={helpIcon} alt="Help" className="action-icon" />
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="hover:opacity-80 transition-opacity active:scale-95"
                title="Profile"
              >
                <img src={profileIcon} alt="Profile" className="action-icon" />
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="hover:opacity-80 transition-opacity active:scale-95"
                title="Saved"
              >
                <img src={savedIcon} alt="Saved" className="action-icon action-icon-save" />
              </button>
            </div>
          </div>

        </div>

        {/* Row 3: Category Filters */}
        <div style={{
          background: 'linear-gradient(0deg, #2A211D 0%, #322924 100%)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          <CategoryFilters
            activeFilters={activeFilters}
            onToggle={onToggleFilter}
            neighborhoodLabel={neighborhoodLabel}
          />
        </div>

        <style>{`
          :root {
            --map-controls-top: 120px;
          }
          .screen-shell {
            background: linear-gradient(0deg, #322924 0%, #3B302A 46%, #221B17 100%);
            box-shadow: 0px 12px 47px rgba(0, 0, 0, 0.25);
            padding: 11px 30px 8px;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .status-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .toolbar-logo {
            width: 28px;
            height: auto;
            opacity: 0.85;
          }

          .toolbar-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-top: 8px;
            padding-bottom: 8px;
          }

          .status-row {
            padding: 0;
          }

          .topbar-left {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .topbar-season-btn {
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .topbar-right {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .status-time,
          .status-location {
            font-family: 'Public Sans', sans-serif;
            font-weight: 600;
            color: #E0E0E0;
            font-size: 13px;
          }

          .moon-icon {
            width: 10px;
            height: auto;
          }

          /* sun and battery sizes now in clamp below action-icon */

          .toolbar-left {
            display: flex;
            align-items: center;
            flex: 1 1 auto;
            gap: 12px;
            min-width: 0;
          }

          .search-wrapper {
            width: 45vw;
            flex: 0 0 45vw;
            min-width: 0;
          }

          .toolbar-actions {
            display: flex;
            align-items: center;
            gap: 15px;
            flex-shrink: 0;
          }

          .toolbar-actions .action-icon-save {
            margin-left: 2%;
          }

          .action-icon {
            height: clamp(22px, 5.5vw, 44px);
            width: auto;
            opacity: 0.85;
          }

          .status-sun {
            width: clamp(14px, 2vw, 18px);
            height: auto;
            opacity: 0.85;
          }

          .status-battery-img {
            width: clamp(24px, 3vw, 30px);
            height: auto;
            opacity: 0.85;
          }

          /* Tablet */
          @media (min-width: 768px) {
            :root { --map-controls-top: 160px; }
            .screen-shell {
              padding: 17px 30px 12px;
              gap: 16px;
            }

            .toolbar-logo {
              width: 44px;
            }

            .toolbar-left {
              gap: 20px;
            }

            .toolbar-row {
              padding-top: 14px;
              padding-bottom: 14px;
            }

            .toolbar-actions {
              gap: 20px;
            }
          }

          /* Large desktop */
          @media (min-width: 1280px) {
            :root { --map-controls-top: 190px; }
            .screen-shell {
              padding: 24px 30px 16px;
              gap: 20px;
            }

            .toolbar-logo {
              width: 44px;
            }

            .toolbar-left {
              gap: 28px;
            }

            .toolbar-actions {
              gap: 24px;
            }
          }
        `}</style>
      </motion.div>

      <CalendarPanel open={showSeasonal} onClose={() => setShowSeasonal(false)} onPinSelect={onPinSelect} />
    </>
  );
}
