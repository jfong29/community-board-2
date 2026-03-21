import { useState, useEffect } from 'react';
import { Pin, categoryConfig } from '@/data/pins';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send } from 'lucide-react';
import PinIcon from './PinIcon';

interface ChatPanelProps {
  pin: Pin | null;
  onClose: () => void;
  onBackToPin?: (pin: Pin) => void;
}

interface Message {
  id: number;
  text: string;
  sender: 'you' | 'them';
}

// Generate contextual opening messages based on the pin
function getContextualMessages(pin: Pin): Message[] {
  const cat = pin.category;
  const title = pin.title;
  const poster = pin.postedBy;

  if (cat === 'offer') {
    return [
      { id: 1, text: `Hi! I saw your listing for "${title}" — is this still available?`, sender: 'you' },
      { id: 2, text: `Yes, it is! When works for you to pick it up?`, sender: 'them' },
    ];
  }
  if (cat === 'request') {
    return [
      { id: 1, text: `Hey ${poster}, I can help with "${title}". What do you need exactly?`, sender: 'you' },
      { id: 2, text: `Thank you so much! Can you come by this weekend? I'll send the details.`, sender: 'them' },
    ];
  }
  if (cat === 'observation') {
    return [
      { id: 1, text: `I saw your signal about "${title}" — I noticed the same thing near me.`, sender: 'you' },
      { id: 2, text: `Good to know it's not just here. Should we log it with the community group?`, sender: 'them' },
    ];
  }
  // event / gathering
  return [
    { id: 1, text: `Hi! I'd love to join "${title}". Is there still room?`, sender: 'you' },
    { id: 2, text: `Absolutely! Everyone is welcome. See you there 🌿`, sender: 'them' },
  ];
}

export default function ChatPanel({ pin, onClose, onBackToPin }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  // Reset messages when pin changes
  useEffect(() => {
    if (pin) {
      setMessages(getContextualMessages(pin));
    }
  }, [pin?.id]);

  const send = () => {
    if (!input.trim()) return;
    setMessages((m) => [...m, { id: Date.now(), text: input, sender: 'you' }]);
    setInput('');
  };

  const handleClose = () => {
    if (pin && onBackToPin) {
      onBackToPin(pin);
    } else {
      onClose();
    }
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
            {/* Header with pin title */}
            <div className="flex items-center gap-3 p-4 border-b border-border/30">
              <button onClick={handleClose} className="p-1 text-foreground hover:bg-muted/30 rounded-full">
                <ArrowLeft size={20} />
              </button>
              <PinIcon category={pin.category} size={20} animate={false} />
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-sm text-foreground truncate">{pin.title}</p>
                <p className="text-xs text-muted-foreground truncate">with {pin.postedBy}</p>
              </div>
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
