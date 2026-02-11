import AppLayout from "@/components/AppLayout";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Shield, Type, AlertTriangle, Link2, Clock,
  MessageSquareX, Ban, Eye
} from "lucide-react";

const glassCard = "rounded-2xl p-[1px]";
const glassGradient = { background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" };
const glassInnerStyle = { background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" };

const modRules = [
  { icon: Shield, label: "Block links in chat", desc: "Auto-delete messages containing URLs", active: true },
  { icon: Type, label: "Caps lock filter", desc: "Block all-caps messages (>80% uppercase)", active: true },
  { icon: AlertTriangle, label: "Spam detection", desc: "Block repeated messages within 5 seconds", active: true },
  { icon: Link2, label: "Allow subscriber links", desc: "Subscribers can post links in chat", active: false },
  { icon: Clock, label: "Slow mode", desc: "Users can only send one message every 5 seconds", active: false },
  { icon: MessageSquareX, label: "Emoji-only filter", desc: "Block messages that are only emojis (3+ emojis, no text)", active: false },
  { icon: Eye, label: "First-message review", desc: "Hold first-time chatter messages for manual approval", active: false },
];

const AutoModeration = () => {
  const [filterInput, setFilterInput] = useState("");
  const [banInput, setBanInput] = useState("");

  return (
    <AppLayout>
      <div className="fixed top-20 left-1/2 -translate-x-1/4 w-[500px] h-[300px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse, hsl(45 100% 55% / 0.03), transparent 70%)" }} />

      <div className="max-w-6xl mx-auto relative z-10 pb-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Auto Moderation</h1>
          <p className="text-muted-foreground text-sm">Automatically manage chat behavior with moderation rules, word filters, and bans.</p>
        </motion.div>

        {/* Moderation Rules */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className={`${glassCard} mb-6`} style={glassGradient}
        >
          <div className="rounded-2xl p-6" style={glassInnerStyle}>
            <h2 className="text-sm font-heading font-bold text-foreground mb-5 flex items-center gap-2"><Shield size={16} className="text-primary" /> Moderation Rules</h2>
            <div className="space-y-4">
              {modRules.map((item) => (
                <div key={item.label} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                      <item.icon size={14} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <button className={`w-10 h-[22px] rounded-full relative transition-colors duration-200 ${item.active ? "bg-primary/30" : "bg-muted/60"}`}>
                    <div className={`w-4 h-4 rounded-full absolute top-[3px] transition-all duration-200 ${item.active ? "left-[22px] bg-primary" : "left-1 bg-muted-foreground/60"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Word Filters */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className={glassCard} style={glassGradient}
          >
            <div className="rounded-2xl p-6 h-full" style={glassInnerStyle}>
              <h2 className="text-sm font-heading font-bold text-foreground mb-2 flex items-center gap-2"><MessageSquareX size={16} className="text-destructive" /> Word Filters</h2>
              <p className="text-xs text-muted-foreground mb-5">Messages containing these words will be blocked from chat and TTS.</p>
              <div className="flex gap-2 mb-4">
                <input type="text" value={filterInput} onChange={e => setFilterInput(e.target.value)} placeholder="Add a word or phrase..."
                  className="flex-1 bg-muted/40 border border-border/60 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/40 transition-colors" />
                <button className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {["badword1", "spam", "scam", "buy followers", "f4f"].map(word => (
                  <span key={word} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium">
                    {word} <button className="hover:text-destructive/80">×</button>
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Banned Users */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className={glassCard} style={glassGradient}
          >
            <div className="rounded-2xl p-6 h-full" style={glassInnerStyle}>
              <h2 className="text-sm font-heading font-bold text-foreground mb-2 flex items-center gap-2"><Ban size={16} className="text-destructive" /> Banned Users</h2>
              <p className="text-xs text-muted-foreground mb-5">These users are blocked from triggering any actions, TTS, or alerts.</p>
              <div className="flex gap-2 mb-4">
                <input type="text" value={banInput} onChange={e => setBanInput(e.target.value)} placeholder="Enter username..."
                  className="flex-1 bg-muted/40 border border-border/60 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/40 transition-colors" />
                <button className="px-4 py-2.5 rounded-xl bg-destructive/20 text-destructive text-sm font-semibold hover:bg-destructive/30 transition-colors">Block</button>
              </div>
              <p className="text-xs text-muted-foreground italic">No users banned yet.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AutoModeration;
