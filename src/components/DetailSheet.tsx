import { useState, useMemo } from 'react';
import { Pin, samplePins } from '@/data/pins';
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
import savedIcon from '@/assets/add-to-saved.svg';
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

// Generate a plausible timeframe for pins that lack one
function getTimeframe(pin: Pin): string | null {
  if (pin.category === 'observation') return null;
  // Generate deterministic date from pin id
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

  // Compute timeframe: use parsed field or generate one
  const timeframeValue = timeframeField?.value || getTimeframe(pin);
  const daysAway = timeframeValue ? computeDaysAway(timeframeValue) : null;

  // Exchange method for offers/requests
  const exchangeMethod = getExchangeMethod(pin);

  // Compute blocks away
  const blocksAway = useMemo(() => {
    const hash = pin.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return (hash % 8);
  }, [pin.id]);

  const handleLocationClick = () => {
    // Show directions (could integrate with map zoom)
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
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-50"
          style={{ padding: '0 30px 90px 30px' }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
            {/* Left arrow - previous post */}
            {onPrevPin && (
              <button
                onClick={onPrevPin}
                className="flex-shrink-0 transition-all hover:scale-110 active:scale-95"
                style={{ width: '17px', height: '26px', transform: 'scaleX(-1)' }}
              >
                <img src={nextPostArrow} alt="Previous" style={{ width: '17px', height: '26px' }} />
              </button>
            )}

            {/* Main card */}
            <div
              className="overflow-hidden flex-1 max-w-md"
              style={{
                background: 'hsla(15, 18%, 16%, 0.90)',
                borderRadius: '10px',
              }}
            >
              {/* Row 1: Category icon + label + subcategory pill ... close X */}
              <div className="flex items-center justify-between" style={{ padding: '20px 20px 0 28px' }}>
                <div className="flex items-center gap-2">
                  <img src={categoryIconSrc} alt="" style={{ width: '18px', height: '15px' }} />
                  <span
                    style={{
                      color: accentColor,
                      fontSize: '16px',
                      fontFamily: "'Public Sans', sans-serif",
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      lineHeight: '19.2px',
                    }}
                  >
                    {categoryLabel}
                  </span>

                  {/* Subcategory pill */}
                  <button
                    onClick={() => onTagClick?.(pin.subcategory)}
                    className="inline-flex items-center rounded-full transition-all hover:scale-105 active:scale-95"
                    style={{
                      border: `1.2px solid ${accentColor}`,
                      color: accentColor,
                      backgroundColor: `${accentColor}18`,
                      fontSize: '12px',
                      fontFamily: "'Public Sans', sans-serif",
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      padding: '4px 10px',
                      lineHeight: '14.4px',
                      gap: '4px',
                    }}
                  >
                    {pin.subcategory.toUpperCase()}
                    <img src={arrowRight} alt="" style={{ width: '6px', height: '9px' }} />
                  </button>
                </div>

                <button
                  onClick={onClose}
                  className="flex items-center justify-center hover:opacity-80 transition-opacity"
                  style={{ width: '27px', height: '26px' }}
                >
                  <img src={closeTab} alt="Close" style={{ width: '27px', height: '26px' }} />
                </button>
              </div>

              {/* Row 2: Title */}
              <h2
                className="font-display text-foreground"
                style={{
                  fontSize: '35px',
                  fontWeight: 600,
                  lineHeight: '42px',
                  padding: '8px 28px 0 28px',
                }}
              >
                {pin.title}
              </h2>

              {/* Row 3: Description */}
              {mainDesc && (
                <p
                  className="text-foreground"
                  style={{
                    fontSize: '16px',
                    fontFamily: "'Public Sans', sans-serif",
                    fontWeight: 600,
                    lineHeight: '22px',
                    padding: '12px 28px 0 28px',
                  }}
                >
                  {mainDesc}
                </p>
              )}

              {/* Metadata rows — always 3 lines: Person, Time, Location */}
              <div style={{ padding: '16px 28px 0 28px' }} className="space-y-2">
                {/* 1. Posted by */}
                <div className="flex items-center gap-3" style={{ opacity: 0.8 }}>
                  <img src={nameIcon} alt="" style={{ width: '16px', height: '18px' }} />
                  <button
                    onClick={() => setShowSourceProfile(!showSourceProfile)}
                    className="underline underline-offset-2 transition-colors hover:opacity-100"
                    style={{
                      color: limeColor,
                      fontSize: '16px',
                      fontFamily: "'Public Sans', sans-serif",
                      fontWeight: 400,
                    }}
                  >
                    {pin.postedBy}
                  </button>
                </div>

                {/* 2. Time — when is it available/needed/happening */}
                {timeframeValue && (
                  <div className="flex items-center gap-3" style={{ opacity: 0.8 }}>
                    <img src={clockIcon} alt="" style={{ width: '21px', height: '21px' }} />
                    <span style={{ fontSize: '16px', fontFamily: "'Public Sans', sans-serif", fontWeight: 400 }}>
                      <span className="text-foreground">By </span>
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
                          <span className="text-foreground italic">{daysAway}</span>
                        </>
                      )}
                    </span>
                  </div>
                )}

                {/* 3. Location — with exchange method for offers/requests */}
                <div className="flex items-center gap-3" style={{ opacity: 0.8 }}>
                  <img src={locationIcon} alt="" style={{ width: '15px', height: '19px' }} />
                  <span style={{ fontSize: '16px', fontFamily: "'Public Sans', sans-serif", fontWeight: 400 }}>
                    {exchangeMethod && (
                      <span className="text-foreground">{exchangeMethod} </span>
                    )}
                    <button
                      onClick={handleLocationClick}
                      className="underline underline-offset-2 hover:opacity-80 transition-opacity"
                      style={{ color: limeColor }}
                    >
                      {locationField?.value || pin.distance || 'On site'}
                    </button>
                    {'  '}
                    <span className="text-foreground italic">{blocksAway} blocks away</span>
                  </span>
                </div>
              </div>

              {/* Source profile popup */}
              <AnimatePresence>
                {showSourceProfile && (
                  <motion.div
                    className="mx-7 mt-3 rounded-xl border border-border/40 p-3 space-y-2"
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

              {/* Connected Event row */}
              {pin.connectedEvent && (
                <div className="flex items-center gap-2" style={{ padding: '16px 28px 0 28px' }}>
                  <span className="text-foreground" style={{ opacity: 0.8, fontSize: '16px', fontFamily: "'Public Sans', sans-serif", fontWeight: 400, textTransform: 'capitalize' }}>
                    Connected Event:
                  </span>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full"
                    style={{
                      backgroundColor: `${limeColor}CC`,
                      color: '#322924',
                      fontSize: '12px',
                      fontFamily: "'Public Sans', sans-serif",
                      fontWeight: 700,
                      padding: '4px 14px',
                    }}
                  >
                    <img src={gatheringNoOutline} alt="" style={{ width: '6px', height: '10px' }} />
                    {pin.connectedEvent}
                  </span>
                  <button
                    className="flex items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95"
                    style={{
                      width: '23px',
                      height: '23px',
                      border: `1.2px solid ${limeColor}`,
                      backgroundColor: `${limeColor}18`,
                    }}
                  >
                    <span style={{ color: limeColor, fontSize: '15px', fontFamily: "'Public Sans', sans-serif", fontWeight: 500, lineHeight: 1 }}>+</span>
                  </button>
                </div>
              )}

              {/* Bottom action bar */}
              <div
                className="flex items-center justify-between"
                style={{ padding: '16px 28px 16px 28px', marginTop: '8px' }}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSaved(!saved)}
                    className="flex items-center justify-center transition-colors hover:opacity-80"
                    title={saved ? 'Unsave' : 'Save'}
                    style={{ width: '22px', height: '26px' }}
                  >
                    <img
                      src={savedIcon}
                      alt="Save"
                      style={{
                        width: '22px',
                        height: '26px',
                        opacity: saved ? 1 : 0.7,
                      }}
                    />
                  </button>
                  {!hasExternalLink && (
                    <button
                      onClick={() => onChat(pin)}
                      className="flex items-center justify-center transition-colors hover:opacity-80"
                      title="Send a message"
                      style={{ width: '25px', height: '25px' }}
                    >
                      <img src={sendIcon} alt="Send" style={{ width: '25px', height: '25px' }} />
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
                    <img src={chatBubble} alt="" style={{ width: '123px', height: '33px' }} />
                    <span
                      style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: '#2D2520',
                        fontSize: '12px',
                        fontFamily: "'Public Sans', sans-serif",
                        fontWeight: 700,
                        lineHeight: '14.4px',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <ExternalLink size={14} />
                      Learn More
                    </span>
                  </a>
                ) : (
                  <button
                    onClick={() => onChat(pin)}
                    className="inline-flex items-center transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{ position: 'relative' }}
                  >
                    <img src={chatBubble} alt="" style={{ width: '123px', height: '33px' }} />
                    <span
                      style={{
                        position: 'absolute',
                        left: '50%',
                        top: '48%',
                        transform: 'translate(-50%, -50%)',
                        color: '#2D2520',
                        fontSize: '12px',
                        fontFamily: "'Public Sans', sans-serif",
                        fontWeight: 700,
                        lineHeight: '14.4px',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      {pin.category === 'request' ? '2 active chatters' : pin.category === 'offer' ? 'Claim' : 'Chat'}
                      <span style={{ fontSize: '10px' }}>›</span>
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Right arrow - next post */}
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
      )}
    </AnimatePresence>
  );
}
