import AppLayout from "@/components/AppLayout";
import { motion } from "framer-motion";
import {
  Terminal, Plus, Trash2, Clock, Settings
} from "lucide-react";

const glassCard = "rounded-2xl p-[1px]";
const glassGradient = { background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" };
const glassInner = "rounded-2xl h-full transition-shadow duration-300 group-hover:shadow-[0_0_30px_hsl(160_100%_45%/0.06)]";
const glassInnerStyle = { background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" };

const commands = [
  { cmd: "!dice", response: "🎲 {user} rolled a {random:1-6}!", cooldown: "10s", uses: 342, active: true },
  { cmd: "!socials", response: "Follow me: instagram.com/creator", cooldown: "30s", uses: 128, active: true },
  { cmd: "!uptime", response: "Stream has been live for {uptime}", cooldown: "60s", uses: 89, active: true },
  { cmd: "!song", response: "Now playing: {current_song}", cooldown: "15s", uses: 567, active: true },
  { cmd: "!hug", response: "{user} hugs {target}! 🤗", cooldown: "5s", uses: 1203, active: true },
  { cmd: "!rank", response: "{user} is ranked #{rank} with {points} points", cooldown: "30s", uses: 445, active: false },
  { cmd: "!discord", response: "Join our Discord: discord.gg/example", cooldown: "60s", uses: 210, active: true },
  { cmd: "!followage", response: "{user} has been following for {followage}", cooldown: "30s", uses: 334, active: true },
];

const ChatCommands = () => (
  <AppLayout>
    <div className="fixed top-20 left-1/2 -translate-x-1/4 w-[500px] h-[300px] rounded-full pointer-events-none z-0"
      style={{ background: "radial-gradient(ellipse, hsl(160 100% 45% / 0.03), transparent 70%)" }} />

    <div className="max-w-6xl mx-auto relative z-10 pb-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Chat Commands</h1>
          <p className="text-muted-foreground text-sm">Create custom commands that viewers can trigger in your TikTok LIVE chat.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_25px_hsl(160_100%_45%/0.25)]">
          <Plus size={16} /> New Command
        </button>
      </motion.div>

      <div className="space-y-3">
        {commands.map((cmd, i) => (
          <motion.div key={cmd.cmd} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className={`${glassCard} group`} style={glassGradient}
          >
            <div className={glassInner} style={glassInnerStyle}>
              <div className="p-4 flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Terminal size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-heading font-bold text-foreground">{cmd.cmd}</span>
                    <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1"><Clock size={9} /> {cmd.cooldown}</span>
                    <span className="text-[10px] text-muted-foreground/60">{cmd.uses} uses</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{cmd.response}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button className={`w-9 h-[20px] rounded-full relative transition-colors duration-200 ${cmd.active ? "bg-primary/30" : "bg-muted/60"}`}>
                    <div className={`w-3.5 h-3.5 rounded-full absolute top-[3px] transition-all duration-200 ${cmd.active ? "left-[19px] bg-primary" : "left-1 bg-muted-foreground/60"}`} />
                  </button>
                  <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"><Settings size={14} /></button>
                  <button className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </AppLayout>
);

export default ChatCommands;
