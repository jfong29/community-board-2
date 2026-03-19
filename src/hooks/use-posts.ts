import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Pin, PinCategory } from '@/data/pins';

export function usePosts() {
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((p) => ({
        id: p.id,
        category: p.category as PinCategory,
        title: p.title,
        description: p.description ?? '',
        subcategory: p.subcategory ?? 'General',
        distance: 'Nearby',
        postedBy: 'Community',
        x: p.x,
        y: p.y,
      })) as Pin[];
    },
  });

  const addPost = useMutation({
    mutationFn: async (pin: Omit<Pin, 'id' | 'x' | 'y'> & { x?: number; y?: number }) => {
      const { error } = await supabase.from('posts').insert({
        category: pin.category,
        title: pin.title,
        description: pin.description,
        subcategory: pin.subcategory,
        x: pin.x ?? 30 + Math.random() * 40,
        y: pin.y ?? 30 + Math.random() * 40,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  });

  return { posts, isLoading, addPost };
}
