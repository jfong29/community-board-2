import { useState } from 'react';
import { Pin, categoryConfig } from '@/data/pins';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send } from 'lucide-react';
import PinIcon from './PinIcon';

interface ChatPanelProps {
  pin: Pin | null;
  onClose: () => void;
}

interface Message {
  id: number;
  text: string;
  sender: 'you' | 'them';
}

export default function ChatPanel({ pin, onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: `Interested in "${pin?.title}"`, sender: 'you' },
    { id: 2, text: 'Yes! The trail is marked with blue stones.', sender: 'them' },
  ]);
  const [input, setInput] = useState('');

  const send = () => {
    if (!input.trim()) return;
    setMessages((m) => [...m, { id: Date.now(), text: input, sender: 'you' }]);
    setInput('');
  };

  return (
    <AnimatePresence>
      {pin && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="earth-panel flex-1 flex flex-col bg-background">
            <div className="flex items-center gap-3 p-4 border-b border-border/30">
              <button onClick={onClose} className="p-1 text-foreground hover:bg-muted/30 rounded-full">
                <ArrowLeft size={20} />
              </button>
              <PinIcon category={pin.category} size={20} animate={false} />
              <p className="font-display font-semibold text-sm text-foreground">{pin.postedBy}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender === 'you' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                      m.sender === 'you'
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-muted/50 text-foreground rounded-bl-sm'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-border/30">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  placeholder="..."
                  className="flex-1 bg-muted/30 border border-border/40 rounded-full px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-body"
                />
                <button
                  onClick={send}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:scale-110 active:scale-95 transition-transform"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
