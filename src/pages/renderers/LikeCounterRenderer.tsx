import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { defaultLikeCounterSettings } from "@/hooks/overlay-defaults";
import useOverlayBody from "@/hooks/use-overlay-body";

const LikeCounterRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const [settings, setSettings] = useState(defaultLikeCounterSettings);
  const [count, setCount] = useState(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!publicToken) return;
    supabase.from("overlay_widgets" as any).select("settings").eq("public_token", publicToken).maybeSingle()
      .then(({ data }) => { if (data) setSettings({ ...defaultLikeCounterSettings, ...(data as any).settings }); });
  }, [publicToken]);

  useEffect(() => {
    if (!publicToken) return;
    const ch = supabase.channel(`like-counter-${publicToken}`)
      .on("broadcast", { event: "like_update" }, (msg) => {
        const p = msg.payload as any;
        const v = p?.likeCount ?? p?.like_count ?? p?.count ?? p?.totalLikeCount;
        if (v != null) setCount(prev => Math.max(prev, Number(v)));
      })
      .on("broadcast", { event: "test_alert" }, () => setCount(prev => prev + 42))
      .subscribe(s => setConnected(s === "SUBSCRIBED"));
    const db = supabase.channel(`like-counter-db-${publicToken}`)
      .on("postgres_changes" as any, { event: "UPDATE", schema: "public", table: "overlay_widgets", filter: `public_token=eq.${publicToken}` },
        (p: any) => { if (p.new?.settings) setSettings({ ...defaultLikeCounterSettings, ...p.new.settings }); })
      .subscribe();
    return () => { supabase.removeChannel(ch); supabase.removeChannel(db); };
  }, [publicToken]);

  const mode = settings.display_mode || "numeric";
  const fontClass = settings.font_family === "mono" ? "font-mono" : settings.font_family === "heading" ? "font-heading" : "";
  const glow = (settings.glow_strength || 60) / 100;
  const accent = settings.accent_color || "280 100% 65%";
  const fontSize = settings.font_size || 48;
  const progress = (count % (settings.milestone_interval || 1000)) / (settings.milestone_interval || 1000);

  if (mode === "progress_ring") {
    const r = 80, c = 2 * Math.PI * r;
    return (
      <div className={`w-screen h-screen overflow-hidden flex items-center justify-center ${settings.transparent_bg ? "bg-transparent" : "bg-black"}`}>
        <div className="absolute top-2 right-2 opacity-20"><div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} /></div>
        <div className="relative flex items-center justify-center">
          <svg width="200" height="200" viewBox="0 0 180 180">
            <circle cx="90" cy="90" r={r} fill="none" stroke={`hsl(${accent} / 0.1)`} strokeWidth="10" />
            <motion.circle cx="90" cy="90" r={r} fill="none" stroke={`hsl(${accent})`} strokeWidth="10"
              strokeLinecap="round" strokeDasharray={c} animate={{ strokeDashoffset: c * (1 - progress) }}
              style={{ filter: `drop-shadow(0 0 ${10 * glow}px hsl(${accent} / 0.4))` }}
              transform="rotate(-90 90 90)" transition={{ duration: 0.8, ease: "easeOut" }} />
          </svg>
          <motion.span className={`absolute text-3xl font-bold text-white ${fontClass}`}
            key={count} initial={{ scale: 1.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            {count.toLocaleString()}
          </motion.span>
        </div>
      </div>
    );
  }

  if (mode === "horizontal_bar") {
    return (
      <div className={`w-screen h-screen overflow-hidden flex flex-col items-center justify-center px-12 ${settings.transparent_bg ? "bg-transparent" : "bg-black"}`}>
        <div className="absolute top-2 right-2 opacity-20"><div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} /></div>
        <motion.span className={`text-2xl font-bold text-white mb-4 ${fontClass}`}
          key={count} initial={{ scale: 1.2 }} animate={{ scale: 1 }}>
          ❤️ {count.toLocaleString()}
        </motion.span>
        <div className="w-full max-w-lg h-6 rounded-full overflow-hidden" style={{ background: `hsl(${accent} / 0.1)` }}>
          <motion.div className="h-full rounded-full" animate={{ width: `${progress * 100}%` }}
            style={{ background: `linear-gradient(90deg, hsl(${accent}), hsl(${accent} / 0.6))`, boxShadow: `0 0 ${15 * glow}px hsl(${accent} / 0.3)` }}
            transition={{ duration: 0.8, ease: "easeOut" }} />
        </div>
        <p className="text-xs text-white/40 mt-3">Next milestone: {Math.ceil(count / (settings.milestone_interval || 1000)) * (settings.milestone_interval || 1000)}</p>
      </div>
    );
  }

  if (mode === "neon_counter") {
    return (
      <div className={`w-screen h-screen overflow-hidden flex items-center justify-center ${settings.transparent_bg ? "bg-transparent" : "bg-black"}`}>
        <div className="absolute top-2 right-2 opacity-20"><div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} /></div>
        <div className="relative flex flex-col items-center">
          <motion.div animate={{ textShadow: [`0 0 ${20 * glow}px hsl(${accent})`, `0 0 ${40 * glow}px hsl(${accent})`, `0 0 ${20 * glow}px hsl(${accent})`] }}
            transition={{ duration: 2, repeat: Infinity }}>
            <span className={`font-black ${fontClass}`} style={{ fontSize, color: `hsl(${accent})`, WebkitTextStroke: `1px hsl(${accent} / 0.3)` }}>
              {count.toLocaleString()}
            </span>
          </motion.div>
          <p className="text-xs text-white/30 tracking-widest uppercase mt-2">likes</p>
        </div>
      </div>
    );
  }

  // numeric (default) and milestone
  return (
    <div className={`w-screen h-screen overflow-hidden flex items-center justify-center ${settings.transparent_bg ? "bg-transparent" : "bg-black"}`}>
      <div className="absolute top-2 right-2 opacity-20"><div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} /></div>
      <div className="relative flex flex-col items-center">
        <motion.div className="flex items-center gap-3">
          <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }} className="text-3xl">❤️</motion.span>
          <motion.span className={`font-black text-white ${fontClass}`} style={{ fontSize, textShadow: `0 0 ${15 * glow}px hsl(${accent} / 0.3)` }} key={count}
            initial={settings.rolling_number ? { y: -20, opacity: 0 } : { scale: 1.3, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
            {count.toLocaleString()}
          </motion.span>
        </motion.div>
        {mode === "milestone" && count > 0 && count % (settings.milestone_interval || 1000) < 50 && (
          <motion.p className="text-sm font-bold mt-3" style={{ color: `hsl(${accent})` }}
            initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }}>🎉 Milestone!</motion.p>
        )}
        <motion.div className="absolute rounded-full blur-2xl -z-10" style={{ width: 150, height: 150, background: `hsl(${accent} / ${0.06 * glow})` }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 3, repeat: Infinity }} />
      </div>
    </div>
  );
};

export default LikeCounterRenderer;