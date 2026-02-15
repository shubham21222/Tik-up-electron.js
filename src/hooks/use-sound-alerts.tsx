import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export interface SoundAlert {
  id: string;
  user_id: string;
  is_enabled: boolean;
  trigger_type: string;
  gift_id: string | null;
  sound_url: string;
  sound_name: string;
  volume: number;
  cooldown: number;
  created_at: string;
  updated_at: string;
}

export function useSoundAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<SoundAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const { data, error } = await supabase
      .from("sound_alerts" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    if (!error && data) setAlerts(data as unknown as SoundAlert[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const createAlert = async (triggerType: string, giftId: string | null) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("sound_alerts" as any)
      .insert({
        user_id: user.id,
        trigger_type: triggerType,
        gift_id: giftId,
      } as any)
      .select()
      .single();
    if (error) { toast.error("Failed to create sound alert"); return null; }
    const alert = data as unknown as SoundAlert;
    setAlerts(prev => [...prev, alert]);
    toast.success("Sound alert created");
    return alert;
  };

  const updateAlert = async (id: string, updates: Partial<SoundAlert>) => {
    const { error } = await supabase
      .from("sound_alerts" as any)
      .update(updates as any)
      .eq("id", id);
    if (error) { toast.error("Failed to update"); return; }
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAlert = async (id: string) => {
    const { error } = await supabase
      .from("sound_alerts" as any)
      .delete()
      .eq("id", id);
    if (!error) {
      setAlerts(prev => prev.filter(a => a.id !== id));
      toast.success("Sound alert removed");
    }
  };

  const toggleEnabled = async (id: string) => {
    const alert = alerts.find(a => a.id === id);
    if (!alert) return;
    await updateAlert(id, { is_enabled: !alert.is_enabled });
  };

  return { alerts, loading, createAlert, updateAlert, deleteAlert, toggleEnabled, refetch: fetchAlerts };
}
