import { useEffect, useState } from "react";
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
  const alertId = useState(0);

  // Fetch widget settings
  useEffect(() => {
    if (!publicToken) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("overlay_widgets" as any)
        .select("settings")
        .eq("public_token", publicToken)
        .single();
      if (data) setSettings(applyUrlOverrides({ ...defaultGiftAlertSettings, ...(data as any).settings }) as typeof defaultGiftAlertSettings);
    };
    fetch();
  }, [publicToken]);

  // Realtime subscription for alerts + settings changes
  useEffect(() => {
    if (!publicToken) return;

    const channel = supabase
      .channel(`gift-alert-${publicToken}`)
      .on("broadcast", { event: "gift_alert" }, (msg) => {
        const p = msg.payload || {};
        const event: AlertEvent = {
          id: Date.now(),
          user: p.username || p.user || "Viewer",
          gift: p.giftName || p.gift_name || p.gift || "Gift",
          emoji: p.emoji || "🎁",
          value: Number(p.coinValue || p.coin_value || p.diamondCount || p.diamond_count || 0),
          avatar: p.avatar || p.profilePictureUrl || p.avatar_url || undefined,
        };
        setAlerts(prev => [...prev, event]);
      })
      .on("broadcast", { event: "test_alert" }, () => {
        setAlerts(prev => [...prev, {
          id: Date.now(), user: "TestUser", gift: "Rose", emoji: "🌹", value: 1
        }]);
      })
      .subscribe(status => setConnected(status === "SUBSCRIBED"));

    // Listen for settings updates
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
  }, [publicToken]);

  // Auto-remove alerts after duration
  useEffect(() => {
    if (alerts.length === 0) return;
    const timer = setTimeout(() => {
      setAlerts(prev => prev.slice(1));
    }, settings.duration * 1000);
    return () => clearTimeout(timer);
  }, [alerts, settings.duration]);

  const glowIntensity = (settings.glow_intensity || 50) / 100;
  const imageSize = settings.gift_image_size || 64;
  const variants = getEntryVariants(settings.animation_style);

  return (
    <div className={`w-screen h-screen overflow-hidden flex items-center justify-center ${settings.transparent_bg ? "bg-transparent" : settings.dark_bg ? "bg-black" : "bg-transparent"}`}>
      {/* Connection indicator */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-20">
        <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
        <span className="text-[9px] text-white/50 font-mono">{connected ? "Live" : "..."}</span>
      </div>

      <AnimatePresence>
        {alerts.slice(0, settings.max_on_screen).map(alert => (
          <motion.div
            key={alert.id}
            className="absolute flex flex-col items-center"
            initial={variants.initial}
            animate={variants.animate}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 / (settings.animation_speed || 1), ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Expanding ring */}
            <motion.div
              className="absolute rounded-full border"
              style={{ width: imageSize * 1.5, height: imageSize * 1.5, borderColor: `hsl(280 100% 65% / ${0.3 * glowIntensity})` }}
              initial={{ scale: 0.5, opacity: 0.8 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 1.5 }}
            />

            {/* Glow */}
            <motion.div
              className="absolute rounded-full blur-2xl"
              style={{ width: imageSize, height: imageSize, background: `hsl(280 100% 65% / ${0.1 * glowIntensity})` }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Avatar / Gift icon */}
            {alert.avatar ? (
              <img
                src={alert.avatar}
                alt={alert.user}
                className="rounded-full mb-4 object-cover"
                style={{ width: imageSize, height: imageSize, border: `2px solid hsl(280 100% 65% / 0.4)` }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <div className="rounded-full flex items-center justify-center mb-4"
                style={{ width: imageSize, height: imageSize, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(20px)", border: `1px solid hsl(280 100% 65% / 0.2)` }}>
                <span style={{ fontSize: imageSize * 0.45 }}>{alert.emoji}</span>
              </div>
            )}

            <div className="text-center">
              <p className={`text-sm font-bold text-white truncate max-w-[200px] ${settings.username_font === "mono" ? "font-mono" : settings.username_font === "heading" ? "font-heading" : ""}`}>
                {alert.user}
              </p>
              <p className="text-[11px] text-white/50 mt-0.5">sent a gift!</p>
              <p className="text-xs font-semibold mt-1" style={{ color: "hsl(280 100% 70%)" }}>{alert.gift}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Custom CSS injection */}
      {settings.custom_css && <style dangerouslySetInnerHTML={{ __html: settings.custom_css }} />}
    </div>
  );
};

export default GiftAlertRenderer;
