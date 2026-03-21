import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Bookmark, ExternalLink } from 'lucide-react';
import { Pin, PinCategory, samplePins } from '@/data/pins';
import calendarIcon from '@/assets/calendar.svg';
import savedIcon from '@/assets/saved.svg';
import offerIcon from '@/assets/offer.svg';
import requestIcon from '@/assets/request.svg';
import observationIcon from '@/assets/observation.svg';
import gatheringIcon from '@/assets/gathering.svg';

interface CalendarPanelProps {
  open: boolean;
  onClose: () => void;
  onPinSelect?: (pin: Pin) => void;
}

type CalendarFilter = 'all' | 'saved' | PinCategory;

const SEASON_INFO = {
  siquon: {
    name: 'Siquon',
    meaning: 'Siquon is the Lenape word for the spring season — a time of awakening, planting, and renewal. It begins when the shadbush blooms and the alewife run upstream.',
    indicators: [
      { plant: 'Wild Strawberry', icon: '🍓', status: 'Blooming', action: 'Time to harvest', linkedCategory: 'offer' as PinCategory },
      { plant: 'White Oak', icon: '🌳', status: 'Leafing', action: 'Acorn harvest in 4 moons', linkedCategory: null },
      { plant: 'Sweetgrass', icon: '🌾', status: 'Growing', action: 'Ready to braid soon', linkedCategory: null },
      { plant: 'Elderberry', icon: '🫐', status: 'Flowering', action: 'Berries in 2 moons', linkedCategory: null },
      { plant: 'Three Sisters', icon: '🌽', status: 'Planting time', action: 'Sow after last frost', linkedCategory: 'request' as PinCategory },
    ],
  },
  spring: {
    name: 'Spring',
    meaning: 'In the modern calendar, spring marks the vernal equinox through the summer solstice. Temperatures rise, pollinators awaken, and migratory birds return to the region. It\'s the season for planting, restoration, and community gatherings.',
  },
};

function getWeekDates(offset: number): Date[] {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function getMonthName(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Deterministic date for any pin across 2-week window
function getPinDate(pin: Pin, weekDates: Date[]): Date | null {
  let hash = 0;
  for (let i = 0; i < pin.id.length; i++) hash = ((hash << 5) - hash + pin.id.charCodeAt(i)) | 0;
  const dayIdx = Math.abs(hash) % 14;
  const base = new Date(weekDates[0]);
  base.setDate(base.getDate() + dayIdx);
  return base;
}

// Determine time-of-day bucket from pin title/description
type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'anytime';
function getTimeSlot(pin: Pin): TimeSlot {
  const text = (pin.title + ' ' + pin.description).toLowerCase();
  if (/sunrise|morning|dawn|breakfast|am\b|early/.test(text)) return 'morning';
  if (/sunset|evening|twilight|dusk|candlelight|bonfire|night|vigil|pm\b/.test(text)) return 'evening';
  if (/afternoon|lunch|midday|noon/.test(text)) return 'afternoon';
  return 'anytime';
}

const TIME_LABELS: Record<TimeSlot, { label: string; icon: string }> = {
  morning: { label: 'Morning', icon: '🌅' },
  afternoon: { label: 'Afternoon', icon: '☀️' },
  evening: { label: 'Evening', icon: '🌇' },
  anytime: { label: 'Anytime', icon: '🕐' },
};

const TIME_ORDER: TimeSlot[] = ['morning', 'afternoon', 'evening', 'anytime'];

const FILTER_OPTIONS: { value: CalendarFilter; label: string; icon?: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'saved', label: 'Saved' },
  { value: 'offer', label: 'Offers', icon: offerIcon },
  { value: 'request', label: 'Requests', icon: requestIcon },
  { value: 'observation', label: 'Signals', icon: observationIcon },
  { value: 'event', label: 'Gatherings', icon: gatheringIcon },
];

const CATEGORY_COLORS: Record<PinCategory, string> = {
  offer: 'bg-offer/20 text-offer border-offer/30',
  request: 'bg-request/20 text-request border-request/30',
  observation: 'bg-observation/20 text-observation border-observation/30',
  event: 'bg-event/20 text-event border-event/30',
};

const CATEGORY_DOT: Record<PinCategory, string> = {
  offer: 'bg-offer',
  request: 'bg-request',
  observation: 'bg-observation',
  event: 'bg-event',
};

const CATEGORY_ICON: Record<PinCategory, string> = {
  offer: offerIcon,
  request: requestIcon,
  observation: observationIcon,
  event: gatheringIcon,
};

const urgencyScore: Record<string, number> = { critical: 3, high: 2, medium: 1, low: 0 };

export default function CalendarPanel({ open, onClose, onPinSelect }: CalendarPanelProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [filter, setFilter] = useState<CalendarFilter>('all');
  const [savedPinIds, setSavedPinIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('welikia-saved-events');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });
  const [showSiquon, setShowSiquon] = useState(false);
  const [showSpring, setShowSpring] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const today = new Date();
  const todayStr = today.toDateString();

  // ALL pins appear in calendar now — not just events
  const calendarPins = useMemo(() => samplePins, []);

  const pinsByDate = useMemo(() => {
    const map = new Map<string, (Pin & { date: Date })[]>();
    calendarPins.forEach(pin => {
      const date = getPinDate(pin, weekDates);
      if (!date) return;
      const key = date.toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push({ ...pin, date });
    });
    return map;
  }, [calendarPins, weekDates]);

  // Sort pins: urgent first (brighter), then by time of day
  function sortPins(pins: (Pin & { date: Date })[]) {
    return [...pins].sort((a, b) => {
      const ua = urgencyScore[a.urgency ?? 'low'] ?? 0;
      const ub = urgencyScore[b.urgency ?? 'low'] ?? 0;
      if (ub !== ua) return ub - ua;
      const ta = TIME_ORDER.indexOf(getTimeSlot(a));
      const tb = TIME_ORDER.indexOf(getTimeSlot(b));
      return ta - tb;
    });
  }

  function filterPins(pins: (Pin & { date: Date })[]) {
    let filtered = pins;
    if (filter === 'saved') filtered = pins.filter(p => savedPinIds.has(p.id));
    else if (filter !== 'all') filtered = pins.filter(p => p.category === filter);
    return sortPins(filtered);
  }

  const filteredPinsForDay = useMemo(() => {
    if (!selectedDay) return [];
    return filterPins(pinsByDate.get(selectedDay) || []);
  }, [selectedDay, pinsByDate, filter, savedPinIds]);

  const allWeekPins = useMemo(() => {
    const all: (Pin & { date: Date })[] = [];
    weekDates.forEach(d => {
      const key = d.toDateString();
      const pins = pinsByDate.get(key) || [];
      all.push(...pins);
    });
    return filterPins(all);
  }, [weekDates, pinsByDate, filter, savedPinIds]);

  // Group by time slot
  function groupByTime(pins: (Pin & { date: Date })[]) {
    const groups: Record<TimeSlot, (Pin & { date: Date })[]> = {
      morning: [], afternoon: [], evening: [], anytime: [],
    };
    pins.forEach(p => groups[getTimeSlot(p)].push(p));
    return groups;
  }

  const displayPins = selectedDay ? filteredPinsForDay : allWeekPins;
  const groupedPins = groupByTime(displayPins);

  const toggleSave = (pinId: string) => {
    setSavedPinIds(prev => {
      const next = new Set(prev);
      if (next.has(pinId)) next.delete(pinId);
      else next.add(pinId);
      localStorage.setItem('welikia-saved-events', JSON.stringify([...next]));
      return next;
    });
  };

  const handleIndicatorLink = (cat: PinCategory) => {
    const linked = samplePins.find(p => p.category === cat && (p.urgency === 'high' || p.urgency === 'critical'));
    if (linked && onPinSelect) {
      onClose();
      onPinSelect(linked);
    }
  };

  const urgencyBrightness = (pin: Pin) => {
    const score = urgencyScore[pin.urgency ?? 'low'] ?? 0;
    if (score >= 3) return 'brightness-125';
    if (score >= 2) return 'brightness-110';
    return '';
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-background/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed z-[61] w-[min(92vw,400px)]"
            style={{ top: '48px', left: 'var(--grid-gap)' }}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <div className="earth-panel rounded-2xl p-4 space-y-3 max-h-[80vh] overflow-y-auto">
              {/* Header: Month, Season */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-base font-bold text-foreground">
                    {getMonthName(weekDates[0])}
                  </h3>
                  <span className="text-muted-foreground">·</span>
                  <button
                    onClick={() => { setShowSiquon(!showSiquon); setShowSpring(false); }}
                    className="font-display text-sm font-semibold text-lime hover:underline transition-colors"
                  >
                    Siquon
                  </button>
                  <span className="text-muted-foreground text-xs">,</span>
                  <button
                    onClick={() => { setShowSpring(!showSpring); setShowSiquon(false); }}
                    className="font-display text-sm font-medium text-foreground/70 hover:underline transition-colors"
                  >
                    Spring
                  </button>
                </div>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-muted/30 transition-colors">
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>

              {/* Siquon indicators panel */}
              <AnimatePresence>
                {showSiquon && (
                  <motion.div
                    className="space-y-2 border border-border/30 rounded-xl p-3"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <p className="text-[11px] text-muted-foreground mb-2">{SEASON_INFO.siquon.meaning}</p>
                    {SEASON_INFO.siquon.indicators.map((item, i) => (
                      <motion.div
                        key={item.plant}
                        className="flex items-center gap-3 p-2 rounded-xl bg-muted/20"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-display text-xs font-semibold text-foreground">{item.plant}</p>
                          <p className="text-[10px] font-display font-medium text-lime">{item.status}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-muted-foreground text-right">{item.action}</span>
                          {item.linkedCategory && (
                            <button
                              onClick={() => handleIndicatorLink(item.linkedCategory!)}
                              className="p-1 rounded-md hover:bg-muted/40 transition-colors"
                              title="View related pin on map"
                            >
                              <ExternalLink size={10} className="text-lime" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Spring info panel */}
              <AnimatePresence>
                {showSpring && (
                  <motion.div
                    className="border border-border/30 rounded-xl p-3"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <p className="text-[11px] text-foreground/80 leading-relaxed">{SEASON_INFO.spring.meaning}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {FILTER_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setFilter(opt.value)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-display font-medium whitespace-nowrap transition-all ${
                      filter === opt.value
                        ? 'bg-lime/20 text-lime border border-lime/40'
                        : 'bg-muted/20 text-muted-foreground border border-border/30 hover:bg-muted/30'
                    }`}
                  >
                    {opt.value === 'saved' && <img src={savedIcon} alt="" className="w-3 h-3 opacity-70" />}
                    {opt.icon && <img src={opt.icon} alt="" className="w-3 h-3 opacity-70" />}
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Week navigation */}
              <div className="flex items-center justify-between">
                <button onClick={() => setWeekOffset(w => w - 1)} className="p-1 rounded-md hover:bg-muted/30 transition-colors">
                  <ChevronLeft size={16} className="text-muted-foreground" />
                </button>
                <button
                  onClick={() => { setWeekOffset(0); setSelectedDay(null); }}
                  className="text-[11px] font-display font-medium text-lime hover:underline"
                >
                  Today
                </button>
                <button onClick={() => setWeekOffset(w => w + 1)} className="p-1 rounded-md hover:bg-muted/30 transition-colors">
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>
              </div>

              {/* Weekly grid */}
              <div className="grid grid-cols-7 gap-1">
                {DAY_LABELS.map(d => (
                  <div key={d} className="text-center text-[10px] font-display text-muted-foreground font-medium">{d}</div>
                ))}
                {weekDates.map(date => {
                  const key = date.toDateString();
                  const isToday = key === todayStr;
                  const isSelected = key === selectedDay;
                  const dayPins = pinsByDate.get(key) || [];
                  const hasPins = dayPins.length > 0;
                  const categories = [...new Set(dayPins.map(p => p.category))];

                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedDay(isSelected ? null : key)}
                      className={`relative flex flex-col items-center py-1.5 rounded-lg transition-all ${
                        isSelected
                          ? 'bg-lime/20 ring-1 ring-lime/40'
                          : isToday
                            ? 'bg-muted/30 ring-1 ring-lime/20'
                            : 'hover:bg-muted/20'
                      }`}
                    >
                      <span className={`text-sm font-display font-semibold ${
                        isToday ? 'text-lime' : 'text-foreground'
                      }`}>
                        {date.getDate()}
                      </span>
                      {hasPins && (
                        <div className="flex gap-0.5 mt-0.5">
                          {categories.slice(0, 4).map(cat => (
                            <div key={cat} className={`w-1 h-1 rounded-full ${CATEGORY_DOT[cat]}`} />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Events list grouped by time of day */}
              <div className="space-y-2 max-h-[240px] overflow-y-auto">
                {displayPins.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground text-center py-3">
                    {filter === 'saved' ? 'No saved items' : 'No items this period'}
                  </p>
                ) : (
                  TIME_ORDER.map(slot => {
                    const slotPins = groupedPins[slot];
                    if (slotPins.length === 0) return null;
                    return (
                      <div key={slot}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-xs">{TIME_LABELS[slot].icon}</span>
                          <span className="text-[10px] font-display font-semibold text-muted-foreground uppercase tracking-wider">
                            {TIME_LABELS[slot].label}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {slotPins.slice(0, 8).map(pin => (
                            <motion.div
                              key={pin.id}
                              className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer ${CATEGORY_COLORS[pin.category]} ${urgencyBrightness(pin)}`}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              onClick={() => {
                                if (onPinSelect) {
                                  onClose();
                                  onPinSelect(pin);
                                }
                              }}
                            >
                              <img src={CATEGORY_ICON[pin.category]} alt="" className="w-4 h-4 flex-shrink-0 opacity-80" />
                              <div className="flex-1 min-w-0">
                                <p className="font-display text-xs font-semibold truncate">{pin.title}</p>
                                <p className="text-[10px] opacity-70 truncate">
                                  {pin.postedBy}
                                  {pin.urgency === 'critical' && ' · 🔴 Urgent'}
                                  {pin.urgency === 'high' && ' · 🟠 High'}
                                </p>
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleSave(pin.id); }}
                                className={`p-1 rounded-md transition-colors ${
                                  savedPinIds.has(pin.id) ? 'text-lime' : 'text-muted-foreground hover:text-foreground'
                                }`}
                                title={savedPinIds.has(pin.id) ? 'Unsave' : 'Save to calendar'}
                              >
                                <Bookmark size={14} fill={savedPinIds.has(pin.id) ? 'currentColor' : 'none'} />
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
