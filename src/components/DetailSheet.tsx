import { useState } from 'react';
import { Pin } from '@/data/pins';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, ExternalLink, Users, User, Bookmark, Send } from 'lucide-react';
import offerIcon from '@/assets/offer.svg';
import requestIcon from '@/assets/request.svg';
import requestUrgentIcon from '@/assets/request-urgent.svg';
import observationIcon from '@/assets/observation.svg';
import gatheringIcon from '@/assets/gathering.svg';

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
  offer: offerIcon,
  request: requestIcon,
  observation: observationIcon,
  event: gatheringIcon,
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

  const ordered: typeof fields = [];
  const quantityField = fields.find(f => f.label === 'Quantity');
  const locationField = fields.find(f => f.label === 'Location');
  const rest = fields.filter(f => f.label !== 'Quantity' && f.label !== 'Location');

  if (quantityField) ordered.push(quantityField);
  if (locationField) ordered.push(locationField);
  ordered.push(...rest);

  return { mainDesc, fields: ordered };
}

const urgencyScore: Record<string, number> = { critical: 3, high: 2, medium: 1, low: 0 };

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

  const fulfillmentField = fields.find(f => f.label === 'Fulfillment');
  const fulfillmentOptions = fulfillmentField ? fulfillmentField.value.split(',').map(s => s.trim()) : [];

  const categoryLabel = isUrgent ? 'URGENT REQUEST' : categoryLabels[pin.category]?.toUpperCase();
  const categoryIconSrc = isUrgent ? requestUrgentIcon : categoryIcons[pin.category];

  // Extract specific fields
  const timeframeField = fields.find(f => f.label === 'Timeframe');
  const locationField = fields.find(f => f.label === 'Location');
  const quantityField = fields.find(f => f.label === 'Quantity');
  const contactField = fields.find(f => f.label === 'Contact');

  // Lime accent for interactive elements
  const limeColor = '#DAE16B';

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
            {/* Row 1: Category icon + label + subcategory tag ... close button */}
            <div className="flex items-center justify-between" style={{ padding: '20px 28px 0 28px' }}>
              <div className="flex items-center gap-2">
                {isUrgent && (
                  <img src={requestUrgentIcon} alt="" className="w-4 h-4" />
                )}
                {!isUrgent && (
                  <img src={categoryIconSrc} alt="" className="w-4 h-4" />
                )}
                <span
                  className="font-semibold uppercase"
                  style={{
                    color: accentColor,
                    fontSize: '16px',
                    fontFamily: "'Public Sans', sans-serif",
                    lineHeight: '19.2px',
                  }}
                >
                  {categoryLabel}
                </span>

                {/* Subcategory pill */}
                <button
                  onClick={() => onTagClick?.(pin.subcategory)}
                  className="inline-flex items-center gap-1 rounded-full font-semibold transition-all hover:scale-105 active:scale-95"
                  style={{
                    border: `1.2px solid ${accentColor}`,
                    color: accentColor,
                    backgroundColor: `${accentColor}18`,
                    fontSize: '12px',
                    fontFamily: "'Public Sans', sans-serif",
                    padding: '4px 12px',
                    lineHeight: '14.4px',
                  }}
                >
                  {pin.subcategory.toUpperCase()}
                  <span style={{ fontSize: '10px', opacity: 0.7 }}>›</span>
                </button>
              </div>

              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-muted/30 transition-colors"
                style={{ color: '#7D726C' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Row 2: Title — Labrada */}
            <h2
              className="font-display font-semibold text-foreground"
              style={{
                fontSize: '34px',
                lineHeight: '41px',
                padding: '8px 28px 0 28px',
              }}
            >
              {pin.title}
            </h2>

            {/* Row 3: Description — Public Sans */}
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

            {/* Row 4: Metadata — icon + value rows */}
            <div style={{ padding: '16px 28px 0 28px' }} className="space-y-3">
              {/* Posted by */}
              <div className="flex items-center gap-3" style={{ opacity: 0.8 }}>
                <span className="text-foreground">
                  {isOrg ? <Users size={15} /> : <User size={15} />}
                </span>
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

              {/* Timeframe */}
              {timeframeField && (
                <div className="flex items-center gap-3" style={{ opacity: 0.8, fontSize: '16px', fontFamily: "'Public Sans', sans-serif" }}>
                  <span className="text-foreground" style={{ fontSize: '14px' }}>🕐</span>
                  <span>
                    <span className="text-foreground" style={{ fontWeight: 400 }}>By </span>
                    <span className="underline" style={{ color: limeColor, fontWeight: 400 }}>{timeframeField.value}</span>
                  </span>
                </div>
              )}

              {/* Location */}
              {locationField && (
                <div className="flex items-center gap-3" style={{ opacity: 0.8, fontSize: '16px', fontFamily: "'Public Sans', sans-serif" }}>
                  <MapPin size={15} className="text-foreground" />
                  <span>
                    <span className="text-foreground" style={{ fontWeight: 400 }}>Drop off at </span>
                    <span className="underline" style={{ color: limeColor, fontWeight: 400 }}>{locationField.value}</span>
                    {'  '}
                    <span className="text-foreground italic" style={{ fontWeight: 400 }}>{pin.distance}</span>
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

              {/* Distance fallback if no location field */}
              {!locationField && (
                <div className="flex items-center gap-3" style={{ opacity: 0.8, fontSize: '16px', fontFamily: "'Public Sans', sans-serif" }}>
                  <MapPin size={15} className="text-foreground" />
                  <span className="text-foreground italic" style={{ fontWeight: 400 }}>{pin.distance}</span>
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
                  <p className="font-display font-semibold text-foreground" style={{ fontSize: '14px' }}>
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
                      className="inline-flex items-center gap-1.5 font-semibold transition-all hover:scale-105 active:scale-95"
                      style={{ color: accentColor, fontSize: '13px', fontFamily: "'Public Sans', sans-serif" }}
                    >
                      <ExternalLink size={13} />
                      Volunteer / Learn More
                    </a>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Connected Event row (if pin has a connected event tag) */}
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
              style={{ padding: '16px 28px 16px 28px', marginTop: '12px' }}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSaved(!saved)}
                  className="p-1.5 rounded-lg hover:bg-muted/30 transition-colors"
                  title={saved ? 'Unsave' : 'Save'}
                >
                  <Bookmark size={20} style={{ color: saved ? limeColor : limeColor, fill: saved ? limeColor : 'none' }} />
                </button>
                {!hasExternalLink && (
                  <button
                    onClick={() => onChat(pin)}
                    className="p-1.5 rounded-lg hover:bg-muted/30 transition-colors"
                    title="Send a message"
                  >
                    <Send size={20} style={{ color: limeColor }} />
                  </button>
                )}
              </div>

              {hasExternalLink ? (
                <a
                  href={pin.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-full font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    backgroundColor: limeColor,
                    color: '#2D2520',
                    fontSize: '12px',
                    fontFamily: "'Public Sans', sans-serif",
                    padding: '6px 16px',
                    lineHeight: '14.4px',
                  }}
                >
                  <ExternalLink size={14} />
                  Learn More
                </a>
              ) : (
                <button
                  onClick={() => onChat(pin)}
                  className="flex items-center gap-2 rounded-full font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    backgroundColor: limeColor,
                    color: '#2D2520',
                    fontSize: '12px',
                    fontFamily: "'Public Sans', sans-serif",
                    padding: '6px 16px',
                    lineHeight: '14.4px',
                  }}
                >
                  {pin.category === 'request' ? 'Respond' : pin.category === 'offer' ? 'Claim' : 'Chat'}
                  <span style={{ fontSize: '10px' }}>›</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
