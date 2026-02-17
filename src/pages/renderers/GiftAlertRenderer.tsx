import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { defaultGiftAlertSettings } from "@/hooks/use-overlay-widgets";
import useOverlayBody from "@/hooks/use-overlay-body";
import { applyUrlOverrides } from "@/lib/overlay-params";

interface AlertEvent {
  id: number;
  user: string;
  gift: string;
  emoji: string;
  value: number;
  avatar?: string;
  giftImageUrl?: string;
  animationOverride?: string;
  soundUrl?: string;
}

interface GiftTrigger {
  gift_id: string;
  is_enabled: boolean;
  animation_effect: string;
  alert_sound_url: string | null;
  combo_threshold: number | null;
  min_value_threshold: number | null;
  custom_config: Record<string, any>;
}

const getEntryVariants = (style: string) => {
  switch (style) {
    case "slide": return { initial: { x: -200, opacity: 0 }, animate: { x: 0, opacity: 1 } };
    case "explosion": return { initial: { scale: 3, opacity: 0 }, animate: { scale: 1, opacity: 1 } };
    case "flip_3d": return { initial: { rotateY: 90, opacity: 0 }, animate: { rotateY: 0, opacity: 1 } };
    case "glitch": return { initial: { x: [-8, 8, -4, 0], opacity: 0 }, animate: { x: 0, opacity: 1 } };
    case "flames_rising": return { initial: { scale: 0.6, opacity: 0, y: 40 }, animate: { scale: 1, opacity: 1, y: 0 } };
    case "icy_blast": return { initial: { scale: 1.8, opacity: 0 }, animate: { scale: 1, opacity: 1 } };
    case "christmas_spark": return { initial: { scale: 0, opacity: 0, rotate: -30 }, animate: { scale: 1, opacity: 1, rotate: 0 } };
    case "snowfall": return { initial: { scale: 0.5, opacity: 0, y: -30 }, animate: { scale: 1, opacity: 1, y: 0 } };
    case "cyber_pulse": return { initial: { scaleX: 2, scaleY: 0.3, opacity: 0 }, animate: { scaleX: 1, scaleY: 1, opacity: 1 } };
    case "explosion_burst": return { initial: { scale: 0, opacity: 0 }, animate: { scale: 1, opacity: 1 } };
    default: return { initial: { scale: 0.3, opacity: 0, y: 50 }, animate: { scale: 1, opacity: 1, y: 0 } };
  }
};

const GiftAlertRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const [settings, setSettings] = useState(defaultGiftAlertSettings);
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [giftTriggers, setGiftTriggers] = useState<GiftTrigger[]>([]);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play sound for an alert
  const playSound = useCallback((url: string | undefined) => {
    if (!url) return;
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      const audio = new Audio(url);
      audio.volume = (settings.sound_volume || 80) / 100;
      audioRef.current = audio;
      audio.play().catch(() => {});
    } catch {}
  }, [settings.sound_volume]);

  // Fetch widget settings + owner
  useEffect(() => {
    if (!publicToken) return;
    const fetchWidget = async () => {
      const { data } = await supabase
        .from("overlay_widgets" as any)
        .select("settings, user_id")
        .eq("public_token", publicToken)
        .single();
      if (data) {
        setSettings(applyUrlOverrides({ ...defaultGiftAlertSettings, ...(data as any).settings }) as typeof defaultGiftAlertSettings);
        setOwnerId((data as any).user_id);
      }
    };
    fetchWidget();
  }, [publicToken]);

  // Fetch user's per-gift triggers
  useEffect(() => {
    if (!ownerId) return;
    const fetchTriggers = async () => {
      const { data } = await supabase
        .from("user_gift_triggers" as any)
        .select("*")
        .eq("user_id", ownerId)
        .eq("is_enabled", true);
      if (data) setGiftTriggers(data as unknown as GiftTrigger[]);
    };
    fetchTriggers();
  }, [ownerId]);

  // Keep a ref to giftTriggers so the subscription handler always has latest
  const giftTriggersRef = useRef<GiftTrigger[]>([]);
  useEffect(() => { giftTriggersRef.current = giftTriggers; }, [giftTriggers]);

  const settingsRef = useRef(settings);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  // Realtime subscription — only depends on publicToken to avoid reconnect churn
  useEffect(() => {
    if (!publicToken) return;

    console.log(`[GiftAlert] Subscribing to gift-alert-${publicToken}`);

    const channel = supabase
      .channel(`gift-alert-${publicToken}`)
      .on("broadcast", { event: "gift_alert" }, (msg) => {
        const p = msg.payload || {} as any;
        const giftId = p.giftId || p.gift_id || "";
        const giftName = p.giftName || p.gift_name || p.gift || "Gift";
        const normalizedName = giftName.toLowerCase().replace(/\s+/g, "_");
        
        // Check per-gift trigger from client-side cache OR webhook-injected overrides
        const trigger = giftTriggersRef.current.find(t => 
          t.gift_id === normalizedName || t.gift_id === String(giftId) || t.gift_id === giftName.toLowerCase()
        );

        // Sound: prefer webhook-injected, then client trigger, then global setting
        const s = settingsRef.current;
        const soundUrl = p.alert_sound_url || trigger?.alert_sound_url || s.sound_url || undefined;
        // Animation: prefer webhook-injected, then client trigger
        const animOverride = p.animation_effect || trigger?.animation_effect || undefined;
        
        const event: AlertEvent = {
          id: Date.now() + Math.random(),
          user: p.username || p.user || "Viewer",
          gift: giftName,
          emoji: p.emoji || "🎁",
          value: Number(p.coinValue || p.coin_value || p.diamondCount || p.diamond_count || 0),
          avatar: p.avatar || p.profilePictureUrl || p.avatar_url || undefined,
          giftImageUrl: p.giftImageUrl || p.gift_image_url || undefined,
          animationOverride: animOverride,
          soundUrl,
        };
        
        console.log(`[GiftAlert] Received gift: ${giftName} from ${event.user}`);
        setAlerts(prev => [...prev, event]);
        
        // Play sound
        playSound(soundUrl);
      })
      .on("broadcast", { event: "test_alert" }, () => {
        const s = settingsRef.current;
        const testEvent: AlertEvent = {
          id: Date.now(), user: "TestUser", gift: "Rose", emoji: "🌹", value: 1,
          soundUrl: s.sound_url || undefined,
        };
        setAlerts(prev => [...prev, testEvent]);
        playSound(s.sound_url || undefined);
      })
      .subscribe(status => {
        console.log(`[GiftAlert] Channel status: ${status}`);
        setConnected(status === "SUBSCRIBED");
      });

    const dbChannel = supabase
      .channel(`gift-alert-db-${publicToken}`)
      .on("postgres_changes" as any, {
        event: "UPDATE", schema: "public", table: "overlay_widgets",
        filter: `public_token=eq.${publicToken}`,
      }, (payload: any) => {
        if (payload.new?.settings) {
          setSettings({ ...defaultGiftAlertSettings, ...payload.new.settings });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(dbChannel);
    };
  }, [publicToken, playSound]);

  // Auto-remove alerts after duration
  useEffect(() => {
    if (alerts.length === 0) return;
    const timer = setTimeout(() => {
      setAlerts(prev => prev.slice(1));
    }, settings.duration * 1000);
    return () => clearTimeout(timer);
  }, [alerts, settings.duration]);

  const s = settings as any;
  const glowIntensity = (s.glow_intensity || 50) / 100;
  const imageSize = s.gift_image_size || 64;
  const noBackground = s.no_background ?? false;
  const noBorder = s.no_border ?? false;

  return (
    <div className={`w-screen h-screen overflow-hidden flex items-center justify-center ${s.transparent_bg ? "bg-transparent" : s.dark_bg ? "bg-black" : "bg-transparent"}`}>
      <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-20">
        <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
        <span className="text-[9px] text-white/50 font-mono">{connected ? "Live" : "..."}</span>
      </div>

      <AnimatePresence>
        {alerts.slice(0, s.max_on_screen).map(alert => {
          const activeAnimation = alert.animationOverride || s.animation_style;
          const variants = getEntryVariants(activeAnimation);

          return (
            <motion.div
              key={alert.id}
              className="absolute flex flex-col items-center"
              initial={variants.initial}
              animate={variants.animate}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 / (s.animation_speed || 1), ease: [0.16, 1, 0.3, 1] }}
            >
              {!noBorder && (
                <motion.div
                  className="absolute rounded-full border"
                  style={{ width: imageSize * 1.5, height: imageSize * 1.5, borderColor: `hsl(280 100% 65% / ${0.3 * glowIntensity})` }}
                  initial={{ scale: 0.5, opacity: 0.8 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  transition={{ duration: 1.5 }}
                />
              )}

              {!noBackground && (
                <motion.div
                  className="absolute rounded-full blur-2xl"
                  style={{ width: imageSize, height: imageSize, background: `hsl(280 100% 65% / ${0.1 * glowIntensity})` }}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}

              {alert.giftImageUrl ? (
                <div className="rounded-full flex items-center justify-center mb-4"
                  style={{
                    width: imageSize, height: imageSize,
                    background: noBackground ? "transparent" : "rgba(0,0,0,0.6)",
                    backdropFilter: noBackground ? "none" : "blur(20px)",
                    border: noBorder ? "none" : `1px solid hsl(280 100% 65% / 0.2)`,
                  }}>
                  <img src={alert.giftImageUrl} alt={alert.gift} className="w-3/4 h-3/4 object-contain" />
                </div>
              ) : alert.avatar ? (
                <img
                  src={alert.avatar}
                  alt={alert.user}
                  className="rounded-full mb-4 object-cover"
                  style={{
                    width: imageSize, height: imageSize,
                    border: noBorder ? "none" : `2px solid hsl(280 100% 65% / 0.4)`,
                  }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <div className="rounded-full flex items-center justify-center mb-4"
                  style={{
                    width: imageSize, height: imageSize,
                    background: noBackground ? "transparent" : "rgba(0,0,0,0.6)",
                    backdropFilter: noBackground ? "none" : "blur(20px)",
                    border: noBorder ? "none" : `1px solid hsl(280 100% 65% / 0.2)`,
                  }}>
                  <span style={{ fontSize: imageSize * 0.45 }}>{alert.emoji}</span>
                </div>
              )}

              <div className="text-center">
                <p className={`text-sm font-bold text-white truncate max-w-[200px] ${s.username_font === "mono" ? "font-mono" : s.username_font === "heading" ? "font-heading" : ""}`}>
                  {alert.user}
                </p>
                <p className="text-[11px] text-white/50 mt-0.5">sent a gift!</p>
                <p className="text-xs font-semibold mt-1" style={{ color: "hsl(280 100% 70%)" }}>{alert.gift}</p>
                {alert.value > 0 && <p className="text-[10px] text-white/30 mt-0.5">🪙 {alert.value}</p>}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default GiftAlertRenderer;