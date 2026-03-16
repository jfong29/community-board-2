import { useState, useRef } from 'react';
import { Pin, PinCategory, samplePins } from '@/data/pins';
import { motion } from 'framer-motion';
import welikiaMap from '@/assets/welikia-map.jpg';
import PinIcon from './PinIcon';
import FloatingDock from './FloatingDock';
import DetailSheet from './DetailSheet';
import AddPinModal from './AddPinModal';
import ChatPanel from './ChatPanel';

export default function MapCanvas() {
  const [pins, setPins] = useState<Pin[]>(samplePins);
  const [activeFilter, setActiveFilter] = useState<PinCategory | null>(null);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [chatPin, setChatPin] = useState<Pin | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [mapTransform, setMapTransform] = useState({ scale: 1, x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ startX: 0, startY: 0, isDragging: false });

  const filteredPins = activeFilter ? pins.filter((p) => p.category === activeFilter) : pins;

  const handleAddPin = (data: Omit<Pin, 'id' | 'x' | 'y'>) => {
    const newPin: Pin = {
      ...data,
      id: Date.now().toString(),
      x: 30 + Math.random() * 40,
      y: 30 + Math.random() * 40,
    };
    setPins((p) => [...p, newPin]);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setMapTransform((t) => ({
      ...t,
      scale: Math.min(3, Math.max(0.5, t.scale + delta)),
    }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    dragRef.current = { startX: e.clientX - mapTransform.x, startY: e.clientY - mapTransform.y, isDragging: true };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current.isDragging) return;
    setMapTransform((t) => ({
      ...t,
      x: e.clientX - dragRef.current.startX,
      y: e.clientY - dragRef.current.startY,
    }));
  };

  const handleMouseUp = () => {
    dragRef.current.isDragging = false;
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
      {/* Map */}
      <div
        ref={mapRef}
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="relative w-full h-full"
          style={{
            transform: `translate(${mapTransform.x}px, ${mapTransform.y}px) scale(${mapTransform.scale})`,
            transformOrigin: 'center center',
            transition: dragRef.current.isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
        >
          <img
            src={welikiaMap}
            alt="Precolonial landscape"
            className="w-full h-full object-cover"
            draggable={false}
            style={{ imageRendering: 'auto' }}
          />

          {/* Pins */}
          {filteredPins.map((pin, i) => (
            <div
              key={pin.id}
              className="absolute"
              style={{
                left: `${pin.x}%`,
                top: `${pin.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.08, type: 'spring', stiffness: 400, damping: 15 }}
              >
                <PinIcon
                  category={pin.category}
                  size={36}
                  onClick={() => setSelectedPin(pin)}
                />
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating dock */}
      <FloatingDock
        activeFilter={activeFilter}
        onFilter={setActiveFilter}
        onAdd={() => setShowAdd(true)}
      />

      {/* Detail sheet */}
      <DetailSheet
        pin={selectedPin}
        onClose={() => setSelectedPin(null)}
        onChat={(pin) => {
          setSelectedPin(null);
          setChatPin(pin);
        }}
      />

      {/* Add modal */}
      <AddPinModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={handleAddPin}
      />

      {/* Chat */}
      <ChatPanel pin={chatPin} onClose={() => setChatPin(null)} />
    </div>
  );
}
