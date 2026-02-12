import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { defaultGiftComboSettings } from "@/hooks/overlay-defaults";
import useOverlayBody from "@/hooks/use-overlay-body";

interface ComboState {
  count: number;
  user: string;
  gift: string;
  emoji: string;
  tier: number;
  active: boolean;
}

const GiftComboRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const [settings, setSettings] = useState(defaultGiftComboSettings);
  const [combo, setCombo] = useState<ComboState>({ count: 0, user: "", gift: "", emoji: "", tier: 0, active: false });
  const [connected, setConnected] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    if (!publicToken) return;
    supabase.from("overlay_widgets" as any).select("settings").eq("public_token", publicToken).single()
      .then(({ data }) => { if (data) setSettings({ ...defaultGiftComboSettings, ...(data as any).settings }); });
  }, [publicToken]);

  useEffect(() => {
    if (!publicToken) return;
    const ch = supabase.channel(`gift_combo-${publicToken}`)
      .on("broadcast", { event: "combo_update" }, (msg) => {
        const p = msg.payload as any;
        setCombo(prev => {
          const newCount = (prev.user === p.user && prev.active) ? prev.count + (p.count || 1) : (p.count || 1);
          const tiers = settings.escalation_tiers || [5, 10, 25, 50, 100];
          const tier = tiers.filter((t: number) => newCount >= t).length;
          return { count: newCount, user: p.user || prev.user, gift: p.gift || prev.gift, emoji: p.emoji || "🎁", tier, active: true };
        });
        if (settings.particle_burst) {
          const newParticles = Array.from({ length: 8 }, (_, i) => ({
            id: Date.now() + i, x: Math.random() * 200 - 100, y: Math.random() * -150 - 50,
          }));
          setParticles(prev => [...prev, ...newParticles]);
          setTimeout(() => setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id))), 1000);
        }
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setCombo(prev => ({ ...prev, active: false })), (settings.combo_timeout || 5) * 1000);
      })
      .on("broadcast", { event: "test_alert" }, () => {
        setCombo({ count: 15, user: "TestUser", gift: "Rose", emoji: "🌹", tier: 2, active: true });
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setCombo(prev => ({ ...prev, active: false })), 5000);
      })
      .subscribe(s => setConnected(s === "SUBSCRIBED"));

    const db = supabase.channel(`combo-db-${publicToken}`)
      .on("postgres_changes" as any, { event: "UPDATE", schema: "public", table: "overlay_widgets", filter: `public_token=eq.${publicToken}` },
        (p: any) => { if (p.new?.settings) setSettings({ ...defaultGiftComboSettings, ...p.new.settings }); })
      .subscribe();
    return () => { supabase.removeChannel(ch); supabase.removeChannel(db); if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [publicToken, settings.combo_timeout, settings.particle_burst, settings.escalation_tiers]);

  const tierColors = settings.tier_colors || ["160 100% 45%", "45 100% 55%", "350 90% 55%", "280 100% 65%", "0 100% 60%"];
  const currentColor = tierColors[Math.min(combo.tier, tierColors.length - 1)] || settings.accent_color;
  const glow = (settings.glow_intensity || 70) / 100;
  const fontSize = settings.font_size || 56;

  return (
    <div className={`w-screen h-screen overflow-hidden flex items-center justify-center ${settings.transparent_bg ? "bg-transparent" : "bg-black"}`}>
      <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-20">
        <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
      </div>

      <AnimatePresence>
        {combo.active && combo.count >= (settings.min_combo || 2) && (
          <motion.div
            key="combo"
            className="absolute flex flex-col items-center"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0, y: -30 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {/* Pulsing glow ring */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: fontSize * 3, height: fontSize * 3,
                background: `radial-gradient(circle, hsl(${currentColor} / ${0.15 * glow}), transparent 70%)`,
              }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />

            {/* Gift emoji */}
            {settings.show_gift_icon && (
              <motion.div
                className="mb-2"
                animate={settings.screen_shake ? { x: [0, -3, 3, -2, 0], y: [0, -2, 1, -1, 0] } : {}}
                transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 0.5 }}
              >
                <span style={{ fontSize: fontSize * 0.7 }}>{combo.emoji}</span>
              </motion.div>
            )}

            {/* Combo counter */}
            <motion.div
              className="flex items-center gap-2"
              key={combo.count}
              initial={{ scale: 1.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500 }}
            >
              <span
                className={`font-black tabular-nums ${settings.font_family === "mono" ? "font-mono" : "font-heading"}`}
                style={{
                  fontSize, color: `hsl(${currentColor})`,
                  textShadow: `0 0 ${20 * glow}px hsl(${currentColor} / 0.5), 0 0 ${40 * glow}px hsl(${currentColor} / 0.3)`,
                }}
              >
                {combo.count}
              </span>
              {settings.show_multiplier && (
                <motion.span
                  className="font-black"
                  style={{ fontSize: fontSize * 0.5, color: `hsl(${currentColor} / 0.7)` }}
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                >
                  ×COMBO
                </motion.span>
              )}
            </motion.div>

            {/* Username */}
            <p className="text-white/70 text-sm font-medium mt-1">{combo.user}</p>

            {/* Tier badge */}
            {combo.tier > 0 && (
              <motion.div
                className="mt-2 px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  background: `hsl(${currentColor} / 0.15)`,
                  color: `hsl(${currentColor})`,
                  border: `1px solid hsl(${currentColor} / 0.3)`,
                }}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                {combo.tier >= 4 ? "🔥 LEGENDARY" : combo.tier >= 3 ? "⚡ EPIC" : combo.tier >= 2 ? "💎 SUPER" : "✨ COMBO"}
              </motion.div>
            )}

            {/* Particles */}
            {particles.map(p => (
              <motion.div
                key={p.id}
                className="absolute w-2 h-2 rounded-full"
                style={{ background: `hsl(${currentColor})` }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: p.x, y: p.y, opacity: 0, scale: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {settings.custom_css && <style dangerouslySetInnerHTML={{ __html: settings.custom_css }} />}
    </div>
  );
};

export default GiftComboRenderer;
