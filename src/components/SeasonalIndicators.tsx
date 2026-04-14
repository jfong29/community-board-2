import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface SeasonalIndicatorsProps {
  open: boolean;
  onClose: () => void;
}

const seasonalData = [
{ plant: 'Wild Strawberry', icon: '🍓', status: 'Blooming', action: 'Time to harvest', color: 'text-request' },
{ plant: 'White Oak', icon: '🌳', status: 'Leafing', action: 'Acorn harvest in 4 moons', color: 'text-observation' },
{ plant: 'Sweetgrass', icon: '🌾', status: 'Growing', action: 'Ready to braid soon', color: 'text-primary' },
{ plant: 'Elderberry', icon: '🫐', status: 'Flowering', action: 'Berries in 2 moons', color: 'text-accent' },
{ plant: 'Three Sisters', icon: '🌽', status: 'Planting time', action: 'Sow after last frost', color: 'text-offer' }];


export default function SeasonalIndicators({ open, onClose }: SeasonalIndicatorsProps) {
  return (
    <AnimatePresence>
      {open &&
      <>
          <motion.div
          className="fixed inset-0 z-[60] bg-background/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose} />
        
          <motion.div
          className="fixed top-10 left-1/2 -translate-x-1/2 z-[61] w-full max-w-sm px-4"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}>
          
            <div className="earth-panel rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-sm font-bold text-foreground">Siquon — Spring</h3>
                  <p className="text-[10px] text-muted-foreground">Based on the Lenape seasonal calendar</p>
                </div>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-muted/30 transition-colors">
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-2">
                {seasonalData.map((item, i) =>
              <motion.div
                key={item.plant}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/20"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}>
                
                    <span className="text-lg">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-xs font-semibold text-foreground">{item.plant}</p>
                      <p className={`text-[10px] font-display font-medium ${item.color}`}>{item.status}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground text-right">{item.action}</span>
                  </motion.div>
              )}
              </div>
            </div>
          </motion.div>
        </>
      }
    </AnimatePresence>);

}