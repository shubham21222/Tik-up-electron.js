import AppLayout from "@/components/AppLayout";
import { useOverlayWidgets } from "@/hooks/use-overlay-widgets";
import { useTTSSettings, TTS_VOICES } from "@/hooks/use-tts-settings";
import { useSubscription } from "@/hooks/use-subscription";
import OverlaySettingsShell from "@/components/overlays/OverlaySettingsShell";
import SettingToggle from "@/components/overlays/settings/SettingToggle";
import SettingSlider from "@/components/overlays/settings/SettingSlider";
import SettingSelect from "@/components/overlays/settings/SettingSelect";
import SettingRow from "@/components/overlays/settings/SettingRow";
import TTSOverlay from "@/components/overlays/TTSOverlay";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Volume2, Mic, Crown, Plus, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const TTSOverlayPage = () => {
  const { widgets, loading, createWidget, updateSettings, deleteWidget, toggleActive } = useOverlayWidgets("tts");
  const { settings: ttsSettings, saveSettings: saveTTSSettings } = useTTSSettings();
  const { isPro } = useSubscription();
  const [localSettings, setLocalSettings] = useState(ttsSettings);
  const [testing, setTesting] = useState(false);

  useEffect(() => { setLocalSettings(ttsSettings); }, [ttsSettings]);

  const handleCreate = async () => {
    if (!isPro) {
      toast.error("TTS requires a Pro subscription");
      return;
    }
    await createWidget("tts", "TTS Overlay");
  };

  const handleTest = async (widget: any) => {
    if (testing) return;
    setTesting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please log in"); return; }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tts-generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            text: "This is a test of the text to speech system. Welcome to TikUp!",
            overlay_token: widget.public_token,
            username: "TestUser",
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "TTS test failed");
        return;
      }

      // Play locally
      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
      const audio = new Audio(audioUrl);
      audio.volume = (localSettings.volume || 80) / 100;
      await audio.play();
      toast.success("TTS test played!");
    } catch {
      toast.error("TTS test failed");
    } finally {
      setTesting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto pb-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2 flex items-center gap-3">
              <Mic size={28} className="text-primary" />
              Text-to-Speech
            </h1>
            <p className="text-muted-foreground text-sm">Configure TTS for your stream overlays.</p>
          </div>
          <button
            onClick={handleCreate}
            disabled={!isPro}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_25px_hsl(160_100%_45%/0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPro ? <Plus size={16} /> : <Lock size={16} />}
            {isPro ? "Create TTS Overlay" : "Pro Required"}
          </button>
        </motion.div>

        {/* PRO Gate Banner */}
        {!isPro && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-secondary/30 bg-secondary/5 p-6 mb-8 text-center"
          >
            <Crown size={32} className="text-secondary mx-auto mb-3" />
            <h3 className="text-lg font-heading font-bold text-foreground mb-2">TTS is a Pro Feature</h3>
            <p className="text-sm text-muted-foreground mb-4">Upgrade to Pro to unlock text-to-speech with 10+ premium voices, blacklist filtering, and real-time overlay broadcasting.</p>
            <a href="/pro" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
              <Crown size={14} /> Upgrade to Pro
            </a>
          </motion.div>
        )}

        {/* Global TTS Settings */}
        {isPro && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-border bg-card p-6 mb-8 space-y-5"
          >
            <div className="flex items-center gap-2 mb-1">
              <Volume2 size={16} className="text-primary" />
              <h3 className="text-sm font-heading font-bold text-foreground uppercase tracking-wider">Global TTS Settings</h3>
            </div>

            <SettingRow label="Enable TTS" description="Allow chat messages to be read aloud">
              <SettingToggle
                checked={localSettings.enabled}
                onChange={(v) => { setLocalSettings(p => ({ ...p, enabled: v })); saveTTSSettings({ enabled: v }); }}
              />
            </SettingRow>

            <SettingRow label="Voice">
              <SettingSelect
                value={localSettings.voice_id}
                options={TTS_VOICES.map(v => ({ value: v.id, label: `${v.name} — ${v.tag}` }))}
                onChange={(v) => { setLocalSettings(p => ({ ...p, voice_id: v })); saveTTSSettings({ voice_id: v }); }}
              />
            </SettingRow>

            <SettingRow label="Volume">
              <SettingSlider
                value={localSettings.volume}
                min={0} max={100} step={5}
                onChange={(v) => { setLocalSettings(p => ({ ...p, volume: v })); saveTTSSettings({ volume: v }); }}
              />
            </SettingRow>

            <SettingRow label="Speed">
              <SettingSlider
                value={localSettings.speed * 100}
                min={70} max={120} step={5}
                onChange={(v) => { setLocalSettings(p => ({ ...p, speed: v / 100 })); saveTTSSettings({ speed: v / 100 }); }}
              />
            </SettingRow>

            <SettingRow label="Cooldown (seconds)">
              <SettingSlider
                value={localSettings.cooldown_seconds}
                min={0} max={30} step={1}
                onChange={(v) => { setLocalSettings(p => ({ ...p, cooldown_seconds: v })); saveTTSSettings({ cooldown_seconds: v }); }}
              />
            </SettingRow>

            <SettingRow label="Min Characters">
              <SettingSlider
                value={localSettings.min_chars}
                min={1} max={50} step={1}
                onChange={(v) => { setLocalSettings(p => ({ ...p, min_chars: v })); saveTTSSettings({ min_chars: v }); }}
              />
            </SettingRow>

            <SettingRow label="Max Length">
              <SettingSlider
                value={localSettings.max_length}
                min={50} max={500} step={10}
                onChange={(v) => { setLocalSettings(p => ({ ...p, max_length: v })); saveTTSSettings({ max_length: v }); }}
              />
            </SettingRow>

            <SettingRow label="Interrupt Mode" description="New messages interrupt currently playing TTS">
              <SettingToggle
                checked={localSettings.interrupt_mode}
                onChange={(v) => { setLocalSettings(p => ({ ...p, interrupt_mode: v })); saveTTSSettings({ interrupt_mode: v }); }}
              />
            </SettingRow>
          </motion.div>
        )}

        {/* TTS Overlay Widgets */}
        {widgets.map((widget) => (
          <div key={widget.id} className="mb-6">
            <OverlaySettingsShell
              widget={widget}
              onDelete={() => deleteWidget(widget.id)}
              onReset={() => updateSettings(widget.id, {})}
              onToggleActive={() => toggleActive(widget.id)}
              onTest={() => handleTest(widget)}
              previewSlot={<TTSOverlay />}
              settingsSlot={
                <div className="space-y-3">
                  <SettingRow label="Overlay Token" description="Use this token in your OBS browser source">
                    <span className="text-[11px] font-mono text-muted-foreground">{widget.public_token.slice(0, 12)}…</span>
                  </SettingRow>
                </div>
              }
            />
          </div>
        ))}

        {isPro && widgets.length === 0 && !loading && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            No TTS overlays yet. Click "Create TTS Overlay" to get started.
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default TTSOverlayPage;
