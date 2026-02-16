import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { defaultGiftFireworkSettings } from "@/hooks/overlay-defaults";
import useOverlayBody from "@/hooks/use-overlay-body";

const GiftFireworkRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const [settings, setSettings] = useState(defaultGiftFireworkSettings);
  const [connected, setConnected] = useState(false);
  const [fireworks, setFireworks] = useState<{ id: number; username: string; x: number; y: number }[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    if (!publicToken) return;
    supabase.from("overlay_widgets" as any).select("settings").eq("public_token", publicToken).maybeSingle()
      .then(({ data }) => { if (data) setSettings({ ...defaultGiftFireworkSettings, ...(data as any).settings }); });
  }, [publicToken]);

  useEffect(() => {
    if (!publicToken) return;
    const ch = supabase.channel(`gift-firework-${publicToken}`)
      .on("broadcast", { event: "gift_firework" }, (msg) => {
        triggerFirework(msg.payload?.username || "Viewer");
      })
      .on("broadcast", { event: "test_alert" }, () => triggerFirework("TestUser"))
      .subscribe(s => setConnected(s === "SUBSCRIBED"));
    const db = supabase.channel(`gift-firework-db-${publicToken}`)
      .on("postgres_changes" as any, { event: "UPDATE", schema: "public", table: "overlay_widgets", filter: `public_token=eq.${publicToken}` },
        (p: any) => { if (p.new?.settings) setSettings({ ...defaultGiftFireworkSettings, ...p.new.settings }); })
      .subscribe();
    return () => { supabase.removeChannel(ch); supabase.removeChannel(db); };
  }, [publicToken]);

  const triggerFirework = (username: string) => {
    idRef.current++;
    const fw = {
      id: idRef.current,
      username,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 40,
    };
    setFireworks(prev => [...prev, fw]);
    setTimeout(() => setFireworks(prev => prev.filter(f => f.id !== fw.id)), (settings.duration || 3) * 1000);
  };

  const colors = settings.particle_colors || ["45 100% 55%", "280 100% 65%", "160 100% 45%", "350 90% 55%"];
  const particleCount = settings.particle_count || 20;

  return (
    <div className={`w-screen h-screen overflow-hidden relative ${settings.transparent_bg ? "bg-transparent" : "bg-black"}`}>
      <div className="absolute top-2 right-2 opacity-20"><div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} /></div>
      <AnimatePresence>
        {fireworks.map(fw => (
          <div key={fw.id} className="absolute" style={{ left: `${fw.x}%`, top: `${fw.y}%`, transform: "translate(-50%, -50%)" }}>
            {/* Center flash */}
            <motion.div
              className="absolute w-6 h-6 rounded-full -translate-x-1/2 -translate-y-1/2"
              style={{ background: `hsl(${colors[0]})`, boxShadow: `0 0 40px hsl(${colors[0]} / 0.6)` }}
              initial={{ scale: 0 }}
              animate={{ scale: [0, 3, 0], opacity: [1, 0.6, 0] }}
              transition={{ duration: 0.6 }}
            />
            {/* Particles */}
            {[...Array(particleCount)].map((_, i) => {
              const angle = (i / particleCount) * Math.PI * 2;
              const dist = (settings.explosion_radius || 80) + Math.random() * 40;
              const c = colors[i % colors.length];
              return (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{ background: `hsl(${c})`, boxShadow: `0 0 8px hsl(${c} / 0.5)` }}
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{
                    x: Math.cos(angle) * dist,
                    y: Math.sin(angle) * dist + (settings.gravity ? 30 : 0),
                    opacity: 0,
                    scale: [1, 0.5, 0],
                  }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.015 }}
                />
              );
            })}
            {/* Username */}
            {settings.show_username && (
              <motion.div
                className="absolute whitespace-nowrap"
                style={{ top: 30 }}
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -10] }}
                transition={{ duration: 2.5, times: [0, 0.15, 0.7, 1] }}
              >
                <span className="text-sm font-bold text-white px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/[0.06]"
                  style={{ textShadow: `0 0 10px hsl(${colors[0]} / 0.4)` }}>
                  ✨ {fw.username}
                </span>
              </motion.div>
            )}
          </div>
        ))}
      </AnimatePresence>
      
    </div>
  );
};

export default GiftFireworkRenderer;
