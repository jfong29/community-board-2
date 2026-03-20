import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Pin, PinCategory, samplePins, latLngToXY } from '@/data/pins';
import { landmarks, Landmark } from '@/data/landmarks';
import { getNeighborhoodAtCoords, Neighborhood } from '@/data/neighborhoods';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [neighborhood, setNeighborhood] = useState<Neighborhood>(getNeighborhoodAtCoords(40.7359, -73.9911));
  const [showNeighborhoodInfo, setShowNeighborhoodInfo] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(14);

  const filteredPins = activeFilter ? allPins.filter((p) => p.category === activeFilter) : allPins;

  // Neighborhood label at tier 2+ (zoom >= 15)
  const showNeighborhoodLabel = currentZoom >= 15;

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

      {/* Neighborhood label — visible at tier 2+ (zoom >= 15), centered below top bar */}
      <AnimatePresence>
        {showNeighborhoodLabel && (
          <motion.div
            className="fixed left-1/2 -translate-x-1/2 z-30"
            style={{ top: 'calc(var(--grid-gap) * 2 + 40px)' }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            key={neighborhood.id}
          >
            <button
              onClick={() => setShowNeighborhoodInfo(!showNeighborhoodInfo)}
              className="earth-panel rounded-full px-4 py-1.5 flex items-center gap-2 hover:bg-muted/20 transition-colors active:scale-95"
            >
              <span className="font-display text-sm font-semibold text-lime">{neighborhood.indigenousName}</span>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="font-display text-xs text-muted-foreground">{neighborhood.modernName}</span>
            </button>

            {/* Popup anchored below the label */}
            <AnimatePresence>
              {showNeighborhoodInfo && (
                <motion.div
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[min(90vw,360px)] earth-panel rounded-xl border border-border/40 shadow-xl overflow-hidden"
                  style={{ padding: 'var(--grid-gap)' }}
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-accent">{neighborhood.indigenousName}</h3>
                      <p className="font-display text-sm text-muted-foreground">{neighborhood.modernName}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowNeighborhoodInfo(false); }}
                      className="text-muted-foreground hover:text-foreground text-lg leading-none mt-0.5"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed mb-2">{neighborhood.description}</p>
                  {neighborhood.source && (
                    <p className="text-xs text-muted-foreground italic">Source: {neighborhood.source}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layer toggle — aligned right with consistent grid padding */}
      <motion.div
        className="fixed z-40 earth-panel rounded-xl flex items-center overflow-hidden"
        style={{ top: 'calc(var(--grid-gap) * 2 + 40px)', right: 'var(--grid-gap)' }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        {layerOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setMapLayer(opt.value)}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-display font-semibold transition-colors ${
              mapLayer === opt.value
                ? 'text-foreground'
                : 'text-foreground/60 hover:text-foreground hover:bg-muted/20'
            }`}
            style={mapLayer === opt.value ? { backgroundColor: 'rgba(218,225,107,0.2)', color: '#DAE16B' } : undefined}
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
        onMapMove={(lat, lng) => {
          handleMapMove(lat, lng);
        }}
        onZoomChange={setCurrentZoom}
      />

      <FloatingDock activeFilter={activeFilter} onFilter={setActiveFilter} onAdd={() => setShowAdd(true)} />

      <DetailSheet pin={selectedPin} onClose={() => setSelectedPin(null)} onChat={(pin) => { setSelectedPin(null); setChatPin(pin); }} onTagClick={handleTagClick} />
      <LandmarkSheet landmark={selectedLandmark} onClose={() => setSelectedLandmark(null)} onPinSelect={handleLandmarkPinSelect} />
      <SubcategorySheet subcategory={activeSubcategory} onClose={() => setActiveSubcategory(null)} onPinSelect={handleSubcategoryPinSelect} />
      <AddPinModal open={showAdd} onClose={() => setShowAdd(false)} onSubmit={handleAddPin} />
      <ChatPanel pin={chatPin} onClose={() => setChatPin(null)} />
    </div>
  );
}
