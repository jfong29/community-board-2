import { useState } from 'react';
import { Pin } from '@/data/pins';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import offerNoOutline from '@/assets/offer-no-outline.svg';
import requestNoOutline from '@/assets/request-no-outline.svg';
import requestUrgentIcon from '@/assets/request-urgent.svg';
import observationNoOutline from '@/assets/signal-no-outline.svg';
import gatheringNoOutline from '@/assets/gathering.svg';
import nameIcon from '@/assets/name-icon.svg';
import clockIcon from '@/assets/clock.svg';
import locatorIcon from '@/assets/locator.svg';
import savedIcon from '@/assets/saved.svg';
import sendIcon from '@/assets/send-icon.svg';
import chatBubble from '@/assets/chat-bubble.svg';
import arrowRight from '@/assets/arrow-right.svg';
import calendarIcon from '@/assets/calendar-icon.svg';

interface DetailSheetProps {
  pin: Pin | null;
  onClose: () => void;
  onChat: (pin: Pin) => void;
  onTagClick?: (subcategory: string) => void;
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

// Known NYC organizations (groups vs individuals)
const knownOrgs = new Set([
  'GreenThumb NYC', 'NYC Compost Project', 'Lower East Side Ecology Center',
  'Grow NYC', 'Brooklyn Botanic Garden', 'NYC Audubon', 'Central Park Conservancy',
  'Prospect Park Alliance', 'The Horticultural Society of NY', 'Earth Matter NY',
  'Green Guerillas', 'Just Food NYC', 'City Harvest', "God's Love We Deliver",
  'Part of the Solution (POTS)', 'West Side Campaign Against Hunger',
  "St. John's Bread and Life", 'Bowery Mission', 'Coalition for the Homeless',
  'Picture the Homeless', 'Cooper Park Residents Council', 'El Puente',
  'UPROSE Brooklyn', 'South Bronx Unite', 'WE ACT for Environmental Justice',
  'Harlem Grown', 'Friends of the High Line', 'Gowanus Canal Conservancy',
  'Newtown Creek Alliance', 'Billion Oyster Project', 'Solar One',
  'Lower East Side Girls Club', 'Henry Street Settlement', 'University Settlement',
  'Educational Alliance', 'Grand Street Settlement', 'BronxWorks',
  'Red Hook Initiative', 'Fifth Avenue Committee', 'Flatbush Development Corp',
  'Council', 'Seed Keeper', 'River Keeper', 'Pollinator Guild', 'Butterfly Watch',
  'Bee Keeper', 'Tompkins Crew', 'Aquifer Monitor', 'Herbalist', 'Music Circle',
  'Reef Monitor', 'Clay Worker', 'Bird Watcher', 'Shore Council', 'Harbor Fisher',
  'Tree Census', 'History Circle', 'Park Stewards', 'Forager', 'Bee Survey',
  'Nursery Crew', 'High Line Friends', 'Marsh Monitor', 'Inwood Naturalists',
  'Inwood Circle', 'Birder Network', 'Park Alliance', 'Lake Stewards', 'Meadow Crew',
  'Canal Monitor', 'Conservancy', 'Marsh Watch', 'Boathouse', 'Island Ecologist',
  'Island Council', 'Queens Birders', 'Parks Dept', 'Cricket Club', 'Reptile Survey',
  'Anglers Guild', 'River Alliance', 'Paddle Crew', 'Bay Monitor', 'Bay Guardians',
  'Roof Bees', 'Green Tenants', 'Garden Collective', 'Herb Co-op', 'Block Watch',
  'Roof Growers', 'Raptor Watch', 'Harlem Drummers', 'Fridge Keepers', 'Art Collective',
  'Bike Kitchen', 'Creek Watch', 'Fungi Lab', 'Reef Farmers', 'Resilience Lab',
  'Park Collective', 'LIC Birders', 'Nut Gatherer', 'Water Watcher', 'Park Council',
  'River Fund New York', 'New York Cares', 'Housing Works',
  'DOROT', 'NYC Parks', 'YMCA of Greater New York', 'iMentor',
  'Crown Heights Mutual Aid', 'Bed-Stuy Strong', 'Jackson Heights Mutual Aid',
  'Astoria Mutual Aid', 'Bushwick Ayuda Mutua', 'Sunset Park Mutual Aid',
  'Bike Brigade NYC', 'NYC DDC', 'NYC DEP', 'Brooklyn Bridge Park Corp',
  'NYC EDC', 'US Army Corps of Engineers', '6sqft / Lenape Heritage',
  'Trust for Governors Island', "Randall's Island Park Alliance",
  'Gateway National Recreation Area', 'Staten Island Museum',
  'NYC Anglers', 'Hudson River Park Trust', 'Gotham Whale', 'Brooklyn Public Library',
  'Elmhurst Hospital', 'Ariva', 'NYC Parks TreesCount',
  'BRC', 'Hamilton Madison House', 'Ali Forney Center', 'Urban Pathways',
]);

function isOrgProfile(name: string): boolean {
  if (knownOrgs.has(name)) return true;
  const orgWords = ['council', 'guild', 'crew', 'alliance', 'watch', 'keepers', 'collective', 'co-op', 'lab', 'monitor', 'survey', 'club', 'dept', 'mission', 'fund', 'aid', 'corps'];
  const lower = name.toLowerCase();
  return orgWords.some(w => lower.includes(w));
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
  // Try to parse a date from the timeframe
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

export default function DetailSheet({ pin, onClose, onChat, onTagClick }: DetailSheetProps) {
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
  const categoryIconSrc = isUrgent ? requestUrgentIcon : categoryIcons[pin.category];

  const timeframeField = fields.find(f => f.label === 'Timeframe');
  const locationField = fields.find(f => f.label === 'Location');
  const quantityField = fields.find(f => f.label === 'Quantity');

  const limeColor = '#DAE16B';
  const daysAway = timeframeField ? computeDaysAway(timeframeField.value) : null;

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
          <div
            className="overflow-hidden max-w-md mx-auto"
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
                className="flex items-center justify-center hover:bg-muted/30 transition-colors"
                style={{ color: '#7D726C', width: '26px', height: '25px' }}
              >
                <X size={22} strokeWidth={2} />
              </button>
            </div>

            {/* Row 2: Title — Labrada semibold */}
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

            {/* Row 3: Description — Public Sans 600 */}
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

            {/* Metadata rows */}
            <div style={{ padding: '16px 28px 0 28px' }} className="space-y-2">
              {/* Posted by */}
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

              {/* Timeframe: "By Tuesday, Apr 18" + "1 day away" */}
              {timeframeField && (
                <div className="flex items-center gap-3" style={{ opacity: 0.8 }}>
                  <img src={clockIcon} alt="" style={{ width: '21px', height: '21px' }} />
                  <span style={{ fontSize: '16px', fontFamily: "'Public Sans', sans-serif", fontWeight: 400 }}>
                    <span className="text-foreground">By </span>
                    <span className="underline" style={{ color: limeColor }}>{timeframeField.value}</span>
                    {daysAway && (
                      <>
                        {'  '}
                        <span className="text-foreground italic">{daysAway}</span>
                      </>
                    )}
                  </span>
                </div>
              )}

              {/* Location: "Drop off at 39 W 13th St  0 blocks away" */}
              {locationField && (
                <div className="flex items-center gap-3" style={{ opacity: 0.8 }}>
                  <img src={locatorIcon} alt="" style={{ width: '18px', height: '18px' }} />
                  <span style={{ fontSize: '16px', fontFamily: "'Public Sans', sans-serif", fontWeight: 400 }}>
                    <span className="text-foreground">Drop off at </span>
                    <span className="underline" style={{ color: limeColor }}>{locationField.value}</span>
                    {'  '}
                    <span className="text-foreground italic">{pin.distance}</span>
                  </span>
                </div>
              )}

              {/* Quantity */}
              {quantityField && (
                <div className="flex items-center gap-3" style={{ opacity: 0.8, fontSize: '16px', fontFamily: "'Public Sans', sans-serif" }}>
                  <span className="text-foreground" style={{ fontSize: '14px' }}>📦</span>
                  <span className="text-foreground" style={{ fontWeight: 400 }}>{quantityField.value}</span>
                </div>
              )}

              {/* Distance fallback */}
              {!locationField && (
                <div className="flex items-center gap-3" style={{ opacity: 0.8 }}>
                  <img src={locatorIcon} alt="" style={{ width: '18px', height: '18px' }} />
                  <span style={{ fontSize: '16px', fontFamily: "'Public Sans', sans-serif", fontWeight: 400 }}>
                    <span className="underline" style={{ color: '#DAE16B' }}>{pin.distance}</span>
                  </span>
                </div>
              )}
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
                  {isAutoGenerated && (
                    <p className="text-muted-foreground" style={{ fontSize: '12px', fontFamily: "'Public Sans', sans-serif" }}>
                      This listing was automatically imported.
                    </p>
                  )}
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
                {/* Save to calendar */}
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
                  style={{ width: '20px', height: '23px' }}
                >
                  <img
                    src={savedIcon}
                    alt="Save"
                    style={{
                      width: '20px',
                      height: '23px',
                      opacity: saved ? 1 : 0.7,
                      filter: 'none',
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
