import AppLayout from "@/components/AppLayout";
import ProGate from "@/components/ProGate";
import PageHelpButton from "@/components/PageHelpButton";
import { motion } from "framer-motion";
import { useState } from "react";
import { Palette, Upload, Type, Sparkles } from "lucide-react";

const glassCard = "rounded-2xl p-[1px]";
const glassGradient = { background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" };
const glassInnerStyle = { background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" };

const presetThemes = [
  { name: "Emerald", primary: "hsl(160 100% 45%)", accent: "hsl(180 100% 42%)" },
  { name: "Violet", primary: "hsl(280 100% 65%)", accent: "hsl(300 100% 55%)" },
  { name: "Sunset", primary: "hsl(25 100% 55%)", accent: "hsl(45 100% 55%)" },
  { name: "Ocean", primary: "hsl(200 100% 55%)", accent: "hsl(220 100% 50%)" },
  { name: "Rose", primary: "hsl(350 90% 55%)", accent: "hsl(330 85% 50%)" },
  { name: "Mono", primary: "hsl(0 0% 90%)", accent: "hsl(0 0% 70%)" },
];

const BrandSettings = () => {
  const [selectedTheme, setSelectedTheme] = useState("Emerald");

  return (
    <AppLayout>
      <ProGate feature="Brand & Style">
      <div className="fixed top-20 left-1/2 -translate-x-1/4 w-[500px] h-[300px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse, hsl(280 100% 65% / 0.03), transparent 70%)" }} />

      <div className="max-w-4xl mx-auto relative z-10 pb-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
          <div className="flex items-center gap-3"><h1 className="text-3xl font-heading font-bold text-foreground mb-2">Brand Settings</h1><PageHelpButton featureKey="brand_settings" /></div>
          <p className="text-muted-foreground text-sm">Customize colors, fonts, and branding across all your overlays and alerts.</p>
        </motion.div>

        {/* Theme Presets */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className={`${glassCard} mb-6`} style={glassGradient}
        >
          <div className="rounded-2xl p-6" style={glassInnerStyle}>
            <h2 className="text-sm font-heading font-bold text-foreground mb-4 flex items-center gap-2"><Sparkles size={16} className="text-secondary" /> Theme Presets</h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {presetThemes.map(theme => (
                <button key={theme.name} onClick={() => setSelectedTheme(theme.name)}
                  className={`rounded-xl p-3 border-2 transition-all duration-200 ${selectedTheme === theme.name ? "border-primary" : "border-transparent hover:border-border/60"}`}
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  <div className="flex gap-1 mb-2 justify-center">
                    <div className="w-5 h-5 rounded-full" style={{ background: theme.primary }} />
                    <div className="w-5 h-5 rounded-full" style={{ background: theme.accent }} />
                  </div>
                  <p className="text-[10px] font-medium text-center text-foreground">{theme.name}</p>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Custom Colors */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className={`${glassCard} mb-6`} style={glassGradient}
        >
          <div className="rounded-2xl p-6" style={glassInnerStyle}>
            <h2 className="text-sm font-heading font-bold text-foreground mb-4 flex items-center gap-2"><Palette size={16} className="text-primary" /> Custom Colors</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Primary Color", value: "#00E676" },
                { label: "Accent Color", value: "#FFD740" },
                { label: "Background", value: "#0D1117" },
                { label: "Text Color", value: "#FFFFFF" },
              ].map(c => (
                <div key={c.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg border border-border/60 flex-shrink-0" style={{ background: c.value }} />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground">{c.label}</p>
                    <input type="text" defaultValue={c.value} className="text-[11px] text-muted-foreground bg-transparent outline-none w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Font & Logo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className={glassCard} style={glassGradient}
          >
            <div className="rounded-2xl p-6 h-full" style={glassInnerStyle}>
              <h2 className="text-sm font-heading font-bold text-foreground mb-4 flex items-center gap-2"><Type size={16} className="text-primary" /> Font Settings</h2>
              <div className="space-y-3">
                {["Heading Font", "Body Font"].map(label => (
                  <div key={label}>
                    <p className="text-xs font-medium text-foreground mb-1">{label}</p>
                    <select className="w-full bg-muted/40 border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground outline-none">
                      <option>Space Grotesk</option>
                      <option>Inter</option>
                      <option>JetBrains Mono</option>
                      <option>Poppins</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className={glassCard} style={glassGradient}
          >
            <div className="rounded-2xl p-6 h-full" style={glassInnerStyle}>
              <h2 className="text-sm font-heading font-bold text-foreground mb-4 flex items-center gap-2"><Upload size={16} className="text-primary" /> Logo & Branding</h2>
              <div className="border-2 border-dashed border-border/40 rounded-xl p-8 text-center hover:border-primary/30 transition-colors cursor-pointer">
                <Upload size={24} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Drop your logo here or click to upload</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">PNG, SVG • Max 2MB</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      </ProGate>
    </AppLayout>
  );
};

export default BrandSettings;
