import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VolumeX, Volume2, Mic, MicOff, Pause, Play, Timer, X, Gamepad2 } from "lucide-react";
import { toast } from "sonner";
import { useBroadcastQuickControls, type QuickControlState } from "@/hooks/use-quick-controls";

const QuickControls = () => {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<QuickControlState>({
    soundsMuted: false,
    ttsMuted: false,
    alertsPaused: false,
    cooldownActive: false,
  });

  const { broadcast } = useBroadcastQuickControls();

  // Broadcast every state change
  useEffect(() => {
    broadcast(state);
  }, [state, broadcast]);

  const toggle = (key: keyof QuickControlState, onMsg: string, offMsg: string) => {
    setState((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      toast.success(prev[key] ? offMsg : onMsg);
      return next;
    });
  };

  const toggleCooldown = () => {
    setState((prev) => {
      const next = { ...prev, cooldownActive: !prev.cooldownActive };
      if (!prev.cooldownActive) {
        toast.success("All effects paused for 5 minutes");
        setTimeout(() => {
          setState((p) => {
            const reset = { ...p, cooldownActive: false };
            broadcast(reset);
            toast.info("Cooldown ended, effects are back!");
            return reset;
          });
        }, 5 * 60 * 1000);
      } else {
        toast.success("Cooldown cancelled");
      }
      return next;
    });
  };

  const controls = [
    {
      icon: state.soundsMuted ? VolumeX : Volume2,
      label: state.soundsMuted ? "Unmute Sounds" : "Mute Sounds",
      active: state.soundsMuted,
      color: "350 90% 55%",
      onClick: () => toggle("soundsMuted", "Sound effects muted", "Sound effects enabled"),
    },
    {
      icon: state.ttsMuted ? MicOff : Mic,
      label: state.ttsMuted ? "Enable TTS" : "Mute TTS",
      active: state.ttsMuted,
      color: "200 100% 55%",
      onClick: () => toggle("ttsMuted", "TTS muted", "TTS enabled"),
    },
    {
      icon: state.alertsPaused ? Play : Pause,
      label: state.alertsPaused ? "Resume Alerts" : "Pause Alerts",
      active: state.alertsPaused,
      color: "45 100% 55%",
      onClick: () => toggle("alertsPaused", "Alerts paused", "Alerts resumed"),
    },
    {
      icon: Timer,
      label: state.cooldownActive ? "Cancel Cooldown" : "5min Cooldown",
      active: state.cooldownActive,
      color: "280 100% 65%",
      onClick: toggleCooldown,
    },
  ];

  return (
    <div className="fixed bottom-16 right-4 md:bottom-6 md:right-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.9 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-16 right-0 w-52 rounded-2xl p-[1px] mb-2"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))" }}
          >
            <div className="rounded-2xl p-3 space-y-1" style={{ background: "rgba(12,10,20,0.95)", backdropFilter: "blur(24px)" }}>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider px-2 mb-2">Quick Controls</p>
              {controls.map((ctrl) => {
                const Icon = ctrl.icon;
                return (
                  <button
                    key={ctrl.label}
                    onClick={ctrl.onClick}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors hover:bg-muted/30"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: ctrl.active ? `hsl(${ctrl.color} / 0.15)` : "rgba(255,255,255,0.04)",
                      }}
                    >
                      <Icon size={14} style={{ color: ctrl.active ? `hsl(${ctrl.color})` : "hsl(var(--muted-foreground))" }} />
                    </div>
                    <span className={`text-xs font-medium ${ctrl.active ? "text-foreground" : "text-muted-foreground"}`}>
                      {ctrl.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors"
        style={{
          background: open ? "hsl(var(--destructive))" : "hsl(var(--primary))",
          color: open ? "hsl(var(--destructive-foreground))" : "hsl(var(--primary-foreground))",
          boxShadow: open
            ? "0 0 20px hsl(var(--destructive) / 0.3)"
            : "0 0 20px hsl(160 100% 45% / 0.3)",
        }}
      >
        {open ? <X size={18} /> : <Gamepad2 size={18} />}
      </motion.button>
    </div>
  );
};

export default QuickControls;
