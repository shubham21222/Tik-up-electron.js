import { useState, useRef, useCallback } from "react";
import { useElevenLabsVoices, groupVoices, type ElevenLabsVoice } from "@/hooks/use-elevenlabs-voices";
import { TTS_VOICES } from "@/hooks/use-tts-settings";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Play, Square, Check, Loader2, Crown, Volume2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VoiceSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedVoiceId: string;
  onSelectVoice: (voiceId: string, voiceName: string) => void;
}

const VoiceSelectorModal = ({ open, onOpenChange, selectedVoiceId, onSelectVoice }: VoiceSelectorModalProps) => {
  const { voices, loading, error } = useElevenLabsVoices();
  const [search, setSearch] = useState("");
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopPreview = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPreviewingId(null);
  }, []);

  const handlePreview = useCallback(async (voice: ElevenLabsVoice) => {
    stopPreview();

    // If voice has a preview_url from ElevenLabs, use it directly
    if (voice.preview_url) {
      setPreviewingId(voice.voice_id);
      const audio = new Audio(voice.preview_url);
      audioRef.current = audio;
      audio.onended = () => { setPreviewingId(null); audioRef.current = null; };
      audio.onerror = () => { setPreviewingId(null); audioRef.current = null; toast.error("Preview failed"); };
      audio.play().catch(() => { setPreviewingId(null); });
      return;
    }

    // Fallback: call tts-generate
    setPreviewingId(voice.voice_id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Not authenticated"); setPreviewingId(null); return; }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tts-generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            text: "This is how this voice sounds on TikUp",
            voice_id: voice.voice_id,
          }),
        }
      );

      if (!response.ok) throw new Error("TTS failed");
      const data = await response.json();
      if (!data.audioContent) throw new Error("No audio");

      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => { setPreviewingId(null); audioRef.current = null; };
      audio.onerror = () => { setPreviewingId(null); audioRef.current = null; };
      audio.play().catch(() => setPreviewingId(null));
    } catch {
      toast.error("Could not preview voice");
      setPreviewingId(null);
    }
  }, [stopPreview]);

  // Merge dynamic voices with hardcoded fallback
  const allVoices: ElevenLabsVoice[] = voices.length > 0
    ? voices
    : TTS_VOICES.map(v => ({
        voice_id: v.id,
        name: v.name,
        category: "premade",
        labels: { description: v.tag },
        preview_url: null,
      }));

  const filtered = search.trim()
    ? allVoices.filter(v =>
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        Object.values(v.labels || {}).some(l => String(l).toLowerCase().includes(search.toLowerCase()))
      )
    : allVoices;

  const grouped = groupVoices(filtered);
  const groupOrder = ["Female", "Male", "Other"];
  const sortedGroups = Object.keys(grouped).sort((a, b) => {
    const ai = groupOrder.indexOf(a);
    const bi = groupOrder.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) stopPreview(); onOpenChange(v); }}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-primary flex items-center gap-2">
            <Volume2 size={18} /> Voice Library
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative mb-2">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-9 pl-9 text-sm bg-muted/30 border-border"
            placeholder="Search voices by name, accent, style..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Voice list */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0">
          {loading && (
            <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
              <Loader2 size={16} className="animate-spin" /> Loading voices...
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-8 text-destructive text-sm">
              Failed to load voices. Using defaults.
            </div>
          )}

          {!loading && sortedGroups.map((group) => (
            <div key={group}>
              <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2 sticky top-0 bg-card py-1 z-10">
                {group} ({grouped[group].length})
              </p>
              <div className="space-y-1">
                {grouped[group].map((voice) => {
                  const isSelected = voice.voice_id === selectedVoiceId;
                  const isPreviewing = previewingId === voice.voice_id;
                  const accent = voice.labels?.accent || "";
                  const desc = voice.labels?.description || voice.labels?.use_case || "";
                  const isPremium = voice.category === "professional";

                  return (
                    <button
                      key={voice.voice_id}
                      onClick={() => { onSelectVoice(voice.voice_id, voice.name); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group
                        ${isSelected
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-muted/40 border border-transparent"
                        }`}
                    >
                      {/* Selection indicator */}
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isSelected ? "bg-primary text-primary-foreground" : "border border-border"
                      }`}>
                        {isSelected && <Check size={11} />}
                      </div>

                      {/* Voice info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12px] font-semibold text-foreground">{voice.name}</span>
                          {isPremium && <Crown size={10} className="text-yellow-500" />}
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {[accent, desc].filter(Boolean).join(" · ") || voice.category}
                        </p>
                      </div>

                      {/* Preview button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isPreviewing) stopPreview();
                          else handlePreview(voice);
                        }}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors
                          ${isPreviewing
                            ? "bg-destructive/10 text-destructive"
                            : "bg-muted/40 text-muted-foreground hover:bg-primary/10 hover:text-primary opacity-0 group-hover:opacity-100"
                          }`}
                      >
                        {isPreviewing ? <Square size={12} /> : <Play size={12} />}
                      </button>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {!loading && filtered.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">No voices match "{search}"</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceSelectorModal;
