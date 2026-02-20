import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { defaultGlowAlertPopupSettings } from "@/hooks/overlay-defaults";
import useOverlayBody from "@/hooks/use-overlay-body";
import { applyUrlOverrides } from "@/lib/overlay-params";

interface PopupEvent {
  id: number;
  label: string;
  title: string;
  sub: string;
  color: string;
  icon: string;
}

const GlowAlertPopupRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams();
  const [settings, setSettings] = useState(defaultGlowAlertPopupSettings);
  const [queue, setQueue] = useState<PopupEvent[]>([]);
  const [current, setCurrent] = useState<PopupEvent | null>(null);
  const settingsRef = useRef(settings);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  const showNext = useCallback(() => {
    setQueue(q => {
      if (q.length === 0) { setCurrent(null); return q; }
      const [next, ...rest] = q;
      setCurrent(next);
      return rest;
    });
  }, []);

  useEffect(() => {
    if (current) {
      const s = settingsRef.current as any;
      const timer = setTimeout(() => {
        setCurrent(null);
        setTimeout(showNext, 400);
      }, (s.duration || 4) * 1000);
      return () => clearTimeout(timer);
    }
  }, [current, showNext]);

  const addEvent = useCallback((event: Omit<PopupEvent, "id">) => {
    const newEvent = { ...event, id: Date.now() + Math.random() };
    setQueue(q => {
      const updated = [...q, newEvent];
      if (!current && updated.length === 1) {
        setCurrent(newEvent);
        return [];
      }
      return updated;
    });
  }, [current]);

  useEffect(() => {
    if (!publicToken) return;
    const fetchWidget = async () => {
      const { data } = await supabase
        .from("overlay_widgets" as any)
        .select("settings")
        .eq("public_token", publicToken)
        .single();
      if (data) {
        setSettings(applyUrlOverrides({ ...defaultGlowAlertPopupSettings, ...(data as any).settings }) as typeof defaultGlowAlertPopupSettings);
      }
    };
    fetchWidget();
  }, [publicToken]);

  useEffect(() => {
    if (!publicToken) return;

    const channel = supabase
      .channel(`glow-alert-popup-${publicToken}`)
      .on("broadcast", { event: "gift_alert" }, (msg) => {
        const p = msg.payload || {} as any;
        addEvent({
          label: "New Gift!",
          title: `${p.username || "Viewer"} sent ${p.giftName || "a gift"}`,
          sub: `${p.repeatCount > 1 ? `×${p.repeatCount} · ` : ""}${p.coinValue || 0} coins`,
          color: "280 100% 65%",
          icon: "🎁",
        });
      })
      .on("broadcast", { event: "follow" }, (msg) => {
        const p = msg.payload || {} as any;
        addEvent({ label: "New Follow!", title: `${p.username || "Viewer"} followed you`, sub: "Welcome to the stream!", color: "160 100% 50%", icon: "👤" });
      })
      .on("broadcast", { event: "like" }, (msg) => {
        const p = msg.payload || {} as any;
        addEvent({ label: "New Like!", title: `${p.username || "Viewer"} liked your stream`, sub: `Total: ${p.totalLikes || 0} likes`, color: "350 90% 60%", icon: "❤️" });
      })
      .on("broadcast", { event: "test_alert" }, () => {
        addEvent({ label: "New Gift!", title: "Tikup_User sent Rose 🌹", sub: "×5 combo · 5 coins", color: "350 90% 60%", icon: "🎁" });
      })
      .subscribe();

    const dbChannel = supabase
      .channel(`glow-alert-popup-db-${publicToken}`)
      .on("postgres_changes" as any, { event: "UPDATE", schema: "public", table: "overlay_widgets", filter: `public_token=eq.${publicToken}` }, (payload: any) => {
        if (payload.new?.settings) setSettings({ ...defaultGlowAlertPopupSettings, ...payload.new.settings });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); supabase.removeChannel(dbChannel); };
  }, [publicToken, addEvent]);

  const s = settings as any;

  return (
    <div className={`w-screen h-screen overflow-hidden flex items-center justify-center ${s.transparent_bg ? "bg-transparent" : "bg-black"}`}>
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={current.id}
            className="relative max-w-sm w-full mx-8"
            initial={{ y: -30, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Expanding ring */}
            <motion.div className="absolute inset-0 rounded-md pointer-events-none"
              style={{ border: `1px solid hsl(${current.color} / 0.5)` }}
              initial={{ scale: 1.2, opacity: 0.8 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 0.7 }} />

            {/* Label bar */}
            <div className="relative px-4 py-1.5 rounded-t-sm text-center"
              style={{ background: `hsl(${current.color} / 0.15)`, border: `1px solid hsl(${current.color} / 0.4)`, borderBottom: "none" }}>
              <div className="absolute top-0 left-0 w-3 h-0.5" style={{ background: `hsl(${current.color})` }} />
              <div className="absolute top-0 left-0 w-0.5 h-3" style={{ background: `hsl(${current.color})` }} />
              <div className="absolute top-0 right-0 w-3 h-0.5" style={{ background: `hsl(${current.color})` }} />
              <div className="absolute top-0 right-0 w-0.5 h-3" style={{ background: `hsl(${current.color})` }} />
              <motion.p className="text-sm font-bold tracking-widest uppercase"
                style={{ color: `hsl(${current.color})`, textShadow: `0 0 12px hsl(${current.color} / 0.8)` }}
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}>
                {current.label}
              </motion.p>
            </div>

            {/* Body */}
            <div className="relative px-5 py-5 rounded-b-sm"
              style={{ background: "rgba(0,0,0,0.85)", border: `1px solid hsl(${current.color} / 0.3)`, backdropFilter: "blur(12px)" }}>
              <div className="absolute bottom-0 left-0 w-4 h-0.5" style={{ background: `hsl(${current.color})` }} />
              <div className="absolute bottom-0 left-0 w-0.5 h-4" style={{ background: `hsl(${current.color})` }} />
              <div className="absolute bottom-0 right-0 w-4 h-0.5" style={{ background: `hsl(${current.color})` }} />
              <div className="absolute bottom-0 right-0 w-0.5 h-4" style={{ background: `hsl(${current.color})` }} />

              <div className="flex items-center gap-4">
                {s.show_icon !== false && (
                  <motion.div
                    className="relative w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: `hsl(${current.color} / 0.1)`, border: `1.5px solid hsl(${current.color} / 0.4)`, boxShadow: `0 0 24px hsl(${current.color} / 0.25)` }}
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity }}>
                    <span className="text-3xl">{current.icon}</span>
                    {s.ring_animation !== false && (
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 64 64">
                        <motion.circle cx="32" cy="32" r="28" fill="none"
                          stroke={`hsl(${current.color} / 0.5)`} strokeWidth="1"
                          strokeDasharray="10 5"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                          style={{ transformOrigin: "32px 32px" }} />
                      </svg>
                    )}
                  </motion.div>
                )}

                <div className="flex-1 min-w-0">
                  <motion.p className="text-base font-bold text-white leading-tight"
                    style={{ textShadow: "0 0 10px rgba(255,255,255,0.3)" }}
                    initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
                    {current.title}
                  </motion.p>
                  {s.show_sub_text !== false && (
                    <motion.p className="text-sm mt-1"
                      style={{ color: `hsl(${current.color} / 0.75)` }}
                      initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.25 }}>
                      {current.sub}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Scan line */}
              {s.scan_line !== false && (
                <motion.div className="absolute left-0 right-0 h-px pointer-events-none"
                  style={{ background: `linear-gradient(90deg, transparent, hsl(${current.color} / 0.4), transparent)` }}
                  animate={{ top: ["20%", "90%", "20%"] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} />
              )}

              <div className="absolute bottom-0 left-[10%] right-[10%] h-px"
                style={{ background: `linear-gradient(90deg, transparent, hsl(${current.color} / 0.6), transparent)` }} />
            </div>

            {/* External glow */}
            <div className="absolute -inset-4 rounded-xl pointer-events-none blur-xl"
              style={{ background: `radial-gradient(ellipse, hsl(${current.color} / 0.12), transparent 70%)` }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlowAlertPopupRenderer;
