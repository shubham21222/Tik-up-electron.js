import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Shield, Link2, Type, AlertTriangle, Clock, MessageSquareX, Volume2, VolumeX, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface ModConfig {
  block_links: boolean;
  caps_filter: boolean;
  spam_detection: boolean;
  block_banned_words: boolean;
  slow_mode: boolean;
  emoji_only_filter: boolean;
  safe_mode: boolean;
}

const DEFAULT: ModConfig = {
  block_links: true,
  caps_filter: true,
  spam_detection: true,
  block_banned_words: true,
  slow_mode: false,
  emoji_only_filter: false,
  safe_mode: false,
};

const rules = [
  { key: "block_links", icon: Link2, label: "Block links" },
  { key: "caps_filter", icon: Type, label: "Caps filter" },
  { key: "spam_detection", icon: AlertTriangle, label: "Spam detection" },
  { key: "block_banned_words", icon: Shield, label: "Banned words" },
  { key: "slow_mode", icon: Clock, label: "Slow mode" },
  { key: "emoji_only_filter", icon: MessageSquareX, label: "Emoji filter" },
] as const;

const DashboardModeration = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState<ModConfig>(DEFAULT);
  const [hasRow, setHasRow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bannedWordCount, setBannedWordCount] = useState(0);
  const [bannedUserCount, setBannedUserCount] = useState(0);

  const fetchConfig = useCallback(async () => {
    if (!user) return;
    const [configRes, wordRes, userRes] = await Promise.all([
      supabase.from("moderation_config" as any).select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("banned_words" as any).select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("banned_users" as any).select("id", { count: "exact", head: true }).eq("user_id", user.id),
    ]);
    if (configRes.data) {
      const d = configRes.data as any;
      setConfig({
        block_links: d.block_links,
        caps_filter: d.caps_filter,
        spam_detection: d.spam_detection,
        block_banned_words: d.block_banned_words,
        slow_mode: d.slow_mode,
        emoji_only_filter: d.emoji_only_filter,
        safe_mode: d.safe_mode,
      });
      setHasRow(true);
    }
    setBannedWordCount(wordRes.count ?? 0);
    setBannedUserCount(userRes.count ?? 0);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  const toggle = async (key: keyof ModConfig) => {
    if (!user) return;
    const newVal = !config[key];
    setConfig(prev => ({ ...prev, [key]: newVal }));

    if (hasRow) {
      const { error } = await supabase.from("moderation_config" as any).update({ [key]: newVal } as any).eq("user_id", user.id);
      if (error) { setConfig(prev => ({ ...prev, [key]: !newVal })); toast.error("Failed to update"); return; }
    } else {
      const { error } = await supabase.from("moderation_config" as any)
        .insert({ user_id: user.id, ...DEFAULT, [key]: newVal } as any).select().single();
      if (error) { setConfig(prev => ({ ...prev, [key]: !newVal })); toast.error("Failed to save"); return; }
      setHasRow(true);
    }
    toast.success(`${key.replace(/_/g, " ")} ${newVal ? "enabled" : "disabled"}`);
  };

  if (loading) return null;

  const enabledCount = rules.filter(r => config[r.key]).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="mb-8 rounded-2xl p-[1px]"
      style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" }}
    >
      <div className="rounded-2xl p-5" style={{ background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-primary" />
            <h2 className="text-sm font-heading font-bold text-foreground">Auto Moderation</h2>
            <span className="text-[10px] text-muted-foreground font-medium px-2 py-0.5 rounded-md bg-muted/30">
              {enabledCount}/{rules.length} active
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Safe Mode toggle */}
            <div className="flex items-center gap-1.5">
              <Zap size={11} className={config.safe_mode ? "text-primary" : "text-muted-foreground/40"} />
              <span className="text-[10px] text-muted-foreground">Safe</span>
              <button onClick={() => toggle("safe_mode")}
                className={`w-8 h-[18px] rounded-full relative transition-colors duration-200 ${config.safe_mode ? "bg-primary/30" : "bg-muted/60"}`}>
                <div className={`w-3 h-3 rounded-full absolute top-[3px] transition-all duration-200 ${config.safe_mode ? "left-[17px] bg-primary" : "left-[3px] bg-muted-foreground/60"}`} />
              </button>
            </div>
            <Link to="/auto-moderation" className="text-[10px] text-primary hover:text-primary/80 font-medium transition-colors">
              Manage →
            </Link>
          </div>
        </div>

        {/* Rules grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
          {rules.map(rule => {
            const active = config[rule.key];
            const Icon = rule.icon;
            return (
              <button
                key={rule.key}
                onClick={() => toggle(rule.key)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all duration-200 text-left ${
                  active
                    ? "border-primary/20 bg-primary/5"
                    : "border-border/20 bg-muted/10 hover:bg-muted/20"
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? "bg-primary/15" : "bg-muted/40"}`}>
                  <Icon size={12} className={active ? "text-primary" : "text-muted-foreground/50"} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[11px] font-medium truncate ${active ? "text-foreground" : "text-muted-foreground/60"}`}>
                    {rule.label}
                  </p>
                </div>
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? "bg-primary" : "bg-muted-foreground/30"}`} />
              </button>
            );
          })}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 pt-3 border-t border-border/15">
          <div className="flex items-center gap-1.5">
            <VolumeX size={11} className="text-muted-foreground/50" />
            <span className="text-[10px] text-muted-foreground">
              <span className="font-semibold text-foreground">{bannedWordCount}</span> banned words
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Volume2 size={11} className="text-muted-foreground/50" />
            <span className="text-[10px] text-muted-foreground">
              <span className="font-semibold text-foreground">{bannedUserCount}</span> banned users
            </span>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-[10px] text-muted-foreground/50">Filters apply to</span>
            <span className="text-[9px] font-medium text-primary/70 px-1.5 py-0.5 rounded bg-primary/5">Chat</span>
            <span className="text-[9px] font-medium text-primary/70 px-1.5 py-0.5 rounded bg-primary/5">TTS</span>
            <span className="text-[9px] font-medium text-primary/70 px-1.5 py-0.5 rounded bg-primary/5">Alerts</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardModeration;
