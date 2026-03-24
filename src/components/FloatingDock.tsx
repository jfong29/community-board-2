import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import dataIcon from '@/assets/data.svg';
import chatsIcon from '@/assets/chats.svg';
import addPostIcon from '@/assets/add-post.svg';

interface FloatingDockProps {
  onAdd: () => void;
  onChat?: () => void;
}

export default function FloatingDock({ onAdd, onChat }: FloatingDockProps) {
  const navigate = useNavigate();

  const items = [
    { icon: dataIcon, alt: 'Stats', onClick: () => navigate('/observations'), size: 'h-7' },
    { icon: chatsIcon, alt: 'Chats', onClick: onChat || (() => {}), size: 'h-7' },
    { icon: addPostIcon, alt: 'Add Post', onClick: onAdd, size: 'h-9' },
  ];

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-40"
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.3 }}
    >
      <div
        className="w-full flex items-center justify-evenly py-4"
        style={{ background: 'hsla(15, 16%, 12%, 0.92)', paddingLeft: 30, paddingRight: 30 }}
      >
        {items.map((item) => (
          <button
            key={item.alt}
            onClick={item.onClick}
            className="flex items-center justify-center p-2 hover:opacity-80 active:scale-95 transition-all"
            title={item.alt}
          >
            <img src={item.icon} alt={item.alt} className={`${item.size} w-auto`} />
          </button>
        ))}
      </div>
    </motion.div>
  );
}
