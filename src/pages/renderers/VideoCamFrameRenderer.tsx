import { useRendererSettings } from "@/hooks/use-renderer-settings";
import { defaultVideoCamFrameSettings } from "@/hooks/overlay-defaults";

const VideoCamFrameRenderer = () => {
  const { settings: s } = useRendererSettings(defaultVideoCamFrameSettings, "vcf");

  const scale = (s.scale || 100) / 100;
  const opacity = (s.opacity || 100) / 100;
  const speed = s.playback_speed || 1;
  const glow = s.glow_intensity || 40;
  const color = s.frame_color || "160 100% 45%";

  const posMap: Record<string, React.CSSProperties> = {
    "top-left": { top: 0, left: 0 },
    "top-right": { top: 0, right: 0 },
    "bottom-left": { bottom: 0, left: 0 },
    "bottom-right": { bottom: 0, right: 0 },
    "center": { top: "50%", left: "50%", transform: `translate(-50%, -50%) scale(${scale})` },
  };

  const pos = posMap[s.position] || posMap["top-left"];
  const transformStyle = s.position === "center" ? undefined : `scale(${scale})`;

  return (
    <div className={`w-screen h-screen overflow-hidden ${s.transparent_bg ? "bg-transparent" : "bg-black"}`}>
      <div className="absolute" style={{ ...pos, transform: pos.transform || transformStyle, opacity }}>
        <video
          src="/overlays/cam-frame.webm"
          autoPlay loop muted playsInline
          className="w-[300px] h-[300px] object-contain"
          style={{
            mixBlendMode: "screen",
            filter: `drop-shadow(0 0 ${glow * 0.3}px hsl(${color} / 0.5))`,
          }}
          ref={(el) => { if (el) el.playbackRate = speed; }}
        />
      </div>
    </div>
  );
};

export default VideoCamFrameRenderer;
