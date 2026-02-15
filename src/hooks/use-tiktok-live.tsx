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
  title: string;
  roomId: string;
}

export function useTikTokLive() {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [stats, setStats] = useState<LiveStats>({
    viewerCount: 0,
    likeCount: 0,
    shareCount: 0,
    diamondCount: 0,
    followerCount: 0,
    title: "",
    roomId: "",
  });
  const [events, setEvents] = useState<TikTokLiveEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
                viewerCount: Number(ri.totalViewers || ri.viewerCount || ri.currentViewers || prev.viewerCount) || 0,
                likeCount: Number(ri.likeCount || ri.totalLikes || prev.likeCount) || 0,
                shareCount: Number(ri.shareCount || ri.totalShares || prev.shareCount) || 0,
                followerCount: Number(ri.followerCount || prev.followerCount) || 0,
              }));

              if (ri.liveRoomStats) {
                const s = ri.liveRoomStats;
                setStats(prev => ({
                  ...prev,
                  viewerCount: Number(s.totalUser) || prev.viewerCount,
                  likeCount: Number(s.likeCount) || prev.likeCount,
                  shareCount: Number(s.shareCount) || prev.shareCount,
                }));
              }
            }

            if (msgType === "tiktok.connect") {
              setStatus("connected");
            }

            // Viewer count updates
            if (msgType === "WebcastRoomUserSeqMessage") {
              setStatus("connected");
              const count = Number(data.viewerCount || data.total || 0);
              if (count > 0) setStats(prev => ({ ...prev, viewerCount: count }));
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
            if (msgType === "WebcastGiftMessage") {
              const giftName = data.giftName || data.gift_name || "Unknown Gift";
              const repeatCount = Number(data.repeatCount || data.repeat_count || 1);
              const diamondCount = Number(data.diamondCount || data.diamond_count || 0);

              setStats(prev => ({
                ...prev,
                diamondCount: prev.diamondCount + (diamondCount * repeatCount),
              }));

              addEvent("gift", {
                username: data.uniqueId || data.user?.uniqueId || "unknown",
                giftName,
                repeatCount,
                diamondCount,
                avatar: data.profilePictureUrl || data.user?.profilePictureUrl,
                giftId: data.giftId,
              });
            }

            // Follow events
            if (msgType === "WebcastMemberMessage" || msgType === "WebcastSocialMessage") {
              if (msgType === "WebcastSocialMessage") {
                setStats(prev => ({ ...prev, shareCount: prev.shareCount + 1 }));
                addEvent("share", {
                  username: data.uniqueId || data.user?.uniqueId || "unknown",
                  avatar: data.profilePictureUrl || data.user?.profilePictureUrl,
                });
              }
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
