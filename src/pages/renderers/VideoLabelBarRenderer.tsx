import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import useOverlayBody from "@/hooks/use-overlay-body";
import { applyUrlOverrides } from "@/lib/overlay-params";
import { defaultVideoLabelBarSettings } from "@/hooks/overlay-defaults";

const VideoLabelBarRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const [s, setS] = useState(defaultVideoLabelBarSettings);

  useEffect(() => {
    if (!publicToken) return;
    supabase.from("overlay_widgets" as any).select("settings").eq("public_token", publicToken).single()
      .then(({ data }) => {
        if (data) setS(applyUrlOverrides({ ...defaultVideoLabelBarSettings, ...(data as any).settings }) as typeof defaultVideoLabelBarSettings);
      });
  }, [publicToken]);

  useEffect(() => {
    if (!publicToken) return;
    const ch = supabase.channel(`vlb-db-${publicToken}`)
      .on("postgres_changes" as any, { event: "UPDATE", schema: "public", table: "overlay_widgets", filter: `public_token=eq.${publicToken}` },
        (p: any) => { if (p.new?.settings) setS({ ...defaultVideoLabelBarSettings, ...p.new.settings }); })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [publicToken]);

  const scale = (s.scale || 100) / 100;
  const opacity = (s.opacity || 100) / 100;
  const speed = s.playback_speed || 1;
  const glow = s.glow_intensity || 40;
  const color = s.label_color || "280 100% 65%";

  const posMap: Record<string, React.CSSProperties> = {
    top: { top: 0, left: "50%", transform: `translateX(-50%) scale(${scale})` },
    bottom: { bottom: 0, left: "50%", transform: `translateX(-50%) scale(${scale})` },
    center: { top: "50%", left: "50%", transform: `translate(-50%, -50%) scale(${scale})` },
  };

  const pos = posMap[s.position] || posMap["bottom"];

  return (
    <div className={`w-screen h-screen overflow-hidden ${s.transparent_bg ? "bg-transparent" : "bg-black"}`}>
      <div className="absolute" style={{ ...pos, opacity }}>
        <video
          src="/overlays/label-bar.webm"
          autoPlay
          loop
          muted
          playsInline
          className="w-[500px] h-auto object-contain"
          style={{
            mixBlendMode: "screen",
            filter: `drop-shadow(0 0 ${glow * 0.3}px hsl(${color} / 0.5))`,
          }}
          ref={(el) => { if (el) el.playbackRate = speed; }}
        />
      </div>
      {s.custom_css && <style dangerouslySetInnerHTML={{ __html: s.custom_css }} />}
    </div>
  );
};

export default VideoLabelBarRenderer;
