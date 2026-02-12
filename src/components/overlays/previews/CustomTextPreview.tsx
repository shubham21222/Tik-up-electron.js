import { motion } from "framer-motion";


interface CustomTextPreviewProps {
  settings?: Record<string, any>;
}

const mockVars: Record<string, string> = {
  "{viewer_count}": "342",
  "{likes}": "4,821",
  "{followers}": "12.5K",
  "{top_gifter}": "GiftKing99",
  "{streamer}": "CoolStreamer",
};

const resolveVars = (text: string) => {
  let result = text;
  Object.entries(mockVars).forEach(([k, v]) => { result = result.split(k).join(v); });
  return result;
};

const CustomTextPreview = ({ settings = {} }: CustomTextPreviewProps) => {
  const text = settings.text_content || "Welcome to {streamer}'s stream!";
  const fontSize = settings.font_size || 28;
  const fontClass = settings.font_family === "mono" ? "font-mono" : settings.font_family === "heading" ? "font-heading" : "";
  const fontWeight = settings.font_weight === "black" ? "font-black" : settings.font_weight === "bold" ? "font-bold" : "font-normal";
  const gradientActive = settings.animated_gradient ?? true;
  const gradientColors = settings.gradient_colors || "280 100% 65%, 200 100% 55%";
  const gradientSpeed = settings.gradient_speed || 3;
  const bgBlur = settings.background_blur || 0;
  const bgOpacity = settings.background_opacity || 0;
  const textAlign = settings.text_align || "center";
  const scrollMode = settings.scroll_mode || "none";
  const accent = settings.accent_color || "280 100% 65%";

  const resolved = resolveVars(text);
  const colors = gradientColors.split(",").map((c: string) => `hsl(${c.trim()})`);

  const textStyle: React.CSSProperties = {
    fontSize,
    textAlign: textAlign as any,
    ...(gradientActive && colors.length >= 2 ? {
      background: `linear-gradient(90deg, ${colors.join(", ")}, ${colors[0]})`,
      backgroundSize: "200% 100%",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    } : {
      color: `hsl(${accent})`,
    }),
    ...(settings.text_shadow ? { filter: `drop-shadow(0 0 ${settings.shadow_blur || 10}px hsl(${settings.shadow_color || "0 0% 0%"} / 0.5))` } : {}),
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden px-4">
      {bgBlur > 0 && (
        <div className="absolute inset-0" style={{ backdropFilter: `blur(${bgBlur}px)`, background: `rgba(0,0,0,${bgOpacity / 100})` }} />
      )}
      <div className="relative z-10 max-w-full">
        {scrollMode === "horizontal" ? (
          <div className="overflow-hidden w-full">
            <motion.div animate={{ x: ["100%", "-100%"] }}
              transition={{ duration: (resolved.length * 200) / (settings.scroll_speed || 30), repeat: Infinity, ease: "linear" }}>
              <p className={`${fontClass} ${fontWeight} whitespace-nowrap`} style={textStyle}>{resolved}</p>
            </motion.div>
          </div>
        ) : (
          <motion.p className={`${fontClass} ${fontWeight}`} style={textStyle}
            {...(gradientActive ? {
              animate: { backgroundPosition: ["0% 50%", "200% 50%"] },
              transition: { duration: gradientSpeed, repeat: Infinity, ease: "linear" },
            } : {})}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}>
            {resolved}
          </motion.p>
        )}
      </div>
    </div>
  );
};

export default CustomTextPreview;
