import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { samplePins, PinCategory, Pin } from '@/data/pins';
import { landmarks } from '@/data/landmarks';
import searchIconSvg from '@/assets/search-icon.svg';
import offerNoOutline from '@/assets/offer-no-outline.svg';
import requestNoOutline from '@/assets/request-no-outline.svg';
import observationNoOutline from '@/assets/signal-no-outline.svg';
import gatheringNoOutline from '@/assets/gathering.svg';

/* ── colour map ── */
const categoryColors: Record<PinCategory, string> = {
  offer: '#79E824',
  request: '#FF48B5',
  observation: '#FF6C2F',
  event: '#B036FF',
};

const categoryLabels: Record<PinCategory, string> = {
  offer: 'Offer',
  request: 'Request',
  observation: 'Observation',
  event: 'Gathering',
};

const categoryNoOutlineIcons: Record<PinCategory, string> = {
  offer: offerNoOutline,
  request: requestNoOutline,
  observation: observationNoOutline,
  event: gatheringNoOutline,
};

/* ── tags derived from subcategories across data ── */
const ALL_TAGS = [
  'Water', 'Food', 'Shelter', 'Materials', 'Seeds', 'Medicine',
  'Labor', 'Education', 'Recreation', 'Care', 'Assembly',
];

/* ── relevance keywords for water-need sorting ── */
const WATER_DRINKING_KEYWORDS = [
  'drinking', 'fresh water', 'gallons', 'potable', 'fountain', 'supply',
  'purif', 'filter', 'boil', 'tap water', 'water supply',
];

interface SearchBarProps {
  initialQuery?: string;
  onPinSelect: (pin: Pin) => void;
}

export default function SearchBar({ initialQuery = '', onPinSelect }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [focused, setFocused] = useState(false);
  const [typingDone, setTypingDone] = useState(!initialQuery);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<PinCategory>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  /* auto-type effect */
  useEffect(() => {
    if (!initialQuery) return;
    setQuery('');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setQuery(initialQuery.slice(0, i));
      if (i >= initialQuery.length) {
        clearInterval(interval);
        setTypingDone(true);
        setFocused(true);
      }
    }, 80);
    return () => clearInterval(interval);
  }, [initialQuery]);

  /* build full item list */
  const allItems: Pin[] = useMemo(() => [
    ...samplePins,
    ...landmarks.flatMap((lm) =>
      lm.pins.map((lp) => ({
        id: `${lm.id}-${lp.title}`,
        category: lp.category,
        title: lp.title,
        description: lp.description,
        subcategory: lp.subcategory,
        distance: lp.distance,
        postedBy: lp.postedBy,
        x: lm.x,
        y: lm.y,
      }))
    ),
  ], []);

  /* filter + smart sort */
  const results = useMemo(() => {
    const q = query.toLowerCase().trim();

    const tagTerms = Array.from(selectedTags).map(t => t.toLowerCase());
    const searchTerms = q ? [q, ...tagTerms] : tagTerms;

    if (searchTerms.length === 0 && selectedCategories.size === 0) return [];

    let filtered = allItems.filter((item) => {
      if (selectedCategories.size > 0 && !selectedCategories.has(item.category)) return false;

      if (searchTerms.length > 0) {
        const haystack = `${item.title} ${item.description} ${item.subcategory} ${item.category}`.toLowerCase();
        return searchTerms.some(term => haystack.includes(term));
      }
      return true;
    });

    const primaryTag = tagTerms[0] || q;

    filtered.sort((a, b) => {
      const aUrgent = a.category === 'request' && (a.urgency === 'critical' || a.urgency === 'high') ? 1 : 0;
      const bUrgent = b.category === 'request' && (b.urgency === 'critical' || b.urgency === 'high') ? 1 : 0;
      if (bUrgent !== aUrgent) return bUrgent - aUrgent;

      if (primaryTag) {
        const aRelevance = computeRelevance(a, primaryTag);
        const bRelevance = computeRelevance(b, primaryTag);
        if (bRelevance !== aRelevance) return bRelevance - aRelevance;
      }

      const catPriority: Record<string, number> = { request: 3, offer: 2, event: 1, observation: 0 };
      return (catPriority[b.category] || 0) - (catPriority[a.category] || 0);
    });

    return filtered;
  }, [query, selectedTags, selectedCategories, allItems]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag); else next.add(tag);
      return next;
    });
  };

  const toggleCategory = (cat: PinCategory) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  };

  const hasFilters = query.trim().length > 0 || selectedTags.size > 0 || selectedCategories.size > 0;

  return (
    <div className="relative flex-1 max-w-md">
      {/* Input row */}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setTypingDone(true); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 250)}
          placeholder="water: requests, offers"
          className="w-full h-9 pl-4 pr-12 rounded-full bg-muted/30 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-lime/50 transition-all"
          style={{ fontFamily: "'Public Sans', sans-serif" }}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            className="absolute right-11 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={14} />
          </button>
        )}
        <button
          onClick={() => inputRef.current?.focus()}
          className="absolute right-0 top-0 h-9 w-9 rounded-full flex items-center justify-center transition-transform active:scale-95"
          style={{ backgroundColor: '#DAE16B' }}
          title="Search"
        >
          <img src={searchIconSvg} alt="Search" className="w-4 h-4" />
        </button>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {focused && (
          <motion.div
            ref={panelRef}
            className="absolute top-full left-0 right-0 mt-1 earth-panel rounded-xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            style={{ fontFamily: "'Public Sans', sans-serif" }}
          >
            {/* Tags row */}
            <div className="p-2.5 pb-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-1 pb-1.5" style={{ fontFamily: "'Public Sans', sans-serif" }}>Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_TAGS.map((tag) => {
                  const active = selectedTags.has(tag);
                  return (
                    <button
                      key={tag}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => toggleTag(tag)}
                      className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                      style={{
                        fontFamily: "'Public Sans', sans-serif",
                        border: `1.2px solid ${active ? '#DAE16B' : 'hsla(25, 15%, 55%, 0.4)'}`,
                        backgroundColor: active ? 'hsla(64, 67%, 65%, 0.15)' : 'hsla(25, 15%, 55%, 0.1)',
                        color: active ? '#DAE16B' : '#F4EDE8',
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category filters row */}
            <div className="px-2.5 pt-1.5 pb-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-1 pb-1.5" style={{ fontFamily: "'Public Sans', sans-serif" }}>Categories</p>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(categoryLabels) as PinCategory[]).map((cat) => {
                  const active = selectedCategories.has(cat);
                  const color = categoryColors[cat];
                  return (
                    <button
                      key={cat}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => toggleCategory(cat)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all"
                      style={{
                        fontFamily: "'Public Sans', sans-serif",
                        backgroundColor: active ? color : 'transparent',
                        color: active ? '#2D2520' : '#F4EDE8',
                        border: active ? 'none' : '1.2px solid hsla(25, 15%, 55%, 0.3)',
                      }}
                    >
                      <img src={categoryNoOutlineIcons[cat]} alt="" className="w-3 h-3" />
                      {categoryLabels[cat]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Separator */}
            {hasFilters && <div className="h-px bg-border/30 mx-2.5" />}

            {/* Results */}
            {results.length > 0 && (
              <div className="p-1.5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-2 pb-1" style={{ fontFamily: "'Public Sans', sans-serif" }}>
                  {results.length} result{results.length !== 1 ? 's' : ''}
                </p>
                {results.slice(0, 12).map((item) => {
                  const isUrgent = item.category === 'request' && (item.urgency === 'critical' || item.urgency === 'high');
                  return (
                    <button
                      key={item.id}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => { onPinSelect(item); setFocused(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left hover:bg-muted/30 transition-colors"
                    >
                      <img src={categoryNoOutlineIcons[item.category]} alt="" className="w-4 h-3 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-foreground truncate" style={{ fontFamily: "'Public Sans', sans-serif" }}>
                            {item.title}
                          </p>
                          {isUrgent && (
                            <span
                              className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full shrink-0"
                              style={{
                                backgroundColor: 'hsla(326, 100%, 64%, 0.15)',
                                color: '#FF48B5',
                                fontFamily: "'Public Sans', sans-serif",
                              }}
                            >
                              Urgent
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate" style={{ fontFamily: "'Public Sans', sans-serif" }}>
                          {categoryLabels[item.category]} · {item.subcategory}
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0" style={{ fontFamily: "'Public Sans', sans-serif" }}>{item.distance}</span>
                    </button>
                  );
                })}
                {results.length > 12 && (
                  <p className="text-[10px] text-muted-foreground text-center py-2" style={{ fontFamily: "'Public Sans', sans-serif" }}>
                    +{results.length - 12} more results
                  </p>
                )}
              </div>
            )}

            {hasFilters && results.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4" style={{ fontFamily: "'Public Sans', sans-serif" }}>
                No results found
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── relevance scorer ── */
function computeRelevance(pin: Pin, tag: string): number {
  const text = `${pin.title} ${pin.description}`.toLowerCase();
  let score = 0;

  if (pin.title.toLowerCase().includes(tag)) score += 3;
  if (pin.subcategory.toLowerCase().includes(tag)) score += 2;
  if (pin.description.toLowerCase().includes(tag)) score += 1;

  if (tag === 'water') {
    const isConsumable = WATER_DRINKING_KEYWORDS.some(kw => text.includes(kw));
    if (isConsumable) score += 5;
    if (text.includes('assembly') || text.includes('ceremony') || text.includes('watershed')) score -= 2;
  }

  return score;
}
