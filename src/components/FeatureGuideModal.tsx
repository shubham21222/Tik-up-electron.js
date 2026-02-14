import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Sparkles, Eye, Palette, Volume2, Rocket } from "lucide-react";
import tikupLogo from "@/assets/tikup_logo.png";

export interface GuideStep {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  bullets: string[];
  visual: React.ReactNode;
}

interface FeatureGuideModalProps {
  open: boolean;
  onClose: () => void;
  featureKey: string;
  title: string;
  steps: GuideStep[];
}

const defaultAlertSteps: GuideStep[] = [
  {
    icon: <Sparkles size={20} />,
    title: "Welcome to Alert Styles!",
    subtitle: "See your alert pop up LIVE when gifts are sent 💜",
    bullets: [
      "Preview effects instantly",
      "Pick animations that match your vibe",
      "Sync sounds to every alert",
      "Trigger alerts automatically",
    ],
    visual: <WelcomeVisual />,
  },
  {
    icon: <Eye size={20} />,
    title: "Enable Alerts in One Tap",
    subtitle: "Turn alerts ON so viewers see effects live",
    bullets: [
      "Viewers see effects live on stream",
      "Your stream feels more alive",
      "Gifts and follows get rewarded",
    ],
    visual: <ToggleVisual />,
  },
  {
    icon: <Palette size={20} />,
    title: "Pick Your Style",
    subtitle: "Tap any style card to preview it instantly ✨",
    bullets: [
      "Free TikUp Signature animation",
      "PRO styles: Neon Pulse, Cosmic Burst & more",
      "Each style has unique motion effects",
    ],
    visual: <StylesVisual />,
  },
  {
    icon: <Volume2 size={20} />,
    title: "Sound Too!",
    subtitle: "Pick a sound for your alert",
    bullets: [
      "Default Chime — classic & clean",
      "Sparkle Burst — magical vibes",
      "Bass Pulse — heavy impact",
      "Tap any sound to hear it!",
    ],
    visual: <SoundVisual />,
  },
  {
    icon: <Rocket size={20} />,
    title: "You're Ready! 🎉",
    subtitle: "Your alerts will now show live",
    bullets: [
      "Works in TikTok LIVE Studio",
      "Works in OBS / Streamlabs",
      "Viewable on TikUp Dashboard",
      "💡 Pro Tip: Premium styles unlock extra animations",
    ],
    visual: <ReadyVisual />,
  },
];

function WelcomeVisual() {
  return (
    <div className="relative flex items-center justify-center h-full">
      <motion.img
        src={tikupLogo}
        alt="TikUp"
        className="w-20 h-20 object-contain relative z-10"
        animate={{
          y: [0, -8, 0],
          scale: [1, 1.05, 1],
          filter: [
            "drop-shadow(0 0 12px hsl(280 100% 65% / 0.3))",
            "drop-shadow(0 0 24px hsl(280 100% 65% / 0.6))",
            "drop-shadow(0 0 12px hsl(280 100% 65% / 0.3))",
          ],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 4 + Math.random() * 6,
            height: 4 + Math.random() * 6,
            background: i % 2 === 0 ? "hsl(280 100% 65% / 0.4)" : "hsl(160 100% 50% / 0.4)",
          }}
          animate={{
            x: [0, (Math.random() - 0.5) * 80],
            y: [0, (Math.random() - 0.5) * 60],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.4,
          }}
        />
      ))}
    </div>
  );
}

function ToggleVisual() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setOn(prev => !prev), 1500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex items-center justify-center h-full">
      <motion.div
        className="w-20 h-10 rounded-full relative cursor-pointer"
        animate={{
          background: on
            ? "linear-gradient(135deg, hsl(160 100% 45% / 0.3), hsl(160 100% 45% / 0.15))"
            : "rgba(255,255,255,0.06)",
          borderColor: on ? "hsl(160 100% 45% / 0.3)" : "rgba(255,255,255,0.1)",
        }}
        style={{ border: "2px solid" }}
      >
        <motion.div
          className="w-7 h-7 rounded-full absolute top-[3px]"
          animate={{
            left: on ? 40 : 4,
            background: on ? "hsl(160 100% 50%)" : "hsl(0 0% 40%)",
            boxShadow: on ? "0 0 16px hsl(160 100% 50% / 0.5)" : "none",
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </motion.div>
      <AnimatePresence>
        {on && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            className="ml-3 text-sm font-bold"
            style={{ color: "hsl(160 100% 50%)" }}
          >
            LIVE!
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

function StylesVisual() {
  const styles = [
    { name: "TikUp", color: "hsl(160 100% 50%)", free: true },
    { name: "Neon", color: "hsl(280 100% 65%)", free: false },
    { name: "Cosmic", color: "hsl(200 100% 60%)", free: false },
  ];
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive(p => (p + 1) % styles.length), 1200);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex items-center justify-center gap-3 h-full">
      {styles.map((s, i) => (
        <motion.div
          key={s.name}
          className="rounded-xl px-3 py-2 text-center relative"
          animate={{
            scale: i === active ? 1.1 : 0.95,
            opacity: i === active ? 1 : 0.5,
            borderColor: i === active ? s.color : "rgba(255,255,255,0.06)",
            boxShadow: i === active ? `0 0 20px ${s.color.replace(")", " / 0.3)")}` : "none",
          }}
          style={{
            border: "1px solid",
            background: "rgba(255,255,255,0.03)",
          }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <span className="text-[10px] font-bold" style={{ color: s.color }}>{s.name}</span>
          {!s.free && (
            <span className="block text-[7px] font-bold mt-0.5" style={{ color: "hsl(280 100% 70%)" }}>PRO</span>
          )}
        </motion.div>
      ))}
    </div>
  );
}

function SoundVisual() {
  const bars = 8;
  return (
    <div className="flex items-end justify-center gap-1.5 h-full pb-4">
      {[...Array(bars)].map((_, i) => (
        <motion.div
          key={i}
          className="w-2.5 rounded-full"
          style={{ background: i % 2 === 0 ? "hsl(280 100% 65%)" : "hsl(160 100% 50%)" }}
          animate={{
            height: [8, 20 + Math.random() * 30, 8],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 0.6 + Math.random() * 0.4,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
}

function ReadyVisual() {
  return (
    <div className="flex items-center justify-center h-full">
      <motion.div
        className="text-5xl"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        🎉
      </motion.div>
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            background: ["hsl(280 100% 65%)", "hsl(160 100% 50%)", "hsl(45 100% 60%)", "hsl(340 100% 60%)"][i % 4],
          }}
          animate={{
            x: [0, (Math.random() - 0.5) * 120],
            y: [0, (Math.random() - 0.5) * 80],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 1.5 + Math.random(),
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}

const FeatureGuideModal = ({
  open,
  onClose,
  featureKey,
  title,
  steps: customSteps,
}: FeatureGuideModalProps) => {
  const [step, setStep] = useState(0);
  const steps = customSteps.length > 0 ? customSteps : defaultAlertSteps;
  const current = steps[step];
  const isLast = step === steps.length - 1;
  const isFirst = step === 0;

  // Save "seen" flag
  useEffect(() => {
    if (!open) setStep(0);
  }, [open]);

  const handleDone = () => {
    localStorage.setItem(`tikup_guide_seen_${featureKey}`, "true");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
            onClick={handleDone}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-md rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(180deg, hsl(280 40% 8%), hsl(0 0% 4%))",
              border: "1px solid hsl(280 100% 65% / 0.15)",
              boxShadow: "0 0 60px hsl(280 100% 65% / 0.1), 0 0 120px hsl(160 100% 50% / 0.05)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleDone}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}
            >
              <X size={14} />
            </button>

            {/* Step progress */}
            <div className="flex gap-1.5 px-6 pt-5">
              {steps.map((_, i) => (
                <motion.div
                  key={i}
                  className="h-1 rounded-full flex-1"
                  animate={{
                    background: i <= step ? "hsl(280 100% 65%)" : "rgba(255,255,255,0.08)",
                  }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>

            {/* Visual area */}
            <div className="h-40 relative mx-6 mt-4 rounded-xl overflow-hidden"
              style={{
                background: "linear-gradient(135deg, hsl(280 100% 65% / 0.06), hsl(160 100% 50% / 0.04))",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  {current.visual}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="px-6 pt-5 pb-2"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg" style={{ background: "hsl(280 100% 65% / 0.12)", color: "hsl(280 100% 70%)" }}>
                    {current.icon}
                  </div>
                  <h2 className="text-lg font-heading font-bold text-foreground">{current.title}</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{current.subtitle}</p>
                <ul className="space-y-2">
                  {current.bullets.map((b, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-0.5" style={{ color: "hsl(160 100% 50%)" }}>✔</span>
                      {b}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>

            {/* Actions */}
            <div className="flex items-center justify-between px-6 py-5">
              {!isFirst ? (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  <ChevronLeft size={14} /> Back
                </button>
              ) : (
                <button
                  onClick={handleDone}
                  className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  Skip
                </button>
              )}

              {isLast ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleDone}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5"
                    style={{
                      background: "linear-gradient(135deg, hsl(280 100% 60%), hsl(280 100% 50%))",
                      color: "white",
                      boxShadow: "0 4px 20px hsl(280 100% 65% / 0.3)",
                    }}
                  >
                    Got It! 🚀
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setStep(s => s + 1)}
                  className="flex items-center gap-1 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5"
                  style={{
                    background: "linear-gradient(135deg, hsl(280 100% 60% / 0.15), hsl(160 100% 50% / 0.1))",
                    border: "1px solid hsl(280 100% 65% / 0.2)",
                    color: "hsl(280 100% 80%)",
                  }}
                >
                  Next <ChevronRight size={14} />
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { defaultAlertSteps };
export default FeatureGuideModal;
