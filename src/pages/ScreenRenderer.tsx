import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import useOverlayBody from "@/hooks/use-overlay-body";

interface OverlayAction {
  id: string;
  event_type: string;
  payload: Record<string, unknown>;
  automations: unknown[];
}

const ScreenRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const [connected, setConnected] = useState(false);
  const [queue, setQueue] = useState<OverlayAction[]>([]);
  const [currentAction, setCurrentAction] = useState<OverlayAction | null>(null);

  useEffect(() => {
    if (!publicToken) return;

    // Subscribe to broadcast channel for this screen
    const channel = supabase
      .channel(`screen-${publicToken}`)
      .on("broadcast", { event: "overlay_action" }, (payload) => {
        const action: OverlayAction = {
          id: payload.payload.event_id || crypto.randomUUID(),
          event_type: payload.payload.event_type,
          payload: payload.payload.payload,
          automations: payload.payload.automations || [],
        };
        setQueue((prev) => [...prev, action]);
      })
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [publicToken]);

  // Process queue
  useEffect(() => {
    if (currentAction || queue.length === 0) return;

    const next = queue[0];
    setCurrentAction(next);
    setQueue((prev) => prev.slice(1));

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setCurrentAction(null);
    }, 5000);
  }, [queue, currentAction]);

  return (
    <div className="w-screen h-screen bg-transparent relative overflow-hidden">
      {/* Connection indicator (only visible in dev) */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-30">
        <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
        <span className="text-[10px] text-white/50 font-mono">
          {connected ? "Connected" : "Connecting..."}
        </span>
      </div>

      {/* Render current action */}
      <AnimatePresence>
        {currentAction && (
          <motion.div
            key={currentAction.id}
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Default alert overlay */}
            <div className="relative">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-[hsl(160,100%,45%/0.3)] to-[hsl(350,90%,55%/0.3)] blur-sm" />
              <div className="relative rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 px-8 py-6 text-center min-w-[300px]">
                <p className="text-2xl mb-2">
                  {currentAction.event_type === "gift" ? "🎁" :
                   currentAction.event_type === "follow" ? "👤" :
                   currentAction.event_type === "like" ? "❤️" :
                   currentAction.event_type === "share" ? "🔗" : "⚡"}
                </p>
                <p className="text-white font-bold text-lg">
                  {(currentAction.payload as Record<string, string>).username || "Viewer"}
                </p>
                <p className="text-white/60 text-sm mt-1">
                  {currentAction.event_type === "gift"
                    ? `sent ${(currentAction.payload as Record<string, string>).gift_name || "a gift"}!`
                    : currentAction.event_type === "follow"
                    ? "just followed!"
                    : currentAction.event_type === "like"
                    ? "liked the stream!"
                    : currentAction.event_type === "share"
                    ? "shared the stream!"
                    : "triggered an event!"}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Idle state */}
      {!currentAction && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/10 text-xs font-mono">TikUp Overlay Ready</p>
        </div>
      )}
    </div>
  );
};

export default ScreenRenderer;
