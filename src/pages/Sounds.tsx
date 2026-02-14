import AppLayout from "@/components/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Music, Play, Pause, SkipForward, Volume2, Plus, Trash2,
  Link2, Copy, ExternalLink, Check, Search, Disc3, Headphones,
  Zap, Radio, Shuffle, Repeat, ChevronDown, Sparkles, ListMusic, Settings
} from "lucide-react";
import { toast } from "sonner";
import { getOverlayBaseUrl } from "@/lib/overlay-url";
import ProBadge from "@/components/overlays/ProBadge";

const glassCard = "rounded-2xl p-[1px]";
const glassGradient = { background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" };
const glassInner = { background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" };

const SPOTIFY_GREEN = "hsl(141 73% 42%)";

const mockTriggers = [
  { id: "1", event: "Gift Rose", eventIcon: "🎁", action: "Play Track", track: "Blinding Lights", artist: "The Weeknd", volume: 80 },
  { id: "2", event: "Gift Diamond", eventIcon: "💎", action: "Play Playlist", track: "Stream Hits Playlist", artist: "Various", volume: 70 },
  { id: "3", event: "100 Hearts", eventIcon: "❤️", action: "Volume Boost", track: "—", artist: "—", volume: 100 },
  { id: "4", event: "Gift Basketball", eventIcon: "🏀", action: "Skip Track", track: "—", artist: "—", volume: 80 },
  { id: "5", event: "Milestone", eventIcon: "🏆", action: "Fade In Music", track: "Victory Anthem", artist: "Epic Score", volume: 90 },
];

const mockPlaylists = ["My Stream Hits", "Chill Vibes", "Hype Tracks", "Late Night Lo-fi", "Top 50 Global"];

const overlayUrls = [
  { label: "Music Player Overlay", desc: "Shows now playing with album art", path: "spotify/player" },
  { label: "Music Trigger Animations", desc: "Animated alerts when music changes", path: "spotify/music-trigger" },
  { label: "Reactive Border with Song Info", desc: "Border pulses to beat + song title", path: "spotify/border" },
];

const Sounds = () => {
  const [connected, setConnected] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showNewTrigger, setShowNewTrigger] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(mockPlaylists[0]);
  const [triggers, setTriggers] = useState(mockTriggers);

  const copyUrl = (path: string) => {
    const url = `${getOverlayBaseUrl()}/overlay/${path}`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(path);
    toast.success("URL copied!");
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const deleteTrigger = (id: string) => {
    setTriggers(prev => prev.filter(t => t.id !== id));
    toast.success("Trigger removed");
  };

  return (
    <AppLayout>
      <div className="fixed top-20 left-1/2 -translate-x-1/4 w-[500px] h-[300px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse, hsl(141 73% 42% / 0.04), transparent 70%)" }} />

      <div className="max-w-5xl mx-auto relative z-10 pb-16">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(141 73% 42% / 0.15)" }}>
              <Headphones size={20} style={{ color: SPOTIFY_GREEN }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-heading font-bold text-foreground">Spotify Integration</h1>
                <ProBadge />
              </div>
              <p className="text-sm text-muted-foreground">Connect Spotify to unlock live music triggers on stream</p>
            </div>
          </div>
        </motion.div>

        {/* Connect Card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className={glassCard} style={glassGradient}>
          <div className="rounded-2xl p-5" style={glassInner}>
            {!connected ? (
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "hsl(141 73% 42% / 0.1)", border: "1px solid hsl(141 73% 42% / 0.2)" }}>
                  <Disc3 size={28} style={{ color: SPOTIFY_GREEN }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-bold text-foreground mb-1">Connect Your Spotify</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Link your Spotify account to play music on stream, map gifts to tracks, and show animated now-playing overlays.
                  </p>
                </div>
                <button
                  onClick={() => { setConnected(true); toast.success("Spotify connected!"); }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_25px_hsl(141_73%_42%/0.3)] flex-shrink-0"
                  style={{ background: SPOTIFY_GREEN }}
                >
                  <Music size={16} /> Connect Spotify
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "hsl(141 73% 42% / 0.15)", border: "2px solid hsl(141 73% 42% / 0.3)" }}>
                  <Check size={20} style={{ color: SPOTIFY_GREEN }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-heading font-bold text-foreground">Connected</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold" style={{ background: "hsl(141 73% 42% / 0.1)", color: SPOTIFY_GREEN }}>
                      ● Active
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">streamer_pro@spotify.com · Premium Account</p>
                </div>
                <button
                  onClick={() => { setConnected(false); toast.info("Spotify disconnected"); }}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </motion.div>

        <AnimatePresence>
          {connected && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }} className="space-y-6 mt-6 overflow-hidden">

              {/* Default Music Source + Now Playing */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Default Source */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className={glassCard} style={glassGradient}>
                  <div className="rounded-2xl p-5" style={glassInner}>
                    <div className="flex items-center gap-2 mb-4">
                      <ListMusic size={14} className="text-muted-foreground" />
                      <h3 className="text-xs font-heading font-bold text-foreground uppercase tracking-wider">Default Music Source</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] text-muted-foreground font-medium mb-1.5 block">Playlist</label>
                        <div className="relative">
                          <select value={selectedPlaylist} onChange={(e) => setSelectedPlaylist(e.target.value)}
                            className="w-full appearance-none bg-muted/30 border border-border/30 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary pr-8">
                            {mockPlaylists.map(p => <option key={p}>{p}</option>)}
                          </select>
                          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] text-muted-foreground font-medium mb-1.5 block">Default Track</label>
                        <div className="flex items-center gap-2">
                          <input type="text" placeholder="Search Spotify..." className="flex-1 bg-muted/30 border border-border/30 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:ring-1 focus:ring-primary" />
                          <button className="p-2.5 rounded-lg bg-muted/30 border border-border/30 text-muted-foreground hover:text-foreground transition-colors">
                            <Search size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-4 pt-1">
                        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                          <Shuffle size={12} /> <span>Shuffle</span>
                          <div className="w-8 h-4 rounded-full bg-primary/20 relative"><div className="w-3 h-3 rounded-full bg-primary absolute left-0.5 top-0.5" /></div>
                        </label>
                        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                          <Repeat size={12} /> <span>Loop</span>
                          <div className="w-8 h-4 rounded-full bg-muted/40 relative"><div className="w-3 h-3 rounded-full bg-muted-foreground/50 absolute left-0.5 top-0.5" /></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Now Playing */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                  className={glassCard} style={glassGradient}>
                  <div className="rounded-2xl p-5" style={glassInner}>
                    <div className="flex items-center gap-2 mb-4">
                      <Radio size={14} style={{ color: SPOTIFY_GREEN }} />
                      <h3 className="text-xs font-heading font-bold text-foreground uppercase tracking-wider">Now Playing</h3>
                      {isPlaying && (
                        <div className="flex items-end gap-[2px] h-3 ml-1">
                          {[...Array(4)].map((_, j) => (
                            <motion.div key={j} className="w-[2px] rounded-full" style={{ background: SPOTIFY_GREEN }}
                              animate={{ height: [3, 8 + Math.random() * 4, 3] }}
                              transition={{ duration: 0.4, repeat: Infinity, delay: j * 0.1 }} />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, hsl(280 60% 30%), hsl(200 80% 30%))" }}>
                        <Music size={28} className="text-white/70" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-heading font-bold text-foreground text-sm truncate">Blinding Lights</h4>
                        <p className="text-xs text-muted-foreground truncate">The Weeknd</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">From: {selectedPlaylist}</p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="h-1 bg-muted/40 rounded-full overflow-hidden">
                        <motion.div className="h-full rounded-full" style={{ background: SPOTIFY_GREEN }}
                          animate={isPlaying ? { width: ["33%", "66%"] } : {}} transition={isPlaying ? { duration: 30, ease: "linear" } : {}}
                          initial={{ width: "33%" }} />
                      </div>
                      <div className="flex justify-between mt-1 text-[10px] text-muted-foreground"><span>1:08</span><span>3:24</span></div>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"><Shuffle size={14} /></button>
                      <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors rotate-180"><SkipForward size={14} /></button>
                      <button onClick={() => setIsPlaying(!isPlaying)}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:scale-105"
                        style={{ background: SPOTIFY_GREEN }}>
                        {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                      </button>
                      <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"><SkipForward size={14} /></button>
                      <div className="flex items-center gap-1.5 ml-2">
                        <Volume2 size={13} className="text-muted-foreground" />
                        <div className="w-16 h-1 bg-muted/40 rounded-full overflow-hidden">
                          <div className="h-full w-3/4 rounded-full" style={{ background: SPOTIFY_GREEN }} />
                        </div>
                        <span className="text-[10px] text-muted-foreground">75%</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Music Triggers */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className={glassCard} style={glassGradient}>
                <div className="rounded-2xl overflow-hidden" style={glassInner}>
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <Zap size={14} style={{ color: SPOTIFY_GREEN }} />
                      <h3 className="text-xs font-heading font-bold text-foreground uppercase tracking-wider">Music Triggers</h3>
                      <span className="text-[10px] text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-md">{triggers.length}</span>
                    </div>
                    <button onClick={() => setShowNewTrigger(!showNewTrigger)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:-translate-y-0.5"
                      style={{ background: "hsl(141 73% 42% / 0.1)", color: SPOTIFY_GREEN }}>
                      <Plus size={12} /> New Trigger
                    </button>
                  </div>

                  <AnimatePresence>
                    {showNewTrigger && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-b border-white/[0.04]">
                        <div className="p-5 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] text-muted-foreground font-medium mb-1.5 block">Trigger Event</label>
                              <select className="w-full appearance-none bg-muted/30 border border-border/30 rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary">
                                <option>🎁 Gift Rose</option><option>💎 Gift Diamond</option><option>🏀 Gift Basketball</option>
                                <option>❤️ 100 Hearts</option><option>🏆 Milestone</option><option>👤 New Follow</option><option>🔗 Share</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[11px] text-muted-foreground font-medium mb-1.5 block">Spotify Action</label>
                              <select className="w-full appearance-none bg-muted/30 border border-border/30 rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary">
                                <option>▶ Play Track</option><option>📋 Play Playlist</option><option>⏭ Skip Track</option>
                                <option>🔊 Volume Boost</option><option>🎵 Fade In Music</option><option>🔇 Fade Out Music</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="text-[11px] text-muted-foreground font-medium mb-1.5 block">Search Track / Playlist</label>
                            <div className="flex gap-2">
                              <input type="text" placeholder="Search Spotify..." className="flex-1 bg-muted/30 border border-border/30 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:ring-1 focus:ring-primary" />
                              <button className="p-2 rounded-lg bg-muted/30 border border-border/30 text-muted-foreground hover:text-foreground transition-colors"><Search size={14} /></button>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="text-[11px] text-muted-foreground font-medium mb-1.5 block">Volume</label>
                              <div className="flex items-center gap-2">
                                <input type="range" min="10" max="100" defaultValue="80" className="flex-1 accent-primary" />
                                <span className="text-[11px] text-foreground w-8 text-right">80%</span>
                              </div>
                            </div>
                            <div>
                              <label className="text-[11px] text-muted-foreground font-medium mb-1.5 block">Fade Duration</label>
                              <select className="w-full appearance-none bg-muted/30 border border-border/30 rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary">
                                <option>0.5s</option><option>1s</option><option>2s</option><option>3s</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[11px] text-muted-foreground font-medium mb-1.5 block">Loop</label>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="w-9 h-5 rounded-full bg-muted/40 relative cursor-pointer">
                                  <div className="w-4 h-4 rounded-full bg-muted-foreground/50 absolute left-0.5 top-0.5" />
                                </div>
                                <span className="text-[11px] text-muted-foreground">Off</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <button onClick={() => setShowNewTrigger(false)} className="px-4 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                            <button onClick={() => { setShowNewTrigger(false); toast.success("Music trigger saved!"); }}
                              className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:-translate-y-0.5"
                              style={{ background: SPOTIFY_GREEN }}>Save Trigger</button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {triggers.map((trigger, i) => (
                    <motion.div key={trigger.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.03 }}
                      className="flex items-center gap-4 px-5 py-3.5 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.01] transition-colors group">
                      <span className="text-lg flex-shrink-0">{trigger.eventIcon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-foreground">{trigger.event}</span>
                          <span className="text-[10px] text-muted-foreground">→</span>
                          <span className="text-xs font-medium" style={{ color: SPOTIFY_GREEN }}>{trigger.action}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {trigger.track !== "—" ? `${trigger.track} · ${trigger.artist}` : "System action"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Volume2 size={11} className="text-muted-foreground/50" />
                        <span className="text-[10px] text-muted-foreground">{trigger.volume}%</span>
                      </div>
                      <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors opacity-0 group-hover:opacity-100">
                        <Play size={12} />
                      </button>
                      <button onClick={() => deleteTrigger(trigger.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 size={12} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Overlay URLs */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className={glassCard} style={glassGradient}>
                <div className="rounded-2xl overflow-hidden" style={glassInner}>
                  <div className="flex items-center gap-2 px-5 py-4 border-b border-white/[0.04]">
                    <Link2 size={14} className="text-primary" />
                    <h3 className="text-xs font-heading font-bold text-foreground uppercase tracking-wider">OBS / TikTok LIVE Studio URLs</h3>
                  </div>
                  {overlayUrls.map((item, i) => {
                    const url = `${getOverlayBaseUrl()}/overlay/${item.path}`;
                    return (
                      <div key={item.path} className="flex items-center gap-4 px-5 py-3.5 border-b border-white/[0.03] last:border-0">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "hsl(141 73% 42% / 0.1)" }}>
                          {i === 0 ? <Music size={14} style={{ color: SPOTIFY_GREEN }} /> :
                           i === 1 ? <Sparkles size={14} style={{ color: SPOTIFY_GREEN }} /> :
                           <Settings size={14} style={{ color: SPOTIFY_GREEN }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{item.label}</p>
                          <p className="text-[10px] text-muted-foreground font-mono truncate">{url}</p>
                        </div>
                        <button onClick={() => copyUrl(item.path)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                          style={copiedUrl === item.path
                            ? { background: "hsl(141 73% 42% / 0.15)", color: SPOTIFY_GREEN }
                            : { background: "hsl(280 100% 65% / 0.1)", color: "hsl(280 100% 70%)" }}>
                          {copiedUrl === item.path ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy URL</>}
                        </button>
                        <button onClick={() => window.open(url, "_blank")} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors">
                          <ExternalLink size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Pro Features */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                className={glassCard} style={glassGradient}>
                <div className="rounded-2xl p-5" style={glassInner}>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={14} style={{ color: SPOTIFY_GREEN }} />
                    <h3 className="text-xs font-heading font-bold text-foreground uppercase tracking-wider">Pro Music Modes</h3>
                    <ProBadge />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { icon: "🎶", label: "Fade Transitions", desc: "Smooth crossfade between songs" },
                      { icon: "💫", label: "Beat Sync", desc: "Border pulses to tempo" },
                      { icon: "💬", label: "Chat Requests", desc: "Viewers queue songs via chat" },
                      { icon: "⏸", label: "Auto-Pause", desc: "Pauses when stream ends" },
                    ].map(f => (
                      <div key={f.label} className="p-3 rounded-xl border border-border/20 bg-muted/5">
                        <span className="text-lg">{f.icon}</span>
                        <p className="text-[11px] font-medium text-foreground mt-1.5">{f.label}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{f.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default Sounds;
