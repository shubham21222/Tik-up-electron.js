import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export interface ViewerPoint {
  id: string;
  creator_id: string;
  viewer_username: string;
  viewer_avatar_url: string | null;
  level: number;
  total_points: number;
  points_toward_level: number;
  total_gifts_sent: number;
  total_coins_sent: number;
  total_likes: number;
  total_messages: number;
  first_activity: string;
  last_activity: string;
}

export const useViewerPoints = (sortBy: string = "total_points", sortAsc: boolean = false) => {
  const { user } = useAuth();

  const { data: viewers = [], isLoading, refetch } = useQuery({
    queryKey: ["viewer-points", user?.id, sortBy, sortAsc],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("viewer_points")
        .select("*")
        .eq("creator_id", user.id)
        .order(sortBy, { ascending: sortAsc })
        .limit(500);
      if (error) throw error;
      return (data || []) as ViewerPoint[];
    },
    enabled: !!user,
  });

  const queryClient = useQueryClient();

  const resetAllPoints = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("viewer_points")
        .delete()
        .eq("creator_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["viewer-points"] }),
  });

  return { viewers, isLoading, refetch, resetAllPoints };
};
