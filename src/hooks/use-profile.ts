import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const PROFILE_STORAGE_KEY = 'community_profile_id';

function getStoredProfileId(): string | null {
  return localStorage.getItem(PROFILE_STORAGE_KEY);
}

function storeProfileId(id: string) {
  localStorage.setItem(PROFILE_STORAGE_KEY, id);
}

export interface ProfileData {
  id: string;
  name: string;
  pronouns: string;
  location_base: string;
  timezone: string;
  language: string;
  large_text: boolean;
  high_contrast: boolean;
}

export function useProfile() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<ProfileData> => {
      const storedId = getStoredProfileId();
      if (storedId) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', storedId)
          .maybeSingle();
        if (data && !error) {
          return {
            id: data.id,
            name: data.name,
            pronouns: data.pronouns ?? 'they/them',
            location_base: data.location_base ?? 'Werpoes',
            timezone: data.timezone ?? 'EST (UTC-5)',
            language: data.language ?? 'English',
            large_text: data.large_text ?? false,
            high_contrast: data.high_contrast ?? false,
          };
        }
      }
      // Create a new profile
      const { data, error } = await supabase
        .from('profiles')
        .insert({})
        .select()
        .single();
      if (error) throw error;
      storeProfileId(data.id);
      return {
        id: data.id,
        name: data.name,
        pronouns: data.pronouns ?? 'they/them',
        location_base: data.location_base ?? 'Werpoes',
        timezone: data.timezone ?? 'EST (UTC-5)',
        language: data.language ?? 'English',
        large_text: data.large_text ?? false,
        high_contrast: data.high_contrast ?? false,
      };
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<Omit<ProfileData, 'id'>>) => {
      if (!profile) throw new Error('No profile');
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });

  return { profile, isLoading, updateProfile };
}
