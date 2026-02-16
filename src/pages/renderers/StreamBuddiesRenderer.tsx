import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import useOverlayBody from "@/hooks/use-overlay-body";

/* ─── Types ─────────────────────────────────────────────── */
type Tier = "common" | "rare" | "epic" | "legendary";

interface BuddyAvatar {
  id: string;
  username: string;
  avatarUrl: string | null;
  tier: Tier;
  sessionCoins: number;
  x: number;           // 0-100 (%)
  y: number;           // ground offset (0 = ground)
  vy: number;          // vertical velocity for jumping
  targetX: number;
  speed: number;
  direction: 1 | -1;   // 1 = right, -1 = left
  state: "idle" | "walking" | "jumping" | "entering" | "powerup";
  chatBubble: string | null;
  chatExpiry: number;
  lastActivity: number;
  rank: number;         // 0-indexed rank by sessionCoins
  spawnAnim: string;
  effectTrail: string | null;
}

interface BuddyEvent {
  event_type: string;
  username: string;
  user?: string;
  avatar?: string;
  profilePictureUrl?: string;
  avatar_url?: string;
  giftName?: string;
  gift_name?: string;
  coinValue?: number;
  coin_value?: number;
  diamondCount?: number;
  diamond_count?: number;
  repeatCount?: number;
  repeat_count?: number;
  message?: string;
  comment?: string;
  [key: string]: unknown;
}

/* ─── Constants ─────────────────────────────────────────── */
const SPRITE_V = "v3";
const SPRITE_MAP: Record<Tier, string> = {
  common: `/buddies/common.png?${SPRITE_V}`,
  rare: `/buddies/rare.png?${SPRITE_V}`,
  epic: `/buddies/epic.png?${SPRITE_V}`,
  legendary: `/buddies/legendary-cat.png?${SPRITE_V}`,
};

const TIER_THRESHOLDS: { tier: Tier; min: number }[] = [
  { tier: "legendary", min: 5000 },
  { tier: "epic", min: 500 },
  { tier: "rare", min: 50 },
  { tier: "common", min: 0 },
];

const TIER_SIZES: Record<Tier, number> = {
  common: 48,
  rare: 56,
  epic: 68,
  legendary: 80,
};

const TIER_GLOW: Record<Tier, string> = {
  common: "none",
  rare: "0 0 12px rgba(80,160,255,0.5)",
  epic: "0 0 18px rgba(160,80,255,0.6)",
  legendary: "0 0 28px rgba(255,200,50,0.7), 0 0 56px rgba(255,200,50,0.3)",
};

const ENTRANCE_ANIMS: Record<Tier, string> = {
  common: "fadeSlideUp",
  rare: "portalIn",
  epic: "lightningStrike",
  legendary: "meteorEntry",
};

function getTier(coins: number): Tier {
  for (const t of TIER_THRESHOLDS) {
    if (coins >= t.min) return t.tier;
  }
  return "common";
}

function getAvatarUrl(data: BuddyEvent): string | null {
  return (data.profilePictureUrl || data.avatar_url || data.avatar || null) as string | null;
}

/* ─── Renderer ──────────────────────────────────────────── */
const StreamBuddiesRenderer = () => {
  const { publicToken } = useParams<{ publicToken: string }>();
  useOverlayBody();

  const [avatars, setAvatars] = useState<Map<string, BuddyAvatar>>(new Map());
  const avatarsRef = useRef<Map<string, BuddyAvatar>>(new Map());
  const configRef = useRef<Record<string, any>>({});
  const frameRef = useRef<number>(0);
  const lastFrameRef = useRef<number>(0);

  // Fetch config
  useEffect(() => {
    if (!publicToken) return;
    supabase
      .from("overlay_widgets" as any)
      .select("settings")
      .eq("public_token", publicToken)
      .eq("widget_type", "stream_buddies")
      .maybeSingle()
      .then(({ data }) => {
        if (data) configRef.current = (data as any).settings || {};
      });
  }, [publicToken]);

  // Handle incoming event
  const handleEvent = useCallback((payload: BuddyEvent) => {
    const config = configRef.current;
    const maxAvatars = config.max_avatars || 15;
    const minCoins = config.min_gift_coins || 1;
    const showChatBubbles = config.show_chat_bubbles !== false;
    const _spawnCooldown = (config.spawn_cooldown || 3) * 1000;

    const map = avatarsRef.current;
    const username = payload.username || payload.user || "unknown";
    const now = Date.now();

    if (payload.event_type === "gift") {
      const coins = Number(payload.coinValue || payload.coin_value || payload.diamondCount || payload.diamond_count || 1);
      const repeat = Number(payload.repeatCount || payload.repeat_count || 1);
      const totalCoins = coins * repeat;

      if (totalCoins < minCoins) return;

      const existing = map.get(username);
      if (existing) {
        // Update existing avatar
        const newCoins = existing.sessionCoins + totalCoins;
        const newTier = getTier(newCoins);
        const evolved = newTier !== existing.tier;
        existing.sessionCoins = newCoins;
        existing.tier = newTier;
        existing.lastActivity = now;
        existing.avatarUrl = getAvatarUrl(payload) || existing.avatarUrl;
        // Jump on gift
        if (existing.state !== "entering") {
          existing.state = evolved ? "powerup" : "jumping";
          existing.vy = evolved ? -14 : -10;
        }
        if (evolved) {
          existing.effectTrail = newTier === "legendary" ? "gold" : newTier === "epic" ? "purple" : "blue";
          setTimeout(() => { existing.effectTrail = null; }, 3000);
        }
      } else {
        // Spawn new avatar
        if (map.size >= maxAvatars) {
          // Remove oldest inactive avatar
          let oldestKey = "";
          let oldestTime = Infinity;
          map.forEach((a, key) => {
            if (a.lastActivity < oldestTime) { oldestTime = a.lastActivity; oldestKey = key; }
          });
          if (oldestKey) map.delete(oldestKey);
        }

        const tier = getTier(totalCoins);
        const x = 10 + Math.random() * 80;
        const newAvatar: BuddyAvatar = {
          id: `${username}-${now}`,
          username,
          avatarUrl: getAvatarUrl(payload),
          tier,
          sessionCoins: totalCoins,
          x,
          y: 0,
          vy: 0,
          targetX: Math.random() * 90 + 5,
          speed: 0.3 + Math.random() * 0.3,
          direction: Math.random() > 0.5 ? 1 : -1,
          state: "entering",
          chatBubble: null,
          chatExpiry: 0,
          lastActivity: now,
          rank: 0,
          spawnAnim: ENTRANCE_ANIMS[tier],
          effectTrail: tier === "legendary" ? "gold" : null,
        };
        map.set(username, newAvatar);
        // Transition from entering to idle after animation
        setTimeout(() => {
          const a = map.get(username);
          if (a && a.state === "entering") a.state = "idle";
        }, 1200);
      }
    } else if (payload.event_type === "chat" && showChatBubbles) {
      const existing = map.get(username);
      if (existing) {
        const msg = String(payload.message || payload.comment || "");
        if (msg.length > 0 && msg.length <= 100) {
          existing.chatBubble = msg.length > 40 ? msg.slice(0, 37) + "..." : msg;
          existing.chatExpiry = now + 5000;
          existing.lastActivity = now;
        }
      }
    } else if (payload.event_type === "follow") {
      const existing = map.get(username);
      if (existing) {
        existing.chatBubble = "✨ Followed!";
        existing.chatExpiry = now + 3000;
        existing.lastActivity = now;
      }
    } else if (payload.event_type === "like") {
      const existing = map.get(username);
      if (existing) {
        existing.state = "jumping";
        existing.vy = -6;
        existing.lastActivity = now;
      }
    }

    // Recalculate ranks
    const sorted = [...map.values()].sort((a, b) => b.sessionCoins - a.sessionCoins);
    sorted.forEach((a, i) => { a.rank = i; });

    avatarsRef.current = new Map(map);
    setAvatars(new Map(map));
  }, []);

  // Subscribe to Realtime
  useEffect(() => {
    if (!publicToken) return;
    const channel = supabase
      .channel(`stream-buddies-${publicToken}`)
      .on("broadcast", { event: "buddy_event" }, ({ payload }) => {
        if (payload) handleEvent(payload as BuddyEvent);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [publicToken, handleEvent]);

  // Game loop — 30 FPS physics
  useEffect(() => {
    const GRAVITY = 0.6;
    const GROUND = 0;
    const DESPAWN_MS = 5 * 60 * 1000; // 5 min inactivity

    const tick = (timestamp: number) => {
      if (timestamp - lastFrameRef.current < 33) { // ~30 FPS
        frameRef.current = requestAnimationFrame(tick);
        return;
      }
      lastFrameRef.current = timestamp;
      const now = Date.now();
      const map = avatarsRef.current;
      let changed = false;

      map.forEach((a, key) => {
        // Despawn after inactivity
        if (now - a.lastActivity > DESPAWN_MS) {
          map.delete(key);
          changed = true;
          return;
        }

        // Expire chat bubbles
        if (a.chatBubble && now > a.chatExpiry) {
          a.chatBubble = null;
          changed = true;
        }

        // Physics
        if (a.state === "jumping" || a.state === "powerup" || a.vy !== 0) {
          a.vy += GRAVITY;
          a.y -= a.vy;
          if (a.y >= GROUND) {
            a.y = GROUND;
            a.vy = 0;
            if (a.state === "jumping" || a.state === "powerup") a.state = "walking";
          }
          changed = true;
        }

        // Walking toward target
        if (a.state === "walking" || a.state === "idle") {
          const dist = a.targetX - a.x;
          if (Math.abs(dist) > 1) {
            a.state = "walking";
            a.direction = dist > 0 ? 1 : -1;
            a.x += a.speed * a.direction;
            changed = true;
          } else {
            // Pick new target occasionally
            if (a.state === "walking") {
              a.state = "idle";
              changed = true;
            }
            if (Math.random() < 0.005) {
              a.targetX = Math.random() * 90 + 5;
              a.state = "walking";
              changed = true;
            }
          }
        }
      });

      if (changed) {
        avatarsRef.current = new Map(map);
        setAvatars(new Map(map));
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  const avatarList = [...avatars.values()].sort((a, b) => a.rank - b.rank);

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "transparent" }}>
      {/* Ground shadow line */}
      <div style={{
        position: "absolute", bottom: "8%", left: 0, right: 0, height: 2,
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.03) 20%, rgba(255,255,255,0.03) 80%, transparent)",
      }} />

      {avatarList.map((avatar) => {
        const size = TIER_SIZES[avatar.tier];
        const isTop3 = avatar.rank < 3;
        const isKing = avatar.rank === 0 && avatarList.length > 1;
        const entering = avatar.state === "entering";
        const poweringUp = avatar.state === "powerup";
        const walking = avatar.state === "walking";

        return (
          <div
            key={avatar.username}
            style={{
              position: "absolute",
              left: `${avatar.x}%`,
              bottom: `${10 + avatar.y}%`,
              transform: `translateX(-50%) scaleX(${avatar.direction})`,
              transition: walking ? "left 0.1s linear" : "left 0.3s ease",
              zIndex: isTop3 ? 100 - avatar.rank : 10,
              filter: isTop3 ? `drop-shadow(${TIER_GLOW[avatar.tier]})` : undefined,
            }}
          >
            {/* Crown for top supporter */}
            {isKing && (
              <div style={{
                position: "absolute",
                top: -20,
                left: "50%",
                transform: `translateX(-50%) scaleX(${avatar.direction})`,
                fontSize: 16,
                animation: "buddyCrown 2s ease-in-out infinite",
                zIndex: 200,
              }}>
                👑
              </div>
            )}

            {/* "King of Stream" title */}
            {isKing && (
              <div style={{
                position: "absolute",
                top: -36,
                left: "50%",
                transform: `translateX(-50%) scaleX(${avatar.direction})`,
                fontSize: 8,
                fontWeight: 800,
                color: "rgba(255,200,50,0.9)",
                textShadow: "0 0 8px rgba(255,200,50,0.5)",
                whiteSpace: "nowrap",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                fontFamily: "system-ui, sans-serif",
              }}>
                ★ King of Stream
              </div>
            )}

            {/* Chat bubble */}
            {avatar.chatBubble && (
              <div style={{
                position: "absolute",
                bottom: size + 8,
                left: "50%",
                transform: `translateX(-50%) scaleX(${avatar.direction})`,
                background: "rgba(0,0,0,0.8)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                padding: "4px 8px",
                maxWidth: 140,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontSize: 10,
                color: "white",
                fontFamily: "system-ui, sans-serif",
                zIndex: 300,
                animation: "buddyBubbleIn 0.3s ease-out",
              }}>
                {avatar.chatBubble}
                {/* Bubble tail */}
                <div style={{
                  position: "absolute",
                  bottom: -5,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 0,
                  height: 0,
                  borderLeft: "5px solid transparent",
                  borderRight: "5px solid transparent",
                  borderTop: "5px solid rgba(0,0,0,0.8)",
                }} />
              </div>
            )}

            {/* Effect trail */}
            {avatar.effectTrail && (
              <div style={{
                position: "absolute",
                bottom: -4,
                left: "50%",
                transform: "translateX(-50%)",
                width: size * 1.5,
                height: 8,
                borderRadius: "50%",
                background: avatar.effectTrail === "gold"
                  ? "radial-gradient(ellipse, rgba(255,200,50,0.4), transparent)"
                  : avatar.effectTrail === "purple"
                  ? "radial-gradient(ellipse, rgba(160,80,255,0.4), transparent)"
                  : "radial-gradient(ellipse, rgba(80,160,255,0.4), transparent)",
                animation: "buddyTrailPulse 1s ease-in-out infinite",
              }} />
            )}

            {/* Sprite */}
            <div style={{
              width: size,
              height: size,
              animation: entering
                ? `${avatar.spawnAnim} 0.8s ease-out`
                : poweringUp
                ? "buddyPowerUp 0.6s ease-out"
                : avatar.state === "idle"
                ? "buddyIdle 2s ease-in-out infinite"
                : walking
                ? "buddyWalk 0.4s steps(4) infinite"
                : undefined,
            }}>
              <img
                src={SPRITE_MAP[avatar.tier]}
                alt={avatar.username}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  imageRendering: "auto",
                }}
              />
            </div>

            {/* Username plate */}
            {configRef.current.show_usernames !== false && (
              <div style={{
                position: "absolute",
                bottom: -14,
                left: "50%",
                transform: `translateX(-50%) scaleX(${avatar.direction})`,
                fontSize: 9,
                fontWeight: 700,
                color: isTop3 ? "rgba(255,200,50,0.9)" : "rgba(255,255,255,0.7)",
                textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                whiteSpace: "nowrap",
                fontFamily: "system-ui, sans-serif",
                letterSpacing: "0.3px",
              }}>
                {avatar.username}
              </div>
            )}

            {/* Coin badge for top 3 */}
            {isTop3 && (
              <div style={{
                position: "absolute",
                top: -4,
                right: -8,
                transform: `scaleX(${avatar.direction})`,
                background: "rgba(0,0,0,0.7)",
                border: "1px solid rgba(255,200,50,0.3)",
                borderRadius: 6,
                padding: "1px 4px",
                fontSize: 8,
                fontWeight: 800,
                color: "rgba(255,200,50,0.9)",
                fontFamily: "system-ui, sans-serif",
                whiteSpace: "nowrap",
              }}>
                🪙 {avatar.sessionCoins.toLocaleString()}
              </div>
            )}

            {/* Ground shadow */}
            <div style={{
              position: "absolute",
              bottom: -6,
              left: "50%",
              transform: "translateX(-50%)",
              width: size * 0.7,
              height: 4,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.3)",
              filter: "blur(2px)",
            }} />
          </div>
        );
      })}

      {/* Particle effects for spawns */}
      <style>{`
        @keyframes buddyIdle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes buddyWalk {
          0% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-2px) rotate(-3deg); }
          50% { transform: translateY(0) rotate(0deg); }
          75% { transform: translateY(-2px) rotate(3deg); }
        }
        @keyframes buddyCrown {
          0%, 100% { transform: translateX(-50%) translateY(0) scaleX(var(--dir, 1)); }
          50% { transform: translateX(-50%) translateY(-4px) scaleX(var(--dir, 1)); }
        }
        @keyframes buddyBubbleIn {
          from { opacity: 0; transform: translateX(-50%) translateY(8px) scale(0.8); }
          to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
        @keyframes buddyTrailPulse {
          0%, 100% { opacity: 0.4; transform: translateX(-50%) scaleX(1); }
          50% { opacity: 0.8; transform: translateX(-50%) scaleX(1.3); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.5); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes portalIn {
          0% { opacity: 0; transform: scale(0) rotate(180deg); filter: hue-rotate(180deg); }
          60% { opacity: 1; transform: scale(1.3) rotate(0deg); filter: hue-rotate(0deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes lightningStrike {
          0% { opacity: 0; transform: translateY(-60px) scale(0.3); filter: brightness(3); }
          30% { opacity: 1; filter: brightness(3); }
          60% { transform: translateY(5px) scale(1.1); filter: brightness(1.5); }
          100% { transform: translateY(0) scale(1); filter: brightness(1); }
        }
        @keyframes meteorEntry {
          0% { opacity: 0; transform: translate(60px, -80px) scale(0.3) rotate(45deg); filter: brightness(4); }
          40% { opacity: 1; filter: brightness(2); }
          70% { transform: translate(-5px, 5px) scale(1.15) rotate(0deg); filter: brightness(1.3); }
          100% { transform: translate(0, 0) scale(1) rotate(0deg); filter: brightness(1); }
        }
        @keyframes buddyPowerUp {
          0% { transform: scale(1); filter: brightness(1); }
          30% { transform: scale(1.4); filter: brightness(2.5) hue-rotate(30deg); }
          60% { transform: scale(0.9); filter: brightness(1.5); }
          100% { transform: scale(1); filter: brightness(1); }
        }
      `}</style>
    </div>
  );
};

export default StreamBuddiesRenderer;
