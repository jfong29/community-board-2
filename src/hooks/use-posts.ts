import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Pin, PinCategory, latLngToXY } from '@/data/pins';

export function usePosts(profileId?: string) {
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
        postedBy: p.profile_id ? 'You' : 'Community',
        x: p.x,
        y: p.y,
        lat: p.lat ?? undefined,
        lng: p.lng ?? undefined,
        profileId: p.profile_id,
        createdAt: p.created_at,
      })) as (Pin & { profileId?: string; createdAt?: string })[];
    },
  });

  // Filter posts by profile
  const userPosts = profileId ? posts.filter(p => p.profileId === profileId) : [];

  const addPost = useMutation({
    mutationFn: async (pin: Omit<Pin, 'id'> & { lat?: number; lng?: number; profileId?: string }) => {
      // If lat/lng provided, compute x/y from them
      let x = pin.x;
      let y = pin.y;
      if (pin.lat != null && pin.lng != null) {
        const coords = latLngToXY(pin.lat, pin.lng);
        x = coords.x;
        y = coords.y;
      }
      const { error } = await supabase.from('posts').insert({
        category: pin.category,
        title: pin.title,
        description: pin.description,
        subcategory: pin.subcategory,
        x: x ?? 30 + Math.random() * 40,
        y: y ?? 30 + Math.random() * 40,
        lat: pin.lat ?? null,
        lng: pin.lng ?? null,
        profile_id: pin.profileId ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  });

  return { posts, userPosts, isLoading, addPost };
}
