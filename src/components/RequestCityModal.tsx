import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RequestCityModalProps {
  open: boolean;
  onClose: () => void;
}

export default function RequestCityModal({ open, onClose }: RequestCityModalProps) {
  const [city, setCity] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!city.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('proposals').insert({
        title: `City Request: ${city.trim()}`,
        description: `A user requested expanding the community board to ${city.trim()}.`,
      });
      if (error) throw error;
      toast.success('City request submitted!');
      setCity('');
      onClose();
    } catch {
      toast.error('Could not submit request. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="earth-panel border-border/40 max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-foreground">Request Your City</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            This community board is currently limited to this area. Tell us where you'd like to see it next.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-2">
          <Input
            placeholder="e.g. Los Angeles, Chicago, London…"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="bg-muted/30 border-border/40"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <Button
            onClick={handleSubmit}
            disabled={!city.trim() || submitting}
            className="bg-primary text-primary-foreground hover:bg-primary/80"
          >
            {submitting ? 'Submitting…' : 'Submit Request'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
