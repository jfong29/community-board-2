import { PinCategory } from '@/data/pins';
import offerIcon from '@/assets/offer.svg';
import requestIcon from '@/assets/request.svg';
import observationIcon from '@/assets/observation.svg';
import gatheringIcon from '@/assets/gathering.svg';

interface CategoryFiltersProps {
  activeFilters: Set<PinCategory>;
  onToggle: (cat: PinCategory) => void;
}

const categories: { key: PinCategory; label: string; icon: string }[] = [
  { key: 'offer', label: 'Offer', icon: offerIcon },
  { key: 'request', label: 'Request', icon: requestIcon },
  { key: 'observation', label: 'Signal', icon: observationIcon },
  { key: 'event', label: 'Gathering', icon: gatheringIcon },
];

export default function CategoryFilters({ activeFilters, onToggle }: CategoryFiltersProps) {
  const allActive = activeFilters.size === 0; // no filter = show all

  return (
    <div className="flex items-center gap-1">
      {categories.map(({ key, label, icon }) => {
        const isActive = allActive || activeFilters.has(key);
        return (
          <button
            key={key}
            onClick={() => onToggle(key)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-display font-medium transition-all ${
              activeFilters.has(key)
                ? 'bg-muted/40 ring-1 ring-lime/40'
                : 'hover:bg-muted/20'
            }`}
            style={{ opacity: isActive ? 1 : 0.4 }}
            title={label}
          >
            <img src={icon} alt={label} className="w-4 h-3" />
            <span className="hidden sm:inline text-foreground">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
