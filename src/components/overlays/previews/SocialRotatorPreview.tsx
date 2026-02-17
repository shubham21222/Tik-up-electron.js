import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import SocialPlatformIcon from "@/components/overlays/SocialPlatformIcon";

const socials = [
  { id: "youtube", label: "YouTube", handle: "@streamer", color: "0 100% 50%" },
  { id: "instagram", label: "Instagram", handle: "@streamer", color: "330 80% 55%" },
  { id: "tiktok", label: "TikTok", handle: "@streamer", color: "180 100% 45%" },
  { id: "twitter", label: "Twitter/X", handle: "@streamer", color: "0 0% 100%" },
  { id: "discord", label: "Discord", handle: "discord.gg/stream", color: "235 86% 65%" },
  { id: "kick", label: "Kick", handle: "kick.com/streamer", color: "101 100% 45%" },
];


const SocialRotatorPreview = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % socials.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const social = socials[index];

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ rotateY: 90, opacity: 0, scale: 0.8 }}
          animate={{ rotateY: 0, opacity: 1, scale: 1 }}
          exit={{ rotateY: -90, opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[rgba(0,0,0,0.6)] backdrop-blur-xl border border-white/[0.08]"
          style={{ boxShadow: `0 0 30px hsl(${social.color} / 0.15)` }}
        >
          <motion.div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `hsl(${social.color} / 0.15)`, boxShadow: `0 0 15px hsl(${social.color} / 0.2)`, color: `hsl(${social.color})` }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <SocialPlatformIcon platform={social.id} size={18} />
          </motion.div>
          <div>
            <p className="text-[12px] font-bold text-white tracking-wide">{social.label}</p>
            <p className="text-[10px] font-semibold" style={{ color: `hsl(${social.color})` }}>{social.handle}</p>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-3 flex gap-1.5">
        {socials.map((_, i) => (
          <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === index ? "bg-white/80 scale-125" : "bg-white/20"}`} />
        ))}
      </div>
    </div>
  );
};

export default SocialRotatorPreview;
