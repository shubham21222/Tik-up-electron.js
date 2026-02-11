import AppLayout from "@/components/AppLayout";
import { Volume2, Plus, Upload, Play, Pause, Trash2 } from "lucide-react";
import { useState } from "react";

const defaultSounds = [
  { name: "Celebration", duration: "3.2s", trigger: "Gift > 100 coins" },
  { name: "Cha-Ching", duration: "1.5s", trigger: "Gift > 500 coins" },
  { name: "Air Horn", duration: "2.1s", trigger: "New Follower" },
  { name: "Applause", duration: "4.0s", trigger: "Share" },
  { name: "Level Up", duration: "1.8s", trigger: "Subscription" },
];

const Sounds = () => {
  const [playing, setPlaying] = useState<string | null>(null);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto animate-slide-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Volume2 size={28} className="text-primary" />
              <h1 className="text-3xl font-heading font-bold text-foreground">Sound Alerts</h1>
            </div>
            <p className="text-muted-foreground">Upload and manage sound effects that play when viewers interact with your stream.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
            <Upload size={16} />
            Upload Sound
          </button>
        </div>

        {/* Volume control */}
        <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-card border border-border">
          <Volume2 size={18} className="text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Master Volume</span>
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full w-3/4 bg-primary rounded-full" />
          </div>
          <span className="text-sm text-muted-foreground">75%</span>
        </div>

        {/* Sound list */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-[1fr_100px_1fr_80px] gap-4 px-5 py-3 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Sound</span>
            <span>Duration</span>
            <span>Trigger</span>
            <span className="text-right">Actions</span>
          </div>
          {defaultSounds.map((sound) => (
            <div
              key={sound.name}
              className="grid grid-cols-[1fr_100px_1fr_80px] gap-4 px-5 py-3.5 border-b border-border last:border-0 hover:bg-muted/30 transition-colors items-center"
            >
              <span className="font-medium text-sm text-foreground">{sound.name}</span>
              <span className="text-sm text-muted-foreground">{sound.duration}</span>
              <span className="text-sm text-muted-foreground">{sound.trigger}</span>
              <div className="flex items-center gap-1 justify-end">
                <button
                  onClick={() => setPlaying(playing === sound.name ? null : sound.name)}
                  className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
                >
                  {playing === sound.name ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-destructive">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Sounds;
