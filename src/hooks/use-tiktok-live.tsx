import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { devLog, devError } from "@/lib/dev-log";

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
  const eventBatchRef = useRef<Array<{ type: string; username: string; data: Record<string, unknown> }>>([]);
  const batchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tiktokUsernameRef = useRef<string>("");
  // Track combo gift repeat counts to only add the delta (TikTok sends cumulative repeatCount per combo)
  const comboTrackerRef = useRef<Record<string, number>>({});

  const addEvent = useCallback((type: string, data: Record<string, unknown>) => {
    setEvents(prev => {
      const next = [{ type, data, timestamp: Date.now() }, ...prev];
      return next.slice(0, 100); // Keep last 100 events
    });
  }, []);

  /** Queue an event for batched webhook processing (points, moderation, automation) */
  const queueWebhookEvent = useCallback((type: string, username: string, data: Record<string, unknown>) => {
    eventBatchRef.current.push({ type, username, data });

    // Chat events flush immediately for low-latency TTS; others batch every 3s
    if (type === "chat") {
      if (batchTimerRef.current) {
        clearTimeout(batchTimerRef.current);
        batchTimerRef.current = null;
      }
      flushEventBatch();
    } else if (!batchTimerRef.current) {
      batchTimerRef.current = setTimeout(() => flushEventBatch(), 3000);
    }
  }, []);

  /** Flush batched events to tiktok-webhook for points upsert, moderation, etc. */
  const flushEventBatch = useCallback(async () => {
    batchTimerRef.current = null;
    const batch = eventBatchRef.current.splice(0);
    if (batch.length === 0 || !tiktokUsernameRef.current) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tiktok-webhook`;
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          tiktok_username: tiktokUsernameRef.current,
          events: batch,
        }),
      });
    } catch (e) {
      devError("Failed to flush event batch to webhook:", e);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (batchTimerRef.current) {
      clearTimeout(batchTimerRef.current);
      batchTimerRef.current = null;
    }
    // Flush remaining events before disconnecting
    flushEventBatch();

    // Show session summary if we were connected and had activity
    if (wsRef.current && (stats.giftCoins > 0 || stats.likeCount > 0 || stats.followerCount > 0)) {
      toast("📊 Session Summary", {
        description: `🪙 ${stats.giftCoins.toLocaleString()} coins · 💎 ${stats.diamondCount.toLocaleString()} diamonds · ❤️ ${stats.likeCount.toLocaleString()} likes · 👥 ${stats.followerCount.toLocaleString()} followers · 🔄 ${stats.shareCount.toLocaleString()} shares`,
        duration: 8000,
      });
    }

    if (wsRef.current) {
      wsRef.current.close(1000);
      wsRef.current = null;
    }
    comboTrackerRef.current = {};
    setStatus("disconnected");
    setError(null);
  }, [flushEventBatch, stats]);

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
      tiktokUsernameRef.current = uniqueId;

      if (!wsUrl) {
        setStatus("error");
        setError("No WebSocket URL received");
        return;
      }

      // Load gift map for enriching gift events (fire and forget, don't block connect)
      if (Object.keys(giftMapRef.current).length === 0) {
        // We'll load gift map once we have a room_id from roomInfo message
        devLog("Gift map will load after roomInfo provides room_id");
      }

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        devLog(`WebSocket connected for @${uniqueId}`);
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
                const giftMapUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gift-map?room_id=${roomId}`;
                fetch(giftMapUrl, {
                  headers: {
                    Authorization: `Bearer ${session?.access_token}`,
                    apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
                  },
                })
                  .then(r => r.json())
                  .then(giftData => {
                    if (giftData?.gifts && Object.keys(giftData.gifts).length > 0) {
                      giftMapRef.current = giftData.gifts;
                      devLog(`💎 Gift map loaded: ${Object.keys(giftData.gifts).filter((k: string) => !k.startsWith("name:")).length} gifts`);
                    }
                  })
                  .catch(e => devError("Failed to load gift map:", e));
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
              const likePayload = {
                username: data.uniqueId || data.user?.uniqueId || "unknown",
                likeCount: data.likeCount || 1,
                avatar: data.profilePictureUrl || data.user?.profilePictureUrl,
              };
              addEvent("like", likePayload);
              queueWebhookEvent("like", likePayload.username as string, likePayload);
            }

            // Gift events — enrich with gift map
            if (msgType === "WebcastGiftMessage") {
              const giftId = String(data.giftId || data.gift_id || "");
              const mapEntry = giftMapRef.current[giftId];
              const giftName = data.giftName || data.gift_name || mapEntry?.name || "Unknown Gift";
              const repeatCount = Number(data.repeatCount || data.repeat_count || 1);
              const diamondCount = Number(data.diamondCount || data.diamond_count || mapEntry?.diamond || 0);
              const coinValue = Number(data.coinValue || data.coin_value || mapEntry?.coinValue || diamondCount);
              const senderUsername = data.uniqueId || data.user?.uniqueId || "unknown";

              // TikTok combo gifts send cumulative repeatCount — only add the delta
              const comboKey = `${senderUsername}:${giftId}`;
              const prevRepeat = comboTrackerRef.current[comboKey] || 0;
              const deltaRepeat = Math.max(repeatCount - prevRepeat, 1);
              comboTrackerRef.current[comboKey] = repeatCount;

              // Clear combo tracker entry after 10s of no updates (combo ended)
              setTimeout(() => {
                if (comboTrackerRef.current[comboKey] === repeatCount) {
                  delete comboTrackerRef.current[comboKey];
                }
              }, 10000);

              setStats(prev => ({
                ...prev,
                diamondCount: prev.diamondCount + (diamondCount * deltaRepeat),
                giftCoins: prev.giftCoins + (coinValue * deltaRepeat),
              }));

              const giftPayload = {
                username: senderUsername,
                giftName,
                repeatCount: deltaRepeat,
                diamondCount,
                coinValue,
                avatar: data.profilePictureUrl || data.user?.profilePictureUrl,
                giftId,
                total_coins: coinValue * deltaRepeat,
              };

              addEvent("gift", giftPayload);
              queueWebhookEvent("gift", giftPayload.username as string, giftPayload);
            }

            // Follow & Social events
            if (msgType === "WebcastMemberMessage") {
              // Member join — also counts as a follow on TikTok LIVE
              setStats(prev => ({ ...prev, followerCount: prev.followerCount + 1 }));
              const followPayload = {
                username: data.uniqueId || data.user?.uniqueId || "unknown",
                avatar: data.profilePictureUrl || data.user?.profilePictureUrl,
              };
              addEvent("follow", followPayload);
              queueWebhookEvent("follow", followPayload.username as string, followPayload);
            }

            if (msgType === "WebcastSocialMessage") {
              setStats(prev => ({ ...prev, shareCount: prev.shareCount + 1 }));
              const sharePayload = {
                username: data.uniqueId || data.user?.uniqueId || "unknown",
                avatar: data.profilePictureUrl || data.user?.profilePictureUrl,
              };
              addEvent("share", sharePayload);
              queueWebhookEvent("share", sharePayload.username as string, sharePayload);
            }

            // Chat events
            if (msgType === "WebcastChatMessage") {
              const chatPayload = {
                username: data.uniqueId || data.user?.uniqueId || "unknown",
                message: data.comment || data.content || "",
                avatar: data.profilePictureUrl || data.user?.profilePictureUrl,
              };
              addEvent("chat", chatPayload);
              queueWebhookEvent("chat", chatPayload.username as string, chatPayload);
            }


            // Generic viewer count fallback
            if (data.viewerCount !== undefined && stats.viewerCount === 0) {
              setStatus("connected");
              setStats(prev => ({ ...prev, viewerCount: Number(data.viewerCount) }));
            }
          }
        } catch (e) {
          devError("WS parse error:", e);
        }
      };

      ws.onerror = () => {
        devError("WebSocket error");
        setStatus("error");
        setError("Connection error");
      };

      ws.onclose = (event) => {
        devLog(`WebSocket closed: code=${event.code}`);
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
  }, [disconnect, addEvent, queueWebhookEvent]);


  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (batchTimerRef.current) clearTimeout(batchTimerRef.current);
      // Flush remaining events
      flushEventBatch();
      if (wsRef.current) wsRef.current.close(1000);
    };
  }, [flushEventBatch]);

  return {
    status,
    stats,
    events,
    error,
    connect,
    disconnect,
  };
}
