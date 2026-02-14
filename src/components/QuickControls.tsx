import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VolumeX, Volume2, Mic, MicOff, Pause, Play, Timer, X, Gamepad2 } from "lucide-react";
import { toast } from "sonner";

const QuickControls = () => {
  const [open, setOpen] = useState(false);
  const [soundsMuted, setSoundsMuted] = useState(false);
  const [ttsMuted, setTtsMuted] = useState(false);
  const [alertsPaused, setAlertsPaused] = useState(false);
  const [cooldownActive, setCooldownActive] = useState(false);

  const toggleSounds = () => {
    setSoundsMuted(!soundsMuted);
    toast.success(soundsMuted ? "Sound effects enabled" : "Sound effects muted");
  };

  const toggleTTS = () => {
    setTtsMuted(!ttsMuted);
    toast.success(ttsMuted ? "TTS enabled" : "TTS muted");
  };

  const toggleAlerts = () => {
    setAlertsPaused(!alertsPaused);
    toast.success(alertsPaused ? "Alerts resumed" : "Alerts paused for 5 minutes");
  };

  const toggleCooldown = () => {
    setCooldownActive(!cooldownActive);
    if (!cooldownActive) {
      toast.success("All effects paused for 5 minutes");
      setTimeout(() => {
        setCooldownActive(false);
        toast.info("Cooldown ended, effects are back!");
      }, 5 * 60 * 1000);
    } else {
      toast.success("Cooldown cancelled");
    }
  };

  const controls = [
    {
      icon: soundsMuted ? VolumeX : Volume2,
      label: soundsMuted ? "Unmute Sounds" : "Mute Sounds",
      active: soundsMuted,
      color: "350 90% 55%",
      onClick: toggleSounds,
    },
    {
      icon: ttsMuted ? MicOff : Mic,
      label: ttsMuted ? "Enable TTS" : "Mute TTS",
      active: ttsMuted,
      color: "200 100% 55%",
      onClick: toggleTTS,
    },
    {
      icon: alertsPaused ? Play : Pause,
      label: alertsPaused ? "Resume Alerts" : "Pause Alerts",
      active: alertsPaused,
      color: "45 100% 55%",
      onClick: toggleAlerts,
    },
    {
      icon: Timer,
      label: cooldownActive ? "Cancel Cooldown" : "5min Cooldown",
      active: cooldownActive,
      color: "280 100% 65%",
      onClick: toggleCooldown,
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
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
