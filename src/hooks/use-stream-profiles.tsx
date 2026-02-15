import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export interface StreamProfile {
  id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
  overlay_config: Record<string, any>;
  created_at: string;
}

export function useStreamProfiles() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<StreamProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("stream_profiles")
      .select("*")
      .eq("user_id", user.id)
      .order("sort_order", { ascending: true });

    let list = (data || []) as StreamProfile[];

    // Auto-create default profiles if none exist
    if (list.length === 0) {
      const defaults = [
        { user_id: user.id, name: "Stream Profile 1", sort_order: 0, is_active: true },
        { user_id: user.id, name: "Stream Profile 2", sort_order: 1, is_active: false },
        { user_id: user.id, name: "Stream Profile 3", sort_order: 2, is_active: false },
        { user_id: user.id, name: "Stream Profile 4", sort_order: 3, is_active: false },
      ];
      const { data: created } = await supabase.from("stream_profiles").insert(defaults).select();
      list = (created || []) as StreamProfile[];
    }

    setProfiles(list);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

  const activeProfile = profiles.find((p) => p.is_active) || profiles[0];

  const switchProfile = async (profileId: string) => {
    if (!user) return;
    // Deactivate all, activate selected
    await supabase.from("stream_profiles").update({ is_active: false }).eq("user_id", user.id);
    await supabase.from("stream_profiles").update({ is_active: true }).eq("id", profileId);
    setProfiles((prev) =>
      prev.map((p) => ({ ...p, is_active: p.id === profileId }))
    );
  };

  const renameProfile = async (profileId: string, newName: string) => {
    await supabase.from("stream_profiles").update({ name: newName }).eq("id", profileId);
    setProfiles((prev) =>
      prev.map((p) => (p.id === profileId ? { ...p, name: newName } : p))
    );
    toast.success("Profile renamed");
  };

  return { profiles, activeProfile, loading, switchProfile, renameProfile, refetch: fetchProfiles };
}
