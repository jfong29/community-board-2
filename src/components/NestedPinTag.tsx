import offerIcon from '@/assets/offer-no-outline.svg';
import requestIcon from '@/assets/request-no-outline.svg';
import observationIcon from '@/assets/signal-no-outline.svg';
import gatheringIcon from '@/assets/gathering.svg';
import arrowRight from '@/assets/arrow-right.svg';

export type TagCategory = 'offer' | 'request' | 'observation' | 'event' | 'climate';

interface TagConfig {
  bg: string;
  text: string;
  icon: string;
}

const tagConfigs: Record<TagCategory, TagConfig> = {
  offer: {
    bg: 'linear-gradient(180deg, rgba(121,232,36,0.85) 0%, rgba(90,180,25,0.85) 100%)',
    text: '#322924',
    icon: offerIcon,
  },
  request: {
    bg: 'linear-gradient(180deg, rgba(255,72,181,0.85) 0%, rgba(200,55,140,0.85) 100%)',
    text: '#322924',
    icon: requestIcon,
  },
  observation: {
    bg: 'linear-gradient(0deg, rgba(0,0,0,0.10) 0%, rgba(102,102,102,0.10) 100%), linear-gradient(180deg, rgba(255,108,47,0.90) 0%, rgba(196,83,36,0.90) 100%)',
    text: '#322924',
    icon: observationIcon,
  },
  event: {
    bg: 'linear-gradient(180deg, rgba(176,54,255,0.85) 0%, rgba(140,40,210,0.85) 100%)',
    text: '#322924',
    icon: gatheringIcon,
  },
  climate: {
    bg: 'linear-gradient(180deg, rgba(218,225,107,0.80) 0%, rgba(234,176,82,0.80) 88%, rgba(127,130,68,0.80) 100%)',
    text: '#322924',
    icon: observationIcon,
  },
};

export interface NestedTag {
  category: TagCategory;
  label: string;
  children?: NestedTag[];
  onClick?: () => void;
  linkArrow?: boolean;
}

interface NestedPinTagProps {
  tag: NestedTag;
  compact?: boolean;
}

function TagNode({ tag, compact }: NestedPinTagProps) {
  const config = tagConfigs[tag.category] || tagConfigs.observation;
  const isParent = tag.children && tag.children.length > 0;

  return (
    <div
      style={{
        padding: isParent
          ? compact ? '5px 8px' : '7px 10px'
          : compact ? '4px 8px' : '5px 10px',
        background: config.bg,
        backgroundBlendMode: tag.category === 'observation' ? 'darken, normal' : undefined,
        borderRadius: isParent ? '15px' : '30px',
        boxShadow: isParent
          ? '1px 1px 2px rgba(224,227,169,0.30) inset'
          : '0px 1px 4px rgba(0,0,0,0.25)',
        display: 'inline-flex',
        flexDirection: 'column',
        gap: compact ? '4px' : '5px',
        cursor: tag.onClick ? 'pointer' : undefined,
      }}
      onClick={tag.onClick}
    >
      {/* Label row */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
        <img
          src={config.icon}
          alt=""
          style={{
            width: compact ? '8px' : '10px',
            height: compact ? '8px' : '10px',
            filter: 'brightness(0) saturate(100%) invert(13%) sepia(10%) saturate(800%) hue-rotate(340deg)',
          }}
        />
        <span
          style={{
            color: config.text,
            fontSize: compact ? '10px' : '12px',
            fontFamily: "'Public Sans', sans-serif",
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          {tag.label}
        </span>
        {tag.linkArrow && (
          <img
            src={arrowRight}
            alt=""
            style={{
              width: '5px',
              height: '7px',
              filter: 'brightness(0) saturate(100%) invert(13%) sepia(10%) saturate(800%) hue-rotate(340deg)',
            }}
          />
        )}
      </div>

      {/* Children */}
      {tag.children && tag.children.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {tag.children.map((child, i) => (
            <TagNode key={i} tag={child} compact={compact} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function NestedPinTag({ tag, compact = false }: NestedPinTagProps) {
  return <TagNode tag={tag} compact={compact} />;
}

/**
 * Convenience: render a flat list of connected pin tags
 * e.g. a request with multiple offer replies
 */
export function ConnectedPinTags({
  parentCategory,
  parentLabel,
  children,
  compact = false,
}: {
  parentCategory: TagCategory;
  parentLabel: string;
  children: { category: TagCategory; label: string; onClick?: () => void }[];
  compact?: boolean;
}) {
  const tag: NestedTag = {
    category: parentCategory,
    label: parentLabel,
    children: children.map(c => ({
      category: c.category,
      label: c.label,
      onClick: c.onClick,
      linkArrow: !!c.onClick,
    })),
  };
  return <NestedPinTag tag={tag} compact={compact} />;
}
