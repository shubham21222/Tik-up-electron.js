import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Play, Pause, Search, Music, Zap, Bell, PartyPopper, Coins, ChevronDown, Link, X, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export interface SoundPreset {
  id: string;
  name: string;
  category: string;
  url: string;
}

const SOUND_LIBRARY: SoundPreset[] = [
  // Notifications
  { id: "chime-1", name: "Soft Chime", category: "Notifications", url: "https://cdn.freesound.org/previews/536/536420_4921277-lq.mp3" },
  { id: "chime-2", name: "Crystal Bell", category: "Notifications", url: "https://cdn.freesound.org/previews/411/411089_5121236-lq.mp3" },
  { id: "notif-pop", name: "Pop Notification", category: "Notifications", url: "https://cdn.freesound.org/previews/662/662411_11523868-lq.mp3" },
  { id: "ping", name: "Digital Ping", category: "Notifications", url: "https://cdn.freesound.org/previews/352/352661_5121236-lq.mp3" },
  { id: "message", name: "Message Tone", category: "Notifications", url: "https://cdn.freesound.org/previews/536/536108_4921277-lq.mp3" },
  // Rewards
  { id: "coin-1", name: "Coin Drop", category: "Rewards", url: "https://cdn.freesound.org/previews/341/341695_5858296-lq.mp3" },
  { id: "coin-2", name: "Coins Collect", category: "Rewards", url: "https://cdn.freesound.org/previews/512/512393_6142149-lq.mp3" },
  { id: "cash", name: "Cash Register", category: "Rewards", url: "https://cdn.freesound.org/previews/431/431329_3987862-lq.mp3" },
  { id: "levelup", name: "Level Up", category: "Rewards", url: "https://cdn.freesound.org/previews/270/270404_5123851-lq.mp3" },
  { id: "powerup", name: "Power Up", category: "Rewards", url: "https://cdn.freesound.org/previews/220/220173_1015240-lq.mp3" },
  // Fun
  { id: "airhorn", name: "Air Horn", category: "Fun", url: "https://cdn.freesound.org/previews/371/371545_6826834-lq.mp3" },
  { id: "applause", name: "Applause", category: "Fun", url: "https://cdn.freesound.org/previews/462/462362_8337304-lq.mp3" },
  { id: "tada", name: "Ta-Da!", category: "Fun", url: "https://cdn.freesound.org/previews/397/397354_4284968-lq.mp3" },
  { id: "woosh", name: "Woosh", category: "Fun", url: "https://cdn.freesound.org/previews/60/60013_718821-lq.mp3" },
  { id: "boing", name: "Boing", category: "Fun", url: "https://cdn.freesound.org/previews/361/361230_3246513-lq.mp3" },
  // Alerts
  { id: "alert-1", name: "Alert Beep", category: "Alerts", url: "https://cdn.freesound.org/previews/254/254174_4486188-lq.mp3" },
  { id: "ding", name: "Ding Dong", category: "Alerts", url: "https://cdn.freesound.org/previews/56/56240_91374-lq.mp3" },
  { id: "success", name: "Success", category: "Alerts", url: "https://cdn.freesound.org/previews/171/171671_2437358-lq.mp3" },
  { id: "magic", name: "Magic Spell", category: "Alerts", url: "https://cdn.freesound.org/previews/396/396106_7311865-lq.mp3" },
  { id: "whoosh-up", name: "Whoosh Up", category: "Alerts", url: "https://cdn.freesound.org/previews/337/337049_5865517-lq.mp3" },
];

const CATEGORIES = [
  { name: "All", icon: Music },
  { name: "Notifications", icon: Bell },
  { name: "Rewards", icon: Coins },
  { name: "Fun", icon: PartyPopper },
  { name: "Alerts", icon: Zap },
];

interface SoundLibraryPickerProps {
  currentUrl: string;
  currentName: string;
  onSelect: (url: string, name: string) => void;
}

export default function SoundLibraryPicker({ currentUrl, currentName, onSelect }: SoundLibraryPickerProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filtered = SOUND_LIBRARY.filter(s => {
    if (category !== "All" && s.category !== category) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handlePlay = (e: React.MouseEvent, sound: SoundPreset) => {
    e.stopPropagation();
    if (playingId === sound.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    audioRef.current?.pause();
    const audio = new Audio(sound.url);
    audioRef.current = audio;
    audio.play().catch(() => {});
    setPlayingId(sound.id);
    audio.onended = () => setPlayingId(null);
  };

  const handleSelect = (sound: SoundPreset) => {
    audioRef.current?.pause();
    setPlayingId(null);
    onSelect(sound.url, sound.name);
    setOpen(false);
  };

  const handleCustomSubmit = () => {
    if (!customUrl.trim()) return;
    onSelect(customUrl.trim(), "Custom URL");
    setCustomUrl("");
    setShowCustom(false);
    setOpen(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    const allowedTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/webm", "audio/x-wav"];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|webm)$/i)) {
      toast.error("Please upload an MP3, WAV, OGG, or WebM audio file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large — max 5MB");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "mp3";
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("sound-alerts")
        .upload(filePath, file, { contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("sound-alerts")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      const displayName = file.name.replace(/\.[^/.]+$/, ""); // strip extension

      onSelect(publicUrl, displayName);
      toast.success(`Uploaded "${displayName}"`);
      setOpen(false);
    } catch (err: any) {
      console.error("Upload failed:", err);
      toast.error("Upload failed: " + (err.message || "Unknown error"));
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const selectedPreset = SOUND_LIBRARY.find(s => s.url === currentUrl);
  const isUploaded = currentUrl && !selectedPreset && !currentUrl.includes("freesound.org");
  const displayName = selectedPreset?.name || currentName || (currentUrl ? (isUploaded ? "🔊 " + (currentName || "Uploaded Sound") : "Custom Sound") : "No sound selected");

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2 text-left min-w-0 group/btn"
      >
        <span className="text-sm truncate transition-colors" style={{ color: currentUrl ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground) / 0.4)" }}>
          {displayName}
        </span>
        <ChevronDown size={12} className="text-muted-foreground/40 flex-shrink-0 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
      </button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/webm,.mp3,.wav,.ogg,.webm"
        className="hidden"
        onChange={handleFileUpload}
      />

      <Dialog open={open} onOpenChange={(v) => { if (!v) { audioRef.current?.pause(); setPlayingId(null); } setOpen(v); }}>
        <DialogContent className="sm:max-w-lg bg-background border-white/[0.08] p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-5 pt-5 pb-0">
            <DialogTitle className="font-heading text-base flex items-center gap-2">
              <Volume2 size={16} className="text-primary" />
              Sound Library
            </DialogTitle>
          </DialogHeader>

          {/* Upload banner */}
          <div className="px-5 pt-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed transition-all text-sm font-medium"
              style={{
                borderColor: "hsl(160 100% 45% / 0.25)",
                background: "hsl(160 100% 45% / 0.04)",
                color: "hsl(160 100% 60%)",
              }}
            >
              <Upload size={14} />
              {uploading ? "Uploading…" : "Upload Custom Sound"}
              <span className="text-[10px] text-muted-foreground/50 ml-1">(MP3, WAV — max 5MB)</span>
            </button>
          </div>

          {/* Category tabs */}
          <div className="flex gap-1 px-5 pt-3 pb-2 overflow-x-auto">
            {CATEGORIES.map(c => {
              const Icon = c.icon;
              return (
                <button
                  key={c.name}
                  onClick={() => setCategory(c.name)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
                  style={{
                    background: category === c.name ? "hsl(160 100% 45% / 0.12)" : "transparent",
                    color: category === c.name ? "hsl(160 100% 60%)" : "hsl(var(--muted-foreground))",
                    border: `1px solid ${category === c.name ? "hsl(160 100% 45% / 0.25)" : "transparent"}`,
                  }}
                >
                  <Icon size={12} /> {c.name}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="px-5 pb-2">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search sounds..."
                className="pl-8 h-8 text-xs bg-white/[0.03] border-white/[0.08]"
              />
            </div>
          </div>

          {/* Sound list */}
          <div className="max-h-[300px] overflow-y-auto px-3 pb-2">
            <AnimatePresence mode="popLayout">
              {filtered.map((sound, idx) => (
                <motion.button
                  key={sound.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: idx * 0.015 }}
                  onClick={() => handleSelect(sound)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all hover:bg-white/[0.04] group/item"
                  style={{
                    background: currentUrl === sound.url ? "hsl(160 100% 45% / 0.08)" : undefined,
                  }}
                >
                  {/* Play preview */}
                  <div
                    onClick={(e) => handlePlay(e, sound)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                    style={{
                      background: playingId === sound.id ? "hsl(160 100% 45% / 0.15)" : "hsl(var(--muted-foreground) / 0.06)",
                    }}
                  >
                    {playingId === sound.id ? (
                      <Pause size={12} className="text-primary" />
                    ) : (
                      <Play size={12} className="text-muted-foreground group-hover/item:text-primary transition-colors" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{sound.name}</p>
                    <p className="text-[10px] text-muted-foreground/50">{sound.category}</p>
                  </div>

                  {currentUrl === sound.url && (
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "hsl(160 100% 45%)" }} />
                  )}
                </motion.button>
              ))}
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground/50">No sounds found</div>
            )}
          </div>

          {/* Custom URL / Clear */}
          <div className="border-t border-white/[0.06] px-5 py-3 flex items-center gap-2">
            {showCustom ? (
              <div className="flex items-center gap-2 w-full">
                <Input
                  value={customUrl}
                  onChange={e => setCustomUrl(e.target.value)}
                  placeholder="Paste sound URL..."
                  className="flex-1 h-8 text-xs bg-white/[0.03] border-white/[0.08]"
                  onKeyDown={e => e.key === "Enter" && handleCustomSubmit()}
                  autoFocus
                />
                <button
                  onClick={handleCustomSubmit}
                  disabled={!customUrl.trim()}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-40"
                  style={{ background: "hsl(160 100% 45%)" }}
                >
                  Use
                </button>
                <button onClick={() => setShowCustom(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowCustom(true)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Link size={12} /> Custom URL
                </button>
                {currentUrl && (
                  <>
                    <div className="flex-1" />
                    <button
                      onClick={() => { onSelect("", ""); setOpen(false); }}
                      className="text-xs text-muted-foreground/50 hover:text-destructive transition-colors"
                    >
                      Clear sound
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}