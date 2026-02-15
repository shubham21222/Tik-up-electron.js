import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar_url: string | null;
  points_total: number;
  level: number;
  coins_sent: number;
  gifts: number;
  likes: number;
  messages: number;
  first_activity: string;
  last_activity: string;
}

export interface PointsConfig {
  coins: { weight: number; enabled: boolean };
  message: { weight: number; enabled: boolean };
  like: { weight: number; enabled: boolean };
  follow: { weight: number; enabled: boolean };
  share: { weight: number; enabled: boolean };
  level_base_points: number;
  level_multiplier: number;
  currency_name: string;
  subscriber_bonus_ratio: number;
}

async function callPointsApi(params: Record<string, string> = {}, method = "GET", body?: unknown) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/points-api`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    method,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "API error");
  return json;
}

export const useLeaderboard = (sort: string = "total_points", limit = 500) => {
  const { user } = useAuth();
  const qc = useQueryClient();

  // Subscribe to real-time viewer_points changes
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("viewer-points-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "viewer_points",
          filter: `creator_id=eq.${user.id}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ["points-leaderboard"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, qc]);

  return useQuery({
    queryKey: ["points-leaderboard", user?.id, sort, limit],
    queryFn: () => callPointsApi({ leaderboard: "true", sort, limit: String(limit) }),
    enabled: !!user,
    select: (data) => (data.leaderboard || []) as LeaderboardEntry[],
  });
};

export const usePointsConfig = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["points-config", user?.id],
    queryFn: () => callPointsApi(),
    enabled: !!user,
    select: (data) => data as PointsConfig,
  });
};

export const useUpdatePointsConfig = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (config: Partial<PointsConfig>) => callPointsApi({}, "PUT", config),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["points-config"] }),
  });
};

export const useResetViewerPoints = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (viewerId: string) => callPointsApi({ reset_user: viewerId }, "PUT"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["points-leaderboard"] }),
  });
};

export const useResetAllPoints = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("viewer_points").delete().eq("creator_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["points-leaderboard"] }),
  });
};
