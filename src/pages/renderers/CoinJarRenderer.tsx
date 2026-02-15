import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import useOverlayBody from "@/hooks/use-overlay-body";

const GIFT_EMOJIS = ["🌹", "💎", "🦁", "🐉", "⭐", "🎁", "💖", "🔥", "🌟", "🦋"];

interface JarGift {
  id: number;
  emoji: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
}

const defaultSettings = {
  jar_style: "glass",
  target_coins: 5000,
  fill_animation: "bounce",
  show_gift_icons: true,
  show_sender: true,
  show_total: true,
  glow_intensity: 50,
  completion_effect: "confetti",
  transparent_bg: true,
  custom_css: "",
};

const CoinJarRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const [settings, setSettings] = useState(defaultSettings);
  const [gifts, setGifts] = useState<JarGift[]>([]);
  const [totalCoins, setTotalCoins] = useState(0);
  const [lastSender, setLastSender] = useState<{ name: string; coins: number; emoji: string } | null>(null);
  const [connected, setConnected] = useState(false);
  const nextId = useRef(0);

  // Load settings
  useEffect(() => {
    if (!publicToken) return;
    supabase.from("overlay_widgets" as any).select("settings").eq("public_token", publicToken).maybeSingle()
      .then(({ data }) => { if (data) setSettings({ ...defaultSettings, ...(data as any).settings }); });
  }, [publicToken]);

  // Subscribe to events
  useEffect(() => {
    if (!publicToken) return;

    const addGiftToJar = (emoji: string, coins: number, sender: string) => {
      const id = nextId.current++;
      const fillLevel = Math.min(gifts.length / 40, 1);
      const minY = 85 - fillLevel * 55;

      setGifts(prev => {
        const next = [...prev, {
          id, emoji,
          x: 20 + Math.random() * 60,
          y: minY + Math.random() * (85 - minY) * 0.3,
          size: 14 + Math.random() * 14,
          rotation: Math.random() * 40 - 20,
        }];
        return next.slice(-50);
      });

      setTotalCoins(prev => prev + coins);
      setLastSender({ name: sender, coins, emoji });
    };

    const ch = supabase.channel(`coin-jar-${publicToken}`)
      .on("broadcast", { event: "gift" }, (msg) => {
        const p = msg.payload;
        if (!p) return;
        const emoji = GIFT_EMOJIS[Math.floor(Math.random() * GIFT_EMOJIS.length)];
        addGiftToJar(emoji, p.coinValue || p.diamondCount || 1, p.username || "Viewer");
      })
      .on("broadcast", { event: "test_alert" }, () => {
        addGiftToJar("🌹", 10, "TestUser");
      })
      .subscribe(s => setConnected(s === "SUBSCRIBED"));

    const db = supabase.channel(`coin-jar-db-${publicToken}`)
      .on("postgres_changes" as any, {
        event: "UPDATE", schema: "public", table: "overlay_widgets",
        filter: `public_token=eq.${publicToken}`,
      }, (p: any) => {
        if (p.new?.settings) setSettings({ ...defaultSettings, ...p.new.settings });
      })
      .subscribe();

    return () => { supabase.removeChannel(ch); supabase.removeChannel(db); };
  }, [publicToken, gifts.length]);

  // Clear last sender
  useEffect(() => {
    if (!lastSender) return;
    const t = setTimeout(() => setLastSender(null), 4000);
    return () => clearTimeout(t);
  }, [lastSender]);

  const target = settings.target_coins || 5000;
  const fillPercent = Math.min((totalCoins / target) * 100, 100);
  const glowInt = (settings.glow_intensity || 50) / 100;

  const jarBorderColor = settings.jar_style === "gold"
    ? "rgba(255,200,50,0.2)"
    : settings.jar_style === "neon"
    ? "rgba(0,255,180,0.25)"
    : settings.jar_style === "crystal"
    ? "rgba(140,180,255,0.2)"
    : "rgba(255,255,255,0.12)";

  const liquidColor = settings.jar_style === "gold"
    ? "45 100% 55%"
    : settings.jar_style === "neon"
    ? "160 100% 50%"
    : settings.jar_style === "crystal"
    ? "220 100% 65%"
    : "280 100% 65%";

  return (
    <div className={`w-screen h-screen overflow-hidden flex flex-col items-center justify-center ${settings.transparent_bg ? "bg-transparent" : "bg-black"}`}>
      <div className="absolute top-2 right-2 opacity-20">
        <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
      </div>

      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[300px] h-[300px] rounded-full"
          style={{ background: `radial-gradient(circle, hsl(${liquidColor} / ${glowInt * 0.15}), transparent 70%)` }} />
      </div>

      {/* Jar */}
      <div className="relative w-[220px] h-[280px]">
        {/* Jar body */}
        <div className="absolute inset-x-3 top-[34px] bottom-0 rounded-b-[36px] rounded-t-[6px] overflow-hidden"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
            border: `2px solid ${jarBorderColor}`,
            boxShadow: `inset 0 0 30px rgba(255,255,255,0.03), 0 0 40px hsl(${liquidColor} / ${glowInt * 0.1})`,
          }}>

          {/* Liquid fill */}
          <motion.div
            className="absolute bottom-0 left-0 right-0"
            animate={{ height: `${fillPercent}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              background: `linear-gradient(180deg, hsl(${liquidColor} / 0.12) 0%, hsl(${liquidColor} / 0.3) 100%)`,
              borderTop: `1px solid hsl(${liquidColor} / 0.25)`,
            }}
          >
            <motion.div
              className="absolute inset-0"
              animate={{ x: [-30, 30, -30] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              style={{ background: `linear-gradient(90deg, transparent, hsl(${liquidColor} / 0.08), transparent)` }}
            />
          </motion.div>

          {/* Gifts */}
          {settings.show_gift_icons && (
            <AnimatePresence>
              {gifts.map(gift => (
                <motion.span
                  key={gift.id}
                  initial={{ y: -60, opacity: 0, scale: 0.2 }}
                  animate={{ y: 0, opacity: 1, scale: 1, rotate: gift.rotation }}
                  exit={{ opacity: 0 }}
                  transition={
                    settings.fill_animation === "bounce"
                      ? { type: "spring", damping: 10, stiffness: 180 }
                      : settings.fill_animation === "spiral"
                      ? { type: "spring", damping: 15, stiffness: 100 }
                      : { duration: 0.6, ease: "easeOut" }
                  }
                  className="absolute pointer-events-none"
                  style={{
                    left: `${gift.x}%`,
                    top: `${gift.y}%`,
                    fontSize: gift.size,
                    transform: "translate(-50%, -50%)",
                    filter: `drop-shadow(0 0 6px hsl(${liquidColor} / 0.4))`,
                  }}
                >
                  {gift.emoji}
                </motion.span>
              ))}
            </AnimatePresence>
          )}

          {/* Glass reflection */}
          <div className="absolute top-0 left-1 w-[25%] h-full opacity-[0.06] rounded-bl-[36px]"
            style={{ background: "linear-gradient(135deg, white 0%, transparent 60%)" }} />
        </div>

        {/* Jar lid */}
        <div className="absolute top-0 left-0 right-0 h-[38px]">
          <div className="absolute inset-x-[-4px] top-[12px] h-[26px] rounded-t-[8px]"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.05))",
              border: `2px solid ${jarBorderColor}`,
              borderBottom: "none",
            }} />
          <div className="absolute inset-x-[-10px] top-[6px] h-[14px] rounded-[5px]"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0.04))",
              border: `1px solid ${jarBorderColor}`,
            }} />
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[28px] h-[10px] rounded-t-full"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.06))",
              border: `1px solid ${jarBorderColor}`,
              borderBottom: "none",
            }} />
        </div>
      </div>

      {/* Coin total */}
      {settings.show_total && (
        <motion.div
          className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: `0 0 20px hsl(${liquidColor} / 0.06)`,
          }}
          animate={{ scale: lastSender ? [1, 1.1, 1] : 1 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-lg">🪙</span>
          <motion.span
            className="text-lg font-bold font-heading"
            style={{ color: "hsl(45 100% 65%)" }}
            key={totalCoins}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            {totalCoins.toLocaleString()}
          </motion.span>
          <span className="text-xs text-white/30">/ {target.toLocaleString()}</span>
        </motion.div>
      )}

      {/* Last sender */}
      <AnimatePresence>
        {lastSender && settings.show_sender && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.9 }}
            className="mt-2 flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              background: `hsl(${liquidColor} / 0.1)`,
              border: `1px solid hsl(${liquidColor} / 0.18)`,
            }}
          >
            <span className="text-sm">{lastSender.emoji}</span>
            <span className="text-xs text-white/70 font-medium">{lastSender.name}</span>
            <span className="text-xs font-bold" style={{ color: "hsl(45 100% 65%)" }}>+{lastSender.coins}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {settings.custom_css && <style dangerouslySetInnerHTML={{ __html: settings.custom_css }} />}
    </div>
  );
};

export default CoinJarRenderer;
