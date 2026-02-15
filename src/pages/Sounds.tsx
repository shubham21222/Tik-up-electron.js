import AppLayout from "@/components/AppLayout";
import ProGate from "@/components/ProGate";
import PageHelpButton from "@/components/PageHelpButton";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import {
  Music, Play, Pause, SkipForward, Volume2, Plus, Trash2,
  Copy, ExternalLink, Check, Search, Disc3, Headphones,
  Zap, Radio, Shuffle, ChevronDown, Sparkles, ListMusic,
  Settings, Gift, Crown, Shield, Timer, Clock, Ban, MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import { getOverlayBaseUrl } from "@/lib/overlay-url";
import { copyToClipboard } from "@/lib/clipboard";
import ProBadge from "@/components/overlays/ProBadge";
import { useSpotify } from "@/hooks/use-spotify";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "react-router-dom";

const SPOTIFY_GREEN = "hsl(141 73% 42%)";
const glassInner = { background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" };
const glassCard = "rounded-2xl border border-white/[0.06]";

const overlayUrls = [
  { label: "Music Player Overlay", desc: "Shows now playing with album art", path: "spotify/player" },
  { label: "Music Trigger Animations", desc: "Animated alerts when music changes", path: "spotify/music-trigger" },
];

const Sounds = () => {
  const {
    connection, nowPlaying, config, loading,
    searchResults, searching,
    connect, handleCallback, disconnect,
    search, skip, pause, resume, setVolume, addToQueue,
    updateConfig,
  } = useSpotify();

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"controls" | "thresholds" | "safety">("controls");

  // Handle OAuth callback
  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      handleCallback(code);
      // Remove code from URL
      searchParams.delete("code");
      searchParams.delete("state");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, handleCallback, setSearchParams]);

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    if (q.length >= 2) search(q);
  }, [search]);

  const copyUrl = (path: string) => {
    const url = `${getOverlayBaseUrl()}/overlay/${path}`;
    copyToClipboard(url, "URL copied!");
    setCopiedUrl(path);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const isPlaying = nowPlaying?.is_playing ?? false;
  const currentTrack = nowPlaying?.item;
  const progress = nowPlaying?.progress_ms ?? 0;
  const duration = currentTrack?.duration_ms ?? 1;
  const deviceVolume = nowPlaying?.device?.volume_percent ?? 75;

  const formatMs = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  return (
    <AppLayout>
      <ProGate feature="Spotify Connect">
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
                  <h1 className="text-2xl font-heading font-bold text-foreground">Spotify Connect</h1>
                  <PageHelpButton featureKey="sounds" />
                </div>
                <p className="text-sm text-muted-foreground">Let viewers control your music with TikTok gifts</p>
              </div>
            </div>
          </motion.div>

          {/* Connect Card */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className={glassCard} style={glassInner}>
            <div className="p-5">
              {loading ? (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Disc3 size={20} className="animate-spin" /> Checking Spotify connection...
                </div>
              ) : !connection.connected ? (
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "hsl(141 73% 42% / 0.1)", border: "1px solid hsl(141 73% 42% / 0.2)" }}>
                    <Disc3 size={28} style={{ color: SPOTIFY_GREEN }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-foreground mb-1">Connect Your Spotify</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Link your Spotify Premium account. Viewers will control your music with gifts — you control the thresholds.
                    </p>
                    <p className="text-[10px] text-muted-foreground/50 mt-1">
                      ⚠️ Spotify Premium required · Playback control only, no audio rebroadcast
                    </p>
                  </div>
                  <button
                    onClick={connect}
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
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                        style={{ background: "hsl(141 73% 42% / 0.1)", color: SPOTIFY_GREEN }}>
                        ● Active
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {connection.spotify_display_name || connection.spotify_email} · {connection.spotify_product === "premium" ? "Premium" : connection.spotify_product}
                    </p>
                  </div>
                  <button onClick={disconnect}
                    className="px-4 py-2 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors">
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          <AnimatePresence>
            {connection.connected && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }} className="space-y-5 mt-5 overflow-hidden">

                {/* Now Playing + Song Search */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Now Playing */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className={glassCard} style={glassInner}>
                    <div className="p-5">
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

                      {currentTrack ? (
                        <>
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                              {currentTrack.album?.images?.[0]?.url ? (
                                <img src={currentTrack.album.images[0].url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(280 60% 30%), hsl(200 80% 30%))" }}>
                                  <Music size={28} className="text-white/70" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-heading font-bold text-foreground text-sm truncate">{currentTrack.name}</h4>
                              <p className="text-xs text-muted-foreground truncate">{currentTrack.artists?.map(a => a.name).join(", ")}</p>
                              <p className="text-[10px] text-muted-foreground/60 mt-0.5">{currentTrack.album?.name}</p>
                            </div>
                          </div>

                          <div className="mb-3">
                            <div className="h-1 bg-muted/40 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-1000" style={{ background: SPOTIFY_GREEN, width: `${(progress / duration) * 100}%` }} />
                            </div>
                            <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                              <span>{formatMs(progress)}</span><span>{formatMs(duration)}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-center gap-3">
                            <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors rotate-180"
                              onClick={() => toast.info("Previous not available via Spotify API")}>
                              <SkipForward size={14} />
                            </button>
                            <button onClick={() => isPlaying ? pause() : resume()}
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:scale-105"
                              style={{ background: SPOTIFY_GREEN }}>
                              {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                            </button>
                            <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors" onClick={skip}>
                              <SkipForward size={14} />
                            </button>
                            <div className="flex items-center gap-1.5 ml-2">
                              <Volume2 size={13} className="text-muted-foreground" />
                              <div className="w-16">
                                <Slider value={[deviceVolume]} min={0} max={100} step={5}
                                  onValueChange={([v]) => setVolume(v)} className="h-1" />
                              </div>
                              <span className="text-[10px] text-muted-foreground w-6 text-right">{deviceVolume}%</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-6">
                          <Music size={32} className="text-muted-foreground/20 mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground">No active playback. Open Spotify and start playing.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Song Search */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    className={glassCard} style={glassInner}>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <Search size={14} style={{ color: SPOTIFY_GREEN }} />
                        <h3 className="text-xs font-heading font-bold text-foreground uppercase tracking-wider">Search & Queue</h3>
                      </div>

                      <div className="relative mb-3">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input value={searchQuery}
                          onChange={e => handleSearch(e.target.value)}
                          placeholder="Search Spotify..."
                          className="pl-8 h-9 text-xs bg-white/[0.03] border-white/[0.08]" />
                      </div>

                      <div className="max-h-[220px] overflow-y-auto space-y-1">
                        {searching && <div className="text-center py-4 text-xs text-muted-foreground">Searching...</div>}
                        {!searching && searchResults.length === 0 && searchQuery.length >= 2 && (
                          <div className="text-center py-4 text-xs text-muted-foreground">No results</div>
                        )}
                        {searchResults.map(track => (
                          <button key={track.uri} onClick={() => addToQueue(track)}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.04] transition-colors text-left group">
                            {track.image ? (
                              <img src={track.image} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-8 h-8 rounded bg-muted/30 flex items-center justify-center flex-shrink-0">
                                <Music size={12} className="text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground truncate">{track.name}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{track.artist}</p>
                            </div>
                            <Plus size={14} className="text-muted-foreground/30 group-hover:text-primary transition-colors flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Tabs: Gift Thresholds, Safety */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className={glassCard} style={glassInner}>
                  <div className="border-b border-white/[0.06]">
                    <div className="flex gap-0 px-2 pt-2">
                      {[
                        { id: "controls" as const, label: "Gift Thresholds", icon: Gift },
                        { id: "thresholds" as const, label: "Queue & Limits", icon: ListMusic },
                        { id: "safety" as const, label: "Safety", icon: Shield },
                      ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition-all rounded-t-lg"
                          style={{
                            color: activeTab === tab.id ? SPOTIFY_GREEN : "hsl(var(--muted-foreground))",
                            background: activeTab === tab.id ? "rgba(29,185,84,0.06)" : "transparent",
                            borderBottom: activeTab === tab.id ? `2px solid ${SPOTIFY_GREEN}` : "2px solid transparent",
                          }}>
                          <tab.icon size={12} /> {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 space-y-5">
                    {/* Master toggle */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap size={14} style={{ color: SPOTIFY_GREEN }} />
                        <span className="text-xs font-bold text-foreground">Gift-Triggered Music Control</span>
                      </div>
                      <Switch checked={config.is_enabled} onCheckedChange={v => updateConfig({ is_enabled: v })} />
                    </div>

                    {activeTab === "controls" && (
                      <div className="space-y-4">
                        <p className="text-[10px] text-muted-foreground">Set how many coins each Spotify action costs. When a viewer's gift meets the threshold, the action triggers automatically.</p>
                        
                        <ThresholdRow icon="🎵" label="Song Request (Add to Queue)" desc="Viewer searches & queues a song"
                          value={config.queue_threshold} onChange={v => updateConfig({ queue_threshold: v })} min={1} max={5000} />
                        <ThresholdRow icon="⏭" label="Skip Track" desc="Skip the current song"
                          value={config.skip_threshold} onChange={v => updateConfig({ skip_threshold: v })} min={10} max={10000} />
                        <ThresholdRow icon="⏸" label="Pause / Resume" desc="Toggle playback"
                          value={config.pause_threshold} onChange={v => updateConfig({ pause_threshold: v })} min={10} max={5000} />
                        <ThresholdRow icon="👑" label="Priority Play (Jump Queue)" desc="Force next in queue"
                          value={config.priority_play_threshold} onChange={v => updateConfig({ priority_play_threshold: v })} min={100} max={50000} />
                        <ThresholdRow icon="🔊" label="Volume Boost" desc="Temporarily max volume"
                          value={config.volume_boost_threshold} onChange={v => updateConfig({ volume_boost_threshold: v })} min={10} max={5000} />
                      </div>
                    )}

                    {activeTab === "thresholds" && (
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-semibold text-foreground/70">Max Songs per Viewer per Session</label>
                            <span className="text-xs font-bold text-primary">{config.queue_limit_per_user}</span>
                          </div>
                          <Slider value={[config.queue_limit_per_user]} min={1} max={20} step={1}
                            onValueChange={([v]) => updateConfig({ queue_limit_per_user: v })} />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-semibold text-foreground/70">Skip Cooldown (seconds)</label>
                            <span className="text-xs font-bold text-primary">{config.skip_cooldown}s</span>
                          </div>
                          <Slider value={[config.skip_cooldown]} min={10} max={600} step={10}
                            onValueChange={([v]) => updateConfig({ skip_cooldown: v })} />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Crown size={14} className="text-muted-foreground" />
                            <span className="text-xs font-semibold text-foreground/70">Priority Queue for Top Gifters</span>
                          </div>
                          <Switch checked={config.priority_queue_enabled} onCheckedChange={v => updateConfig({ priority_queue_enabled: v })} />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MessageSquare size={14} className="text-muted-foreground" />
                            <div>
                              <span className="text-xs font-semibold text-foreground/70 block">Chat Command</span>
                              <span className="text-[10px] text-muted-foreground">Viewers type "{config.chat_command} song name"</span>
                            </div>
                          </div>
                          <Switch checked={config.chat_command_enabled} onCheckedChange={v => updateConfig({ chat_command_enabled: v })} />
                        </div>
                      </div>
                    )}

                    {activeTab === "safety" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Ban size={14} className="text-muted-foreground" />
                            <span className="text-xs font-semibold text-foreground/70">Allow Explicit Tracks</span>
                          </div>
                          <Switch checked={config.allow_explicit} onCheckedChange={v => updateConfig({ allow_explicit: v })} />
                        </div>

                        <div className="p-3 rounded-xl bg-muted/10 border border-border/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield size={12} className="text-muted-foreground" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Spotify ToS Compliance</span>
                          </div>
                          <ul className="space-y-1 text-[10px] text-muted-foreground/70">
                            <li>✅ Playback control only — no audio rebroadcast</li>
                            <li>✅ Requires active Spotify Premium session</li>
                            <li>✅ Viewer actions control streamer's own device</li>
                            <li>✅ No copyrighted content distribution</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Overlay URLs */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                  className={glassCard} style={glassInner}>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <ExternalLink size={14} className="text-muted-foreground" />
                      <h3 className="text-xs font-heading font-bold text-foreground uppercase tracking-wider">OBS Browser Source URLs</h3>
                    </div>
                    <div className="space-y-2">
                      {overlayUrls.map(o => (
                        <div key={o.path} className="flex items-center justify-between p-3 rounded-xl bg-muted/10 border border-border/20">
                          <div>
                            <p className="text-xs font-bold text-foreground">{o.label}</p>
                            <p className="text-[10px] text-muted-foreground">{o.desc}</p>
                          </div>
                          <button onClick={() => copyUrl(o.path)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                            style={{ background: copiedUrl === o.path ? "hsl(141 73% 42% / 0.15)" : "hsl(var(--muted) / 0.3)", color: copiedUrl === o.path ? SPOTIFY_GREEN : "hsl(var(--foreground))" }}>
                            {copiedUrl === o.path ? <Check size={12} /> : <Copy size={12} />}
                            {copiedUrl === o.path ? "Copied" : "Copy URL"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ProGate>
    </AppLayout>
  );
};

/* ─── Gift Threshold Row ─── */
const ThresholdRow = ({ icon, label, desc, value, onChange, min, max }: {
  icon: string; label: string; desc: string;
  value: number; onChange: (v: number) => void;
  min: number; max: number;
}) => (
  <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/10 border border-border/20">
    <span className="text-lg flex-shrink-0">{icon}</span>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold text-foreground">{label}</p>
      <p className="text-[10px] text-muted-foreground">{desc}</p>
    </div>
    <div className="flex items-center gap-2 flex-shrink-0">
      <div className="w-24">
        <Slider value={[value]} min={min} max={max} step={Math.max(1, Math.floor(max / 100))}
          onValueChange={([v]) => onChange(v)} />
      </div>
      <span className="text-xs font-bold text-primary w-14 text-right">{value.toLocaleString()} 🪙</span>
    </div>
  </div>
);

export default Sounds;
