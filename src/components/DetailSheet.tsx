import { useState, useMemo } from 'react';
import { Pin } from '@/data/pins';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
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

interface DetailSheetProps {
  pin: Pin | null;
  onClose: () => void;
  onChat: (pin: Pin) => void;
  onTagClick?: (subcategory: string) => void;
  onNextPin?: () => void;
  onPrevPin?: () => void;
}

const categoryColorMap: Record<string, string> = {
  offer: '#79E824',
  request: '#FF48B5',
  observation: '#FF6C2F',
  event: '#B036FF',
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

export default function DetailSheet({ pin, onClose, onChat, onTagClick, onNextPin, onPrevPin }: DetailSheetProps) {
  const [showSourceProfile, setShowSourceProfile] = useState(false);
  const [saved, setSaved] = useState(false);

  const blocksAway = useMemo(() => {
    if (!pin) return 0;
    const hash = pin.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return (hash % 8);
  }, [pin]);

  if (!pin) return null;

  const accentColor = categoryColorMap[pin.category] || '#68D07F';
  const { mainDesc, fields } = parseDescription(pin.description);
  const isUrgent = pin.category === 'request' && (urgencyScore[pin.urgency ?? 'low'] ?? 0) >= 2;
  const isAutoGenerated = pin.isAutoGenerated;
  const isOrg = isOrgProfile(pin.postedBy);
  const hasExternalLink = isAutoGenerated && pin.sourceUrl;

  const categoryLabel = isUrgent ? 'Urgent Request' : categoryLabels[pin.category];
  const categoryIconSrc = isUrgent ? urgentRequestPopup : categoryIcons[pin.category];

  const timeframeField = fields.find(f => f.label === 'Timeframe');
  const locationField = fields.find(f => f.label === 'Location');

  const limeColor = '#DAE16B';

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

  return (
    <AnimatePresence>
      {pin && (
        <>
          {/* Dark overlay for mobile - clicking outside closes */}
          <motion.div
            className="fixed inset-0 z-[49]"
            style={{ background: 'rgba(0,0,0,0.50)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50"
            style={{ padding: '0 16px 90px 16px' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center justify-center gap-2 max-w-[360px] mx-auto">
              {/* Left arrow */}
              {onPrevPin && (
                <button
                  onClick={onPrevPin}
                  className="flex-shrink-0 transition-all hover:scale-110 active:scale-95"
                  style={{ width: '17px', height: '26px', transform: 'scaleX(-1)' }}
                >
                  <img src={nextPostArrow} alt="Previous" style={{ width: '17px', height: '26px' }} />
                </button>
              )}

              {/* Main card - matches exact spec */}
              <div
                className="flex-1 relative"
                style={{
                  maxWidth: '360px',
                  boxShadow: '1px 4px 24px 10px rgba(0, 0, 0, 0.55)',
                }}
              >
                <div
                  className="relative"
                  style={{
                    background: '#322924',
                    opacity: 0.90,
                    borderRadius: '7.8px',
                    border: `1px solid ${accentColor}`,
                    position: 'absolute',
                    inset: 0,
                  }}
                />
                <div
                  className="relative"
                  style={{
                    padding: '17px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '7.5px',
                  }}
                >
                  {/* Row 1: Category + subcategory + close */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-[5px]">
                      <img src={categoryIconSrc} alt="" style={{ width: '15px', height: '13px' }} />
                      <span
                        style={{
                          color: accentColor,
                          fontSize: '12px',
                          fontFamily: "'Public Sans', sans-serif",
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          lineHeight: '14.4px',
                        }}
                      >
                        {categoryLabel}
                      </span>

                      <button
                        onClick={() => onTagClick?.(pin.subcategory)}
                        className="inline-flex items-center rounded-full transition-all hover:scale-105 active:scale-95"
                        style={{
                          border: `0.94px solid ${accentColor}`,
                          backgroundColor: `${accentColor}18`,
                          padding: '2px 8px',
                        }}
                      >
                        <span
                          style={{
                            color: accentColor,
                            fontSize: '10px',
                            fontFamily: "'Public Sans', sans-serif",
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            lineHeight: '12px',
                          }}
                        >
                          {pin.subcategory}
                        </span>
                        <img src={arrowRight} alt="" style={{ width: '3px', height: '5.5px', marginLeft: '4px' }} />
                      </button>
                    </div>

                    <button
                      onClick={onClose}
                      className="flex items-center justify-center hover:opacity-80 transition-opacity"
                      style={{ width: '22px', height: '22px' }}
                    >
                      <img src={closeTab} alt="Close" style={{ width: '22px', height: '22px' }} />
                    </button>
                  </div>

                  {/* Title */}
                  <h2
                    style={{
                      color: '#F4EDE8',
                      fontSize: '20px',
                      fontFamily: "'Labrada', serif",
                      fontWeight: 600,
                      lineHeight: '24px',
                    }}
                  >
                    {pin.title}
                  </h2>

                  {/* Description */}
                  {mainDesc && (
                    <p
                      style={{
                        color: '#F4EDE8',
                        fontSize: '12px',
                        fontFamily: "'Public Sans', sans-serif",
                        fontWeight: 400,
                      }}
                    >
                      {mainDesc}
                    </p>
                  )}

                  {/* Metadata: Person, Time, Location */}
                  <div className="space-y-1" style={{ marginTop: '4px' }}>
                    {/* Person */}
                    <div className="flex items-center gap-2" style={{ opacity: 0.8 }}>
                      <img src={nameIcon} alt="" style={{ width: '12px', height: '14px' }} />
                      <button
                        onClick={() => setShowSourceProfile(!showSourceProfile)}
                        className="underline underline-offset-2 transition-colors hover:opacity-100"
                        style={{
                          color: limeColor,
                          fontSize: '10px',
                          fontFamily: "'Public Sans', sans-serif",
                          fontWeight: 400,
                          lineHeight: '12px',
                        }}
                      >
                        {pin.postedBy}
                      </button>
                    </div>

                    {/* Time */}
                    {timeframeValue && (
                      <div className="flex items-center gap-2" style={{ opacity: 0.8 }}>
                        <img src={clockIcon} alt="" style={{ width: '14px', height: '14px' }} />
                        <span style={{ fontSize: '10px', fontFamily: "'Public Sans', sans-serif", fontWeight: 400, lineHeight: '12px' }}>
                          <span style={{ color: '#F4EDE8' }}>By </span>
                          <button
                            onClick={handleDateClick}
                            className="underline underline-offset-2 hover:opacity-80 transition-opacity"
                            style={{ color: limeColor }}
                          >
                            {timeframeValue}
                          </button>
                          {daysAway && (
                            <>
                              {'  '}
                              <span style={{ color: '#F4EDE8', fontStyle: 'italic' }}>{daysAway}</span>
                            </>
                          )}
                        </span>
                      </div>
                    )}

                    {/* Location */}
                    <div className="flex items-center gap-2" style={{ opacity: 0.8 }}>
                      <img src={locationIcon} alt="" style={{ width: '11px', height: '14px' }} />
                      <span style={{ fontSize: '10px', fontFamily: "'Public Sans', sans-serif", fontWeight: 400, lineHeight: '12px' }}>
                        {exchangeMethod && (
                          <span style={{ color: '#F4EDE8' }}>{exchangeMethod} </span>
                        )}
                        <button
                          onClick={handleLocationClick}
                          className="underline underline-offset-2 hover:opacity-80 transition-opacity"
                          style={{ color: limeColor }}
                        >
                          {locationField?.value || pin.distance || 'On site'}
                        </button>
                        {'  '}
                        <span style={{ color: '#F4EDE8', fontStyle: 'italic' }}>{blocksAway} blocks away</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Source profile popup */}
                <AnimatePresence>
                  {showSourceProfile && (
                    <motion.div
                      className="mx-4 mb-3 rounded-xl border border-border/40 p-3 space-y-2 relative"
                      style={{ background: 'hsla(15, 16%, 18%, 0.9)' }}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        {isAutoGenerated && (
                          <span className="px-2 py-0.5 rounded-full bg-muted/40 text-muted-foreground" style={{ fontSize: '10px', fontFamily: "'Public Sans', sans-serif", fontWeight: 600 }}>
                            Auto-generated
                          </span>
                        )}
                        {isOrg && (
                          <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: `${accentColor}20`, color: accentColor, fontSize: '10px', fontFamily: "'Public Sans', sans-serif", fontWeight: 600 }}>
                            Organization
                          </span>
                        )}
                      </div>
                      <p className="font-display text-foreground" style={{ fontSize: '14px', fontWeight: 600 }}>
                        {pin.sourceOrg || pin.postedBy}
                      </p>
                      {!isOrg && <p className="text-muted-foreground" style={{ fontSize: '12px', fontFamily: "'Public Sans', sans-serif" }}>Community member</p>}
                      {hasExternalLink && (
                        <a
                          href={pin.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                          style={{ color: accentColor, fontSize: '13px', fontFamily: "'Public Sans', sans-serif", fontWeight: 600 }}
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
                  <div className="flex items-center gap-2 relative" style={{ padding: '0 20px 8px 20px' }}>
                    <span style={{ opacity: 0.8, fontSize: '10px', fontFamily: "'Public Sans', sans-serif", fontWeight: 400, color: '#F4EDE8' }}>
                      Connected Event:
                    </span>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full"
                      style={{
                        backgroundColor: `${limeColor}CC`,
                        color: '#322924',
                        fontSize: '10px',
                        fontFamily: "'Public Sans', sans-serif",
                        fontWeight: 700,
                        padding: '2px 10px',
                      }}
                    >
                      <img src={gatheringNoOutline} alt="" style={{ width: '6px', height: '10px' }} />
                      {pin.connectedEvent}
                    </span>
                  </div>
                )}

                {/* Bottom action bar */}
                <div
                  className="flex items-center justify-between relative"
                  style={{ padding: '8px 20px 12px 20px' }}
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
                        style={{ width: '18px', height: '22px' }}
                      />
                    </button>
                    {!hasExternalLink && (
                      <button
                        onClick={() => onChat(pin)}
                        className="flex items-center justify-center transition-colors hover:opacity-80"
                        title="Send a message"
                        style={{ width: '20px', height: '20px' }}
                      >
                        <img src={sendIcon} alt="Send" style={{ width: '20px', height: '20px' }} />
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

              {/* Right arrow */}
              {onNextPin && (
                <button
                  onClick={onNextPin}
                  className="flex-shrink-0 transition-all hover:scale-110 active:scale-95"
                  style={{ width: '17px', height: '26px' }}
                >
                  <img src={nextPostArrow} alt="Next" style={{ width: '17px', height: '26px' }} />
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
