import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface HelpPanelProps {
  open: boolean;
  onClose: () => void;
}

const PROJECT_DESCRIPTION = `Who and what rules our world in 2026? As capitalist greed drives our society, our sense of connection often feels replaced by a gradual stripping away of our collective power. Instead of surrendering to this multi-crisis, we must incentivize critique and reclaim our right to local knowledge and networking.

(Y)our Agency invites you to imagine: what does a world look like that strives to meet our needs? Prompted to survive an extreme winter storm, you navigate two competing systems:

The Board of Government acts as a mirror, utilizing invasive advertisements to enforce distance and limit our choices to what is most profitable. It reveals the patterns that keep us as bystanders rather than active citizens as meeting our needs becomes commodified.

You are currently in Community Boards which offers a pathway to cooperate for the common good. Through mutual aid, you rejoin a lively network of requests, offers, and observations from your neighbors. By following trails of local knowledge and viewing real-time data, you ensure that the needs of all species are met.

We do not have to accept the fate of extraction and competition. By living by the virtues of ecosocialism, we build a network that is fundamentally connected and works for us all.

The agency is all yours. What will you do with it?`;

export default function HelpPanel({ open, onClose }: HelpPanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-background/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed z-[61] w-[min(92vw,400px)]"
            style={{ top: '48px', right: 'var(--grid-gap)' }}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <div className="earth-panel rounded-2xl p-5 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-base font-bold text-foreground">
                  About (Y)our Agency
                </h3>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-md hover:bg-muted/30 transition-colors"
                >
                  <X size={18} className="text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-3">
                {PROJECT_DESCRIPTION.split('\n\n').map((paragraph, i) => (
                  <p
                    key={i}
                    className="text-[12px] text-foreground/85 leading-relaxed font-body"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
