import AppLayout from "@/components/AppLayout";
import { motion } from "framer-motion";
import { useState } from "react";
import { BarChart, Plus, Crown, RotateCcw } from "lucide-react";

const glassCard = "rounded-2xl p-[1px]";
const glassGradient = { background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" };
const glassInnerStyle = { background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" };

const polls = [
  { id: "1", question: "What game should I play next?", votes: 2341, options: [
    { label: "GTA V", votes: 892, pct: 38 },
    { label: "Minecraft", votes: 756, pct: 32 },
    { label: "Fortnite", votes: 423, pct: 18 },
    { label: "Just Chatting", votes: 270, pct: 12 },
  ], active: true },
  { id: "2", question: "Best time to stream?", votes: 1567, options: [
    { label: "Evening (6-10pm)", votes: 702, pct: 45 },
    { label: "Night (10pm-2am)", votes: 486, pct: 31 },
    { label: "Afternoon (2-6pm)", votes: 379, pct: 24 },
  ], active: false },
  { id: "3", question: "Favorite overlay style?", votes: 983, options: [
    { label: "Minimal", votes: 412, pct: 42 },
    { label: "Neon", votes: 305, pct: 31 },
    { label: "Retro", votes: 266, pct: 27 },
  ], active: false },
];

const Polls = () => (
  <AppLayout>
    <div className="fixed top-20 left-1/2 -translate-x-1/4 w-[500px] h-[300px] rounded-full pointer-events-none z-0"
      style={{ background: "radial-gradient(ellipse, hsl(200 100% 55% / 0.03), transparent 70%)" }} />

    <div className="max-w-6xl mx-auto relative z-10 pb-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Polls</h1>
          <p className="text-muted-foreground text-sm">Create live polls to engage your audience and make decisions together.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-1 rounded-lg"><Crown size={10} /> PRO</span>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_25px_hsl(160_100%_45%/0.25)]">
            <Plus size={16} /> New Poll
          </button>
        </div>
      </motion.div>

      <div className="space-y-5">
        {polls.map((poll, i) => (
          <motion.div key={poll.id}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={glassCard} style={glassGradient}
          >
            <div className="rounded-2xl p-5" style={glassInnerStyle}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BarChart size={18} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-heading font-bold text-foreground">{poll.question}</h3>
                    <p className="text-[11px] text-muted-foreground">{poll.votes.toLocaleString()} total votes</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${poll.active ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"}`}>
                    {poll.active ? "LIVE" : "ENDED"}
                  </span>
                  {!poll.active && (
                    <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
                      <RotateCcw size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {poll.options.map((opt, j) => (
                  <div key={opt.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-foreground">{opt.label}</span>
                      <span className="text-xs font-heading font-bold text-muted-foreground">{opt.pct}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-muted/40 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${opt.pct}%` }}
                        transition={{ duration: 1, delay: 0.2 + j * 0.1, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full"
                        style={{
                          background: j === 0
                            ? "linear-gradient(90deg, hsl(160 100% 45%), hsl(180 100% 42%))"
                            : j === 1
                            ? "linear-gradient(90deg, hsl(200 100% 55%), hsl(220 100% 50%))"
                            : "linear-gradient(90deg, hsl(280 100% 65%), hsl(300 100% 55%))",
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{opt.votes.toLocaleString()} votes</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </AppLayout>
);

export default Polls;
