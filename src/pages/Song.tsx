import AppLayout from "@/components/AppLayout";
import FormSection from "@/components/FormSection";
import FormField from "@/components/FormField";
import { Music, Play, SkipForward, Pause, ListMusic, Clock, User, Plus, Info } from "lucide-react";
import { useState } from "react";

const songQueue = [
  { title: "Chill Vibes Beat", requestedBy: "StreamLover99", duration: "3:24", status: "playing" as const },
  { title: "Lofi Hip Hop Mix", requestedBy: "CoolViewer42", duration: "4:12", status: "queued" as const },
  { title: "Electronic Dance", requestedBy: "GiftKing", duration: "2:58", status: "queued" as const },
  { title: "Acoustic Session", requestedBy: "NewFan2025", duration: "5:01", status: "queued" as const },
  { title: "Synthwave Retro", requestedBy: "TikTokPro", duration: "3:45", status: "queued" as const },
  { title: "Jazz Cafe Morning", requestedBy: "VibeCheck", duration: "4:30", status: "queued" as const },
];

const Song = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto animate-slide-in pb-12">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-4 border-b border-border pb-2 overflow-x-auto">
          {["Song Requests", "Music Settings", "Song History", "Blacklisted Songs"].map((tab, i) => (
            <button
              key={tab}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                i === 0
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Info */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border mb-6">
          <Info size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground leading-relaxed">
            <p>
              Let your viewers request songs during your live stream. Songs are queued automatically when viewers use the <span className="text-primary font-medium">!song</span> chat command or send specific gifts. 
              Manage the queue, skip tracks, and configure request settings below.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {/* Now Playing */}
            <div className="rounded-xl border border-primary/20 bg-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border flex items-center gap-2">
                <Music size={14} className="text-primary" />
                <span className="font-heading font-semibold text-xs text-primary uppercase tracking-wider">Now Playing</span>
              </div>
              <div className="p-5 flex items-center gap-5">
                <div className="w-14 h-14 rounded-xl bg-[hsl(270,60%,25%)] text-primary flex items-center justify-center animate-pulse-glow flex-shrink-0">
                  <Music size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-bold text-foreground">{songQueue[0].title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><User size={11} /> {songQueue[0].requestedBy}</span>
                    <span className="flex items-center gap-1"><Clock size={11} /> {songQueue[0].duration}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-3 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <button className="p-3 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <SkipForward size={16} />
                  </button>
                </div>
              </div>
              {/* Progress bar */}
              <div className="px-5 pb-4">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-primary rounded-full transition-all" />
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                  <span>1:08</span>
                  <span>{songQueue[0].duration}</span>
                </div>
              </div>
            </div>

            {/* Queue */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListMusic size={14} className="text-muted-foreground" />
                  <h3 className="font-heading font-semibold text-sm text-foreground">Queue</h3>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{songQueue.length - 1}</span>
                </div>
              </div>
              {songQueue.slice(1).map((song, i) => (
                <div
                  key={song.title}
                  className="flex items-center gap-4 px-5 py-3 border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <span className="text-xs font-heading font-bold text-muted-foreground w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-foreground">{song.title}</h4>
                    <p className="text-xs text-muted-foreground">by {song.requestedBy}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{song.duration}</span>
                  <button className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-primary">
                    <Play size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-5">
            <FormSection title="Request Settings">
              <FormField label="Song requests" type="toggle" checked={true} />
              <FormField label="Min gift value" type="number" value="1" />
              <FormField label="Max queue size" type="number" value="20" />
              <FormField label="Max song length" type="select" options={["3 min", "5 min", "10 min", "No Limit"]} />
              <FormField label="Allow duplicates" type="toggle" checked={false} />
            </FormSection>

            <FormSection title="Volume Settings">
              <FormField label="Music volume" type="select" options={["25%", "50%", "75%", "100%"]} />
              <FormField label="Auto-duck for TTS" type="toggle" checked={true} />
            </FormSection>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Song;
