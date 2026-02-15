import AppLayout from "@/components/AppLayout";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Copy, ExternalLink, Settings, Eye, Gamepad2,
  Sparkles, MessageSquare, Shield, Crown, Zap
} from "lucide-react";
import { useOverlayWidgets, type OverlayWidget } from "@/hooks/use-overlay-widgets";
import { useAuth } from "@/hooks/use-auth";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/clipboard";
import ProGate from "@/components/ProGate";

/* ═══════════════════════════════════════════════════════════
   SPRITE PATHS — generated pixel-art avatars per tier
   ═══════════════════════════════════════════════════════════ */
const SPRITE_PATHS: Record<string, string> = {
  common: "/buddies/common-sprite.png",
  rare: "/buddies/rare-sprite.png",
  epic: "/buddies/epic-sprite.png",
  legendary: "/buddies/legendary-sprite.png",
};

const THEMES: Record<string, {
  label: string; emoji: string; desc: string;
  tiers: Record<string, { char: string; sprite?: string; glow: string; aura: string }>;
}> = {
  pixel: {
    label: "Pixel Heroes", emoji: "⚔️", desc: "Classic retro pixel-art warriors",
    tiers: {
      common:    { char: "🧑", sprite: SPRITE_PATHS.common, glow: "none", aura: "" },
      rare:      { char: "🧝", sprite: SPRITE_PATHS.rare, glow: "0 0 12px rgba(80,160,255,0.5)", aura: "rgba(80,160,255,0.15)" },
      epic:      { char: "🧙", sprite: SPRITE_PATHS.epic, glow: "0 0 18px rgba(160,80,255,0.6)", aura: "rgba(160,80,255,0.15)" },
      legendary: { char: "🦸", sprite: SPRITE_PATHS.legendary, glow: "0 0 28px rgba(255,200,50,0.7), 0 0 56px rgba(255,200,50,0.2)", aura: "rgba(255,200,50,0.12)" },
    },
  },
  chibi: {
    label: "Chibi Cuties", emoji: "🎀", desc: "Adorable chibi-style characters",
    tiers: {
      common:    { char: "🐣", glow: "none", aura: "" },
      rare:      { char: "🐱", glow: "0 0 12px rgba(255,120,200,0.5)", aura: "rgba(255,120,200,0.15)" },
      epic:      { char: "🦊", glow: "0 0 18px rgba(255,80,150,0.6)", aura: "rgba(255,80,150,0.15)" },
      legendary: { char: "🦄", glow: "0 0 28px rgba(255,150,250,0.7), 0 0 56px rgba(255,150,250,0.2)", aura: "rgba(255,150,250,0.12)" },
    },
  },
  cyber: {
    label: "Cyber Bots", emoji: "🤖", desc: "Futuristic robot companions",
    tiers: {
      common:    { char: "🔩", glow: "none", aura: "" },
      rare:      { char: "🤖", glow: "0 0 12px rgba(0,255,200,0.5)", aura: "rgba(0,255,200,0.15)" },
      epic:      { char: "👾", glow: "0 0 18px rgba(0,200,255,0.6)", aura: "rgba(0,200,255,0.15)" },
      legendary: { char: "🛸", glow: "0 0 28px rgba(0,255,255,0.7), 0 0 56px rgba(0,255,255,0.2)", aura: "rgba(0,255,255,0.12)" },
    },
  },
  fantasy: {
    label: "Fantasy Beasts", emoji: "🐉", desc: "Mythical creatures & heroes",
    tiers: {
      common:    { char: "🐸", glow: "none", aura: "" },
      rare:      { char: "🐺", glow: "0 0 12px rgba(100,200,100,0.5)", aura: "rgba(100,200,100,0.15)" },
      epic:      { char: "🐲", glow: "0 0 18px rgba(255,100,50,0.6)", aura: "rgba(255,100,50,0.15)" },
      legendary: { char: "🐉", glow: "0 0 28px rgba(255,60,20,0.7), 0 0 56px rgba(255,60,20,0.2)", aura: "rgba(255,60,20,0.12)" },
    },
  },
};

const TIER_KEYS = ["common", "rare", "epic", "legendary"] as const;
type Tier = typeof TIER_KEYS[number];

const TIER_META: Record<Tier, { range: string; color: string }> = {
  common:    { range: "1–49 coins",    color: "160 100% 45%" },
  rare:      { range: "50–499 coins",  color: "200 100% 55%" },
  epic:      { range: "500–4999 coins",color: "280 100% 65%" },
  legendary: { range: "5000+ coins",   color: "45 100% 55%" },
};

const BASE_SIZES: Record<Tier, number> = { common: 28, rare: 34, epic: 42, legendary: 54 };

const CHAT_MESSAGES = ["Let's gooo 🔥", "GG!", "🎉🎉🎉", "Amazing!", "Wow!", "❤️❤️", "KING!", "🏆", "💰💰"];

/* ─── Buddy Physics Type ─── */
interface Buddy {
  id: string;
  username: string;
  tier: Tier;
  coins: number;
  x: number;          // 0–100 (%)
  y: number;           // offset above ground (px-ish, positive = up)
  vy: number;
  targetX: number;
  targetY: number;     // slight vertical wander target
  speed: number;
  direction: 1 | -1;
  idle: number;        // idle countdown (frames)
  chatBubble: string | null;
  chatExpiry: number;
  bobPhase: number;
}

/* ═══════════════════════════════════════════════════════════
   LIVE PREVIEW — zero-background, physics-driven
   ═══════════════════════════════════════════════════════════ */
const LivePreview = ({ settings }: { settings: Record<string, any> }) => {
  const [buddies, setBuddies] = useState<Buddy[]>([]);
  const buddiesRef = useRef<Buddy[]>([]);
  const frameRef = useRef(0);
  const lastRef = useRef(0);

  const speedMult = settings.avatar_speed ?? 1;
  const showChat = settings.show_chat_bubbles !== false;
  const showNames = settings.show_usernames !== false;
  const maxAvatars = settings.max_avatars ?? 15;
  const theme = THEMES[settings.theme || "pixel"] || THEMES.pixel;

  const DEMO_DATA = useMemo(() => [
    { id: "king", username: "TopGifter", tier: "legendary" as Tier, coins: 12500 },
    { id: "epic1", username: "EpicFan", tier: "epic" as Tier, coins: 2400 },
    { id: "rare1", username: "RareViewer", tier: "rare" as Tier, coins: 180 },
    { id: "comm1", username: "NewFan", tier: "common" as Tier, coins: 15 },
    { id: "comm2", username: "Watcher", tier: "common" as Tier, coins: 8 },
  ], []);

  // Init buddies
  useEffect(() => {
    const initial = DEMO_DATA.slice(0, Math.min(maxAvatars, 5)).map((d, i) => ({
      ...d,
      x: 10 + i * 18 + Math.random() * 8,
      y: Math.random() * 12,
      vy: 0,
      targetX: 10 + Math.random() * 80,
      targetY: Math.random() * 18,
      speed: (0.06 + Math.random() * 0.08) * speedMult,
      direction: (Math.random() > 0.5 ? 1 : -1) as 1 | -1,
      idle: Math.floor(Math.random() * 120),
      chatBubble: null,
      chatExpiry: 0,
      bobPhase: Math.random() * Math.PI * 2,
    }));
    buddiesRef.current = initial;
    setBuddies([...initial]);
  }, [maxAvatars, DEMO_DATA]);

  // React to speed changes
  useEffect(() => {
    buddiesRef.current.forEach(b => {
      b.speed = (0.06 + Math.random() * 0.08) * speedMult;
    });
  }, [speedMult]);

  // Random chat bubbles
  useEffect(() => {
    if (!showChat) return;
    const iv = setInterval(() => {
      const arr = buddiesRef.current;
      if (!arr.length) return;
      const b = arr[Math.floor(Math.random() * arr.length)];
      b.chatBubble = CHAT_MESSAGES[Math.floor(Math.random() * CHAT_MESSAGES.length)];
      b.chatExpiry = Date.now() + 3000;
      setBuddies([...buddiesRef.current]);
    }, 3000);
    return () => clearInterval(iv);
  }, [showChat]);

  // Random jumps
  useEffect(() => {
    const iv = setInterval(() => {
      const arr = buddiesRef.current;
      if (!arr.length) return;
      const b = arr[Math.floor(Math.random() * arr.length)];
      if (b.vy === 0) {
        b.vy = 3.5 + Math.random() * 2.5;
        setBuddies([...buddiesRef.current]);
      }
    }, 2200);
    return () => clearInterval(iv);
  }, []);

  // Physics loop
  useEffect(() => {
    const tick = (ts: number) => {
      if (ts - lastRef.current < 33) { frameRef.current = requestAnimationFrame(tick); return; }
      lastRef.current = ts;
      const now = Date.now();
      let changed = false;
      const arr = buddiesRef.current;

      arr.forEach(b => {
        b.bobPhase += 0.07;

        // Gravity / jump
        if (b.vy !== 0 || b.y > b.targetY + 1) {
          b.vy -= 0.25; // decelerate
          b.y += b.vy;
          if (b.y <= b.targetY && b.vy < 0) { b.y = b.targetY; b.vy = 0; }
          changed = true;
        }

        // Idle countdown
        if (b.idle > 0) {
          b.idle--;
          if (b.idle === 0) {
            b.targetX = 5 + Math.random() * 88;
            b.targetY = Math.random() * 18;
          }
          // Gentle bob while idle
          changed = true;
        } else {
          // Walk towards target
          const dx = b.targetX - b.x;
          const dy = b.targetY - b.y;

          if (Math.abs(dx) > 0.3) {
            b.direction = dx > 0 ? 1 : -1;
            b.x += b.speed * b.direction;
            changed = true;
          }
          // Gentle vertical drift
          if (Math.abs(dy) > 0.3 && b.vy === 0) {
            b.y += (dy > 0 ? 0.15 : -0.15) * speedMult;
            changed = true;
          }

          // Arrived
          if (Math.abs(dx) <= 0.3 && Math.abs(dy) <= 0.3) {
            b.idle = 60 + Math.floor(Math.random() * 200);
          }
        }

        // Expire chat
        if (b.chatBubble && now > b.chatExpiry) {
          b.chatBubble = null;
          changed = true;
        }
      });

      if (changed) setBuddies([...arr]);
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [speedMult]);

  const sorted = useMemo(() => [...buddies].sort((a, b) => b.coins - a.coins), [buddies]);
  const getRank = (id: string) => sorted.findIndex(s => s.id === id);

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: "transparent" }}>
      {/* Subtle checkerboard for transparency indication */}
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: "linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%)",
        backgroundSize: "12px 12px",
        backgroundPosition: "0 0, 0 6px, 6px -6px, -6px 0px",
      }} />

      {sorted.map((b) => {
        const coinScale = Math.min(1 + (b.coins / 4000) * 0.7, 2.0);
        const baseSize = BASE_SIZES[b.tier];
        const displaySize = baseSize * coinScale;
        const rank = getRank(b.id);
        const isKing = rank === 0 && sorted.length > 1;
        const isTop3 = rank < 3;
        const tierData = theme.tiers[b.tier];
        const bobOffset = b.idle > 0 ? Math.sin(b.bobPhase) * 2 : Math.sin(b.bobPhase * 2) * 0.8;
        const isWalking = b.idle <= 0 && Math.abs(b.targetX - b.x) > 0.3;

        return (
          <div
            key={b.id}
            style={{
              position: "absolute",
              left: `${b.x}%`,
              bottom: `${8 + b.y * 1.5 + bobOffset}%`,
              transform: `translateX(-50%)`,
              transition: "left 0.08s linear",
              zIndex: isKing ? 100 : isTop3 ? 80 : 10 + Math.floor(b.y),
            }}
          >
            {/* Aura glow for epic+ */}
            {tierData.aura && (
              <div style={{
                position: "absolute",
                inset: -displaySize * 0.3,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${tierData.aura} 0%, transparent 70%)`,
                animation: "buddyAura 3s ease-in-out infinite",
                pointerEvents: "none",
              }} />
            )}

            {/* King of Stream title */}
            {isKing && (
              <>
                <div style={{
                  position: "absolute", top: -(displaySize * 0.65), left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: 7, fontWeight: 900,
                  color: "rgba(255,200,50,0.95)",
                  textShadow: "0 0 10px rgba(255,200,50,0.6), 0 1px 2px rgba(0,0,0,0.8)",
                  whiteSpace: "nowrap", textTransform: "uppercase",
                  letterSpacing: 1, fontFamily: "system-ui",
                }}>
                  ★ KING OF STREAM
                </div>
                <div style={{
                  position: "absolute", top: -(displaySize * 0.4), left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: Math.max(14, displaySize * 0.3),
                  animation: "buddyCrown 2s ease-in-out infinite",
                  zIndex: 200,
                }}>
                  👑
                </div>
              </>
            )}

            {/* Chat bubble */}
            <AnimatePresence>
              {b.chatBubble && showChat && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.8 }}
                  style={{
                    position: "absolute", bottom: displaySize + 8, left: "50%",
                    transform: "translateX(-50%)",
                    background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
                    padding: "4px 8px", fontSize: 9, color: "white",
                    whiteSpace: "nowrap", fontFamily: "system-ui",
                    zIndex: 300, fontWeight: 600,
                  }}
                >
                  {b.chatBubble}
                  <div style={{
                    position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)",
                    width: 0, height: 0,
                    borderLeft: "4px solid transparent", borderRight: "4px solid transparent",
                    borderTop: "4px solid rgba(0,0,0,0.85)",
                  }} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Avatar character — sprite image or emoji fallback */}
            <div
              style={{
                width: displaySize, height: displaySize,
                display: "flex", alignItems: "center", justifyContent: "center",
                filter: tierData.glow !== "none" ? `drop-shadow(${tierData.glow})` : undefined,
                transform: `scaleX(${b.direction}) ${isWalking ? `rotate(${Math.sin(b.bobPhase * 4) * 8}deg)` : ""}`,
                transition: "transform 0.1s ease",
                userSelect: "none",
              }}
            >
              {tierData.sprite ? (
                <img
                  src={tierData.sprite}
                  alt={b.tier}
                  style={{
                    width: displaySize, height: displaySize,
                    objectFit: "contain",
                    imageRendering: "auto",
                    pointerEvents: "none",
                  }}
                  draggable={false}
                />
              ) : (
                <span style={{ fontSize: displaySize * 0.7, lineHeight: 1 }}>{tierData.char}</span>
              )}
            </div>

            {/* Username + coins */}
            {showNames && (
              <div style={{
                position: "absolute", bottom: -18, left: "50%",
                transform: "translateX(-50%)",
                textAlign: "center", whiteSpace: "nowrap",
              }}>
                <div style={{
                  fontSize: 8, fontWeight: 800,
                  color: isTop3 ? "rgba(255,200,50,0.95)" : "rgba(255,255,255,0.75)",
                  textShadow: "0 1px 4px rgba(0,0,0,0.9)",
                  fontFamily: "system-ui",
                }}>
                  {b.username}
                </div>
                <div style={{
                  fontSize: 7, fontWeight: 600,
                  color: "rgba(255,255,255,0.3)",
                  fontFamily: "system-ui",
                }}>
                  {b.coins.toLocaleString()} 💎
                </div>
              </div>
            )}

            {/* Rank badge */}
            {isTop3 && (
              <div style={{
                position: "absolute", top: -4, right: -8,
                background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,200,50,0.4)",
                borderRadius: 6, padding: "1px 5px",
                fontSize: 7, fontWeight: 900, color: "rgba(255,200,50,0.95)",
                fontFamily: "system-ui", boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
              }}>
                #{rank + 1}
              </div>
            )}
          </div>
        );
      })}

      <div className="absolute top-2 left-3 text-[9px] font-bold text-muted-foreground/20 uppercase tracking-wider select-none">
        Live Preview · {theme.label}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════ */
const StreamBuddiesPage = () => {
  const { user } = useAuth();
  const { widgets, createWidget, updateSettings, loading } = useOverlayWidgets("stream_buddies");
  const [widget, setWidget] = useState<OverlayWidget | null>(null);

  useEffect(() => {
    if (widgets.length > 0) setWidget(widgets[0]);
  }, [widgets]);

  const handleCreate = async () => {
    const w = await createWidget("stream_buddies", "Stream Buddies");
    if (w) setWidget(w);
  };

  const settings = widget?.settings || {};
  const currentTheme = THEMES[settings.theme || "pixel"] || THEMES.pixel;

  const updateSetting = (key: string, value: any) => {
    if (!widget) return;
    const newSettings = { ...settings, [key]: value };
    setWidget({ ...widget, settings: newSettings });
    updateSettings(widget.id, newSettings);
  };

  const overlayUrl = widget ? `https://tikup.xyz/overlay/stream-buddies/${widget.public_token}` : "";

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Users size={48} className="text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">Sign in to use Stream Buddies</h2>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ProGate feature="Stream Buddies">
        <div className="max-w-5xl mx-auto relative z-10 pb-12">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(280 100% 65% / 0.1)" }}>
                <Gamepad2 size={20} style={{ color: "hsl(280 100% 65%)" }} />
              </div>
              <div>
                <h1 className="text-2xl font-heading font-bold text-foreground">Stream Buddies</h1>
                <p className="text-sm text-muted-foreground">Animated avatars that roam your stream — powered by gifts.</p>
              </div>
            </div>
          </motion.div>

          {/* Live Preview — full width, tall */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }} className="mb-5">
            <div className="rounded-2xl border border-border/30 overflow-hidden" style={{ background: "linear-gradient(180deg, hsl(220 15% 6% / 0.6), hsl(220 12% 4% / 0.7))" }}>
              <div className="h-[260px] relative">
                <LivePreview settings={settings} />
              </div>
            </div>
          </motion.div>

          {/* Tier Preview — shows current theme's avatars */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-5">
            <div className="rounded-2xl border border-border/20 p-5" style={{ background: "hsl(220 15% 7% / 0.8)" }}>
              <h3 className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
                <Crown size={12} /> Avatar Tiers · {currentTheme.label}
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {TIER_KEYS.map((tier, i) => {
                  const meta = TIER_META[tier];
                  const td = currentTheme.tiers[tier];
                  return (
                    <motion.div
                      key={tier}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.06 }}
                      className="rounded-xl p-4 text-center border border-border/20 relative overflow-hidden"
                      style={{ background: `hsl(${meta.color} / 0.04)` }}
                    >
                      {/* Aura behind avatar */}
                      {td.aura && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div style={{
                            width: 60, height: 60, borderRadius: "50%",
                            background: `radial-gradient(circle, ${td.aura} 0%, transparent 70%)`,
                            animation: "buddyAura 3s ease-in-out infinite",
                          }} />
                        </div>
                      )}
                      <motion.div
                        className="mx-auto mb-2 relative z-10 flex items-center justify-center"
                        style={{
                          width: 56, height: 56,
                          filter: td.glow !== "none" ? `drop-shadow(${td.glow})` : undefined,
                        }}
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.35 }}
                      >
                        {td.sprite ? (
                          <img src={td.sprite} alt={tier} style={{ width: 56, height: 56, objectFit: "contain" }} draggable={false} />
                        ) : (
                          <span className="text-4xl">{td.char}</span>
                        )}
                      </motion.div>
                      <p className="text-xs font-bold relative z-10" style={{ color: `hsl(${meta.color})` }}>
                        {tier.charAt(0).toUpperCase() + tier.slice(1)}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 relative z-10">{meta.range}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {!widget && !loading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <button
                onClick={handleCreate}
                className="px-6 py-3 rounded-xl font-bold text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Enable Stream Buddies
              </button>
            </motion.div>
          ) : widget ? (
            <div className="space-y-4">
              {/* OBS URL */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="rounded-2xl border border-border/20 p-5" style={{ background: "hsl(220 15% 7% / 0.8)" }}>
                  <h3 className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                    <ExternalLink size={12} /> OBS Browser Source URL
                  </h3>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-[11px] text-foreground/70 bg-black/30 rounded-lg px-3 py-2 truncate font-mono">
                      {overlayUrl}
                    </code>
                    <button
                      onClick={() => { copyToClipboard(overlayUrl); toast.success("Copied!"); }}
                      className="px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      <Copy size={12} /> Copy
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">Width: 1920 · Height: 1080 · Transparent background</p>
                </div>
              </motion.div>

              {/* Settings */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <div className="rounded-2xl border border-border/20 p-5 space-y-5" style={{ background: "hsl(220 15% 7% / 0.8)" }}>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Settings size={12} /> Settings
                  </h3>

                  {/* Theme Selector */}
                  <div>
                    <label className="text-xs font-semibold text-foreground/70 mb-2 block">Avatar Theme</label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(THEMES).map(([id, t]) => {
                        const active = (settings.theme || "pixel") === id;
                        return (
                          <button
                            key={id}
                            onClick={() => updateSetting("theme", id)}
                            className="rounded-xl p-3 text-left border transition-all"
                            style={{
                              background: active ? "hsl(var(--primary) / 0.08)" : "hsl(var(--muted) / 0.15)",
                              borderColor: active ? "hsl(var(--primary) / 0.3)" : "hsl(var(--border) / 0.3)",
                            }}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{t.emoji}</span>
                              <span className="text-xs font-bold text-foreground">{t.label}</span>
                            </div>
                            <div className="flex gap-1.5 mt-1">
                              {TIER_KEYS.map(tier => (
                                <span key={tier} className="text-sm">{t.tiers[tier].char}</span>
                              ))}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">{t.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sliders */}
                  <SettingSlider label="Max Avatars on Screen" value={settings.max_avatars ?? 15} min={3} max={30} step={1} onChange={v => updateSetting("max_avatars", v)} />
                  <SettingSlider label="Min Gift to Spawn (coins)" value={settings.min_gift_coins ?? 1} min={1} max={100} step={1} onChange={v => updateSetting("min_gift_coins", v)} />
                  <SettingSlider label="Avatar Speed" value={settings.avatar_speed ?? 1} min={0.3} max={3} step={0.1} onChange={v => updateSetting("avatar_speed", v)} suffix="x" />
                  <SettingSlider label="Spawn Cooldown" value={settings.spawn_cooldown ?? 3} min={0} max={15} step={1} onChange={v => updateSetting("spawn_cooldown", v)} suffix="s" />

                  {/* Toggles */}
                  <div className="space-y-3 pt-2">
                    <SettingToggle icon={MessageSquare} label="Show Chat Bubbles" checked={settings.show_chat_bubbles !== false} onChange={v => updateSetting("show_chat_bubbles", v)} />
                    <SettingToggle icon={Eye} label="Show Usernames" checked={settings.show_usernames !== false} onChange={v => updateSetting("show_usernames", v)} />
                  </div>
                </div>
              </motion.div>

              {/* Features */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="rounded-2xl border border-border/20 p-5" style={{ background: "hsl(220 15% 7% / 0.8)" }}>
                  <h3 className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles size={12} /> Features
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: Zap, label: "Gift Reactions", desc: "Avatars jump & evolve on gifts" },
                      { icon: Crown, label: "King of Stream", desc: "Top gifter gets crown + title" },
                      { icon: MessageSquare, label: "Chat Bubbles", desc: "Messages appear above avatars" },
                      { icon: Sparkles, label: "Tier Evolution", desc: "Bigger gifts = rarer avatars" },
                      { icon: Shield, label: "Moderation", desc: "Profanity filtered on bubbles" },
                      { icon: Users, label: "Dynamic Scaling", desc: "More coins = bigger avatar" },
                    ].map((f, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/10">
                        <f.icon size={14} className="text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-foreground">{f.label}</p>
                          <p className="text-[10px] text-muted-foreground">{f.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          ) : null}
        </div>
      </ProGate>
    </AppLayout>
  );
};

/* ─── Tiny helper components ─── */
const SettingSlider = ({ label, value, min, max, step, onChange, suffix }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; suffix?: string;
}) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <label className="text-xs font-semibold text-foreground/70">{label}</label>
      <span className="text-xs font-bold text-primary">
        {Number.isInteger(step) ? value : value.toFixed(1)}{suffix || ""}
      </span>
    </div>
    <Slider value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v)} />
  </div>
);

const SettingToggle = ({ icon: Icon, label, checked, onChange }: {
  icon: typeof Eye; label: string; checked: boolean; onChange: (v: boolean) => void;
}) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <Icon size={14} className="text-muted-foreground" />
      <span className="text-xs font-semibold text-foreground/70">{label}</span>
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

export default StreamBuddiesPage;
