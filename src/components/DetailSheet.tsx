import { useState } from 'react';
import { Pin } from '@/data/pins';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, MapPin, ExternalLink, Users, User } from 'lucide-react';
import offerIcon from '@/assets/offer.svg';
import requestIcon from '@/assets/request.svg';
import observationIcon from '@/assets/observation.svg';
import gatheringIcon from '@/assets/gathering.svg';

interface DetailSheetProps {
  pin: Pin | null;
  onClose: () => void;
  onChat: (pin: Pin) => void;
  onTagClick?: (subcategory: string) => void;
}

const categoryColorMap: Record<string, string> = {
  offer: '#68D07F',
  request: '#D54E00',
  observation: '#39BBD6',
  event: '#F984CA',
};

const categoryLabels: Record<string, string> = {
  offer: 'Offer',
  request: 'Request',
  observation: 'Signal',
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
  // Original pins with group-like postedBy
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
  // Auto-generated source orgs
  'River Fund New York', 'Bowery Mission', 'New York Cares', 'Housing Works',
  'DOROT', 'NYC Parks', 'YMCA of Greater New York', 'GreenThumb NYC', 'iMentor',
  'Crown Heights Mutual Aid', 'Bed-Stuy Strong', 'Jackson Heights Mutual Aid',
  'Astoria Mutual Aid', 'Bushwick Ayuda Mutua', 'Sunset Park Mutual Aid',
  'Bike Brigade NYC', 'NYC DDC', 'NYC DEP', 'Brooklyn Bridge Park Corp',
  'NYC EDC', 'US Army Corps of Engineers', '6sqft / Lenape Heritage',
  'Trust for Governors Island', "Randall's Island Park Alliance", 'NYC Audubon',
  'Gateway National Recreation Area', 'Staten Island Museum', 'Solar One',
  'NYC Anglers', 'Hudson River Park Trust', 'Gotham Whale', 'Brooklyn Public Library',
  'Elmhurst Hospital', 'Ariva', 'South Bronx Unite', 'NYC Parks TreesCount',
  'BRC', 'Hamilton Madison House', 'Ali Forney Center', 'Urban Pathways',
]);

function isOrgProfile(name: string): boolean {
  if (knownOrgs.has(name)) return true;
  // If the name has no space (single word) or contains common org words, treat as org
  const orgWords = ['council', 'guild', 'crew', 'alliance', 'watch', 'keepers', 'collective', 'co-op', 'lab', 'monitor', 'survey', 'club', 'dept', 'mission', 'fund', 'aid', 'corps'];
  const lower = name.toLowerCase();
  return orgWords.some(w => lower.includes(w));
}

// Parse structured description to extract fields
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

  // Reorder: quantity before location
  const ordered: typeof fields = [];
  const quantityField = fields.find(f => f.label === 'Quantity');
  const locationField = fields.find(f => f.label === 'Location');
  const rest = fields.filter(f => f.label !== 'Quantity' && f.label !== 'Location');

  if (quantityField) ordered.push(quantityField);
  if (locationField) ordered.push(locationField);
  ordered.push(...rest);

  return { mainDesc, fields: ordered };
}

export default function DetailSheet({ pin, onClose, onChat, onTagClick }: DetailSheetProps) {
  const [showSourceProfile, setShowSourceProfile] = useState(false);

  if (!pin) return null;

  const accentColor = categoryColorMap[pin.category] || '#68D07F';
  const showActions = pin.category === 'offer' || pin.category === 'request';
  const { mainDesc, fields } = parseDescription(pin.description);

  // Extract fulfillment options from description
  const fulfillmentField = fields.find(f => f.label === 'Fulfillment');
  const fulfillmentOptions = fulfillmentField ? fulfillmentField.value.split(',').map(s => s.trim()) : [];

  const isAutoGenerated = pin.isAutoGenerated;
  const isOrg = isOrgProfile(pin.postedBy);
  const hasExternalLink = isAutoGenerated && pin.sourceUrl;

  return (
    <AnimatePresence>
      {pin &&
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 md:px-0 md:max-w-md md:mx-auto"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
        
          <div className="earth-panel rounded-2xl p-6 space-y-4">
            {/* Category label + close */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img src={categoryIcons[pin.category]} alt={categoryLabels[pin.category]} className="w-6 h-5" />
                <span
                className="font-display font-bold uppercase tracking-wider"
                style={{ color: accentColor, fontSize: '14px' }}>
                  {categoryLabels[pin.category]}
                </span>
              </div>
              <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-muted/30 transition-colors text-foreground">
                <X size={18} />
              </button>
            </div>

            {/* Title */}
            <h2 className="font-display text-xl font-bold text-foreground leading-tight">
              {pin.title}
            </h2>

            {/* Clickable subcategory tag */}
            <button
            onClick={() => onTagClick?.(pin.subcategory)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-display font-semibold transition-all hover:scale-105 active:scale-95 border"
            style={{
              borderColor: accentColor,
              color: accentColor,
              backgroundColor: `${accentColor}15`,
              fontSize: '13px',
            }}>
              {pin.subcategory}
              <span className="opacity-50">→</span>
            </button>

            {/* Description */}
            {mainDesc && (
              <p className="text-muted-foreground leading-relaxed">
                {mainDesc}
              </p>
            )}

            {/* Structured fields */}
            {fields.filter(f => f.label !== 'Fulfillment').map((field, i) => (
              <div key={i} className="flex items-center gap-2 text-muted-foreground">
                <span>{field.icon}</span>
                <span className="font-display font-medium text-foreground/70">{field.label}{field.label === 'Quantity' ? ' (if applicable)' : ''}:</span>
                <span>{field.value}</span>
              </div>
            ))}

            {/* Meta — poster name is clickable */}
            <div className="flex items-center gap-4 text-muted-foreground" style={{ fontSize: '13px' }}>
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {pin.distance}
              </span>
              <button
                onClick={() => setShowSourceProfile(!showSourceProfile)}
                className="flex items-center gap-1.5 font-display font-medium underline underline-offset-2 decoration-dotted hover:text-foreground transition-colors"
                style={{ color: accentColor }}
              >
                {isOrg ? <Users size={13} /> : <User size={13} />}
                {pin.postedBy}
              </button>
            </div>

            {/* Source profile popup */}
            <AnimatePresence>
              {showSourceProfile && (
                <motion.div
                  className="earth-panel rounded-xl border border-border/40 p-4 space-y-2"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                >
                  {isAutoGenerated ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-xs font-display font-semibold bg-muted/40 text-muted-foreground">
                          Auto-generated
                        </span>
                        {isOrg && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-display font-semibold" style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>
                            Organization
                          </span>
                        )}
                      </div>
                      <p className="font-display font-semibold text-foreground" style={{ fontSize: '15px' }}>
                        {pin.sourceOrg || pin.postedBy}
                      </p>
                      {!isOrg && (
                        <p className="text-muted-foreground text-sm">Community member</p>
                      )}
                      <p className="text-muted-foreground text-sm">
                        This listing was automatically imported from an external source.
                      </p>
                      {pin.sourceUrl && (
                        <a
                          href={pin.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-display font-semibold transition-all hover:scale-105 active:scale-95"
                          style={{ color: accentColor, fontSize: '14px' }}
                        >
                          <ExternalLink size={14} />
                          Volunteer / Learn More
                        </a>
                      )}
                    </>
                  ) : (
                    <>
                      {isOrg ? (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-xs font-display font-semibold bg-muted/40 text-muted-foreground">
                              Auto-generated
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-display font-semibold" style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>
                              Organization
                            </span>
                          </div>
                          <p className="font-display font-semibold text-foreground" style={{ fontSize: '15px' }}>
                            {pin.postedBy}
                          </p>
                          <p className="text-muted-foreground text-sm">NYC community organization</p>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-xs font-display font-semibold bg-muted/40 text-muted-foreground">
                              Auto-generated
                            </span>
                          </div>
                          <p className="font-display font-semibold text-foreground" style={{ fontSize: '15px' }}>
                            {pin.postedBy}
                          </p>
                          <p className="text-muted-foreground text-sm">Community member</p>
                        </>
                      )}
                      <button
                        onClick={() => { setShowSourceProfile(false); onChat(pin); }}
                        className="inline-flex items-center gap-1.5 font-display font-semibold transition-all hover:scale-105 active:scale-95"
                        style={{ color: accentColor, fontSize: '14px' }}
                      >
                        <MessageCircle size={14} />
                        Send a message
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action buttons */}
            {hasExternalLink ? (
              // Auto-generated with external source — show external link instead of chat
              <div className="flex gap-2">
                {showActions && fulfillmentOptions.length > 0 && fulfillmentOptions.map((opt, i) => (
                  <button
                    key={opt}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-display font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={i === 0
                      ? { backgroundColor: accentColor, color: '#F4EDE8', fontSize: '15px' }
                      : { backgroundColor: `${accentColor}20`, color: accentColor, fontSize: '15px' }
                    }
                  >
                    <span>{opt}</span>
                  </button>
                ))}
                <a
                  href={pin.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-display font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ backgroundColor: accentColor, color: '#F4EDE8', fontSize: '15px' }}
                >
                  <ExternalLink size={16} />
                  <span>Learn More</span>
                </a>
              </div>
            ) : showActions && fulfillmentOptions.length > 0 ? (
              <div className="flex gap-2">
                {fulfillmentOptions.map((opt, i) => (
                  <button
                    key={opt}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-display font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={i === 0
                      ? { backgroundColor: accentColor, color: '#F4EDE8', fontSize: '15px' }
                      : { backgroundColor: `${accentColor}20`, color: accentColor, fontSize: '15px' }
                    }
                  >
                    <span>{opt}</span>
                  </button>
                ))}
                <button
                  onClick={() => onChat(pin)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-display font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ backgroundColor: `${accentColor}20`, color: accentColor, fontSize: '15px' }}
                >
                  <MessageCircle size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onChat(pin)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-display font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: accentColor, color: '#F4EDE8', fontSize: '15px' }}
              >
                <MessageCircle size={16} />
                <span>Chat</span>
              </button>
            )}
          </div>
        </motion.div>
      }
    </AnimatePresence>
  );
}
