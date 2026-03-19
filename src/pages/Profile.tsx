import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, MessageCircle, Vote, BarChart3, Settings, Check } from 'lucide-react';
import { useProfile } from '@/hooks/use-profile';

type Tab = 'settings' | 'chats' | 'votes' | 'stats';

const languages = ['English', 'Lenape', 'Español', 'Français'];
const timezones = ['EST (UTC-5)', 'CST (UTC-6)', 'MST (UTC-7)', 'PST (UTC-8)'];
const pronounOptions = ['he/him', 'she/her', 'they/them', 'ze/zir', 'Custom'];

const mockChats = [
  { id: '1', with: 'River Keeper', lastMessage: 'The persimmons are ready!', time: '2h ago' },
  { id: '2', with: 'Basket Weaver', lastMessage: 'I can bring cedar bark tomorrow', time: '5h ago' },
  { id: '3', with: 'Council', lastMessage: 'Assembly moved to new moon', time: '1d ago' },
];

const mockVotes = [
  { id: '1', title: 'Restrict Eastern Trail Access', voted: 'yes', total: 79 },
  { id: '2', title: 'Expand Seed Library Hours', voted: 'yes', total: 45 },
  { id: '3', title: 'New Composting Station Location', voted: 'no', total: 62 },
];

const mockStats = {
  postsCreated: 7,
  offersCompleted: 4,
  requestsFulfilled: 2,
  observationsLogged: 12,
  eventsAttended: 5,
  communityScore: 84,
};

export default function Profile() {
  const navigate = useNavigate();
  const { profile, isLoading, updateProfile } = useProfile();
  const [tab, setTab] = useState<Tab>('settings');
  const [name, setName] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [locationBase, setLocationBase] = useState('');
  const [timezone, setTimezone] = useState('');
  const [language, setLanguage] = useState('');
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync local state from DB profile
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
    { key: 'chats', icon: <MessageCircle size={16} />, label: 'Chats' },
    { key: 'votes', icon: <Vote size={16} />, label: 'Votes' },
    { key: 'stats', icon: <BarChart3 size={16} />, label: 'Stats' },
  ];

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-display text-sm">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background overflow-y-auto">
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
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
          </motion.div>
        )}

        {tab === 'chats' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {mockChats.map((chat) => (
              <div key={chat.id} className="earth-panel rounded-xl p-3 flex items-center gap-3 hover:bg-muted/20 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <User size={14} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-display font-semibold text-foreground">{chat.with}</p>
                  <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                </div>
                <span className="text-[10px] text-muted-foreground flex-shrink-0">{chat.time}</span>
              </div>
            ))}
          </motion.div>
        )}

        {tab === 'votes' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {mockVotes.map((vote) => (
              <div key={vote.id} className="earth-panel rounded-xl p-3 space-y-2">
                <p className="text-sm font-display font-semibold text-foreground">{vote.title}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded-full font-display font-medium ${
                    vote.voted === 'yes' ? 'bg-observation/20 text-observation' : 'bg-destructive/20 text-destructive'
                  }`}>
                    You voted {vote.voted}
                  </span>
                  <span className="text-muted-foreground">{vote.total} total votes</span>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {tab === 'stats' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="earth-panel rounded-xl p-4 text-center">
              <p className="text-3xl font-display font-bold text-primary">{mockStats.communityScore}</p>
              <p className="text-xs text-muted-foreground font-display mt-1">Community Score</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Posts Created', value: mockStats.postsCreated },
                { label: 'Offers Completed', value: mockStats.offersCompleted },
                { label: 'Requests Fulfilled', value: mockStats.requestsFulfilled },
                { label: 'Observations', value: mockStats.observationsLogged },
                { label: 'Events Attended', value: mockStats.eventsAttended },
              ].map((stat) => (
                <div key={stat.label} className="earth-panel rounded-xl p-3 text-center">
                  <p className="text-xl font-display font-bold text-foreground">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground font-display mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
