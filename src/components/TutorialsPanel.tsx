import { useState, useRef, useEffect } from "react";
import { HelpCircle, BookOpen, ExternalLink, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { featureGuides } from "@/data/feature-guides";
import FeatureGuideModal from "@/components/FeatureGuideModal";

const tutorialList = Object.entries(featureGuides).map(([key, guide]) => ({
  key,
  title: guide.title,
  stepCount: guide.steps.length,
}));

const categories = [
  { label: "Live Controls", keys: ["gift_alerts", "chat_overlay", "viewer_count", "like_counter", "stream_timer"] },
  { label: "Engagement", keys: ["sounds", "overlays", "recent_activity", "tts", "sound_alerts"] },
  { label: "Growth & Goals", keys: ["goal_overlays", "leaderboard", "points"] },
  { label: "Creator Tools", keys: ["chat_commands", "auto_moderation", "keystroke_triggers", "polls", "gift_browser"] },
  { label: "Settings", keys: ["setup", "brand_settings", "stream_presets", "widgets", "social_rotator"] },
];

const TutorialsPanel = () => {
  const [open, setOpen] = useState(false);
  const [activeGuide, setActiveGuide] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const guideData = activeGuide ? featureGuides[activeGuide] : null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
      >
        <HelpCircle size={18} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border overflow-hidden z-50"
            style={{
              background: "hsl(var(--card))",
              boxShadow: "0 16px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)",
            }}
          >
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-primary" />
                <span className="text-sm font-bold text-foreground">Tutorials & Guides</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Learn how to use every feature</p>
            </div>

            <div className="max-h-96 overflow-y-auto py-1">
              {categories.map((cat) => {
                const guides = cat.keys
                  .map((k) => tutorialList.find((t) => t.key === k))
                  .filter(Boolean) as typeof tutorialList;
                if (guides.length === 0) return null;
                return (
                  <div key={cat.label}>
                    <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                      {cat.label}
                    </div>
                    {guides.map((g) => (
                      <button
                        key={g.key}
                        onClick={() => {
                          setActiveGuide(g.key);
                          setOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-muted/30 transition-colors"
                      >
                        <span className="text-sm text-foreground">{g.title}</span>
                        <span className="ml-auto text-[10px] text-muted-foreground">{g.stepCount} steps</span>
                        <ChevronRight size={12} className="text-muted-foreground/50" />
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {guideData && activeGuide && (
        <FeatureGuideModal
          open={!!activeGuide}
          onClose={() => setActiveGuide(null)}
          featureKey={activeGuide}
          title={guideData.title}
          steps={guideData.steps}
        />
      )}
    </div>
  );
};

export default TutorialsPanel;
