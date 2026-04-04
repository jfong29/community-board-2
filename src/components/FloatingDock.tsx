import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import chatsIcon from '@/assets/chats.svg';
import addPostIcon from '@/assets/add-post.svg';
import mapIcon from '@/assets/map-2-2.svg';
import dataIcon from '@/assets/data-2.svg';

interface FloatingDockProps {
  onAdd: () => void;
  onChat?: () => void;
  activeTab?: 'map' | 'data' | 'chat' | 'add';
}

export default function FloatingDock({ onAdd, onChat, activeTab }: FloatingDockProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const resolvedActive = activeTab || (location.pathname === '/observations' ? 'data' : 'map');

  const items = [
    { id: 'map' as const, icon: mapIcon, alt: 'Map', onClick: () => navigate('/'), size: 'h-6' },
    { id: 'data' as const, icon: dataIcon, alt: 'Data', onClick: () => navigate('/observations'), size: 'h-7' },
    { id: 'chat' as const, icon: chatsIcon, alt: 'Chats', onClick: onChat || (() => {}), size: 'h-6' },
    { id: 'add' as const, icon: addPostIcon, alt: 'Add Post', onClick: onAdd, size: 'h-8' },
  ];

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-40"
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.3 }}
    >
      <div
        className="w-full flex items-center justify-evenly py-4 px-8"
        style={{ background: 'linear-gradient(180deg, #221B17 0%, #332822 100%)' }}
      >
        {items.map((item) => {
          const isActive = resolvedActive === item.id;
          return (
            <button
              key={item.alt}
              onClick={item.onClick}
              className="flex items-center justify-center p-2 transition-all active:scale-90"
              title={item.alt}
            >
              <img
                src={item.icon}
                alt={item.alt}
                className={`${item.size} w-auto transition-all`}
                style={{
                  filter: isActive
                    ? 'brightness(0) saturate(100%) invert(85%) sepia(40%) saturate(500%) hue-rotate(20deg) brightness(110%)'
                    : 'brightness(0.6) saturate(0%) invert(70%)',
                }}
              />
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
