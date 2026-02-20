import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { defaultCircularProfileWidgetSettings } from "@/hooks/overlay-defaults";
import useOverlayBody from "@/hooks/use-overlay-body";
import { applyUrlOverrides } from "@/lib/overlay-params";

interface ProfileEntry {
  name: string;
  rank: string;
  coins: string;
  badge: string;
  color: string;
}

const BADGE_MAP = ["👑", "⚡", "🌟", "🎯", "🔥", "💎", "🏆", "⭐", "🎁", "🎊"];
const COLOR_MAP = ["45 100% 58%", "280 100% 65%", "160 100% 50%", "200 100% 60%", "350 90% 60%"];

const CircularProfileWidgetRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const [settings, setSettings] = useState(defaultCircularProfileWidgetSettings);
  const [profiles, setProfiles] = useState<ProfileEntry[]>([]);
  const [profileIdx, setProfileIdx] = useState(0);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (!publicToken) return;
    const fetchWidget = async () => {
      const { data } = await supabase
        .from("overlay_widgets" as any)
        .select("settings, user_id")
        .eq("public_token", publicToken)
        .single();
      if (data) {
        const merged = applyUrlOverrides({ ...defaultCircularProfileWidgetSettings, ...(data as any).settings }) as typeof defaultCircularProfileWidgetSettings;
        setSettings(merged);
        fetchLeaderboard((data as any).user_id, merged);
      }
    };
    fetchWidget();
  }, [publicToken]);

  const fetchLeaderboard = async (userId: string, s: typeof defaultCircularProfileWidgetSettings) => {
    const { data } = await supabase
      .from("session_user_totals" as any)
      .select("sender_username, total_diamonds, total_gifts")
      .eq("user_id", userId)
      .order("total_diamonds", { ascending: false })
      .limit((s as any).max_profiles || 5);

    if (data && data.length > 0) {
      const entries: ProfileEntry[] = (data as any[]).map((row, i) => ({
        name: row.sender_username,
        rank: `#${i + 1}`,
        coins: Number(row.total_diamonds || 0).toLocaleString(),
        badge: BADGE_MAP[i] || "⭐",
        color: COLOR_MAP[i % COLOR_MAP.length],
      }));
      setProfiles(entries);
    } else {
      // Demo data if no session data
      setProfiles([
        { name: "StreamKing", rank: "#1", coins: "12,450", badge: "👑", color: "45 100% 58%" },
        { name: "NightOwl_Pro", rank: "#2", coins: "8,200", badge: "⚡", color: "280 100% 65%" },
        { name: "TikUp_Fan", rank: "#3", coins: "5,880", badge: "🌟", color: "160 100% 50%" },
      ]);
    }
  };

  useEffect(() => {
    if (profiles.length < 2) return;
    const s = settings as any;
    const speed = (s.rotation_speed || 3) * 1000;
    const t = setInterval(() => {
      const deg = 360 / profiles.length;
      setRotation(p => p + deg);
      setTimeout(() => setProfileIdx(p => (p + 1) % profiles.length), 600);
    }, speed);
    return () => clearInterval(t);
  }, [profiles, settings]);

  const s = settings as any;
  const profile = profiles[profileIdx];
  const accentColor = profile?.color || s.accent_color || "45 100% 58%";
  const segments = s.wheel_segments || 6;
  const r = 90;

  if (!profile) return null;

  return (
    <div className={`w-screen h-screen overflow-hidden flex items-center justify-center ${s.transparent_bg ? "bg-transparent" : "bg-black"}`}>
      <div className="relative flex flex-col items-center gap-4">
        {/* Circular widget */}
        <div className="relative w-72 h-72">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="97" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            {[...Array(segments)].map((_, i) => {
              const angle = (360 / segments) * i;
              const rad = (angle * Math.PI) / 180;
              const x1 = 100 + r * Math.cos(rad);
              const y1 = 100 + r * Math.sin(rad);
              return <line key={i} x1="100" y1="100" x2={x1} y2={y1} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />;
            })}
            <motion.circle cx="100" cy="100" r="90" fill="none"
              stroke={`hsl(${accentColor} / 0.35)`} strokeWidth="1.5"
              strokeDasharray="6 3"
              animate={{ rotate: rotation }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ transformOrigin: "100px 100px" }} />
            <circle cx="100" cy="100" r="96" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
            <motion.circle cx="100" cy="100" r="88" fill="none"
              stroke={`hsl(${accentColor} / 0.2)`} strokeWidth="4"
              strokeDasharray="280 300"
              animate={{ strokeDashoffset: [-20, -320] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
            <polygon points="100,4 94,16 106,16" fill="white" opacity="0.9" />
          </svg>

          {/* Center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28">
            <motion.div className="absolute inset-0 rounded-full"
              style={{ border: `1.5px solid hsl(${accentColor} / 0.5)`, boxShadow: `0 0 24px hsl(${accentColor} / 0.3)` }}
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity }} />
            <div className="absolute inset-0 rounded-full flex flex-col items-center justify-center"
              style={{ background: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <AnimatePresence mode="wait">
                <motion.div key={profileIdx} className="flex flex-col items-center"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.3 }}>
                  <span className="text-3xl">{profile.badge}</span>
                  {s.show_username !== false && (
                    <span className="text-[10px] font-bold text-white/90 mt-1 text-center leading-tight px-1 truncate max-w-[100px]">{profile.name}</span>
                  )}
                  {s.show_rank !== false && (
                    <span className="text-[9px] font-bold mt-0.5" style={{ color: `hsl(${accentColor})` }}>{profile.rank}</span>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Glow markers */}
          {[0, 90, 180, 270].map(angle => {
            const rad = (angle * Math.PI) / 180;
            const x = 50 + 47 * Math.cos(rad - Math.PI / 2);
            const y = 50 + 47 * Math.sin(rad - Math.PI / 2);
            return (
              <motion.div key={angle}
                className="absolute w-2 h-2 rounded-full"
                style={{ left: `${x}%`, top: `${y}%`, background: `hsl(${accentColor})`, boxShadow: `0 0 8px hsl(${accentColor})`, transform: "translate(-50%,-50%)" }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: angle / 360 }} />
            );
          })}
        </div>

        {/* Stats */}
        {(s.show_username !== false || s.show_coins !== false) && (
          <AnimatePresence mode="wait">
            <motion.div key={profileIdx} className="text-center"
              initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -6, opacity: 0 }}
              transition={{ duration: 0.3 }}>
              {s.show_username !== false && <p className="text-base font-bold text-white/90">{profile.name}</p>}
              {s.show_coins !== false && (
                <p className="text-sm mt-0.5" style={{ color: `hsl(${accentColor})` }}>
                  🪙 {profile.coins} coins · {profile.rank} Top Gifter
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Pagination dots */}
        <div className="flex gap-2">
          {profiles.map((p, i) => (
            <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
              style={{ background: i === profileIdx ? `hsl(${p.color})` : "rgba(255,255,255,0.2)" }}
              animate={{ scale: i === profileIdx ? 1.4 : 1 }}
              transition={{ duration: 0.3 }} />
          ))}
        </div>

        {/* Ambient glow */}
        <div className="absolute -inset-12 pointer-events-none rounded-full blur-3xl"
          style={{ background: `radial-gradient(ellipse, hsl(${accentColor} / 0.07), transparent 70%)` }} />
      </div>
    </div>
  );
};

export default CircularProfileWidgetRenderer;
