import { useState, useMemo } from 'react';
import { Pin, PinCategory, samplePins } from '@/data/pins';
import { motion, AnimatePresence } from 'framer-motion';
import offerNoOutline from '@/assets/offer-no-outline.svg';
import requestNoOutline from '@/assets/request-no-outline.svg';
import observationNoOutline from '@/assets/signal-no-outline.svg';
import gatheringNoOutline from '@/assets/gathering.svg';
import checkmarkIcon from '@/assets/checkmark.svg';
import xMarkIcon from '@/assets/x-mark.svg';

const DARK_WOOD = '#221B17';

const categoryIcons: Record<string, string> = {
  offer: offerNoOutline,
  request: requestNoOutline,
  observation: observationNoOutline,
  event: gatheringNoOutline,
};

const categoryGradients: Record<string, {
  pill: string;
  pillBorder: string;
  pillShadow: string;
  tab: string;
  tabBorder: string;
  card: string;
  cardBlend?: string;
  cardBorder: string;
}> = {
  offer: {
    pill: 'linear-gradient(180deg, #C6FF9A 0%, #82D345 63%)',
    pillBorder: '#49A800',
    pillShadow: 'rgba(120, 231, 36, 0.50)',
    tab: 'linear-gradient(180deg, #C6FF9A 0%, #82D345 63%)',
    tabBorder: '#9CFA54',
    card: 'linear-gradient(0deg, rgba(0,0,0,0.10) 0%, rgba(102,102,102,0.10) 100%), linear-gradient(180deg, rgba(135,240,54,0.90) 0%, rgba(76,126,38,0.90) 100%)',
    cardBlend: 'darken, normal',
    cardBorder: 'rgba(156,250,84,0.90)',
  },
  request: {
    pill: 'linear-gradient(0deg, rgba(0,0,0,0.10) 0%, rgba(102,102,102,0.10) 100%), linear-gradient(180deg, #FF84CE 0%, #FF61BF 100%)',
    pillBorder: '#EC5BB2',
    pillShadow: 'rgba(181,223,150,0.20)',
    tab: 'linear-gradient(180deg, #FFA4DA 37%, #FF83CD 100%)',
    tabBorder: '#FF92D3',
    card: 'linear-gradient(0deg, rgba(0,0,0,0.10) 0%, rgba(102,102,102,0.10) 100%), linear-gradient(180deg, #ED9DCD 32%, #CE529C 100%)',
    cardBlend: 'darken, normal',
    cardBorder: '#FFA4DA',
  },
  observation: {
    pill: 'linear-gradient(180deg, rgba(255,117,60,0.90) 0%, rgba(255,85,14,0.90) 100%)',
    pillBorder: 'rgba(208,110,69,0.90)',
    pillShadow: 'rgba(244,237,232,0.20)',
    tab: 'linear-gradient(180deg, #FFAB80 0%, #FF6C2F 63%)',
    tabBorder: '#FF8A55',
    card: 'linear-gradient(0deg, rgba(0,0,0,0.10) 0%, rgba(102,102,102,0.10) 100%), linear-gradient(180deg, rgba(255,140,80,0.90) 0%, rgba(180,70,20,0.90) 100%)',
    cardBlend: 'darken, normal',
    cardBorder: 'rgba(255,140,80,0.90)',
  },
  event: {
    pill: 'linear-gradient(180deg, #C16EFA 0%, #BF5BFF 52%, #71459B 100%)',
    pillBorder: 'rgba(0,0,0,0.20)',
    pillShadow: 'rgba(244,237,232,0.20)',
    tab: 'linear-gradient(180deg, #D09EFA 0%, #B84FFF 63%)',
    tabBorder: '#C880FF',
    card: 'linear-gradient(0deg, rgba(0,0,0,0.10) 0%, rgba(102,102,102,0.10) 100%), linear-gradient(180deg, #C490E8 32%, #8A3CB8 100%)',
    cardBlend: 'darken, normal',
    cardBorder: '#C880FF',
  },
};

const categoryLabels: Record<string, string> = {
  offer: 'Offers',
  request: 'Requests',
  observation: 'Observations',
  event: 'Gatherings',
};

interface ConnectionMatch {
  pin: Pin;
  accepted: boolean;
}

function findConnections(pin: Pin, allPins: Pin[]): ConnectionMatch[] {
  const matches: ConnectionMatch[] = [];
  const others = allPins.filter(p => p.id !== pin.id);

  for (const other of others) {
    const sharedSub = pin.subcategory === other.subcategory;
    const titleOverlap = pin.title.toLowerCase().split(' ').some(w =>
      w.length > 3 && other.title.toLowerCase().includes(w)
    ) || other.title.toLowerCase().split(' ').some(w =>
      w.length > 3 && pin.title.toLowerCase().includes(w)
    );
    const descOverlap = pin.description.toLowerCase().split(' ').some(w =>
      w.length > 4 && other.description.toLowerCase().includes(w)
    );

    if (sharedSub || titleOverlap || descOverlap) {
      // Use deterministic "accepted" based on hash
      const hash = (pin.id + other.id).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      matches.push({ pin: other, accepted: hash % 3 !== 0 });
    }
  }

  return matches.slice(0, 8); // Limit to 8 connections
}

const darkIconFilter = 'brightness(0) saturate(100%)';

interface ConnectionsSectionProps {
  pin: Pin;
  allPins: Pin[];
  onViewDetails?: (pin: Pin) => void;
}

export default function ConnectionsSection({ pin, allPins, onViewDetails }: ConnectionsSectionProps) {
  const connections = useMemo(() => findConnections(pin, allPins), [pin, allPins]);
  const [localAccepted, setLocalAccepted] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState(true);

  if (connections.length === 0) return null;

  // Count by category
  const counts: Record<string, number> = { offer: 0, request: 0, observation: 0, event: 0 };
  connections.forEach(c => { counts[c.pin.category] = (counts[c.pin.category] || 0) + 1; });

  const isAccepted = (c: ConnectionMatch) => localAccepted[c.pin.id] ?? c.accepted;

  const handleAccept = (connPin: Pin) => {
    setLocalAccepted(prev => ({ ...prev, [connPin.id]: true }));
  };

  const handleDeny = (connPin: Pin) => {
    setLocalAccepted(prev => ({ ...prev, [connPin.id]: false }));
  };

  return (
    <div style={{ padding: '0 24px 12px 24px' }}>
      {/* Header row: "Connections:" + pills */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2"
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-[6px]">
              {[5, 6, 6].map((s, i) => (
                <div
                  key={i}
                  style={{
                    width: `${s}px`,
                    height: `${s}px`,
                    background: DARK_WOOD,
                    borderRadius: i < 2 ? '9999px' : '0',
                    transform: i === 1 ? 'rotate(12deg)' : i === 2 ? 'rotate(-13deg)' : 'none',
                  }}
                />
              ))}
            </div>
            <span style={{
              color: DARK_WOOD,
              fontSize: '13px',
              fontFamily: "'Public Sans', sans-serif",
              fontWeight: 500,
              textTransform: 'capitalize',
            }}>
              Connections:
            </span>
          </div>
        </button>

        {/* Category count pills */}
        <div className="flex items-center gap-[4px] overflow-hidden">
          {(['offer', 'request', 'event', 'observation'] as PinCategory[]).map(cat => {
            const g = categoryGradients[cat];
            return (
              <div
                key={cat}
                style={{
                  height: '22px',
                  paddingLeft: '8px',
                  paddingRight: '10px',
                  background: g.pill,
                  backgroundBlendMode: cat === 'request' ? 'darken, normal' : undefined,
                  boxShadow: `0px 3px 3px ${g.pillShadow} inset`,
                  borderRadius: '30px',
                  outline: `0.5px solid ${g.pillBorder}`,
                  outlineOffset: '-0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <img
                  src={categoryIcons[cat]}
                  alt=""
                  style={{ width: '11px', height: '9px', filter: darkIconFilter }}
                />
                <span style={{
                  color: DARK_WOOD,
                  fontSize: '11px',
                  fontFamily: "'Public Sans', sans-serif",
                  fontWeight: 700,
                }}>
                  {counts[cat]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expandable connections list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="flex flex-col gap-4"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            {connections.map((conn) => {
              const accepted = isAccepted(conn);
              const g = categoryGradients[conn.pin.category];
              const icon = categoryIcons[conn.pin.category];

              return (
                <div key={conn.pin.id} className="flex flex-col">
                  {/* Tab header */}
                  <div
                    style={{
                      height: '26px',
                      paddingLeft: '10px',
                      paddingRight: '12px',
                      background: g.tab,
                      boxShadow: `0px 4px 4px ${g.pillShadow} inset`,
                      borderTopLeftRadius: '16px',
                      borderTopRightRadius: '16px',
                      borderLeft: `1.2px solid ${g.tabBorder}`,
                      borderTop: `1.2px solid ${g.tabBorder}`,
                      borderRight: `1.2px solid ${g.tabBorder}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      alignSelf: 'flex-start',
                    }}
                  >
                    <img
                      src={icon}
                      alt=""
                      style={{ width: '13px', height: '11px', filter: darkIconFilter }}
                    />
                    <span style={{
                      color: DARK_WOOD,
                      fontSize: '12px',
                      fontFamily: "'Public Sans', sans-serif",
                      fontWeight: 700,
                    }}>
                      {conn.pin.title}
                    </span>
                  </div>

                  {/* Card body */}
                  <div
                    style={{
                      padding: '12px 20px 16px',
                      background: g.card,
                      backgroundBlendMode: g.cardBlend || 'normal',
                      boxShadow: '1px 4px 24px 10px rgba(0,0,0,0.25)',
                      borderTopRightRadius: '12px',
                      borderBottomRightRadius: '12px',
                      borderBottomLeftRadius: '12px',
                      border: `1.2px solid ${g.cardBorder}`,
                    }}
                  >
                    <p style={{
                      color: accepted ? DARK_WOOD : 'rgba(0,0,0,0.20)',
                      fontSize: '12px',
                      fontFamily: "'Public Sans', sans-serif",
                      fontWeight: 400,
                      lineHeight: '1.4',
                      marginBottom: '8px',
                    }}>
                      {conn.pin.description}
                    </p>

                    {accepted ? (
                      <button
                        onClick={() => onViewDetails?.(conn.pin)}
                        style={{
                          color: DARK_WOOD,
                          fontSize: '10px',
                          fontFamily: "'Public Sans', sans-serif",
                          fontWeight: 500,
                          textDecoration: 'underline',
                          opacity: 0.8,
                        }}
                      >
                        View Details
                      </button>
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        <button
                          onClick={() => handleAccept(conn.pin)}
                          style={{
                            flex: 1,
                            height: '32px',
                            opacity: 0.8,
                            background: 'linear-gradient(0deg, rgba(225,227,178,0.70) 0%, rgba(255,255,255,0.70) 100%)',
                            boxShadow: '1px 1px 4px #91972C inset',
                            borderRadius: '10px',
                            outline: '1px solid #C9CF5B',
                            outlineOffset: '-1px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                          }}
                        >
                          <img src={checkmarkIcon} alt="" style={{ width: '12px', height: '11px', filter: darkIconFilter }} />
                          <span style={{ color: DARK_WOOD, fontSize: '10px', fontFamily: "'Public Sans', sans-serif", fontWeight: 700 }}>
                            CONNECT
                          </span>
                        </button>
                        <button
                          onClick={() => handleDeny(conn.pin)}
                          style={{
                            flex: 1,
                            height: '32px',
                            opacity: 0.8,
                            background: 'linear-gradient(0deg, rgba(225,227,178,0.70) 0%, rgba(255,255,255,0.70) 100%)',
                            boxShadow: '1px 1px 4px #91972C inset',
                            borderRadius: '10px',
                            outline: '1px solid #C9CF5B',
                            outlineOffset: '-1px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                          }}
                        >
                          <img src={xMarkIcon} alt="" style={{ width: '10px', height: '10px', filter: darkIconFilter }} />
                          <span style={{ color: DARK_WOOD, fontSize: '10px', fontFamily: "'Public Sans', sans-serif", fontWeight: 700 }}>
                            DENY
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
