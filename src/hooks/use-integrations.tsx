import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export interface Integration {
  id: string;
  user_id: string;
  provider: string;
  name: string;
  webhook_url: string;
  is_enabled: boolean;
  notify_go_live: boolean;
  notify_gifts: boolean;
  notify_gift_min_coins: number;
  notify_follows: boolean;
  notify_milestones: boolean;
  milestone_config: Record<string, any>;
  embed_color: string;
  last_triggered_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useIntegrations() {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIntegrations = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("integrations" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) setIntegrations(data as unknown as Integration[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchIntegrations(); }, [fetchIntegrations]);

  const createIntegration = useCallback(async () => {
    if (!user) return;
    const { error } = await supabase.from("integrations" as any).insert({
      user_id: user.id,
      name: `Discord Webhook ${integrations.length + 1}`,
      provider: "discord",
    } as any);
    if (error) { toast.error("Failed to create webhook"); return; }
    toast.success("Webhook created");
    fetchIntegrations();
  }, [user, integrations.length, fetchIntegrations]);

  const updateIntegration = useCallback(async (id: string, updates: Partial<Integration>) => {
    const { error } = await supabase
      .from("integrations" as any)
      .update(updates as any)
      .eq("id", id);
    if (error) { toast.error("Failed to update"); return; }
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  }, []);

  const deleteIntegration = useCallback(async (id: string) => {
    const { error } = await supabase.from("integrations" as any).delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Webhook deleted");
    setIntegrations(prev => prev.filter(i => i.id !== id));
  }, []);

  const testWebhook = useCallback(async (id: string) => {
    const integration = integrations.find(i => i.id === id);
    if (!integration?.webhook_url) { toast.error("No webhook URL set"); return; }

    try {
      const res = await fetch(integration.webhook_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "TikUp",
          avatar_url: "https://tik-pro-suite.lovable.app/favicon.ico",
          embeds: [{
            title: "🔔 Test Notification",
            description: "Your Discord webhook is connected and working!",
            color: parseInt(integration.embed_color.replace("#", ""), 16),
            fields: [
              { name: "Provider", value: "TikUp", inline: true },
              { name: "Status", value: "✅ Connected", inline: true },
            ],
            timestamp: new Date().toISOString(),
          }],
        }),
      });
      if (res.ok) {
        toast.success("Test sent! Check your Discord channel.");
        updateIntegration(id, { last_triggered_at: new Date().toISOString() });
      } else {
        toast.error(`Discord returned ${res.status}`);
      }
    } catch {
      toast.error("Failed to reach Discord");
    }
  }, [integrations, updateIntegration]);

  return { integrations, loading, createIntegration, updateIntegration, deleteIntegration, testWebhook };
}
