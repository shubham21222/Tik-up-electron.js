import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { defaultCustomTextSettings } from "@/hooks/overlay-defaults";
import useOverlayBody from "@/hooks/use-overlay-body";

const mockVars: Record<string, string> = {
  "{viewer_count}": "0",
  "{likes}": "0",
  "{followers}": "0",
  "{top_gifter}": "—",
  "{streamer}": "Streamer",
};

const CustomTextRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const [settings, setSettings] = useState(defaultCustomTextSettings);
  const [vars, setVars] = useState(mockVars);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!publicToken) return;
    supabase.from("overlay_widgets" as any).select("settings").eq("public_token", publicToken).maybeSingle()
      .then(({ data }) => { if (data) setSettings({ ...defaultCustomTextSettings, ...(data as any).settings }); });
  }, [publicToken]);

  useEffect(() => {
    if (!publicToken) return;
    const ch = supabase.channel(`custom-text-${publicToken}`)
      .on("broadcast", { event: "var_update" }, (msg) => { if (msg.payload) setVars(prev => ({ ...prev, ...msg.payload })); })
      .subscribe(s => setConnected(s === "SUBSCRIBED"));
    const db = supabase.channel(`text-db-${publicToken}`)
      .on("postgres_changes" as any, { event: "UPDATE", schema: "public", table: "overlay_widgets", filter: `public_token=eq.${publicToken}` },
        (p: any) => { if (p.new?.settings) setSettings({ ...defaultCustomTextSettings, ...p.new.settings }); })
      .subscribe();
    return () => { supabase.removeChannel(ch); supabase.removeChannel(db); };
  }, [publicToken]);

  let resolved = settings.text_content || "";
  Object.entries(vars).forEach(([k, v]) => { resolved = resolved.split(k).join(v); });

  const fontClass = settings.font_family === "mono" ? "font-mono" : settings.font_family === "heading" ? "font-heading" : "";
  const fontWeight = settings.font_weight === "black" ? "font-black" : settings.font_weight === "bold" ? "font-bold" : "font-normal";
  const colors = (settings.gradient_colors || "280 100% 65%, 200 100% 55%").split(",").map((c: string) => `hsl(${c.trim()})`);

  const textStyle: React.CSSProperties = {
    fontSize: settings.font_size,
    textAlign: settings.text_align as any,
    ...(settings.animated_gradient && colors.length >= 2 ? {
      background: `linear-gradient(90deg, ${colors.join(", ")}, ${colors[0]})`,
      backgroundSize: "200% 100%",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    } : { color: `hsl(${settings.accent_color || "280 100% 65%"})` }),
  };

  return (
    <div className={`w-screen h-screen overflow-hidden flex items-center justify-center px-4 ${settings.transparent_bg ? "bg-transparent" : "bg-black"}`}>
      <div className="absolute top-2 right-2 opacity-20"><div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} /></div>
      {settings.background_blur > 0 && <div className="absolute inset-0" style={{ backdropFilter: `blur(${settings.background_blur}px)`, background: `rgba(0,0,0,${(settings.background_opacity || 0) / 100})` }} />}
      <motion.p className={`relative z-10 ${fontClass} ${fontWeight}`} style={textStyle}
        {...(settings.animated_gradient ? { animate: { backgroundPosition: ["0% 50%", "200% 50%"] }, transition: { duration: settings.gradient_speed || 3, repeat: Infinity, ease: "linear" } } : {})}>
        {resolved}
      </motion.p>
      {settings.custom_css && <style dangerouslySetInnerHTML={{ __html: settings.custom_css }} />}
    </div>
  );
};

export default CustomTextRenderer;
