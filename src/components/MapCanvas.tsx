import { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Pin, PinCategory, samplePins } from '@/data/pins';
import { landmarks, Landmark } from '@/data/landmarks';
import { motion } from 'framer-motion';
import welikiaMap from '@/assets/welikia-map.jpg';
import PinIcon from './PinIcon';
import LandmarkPin from './LandmarkPin';
import FloatingDock from './FloatingDock';
import DetailSheet from './DetailSheet';
import LandmarkSheet from './LandmarkSheet';
import SubcategorySheet from './SubcategorySheet';
import AddPinModal from './AddPinModal';
import ChatPanel from './ChatPanel';
import EcoStatusBar from './EcoStatusBar';
import StreetMapView from './StreetMapView';
import { Layers } from 'lucide-react';

// Indigenous neighborhood names mapped to map quadrants
const neighborhoods: {name: string;x: [number, number];y: [number, number];}[] = [
{ name: 'Shorakapkok', x: [0, 33], y: [0, 33] }, // Northern tip - Inwood
{ name: 'Konaande Kongh', x: [33, 66], y: [0, 33] }, // Upper area - Harlem area
{ name: 'Muscoota', x: [66, 100], y: [0, 33] }, // Upper east
{ name: 'Sapokanikan', x: [0, 33], y: [33, 66] }, // West village area
{ name: 'Werpoes', x: [33, 66], y: [33, 66] }, // Central - Collect Pond area
{ name: 'Nechtanc', x: [66, 100], y: [33, 66] }, // East
{ name: 'Kapsee', x: [0, 33], y: [66, 100] }, // Southern tip
{ name: 'Manahatta', x: [33, 66], y: [66, 100] }, // Lower Manhattan
{ name: 'Pagganck', x: [66, 100], y: [66, 100] } // Governors Island area
];

function getNeighborhood(cx: number, cy: number): string {
  // cx, cy are the center of visible area in % of map
  for (const n of neighborhoods) {
    if (cx >= n.x[0] && cx <= n.x[1] && cy >= n.y[0] && cy <= n.y[1]) {
      return n.name;
    }
  }
  return 'Manahatta';
}

export default function MapCanvas() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [pins, setPins] = useState<Pin[]>(samplePins);
  const [activeFilter, setActiveFilter] = useState<PinCategory | null>(null);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [chatPin, setChatPin] = useState<Pin | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [mapTransform, setMapTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [showStreetMap, setShowStreetMap] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ startX: 0, startY: 0, isDragging: false });

  const filteredPins = activeFilter ? pins.filter((p) => p.category === activeFilter) : pins;

  // Compute visible neighborhood from map pan
  const viewCenterX = 50 - mapTransform.x / (window.innerWidth || 1) * 50;
  const viewCenterY = 50 - mapTransform.y / (window.innerHeight || 1) * 50;
  const neighborhood = getNeighborhood(
    Math.max(0, Math.min(100, viewCenterX)),
    Math.max(0, Math.min(100, viewCenterY))
  );

  const handleAddPin = (data: Omit<Pin, 'id' | 'x' | 'y'>) => {
    const newPin: Pin = { ...data, id: Date.now().toString(), x: 30 + Math.random() * 40, y: 30 + Math.random() * 40 };
    setPins((p) => [...p, newPin]);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setMapTransform((t) => ({ ...t, scale: Math.min(3, Math.max(0.5, t.scale + delta)) }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    dragRef.current = { startX: e.clientX - mapTransform.x, startY: e.clientY - mapTransform.y, isDragging: true };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current.isDragging) return;
    setMapTransform((t) => ({ ...t, x: e.clientX - dragRef.current.startX, y: e.clientY - dragRef.current.startY }));
  };

  const handleMouseUp = () => {dragRef.current.isDragging = false;};

  const handleTagClick = (subcategory: string) => {setSelectedPin(null);setActiveSubcategory(subcategory);};
  const handleLandmarkPinSelect = (pin: Pin) => {setSelectedLandmark(null);setSelectedPin(pin);};
  const handleSubcategoryPinSelect = (pin: Pin) => {setActiveSubcategory(null);setSelectedPin(pin);};

  const handleSearchSelect = (pin: Pin) => {
    setSelectedPin(pin);
    setSelectedLandmark(null);
    setActiveSubcategory(null);
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
      <EcoStatusBar initialSearch={initialSearch} onPinSelect={handleSearchSelect} />

      {/* Neighborhood header */}
      <motion.div
        className="fixed top-10 left-1/2 -translate-x-1/2 z-30"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        key={neighborhood}>
        
        <div className="earth-panel rounded-full px-4 py-1">
          <span className="font-display text-xs font-semibold text-foreground">{neighborhood}</span>
        </div>
      </motion.div>

      {/* Map toggle */}
      <motion.button
        className="fixed top-10 right-3 z-40 earth-panel rounded-xl p-2 flex items-center gap-1.5 text-xs font-display font-semibold text-foreground hover:bg-muted/30 transition-colors"
        onClick={() => setShowStreetMap(!showStreetMap)}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        title={showStreetMap ? 'Welikia view' : 'Street view'}>
        
        <Layers size={14} />
        <span className="hidden md:inline">{showStreetMap ? 'Welikia' : 'Streets'}</span>
      </motion.button>

      {showStreetMap ?
      <StreetMapView
        pins={filteredPins}
        landmarks={landmarks}
        onPinClick={setSelectedPin}
        onLandmarkClick={setSelectedLandmark} /> :


      <div
        ref={mapRef}
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}>
        
          <div
          className="relative w-full h-full"
          style={{
            transform: `translate(${mapTransform.x}px, ${mapTransform.y}px) scale(${mapTransform.scale})`,
            transformOrigin: 'center center',
            transition: dragRef.current.isDragging ? 'none' : 'transform 0.15s ease-out'
          }}>
          
            <img

            alt="Precolonial Manahatta — birds-eye view"
            className="w-full h-full object-cover"
            draggable={false} src="/lovable-uploads/066a23b3-414b-4f51-86cb-c8d74e050a17.jpg" />
          

            {filteredPins.map((pin, i) =>
          <div
            key={pin.id}
            className="absolute"
            style={{ left: `${pin.x}%`, top: `${pin.y}%`, transform: 'translate(-50%, -50%)' }}>
            
                <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.08, type: 'spring', stiffness: 400, damping: 15 }}>
              
                  <PinIcon
                category={pin.category}
                size={pin.category === 'offer' || pin.category === 'request' ? 44 : pin.category === 'event' ? 40 : 32}
                onClick={() => {setSelectedPin(pin);setSelectedLandmark(null);setActiveSubcategory(null);}}
                advertisement={pin.category === 'offer' || pin.category === 'request'} />
              
                </motion.div>
              </div>
          )}

            {landmarks.map((lm, i) =>
          <div
            key={lm.id}
            className="absolute"
            style={{ left: `${lm.x}%`, top: `${lm.y}%`, transform: 'translate(-50%, -50%)' }}>
            
                <LandmarkPin
              landmark={lm}
              onClick={() => {setSelectedLandmark(lm);setSelectedPin(null);setActiveSubcategory(null);}}
              index={i} />
            
              </div>
          )}
          </div>
        </div>
      }

      <FloatingDock activeFilter={activeFilter} onFilter={setActiveFilter} onAdd={() => setShowAdd(true)} />

      <DetailSheet pin={selectedPin} onClose={() => setSelectedPin(null)} onChat={(pin) => {setSelectedPin(null);setChatPin(pin);}} onTagClick={handleTagClick} />
      <LandmarkSheet landmark={selectedLandmark} onClose={() => setSelectedLandmark(null)} onPinSelect={handleLandmarkPinSelect} />
      <SubcategorySheet subcategory={activeSubcategory} onClose={() => setActiveSubcategory(null)} onPinSelect={handleSubcategoryPinSelect} />
      <AddPinModal open={showAdd} onClose={() => setShowAdd(false)} onSubmit={handleAddPin} />
      <ChatPanel pin={chatPin} onClose={() => setChatPin(null)} />
    </div>);

}