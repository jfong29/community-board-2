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
            className="rounded-xl overflow-hidden max-w-md mx-auto"
            style={{ background: 'hsla(15, 16%, 14%, 0.95)', border: '1px solid hsla(15, 12%, 25%, 0.5)' }}
          >
            {/* Category header + subcategory + close */}
            <div className="flex items-center justify-between px-5 pt-4 pb-1">
              <div className="flex items-center gap-2">
                {isUrgent && <span className="text-sm">❗</span>}
                <img src={categoryIconSrc} alt="" className="w-4 h-4" />
                <span
                  className="font-display font-bold uppercase tracking-wider"
                  style={{ color: accentColor, fontSize: '12px', fontFamily: "'Public Sans', sans-serif" }}
                >
                  {categoryLabel}
                </span>
                {/* Subcategory tag */}
                <button
                  onClick={() => onTagClick?.(pin.subcategory)}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-display font-semibold transition-all hover:scale-105 active:scale-95 border"
                  style={{
                    borderColor: accentColor,
                    color: accentColor,
                    backgroundColor: `${accentColor}15`,
                    fontSize: '11px',
                  }}
                >
                  {pin.subcategory.toUpperCase()}
                  <span className="opacity-60">›</span>
                </button>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-muted/30 transition-colors text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            {/* Title */}
            <h2 className="font-display text-xl font-bold text-foreground leading-tight px-5 pt-1 pb-1">
              {pin.title}
            </h2>

            {/* Description */}
            {mainDesc && (
              <p className="text-muted-foreground leading-relaxed px-5 pb-2" style={{ fontSize: '14px' }}>
                {mainDesc}
              </p>
            )}

            {/* Metadata rows */}
            <div className="px-5 pb-3 space-y-1.5">
              {/* Posted by */}
              <div className="flex items-center gap-2" style={{ fontSize: '13px' }}>
                <span className="text-muted-foreground">
                  {isOrg ? <Users size={13} className="inline" /> : <User size={13} className="inline" />}
                </span>
                <button
                  onClick={() => setShowSourceProfile(!showSourceProfile)}
                  className="font-display font-medium underline underline-offset-2 decoration-dotted hover:text-foreground transition-colors"
                  style={{ color: accentColor }}
                >
                  {pin.postedBy}
                </button>
              </div>

              {/* Structured fields: timeframe, location, quantity */}
              {fields.filter(f => f.label !== 'Fulfillment').map((field, i) => (
                <div key={i} className="flex items-center gap-2 text-muted-foreground" style={{ fontSize: '13px' }}>
                  <span className="w-4 text-center">{field.icon === '#' ? '📦' : field.icon}</span>
                  <span>
                    <span className="font-display font-medium text-foreground/70">{field.label === 'Quantity' ? 'Qty' : field.label}:</span>
                    {' '}{field.value}
                  </span>
                </div>
              ))}

              {/* Distance */}
              <div className="flex items-center gap-2 text-muted-foreground" style={{ fontSize: '13px' }}>
                <MapPin size={13} />
                <span>{pin.distance}</span>
              </div>
            </div>

            {/* Source profile popup */}
            <AnimatePresence>
              {showSourceProfile && (
                <motion.div
                  className="mx-5 mb-3 rounded-xl border border-border/40 p-3 space-y-2"
                  style={{ background: 'hsla(15, 16%, 18%, 0.9)' }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-display font-semibold bg-muted/40 text-muted-foreground">
                      Auto-generated
                    </span>
                    {isOrg && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-display font-semibold" style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>
                        Organization
                      </span>
                    )}
                  </div>
                  <p className="font-display font-semibold text-foreground" style={{ fontSize: '14px' }}>
                    {pin.sourceOrg || pin.postedBy}
                  </p>
                  {!isOrg && <p className="text-muted-foreground text-xs">Community member</p>}
                  <p className="text-muted-foreground text-xs">
                    This listing was automatically imported.
                  </p>
                  {hasExternalLink && (
                    <a
                      href={pin.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-display font-semibold transition-all hover:scale-105 active:scale-95"
                      style={{ color: accentColor, fontSize: '13px' }}
                    >
                      <ExternalLink size={13} />
                      Volunteer / Learn More
                    </a>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom action bar */}
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{ borderTop: '1px solid hsla(15, 12%, 25%, 0.4)' }}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSaved(!saved)}
                  className="p-1.5 rounded-lg hover:bg-muted/30 transition-colors"
                  title={saved ? 'Unsave' : 'Save'}
                >
                  <Bookmark size={18} className={saved ? 'text-lime fill-lime' : 'text-muted-foreground'} />
                </button>
                {!hasExternalLink && (
                  <button
                    onClick={() => onChat(pin)}
                    className="p-1.5 rounded-lg hover:bg-muted/30 transition-colors"
                    title="Send a message"
                  >
                    <Send size={18} className="text-muted-foreground" />
                  </button>
                )}
              </div>

              {hasExternalLink ? (
                <a
                  href={pin.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full font-display font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ backgroundColor: accentColor, color: '#322924', fontSize: '13px' }}
                >
                  <ExternalLink size={14} />
                  Learn More
                </a>
              ) : (
                <button
                  onClick={() => onChat(pin)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full font-display font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ backgroundColor: `${accentColor}25`, color: accentColor, fontSize: '13px' }}
                >
                  {pin.category === 'request' ? 'Respond' : pin.category === 'offer' ? 'Claim' : 'Chat'}
                  <span style={{ fontSize: '11px', opacity: 0.7 }}>›</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
