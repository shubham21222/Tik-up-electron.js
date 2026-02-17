import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

const allMessages = [
  { user: "Tikup_User", text: "This is so fire 🔥", type: "chat" },
  { user: "Tikup_User", text: "Sent a Rose 🌹", type: "gift" },
  { user: "Tikup_User", text: "Love this stream!", type: "chat" },
  { user: "Tikup_User", text: "❤️❤️❤️", type: "like" },
  { user: "Tikup_User", text: "Hello from Japan 🇯🇵", type: "chat" },
  { user: "Tikup_User", text: "Just followed!", type: "follow" },
  { user: "Tikup_User", text: "Play some music!", type: "chat" },
  { user: "Tikup_User", text: "You're amazing", type: "chat" },
];

const userColors = [
  "hsl(280 100% 70%)", "hsl(160 100% 50%)", "hsl(200 100% 60%)",
  "hsl(350 90% 60%)", "hsl(45 100% 60%)", "hsl(120 80% 55%)",
];

const badgeMap: Record<string, string> = {
  gift: "🎁",
  follow: "⭐",
  like: "❤️",
};

const getAnimationVariants = (style: string) => {
  switch (style) {
    case "fade": return { initial: { opacity: 0 }, animate: { opacity: 1 } };
    case "pop": return { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 } };
    case "typewriter": return { initial: { opacity: 0, x: -10, scaleX: 0.9 }, animate: { opacity: 1, x: 0, scaleX: 1 } };
    default: return { initial: { opacity: 0, x: -20, scale: 0.9 }, animate: { opacity: 1, x: 0, scale: 1 } };
  }
};

const fontFamilyMap: Record<string, string> = {
  sans: "ui-sans-serif, system-ui, sans-serif",
  mono: "ui-monospace, SFMono-Regular, monospace",
  heading: "'Space Grotesk', sans-serif",
};

interface ChatBoxPreviewProps {
  settings: Record<string, any>;
}

const ChatBoxPreview = ({ settings }: ChatBoxPreviewProps) => {
  const [messages, setMessages] = useState(allMessages.slice(0, 4).map((m, i) => ({ ...m, id: i })));
  const idRef = useRef(4);
  const maxMessages = settings.max_messages || 8;
  const animation = settings.message_animation || "slide";
  const fontSize = settings.font_size || 13;
  const mode = settings.display_mode || "cyber";
  const fontFamily = fontFamilyMap[settings.font_family] || fontFamilyMap.sans;
  const emoteScale = settings.emote_scale || 1.2;
  const showBadges = settings.show_badges !== false;
  const shadowDepth = settings.shadow_depth ?? 20;
  const accentColor = settings.accent_color || "160 100% 45%";
  const accentHsl = `hsl(${accentColor})`;

  useEffect(() => {
    const interval = setInterval(() => {
      const nextMsg = allMessages[idRef.current % allMessages.length];
      idRef.current += 1;
      setMessages(prev => {
        const updated = [...prev, { ...nextMsg, id: idRef.current }];
        if (updated.length > maxMessages) return updated.slice(-maxMessages);
        return updated;
      });
    }, 2200);
    return () => clearInterval(interval);
  }, [maxMessages]);

  const getBgStyle = (type: string) => {
    if (mode === "minimal") return "bg-black/30";
    if (mode === "twitch") return "bg-[rgba(24,24,27,0.9)]";
    if (mode === "glass") return "bg-white/[0.04] backdrop-blur-lg";
    // cyber
    if (settings.highlight_gifts && type === "gift") return "bg-[rgba(280,100%,65%,0.08)] border-[hsl(280,100%,65%/0.2)]";
    return "bg-[rgba(0,0,0,0.55)] backdrop-blur-lg border-white/[0.06]";
  };

  const variants = getAnimationVariants(animation);
  const shadowStyle = shadowDepth > 0 ? `0 ${Math.round(shadowDepth / 10)}px ${Math.round(shadowDepth / 3)}px rgba(0,0,0,${shadowDepth / 100})` : "none";

  return (
    <div className="relative w-full h-full flex items-end justify-start p-6">
      <div className="w-[300px] flex flex-col gap-1.5" style={{ fontFamily }}>
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              layout
              initial={variants.initial}
              animate={variants.animate}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <div
                className={`flex items-start gap-2 px-3.5 py-2 rounded-2xl border ${getBgStyle(msg.type)}`}
                style={{ fontSize, boxShadow: shadowStyle }}
              >
                {showBadges && badgeMap[msg.type] && (
                  <span className="flex-shrink-0" style={{ fontSize: fontSize * emoteScale }}>
                    {badgeMap[msg.type]}
                  </span>
                )}
                <span className="font-semibold flex-shrink-0" style={{
                  color: settings.username_color_auto ? userColors[msg.user.length % userColors.length] : accentHsl,
                  fontSize: fontSize - 2,
                }}>
                  {msg.user}
                </span>
                <span className="text-white/80 leading-relaxed" style={{ fontSize: fontSize - 2 }}>
                  {msg.text}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChatBoxPreview;
