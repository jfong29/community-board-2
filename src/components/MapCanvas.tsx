import { useState, useCallback, useMemo, useRef } from 'react';
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
import { usePosts } from '@/hooks/use-posts';
import { useProfile } from '@/hooks/use-profile';
import layersIcon from '@/assets/layers.svg';
import humanIcon from '@/assets/human.svg';
import bothIcon from '@/assets/both.svg';
import welikiaLayerIcon from '@/assets/welikia-icon.svg';

const layerOptions: { value: MapLayer; icon: string; label: string }[] = [
  { value: 'streets', icon: humanIcon, label: 'Human' },
  { value: 'both', icon: bothIcon, label: 'Both' },
  { value: 'trees', icon: welikiaLayerIcon, label: 'Nonhuman' },
];

// Pins tagged as nonhuman / nature observations
const NONHUMAN_SUBCATEGORIES = new Set([
  'Pollinators', 'Marine Life', 'Water Quality', 'Wildlife', 'Birding',
  'Fungi', 'Tree Health', 'Spring Sign', 'Ecology', 'Nature',
]);

function isNonhumanPin(pin: Pin): boolean {
  return NONHUMAN_SUBCATEGORIES.has(pin.subcategory) || (pin as any).isNature === true;
}

export default function MapCanvas() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const { profile } = useProfile();
  const { posts: dbPosts, addPost } = usePosts(profile?.id);
  const allPins = [...samplePins, ...dbPosts];

  const [activeFilters, setActiveFilters] = useState<Set<PinCategory>>(new Set());
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [highlightedPinId, setHighlightedPinId] = useState<string | null>(null);
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [chatPin, setChatPin] = useState<Pin | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [mapLayer, setMapLayer] = useState<MapLayer>('both');
  const [neighborhood, setNeighborhood] = useState<Neighborhood>(getNeighborhoodAtCoords(40.7359, -73.9911));
  const [showNeighborhoodInfo, setShowNeighborhoodInfo] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(12);
  const [layerMenuOpen, setLayerMenuOpen] = useState(false);

  // Layer-based pin filtering: streets = human only, trees = nonhuman only, both = all
  const layerFilteredPins = useMemo(() => {
    if (mapLayer === 'streets') return allPins.filter(p => !isNonhumanPin(p));
    if (mapLayer === 'trees') return allPins.filter(p => isNonhumanPin(p));
    return allPins;
  }, [allPins, mapLayer]);

  const filteredPins = activeFilters.size === 0
    ? layerFilteredPins
    : layerFilteredPins.filter((p) => activeFilters.has(p.category));

  const handleToggleFilter = useCallback((cat: PinCategory) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

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

  // When selecting a pin (from calendar, search, or direct click), highlight + pan
  const handlePinSelect = useCallback((pin: Pin) => {
    setSelectedPin(pin);
    setHighlightedPinId(pin.id);
    setSelectedLandmark(null);
    setActiveSubcategory(null);
  }, []);

  // Navigate to next/prev nearest pin
  const getSortedNearbyPins = useCallback(() => {
    if (!selectedPin) return [];
    const pinLat = selectedPin.lat ?? 0;
    const pinLng = selectedPin.lng ?? 0;
    return [...filteredPins]
      .filter(p => p.id !== selectedPin.id)
      .sort((a, b) => {
        const distA = Math.hypot((a.lat ?? 0) - pinLat, (a.lng ?? 0) - pinLng);
        const distB = Math.hypot((b.lat ?? 0) - pinLat, (b.lng ?? 0) - pinLng);
        return distA - distB;
      });
  }, [selectedPin, filteredPins]);

  const currentPinIndex = useMemo(() => {
    return filteredPins.findIndex(p => p.id === selectedPin?.id);
  }, [filteredPins, selectedPin]);

  const handleNextPin = useCallback(() => {
    const nearby = getSortedNearbyPins();
    if (nearby.length > 0) {
      // Find the next pin in the sorted-by-distance list
      const currentIdx = nearby.findIndex(p => p.id === selectedPin?.id);
      const next = nearby[(currentIdx + 1) % nearby.length] || nearby[0];
      handlePinSelect(next);
    }
  }, [getSortedNearbyPins, selectedPin, handlePinSelect]);

  const handlePrevPin = useCallback(() => {
    const nearby = getSortedNearbyPins();
    if (nearby.length > 0) {
      const currentIdx = nearby.findIndex(p => p.id === selectedPin?.id);
      const prev = nearby[currentIdx - 1] || nearby[nearby.length - 1];
      handlePinSelect(prev);
    }
  }, [getSortedNearbyPins, selectedPin, handlePinSelect]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
      <EcoStatusBar
        initialSearch={initialSearch}
        onPinSelect={handlePinSelect}
        activeFilters={activeFilters}
        onToggleFilter={handleToggleFilter}
      />

      {/* Neighborhood label */}
      <AnimatePresence>
        {showNeighborhoodLabel && (
          <motion.div
            className="fixed z-30 w-full flex justify-center pointer-events-none"
            style={{ top: 'calc(var(--grid-gap) * 2 + 64px)', left: 0, right: 0 }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            key={neighborhood.id}
          >
            <button
              onClick={() => setShowNeighborhoodInfo(!showNeighborhoodInfo)}
              className="earth-panel rounded-full px-4 py-1.5 flex items-center gap-2 hover:bg-muted/20 transition-colors active:scale-95 max-w-[80vw] pointer-events-auto"
            >
              <span className="font-display text-sm font-semibold text-lime">{neighborhood.indigenousName}</span>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="font-display text-xs text-muted-foreground">{neighborhood.modernName}</span>
            </button>

            <AnimatePresence>
              {showNeighborhoodInfo && (
                <motion.div
                  className="absolute top-full mt-2 w-[min(85vw,360px)] earth-panel rounded-xl border border-border/40 shadow-xl overflow-hidden left-1/2 -translate-x-1/2"
                  style={{ padding: 'var(--grid-gap)', maxWidth: 'calc(100vw - 32px)' }}
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-lime">{neighborhood.indigenousName}</h3>
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

      {/* Layer toggle */}
      <motion.div
        className="fixed z-40 flex items-center"
        style={{ top: 'calc(var(--grid-gap) * 2 + 64px)', right: 'var(--grid-gap)' }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <AnimatePresence>
          {layerMenuOpen && (
            <motion.div
              className="flex items-center gap-1.5 mr-1.5"
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              transition={{ duration: 0.15 }}
            >
              {layerOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setMapLayer(opt.value); setLayerMenuOpen(false); }}
                  className={`w-9 h-9 rounded-lg earth-panel flex items-center justify-center transition-all active:scale-95 ${
                    mapLayer === opt.value ? 'ring-1 ring-lime/50' : 'hover:bg-muted/20'
                  }`}
                  title={opt.label}
                >
                  <img
                    src={opt.icon}
                    alt={opt.label}
                    className="w-5 h-5 object-contain"
                    style={mapLayer === opt.value ? { filter: 'brightness(1.3)' } : { opacity: 0.6 }}
                  />
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setLayerMenuOpen(!layerMenuOpen)}
          className="w-9 h-9 rounded-lg earth-panel flex items-center justify-center transition-colors active:scale-95 hover:bg-muted/20"
          title="Map layers"
        >
          <img src={layersIcon} alt="Layers" className="w-5 h-4" />
        </button>
      </motion.div>

      <StreetMapView
        pins={filteredPins}
        landmarks={landmarks}
        onPinClick={handlePinSelect}
        onLandmarkClick={(lm) => { setSelectedLandmark(lm); setSelectedPin(null); setHighlightedPinId(null); setActiveSubcategory(null); }}
        layer={mapLayer}
        onMapMove={handleMapMove}
        onZoomChange={setCurrentZoom}
        highlightedPinId={highlightedPinId}
      />

      <FloatingDock onAdd={() => setShowAdd(true)} />

      <DetailSheet pin={selectedPin} onClose={() => { setSelectedPin(null); setHighlightedPinId(null); }} onChat={(pin) => { setSelectedPin(null); setChatPin(pin); }} onTagClick={handleTagClick} />
      <LandmarkSheet landmark={selectedLandmark} onClose={() => setSelectedLandmark(null)} onPinSelect={handleLandmarkPinSelect} />
      <SubcategorySheet subcategory={activeSubcategory} onClose={() => setActiveSubcategory(null)} onPinSelect={handleSubcategoryPinSelect} />
      <AddPinModal open={showAdd} onClose={() => setShowAdd(false)} onSubmit={handleAddPin} />
      <ChatPanel pin={chatPin} onClose={() => setChatPin(null)} onBackToPin={(pin) => { setChatPin(null); handlePinSelect(pin); }} />
    </div>
  );
}
