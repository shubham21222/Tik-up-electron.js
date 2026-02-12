import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import useOverlayBody from "@/hooks/use-overlay-body";
import tikupLogo from "@/assets/tikup_logo.png";

const defaults = {
  logo_size: 140,
  tagline: "Follow for more!",
  handle: "@tikup",
  show_handle: true,
  accent_color: "160 100% 45%",
  glow_intensity: 60,
  animation_style: "pulse",
  show_rings: false,
  transparent_bg: true,
  custom_css: "",
};

const PromoOverlayRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const [settings, setSettings] = useState(defaults);

  useEffect(() => {
    if (!publicToken) return;
    supabase.from("overlay_widgets" as any).select("settings").eq("public_token", publicToken).single()
      .then(({ data }) => { if (data) setSettings({ ...defaults, ...(data as any).settings }); });
  }, [publicToken]);

  useEffect(() => {
    if (!publicToken) return;
    const ch = supabase.channel(`promo-db-${publicToken}`)
      .on("postgres_changes" as any, { event: "UPDATE", schema: "public", table: "overlay_widgets", filter: `public_token=eq.${publicToken}` },
        (p: any) => { if (p.new?.settings) setSettings({ ...defaults, ...p.new.settings }); })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [publicToken]);

  const s = settings;
  const accent = s.accent_color;
  const glow = s.glow_intensity / 100;
  const logoSize = s.logo_size;

  return (
    <div className={`w-screen h-screen overflow-hidden flex items-center justify-center ${s.transparent_bg ? "bg-transparent" : "bg-black"}`}>
      {/* Banner card — wide rectangle */}
      <motion.div
        className="relative flex flex-col items-center gap-5 rounded-3xl overflow-hidden"
        style={{
          width: "min(90vw, 600px)",
          padding: "48px 40px",
          background: "linear-gradient(145deg, rgba(12,16,22,0.96), rgba(6,10,16,0.98))",
          border: `2px solid hsl(${accent} / 0.2)`,
          boxShadow: `0 0 ${40 * glow}px hsl(${accent} / 0.1), 0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)`,
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[50%] h-[2px]"
          style={{ background: `linear-gradient(90deg, transparent, hsl(${accent} / 0.5), transparent)` }} />

        {/* Logo */}
        <motion.div
          className="rounded-full flex items-center justify-center overflow-hidden"
          style={{
            width: logoSize, height: logoSize,
            background: `linear-gradient(135deg, hsl(${accent} / 0.18), hsl(${accent} / 0.04))`,
            border: `3px solid hsl(${accent} / 0.35)`,
            boxShadow: `0 0 ${30 * glow}px hsl(${accent} / 0.2), 0 0 ${80 * glow}px hsl(${accent} / 0.08)`,
          }}
          animate={
            s.animation_style === "pulse"
              ? { scale: [1, 1.04, 1], boxShadow: [
                  `0 0 ${25 * glow}px hsl(${accent} / 0.15)`,
                  `0 0 ${50 * glow}px hsl(${accent} / 0.3)`,
                  `0 0 ${25 * glow}px hsl(${accent} / 0.15)`,
                ] }
              : s.animation_style === "rotate"
              ? { rotate: [0, 360] }
              : { y: [0, -6, 0] }
          }
          transition={{ duration: s.animation_style === "rotate" ? 8 : 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <img src={tikupLogo} alt="TikUp" style={{ width: "62%", height: "62%", objectFit: "contain" }} />
        </motion.div>

        {/* Tagline */}
        <motion.p
          className="text-2xl font-bold text-white text-center tracking-tight"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {s.tagline}
        </motion.p>

        {/* Handle */}
        {s.show_handle && (
          <motion.p
            className="text-lg font-semibold text-center tracking-wider"
            style={{ color: `hsl(${accent})` }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            {s.handle}
          </motion.p>
        )}

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[35%] h-[2px]"
          style={{ background: `linear-gradient(90deg, transparent, hsl(${accent} / 0.4), transparent)` }} />
      </motion.div>

      {settings.custom_css && <style dangerouslySetInnerHTML={{ __html: settings.custom_css }} />}
    </div>
  );
};

export default PromoOverlayRenderer;
