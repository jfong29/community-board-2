import { useState, useMemo } from 'react';
import { Pin, samplePins } from '@/data/pins';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import ConnectionsSection from './ConnectionsSection';
import translateIcon from '@/assets/translate-icon.svg';
import offerNoOutline from '@/assets/offer-no-outline.svg';
import requestNoOutline from '@/assets/request-no-outline.svg';
import urgentRequestPopup from '@/assets/urgent-request-popup.svg';
import observationNoOutline from '@/assets/signal-no-outline.svg';
import gatheringNoOutline from '@/assets/gathering.svg';
import nameIcon from '@/assets/name-icon.svg';
import clockIcon from '@/assets/clock.svg';
import locationIcon from '@/assets/location.svg';
import addToSavedIcon from '@/assets/add-to-saved.svg';
import savedFullIcon from '@/assets/saved.svg';
import sendIcon from '@/assets/send-icon.svg';
import chatBubble from '@/assets/chat-bubble.svg';
import arrowRight from '@/assets/arrow-right.svg';
import closeTab from '@/assets/close-tab.svg';
import nextPostArrow from '@/assets/next-post-arrow.svg';
import PinIcon from './PinIcon';

interface DetailSheetProps {
  pin: Pin | null;
  onClose: () => void;
  onChat: (pin: Pin) => void;
  onTagClick?: (subcategory: string) => void;
  onNextPin?: () => void;
  onPrevPin?: () => void;
  allPins?: Pin[];
}

const DARK_WOOD = '#221B17';

// Category gradient styles
const categoryStyles: Record<string, {
  gradient: string;
  backgroundBlendMode?: string;
  border: string;
  glow: string;
  labelGradient: string;
}> = {
  request: {
    gradient: 'linear-gradient(0deg, rgba(0,0,0,0.10) 0%, rgba(102,102,102,0.10) 100%), linear-gradient(180deg, #FF84CE 0%, #FF61BF 100%)',
    backgroundBlendMode: 'darken, normal',
    border: '#EC5BB2',
    glow: '0px 6px 87px #FF6CC4',
    labelGradient: 'linear-gradient(0deg, rgba(0,0,0,0.10) 0%, rgba(102,102,102,0.10) 100%), linear-gradient(180deg, #FF84CE 0%, #FF61BF 100%)',
  },
  offer: {
    gradient: 'linear-gradient(180deg, #C6FF9A 0%, #82D345 63%)',
    border: '#49A800',
    glow: '0px 6px 87px rgba(130, 211, 69, 0.6)',
    labelGradient: 'linear-gradient(180deg, #C6FF9A 0%, #82D345 63%)',
  },
  observation: {
    gradient: 'linear-gradient(180deg, rgba(255,117,60,0.90) 0%, rgba(255,85,14,0.90) 100%)',
    border: 'rgba(208,110,69,0.90)',
    glow: '0px 6px 87px rgba(255, 108, 47, 0.5)',
    labelGradient: 'linear-gradient(180deg, rgba(255,117,60,0.90) 0%, rgba(255,85,14,0.90) 100%)',
  },
  event: {
    gradient: 'linear-gradient(180deg, #C16EFA 0%, #BF5BFF 52%, #71459B 100%)',
    border: 'rgba(0,0,0,0.20)',
    glow: '0px 6px 87px rgba(176, 54, 255, 0.5)',
    labelGradient: 'linear-gradient(180deg, #C16EFA 0%, #BF5BFF 52%, #71459B 100%)',
  },
};

const categoryLabels: Record<string, string> = {
  offer: 'Offer',
  request: 'Request',
  observation: 'Observation',
  event: 'Gathering',
};

const categoryIcons: Record<string, string> = {
  offer: offerNoOutline,
  request: requestNoOutline,
  observation: observationNoOutline,
  event: gatheringNoOutline,
};

const knownOrgs = new Set([
  'GreenThumb NYC', 'NYC Compost Project', 'Lower East Side Ecology Center',
  'Grow NYC', 'Brooklyn Botanic Garden', 'NYC Audubon', 'Central Park Conservancy',
  'Prospect Park Alliance', 'The Horticultural Society of NY', 'Earth Matter NY',
  'Green Guerillas', 'Just Food NYC', 'City Harvest', "God's Love We Deliver",
  'Part of the Solution (POTS)', 'West Side Campaign Against Hunger',
  "St. John's Bread and Life", 'Bowery Mission', 'Coalition for the Homeless',
  'Council', 'Seed Keeper', 'River Keeper', 'Pollinator Guild', 'Butterfly Watch',
  'Bee Keeper', 'Tompkins Crew', 'Aquifer Monitor', 'Herbalist', 'Music Circle',
  'Reef Monitor', 'Clay Worker', 'Bird Watcher', 'Shore Council', 'Harbor Fisher',
  'Tree Census', 'History Circle', 'Park Stewards', 'Forager', 'Bee Survey',
  'Nursery Crew', 'High Line Friends', 'Marsh Monitor', 'Inwood Naturalists',
]);

function isOrgProfile(name: string): boolean {
  if (knownOrgs.has(name)) return true;
  const orgWords = ['council', 'guild', 'crew', 'alliance', 'watch', 'keepers', 'collective', 'co-op', 'lab', 'monitor', 'survey', 'club', 'dept', 'mission', 'fund', 'aid', 'corps'];
  return orgWords.some(w => name.toLowerCase().includes(w));
}

function parseDescription(desc: string) {
  const lines = desc.split('\n');
  const fields: { icon: string; label: string; value: string }[] = [];
  let mainDesc = '';
  for (const line of lines) {
    if (line.startsWith('📍 ')) fields.push({ icon: '📍', label: 'Location', value: line.slice(3) });
    else if (line.startsWith('🕐 ')) fields.push({ icon: '🕐', label: 'Timeframe', value: line.slice(3) });
    else if (line.startsWith('💬 ')) fields.push({ icon: '💬', label: 'Contact', value: line.slice(3) });
    else if (line.startsWith('📦 ')) fields.push({ icon: '📦', label: 'Fulfillment', value: line.slice(3) });
    else if (line.startsWith('#')) fields.push({ icon: '#', label: 'Quantity', value: line.slice(1) });
    else if (line.trim()) mainDesc += (mainDesc ? '\n' : '') + line;
  }
  return { mainDesc, fields };
}

const urgencyScore: Record<string, number> = { critical: 3, high: 2, medium: 1, low: 0 };

function computeDaysAway(timeframeValue: string): string | null {
  const dateMatch = timeframeValue.match(/(\w+ \d{1,2}(?:,? \d{4})?)/);
  if (!dateMatch) return null;
  const parsed = new Date(dateMatch[1]);
  if (isNaN(parsed.getTime())) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  parsed.setHours(0, 0, 0, 0);
  const diffDays = Math.round((parsed.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return '1 day away';
  return `${diffDays} days away`;
}

function getTimeframe(pin: Pin): string | null {
  if (pin.category === 'observation') return null;
  const hash = pin.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const daysAhead = (hash % 14) + 1;
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
}

function getExchangeMethod(pin: Pin): string | null {
  if (pin.category !== 'offer' && pin.category !== 'request') return null;
  const hash = pin.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const methods = ['Drop off at', 'Pick up at', 'Meet at'];
  return methods[hash % methods.length];
}

export default function DetailSheet({ pin, onClose, onChat, onTagClick, onNextPin, onPrevPin, allPins }: DetailSheetProps) {
  const [showSourceProfile, setShowSourceProfile] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  const blocksAway = useMemo(() => {
    if (!pin) return 0;
    const hash = pin.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return (hash % 8);
  }, [pin]);

  if (!pin) return null;

  const style = categoryStyles[pin.category] || categoryStyles.offer;
  const displayTitle = showTranslation && pin.titleEn ? pin.titleEn : pin.title;
  const displayDesc = showTranslation && pin.descriptionEn ? pin.descriptionEn : pin.description;
  const { mainDesc, fields } = parseDescription(displayDesc);
  const isUrgent = pin.category === 'request' && (urgencyScore[pin.urgency ?? 'low'] ?? 0) >= 2;
  const isAutoGenerated = pin.isAutoGenerated;
  const isOrg = isOrgProfile(pin.postedBy);
  const hasExternalLink = isAutoGenerated && pin.sourceUrl;
  const hasLanguage = pin.language && pin.language !== 'en';

  const langNames: Record<string, string> = {
    es: 'Spanish', ja: 'Japanese', zh: 'Chinese', ht: 'Haitian Creole', en: 'English',
  };

  const categoryLabel = isUrgent ? 'Urgent Request' : categoryLabels[pin.category];
  const categoryIconSrc = isUrgent ? urgentRequestPopup : categoryIcons[pin.category];

  const timeframeField = fields.find(f => f.label === 'Timeframe');
  const locationField = fields.find(f => f.label === 'Location');

  const timeframeValue = timeframeField?.value || getTimeframe(pin);
  const daysAway = timeframeValue ? computeDaysAway(timeframeValue) : null;
  const exchangeMethod = getExchangeMethod(pin);

  const handleLocationClick = () => {
    if (pin.lat && pin.lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${pin.lat},${pin.lng}&travelmode=walking`, '_blank');
    }
  };

  const handleDateClick = () => {
    if (!timeframeValue) return;
    const date = new Date();
    const hash = pin.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    date.setDate(date.getDate() + (hash % 14) + 1);
    const iso = date.toISOString().replace(/[-:]/g, '').split('.')[0];
    const endDate = new Date(date.getTime() + 3600000);
    const isoEnd = endDate.toISOString().replace(/[-:]/g, '').split('.')[0];
    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(pin.title)}&dates=${iso}/${isoEnd}&details=${encodeURIComponent(pin.description)}`, '_blank');
  };

  // Dark-on-light icon filter to make white SVG icons appear dark
  const darkIconFilter = 'brightness(0) saturate(100%)';

  // Pin gradient style for the floating icon
  const pinGradientMap: Record<string, { bg: string; shadow: string; outline: string }> = {
    request: {
      bg: 'linear-gradient(0deg, rgba(0,0,0,0.10) 0%, rgba(102,102,102,0.10) 100%), linear-gradient(180deg, #FF84CE 0%, #FF61BF 100%)',
      shadow: '0px 12px 23px rgba(255,255,255,0.25) inset, -6px -12px 23px rgba(0,0,0,0.15) inset, 0px 6px 87px #FF6CC4',
      outline: 'rgba(200,113,165,0.90)',
    },
    offer: {
      bg: 'linear-gradient(180deg, #C6FF9A 0%, #82D345 63%)',
      shadow: '0px 12px 23px rgba(255,255,255,0.25) inset, -6px -12px 23px rgba(0,0,0,0.15) inset, 0px 6px 87px rgba(130,211,69,0.6)',
      outline: 'rgba(73,168,0,0.90)',
    },
    observation: {
      bg: 'linear-gradient(180deg, rgba(255,117,60,0.90) 0%, rgba(255,85,14,0.90) 100%)',
      shadow: '0px 12px 23px rgba(255,255,255,0.25) inset, -6px -12px 23px rgba(0,0,0,0.15) inset, 0px 6px 87px rgba(255,108,47,0.5)',
      outline: 'rgba(208,110,69,0.90)',
    },
    event: {
      bg: 'linear-gradient(180deg, #C16EFA 0%, #BF5BFF 52%, #71459B 100%)',
      shadow: '0px 12px 23px rgba(255,255,255,0.25) inset, -6px -12px 23px rgba(0,0,0,0.15) inset, 0px 6px 87px rgba(176,54,255,0.5)',
      outline: 'rgba(176,54,255,0.90)',
    },
  };

  const pinGradient = pinGradientMap[pin.category] || pinGradientMap.offer;

  return (
    <AnimatePresence>
      {pin && (
        <motion.div
          className="fixed inset-0 z-[55] flex flex-col items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.28)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {/* Close on background tap */}
          <div className="absolute inset-0" onClick={onClose} />

          {/* X close button fixed top-right */}
          <button
            onClick={onClose}
            className="fixed z-[60] flex items-center justify-center hover:opacity-80 transition-opacity"
            style={{ top: 30, right: 30, width: '22px', height: '22px' }}
          >
            <img src={closeTab} alt="Close" style={{ width: '22px', height: '22px', filter: 'brightness(10)' }} />
          </button>

          {/* Card area - centered between header & footer with extra top padding so the selected map pin remains visible above the card */}
          <motion.div
            className="relative z-10 w-full flex flex-col items-center"
            style={{
              position: 'absolute',
              top: 250,
              bottom: 110,
              left: 0,
              right: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 30px',
              pointerEvents: 'none',
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <div className="relative" style={{ width: 'min(360px, calc(100vw - 60px))', maxHeight: '100%', pointerEvents: 'auto' }}>
              {/* Left arrow */}
              {onPrevPin && (
                <button
                  onClick={onPrevPin}
                  className="transition-opacity hover:opacity-80"
                  style={{ position: 'absolute', left: '-24px', top: '50%', transform: 'translateY(-50%)', width: '17px', height: '26px', zIndex: 15 }}
                >
                  <img src={nextPostArrow} alt="Previous" style={{ width: '17px', height: '26px', transform: 'scaleX(-1)' }} />
                </button>
              )}

              {/* Main card */}
              <div
                className="relative overflow-hidden"
                style={{
                  width: '100%',
                  maxHeight: '100%',
                  borderRadius: '16px',
                  background: style.gradient,
                  backgroundBlendMode: style.backgroundBlendMode || 'normal',
                  boxShadow: `0px 4px 20px rgba(0,0,0,0.25), 0px 1.6px 10px rgba(232,237,163,0.6) inset`,
                  outline: `1.6px solid ${style.border}`,
                  outlineOffset: '-1.6px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
               <div style={{ overflowY: 'auto', flex: 1 }}>
                <div
                  style={{
                    padding: '28px 24px 20px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  {/* Row 1: Category icon + label + time + close */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-[8px] flex-1 min-w-0">
                      <img
                        src={categoryIconSrc}
                        alt=""
                        style={{ width: '15px', height: '13px', filter: darkIconFilter }}
                      />
                      <span
                        style={{
                          color: DARK_WOOD,
                          fontSize: '13px',
                          fontFamily: "'Public Sans', sans-serif",
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          lineHeight: '16px',
                        }}
                      >
                        {categoryLabel}
                      </span>
                      <span
                        style={{
                          color: DARK_WOOD,
                          fontSize: '12px',
                          fontFamily: "'Public Sans', sans-serif",
                          fontWeight: 500,
                          fontStyle: 'italic',
                          textTransform: 'capitalize',
                          marginLeft: '8px',
                        }}
                      >
                        Just Now
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h2
                    style={{
                      color: DARK_WOOD,
                      fontSize: '20px',
                      fontFamily: "'Public Sans', sans-serif",
                      fontWeight: 700,
                      textTransform: 'capitalize',
                      lineHeight: '24px',
                      marginTop: '4px',
                    }}
                  >
                    {displayTitle}
                  </h2>

                  {/* Description */}
                  {mainDesc && (
                    <p
                      style={{
                        color: DARK_WOOD,
                        fontSize: '12px',
                        fontFamily: "'Public Sans', sans-serif",
                        fontWeight: 400,
                      }}
                    >
                      {mainDesc}
                    </p>
                  )}

                  {/* Metadata: Person, Time, Location */}
                  <div className="space-y-[8px]" style={{ marginTop: '6px' }}>
                    {/* Person */}
                    <div className="flex items-center gap-2" style={{ opacity: 0.8 }}>
                      <img src={nameIcon} alt="" style={{ width: '12px', height: '14px', filter: darkIconFilter }} />
                      <button
                        onClick={() => setShowSourceProfile(!showSourceProfile)}
                        className="underline underline-offset-2 transition-colors hover:opacity-100"
                        style={{
                          color: DARK_WOOD,
                          fontSize: '11px',
                          fontFamily: "'Public Sans', sans-serif",
                          fontWeight: 500,
                          lineHeight: '13px',
                        }}
                      >
                        {pin.postedBy}
                      </button>
                    </div>

                    {/* Time */}
                    {timeframeValue && (
                      <div className="flex items-center gap-2" style={{ opacity: 0.8 }}>
                        <img src={clockIcon} alt="" style={{ width: '14px', height: '14px', filter: darkIconFilter }} />
                        <span style={{ fontSize: '11px', fontFamily: "'Public Sans', sans-serif", fontWeight: 400, lineHeight: '13px' }}>
                          <span style={{ color: DARK_WOOD }}>By </span>
                          <button
                            onClick={handleDateClick}
                            className="underline underline-offset-2 hover:opacity-80 transition-opacity"
                            style={{ color: DARK_WOOD }}
                          >
                            {timeframeValue}
                          </button>
                          {daysAway && (
                            <>
                              {'  '}
                              <span style={{ color: DARK_WOOD, fontStyle: 'italic' }}>{daysAway}</span>
                            </>
                          )}
                        </span>
                      </div>
                    )}

                    {/* Location */}
                    <div className="flex items-center gap-2" style={{ opacity: 0.8 }}>
                      <img src={locationIcon} alt="" style={{ width: '11px', height: '14px', filter: darkIconFilter }} />
                      <span style={{ fontSize: '11px', fontFamily: "'Public Sans', sans-serif", fontWeight: 400, lineHeight: '13px' }}>
                        {exchangeMethod && (
                          <span style={{ color: DARK_WOOD }}>{exchangeMethod} </span>
                        )}
                        <button
                          onClick={handleLocationClick}
                          className="underline underline-offset-2 hover:opacity-80 transition-opacity"
                          style={{ color: DARK_WOOD }}
                        >
                          {locationField?.value || pin.distance || 'On site'}
                        </button>
                        {'  '}
                        <span style={{ color: DARK_WOOD, fontStyle: 'italic' }}>{blocksAway} blocks away</span>
                      </span>
                    </div>

                    {/* Language / Translate row */}
                    {hasLanguage && (
                      <div className="flex items-center gap-2" style={{ opacity: 0.8 }}>
                        <img src={translateIcon} alt="" style={{ width: '13px', height: '13px', filter: darkIconFilter }} />
                        <span style={{ color: DARK_WOOD, fontSize: '11px', fontFamily: "'Public Sans', sans-serif", fontWeight: 400, lineHeight: '13px' }}>
                          Uploaded in {langNames[pin.language!] || pin.language};
                        </span>
                        <button
                          onClick={() => setShowTranslation(!showTranslation)}
                          className="underline underline-offset-2 hover:opacity-80 transition-opacity"
                          style={{ color: DARK_WOOD, fontSize: '11px', fontFamily: "'Public Sans', sans-serif", fontWeight: 400, lineHeight: '13px' }}
                        >
                          {showTranslation ? 'Show Original' : 'Translate'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Source profile popup */}
                <AnimatePresence>
                  {showSourceProfile && (
                    <motion.div
                      className="mx-4 mb-3 rounded-xl p-3 space-y-2 relative"
                      style={{ background: 'rgba(0,0,0,0.15)', border: `1px solid ${style.border}` }}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        {isAutoGenerated && (
                          <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.15)', color: DARK_WOOD, fontSize: '10px', fontFamily: "'Public Sans', sans-serif", fontWeight: 600 }}>
                            Auto-generated
                          </span>
                        )}
                        {isOrg && (
                          <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.15)', color: DARK_WOOD, fontSize: '10px', fontFamily: "'Public Sans', sans-serif", fontWeight: 600 }}>
                            Organization
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '14px', fontWeight: 600, fontFamily: "'Public Sans', sans-serif", color: DARK_WOOD }}>
                        {pin.sourceOrg || pin.postedBy}
                      </p>
                      {!isOrg && <p style={{ fontSize: '12px', fontFamily: "'Public Sans', sans-serif", color: DARK_WOOD, opacity: 0.7 }}>Community member</p>}
                      {hasExternalLink && (
                        <a
                          href={pin.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                          style={{ color: DARK_WOOD, fontSize: '13px', fontFamily: "'Public Sans', sans-serif", fontWeight: 600 }}
                        >
                          <ExternalLink size={13} />
                          Volunteer / Learn More
                        </a>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Connected Event */}
                {pin.connectedEvent && (
                  <div className="flex items-center gap-2 relative" style={{ padding: '0 24px 8px 24px' }}>
                    <span style={{ opacity: 0.8, fontSize: '10px', fontFamily: "'Public Sans', sans-serif", fontWeight: 400, color: DARK_WOOD }}>
                      Connected Event:
                    </span>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full"
                      style={{
                        backgroundColor: 'rgba(0,0,0,0.2)',
                        color: DARK_WOOD,
                        fontSize: '10px',
                        fontFamily: "'Public Sans', sans-serif",
                        fontWeight: 700,
                        padding: '2px 10px',
                      }}
                    >
                      <img src={gatheringNoOutline} alt="" style={{ width: '6px', height: '10px', filter: darkIconFilter }} />
                      {pin.connectedEvent}
                    </span>
                  </div>
                )}

                {/* Connections Section */}
                <ConnectionsSection
                  pin={pin}
                  allPins={allPins || samplePins}
                  onViewDetails={(connPin) => {
                    onClose();
                    setTimeout(() => onChat(connPin), 100);
                  }}
                />

                {/* Bottom action bar */}
                <div
                  className="flex items-center justify-between relative"
                  style={{ padding: '8px 24px 16px 24px' }}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSaved(!saved)}
                      className="flex items-center justify-center transition-colors hover:opacity-80"
                      title={saved ? 'Unsave' : 'Save'}
                      style={{ width: '18px', height: '22px' }}
                    >
                      <img
                        src={saved ? savedFullIcon : addToSavedIcon}
                        alt={saved ? 'Saved' : 'Save'}
                        style={{ width: '18px', height: '22px', filter: darkIconFilter }}
                      />
                    </button>
                    {!hasExternalLink && (
                      <button
                        onClick={() => onChat(pin)}
                        className="flex items-center justify-center transition-colors hover:opacity-80"
                        title="Send a message"
                        style={{ width: '20px', height: '20px' }}
                      >
                        <img src={sendIcon} alt="Send" style={{ width: '20px', height: '20px', filter: darkIconFilter }} />
                      </button>
                    )}
                  </div>

                  {hasExternalLink ? (
                    <a
                      href={pin.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      style={{ position: 'relative' }}
                    >
                      <img src={chatBubble} alt="" style={{ width: '100px', height: '28px' }} />
                      <span
                        style={{
                          position: 'absolute',
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                          color: '#2D2520',
                          fontSize: '10px',
                          fontFamily: "'Public Sans', sans-serif",
                          fontWeight: 700,
                          lineHeight: '12px',
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <ExternalLink size={12} />
                        Learn More
                      </span>
                    </a>
                  ) : (
                    <button
                      onClick={() => onChat(pin)}
                      className="inline-flex items-center transition-all hover:scale-[1.02] active:scale-[0.98]"
                      style={{ position: 'relative' }}
                    >
                      <img src={chatBubble} alt="" style={{ width: '100px', height: '28px' }} />
                      <span
                        style={{
                          position: 'absolute',
                          left: '50%',
                          top: '48%',
                          transform: 'translate(-50%, -50%)',
                          color: '#2D2520',
                          fontSize: '10px',
                          fontFamily: "'Public Sans', sans-serif",
                          fontWeight: 700,
                          lineHeight: '12px',
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {pin.category === 'request' ? '2 active chatters' : pin.category === 'offer' ? 'Claim' : 'Chat'}
                        <span style={{ fontSize: '9px' }}>›</span>
                      </span>
                    </button>
                  )}
                </div>
               </div>
              </div>

              {/* Right arrow */}
              {onNextPin && (
                <button
                  onClick={onNextPin}
                  className="transition-opacity hover:opacity-80"
                  style={{ position: 'absolute', right: '-24px', top: '50%', transform: 'translateY(-50%)', width: '17px', height: '26px', zIndex: 15 }}
                >
                  <img src={nextPostArrow} alt="Next" style={{ width: '17px', height: '26px' }} />
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
