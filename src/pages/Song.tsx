import AppLayout from "@/components/AppLayout";
import { Music, Play, SkipForward, Plus, ListMusic, Clock, User } from "lucide-react";

const songQueue = [
  { title: "Chill Vibes Beat", requestedBy: "StreamLover99", duration: "3:24", status: "playing" },
  { title: "Lofi Hip Hop Mix", requestedBy: "CoolViewer42", duration: "4:12", status: "queued" },
  { title: "Electronic Dance", requestedBy: "GiftKing", duration: "2:58", status: "queued" },
  { title: "Acoustic Session", requestedBy: "NewFan2025", duration: "5:01", status: "queued" },
];

const Song = () => {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto animate-slide-in">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Music size={28} className="text-primary" />
            <h1 className="text-3xl font-heading font-bold text-foreground">Song Requests</h1>
          </div>
          <p className="text-muted-foreground">Let viewers request songs during your stream. Manage the queue and playback settings.</p>
        </div>

        {/* Now Playing */}
        <div className="rounded-xl border border-primary/20 bg-card p-6 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
          <div className="relative z-10 flex items-center gap-5">
            <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center animate-pulse-glow">
              <Music size={28} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Now Playing</p>
              <h3 className="font-heading font-bold text-lg text-foreground">{songQueue[0].title}</h3>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><User size={12} /> {songQueue[0].requestedBy}</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {songQueue[0].duration}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-3 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                <Play size={18} />
              </button>
              <button className="p-3 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <SkipForward size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Queue */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ListMusic size={18} className="text-muted-foreground" />
            <h2 className="text-lg font-heading font-semibold text-foreground">Queue</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{songQueue.length - 1} songs</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {songQueue.slice(1).map((song, i) => (
            <div
              key={song.title}
              className="flex items-center gap-4 px-5 py-3.5 border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
            >
              <span className="text-sm font-heading font-bold text-muted-foreground w-6">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-foreground">{song.title}</h4>
                <p className="text-xs text-muted-foreground">Requested by {song.requestedBy}</p>
              </div>
              <span className="text-xs text-muted-foreground">{song.duration}</span>
              <button className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-primary">
                <Play size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Song;
