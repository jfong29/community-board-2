import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Search } from 'lucide-react';
import FloatingDock from '@/components/FloatingDock';
import { samplePins, PinCategory } from '@/data/pins';
import PinIcon from '@/components/PinIcon';
import searchButtonSvg from '@/assets/search-button.svg';

type ChatTab = 'individual' | 'group' | 'forum';

interface IndividualChat {
  id: string;
  name: string;
  pinTitle: string;
  pinCategory: PinCategory;
  lastMessage: string;
  time: string;
  unread: number;
  tags: string[];
}

interface GroupChat {
  id: string;
  name: string;
  members: number;
  lastMessage: string;
  lastSender: string;
  time: string;
  unread: number;
  tags: string[];
}

interface TopicForum {
  id: string;
  topic: string;
  description: string;
  posts: number;
  activeNow: number;
  tags: string[];
}

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

const ALL_TAGS = ['Water', 'Food', 'Shelter', 'Materials', 'Seeds', 'Medicine', 'Labor', 'Education', 'Recreation', 'Care', 'Assembly'];

// Build sample chats from existing pin data so chats reference real listings
const individualChats: IndividualChat[] = samplePins.slice(0, 8).map((p, i) => ({
  id: `ind-${p.id}`,
  name: p.postedBy,
  pinTitle: p.title,
  pinCategory: p.category,
  lastMessage: i % 2 === 0
    ? `Yes, still available — when works for you?`
    : `Thanks for reaching out, I can meet tomorrow.`,
  time: ['2m', '14m', '1h', '3h', 'Yesterday', '2d', '4d', '1w'][i] || '1w',
  unread: i < 3 ? (i + 1) : 0,
  tags: [p.subcategory],
}));

const groupChats: GroupChat[] = [
  { id: 'g1', name: 'Lower East Side Mutual Aid', members: 142, lastMessage: 'Distribution at 6pm — bring containers', lastSender: 'Maya', time: '8m', unread: 4, tags: ['Food', 'Care'] },
  { id: 'g2', name: 'Werpoes Water Watchers', members: 38, lastMessage: 'Logged turbidity reading near pier 26', lastSender: 'Jorge', time: '32m', unread: 0, tags: ['Water'] },
  { id: 'g3', name: 'Seed Library Coop', members: 67, lastMessage: 'Tomato starts ready for swap Sunday', lastSender: 'Iris', time: '2h', unread: 1, tags: ['Seeds', 'Food'] },
  { id: 'g4', name: 'Bowery Tool Share', members: 24, lastMessage: 'The drill is back, thanks all!', lastSender: 'Diego', time: '5h', unread: 0, tags: ['Materials', 'Labor'] },
  { id: 'g5', name: 'Chinatown Elder Care Circle', members: 91, lastMessage: 'Need ride to clinic Thursday', lastSender: 'Wen', time: 'Yesterday', unread: 2, tags: ['Care', 'Labor'] },
  { id: 'g6', name: 'East River Cleanup Crew', members: 53, lastMessage: 'Saturday gathering confirmed 9am', lastSender: 'Kai', time: '2d', unread: 0, tags: ['Assembly', 'Recreation'] },
];

const topicForums: TopicForum[] = [
  { id: 'f1', topic: 'Climate Adaptation', description: 'Local strategies, heat island response, rainfall surges', posts: 312, activeNow: 14, tags: ['Water', 'Shelter'] },
  { id: 'f2', topic: 'Food Sovereignty', description: 'Growing, sharing, and reclaiming food systems', posts: 487, activeNow: 22, tags: ['Food', 'Seeds'] },
  { id: 'f3', topic: 'Housing & Shelter', description: 'Tenant solidarity, repairs, emergency shelter', posts: 198, activeNow: 8, tags: ['Shelter', 'Care'] },
  { id: 'f4', topic: 'Water Stewardship', description: 'Watershed protection, drinking water, rain capture', posts: 156, activeNow: 6, tags: ['Water'] },
  { id: 'f5', topic: 'Indigenous Knowledge', description: 'Lenape land relations, seasonal practice, language', posts: 241, activeNow: 11, tags: ['Education', 'Assembly'] },
  { id: 'f6', topic: 'Mutual Aid Coordination', description: 'Cross-network logistics, surplus and need matching', posts: 379, activeNow: 17, tags: ['Care', 'Labor'] },
];

export default function Chats() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<ChatTab>('individual');
  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<PinCategory>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);

  const toggleTag = (t: string) => setSelectedTags(prev => {
    const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n;
  });
  const toggleCategory = (c: PinCategory) => setSelectedCategories(prev => {
    const n = new Set(prev); n.has(c) ? n.delete(c) : n.add(c); return n;
  });

  const q = query.toLowerCase().trim();
  const tagArr = Array.from(selectedTags);

  const matches = (haystack: string, tags: string[], category?: PinCategory) => {
    if (q && !haystack.toLowerCase().includes(q)) return false;
    if (tagArr.length && !tagArr.some(t => tags.includes(t))) return false;
    if (selectedCategories.size && (!category || !selectedCategories.has(category))) return false;
    return true;
  };

  const filteredIndividual = useMemo(() =>
    individualChats.filter(c => matches(`${c.name} ${c.pinTitle} ${c.lastMessage}`, c.tags, c.pinCategory)),
    [q, selectedTags, selectedCategories]
  );
  const filteredGroups = useMemo(() =>
    groupChats.filter(c => matches(`${c.name} ${c.lastMessage}`, c.tags) && (selectedCategories.size === 0 || tab === 'group')),
    [q, selectedTags, selectedCategories, tab]
  );
  const filteredForums = useMemo(() =>
    topicForums.filter(f => matches(`${f.topic} ${f.description}`, f.tags) && (selectedCategories.size === 0 || tab === 'forum')),
    [q, selectedTags, selectedCategories, tab]
  );

  const tabs: { id: ChatTab; label: string; count: number }[] = [
    { id: 'individual', label: 'Individual', count: filteredIndividual.length },
    { id: 'group', label: 'Groups', count: filteredGroups.length },
    { id: 'forum', label: 'Forums', count: filteredForums.length },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ paddingBottom: 90 }}>
      {/* Header */}
      <div className="px-[30px] pt-6 pb-4">
        <h1 className="font-display font-semibold text-foreground" style={{ fontSize: 28, fontFamily: 'Labrada, serif' }}>
          Chats
        </h1>
        <p className="text-xs text-muted-foreground mt-1" style={{ fontFamily: "'Public Sans', sans-serif" }}>
          Conversations across pins, groups, and topic forums
        </p>
      </div>

      {/* Search bar */}
      <div className="px-[30px] pb-3">
        <div className="relative flex w-full items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFiltersOpen(true)}
            placeholder="search chats, tags, people"
            className="w-full min-w-0 h-[42px] rounded-full pl-4 pr-[55px] focus:outline-none transition-all"
            style={{
              fontFamily: "'Public Sans', sans-serif",
              fontWeight: 400,
              fontSize: 15,
              color: 'hsl(24 17% 19%)',
              backgroundColor: 'hsl(22 33% 94%)',
              boxShadow: '0px 0.875px 0.875px rgba(0, 0, 0, 0.25), 0px 3.0625px 7.4375px rgba(0, 0, 0, 0.25) inset',
              outline: '1.31px solid hsl(24 12% 22%)',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute top-1/2 right-[50px] -translate-y-1/2 hover:opacity-70"
              style={{ color: 'hsl(24 17% 19%)' }}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={() => setFiltersOpen(o => !o)}
            className="absolute right-0 top-1/2 flex h-[42px] w-[53px] -translate-y-1/2 items-center justify-center transition-transform active:scale-95"
            title="Filters"
          >
            <img src={searchButtonSvg} alt="Search" className="h-full w-full" />
          </button>
        </div>

        {/* Filters panel */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              className="earth-panel rounded-xl overflow-hidden mt-2"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <div className="p-2.5 pb-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-1 pb-1.5" style={{ fontFamily: "'Public Sans', sans-serif" }}>Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_TAGS.map(t => {
                    const active = selectedTags.has(t);
                    return (
                      <button
                        key={t}
                        onClick={() => toggleTag(t)}
                        className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                        style={{
                          fontFamily: "'Public Sans', sans-serif",
                          border: `1.2px solid ${active ? '#DAE16B' : 'hsla(25, 15%, 55%, 0.4)'}`,
                          backgroundColor: active ? 'hsla(64, 67%, 65%, 0.15)' : 'hsla(25, 15%, 55%, 0.1)',
                          color: active ? '#DAE16B' : '#F4EDE8',
                        }}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="px-2.5 pt-1.5 pb-2.5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-1 pb-1.5" style={{ fontFamily: "'Public Sans', sans-serif" }}>Categories</p>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(categoryLabels) as PinCategory[]).map(cat => {
                    const active = selectedCategories.has(cat);
                    const color = categoryColors[cat];
                    return (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all"
                        style={{
                          fontFamily: "'Public Sans', sans-serif",
                          backgroundColor: active ? color : 'transparent',
                          color: active ? '#2D2520' : '#F4EDE8',
                          border: active ? 'none' : '1.2px solid hsla(25, 15%, 55%, 0.3)',
                        }}
                      >
                        <PinIcon category={cat} size={12} animate={false} />
                        {categoryLabels[cat]}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-between items-center px-3 py-2 border-t border-border/30">
                <button
                  onClick={() => { setSelectedTags(new Set()); setSelectedCategories(new Set()); setQuery(''); }}
                  className="text-[11px] text-muted-foreground hover:text-foreground"
                  style={{ fontFamily: "'Public Sans', sans-serif" }}
                >
                  Clear all
                </button>
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="text-[11px] font-semibold"
                  style={{ fontFamily: "'Public Sans', sans-serif", color: '#DAE16B' }}
                >
                  Done
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tabs */}
      <div className="px-[30px] pb-3">
        <div className="flex gap-2">
          {tabs.map(t => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex-1 px-3 py-2 rounded-full text-xs font-semibold transition-all"
                style={{
                  fontFamily: "'Public Sans', sans-serif",
                  backgroundColor: active ? '#DAE16B' : 'transparent',
                  color: active ? '#2D2520' : '#F4EDE8',
                  border: active ? 'none' : '1.2px solid hsla(25, 15%, 55%, 0.3)',
                }}
              >
                {t.label} <span className="opacity-70 ml-0.5">({t.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-[30px] pb-4">
        {tab === 'individual' && (
          <div className="space-y-2">
            {filteredIndividual.length === 0 && <EmptyState label="No individual chats match" />}
            {filteredIndividual.map(c => (
              <button
                key={c.id}
                className="w-full earth-panel rounded-xl p-3 flex items-start gap-3 text-left hover:bg-muted/20 transition-colors"
              >
                <div className="shrink-0 mt-0.5">
                  <PinIcon category={c.pinCategory} size={22} animate={false} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-display font-semibold text-sm text-foreground truncate" style={{ fontFamily: 'Labrada, serif' }}>
                      {c.name}
                    </p>
                    <span className="text-[10px] text-muted-foreground shrink-0" style={{ fontFamily: "'Public Sans', sans-serif" }}>{c.time}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate mb-1" style={{ fontFamily: "'Public Sans', sans-serif" }}>
                    re: {c.pinTitle}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-foreground/80 truncate" style={{ fontFamily: "'Public Sans', sans-serif" }}>
                      {c.lastMessage}
                    </p>
                    {c.unread > 0 && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ backgroundColor: '#DAE16B', color: '#2D2520', fontFamily: "'Public Sans', sans-serif" }}
                      >
                        {c.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {tab === 'group' && (
          <div className="space-y-2">
            {filteredGroups.length === 0 && <EmptyState label="No groups match" />}
            {filteredGroups.map(g => (
              <button
                key={g.id}
                className="w-full earth-panel rounded-xl p-3 text-left hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display font-semibold text-sm text-foreground truncate" style={{ fontFamily: 'Labrada, serif' }}>
                    {g.name}
                  </p>
                  <span className="text-[10px] text-muted-foreground shrink-0" style={{ fontFamily: "'Public Sans', sans-serif" }}>{g.time}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mb-1.5" style={{ fontFamily: "'Public Sans', sans-serif" }}>
                  <span className="italic">{g.members}</span> members
                </p>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <p className="text-xs text-foreground/80 truncate" style={{ fontFamily: "'Public Sans', sans-serif" }}>
                    <span className="font-semibold">{g.lastSender}:</span> {g.lastMessage}
                  </p>
                  {g.unread > 0 && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                      style={{ backgroundColor: '#DAE16B', color: '#2D2520', fontFamily: "'Public Sans', sans-serif" }}
                    >
                      {g.unread}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {g.tags.map(t => (
                    <span
                      key={t}
                      className="text-[9px] px-1.5 py-0.5 rounded-full"
                      style={{
                        fontFamily: "'Public Sans', sans-serif",
                        border: '1px solid hsla(25, 15%, 55%, 0.3)',
                        color: '#F4EDE8',
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}

        {tab === 'forum' && (
          <div className="space-y-2">
            {filteredForums.length === 0 && <EmptyState label="No forums match" />}
            {filteredForums.map(f => (
              <button
                key={f.id}
                className="w-full earth-panel rounded-xl p-3 text-left hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="font-display font-semibold text-sm text-foreground truncate" style={{ fontFamily: 'Labrada, serif' }}>
                    {f.topic}
                  </p>
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 flex items-center gap-1"
                    style={{ backgroundColor: 'hsla(95, 65%, 52%, 0.15)', color: '#79E824', fontFamily: "'Public Sans', sans-serif" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#79E824' }} />
                    <span className="italic">{f.activeNow}</span> active
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mb-1.5" style={{ fontFamily: "'Public Sans', sans-serif" }}>
                  {f.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {f.tags.map(t => (
                      <span
                        key={t}
                        className="text-[9px] px-1.5 py-0.5 rounded-full"
                        style={{
                          fontFamily: "'Public Sans', sans-serif",
                          border: '1px solid hsla(25, 15%, 55%, 0.3)',
                          color: '#F4EDE8',
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground" style={{ fontFamily: "'Public Sans', sans-serif" }}>
                    <span className="italic">{f.posts}</span> posts
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <FloatingDock onAdd={() => navigate('/')} activeTab="chat" />
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="text-center py-12">
      <p className="text-xs text-muted-foreground" style={{ fontFamily: "'Public Sans', sans-serif" }}>{label}</p>
    </div>
  );
}
