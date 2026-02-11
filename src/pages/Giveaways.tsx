import AppLayout from "@/components/AppLayout";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  PartyPopper,
  RotateCcw, Trophy, BarChart, Plus, Clock,
  Crown
} from "lucide-react";

const glassCard = "rounded-2xl p-[1px]";
const glassGradient = { background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" };
const glassInnerStyle = { background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" };

const tabs = ["Giveaways", "Polls"];

const giveaways = [
  { id: "1", title: "iPhone Giveaway", entries: 1247, requirement: "Follow + Comment", status: "active", timeLeft: "2h 15m" },
  { id: "2", title: "Pro Subscription", entries: 432, requirement: "Send any gift", status: "active", timeLeft: "45m" },
  { id: "3", title: "Custom Shoutout", entries: 89, requirement: "Share stream", status: "ended", winner: "StreamFan42" },
];

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
];

const Giveaways = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <AppLayout>
      <div className="fixed top-20 left-1/2 -translate-x-1/4 w-[500px] h-[300px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse, hsl(280 100% 65% / 0.03), transparent 70%)" }} />

      <div className="max-w-6xl mx-auto relative z-10 pb-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Giveaways & Polls</h1>
            <p className="text-muted-foreground text-sm">Engage your audience with giveaways and live polls.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-1 rounded-lg"><Crown size={10} /> PRO</span>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_25px_hsl(160_100%_45%/0.25)]">
              <Plus size={16} /> Create New
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 p-1 rounded-xl bg-muted/30 w-fit">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${activeTab === tab ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >{tab}</button>
          ))}
        </div>

        {/* Giveaways */}
        {activeTab === "Giveaways" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {giveaways.map((giveaway, i) => (
              <motion.div key={giveaway.id}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className={`${glassCard} group`} style={glassGradient}
              >
                <div className="rounded-2xl p-5 transition-shadow duration-300 group-hover:shadow-[0_0_30px_hsl(280_100%_65%/0.06)]" style={glassInnerStyle}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center">
                        <PartyPopper size={18} className="text-secondary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-heading font-bold text-foreground">{giveaway.title}</h3>
                        <p className="text-[11px] text-muted-foreground">{giveaway.requirement}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                      giveaway.status === "active" ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"
                    }`}>
                      {giveaway.status === "active" ? "ACTIVE" : "ENDED"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-muted/30 rounded-xl px-3 py-2.5 text-center">
                      <p className="text-lg font-heading font-bold text-foreground">{giveaway.entries.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">Entries</p>
                    </div>
                    <div className="bg-muted/30 rounded-xl px-3 py-2.5 text-center">
                      {giveaway.status === "active" ? (
                        <>
                          <p className="text-lg font-heading font-bold text-foreground flex items-center justify-center gap-1"><Clock size={14} /> {giveaway.timeLeft}</p>
                          <p className="text-[10px] text-muted-foreground font-medium">Time Left</p>
                        </>
                      ) : (
                        <>
                          <p className="text-lg font-heading font-bold text-primary flex items-center justify-center gap-1"><Trophy size={14} /> {giveaway.winner}</p>
                          <p className="text-[10px] text-muted-foreground font-medium">Winner</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {giveaway.status === "active" ? (
                      <>
                        <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-secondary/10 text-secondary text-xs font-medium hover:bg-secondary/15 transition-all duration-200 hover:-translate-y-0.5">
                          <Trophy size={12} /> Pick Winner
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-border/60 text-xs font-medium text-muted-foreground hover:text-foreground transition-all duration-200 hover:-translate-y-0.5">
                          <RotateCcw size={12} /> Reset
                        </button>
                      </>
                    ) : (
                      <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-primary/20 text-xs font-medium text-primary hover:bg-primary/5 transition-all duration-200 hover:-translate-y-0.5">
                        <RotateCcw size={12} /> Restart
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Polls */}
        {activeTab === "Polls" && (
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
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                      poll.active ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"
                    }`}>
                      {poll.active ? "LIVE" : "ENDED"}
                    </span>
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
        )}
      </div>
    </AppLayout>
  );
};

export default Giveaways;
