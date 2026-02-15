import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import useOverlayBody from "@/hooks/use-overlay-body";

const GIFT_IMAGES = [
  "/gifts/rose.png",
  "/gifts/flame_heart.png",
  "/gifts/fluffy_heart.png",
  "/gifts/morning_bloom.png",
  "/gifts/wink_wink.png",
  "/gifts/youre_awesome.png",
  "/gifts/blow_a_kiss.png",
  "/gifts/love_you_so_much.png",
];

interface JarGift {
  id: number;
  img: string;
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

const STYLE_COLORS: Record<string, { border: string; liquid: string; glow: string }> = {
  glass:   { border: "rgba(255,255,255,0.12)", liquid: "45 70% 55%",  glow: "45 80% 60%" },
  crystal: { border: "rgba(140,200,255,0.15)", liquid: "210 80% 65%", glow: "210 80% 65%" },
  neon:    { border: "rgba(0,255,180,0.18)",   liquid: "160 100% 50%", glow: "160 100% 50%" },
  gold:    { border: "rgba(255,200,50,0.18)",  liquid: "45 100% 55%", glow: "45 100% 55%" },
};

const CoinJarRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const [settings, setSettings] = useState(defaultSettings);
  const [gifts, setGifts] = useState<JarGift[]>([]);
  const [totalCoins, setTotalCoins] = useState(0);
  const [lastSender, setLastSender] = useState<{ name: string; coins: number; img: string } | null>(null);
  const [connected, setConnected] = useState(false);
  const nextId = useRef(0);

  useEffect(() => {
    if (!publicToken) return;
    supabase.from("overlay_widgets" as any).select("settings").eq("public_token", publicToken).maybeSingle()
      .then(({ data }) => { if (data) setSettings({ ...defaultSettings, ...(data as any).settings }); });
  }, [publicToken]);

  useEffect(() => {
    if (!publicToken) return;

    const addGiftToJar = (img: string, coins: number, sender: string) => {
      const id = nextId.current++;
      setGifts(prev => {
        const fillLevel = Math.min(prev.length / 40, 1);
        const maxY = 82;
        const minY = maxY - fillLevel * 52;
        const next = [...prev, {
          id, img,
          x: 18 + Math.random() * 64,
          y: minY + Math.random() * (maxY - minY) * 0.35,
          size: 20 + Math.random() * 18,
          rotation: Math.random() * 30 - 15,
        }];
        return next.slice(-50);
      });
      setTotalCoins(prev => prev + coins);
      setLastSender({ name: sender, coins, img });
    };

    const ch = supabase.channel(`coin-jar-${publicToken}`)
      .on("broadcast", { event: "gift" }, (msg) => {
        const p = msg.payload;
        if (!p) return;
        // Use actual gift image if available, else random from our set
        const img = p.giftPictureUrl || GIFT_IMAGES[Math.floor(Math.random() * GIFT_IMAGES.length)];
        addGiftToJar(img, p.coinValue || p.diamondCount || 1, p.username || "Viewer");
      })
      .on("broadcast", { event: "test_alert" }, () => {
        addGiftToJar(GIFT_IMAGES[Math.floor(Math.random() * GIFT_IMAGES.length)], 10, "TestUser");
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
  }, [publicToken]);

  useEffect(() => {
    if (!lastSender) return;
    const t = setTimeout(() => setLastSender(null), 4000);
    return () => clearTimeout(t);
  }, [lastSender]);

  const target = settings.target_coins || 5000;
  const fillPercent = Math.min((totalCoins / target) * 100, 100);
  const glowInt = (settings.glow_intensity || 50) / 100;
  const style = STYLE_COLORS[settings.jar_style] || STYLE_COLORS.glass;

  return (
    <div className={`w-screen h-screen overflow-hidden flex flex-col items-center justify-center ${settings.transparent_bg ? "bg-transparent" : "bg-black"}`}>
      <div className="absolute top-2 right-2 opacity-20">
        <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
      </div>

      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[280px] h-[280px] rounded-full"
          style={{ background: `radial-gradient(circle, hsl(${style.glow} / ${glowInt * 0.12}), transparent 70%)` }} />
      </div>

      {/* Jar */}
      <div className="relative w-[220px] h-[280px]">
        {/* Jar body */}
        <div className="absolute inset-x-3 top-[34px] bottom-0 rounded-b-[32px] rounded-t-[5px] overflow-hidden"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
            border: `1.5px solid ${style.border}`,
            boxShadow: `inset 0 0 20px rgba(255,255,255,0.03), 0 4px 30px rgba(0,0,0,0.3)`,
          }}>

          {/* Liquid */}
          <motion.div
            className="absolute bottom-0 left-0 right-0"
            animate={{ height: `${fillPercent}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              background: `linear-gradient(180deg, hsl(${style.liquid} / 0.08) 0%, hsl(${style.liquid} / 0.2) 100%)`,
              borderTop: `1px solid hsl(${style.liquid} / 0.18)`,
            }}
          >
            <motion.div
              className="absolute inset-0"
              animate={{ x: [-25, 25, -25] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{ background: `linear-gradient(90deg, transparent, hsl(${style.liquid} / 0.06), transparent)` }}
            />
          </motion.div>

          {/* Gifts */}
          {settings.show_gift_icons && (
            <AnimatePresence>
              {gifts.map(gift => (
                <motion.img
                  key={gift.id}
                  src={gift.img}
                  initial={{ y: -50, opacity: 0, scale: 0.2 }}
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
                    width: gift.size,
                    height: gift.size,
                    objectFit: "contain",
                    transform: "translate(-50%, -50%)",
                    filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.4))",
                  }}
                  draggable={false}
                />
              ))}
            </AnimatePresence>
          )}

          {/* Glass highlights */}
          <div className="absolute top-0 left-1 w-[25%] h-full opacity-[0.06] rounded-bl-[32px]"
            style={{ background: "linear-gradient(135deg, white 0%, transparent 50%)" }} />
          <div className="absolute top-[8%] right-[3px] w-[10%] h-[50%] opacity-[0.03] rounded-r-[28px]"
            style={{ background: "linear-gradient(180deg, white, transparent)" }} />
        </div>

        {/* Jar lid */}
        <div className="absolute top-0 left-0 right-0 h-[38px]">
          <div className="absolute inset-x-[-4px] top-[12px] h-[26px] rounded-t-[7px]"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
              border: `1.5px solid ${style.border}`,
              borderBottom: "none",
            }} />
          <div className="absolute inset-x-[-10px] top-[6px] h-[14px] rounded-[5px]"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0.04))",
              border: `1px solid ${style.border}`,
            }} />
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[26px] h-[10px] rounded-t-full"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))",
              border: `1px solid ${style.border}`,
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
          }}
          animate={{ scale: lastSender ? [1, 1.08, 1] : 1 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-lg">🪙</span>
          <motion.span
            className="text-lg font-bold font-heading"
            style={{ color: "hsl(45 100% 65%)" }}
            key={totalCoins}
            initial={{ y: -8, opacity: 0 }}
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
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.9 }}
            className="mt-2 flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span className="text-xs text-white/60 font-medium">{lastSender.name}</span>
            <span className="text-xs font-bold" style={{ color: "hsl(160 100% 50%)" }}>+{lastSender.coins}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {settings.custom_css && <style dangerouslySetInnerHTML={{ __html: settings.custom_css }} />}
    </div>
  );
};

export default CoinJarRenderer;
