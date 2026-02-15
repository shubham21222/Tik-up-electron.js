import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error" | "not_live";

export interface TikTokLiveEvent {
  type: string;
  data: Record<string, unknown>;
  timestamp: number;
}

export interface LiveStats {
  viewerCount: number;
  likeCount: number;
  shareCount: number;
  diamondCount: number;
  followerCount: number;
  giftCoins: number;
  title: string;
  roomId: string;
}

type GiftMapEntry = { name: string; diamond: number; coinValue: number };
type GiftMap = Record<string, GiftMapEntry>;

export function useTikTokLive() {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [stats, setStats] = useState<LiveStats>({
    viewerCount: 0,
    likeCount: 0,
    shareCount: 0,
    diamondCount: 0,
    followerCount: 0,
    giftCoins: 0,
    title: "",
    roomId: "",
  });
  const [events, setEvents] = useState<TikTokLiveEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const giftMapRef = useRef<GiftMap>({});

  const addEvent = useCallback((type: string, data: Record<string, unknown>) => {
    setEvents(prev => {
      const next = [{ type, data, timestamp: Date.now() }, ...prev];
      return next.slice(0, 100); // Keep last 100 events
    });
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close(1000);
      wsRef.current = null;
    }
    setStatus("disconnected");
    setError(null);
  }, []);

  const connect = useCallback(async () => {
    disconnect();
    setStatus("connecting");
    setError(null);

    try {
      // Get JWT from edge function
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setStatus("error");
        setError("Not authenticated");
        return;
      }

      const res = await supabase.functions.invoke("euler-jwt");
      
      if (res.error) {
        setStatus("error");
        setError(res.error.message || "Failed to get connection token");
        return;
      }

      const { wsUrl, uniqueId } = res.data as { wsUrl: string; uniqueId: string; mode: string };

      if (!wsUrl) {
        setStatus("error");
        setError("No WebSocket URL received");
        return;
      }

      // Load gift map for enriching gift events (fire and forget, don't block connect)
      if (Object.keys(giftMapRef.current).length === 0) {
        // We'll load gift map once we have a room_id from roomInfo message
        console.log("Gift map will load after roomInfo provides room_id");
      }

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log(`WebSocket connected for @${uniqueId}`);
      };

      ws.onmessage = (event) => {
        try {
          const raw = JSON.parse(typeof event.data === "string" ? event.data : "{}");
          const messages = raw.messages || [raw];

          for (const msg of messages) {
            const msgType = msg.type || msg.event || "";
            const data = msg.data || msg;

            // Room info (first message)
            if (msgType === "roomInfo" || data.roomInfo) {
              const ri = data.roomInfo || data;
              setStatus("connected");

              setStats(prev => ({
                ...prev,
                roomId: String(ri.id || prev.roomId),
                title: ri.title || prev.title,
                viewerCount: Number(ri.currentViewers || ri.viewerCount || prev.viewerCount) || 0,
                likeCount: Number(ri.likeCount || ri.totalLikes || prev.likeCount) || 0,
                shareCount: Number(ri.shareCount || ri.totalShares || prev.shareCount) || 0,
                followerCount: Number(ri.followerCount || prev.followerCount) || 0,
              }));

              // Load gift map using room_id
              const roomId = String(ri.id || "");
              if (roomId && Object.keys(giftMapRef.current).length === 0) {
                supabase.auth.getSession().then(({ data: sess }) => {
                  if (!sess?.session) return;
                  fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gift-map?room_id=${roomId}`, {
                    headers: { Authorization: `Bearer ${sess.session.access_token}` },
                  })
                    .then(r => r.json())
                    .then(giftData => {
                      if (giftData.gifts && Object.keys(giftData.gifts).length > 0) {
                        giftMapRef.current = giftData.gifts;
                        console.log(`💎 Gift map loaded: ${giftData.count} gifts`);
                      }
                    })
                    .catch(e => console.error("Failed to load gift map:", e));
                });
              }

              if (ri.liveRoomStats) {
                const s = ri.liveRoomStats;
                // Don't use totalUser for viewer count — it's cumulative, not current
                setStats(prev => ({
                  ...prev,
                  likeCount: Number(s.likeCount) || prev.likeCount,
                  shareCount: Number(s.shareCount) || prev.shareCount,
                }));
              }
            }

            if (msgType === "tiktok.connect") {
              setStatus("connected");
            }

            // Room user sequence — confirms we're live but viewer count is often inflated
            if (msgType === "WebcastRoomUserSeqMessage") {
              setStatus("connected");
            }

            // Like updates
            if (msgType === "WebcastLikeMessage") {
              const total = Number(data.totalLikeCount || data.likeCount || 0);
              if (total > 0) setStats(prev => ({ ...prev, likeCount: total }));
              addEvent("like", {
                username: data.uniqueId || data.user?.uniqueId || "unknown",
                likeCount: data.likeCount || 1,
                avatar: data.profilePictureUrl || data.user?.profilePictureUrl,
              });
            }

            // Gift events
            // Gift events — enrich with gift map
            if (msgType === "WebcastGiftMessage") {
              const giftId = String(data.giftId || data.gift_id || "");
              const mapEntry = giftMapRef.current[giftId];
              const giftName = data.giftName || data.gift_name || mapEntry?.name || "Unknown Gift";
              const repeatCount = Number(data.repeatCount || data.repeat_count || 1);
              const diamondCount = Number(data.diamondCount || data.diamond_count || mapEntry?.diamond || 0);
              const coinValue = Number(data.coinValue || data.coin_value || mapEntry?.coinValue || diamondCount);

              setStats(prev => ({
                ...prev,
                diamondCount: prev.diamondCount + (diamondCount * repeatCount),
                giftCoins: prev.giftCoins + (coinValue * repeatCount),
              }));

              const giftPayload = {
                username: data.uniqueId || data.user?.uniqueId || "unknown",
                giftName,
                repeatCount,
                diamondCount,
                coinValue,
                avatar: data.profilePictureUrl || data.user?.profilePictureUrl,
                giftId,
                total_coins: coinValue * repeatCount,
              };

              addEvent("gift", giftPayload);

              // Persist gift to events_log for reliable tracking
              supabase.auth.getSession().then(({ data: sessionData }) => {
                if (sessionData?.session?.user?.id) {
                  supabase.from("events_log").insert({
                    user_id: sessionData.session.user.id,
                    event_type: "gift",
                    payload: giftPayload,
                  }).then(({ error: insertErr }) => {
                    if (insertErr) console.error("Failed to persist gift:", insertErr);
                  });
                }
              });
            }

            // Follow & Social events
            if (msgType === "WebcastMemberMessage") {
              // Member join — also counts as a follow on TikTok LIVE
              setStats(prev => ({ ...prev, followerCount: prev.followerCount + 1 }));
              addEvent("follow", {
                username: data.uniqueId || data.user?.uniqueId || "unknown",
                avatar: data.profilePictureUrl || data.user?.profilePictureUrl,
              });
            }

            if (msgType === "WebcastSocialMessage") {
              setStats(prev => ({ ...prev, shareCount: prev.shareCount + 1 }));
              addEvent("share", {
                username: data.uniqueId || data.user?.uniqueId || "unknown",
                avatar: data.profilePictureUrl || data.user?.profilePictureUrl,
              });
            }

            // Chat events
            if (msgType === "WebcastChatMessage") {
              addEvent("chat", {
                username: data.uniqueId || data.user?.uniqueId || "unknown",
                message: data.comment || data.content || "",
                avatar: data.profilePictureUrl || data.user?.profilePictureUrl,
              });
            }

            // Generic viewer count fallback
            if (data.viewerCount !== undefined && stats.viewerCount === 0) {
              setStatus("connected");
              setStats(prev => ({ ...prev, viewerCount: Number(data.viewerCount) }));
            }
          }
        } catch (e) {
          console.error("WS parse error:", e);
        }
      };

      ws.onerror = () => {
        console.error("WebSocket error");
        setStatus("error");
        setError("Connection error");
      };

      ws.onclose = (event) => {
        console.log(`WebSocket closed: code=${event.code}`);
        wsRef.current = null;

        // Handle close codes (EulerStream ClientCloseCode)
        switch (event.code) {
          case 4404: // NOT_LIVE
            setStatus("not_live");
            setError("User is not currently LIVE");
            break;
          case 4401: // INVALID_AUTH
          case 4403: // NO_PERMISSION
          case 4400: // INVALID_OPTIONS
            setStatus("error");
            setError("Authentication failed");
            break;
          case 4429: // TOO_MANY_CONNECTIONS
            setStatus("error");
            setError("Too many connections. Try again later.");
            break;
          case 4005: // STREAM_END
            setStatus("disconnected");
            setError("Stream ended");
            break;
          case 4006: // NO_MESSAGES_TIMEOUT
            // Dead connection, reconnect
            reconnectTimerRef.current = setTimeout(() => connect(), 3000);
            break;
          case 4555: // MAX_LIFETIME_EXCEEDED
            // Auto-reconnect
            reconnectTimerRef.current = setTimeout(() => connect(), 2000);
            break;
          case 4500: // TIKTOK_CLOSED_CONNECTION
            reconnectTimerRef.current = setTimeout(() => connect(), 5000);
            break;
          case 4556: // WEBCAST_FETCH_ERROR
          case 4557: // ROOM_INFO_FETCH_ERROR
            setStatus("error");
            setError("Failed to fetch stream data");
            break;
          case 1011: // INTERNAL_SERVER_ERROR
            setStatus("error");
            setError("Server error. Try again.");
            break;
          case 1000: // NORMAL
            setStatus("disconnected");
            break;
          default:
            if (status === "connected") {
              reconnectTimerRef.current = setTimeout(() => connect(), 5000);
            } else {
              setStatus("error");
              setError(`Disconnected (code: ${event.code})`);
            }
        }
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Connection failed";
      setStatus("error");
      setError(msg);
    }
  }, [disconnect, addEvent]);

  // Load historical gift coins from events_log on mount
  const loadHistoricalGifts = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
      const { data: giftEvents } = await supabase
        .from("events_log")
        .select("payload")
        .eq("user_id", session.user.id)
        .eq("event_type", "gift")
        .gte("created_at", twelveHoursAgo);

      if (!giftEvents || giftEvents.length === 0) return;

      let totalCoins = 0;
      for (const event of giftEvents) {
        const payload = event.payload as Record<string, unknown> | null;
        if (!payload) continue;
        const coins = Number(payload.total_coins || payload.coinValue || payload.coin_value || 0);
        if (coins > 0) {
          totalCoins += coins;
        } else {
          const dc = Number(payload.diamond_count || payload.diamondCount || 0);
          const rc = Number(payload.repeat_count || payload.repeatCount || 1);
          totalCoins += dc * rc;
        }
      }

      if (totalCoins > 0) {
        setStats(prev => ({
          ...prev,
          giftCoins: Math.max(prev.giftCoins, totalCoins),
        }));
      }
    } catch (e) {
      console.error("Failed to load historical gifts:", e);
    }
  }, []);

  // Load history on mount
  useEffect(() => {
    loadHistoricalGifts();
  }, [loadHistoricalGifts]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) wsRef.current.close(1000);
    };
  }, []);

  return {
    status,
    stats,
    events,
    error,
    connect,
    disconnect,
  };
}
