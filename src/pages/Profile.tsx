import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, ScrollText, Settings, Check, ChevronRight } from 'lucide-react';
import { useProfile } from '@/hooks/use-profile';
import { usePosts } from '@/hooks/use-posts';
import PinIcon from '@/components/PinIcon';
import EcoStatusBar from '@/components/EcoStatusBar';
import FloatingDock from '@/components/FloatingDock';

type Tab = 'settings' | 'log';

const languages = ['English', 'Lenape', 'Español', 'Français'];
const timezones = ['EST (UTC-5)', 'CST (UTC-6)', 'MST (UTC-7)', 'PST (UTC-8)'];
const pronounOptions = ['he/him', 'she/her', 'they/them', 'ze/zir', 'Custom'];

const categoryColorMap: Record<string, string> = {
  offer: 'hsl(184, 100%, 27%)',
  request: 'hsl(22, 100%, 42%)',
  observation: 'hsl(140, 65%, 32%)',
  event: 'hsl(262, 45%, 65%)',
};

export default function Profile() {
  const navigate = useNavigate();
  const { profile, isLoading, updateProfile } = useProfile();
  const { posts, userPosts } = usePosts(profile?.id);
  const [tab, setTab] = useState<Tab>('settings');
  const [name, setName] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [locationBase, setLocationBase] = useState('');
  const [timezone, setTimezone] = useState('');
  const [language, setLanguage] = useState('');
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [showGenerated, setShowGenerated] = useState(() => localStorage.getItem('show_generated_pins') === 'true');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setPronouns(profile.pronouns);
      setLocationBase(profile.location_base);
      setTimezone(profile.timezone);
      setLanguage(profile.language);
      setLargeText(profile.large_text);
      setHighContrast(profile.high_contrast);
    }
  }, [profile]);

  const handleSave = () => {
    updateProfile.mutate({
      name,
      pronouns,
      location_base: locationBase,
      timezone,
      language,
      large_text: largeText,
      high_contrast: highContrast,
    }, {
      onSuccess: () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  };

  const inputClass = "w-full bg-muted/30 border border-border/40 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-body";

  const tabs: { key: Tab; icon: React.ReactNode; label: string }[] = [
    { key: 'settings', icon: <Settings size={16} />, label: 'Settings' },
    { key: 'log', icon: <ScrollText size={16} />, label: 'Log' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" style={{ paddingTop: 'var(--header-bottom, 90px)' }}>
        <EcoStatusBar showFilters={false} />
        <p className="text-muted-foreground font-display text-sm">Loading profile…</p>
        <FloatingDock onAdd={() => navigate('/')} />
      </div>
    );
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background pb-24" style={{ paddingTop: 'var(--header-bottom, 90px)' }}>
      <EcoStatusBar showFilters={false} />
      {/* Header */}
      <div className="earth-panel border-b border-border/30 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-1 text-foreground hover:bg-muted/30 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <User size={16} className="text-primary" />
          </div>
          <span className="font-display font-semibold text-foreground text-sm">{name}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/30">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-display font-medium transition-colors ${
              tab === t.key ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 max-w-md mx-auto space-y-4">
        {tab === 'settings' && (
          <div className="space-y-4">
            <div>
              <label className="text-[11px] text-muted-foreground font-display block mb-1">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </div>

            <div>
              <label className="text-[11px] text-muted-foreground font-display block mb-1.5">Pronouns</label>
              <div className="flex gap-1.5 flex-wrap">
                {pronounOptions.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPronouns(p)}
                    className={`px-3 py-1 rounded-full text-[11px] font-display font-medium border transition-all ${
                      pronouns === p
                        ? 'border-primary/50 bg-primary/15 text-primary'
                        : 'border-border/40 text-muted-foreground hover:border-foreground/20'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] text-muted-foreground font-display block mb-1">Location Base</label>
              <input value={locationBase} onChange={(e) => setLocationBase(e.target.value)} className={inputClass} placeholder="e.g. Werpoes, Kapsee" />
            </div>

            <div>
              <label className="text-[11px] text-muted-foreground font-display block mb-1">Timezone</label>
              <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={`${inputClass} appearance-none`}>
                {timezones.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-muted-foreground font-display block mb-1">Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className={`${inputClass} appearance-none`}>
                {languages.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div className="space-y-3 pt-2">
              <p className="text-[11px] text-muted-foreground font-display">Developer</p>
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-foreground font-body">Show Generated Pins</span>
                  <p className="text-[10px] text-muted-foreground font-body mt-0.5">Preview auto-generated community pins on the map</p>
                </div>
                <button
                  onClick={() => {
                    const next = !showGenerated;
                    setShowGenerated(next);
                    localStorage.setItem('show_generated_pins', String(next));
                  }}
                  className={`w-10 h-6 rounded-full transition-colors flex-shrink-0 ${showGenerated ? 'bg-primary' : 'bg-muted/50'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-foreground transition-transform mx-1 ${showGenerated ? 'translate-x-4' : ''}`} />
                </button>
              </label>
            </div>

            <div className="space-y-3 pt-2">
              <p className="text-[11px] text-muted-foreground font-display">Accessibility</p>
              <label className="flex items-center justify-between">
                <span className="text-sm text-foreground font-body">Large Text</span>
                <button
                  onClick={() => setLargeText(!largeText)}
                  className={`w-10 h-6 rounded-full transition-colors ${largeText ? 'bg-primary' : 'bg-muted/50'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-foreground transition-transform mx-1 ${largeText ? 'translate-x-4' : ''}`} />
                </button>
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-foreground font-body">High Contrast</span>
                <button
                  onClick={() => setHighContrast(!highContrast)}
                  className={`w-10 h-6 rounded-full transition-colors ${highContrast ? 'bg-primary' : 'bg-muted/50'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-foreground transition-transform mx-1 ${highContrast ? 'translate-x-4' : ''}`} />
                </button>
              </label>
            </div>

            <button
              onClick={handleSave}
              disabled={updateProfile.isPending}
              className="w-full py-3 rounded-xl font-display font-semibold text-sm bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saved ? <><Check size={16} /> Saved</> : updateProfile.isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        )}

        {tab === 'log' && (
          <div className="space-y-3">
            {/* Summary counts */}
            <div className="grid grid-cols-4 gap-2 mb-2">
              {(['offer', 'request', 'observation', 'event'] as const).map((cat) => {
                const count = userPosts.filter(p => p.category === cat).length;
                return (
                  <div key={cat} className="earth-panel rounded-xl p-2 text-center">
                    <PinIcon category={cat} size={16} animate={false} />
                    <p className="text-lg font-display font-bold text-foreground mt-1">{count}</p>
                    <p className="text-[9px] text-muted-foreground font-display capitalize">{cat}s</p>
                  </div>
                );
              })}
            </div>

            {userPosts.length === 0 ? (
              <div className="text-center py-8">
                <ScrollText size={32} className="mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground font-display">No posts yet</p>
                <p className="text-xs text-muted-foreground/60 font-body mt-1">Your posts will appear here</p>
              </div>
            ) : (
              userPosts.map((post: any) => (
                <button
                  key={post.id}
                  onClick={() => navigate(`/?search=${encodeURIComponent(post.title)}`)}
                  className="w-full earth-panel rounded-xl p-3 flex items-center gap-3 hover:bg-muted/20 transition-colors text-left"
                >
                  <PinIcon category={post.category} size={24} animate={false} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-display font-semibold text-foreground truncate">{post.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="text-[10px] font-display font-medium px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${categoryColorMap[post.category]}15`,
                          color: categoryColorMap[post.category],
                        }}
                      >
                        {post.subcategory}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
                </button>
              ))
            )}
          </div>
        )}

      </div>

      <FloatingDock onAdd={() => navigate('/')} />
    </div>
  );
}
