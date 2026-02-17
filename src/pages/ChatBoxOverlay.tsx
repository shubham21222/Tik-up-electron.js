import AppLayout from "@/components/AppLayout";
import { useState, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOverlayWidgets, defaultChatBoxSettings } from "@/hooks/use-overlay-widgets";
import OverlaySettingsShell from "@/components/overlays/OverlaySettingsShell";
import SettingRow from "@/components/overlays/settings/SettingRow";
import SettingSelect from "@/components/overlays/settings/SettingSelect";
import SettingSlider from "@/components/overlays/settings/SettingSlider";
import SettingToggle from "@/components/overlays/settings/SettingToggle";
import SettingColorPicker from "@/components/overlays/settings/SettingColorPicker";
import ChatBoxPreview from "@/components/overlays/previews/ChatBoxPreview";

const ChatBoxOverlay = () => {
  const { user } = useAuth();
  const { widgets, loading, createWidget, updateSettings, deleteWidget, toggleActive } = useOverlayWidgets("chat_box");

  const handleCreate = async () => {
    await createWidget("chat_box", `Chat Box ${widgets.length + 1}`);
  };

  const updateSetting = useCallback((id: string, currentSettings: Record<string, any>, key: string, value: any) => {
    updateSettings(id, { ...currentSettings, [key]: value });
  }, [updateSettings]);

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <MessageCircle size={48} className="text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">Sign in to create Chat Overlays</h2>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse, hsl(280 100% 65% / 0.04), transparent 70%)" }}
      />

      <div className="max-w-5xl mx-auto relative z-10 pb-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground mb-1">Chat Box Overlay</h1>
            <p className="text-muted-foreground text-sm">Live chat display for your TikTok stream in OBS.</p>
          </div>
          <button onClick={handleCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, hsl(280 100% 65%), hsl(280 80% 55%))", color: "white", boxShadow: "0 0 25px hsl(280 100% 65% / 0.25)" }}>
            <Plus size={16} /> New Chat Box
          </button>
        </motion.div>

        {loading ? (
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => <div key={i} className="rounded-2xl h-64 bg-muted/20 animate-pulse" />)}
          </div>
        ) : widgets.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <MessageCircle size={48} className="text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">No Chat Boxes yet</h2>
            <p className="text-sm text-muted-foreground mb-6">Create your first chat overlay.</p>
            <button onClick={handleCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
              style={{ background: "linear-gradient(135deg, hsl(280 100% 65%), hsl(280 80% 55%))", color: "white" }}>
              <Plus size={16} /> Create Chat Box
            </button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {widgets.map(widget => {
                const s = { ...defaultChatBoxSettings, ...widget.settings };
                const set = (key: string, val: any) => updateSetting(widget.id, widget.settings, key, val);
                return (
                  <OverlaySettingsShell
                    key={widget.id}
                    widget={widget}
                    onDelete={() => deleteWidget(widget.id)}
                    onReset={() => updateSettings(widget.id, defaultChatBoxSettings)}
                    onToggleActive={() => toggleActive(widget.id)}
                    onTest={() => {}}
                    previewSlot={
                      <Suspense fallback={null}>
                        <ChatBoxPreview settings={s} />
                      </Suspense>
                    }
                    settingsSlot={
                      <div className="space-y-4">
                        <SettingRow label="Display Mode">
                          <SettingSelect value={s.display_mode} onChange={v => set("display_mode", v)} options={[
                            { value: "minimal", label: "Clean Minimal" },
                            { value: "twitch", label: "Twitch-Style" },
                            { value: "cyber", label: "Neon Cyber" },
                            { value: "glass", label: "Glass Panel" },
                          ]} />
                        </SettingRow>
                        <SettingRow label="Message Animation">
                          <SettingSelect value={s.message_animation} onChange={v => set("message_animation", v)} options={[
                            { value: "slide", label: "Slide In" },
                            { value: "fade", label: "Fade" },
                            { value: "pop", label: "Pop" },
                            { value: "typewriter", label: "Typewriter" },
                          ]} />
                        </SettingRow>
                        <SettingRow label="Max Messages" description="Max visible messages">
                          <SettingSlider value={s.max_messages} onChange={v => set("max_messages", v)} min={3} max={20} />
                        </SettingRow>
                        <SettingRow label="Message Fade Time" description="Seconds before messages fade">
                          <SettingSlider value={s.message_fade_time} onChange={v => set("message_fade_time", v)} min={5} max={120} suffix="s" />
                        </SettingRow>
                        <SettingRow label="Font Size">
                          <SettingSlider value={s.font_size} onChange={v => set("font_size", v)} min={10} max={24} suffix="px" />
                        </SettingRow>
                        <SettingRow label="Font Family">
                          <SettingSelect value={s.font_family} onChange={v => set("font_family", v)} options={[
                            { value: "sans", label: "Sans Serif" },
                            { value: "mono", label: "Monospace" },
                            { value: "heading", label: "Heading" },
                          ]} />
                        </SettingRow>
                        <SettingRow label="Emote Scale">
                          <SettingSlider value={s.emote_scale} onChange={v => set("emote_scale", v)} min={0.5} max={3} step={0.1} suffix="x" />
                        </SettingRow>
                        <SettingRow label="Auto-Color Usernames">
                          <SettingToggle checked={s.username_color_auto} onChange={v => set("username_color_auto", v)} />
                        </SettingRow>
                        <SettingRow label="Show Badges">
                          <SettingToggle checked={s.show_badges} onChange={v => set("show_badges", v)} />
                        </SettingRow>
                        <SettingRow label="Shadow Depth">
                          <SettingSlider value={s.shadow_depth} onChange={v => set("shadow_depth", v)} min={0} max={100} suffix="%" />
                        </SettingRow>
                        <SettingRow label="Accent Color">
                          <SettingColorPicker value={s.accent_color} onChange={v => set("accent_color", v)} />
                        </SettingRow>
                      </div>
                    }
                    advancedSlot={
                      <div className="space-y-4">
                        <SettingRow label="Highlight Gifts in Chat">
                          <SettingToggle checked={s.highlight_gifts} onChange={v => set("highlight_gifts", v)} />
                        </SettingRow>
                        <SettingRow label="Highlight Keywords" description="Comma-separated">
                          <input
                            value={s.highlight_keywords}
                            onChange={e => set("highlight_keywords", e.target.value)}
                            placeholder="keyword1, keyword2"
                            className="text-[11px] px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-foreground font-medium focus:outline-none focus:border-primary/30 w-[180px]"
                          />
                        </SettingRow>
                        <SettingRow label="Highlight Moderators">
                          <SettingToggle checked={s.highlight_moderators} onChange={v => set("highlight_moderators", v)} />
                        </SettingRow>
                        <SettingRow label="Auto-Scroll">
                          <SettingToggle checked={s.auto_scroll} onChange={v => set("auto_scroll", v)} />
                        </SettingRow>
                        <SettingRow label="Transparent Background">
                          <SettingToggle checked={s.transparent_bg} onChange={v => set("transparent_bg", v)} />
                        </SettingRow>
                        <SettingRow label="FPS Limit">
                          <SettingSelect value={String(s.fps_limit)} onChange={v => set("fps_limit", Number(v))} options={[
                            { value: "30", label: "30 FPS" },
                            { value: "60", label: "60 FPS" },
                          ]} />
                        </SettingRow>
                        <div>
                          <p className="text-[12px] font-medium text-foreground mb-1.5">Custom CSS</p>
                          <textarea
                            value={s.custom_css}
                            onChange={e => set("custom_css", e.target.value)}
                            placeholder="/* Custom CSS overrides */"
                            className="w-full h-24 text-[11px] font-mono p-3 rounded-lg border border-white/[0.08] bg-white/[0.02] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/30 resize-none"
                          />
                        </div>
                      </div>
                    }
                  />
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ChatBoxOverlay;
