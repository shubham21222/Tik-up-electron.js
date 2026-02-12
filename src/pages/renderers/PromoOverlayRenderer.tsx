import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import useOverlayBody from "@/hooks/use-overlay-body";
import tikupLogo from "@/assets/tikup_logo.png";

const defaults = {
  logo_size: 120,
  tagline: "Follow for more!",
  handle: "@yourtiktok",
  show_handle: true,
  accent_color: "160 100% 45%",
  glow_intensity: 60,
  animation_style: "pulse",
  show_rings: true,
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
  const glow = (s.glow_intensity) / 100;
  const logoSize = s.logo_size;

  return (
    <div className={`w-screen h-screen overflow-hidden flex items-center justify-center ${s.transparent_bg ? "bg-transparent" : "bg-black"}`}>
      {/* Rings */}
      {s.show_rings && (
        <>
          <motion.div
            className="absolute rounded-full"
            style={{ width: logoSize * 2.2, height: logoSize * 2.2, border: `2px solid hsl(${accent} / 0.15)`, boxShadow: `0 0 ${40 * glow}px hsl(${accent} / 0.1)` }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute rounded-full"
            style={{ width: logoSize * 2.8, height: logoSize * 2.8, border: `1px solid hsl(${accent} / 0.08)` }}
            animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
          <motion.div
            className="absolute rounded-full"
            style={{ width: logoSize * 3.5, height: logoSize * 3.5, border: `1px solid hsl(${accent} / 0.04)` }}
            animate={{ scale: [1, 1.03, 1], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </>
      )}

      <div className="flex flex-col items-center gap-5 relative z-10">
        {/* Logo */}
        <motion.div
          className="rounded-full flex items-center justify-center overflow-hidden"
          style={{
            width: logoSize, height: logoSize,
            background: `linear-gradient(135deg, hsl(${accent} / 0.2), hsl(${accent} / 0.05))`,
            border: `3px solid hsl(${accent} / 0.4)`,
            boxShadow: `0 0 ${30 * glow}px hsl(${accent} / 0.25), 0 0 ${80 * glow}px hsl(${accent} / 0.1)`,
          }}
          animate={
            s.animation_style === "pulse"
              ? { scale: [1, 1.06, 1], boxShadow: [
                  `0 0 ${25 * glow}px hsl(${accent} / 0.2)`,
                  `0 0 ${50 * glow}px hsl(${accent} / 0.35)`,
                  `0 0 ${25 * glow}px hsl(${accent} / 0.2)`,
                ] }
              : s.animation_style === "rotate"
              ? { rotate: [0, 360] }
              : { y: [0, -8, 0] }
          }
          transition={{ duration: s.animation_style === "rotate" ? 8 : 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <img src={tikupLogo} alt="TikUp" style={{ width: "65%", height: "65%", objectFit: "contain" }} />
        </motion.div>

        {/* Tagline */}
        <motion.p
          className="text-xl font-bold text-white text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {s.tagline}
        </motion.p>

        {/* Handle */}
        {s.show_handle && (
          <motion.p
            className="text-base font-medium text-center"
            style={{ color: `hsl(${accent})` }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {s.handle}
          </motion.p>
        )}
      </div>

      {settings.custom_css && <style dangerouslySetInnerHTML={{ __html: settings.custom_css }} />}
    </div>
  );
};

export default PromoOverlayRenderer;
