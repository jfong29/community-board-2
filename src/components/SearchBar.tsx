import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { samplePins, categoryConfig, Pin } from '@/data/pins';
import { landmarks } from '@/data/landmarks';
import PinIcon from './PinIcon';
import searchIconSvg from '@/assets/search-icon.svg';

const quickSuggestions = ['Water', 'Food', 'Shelter', 'Materials', 'Parks', 'Assembly'];

const categoryLabels: Record<string, string> = {
  offer: 'Offer',
  request: 'Request',
  observation: 'Observation',
  event: 'Gathering',
};

interface SearchBarProps {
  initialQuery?: string;
  onPinSelect: (pin: Pin) => void;
}

export default function SearchBar({ initialQuery = '', onPinSelect }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [focused, setFocused] = useState(false);
  const [typingDone, setTypingDone] = useState(!initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const allItems: Pin[] = [
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
  ];

  const q = query.toLowerCase().trim();
  const results = q.length > 0
    ? allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.subcategory.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      )
    : [];

  return (
    <div className="relative flex-1 max-w-md">
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setTypingDone(true); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="water: requests, offers"
          className="w-full h-9 pl-4 pr-12 rounded-full bg-muted/30 border border-border/40 text-sm font-display text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-lime/50 transition-all"
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

      <AnimatePresence>
        {focused && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-1 earth-panel rounded-xl overflow-hidden z-50 max-h-72 overflow-y-auto"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {q.length === 0 && (
              <div className="p-2">
                <p className="text-[10px] font-small text-muted-foreground uppercase tracking-wider px-2 py-1">Quick search</p>
                <div className="flex flex-wrap gap-1 px-1">
                  {quickSuggestions.map((s) => (
                    <button
                      key={s}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => { setQuery(s); setTypingDone(true); }}
                      className="px-2.5 py-1 rounded-full bg-muted/30 text-xs font-display text-foreground hover:bg-muted/50 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {results.length > 0 && (
              <div className="p-1">
                {results.slice(0, 8).map((item) => (
                  <button
                    key={item.id}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onPinSelect(item);
                      setFocused(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left hover:bg-muted/30 transition-colors"
                  >
                    <PinIcon category={item.category} size={16} animate={false} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-display font-semibold text-foreground truncate">{item.title}</p>
                      <p className="text-[10px] font-small text-muted-foreground">{categoryLabels[item.category]} · {item.subcategory}</p>
                    </div>
                    <span className="text-[10px] font-small text-muted-foreground">{item.distance}</span>
                  </button>
                ))}
              </div>
            )}

            {q.length > 0 && results.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No results for "{query}"</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
