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
  count: number;
  avatar?: string;
  giftImageUrl?: string;
  animationOverride?: string;
  soundUrl?: string;
  message?: string;
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

/* ── Animation variants ── */
const getEntryVariants = (style: string) => {
  switch (style) {
    case "slide": return { initial: { x: -200, opacity: 0 }, animate: { x: 0, opacity: 1 } };
    case "explosion": return { initial: { scale: 3, opacity: 0, rotate: 15 }, animate: { scale: 1, opacity: 1, rotate: 0 } };
    case "flip_3d": return { initial: { rotateY: 90, opacity: 0 }, animate: { rotateY: 0, opacity: 1 } };
    case "glitch": return { initial: { x: [-8, 8, -4, 0], opacity: 0, skewX: 5 }, animate: { x: 0, opacity: 1, skewX: 0 } };
    case "flames_rising": return { initial: { scale: 0.6, opacity: 0, y: 40 }, animate: { scale: 1, opacity: 1, y: 0 } };
    case "icy_blast": return { initial: { scale: 1.8, opacity: 0 }, animate: { scale: 1, opacity: 1 } };
    case "christmas_spark": return { initial: { scale: 0, opacity: 0, rotate: -30 }, animate: { scale: 1, opacity: 1, rotate: 0 } };
    case "snowfall": return { initial: { scale: 0.5, opacity: 0, y: -30 }, animate: { scale: 1, opacity: 1, y: 0 } };
    case "cyber_pulse": return { initial: { scaleX: 2, scaleY: 0.3, opacity: 0 }, animate: { scaleX: 1, scaleY: 1, opacity: 1 } };
    case "explosion_burst": return { initial: { scale: 0, opacity: 0 }, animate: { scale: 1, opacity: 1 } };
    default: return { initial: { scale: 0.3, opacity: 0, y: 50 }, animate: { scale: 1, opacity: 1, y: 0 } };
  }
};

/* ── Position mapping ── */
const getPositionClass = (pos: string) => {
  switch (pos) {
    case "top": return "items-start justify-center pt-12";
    case "bottom": return "items-end justify-center pb-12";
    case "top-left": return "items-start justify-start pt-12 pl-12";
    case "top-right": return "items-start justify-end pt-12 pr-12";
    case "bottom-left": return "items-end justify-start pb-12 pl-12";
    case "bottom-right": return "items-end justify-end pb-12 pr-12";
    default: return "items-center justify-center";
  }
};

/* ── Font mapping ── */
const getFontFamily = (f: string) => {
  switch (f) {
    case "inter": return "'Inter', sans-serif";
    case "space-grotesk": return "'Space Grotesk', sans-serif";
    case "orbitron": return "'Orbitron', sans-serif";
    case "bebas": return "'Bebas Neue', sans-serif";
    case "press-start": return "'Press Start 2P', cursive";
    default: return "inherit";
  }
};

/* ── Background style builder ── */
const getBgStyle = (bgStyle: string, accentColor: string, glowIntensity: number) => {
  switch (bgStyle) {
    case "glass": return {
      background: "rgba(0,0,0,0.55)",
      backdropFilter: "blur(24px) saturate(1.5)",
      border: `1px solid hsl(${accentColor} / ${0.15 * glowIntensity})`,
      borderRadius: "24px",
    };
    case "neon": return {
      background: "rgba(0,0,0,0.7)",
      border: `2px solid hsl(${accentColor} / ${0.6 * glowIntensity})`,
      borderRadius: "20px",
      boxShadow: `0 0 ${30 * glowIntensity}px hsl(${accentColor} / ${0.25 * glowIntensity}), inset 0 0 ${20 * glowIntensity}px hsl(${accentColor} / ${0.05 * glowIntensity})`,
    };
    case "solid": return {
      background: `linear-gradient(135deg, hsl(${accentColor} / 0.15), rgba(0,0,0,0.8))`,
      border: `1px solid hsl(${accentColor} / ${0.1 * glowIntensity})`,
      borderRadius: "20px",
    };
    default: return {};
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

  // Play sound
  const playSoundRef = useRef<(url: string | undefined) => void>(() => {});
  playSoundRef.current = (url: string | undefined) => {
    if (!url) return;
    try {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
      const audio = new Audio(url);
      audio.volume = (settings.sound_volume || 80) / 100;
      audioRef.current = audio;
      audio.play().catch(() => {});
    } catch {}
  };
  const playSound = useCallback((url: string | undefined) => { playSoundRef.current(url); }, []);

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

  // Fetch per-gift triggers
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

  const giftTriggersRef = useRef<GiftTrigger[]>([]);
  useEffect(() => { giftTriggersRef.current = giftTriggers; }, [giftTriggers]);
  const settingsRef = useRef(settings);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  // Realtime subscription
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

        const trigger = giftTriggersRef.current.find(t =>
          t.gift_id === normalizedName || t.gift_id === String(giftId) || t.gift_id === giftName.toLowerCase()
        );

        const s = settingsRef.current;
        const DEFAULT_CHIME = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";
        const soundUrl = p.alert_sound_url || trigger?.alert_sound_url || s.sound_url || DEFAULT_CHIME;
        const animOverride = p.animation_effect || trigger?.animation_effect || undefined;

        const event: AlertEvent = {
          id: Date.now() + Math.random(),
          user: p.username || p.user || "Viewer",
          gift: giftName,
          emoji: p.emoji || "🎁",
          value: Number(p.coinValue || p.coin_value || p.diamondCount || p.diamond_count || 0),
          count: Number(p.repeatCount || p.repeat_count || p.count || 1),
          avatar: p.avatar || p.profilePictureUrl || p.avatar_url || undefined,
          giftImageUrl: p.giftImageUrl || p.gift_image_url || undefined,
          animationOverride: animOverride,
          soundUrl,
          message: p.comment || p.message || undefined,
        };

        console.log(`[GiftAlert] Received gift: ${giftName} from ${event.user}`);
        setAlerts(prev => {
          const recent = prev.find(a => a.user === event.user && a.gift === event.gift && (Date.now() - a.id) < 500);
          if (recent) {
            return prev.map(a => a.id === recent.id ? { ...a, count: Math.max(a.count, event.count) } : a);
          }
          return [...prev, event];
        });
        playSound(soundUrl);
      })
      .on("broadcast", { event: "test_alert" }, () => {
        const s = settingsRef.current;
        const testEvent: AlertEvent = {
          id: Date.now(), user: "Tikup_User", gift: "Rose", emoji: "🌹", value: 1, count: 5,
          giftImageUrl: "/gifts/rose.png",
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

    return () => { supabase.removeChannel(channel); supabase.removeChannel(dbChannel); };
  }, [publicToken, playSound]);

  // Auto-remove alerts
  useEffect(() => {
    if (alerts.length === 0) return;
    const oldest = alerts[0];
    const timer = setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== oldest.id));
    }, settings.duration * 1000);
    return () => clearTimeout(timer);
  }, [alerts, settings.duration]);

  /* ── Import Google Fonts for custom font families ── */
  useEffect(() => {
    const s = settings as any;
    const fontMap: Record<string, string> = {
      "inter": "Inter:wght@400;600;700;800",
      "space-grotesk": "Space+Grotesk:wght@400;600;700",
      "orbitron": "Orbitron:wght@400;600;700;800;900",
      "bebas": "Bebas+Neue",
      "press-start": "Press+Start+2P",
    };
    const fontKey = s.font_family || "default";
    if (fontKey !== "default" && fontMap[fontKey]) {
      const id = `gf-${fontKey}`;
      if (!document.getElementById(id)) {
        const link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href = `https://fonts.googleapis.com/css2?family=${fontMap[fontKey]}&display=swap`;
        document.head.appendChild(link);
      }
    }
  }, [settings]);

  const s = settings as any;
  const glowIntensity = (s.glow_intensity || 50) / 100;
  const shadowDepth = (s.shadow_depth || 30) / 100;
  const imageSize = (s.gift_image_size || 64) * 3;
  const noBackground = s.no_background ?? false;
  const noBorder = s.no_border ?? false;
  const accentColor = s.accent_color || "280 100% 65%";
  const glowColor = s.glow_color || accentColor;
  const textColor = s.text_color || "0 0% 100%";
  const bgStyle = s.bg_style || "glass";
  const fontFamily = getFontFamily(s.font_family || "default");
  const fontSize = s.font_size || 24;
  const fontWeight = s.font_weight || 800;
  const alertPosition = s.alert_position || "center";

  const cardBg = noBackground ? {} : getBgStyle(bgStyle, accentColor, glowIntensity);

  return (
    <div className={`w-screen h-screen overflow-hidden flex ${getPositionClass(alertPosition)} ${s.transparent_bg ? "bg-transparent" : s.dark_bg ? "bg-black" : "bg-transparent"}`}>
      {/* Connection indicator */}
      <div className="fixed top-2 right-2 flex items-center gap-1.5 opacity-20 z-50">
        <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
        <span className="text-[9px] text-white/50 font-mono">{connected ? "Live" : "..."}</span>
      </div>

      <AnimatePresence>
        {alerts.slice(0, 1).map(alert => {
          const activeAnimation = alert.animationOverride || s.animation_style;
          const variants = getEntryVariants(activeAnimation);
          const isHighValue = alert.value >= 500;

          return (
            <motion.div
              key={alert.id}
              className="relative flex flex-col items-center"
              style={{ fontFamily, ...cardBg, padding: noBackground ? 0 : "32px 48px" }}
              initial={variants.initial}
              animate={variants.animate}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.5 / (s.animation_speed || 1), ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Outer glow ring */}
              {!noBorder && (
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: imageSize * 1.6, height: imageSize * 1.6,
                    top: "50%", left: "50%", transform: "translate(-50%, -70%)",
                    border: `2px solid hsl(${glowColor} / ${0.3 * glowIntensity})`,
                  }}
                  initial={{ scale: 0.5, opacity: 0.8 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  transition={{ duration: 1.5 }}
                />
              )}

              {/* Ambient glow behind gift */}
              {!noBackground && (
                <motion.div
                  className="absolute blur-3xl"
                  style={{
                    width: imageSize * 1.5, height: imageSize * 1.5,
                    top: "50%", left: "50%", transform: "translate(-50%, -70%)",
                    background: `radial-gradient(circle, hsl(${glowColor} / ${0.2 * glowIntensity}), transparent 70%)`,
                    borderRadius: "50%",
                  }}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}

              {/* Shadow under card */}
              {!noBackground && shadowDepth > 0 && (
                <div
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full blur-2xl"
                  style={{
                    width: "80%", height: "30px",
                    background: `hsl(${accentColor} / ${0.15 * shadowDepth})`,
                  }}
                />
              )}

              {/* Gift icon with 3D pop effect */}
              {alert.giftImageUrl ? (
                <motion.div
                  className="rounded-full flex items-center justify-center mb-5 relative z-10"
                  style={{
                    width: imageSize, height: imageSize,
                    background: noBackground ? "transparent" : "rgba(0,0,0,0.5)",
                    backdropFilter: noBackground ? "none" : "blur(20px)",
                    border: noBorder ? "none" : `2px solid hsl(${glowColor} / ${0.25 * glowIntensity})`,
                    boxShadow: noBorder ? "none" : `0 0 ${40 * glowIntensity}px hsl(${glowColor} / ${0.2 * glowIntensity}), 0 ${20 * shadowDepth}px ${40 * shadowDepth}px rgba(0,0,0,0.5)`,
                  }}
                  animate={isHighValue ? { scale: [1, 1.08, 1] } : undefined}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <img src={alert.giftImageUrl} alt={alert.gift} className="w-3/4 h-3/4 object-contain drop-shadow-lg" />
                </motion.div>
              ) : alert.avatar ? (
                <motion.img
                  src={alert.avatar}
                  alt={alert.user}
                  className="rounded-full mb-5 object-cover relative z-10"
                  style={{
                    width: imageSize, height: imageSize,
                    border: noBorder ? "none" : `2px solid hsl(${glowColor} / ${0.4 * glowIntensity})`,
                    boxShadow: `0 0 ${30 * glowIntensity}px hsl(${glowColor} / ${0.15 * glowIntensity})`,
                  }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <motion.div
                  className="rounded-full flex items-center justify-center mb-5 relative z-10"
                  style={{
                    width: imageSize, height: imageSize,
                    background: noBackground ? "transparent" : "rgba(0,0,0,0.5)",
                    backdropFilter: noBackground ? "none" : "blur(20px)",
                    border: noBorder ? "none" : `2px solid hsl(${glowColor} / ${0.25 * glowIntensity})`,
                    boxShadow: noBorder ? "none" : `0 0 ${30 * glowIntensity}px hsl(${glowColor} / ${0.15 * glowIntensity})`,
                  }}
                  animate={isHighValue ? { scale: [1, 1.08, 1] } : undefined}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <span style={{ fontSize: imageSize * 0.45 }}>{alert.emoji}</span>
                </motion.div>
              )}

              {/* Text content */}
              <div className="text-center relative z-10">
                <motion.p
                  className="truncate max-w-[500px]"
                  style={{
                    fontSize: `${fontSize}px`,
                    fontWeight,
                    color: `hsl(${textColor})`,
                    textShadow: `0 2px 12px rgba(0,0,0,0.8), 0 0 ${20 * glowIntensity}px hsl(${glowColor} / ${0.3 * glowIntensity})`,
                    letterSpacing: "-0.02em",
                  }}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  {alert.user}
                </motion.p>

                <motion.p
                  className="mt-1 font-semibold"
                  style={{
                    fontSize: `${Math.max(fontSize * 0.55, 13)}px`,
                    color: `hsl(${textColor} / 0.55)`,
                    textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                  }}
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  sent a gift!
                </motion.p>

                <motion.p
                  className="mt-2 font-bold"
                  style={{
                    fontSize: `${Math.max(fontSize * 0.8, 18)}px`,
                    color: `hsl(${accentColor})`,
                    textShadow: `0 0 ${16 * glowIntensity}px hsl(${glowColor} / ${0.5 * glowIntensity})`,
                  }}
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {alert.gift}
                </motion.p>

                {/* Message bubble */}
                {alert.message && (
                  <motion.p
                    className="mt-3 italic max-w-[450px] mx-auto px-5 py-1.5 rounded-full"
                    style={{
                      fontSize: `${Math.max(fontSize * 0.7, 15)}px`,
                      color: `hsl(${textColor} / 0.9)`,
                      background: "rgba(0,0,0,0.4)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    "{alert.message}"
                  </motion.p>
                )}

                {/* Combo counter */}
                {alert.count > 1 && (
                  <motion.p
                    key={alert.count}
                    className="mt-3 tracking-tight"
                    style={{
                      fontSize: `${Math.max(fontSize * 1.6, 36)}px`,
                      fontWeight: 900,
                      color: "hsl(45 100% 60%)",
                      textShadow: "0 0 20px hsl(45 100% 55% / 0.6), 0 0 40px hsl(45 100% 55% / 0.3)",
                    }}
                    initial={{ scale: 2.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    ×{alert.count}
                  </motion.p>
                )}

                {/* Coin value */}
                {alert.value > 0 && (
                  <motion.p
                    className="mt-2 font-medium"
                    style={{
                      fontSize: `${Math.max(fontSize * 0.5, 12)}px`,
                      color: `hsl(${textColor} / 0.45)`,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    🪙 {alert.value}
                  </motion.p>
                )}
              </div>

              {/* Sparkle particles for high-value gifts */}
              {isHighValue && [...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full"
                  style={{ background: `hsl(${glowColor})`, top: "40%", left: "50%" }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: Math.cos((i * 45) * Math.PI / 180) * (80 + Math.random() * 40),
                    y: Math.sin((i * 45) * Math.PI / 180) * (80 + Math.random() * 40),
                    opacity: 0,
                    scale: 0,
                  }}
                  transition={{ duration: 1 + Math.random() * 0.5, delay: 0.1 + i * 0.05, ease: "easeOut" }}
                />
              ))}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default GiftAlertRenderer;
