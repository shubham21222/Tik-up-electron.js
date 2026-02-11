import AppLayout from "@/components/AppLayout";
import FormSection from "@/components/FormSection";
import FormField from "@/components/FormField";
import TabNav from "@/components/TabNav";
import { Music, Play, SkipForward, Pause, ListMusic, Clock, User, Info } from "lucide-react";
import { useState } from "react";

const songQueue = [
  { title: "Chill Vibes Beat", requestedBy: "StreamLover99", duration: "3:24", status: "playing" as const },
  { title: "Lofi Hip Hop Mix", requestedBy: "CoolViewer42", duration: "4:12", status: "queued" as const },
  { title: "Electronic Dance", requestedBy: "GiftKing", duration: "2:58", status: "queued" as const },
  { title: "Acoustic Session", requestedBy: "NewFan2025", duration: "5:01", status: "queued" as const },
  { title: "Synthwave Retro", requestedBy: "TikTokPro", duration: "3:45", status: "queued" as const },
  { title: "Jazz Cafe Morning", requestedBy: "VibeCheck", duration: "4:30", status: "queued" as const },
];

const songHistory = [
  { title: "Pop Remix 2025", requestedBy: "GiftKing", played: "15m ago" },
  { title: "Bass Boosted", requestedBy: "StreamLover99", played: "22m ago" },
  { title: "Ambient Chill", requestedBy: "TikTokPro", played: "35m ago" },
];

const tabs = ["Song Requests", "Music Settings", "Song History", "Blacklisted Songs"];

const Song = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto animate-slide-in pb-12">
        <TabNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border mb-6">
          <Info size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground leading-relaxed">
            <p>Let viewers request songs via the <span className="text-primary font-medium">!song</span> chat command or gifts.</p>
          </div>
        </div>

        {activeTab === "Song Requests" && (
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
                    <button onClick={() => setIsPlaying(!isPlaying)} className="p-3 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button className="p-3 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors">
                      <SkipForward size={16} />
                    </button>
                  </div>
                </div>
                <div className="px-5 pb-4">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-primary rounded-full transition-all" />
                  </div>
                  <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                    <span>1:08</span><span>{songQueue[0].duration}</span>
                  </div>
                </div>
              </div>

              {/* Queue */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center gap-2">
                  <ListMusic size={14} className="text-muted-foreground" />
                  <h3 className="font-heading font-semibold text-sm text-foreground">Queue</h3>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{songQueue.length - 1}</span>
                </div>
                {songQueue.slice(1).map((song, i) => (
                  <div key={song.title} className="flex items-center gap-4 px-5 py-3 border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
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
        )}

        {activeTab === "Music Settings" && (
          <FormSection title="Music Player Configuration">
            <FormField label="Auto-play" type="toggle" checked={true} />
            <FormField label="Shuffle" type="toggle" checked={false} />
            <FormField label="Default volume" type="select" options={["25%", "50%", "75%", "100%"]} />
            <FormField label="Fade between songs" type="toggle" checked={true} />
          </FormSection>
        )}

        {activeTab === "Song History" && (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
              <h3 className="font-heading font-semibold text-sm text-primary">Recently Played</h3>
            </div>
            {songHistory.map((song, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3 border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <div className="flex-1">
                  <span className="font-medium text-sm text-foreground">{song.title}</span>
                  <span className="text-xs text-muted-foreground ml-2">by {song.requestedBy}</span>
                </div>
                <span className="text-xs text-muted-foreground">{song.played}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Blacklisted Songs" && (
          <FormSection title="Blacklisted Songs" description="Block specific songs from being requested.">
            <div className="flex gap-2">
              <input type="text" placeholder="Song title or URL..." className="flex-1 bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
              <button className="px-4 py-2 rounded-md bg-destructive/20 text-destructive text-sm font-semibold hover:bg-destructive/30 transition-colors">Block</button>
            </div>
            <p className="text-xs text-muted-foreground italic">No songs blacklisted.</p>
          </FormSection>
        )}
      </div>
    </AppLayout>
  );
};

export default Song;
