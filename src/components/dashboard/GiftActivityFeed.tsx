import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift } from "lucide-react";
import { useGiftCatalog } from "@/hooks/use-gift-catalog";

import GlassCard from "@/components/ui/glass-card";

const formatTimeAgo = (ts: number) => {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 5) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
};

const staticEvents = [
  { user: "StreamFan42", giftName: "Rose", time: "1s ago", color: "280 100% 65%", coins: 1 },
  { user: "GiftKing", giftName: "Lion", time: "3s ago", color: "280 100% 65%", coins: 500 },
  { user: "TikTokPro", giftName: "Star", time: "8s ago", color: "45 100% 55%", coins: 250 },
  { user: "MusicLover", giftName: "TikTok Universe", time: "15s ago", color: "280 100% 65%", coins: 10000 },
  { user: "CoolViewer", giftName: "Rose Carriage", time: "22s ago", color: "280 100% 65%", coins: 5000 },
  { user: "NightOwl", giftName: "Rose", time: "30s ago", color: "280 100% 65%", coins: 1 },
];

interface LiveEvent {
  type: string;
  timestamp: number;
  data: Record<string, unknown>;
}

interface GiftActivityFeedProps {
  wsConnected: boolean;
  events: LiveEvent[];
}

const GiftActivityFeed = ({ wsConnected, events }: GiftActivityFeedProps) => {
  const { gifts: giftCatalog } = useGiftCatalog();

  const giftImageMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const g of giftCatalog) {
      if (g.image_url) {
        map[g.gift_id] = g.image_url;
        map[g.name.toLowerCase()] = g.image_url;
      }
    }
    return map;
  }, [giftCatalog]);

  const giftEvents = wsConnected
    ? events.filter((e) => e.type === "gift").slice(0, 15)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="mb-6"
    >
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Gift size={14} className="text-secondary" />
            <h2 className="text-sm font-heading font-bold text-foreground">Gift Activity</h2>
          </div>
          {wsConnected ? (
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary absolute inset-0 animate-ping" />
              </div>
              <span className="text-[10px] text-primary font-semibold">Live</span>
            </div>
          ) : (
            <span className="text-[10px] text-muted-foreground">Demo</span>
          )}
        </div>
        <div className="space-y-0.5">
          {wsConnected && giftEvents.length > 0 ? (
            <AnimatePresence initial={false}>
              {giftEvents.map((event, i) => {
                const username = String(event.data.username || "Unknown");
                const giftName = String(event.data.giftName || "a gift");
                const giftId = String(event.data.giftId || event.data.gift_id || "");
                const repeatCount = (event.data.repeatCount as number) || 1;
                const coinValue = (event.data.diamondCount as number) || (event.data.coinValue as number) || 0;
                const avatarUrl = String(event.data.profilePictureUrl || event.data.avatar_url || event.data.avatar || "");
                const giftImageUrl = giftImageMap[giftId] || giftImageMap[giftName.toLowerCase()] || "";
                return (
                  <motion.div
                    key={`gift-${event.timestamp}-${i}`}
                    initial={{ opacity: 0, x: -20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: "auto" }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent transition-colors group/gift"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden"
                        style={{ background: "hsl(280 100% 65% / 0.1)", border: "1px solid hsl(280 100% 65% / 0.15)" }}>
                        {giftImageUrl ? (
                          <img src={giftImageUrl} alt={giftName} className="w-7 h-7 object-contain" />
                        ) : (
                          <Gift size={16} style={{ color: "hsl(280 100% 65%)" }} />
                        )}
                      </div>
                      {avatarUrl && (
                        <img src={avatarUrl} alt="" className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border border-background object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-foreground truncate">
                        <span className="font-semibold">{username}</span>{" "}
                        <span className="text-muted-foreground">sent</span>{" "}
                        <span className="font-medium" style={{ color: "hsl(280 100% 70%)" }}>{giftName}</span>
                        {repeatCount > 1 && (
                          <span className="text-xs font-bold ml-1" style={{ color: "hsl(45 100% 55%)" }}>x{repeatCount}</span>
                        )}
                      </p>
                    </div>
                    {coinValue > 0 && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md flex-shrink-0"
                        style={{ background: "hsl(280 100% 65% / 0.1)", color: "hsl(280 100% 70%)" }}>
                        🪙 {coinValue.toLocaleString()}
                      </span>
                    )}
                    <span className="text-[11px] text-muted-foreground/40 flex-shrink-0">{formatTimeAgo(event.timestamp)}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          ) : wsConnected ? (
            <div className="text-center py-6 text-muted-foreground text-xs">
              Waiting for gifts…
            </div>
          ) : (
            staticEvents.map((event, i) => {
              const staticGiftImg = giftImageMap[event.giftName.toLowerCase()] || "";
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.04 }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent transition-colors group/gift"
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center"
                      style={{ background: `hsl(${event.color} / 0.1)`, border: `1px solid hsl(${event.color} / 0.15)` }}>
                      {staticGiftImg ? (
                        <img src={staticGiftImg} alt={event.giftName} className="w-7 h-7 object-contain" />
                      ) : (
                        <Gift size={16} style={{ color: `hsl(${event.color})` }} />
                      )}
                    </div>
                  </div>
                  <p className="text-[13px] text-foreground flex-1 truncate">
                    <span className="font-semibold">{event.user}</span>{" "}
                    <span className="text-muted-foreground">sent</span>{" "}
                    <span className="font-medium" style={{ color: "hsl(280 100% 70%)" }}>{event.giftName}</span>
                  </p>
                  {event.coins && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md flex-shrink-0"
                      style={{ background: "hsl(280 100% 65% / 0.1)", color: "hsl(280 100% 70%)" }}>
                      🪙 {event.coins.toLocaleString()}
                    </span>
                  )}
                  <span className="text-[11px] text-muted-foreground/40 flex-shrink-0">{event.time}</span>
                </motion.div>
              );
            })
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default GiftActivityFeed;
