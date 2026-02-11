import AppLayout from "@/components/AppLayout";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Volume2, Upload, Play, Pause, Trash2,
  Hash, Clock
} from "lucide-react";

const glassCard = "rounded-2xl p-[1px]";
const glassGradient = { background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" };
const glassInnerStyle = { background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" };

const sounds = [
  { id: "1", name: "Chime Alert", trigger: "Rose Gift", duration: "2.3s", plays: 1247, file: "chime.mp3" },
  { id: "2", name: "Lion Roar", trigger: "Lion Gift", duration: "3.1s", plays: 432, file: "lion.mp3" },
  { id: "3", name: "Universe Epic", trigger: "Universe Gift", duration: "5.2s", plays: 89, file: "universe.mp3" },
  { id: "4", name: "Follow Ding", trigger: "New Follow", duration: "1.5s", plays: 3201, file: "follow.mp3" },
  { id: "5", name: "Air Horn", trigger: "!airhorn command", duration: "2.0s", plays: 876, file: "airhorn.mp3" },
  { id: "6", name: "Cash Register", trigger: "Gift > 100 coins", duration: "1.8s", plays: 234, file: "cash.mp3" },
  { id: "7", name: "Level Up", trigger: "Milestone", duration: "2.5s", plays: 156, file: "levelup.mp3" },
  { id: "8", name: "Sad Trombone", trigger: "!sad command", duration: "3.0s", plays: 543, file: "sad.mp3" },
];

const Sounds = () => {
  const [playing, setPlaying] = useState<string | null>(null);

  return (
    <AppLayout>
      <div className="fixed top-20 left-1/2 -translate-x-1/4 w-[500px] h-[300px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse, hsl(160 100% 45% / 0.03), transparent 70%)" }} />

      <div className="max-w-6xl mx-auto relative z-10 pb-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Soundboard</h1>
            <p className="text-muted-foreground text-sm">Upload and manage sound effects triggered by gifts, commands, and events.</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_25px_hsl(160_100%_45%/0.25)]">
            <Upload size={16} /> Upload Sound
          </button>
        </motion.div>

        {/* Volume Control */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className={glassCard} style={glassGradient}
        >
          <div className="rounded-2xl p-5 flex items-center gap-6" style={glassInnerStyle}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Volume2 size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-heading font-bold text-foreground">Master Volume</p>
                <p className="text-[11px] text-muted-foreground">Controls all sound alert volumes</p>
              </div>
            </div>
            <div className="flex-1">
              <div className="h-2 rounded-full bg-muted/40 relative">
                <div className="h-full w-3/4 rounded-full bg-primary relative">
                  <div className="w-4 h-4 rounded-full bg-primary border-2 border-background absolute -right-2 -top-1 shadow-lg" />
                </div>
              </div>
            </div>
            <span className="text-sm font-heading font-bold text-foreground w-10 text-right">75%</span>
          </div>
        </motion.div>

        {/* Sound List */}
        <div className="mt-6 space-y-2">
          {sounds.map((sound, i) => (
            <motion.div key={sound.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.03 }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className={`${glassCard} group`} style={glassGradient}
            >
              <div className="rounded-2xl transition-shadow duration-300 group-hover:shadow-[0_0_25px_hsl(160_100%_45%/0.05)]" style={glassInnerStyle}>
                <div className="p-4 flex items-center gap-4">
                  {/* Play button */}
                  <button
                    onClick={() => setPlaying(playing === sound.id ? null : sound.id)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                      playing === sound.id ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary hover:bg-primary/20"
                    }`}
                  >
                    {playing === sound.id ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-heading font-bold text-foreground">{sound.name}</span>
                      {playing === sound.id && (
                        <div className="flex items-end gap-[2px] h-3">
                          {[...Array(4)].map((_, j) => (
                            <motion.div key={j} className="w-[2px] rounded-full bg-primary"
                              animate={{ height: [3, 8 + Math.random() * 4, 3] }}
                              transition={{ duration: 0.4, repeat: Infinity, delay: j * 0.1 }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-3">
                      <span className="flex items-center gap-1"><Hash size={9} /> {sound.trigger}</span>
                      <span className="flex items-center gap-1"><Clock size={9} /> {sound.duration}</span>
                      <span>{sound.plays} plays</span>
                    </p>
                  </div>

                  {/* Waveform placeholder */}
                  <div className="hidden md:flex items-end gap-[2px] h-6 opacity-30">
                    {[...Array(20)].map((_, j) => (
                      <div key={j} className="w-[2px] rounded-full bg-primary" style={{ height: `${4 + Math.random() * 16}px` }} />
                    ))}
                  </div>

                  {/* Actions */}
                  <button className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors flex-shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Sounds;
