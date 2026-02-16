import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { defaultSocialRotatorSettings } from "@/hooks/overlay-defaults";
import useOverlayBody from "@/hooks/use-overlay-body";

const defaultSocials = [
  { icon: "📺", label: "YouTube", handle: "@streamer", color: "0 100% 50%" },
  { icon: "📸", label: "Instagram", handle: "@streamer", color: "330 80% 55%" },
  { icon: "🎵", label: "TikTok", handle: "@streamer", color: "180 100% 45%" },
  { icon: "🐦", label: "Twitter", handle: "@streamer", color: "200 100% 55%" },
  { icon: "💬", label: "Discord", handle: "discord.gg/stream", color: "235 86% 65%" },
];

const SocialRotatorRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const [settings, setSettings] = useState(defaultSocialRotatorSettings);
  const [index, setIndex] = useState(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!publicToken) return;
    supabase.from("overlay_widgets" as any).select("settings").eq("public_token", publicToken).maybeSingle()
      .then(({ data }) => { if (data) setSettings({ ...defaultSocialRotatorSettings, ...(data as any).settings }); });
  }, [publicToken]);

  useEffect(() => {
    if (!publicToken) return;
    const db = supabase.channel(`social-rotator-db-${publicToken}`)
      .on("postgres_changes" as any, { event: "UPDATE", schema: "public", table: "overlay_widgets", filter: `public_token=eq.${publicToken}` },
        (p: any) => { if (p.new?.settings) setSettings({ ...defaultSocialRotatorSettings, ...p.new.settings }); })
      .subscribe(s => setConnected(s === "SUBSCRIBED"));
    return () => { supabase.removeChannel(db); };
  }, [publicToken]);

  const socials = settings.social_links?.length ? settings.social_links : defaultSocials;

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % socials.length);
    }, (settings.rotation_speed || 4) * 1000);
    return () => clearInterval(interval);
  }, [socials.length, settings.rotation_speed]);

  const social = socials[index];
  const fontSize = settings.font_size || 16;

  return (
    <div className={`w-screen h-screen overflow-hidden flex items-center justify-center ${settings.transparent_bg ? "bg-transparent" : "bg-black"}`}>
      <div className="absolute top-2 right-2 opacity-20"><div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} /></div>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ rotateY: 90, opacity: 0, scale: 0.8 }}
          animate={{ rotateY: 0, opacity: 1, scale: 1 }}
          exit={{ rotateY: -90, opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex items-center gap-4 px-6 py-4 rounded-2xl"
          style={{
            background: settings.glass_bg ? "rgba(0,0,0,0.6)" : "transparent",
            backdropFilter: settings.glass_bg ? "blur(20px)" : "none",
            border: settings.glass_bg ? "1px solid rgba(255,255,255,0.08)" : "none",
            boxShadow: settings.glow_intensity > 0 ? `0 0 ${settings.glow_intensity}px hsl(${social.color || "160 100% 45%"} / 0.2)` : "none",
          }}
        >
          <motion.div
            className="flex items-center justify-center rounded-xl"
            style={{
              width: settings.icon_size || 48,
              height: settings.icon_size || 48,
              fontSize: (settings.icon_size || 48) * 0.5,
              background: `hsl(${social.color || "160 100% 45%"} / 0.15)`,
              boxShadow: `0 0 15px hsl(${social.color || "160 100% 45%"} / 0.2)`,
            }}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {social.icon}
          </motion.div>
          <div>
            <p className="font-bold text-white" style={{ fontSize }}>{social.label}</p>
            <p className="font-medium" style={{ fontSize: fontSize * 0.75, color: `hsl(${social.color || "160 100% 45%"})` }}>{social.handle}</p>
          </div>
        </motion.div>
      </AnimatePresence>
      {settings.show_indicators && (
        <div className="absolute bottom-6 flex gap-2">
          {socials.map((_: any, i: number) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === index ? "bg-white/80 scale-125" : "bg-white/20"}`} />
          ))}
        </div>
      )}
      
    </div>
  );
};

export default SocialRotatorRenderer;
