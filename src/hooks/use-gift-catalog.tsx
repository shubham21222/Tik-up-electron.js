import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export interface TikTokGift {
  id: string;
  gift_id: string;
  name: string;
  coin_value: number;
  image_url: string | null;
  category: string;
  is_active: boolean;
  sort_order: number;
}

export interface UserGiftTrigger {
  id: string;
  user_id: string;
  gift_id: string;
  is_enabled: boolean;
  alert_sound_url: string | null;
  animation_effect: string;
  priority: number;
  combo_threshold: number | null;
  min_value_threshold: number | null;
  custom_config: Record<string, any>;
}

export function useGiftCatalog() {
  const [gifts, setGifts] = useState<TikTokGift[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGifts = useCallback(async () => {
    const { data, error } = await supabase
      .from("tiktok_gifts" as any)
      .select("*")
      .eq("is_active", true)
      .order("coin_value", { ascending: true });
    if (!error && data) setGifts(data as unknown as TikTokGift[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchGifts(); }, [fetchGifts]);

  return { gifts, loading, refetch: fetchGifts };
}

export function useUserGiftTriggers() {
  const { user } = useAuth();
  const [triggers, setTriggers] = useState<UserGiftTrigger[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTriggers = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const { data, error } = await supabase
      .from("user_gift_triggers" as any)
      .select("*")
      .eq("user_id", user.id);
    if (!error && data) setTriggers(data as unknown as UserGiftTrigger[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchTriggers(); }, [fetchTriggers]);

  const toggleTrigger = async (giftId: string, enabled: boolean) => {
    if (!user) return;
    const existing = triggers.find(t => t.gift_id === giftId);
    if (existing) {
      const { error } = await supabase
        .from("user_gift_triggers" as any)
        .update({ is_enabled: enabled } as any)
        .eq("id", existing.id);
      if (!error) setTriggers(prev => prev.map(t => t.id === existing.id ? { ...t, is_enabled: enabled } : t));
    } else {
      const { data, error } = await supabase
        .from("user_gift_triggers" as any)
        .insert({ user_id: user.id, gift_id: giftId, is_enabled: enabled } as any)
        .select()
        .single();
      if (!error && data) setTriggers(prev => [...prev, data as unknown as UserGiftTrigger]);
    }
  };

  const updateTrigger = async (giftId: string, updates: Partial<UserGiftTrigger>) => {
    if (!user) return;
    const existing = triggers.find(t => t.gift_id === giftId);
    if (existing) {
      const { error } = await supabase
        .from("user_gift_triggers" as any)
        .update(updates as any)
        .eq("id", existing.id);
      if (!error) {
        setTriggers(prev => prev.map(t => t.id === existing.id ? { ...t, ...updates } : t));
        toast.success("Trigger updated");
      }
    } else {
      const { data, error } = await supabase
        .from("user_gift_triggers" as any)
        .insert({ user_id: user.id, gift_id: giftId, is_enabled: true, ...updates } as any)
        .select()
        .single();
      if (!error && data) {
        setTriggers(prev => [...prev, data as unknown as UserGiftTrigger]);
        toast.success("Trigger created");
      }
    }
  };

  const bulkEnable = async (giftIds: string[]) => {
    if (!user) return;
    for (const giftId of giftIds) {
      await toggleTrigger(giftId, true);
    }
    toast.success(`${giftIds.length} gifts enabled for alerts`);
  };

  const deleteTrigger = async (giftId: string) => {
    const existing = triggers.find(t => t.gift_id === giftId);
    if (!existing) return;
    const { error } = await supabase
      .from("user_gift_triggers" as any)
      .delete()
      .eq("id", existing.id);
    if (!error) {
      setTriggers(prev => prev.filter(t => t.id !== existing.id));
    }
  };

  return { triggers, loading, toggleTrigger, updateTrigger, bulkEnable, deleteTrigger, refetch: fetchTriggers };
}
