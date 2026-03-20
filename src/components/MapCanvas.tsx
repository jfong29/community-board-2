import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Pin, PinCategory, samplePins, latLngToXY } from '@/data/pins';
import { landmarks, Landmark } from '@/data/landmarks';
import { getNeighborhoodAtCoords, Neighborhood } from '@/data/neighborhoods';
import { motion } from 'framer-motion';
import FloatingDock from './FloatingDock';
import DetailSheet from './DetailSheet';
import LandmarkSheet from './LandmarkSheet';
import SubcategorySheet from './SubcategorySheet';
import AddPinModal from './AddPinModal';
import ChatPanel from './ChatPanel';
import EcoStatusBar from './EcoStatusBar';
import StreetMapView, { MapLayer } from './StreetMapView';
import NeighborhoodInfoSheet from './NeighborhoodInfoSheet';
import { Layers, TreePine, Map as MapIcon } from 'lucide-react';
import { usePosts } from '@/hooks/use-posts';
import { useProfile } from '@/hooks/use-profile';

const layerOptions: { value: MapLayer; icon: React.ReactNode; label: string }[] = [
  { value: 'streets', icon: <MapIcon size={13} />, label: 'Streets' },
  { value: 'both', icon: <Layers size={13} />, label: 'Both' },
  { value: 'trees', icon: <TreePine size={13} />, label: 'Welikia' },
];

export default function MapCanvas() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const { profile } = useProfile();
  const { posts: dbPosts, addPost } = usePosts(profile?.id);
  const allPins = [...samplePins, ...dbPosts];

  const [activeFilter, setActiveFilter] = useState<PinCategory | null>(null);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [chatPin, setChatPin] = useState<Pin | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [mapLayer, setMapLayer] = useState<MapLayer>('both');
  const [neighborhood, setNeighborhood] = useState<Neighborhood>(getNeighborhoodAtCoords(40.728, -73.996));
  const [showNeighborhoodInfo, setShowNeighborhoodInfo] = useState(false);

  const filteredPins = activeFilter ? allPins.filter((p) => p.category === activeFilter) : allPins;

  const handleMapMove = useCallback((lat: number, lng: number) => {
    setNeighborhood(getNeighborhoodAtCoords(lat, lng));
  }, []);

  const handleAddPin = (data: Omit<Pin, 'id' | 'x' | 'y'> & { lat?: number; lng?: number }) => {
    let x = 30 + Math.random() * 40;
    let y = 30 + Math.random() * 40;
    if (data.lat != null && data.lng != null) {
      const coords = latLngToXY(data.lat, data.lng);
      x = coords.x;
      y = coords.y;
    }
    addPost.mutate({ ...data, x, y, profileId: profile?.id });
  };

  const handleTagClick = (subcategory: string) => { setSelectedPin(null); setActiveSubcategory(subcategory); };
  const handleLandmarkPinSelect = (pin: Pin) => { setSelectedLandmark(null); setSelectedPin(pin); };
  const handleSubcategoryPinSelect = (pin: Pin) => { setActiveSubcategory(null); setSelectedPin(pin); };
  const handleSearchSelect = (pin: Pin) => { setSelectedPin(pin); setSelectedLandmark(null); setActiveSubcategory(null); };

  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
      <EcoStatusBar initialSearch={initialSearch} onPinSelect={handleSearchSelect} />

      {/* Neighborhood label — clickable for info */}
      <motion.button
        className="fixed top-12 left-1/2 -translate-x-1/2 z-30"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        key={neighborhood.id}
        onClick={() => setShowNeighborhoodInfo(true)}
      >
        <div className="earth-panel rounded-full px-4 py-1.5 flex items-center gap-2 hover:bg-muted/20 transition-colors active:scale-95">
          <span className="font-display text-xs font-semibold text-primary">{neighborhood.indigenousName}</span>
          <span className="text-muted-foreground text-[10px]">·</span>
          <span className="font-display text-[10px] text-muted-foreground">{neighborhood.modernName}</span>
        </div>
      </motion.button>

      {/* Layer toggle */}
      <motion.div
        className="fixed top-12 right-3 z-40 earth-panel rounded-xl flex items-center overflow-hidden"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        {layerOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setMapLayer(opt.value)}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-display font-semibold transition-colors ${
              mapLayer === opt.value
                ? 'bg-primary/20 text-primary'
                : 'text-foreground/60 hover:text-foreground hover:bg-muted/20'
            }`}
            title={opt.label}
          >
            {opt.icon}
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        ))}
      </motion.div>

      <StreetMapView
        pins={filteredPins}
        landmarks={landmarks}
        onPinClick={(pin) => { setSelectedPin(pin); setSelectedLandmark(null); setActiveSubcategory(null); }}
        onLandmarkClick={(lm) => { setSelectedLandmark(lm); setSelectedPin(null); setActiveSubcategory(null); }}
        layer={mapLayer}
        onMapMove={handleMapMove}
      />

      <FloatingDock activeFilter={activeFilter} onFilter={setActiveFilter} onAdd={() => setShowAdd(true)} />

      <DetailSheet pin={selectedPin} onClose={() => setSelectedPin(null)} onChat={(pin) => { setSelectedPin(null); setChatPin(pin); }} onTagClick={handleTagClick} />
      <LandmarkSheet landmark={selectedLandmark} onClose={() => setSelectedLandmark(null)} onPinSelect={handleLandmarkPinSelect} />
      <SubcategorySheet subcategory={activeSubcategory} onClose={() => setActiveSubcategory(null)} onPinSelect={handleSubcategoryPinSelect} />
      <AddPinModal open={showAdd} onClose={() => setShowAdd(false)} onSubmit={handleAddPin} />
      <ChatPanel pin={chatPin} onClose={() => setChatPin(null)} />
      <NeighborhoodInfoSheet neighborhood={showNeighborhoodInfo ? neighborhood : null} onClose={() => setShowNeighborhoodInfo(false)} />
    </div>
  );
}
