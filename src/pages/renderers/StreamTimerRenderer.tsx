import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useRendererSettings } from "@/hooks/use-renderer-settings";
import { defaultStreamTimerSettings } from "@/hooks/overlay-defaults";

const StreamTimerRenderer = () => {
  const { settings, publicToken } = useRendererSettings(defaultStreamTimerSettings, "timer");
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!publicToken) return;
    const ch = supabase.channel(`stream-timer-${publicToken}`)
      .on("broadcast", { event: "timer_control" }, (msg) => {
        if (msg.payload?.action === "start") setRunning(true);
        if (msg.payload?.action === "pause") setRunning(false);
        if (msg.payload?.action === "reset") { setSeconds(0); setRunning(true); }
      })
      .on("broadcast", { event: "test_alert" }, () => setSeconds(3600))
      .subscribe(s => setConnected(s === "SUBSCRIBED"));
    return () => { supabase.removeChannel(ch); };
  }, [publicToken]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds(prev => prev + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  const timeStr = settings.show_hours !== false ? `${pad(hrs)}:${pad(mins)}${settings.show_seconds !== false ? `:${pad(secs)}` : ""}` : `${pad(mins)}${settings.show_seconds !== false ? `:${pad(secs)}` : ""}`;
  const fontClass = settings.font_family === "mono" ? "font-mono" : settings.font_family === "heading" ? "font-heading" : "";
  const accent = settings.accent_color || "0 100% 60%";
  const glow = (settings.glow_intensity || 50) / 100;

  return (
    <div className={`w-screen h-screen overflow-hidden flex flex-col items-center justify-center ${settings.transparent_bg ? "bg-transparent" : "bg-black"}`}>
      <div className="absolute top-2 right-2 opacity-20"><div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} /></div>
      {settings.show_label && (
        <motion.div className="flex items-center gap-1.5 mb-2" animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }}>
          <div className="w-2 h-2 rounded-full" style={{ background: `hsl(${accent})`, boxShadow: `0 0 6px hsl(${accent} / 0.5)` }} />
          <span className="text-[10px] font-bold tracking-widest text-white/50">{settings.label_text || "LIVE"}</span>
        </motion.div>
      )}
      <span className={`font-black text-white ${fontClass}`} style={{ fontSize: settings.font_size, textShadow: settings.glow_animation ? `0 0 ${15 * glow}px hsl(${accent} / 0.3)` : "none" }}>{timeStr}</span>
    </div>
  );
};

export default StreamTimerRenderer;
