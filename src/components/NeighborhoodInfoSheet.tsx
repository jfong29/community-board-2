import { Neighborhood } from '@/data/neighborhoods';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';

interface NeighborhoodInfoSheetProps {
  neighborhood: Neighborhood | null;
  onClose: () => void;
}

export default function NeighborhoodInfoSheet({ neighborhood, onClose }: NeighborhoodInfoSheetProps) {
  if (!neighborhood) return null;

  return (
    <Sheet open={!!neighborhood} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="earth-panel border-t border-border/40 rounded-t-2xl max-h-[60vh] overflow-y-auto">
        <SheetHeader className="text-left pb-3">
          <SheetTitle className="font-display text-xl text-foreground flex items-center gap-2">
            <span style={{ color: '#DAE16B' }}>{neighborhood.indigenousName}</span>
            <span className="text-muted-foreground text-sm font-normal">·</span>
            <span className="text-sm text-muted-foreground font-normal">{neighborhood.modernName}</span>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Information about {neighborhood.indigenousName}
          </SheetDescription>
        </SheetHeader>

        <p className="text-sm text-foreground/80 leading-relaxed mb-4">
          {neighborhood.description}
        </p>

        {neighborhood.source && (
          <p className="text-xs text-muted-foreground italic">
            Source: {neighborhood.source}
          </p>
        )}
      </SheetContent>
    </Sheet>
  );
}
