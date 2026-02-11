import AppLayout from "@/components/AppLayout";
import { motion } from "framer-motion";
import { Puzzle, Plus, Crown, Code2, Eye, Settings, Trash2 } from "lucide-react";

const glassCard = "rounded-2xl p-[1px]";
const glassGradient = { background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" };
const glassInner = "rounded-2xl h-full transition-shadow duration-300 group-hover:shadow-[0_0_30px_hsl(280_100%_65%/0.06)]";
const glassInnerStyle = { background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" };

const widgets = [
  { id: "1", name: "Spinning Wheel", type: "HTML/CSS/JS", status: "active", desc: "Interactive spinning wheel triggered by gifts" },
  { id: "2", name: "Snow Effect", type: "CSS Animation", status: "active", desc: "Falling snow particle effect overlay" },
  { id: "3", name: "Custom Alerts", type: "HTML/CSS/JS", status: "draft", desc: "Custom-designed alert animations with sound" },
  { id: "4", name: "Countdown Widget", type: "HTML/JS", status: "active", desc: "Animated countdown timer with custom styling" },
];

const Widgets = () => (
  <AppLayout>
    <div className="fixed top-20 left-1/2 -translate-x-1/4 w-[500px] h-[300px] rounded-full pointer-events-none z-0"
      style={{ background: "radial-gradient(ellipse, hsl(280 100% 65% / 0.03), transparent 70%)" }} />

    <div className="max-w-6xl mx-auto relative z-10 pb-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Custom Widgets</h1>
          <p className="text-muted-foreground text-sm">Build and manage custom HTML/CSS/JS widgets for your stream overlay.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-1 rounded-lg"><Crown size={10} /> PRO</span>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_25px_hsl(160_100%_45%/0.25)]">
            <Plus size={16} /> New Widget
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {widgets.map((widget, i) => (
          <motion.div key={widget.id}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className={`${glassCard} group`} style={glassGradient}
          >
            <div className={glassInner} style={glassInnerStyle}>
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center">
                      <Code2 size={18} className="text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-heading font-bold text-foreground">{widget.name}</h3>
                      <p className="text-[11px] text-muted-foreground">{widget.type}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${widget.status === "active" ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"}`}>
                    {widget.status.toUpperCase()}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground mb-4">{widget.desc}</p>

                <div className="flex items-center gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-primary/20 text-xs font-medium text-primary hover:bg-primary/5 transition-all duration-200 hover:-translate-y-0.5">
                    <Eye size={12} /> Preview
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-border/60 text-xs font-medium text-muted-foreground hover:text-foreground transition-all duration-200 hover:-translate-y-0.5">
                    <Settings size={12} /> Edit
                  </button>
                  <button className="px-3 py-2 rounded-xl border border-destructive/20 text-xs font-medium text-destructive/60 hover:text-destructive hover:border-destructive/40 transition-all duration-200 hover:-translate-y-0.5">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </AppLayout>
);

export default Widgets;
