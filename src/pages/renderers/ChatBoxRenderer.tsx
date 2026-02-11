import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { defaultChatBoxSettings } from "@/hooks/use-overlay-widgets";
import useOverlayBody from "@/hooks/use-overlay-body";

interface ChatMessage {
  id: number;
  user: string;
  text: string;
  type: string;
  timestamp: number;
}

const userColors = [
  "hsl(280 100% 70%)", "hsl(160 100% 50%)", "hsl(200 100% 60%)",
  "hsl(350 90% 60%)", "hsl(45 100% 60%)", "hsl(120 80% 55%)",
];

const getAnimVariants = (style: string) => {
  switch (style) {
    case "fade": return { initial: { opacity: 0 }, animate: { opacity: 1 } };
    case "pop": return { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 } };
    default: return { initial: { opacity: 0, x: -30 }, animate: { opacity: 1, x: 0 } };
  }
};

const ChatBoxRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const [settings, setSettings] = useState(defaultChatBoxSettings);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);

  // Fetch widget settings
  useEffect(() => {
    if (!publicToken) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("overlay_widgets" as any)
        .select("settings")
        .eq("public_token", publicToken)
        .single();
      if (data) setSettings({ ...defaultChatBoxSettings, ...(data as any).settings });
    };
    fetch();
  }, [publicToken]);

  // Realtime
  useEffect(() => {
    if (!publicToken) return;

    const channel = supabase
      .channel(`chat-box-${publicToken}`)
      .on("broadcast", { event: "chat_message" }, (msg) => {
        const m = msg.payload as Omit<ChatMessage, "id" | "timestamp">;
        setMessages(prev => {
          const updated = [...prev, { ...m, id: Date.now(), timestamp: Date.now() }];
          return updated.slice(-settings.max_messages);
        });
      })
      .subscribe(status => setConnected(status === "SUBSCRIBED"));

    // Settings updates
    const dbChannel = supabase
      .channel(`chat-box-db-${publicToken}`)
      .on("postgres_changes" as any, {
        event: "UPDATE", schema: "public", table: "overlay_widgets",
        filter: `public_token=eq.${publicToken}`,
      }, (payload: any) => {
        if (payload.new?.settings) setSettings({ ...defaultChatBoxSettings, ...payload.new.settings });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(dbChannel);
    };
  }, [publicToken, settings.max_messages]);

  // Fade old messages
  useEffect(() => {
    if (!settings.message_fade_time || messages.length === 0) return;
    const timer = setInterval(() => {
      const cutoff = Date.now() - settings.message_fade_time * 1000;
      setMessages(prev => prev.filter(m => m.timestamp > cutoff));
    }, 1000);
    return () => clearInterval(timer);
  }, [settings.message_fade_time, messages]);

  const variants = getAnimVariants(settings.message_animation);
  const mode = settings.display_mode;

  const getBg = (type: string) => {
    if (mode === "minimal") return "bg-black/30";
    if (mode === "twitch") return "bg-[rgba(24,24,27,0.9)]";
    if (mode === "glass") return "bg-white/[0.04] backdrop-blur-lg";
    if (settings.highlight_gifts && type === "gift") return "bg-[hsl(280,100%,65%,0.08)] border-[hsl(280,100%,65%/0.2)]";
    return "bg-[rgba(0,0,0,0.55)] backdrop-blur-lg border-white/[0.06]";
  };

  return (
    <div className={`w-screen h-screen overflow-hidden flex items-end justify-start p-6 ${settings.transparent_bg ? "bg-transparent" : "bg-black"}`}>
      <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-20">
        <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
        <span className="text-[9px] text-white/50 font-mono">{connected ? "Live" : "..."}</span>
      </div>

      <div className="w-[360px] flex flex-col gap-1.5">
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              layout
              initial={variants.initial}
              animate={variants.animate}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <div className={`flex items-start gap-2 px-3.5 py-2 rounded-2xl border ${getBg(msg.type)}`}
                style={{ fontSize: settings.font_size }}>
                <span className="font-semibold flex-shrink-0" style={{
                  color: settings.username_color_auto ? userColors[msg.user.length % userColors.length] : "hsl(280 100% 70%)",
                  fontSize: settings.font_size - 2,
                }}>
                  {msg.user}
                </span>
                <span className="text-white/80 leading-relaxed" style={{ fontSize: settings.font_size - 2 }}>
                  {msg.text}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {messages.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/10 text-xs font-mono">Waiting for chat messages...</p>
        </div>
      )}

      {settings.custom_css && <style dangerouslySetInnerHTML={{ __html: settings.custom_css }} />}
    </div>
  );
};

export default ChatBoxRenderer;
