import AppLayout from "@/components/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Keyboard, Search, ChevronDown, ChevronLeft, ChevronRight, Coins,
  Play, Save, Volume2, VolumeX, Check, Zap, HelpCircle, Command,
  Trash2, Pencil, Plus, Gamepad2, MoreVertical, X
} from "lucide-react";
import { useGiftCatalog, useUserGiftTriggers } from "@/hooks/use-gift-catalog";
import { useOverlayWidgets } from "@/hooks/use-overlay-widgets";
import { toast } from "sonner";
import FeatureGuideModal from "@/components/FeatureGuideModal";

/* ── Types ───────────────────────────────────────────────────── */
interface Profile {
  id: string;
  name: string;
  icon: string;
}

interface KeystrokeEntry {
  key: string;
  modifiers: string[];
  sound_enabled: boolean;
  sound_type: string;
  name: string;
}

/* ── Keystroke presets ───────────────────────────────────────── */
const keyPresets = [
  { label: "Space", key: "SPACE", modifiers: [] as string[], display: "SPACE" },
  { label: "Enter", key: "ENTER", modifiers: [] as string[], display: "ENTER" },
  { label: "Ctrl + Space", key: "SPACE", modifiers: ["CTRL"], display: "CTRL + SPACE" },
  { label: "Alt + F", key: "F", modifiers: ["ALT"], display: "ALT + F" },
  { label: "Ctrl + Shift + H", key: "H", modifiers: ["CTRL", "SHIFT"], display: "CTRL + SHIFT + H" },
  { label: "F1", key: "F1", modifiers: [] as string[], display: "F1" },
  { label: "F2", key: "F2", modifiers: [] as string[], display: "F2" },
  { label: "F5", key: "F5", modifiers: [] as string[], display: "F5" },
];

/* ── Sound options ───────────────────────────────────────────── */
const soundOptions = [
  { value: "default_chime", label: "Default Chime", emoji: "🔔" },
  { value: "sparkle_burst", label: "Sparkle Burst", emoji: "✨" },
  { value: "electric_pop", label: "Electric Pop", emoji: "⚡" },
  { value: "bass_pulse", label: "Bass Pulse", emoji: "🎵" },
  { value: "coin_drop", label: "Coin Drop", emoji: "🪙" },
  { value: "level_up", label: "Level Up", emoji: "🆙" },
];

/* ── Profile icon options ────────────────────────────────────── */
const profileIcons = ["🎮", "🕹️", "💬", "🎯", "🎵", "🔫", "⚽", "🏎️", "🧩", "🎤", "🖥️", "📱"];

/* ── Guide steps ─────────────────────────────────────────────── */
const keystrokeGuideSteps = [
  {
    icon: <Keyboard size={20} />,
    title: "Pick a Gift",
    subtitle: "Choose from your catalog",
    bullets: ["Browse your TikTok gifts", "Select the one to trigger a keystroke", "Works with any gift type"],
    visual: (
      <motion.div className="flex items-center gap-3">
        <motion.div className="text-4xl" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>🎁</motion.div>
        <motion.div className="text-2xl" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }}>→</motion.div>
        <motion.div className="text-4xl" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}>⌨️</motion.div>
      </motion.div>
    ),
  },
  {
    icon: <Gamepad2 size={20} />,
    title: "Create Game Profiles",
    subtitle: "Different setups per game",
    bullets: ["Create profiles for each game or activity", "Each profile has its own keystroke mappings", "Switch profiles instantly"],
    visual: (
      <motion.div className="flex gap-2">
        {["🎮 Fortnite", "💬 Chat", "🎵 Music"].map((p, i) => (
          <motion.div key={p} className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-xs font-bold"
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.2 }}>
            {p}
          </motion.div>
        ))}
      </motion.div>
    ),
  },
  {
    icon: <Check size={20} />,
    title: "Preview & Save",
    subtitle: "Test it, then save",
    bullets: ["Preview the trigger instantly", "Optionally add a sound effect", "Save and you're done!"],
    visual: (
      <motion.div className="flex items-center gap-3">
        <motion.div className="px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2"
          style={{ background: "hsl(160 100% 45% / 0.15)", border: "1px solid hsl(160 100% 45% / 0.3)", color: "hsl(160 100% 55%)" }}
          animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
          <Check size={16} /> Saved!
        </motion.div>
      </motion.div>
    ),
  },
];

const generateId = () => Math.random().toString(36).substring(2, 10);

/* ── Page component ──────────────────────────────────────────── */
const KeystrokeTriggers = () => {
  const { gifts, loading: giftsLoading } = useGiftCatalog();
  const { triggers, updateTrigger } = useUserGiftTriggers();
  const { widgets, updateSettings, createWidget } = useOverlayWidgets();

  const [search, setSearch] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  const [customKey, setCustomKey] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [showSoundPicker, setShowSoundPicker] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [triggerName, setTriggerName] = useState("");

  // Profile state
  const [activeProfileId, setActiveProfileId] = useState<string>("");
  const [showNewProfile, setShowNewProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileIcon, setNewProfileIcon] = useState("🎮");
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [editProfileName, setEditProfileName] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState<string | null>(null);

  // Get or create the keystroke_profiles widget
  const profilesWidget = useMemo(() => {
    return widgets.find(w => w.widget_type === "keystroke_profiles");
  }, [widgets]);

  const profiles: Profile[] = useMemo(() => {
    const settings = profilesWidget?.settings as any;
    return settings?.profiles || [];
  }, [profilesWidget]);

  // Set initial active profile
  useEffect(() => {
    if (profiles.length > 0 && !activeProfileId) {
      setActiveProfileId(profiles[0].id);
    }
  }, [profiles, activeProfileId]);

  const activeProfile = useMemo(() => profiles.find(p => p.id === activeProfileId), [profiles, activeProfileId]);

  useEffect(() => {
    const seen = localStorage.getItem("tikup_guide_seen_keystroke_triggers");
    if (!seen) setShowGuide(true);
  }, []);

  const filtered = useMemo(() => {
    if (!search) return gifts;
    return gifts.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));
  }, [gifts, search]);

  const currentGift = filtered[currentIndex];
  const currentTrigger = triggers.find(t => t.gift_id === currentGift?.gift_id);

  // Extract keystroke config for current profile
  const keystrokeConfig: KeystrokeEntry = useMemo(() => {
    if (!activeProfileId) return { key: "", modifiers: [], sound_enabled: false, sound_type: "default_chime", name: "" };
    const cc = currentTrigger?.custom_config as any;
    const keystrokes = cc?.keystrokes || {};
    return keystrokes[activeProfileId] || { key: "", modifiers: [], sound_enabled: false, sound_type: "default_chime", name: "" };
  }, [currentTrigger, activeProfileId]);

  // Sync triggerName when switching gifts/profiles
  useEffect(() => {
    setTriggerName(keystrokeConfig.name || "");
  }, [currentGift?.gift_id, activeProfileId, keystrokeConfig.name]);

  // All triggers that have keystroke config for the active profile
  const activeTriggers = useMemo(() => {
    if (!activeProfileId) return [];
    return triggers.filter(t => {
      const cc = t.custom_config as any;
      return cc?.keystrokes?.[activeProfileId]?.key;
    }).map(t => {
      const cc = t.custom_config as any;
      const ks = cc.keystrokes[activeProfileId];
      const gift = gifts.find(g => g.gift_id === t.gift_id);
      return {
        ...t,
        giftName: gift?.name || "Unknown",
        giftImage: gift?.image_url || null,
        giftCoins: gift?.coin_value || 0,
        keystrokeDisplay: [...(ks.modifiers || []), ks.key].join(" + "),
        keystrokeName: ks.name || "",
        soundEnabled: ks.sound_enabled || false,
      };
    });
  }, [triggers, gifts, activeProfileId]);

  const goNext = useCallback(() => setCurrentIndex(i => (i + 1) % filtered.length), [filtered.length]);
  const goPrev = useCallback(() => setCurrentIndex(i => (i - 1 + filtered.length) % filtered.length), [filtered.length]);

  const getImageUrl = (url: string | null) => url || "/placeholder.svg";

  const thumbRange = 2;
  const thumbs = useMemo(() => {
    if (filtered.length === 0) return [];
    const items: { gift: typeof filtered[0]; idx: number }[] = [];
    for (let offset = -thumbRange; offset <= thumbRange; offset++) {
      const idx = (currentIndex + offset + filtered.length) % filtered.length;
      items.push({ gift: filtered[idx], idx });
    }
    return items;
  }, [filtered, currentIndex]);

  /* ── Profile CRUD ─────────────────────────────────────────── */
  const saveProfiles = async (newProfiles: Profile[]) => {
    if (profilesWidget) {
      await updateSettings(profilesWidget.id, { profiles: newProfiles });
    } else {
      const created = await createWidget("keystroke_profiles", "Keystroke Profiles");
      if (created) {
        await updateSettings(created.id, { profiles: newProfiles });
      }
    }
  };

  const createProfile = async () => {
    if (!newProfileName.trim()) return;
    const id = generateId();
    const newProfile: Profile = { id, name: newProfileName.trim(), icon: newProfileIcon };
    const updated = [...profiles, newProfile];
    await saveProfiles(updated);
    setActiveProfileId(id);
    setNewProfileName("");
    setNewProfileIcon("🎮");
    setShowNewProfile(false);
    toast.success(`Profile "${newProfile.name}" created!`);
  };

  const deleteProfile = async (profileId: string) => {
    const updated = profiles.filter(p => p.id !== profileId);
    await saveProfiles(updated);
    if (activeProfileId === profileId) {
      setActiveProfileId(updated[0]?.id || "");
    }
    setShowProfileMenu(null);
    toast.success("Profile deleted");
  };

  const renameProfile = async (profileId: string) => {
    if (!editProfileName.trim()) return;
    const updated = profiles.map(p => p.id === profileId ? { ...p, name: editProfileName.trim() } : p);
    await saveProfiles(updated);
    setEditingProfileId(null);
    setEditProfileName("");
    toast.success("Profile renamed");
  };

  /* ── Keystroke operations (scoped to profile) ──────────── */
  const setKeystroke = (key: string, modifiers: string[]) => {
    if (!currentGift || !activeProfileId) return;
    const existingConfig = (currentTrigger?.custom_config as any) || {};
    const keystrokes = { ...(existingConfig.keystrokes || {}) };
    keystrokes[activeProfileId] = { ...keystrokeConfig, key, modifiers };
    updateTrigger(currentGift.gift_id, {
      custom_config: { ...existingConfig, keystrokes },
    });
  };

  const setSoundEnabled = (enabled: boolean) => {
    if (!currentGift || !activeProfileId) return;
    const existingConfig = (currentTrigger?.custom_config as any) || {};
    const keystrokes = { ...(existingConfig.keystrokes || {}) };
    keystrokes[activeProfileId] = { ...keystrokeConfig, sound_enabled: enabled };
    updateTrigger(currentGift.gift_id, {
      custom_config: { ...existingConfig, keystrokes },
    });
  };

  const setSoundType = (soundType: string) => {
    if (!currentGift || !activeProfileId) return;
    const existingConfig = (currentTrigger?.custom_config as any) || {};
    const keystrokes = { ...(existingConfig.keystrokes || {}) };
    keystrokes[activeProfileId] = { ...keystrokeConfig, sound_type: soundType };
    updateTrigger(currentGift.gift_id, {
      custom_config: { ...existingConfig, keystrokes },
    });
    setShowSoundPicker(false);
  };

  const displayKeystroke = keystrokeConfig.key
    ? [...(keystrokeConfig.modifiers || []), keystrokeConfig.key].join(" + ")
    : "Not set";

  const handlePreview = () => {
    setPreviewPlaying(true);
    setTimeout(() => setPreviewPlaying(false), 1500);
  };

  const handleSave = () => {
    if (!currentGift || !activeProfileId) return;
    const existingConfig = (currentTrigger?.custom_config as any) || {};
    const keystrokes = { ...(existingConfig.keystrokes || {}) };
    const name = triggerName || currentGift.name;
    keystrokes[activeProfileId] = { ...keystrokeConfig, name };
    updateTrigger(currentGift.gift_id, {
      custom_config: { ...existingConfig, keystrokes },
    });
    setJustSaved(true);
    toast.success(`Trigger saved! 🎉 ${name} → ${displayKeystroke}`);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const removeKeystroke = (giftId: string) => {
    if (!activeProfileId) return;
    const trigger = triggers.find(t => t.gift_id === giftId);
    const existingConfig = (trigger?.custom_config as any) || {};
    const keystrokes = { ...(existingConfig.keystrokes || {}) };
    delete keystrokes[activeProfileId];
    updateTrigger(giftId, {
      custom_config: { ...existingConfig, keystrokes },
    });
    toast.success("Trigger removed");
  };

  const jumpToGift = (giftId: string) => {
    const idx = filtered.findIndex(g => g.gift_id === giftId);
    if (idx >= 0) setCurrentIndex(idx);
  };

  const handleCustomKeyDown = (e: React.KeyboardEvent) => {
    e.preventDefault();
    const mods: string[] = [];
    if (e.ctrlKey) mods.push("CTRL");
    if (e.shiftKey) mods.push("SHIFT");
    if (e.altKey) mods.push("ALT");
    if (e.metaKey) mods.push("META");
    const key = e.key.toUpperCase();
    if (!["CONTROL", "SHIFT", "ALT", "META"].includes(key)) {
      setKeystroke(key, mods);
      setCustomKey([...mods, key].join(" + "));
    }
  };

  const hasProfiles = profiles.length > 0;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto relative z-10 pb-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-3xl font-heading font-bold text-foreground mb-1">Keystroke Triggers</h1>
            <button onClick={() => setShowGuide(true)} className="p-2 rounded-full transition-colors hover:bg-muted/40"
              style={{ color: "hsl(280 100% 70%)" }} title="How to use">
              <HelpCircle size={20} />
            </button>
          </div>
          <p className="text-muted-foreground text-sm">
            Link gifts to keystrokes — set up different profiles for each game
          </p>
        </motion.div>

        {/* ── Profile Selector ──────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}
          className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Gamepad2 size={14} className="text-primary" />
              <p className="text-xs font-bold text-foreground uppercase tracking-wider">Game Profiles</p>
            </div>
            <button onClick={() => setShowNewProfile(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:-translate-y-0.5"
              style={{ background: "hsl(200 100% 55% / 0.1)", border: "1px solid hsl(200 100% 55% / 0.2)", color: "hsl(200 100% 65%)" }}>
              <Plus size={12} /> New Profile
            </button>
          </div>

          {/* Profile chips */}
          {hasProfiles ? (
            <div className="flex flex-wrap gap-2">
              {profiles.map(p => {
                const isActive = activeProfileId === p.id;
                const isEditing = editingProfileId === p.id;
                return (
                  <div key={p.id} className="relative group">
                    {isEditing ? (
                      <div className="flex items-center gap-1 rounded-xl overflow-hidden"
                        style={{ background: "rgba(12,10,20,0.9)", border: "1px solid hsl(200 100% 55% / 0.3)" }}>
                        <span className="pl-3 text-sm">{p.icon}</span>
                        <input type="text" value={editProfileName} onChange={e => setEditProfileName(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && renameProfile(p.id)}
                          autoFocus
                          className="bg-transparent text-sm text-foreground px-2 py-2 outline-none w-28" />
                        <button onClick={() => renameProfile(p.id)}
                          className="p-2 text-primary hover:bg-white/[0.04]"><Check size={13} /></button>
                        <button onClick={() => { setEditingProfileId(null); setEditProfileName(""); }}
                          className="p-2 text-muted-foreground hover:bg-white/[0.04]"><X size={13} /></button>
                      </div>
                    ) : (
                      <button onClick={() => setActiveProfileId(p.id)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                        style={{
                          background: isActive ? "hsl(200 100% 55% / 0.1)" : "rgba(255,255,255,0.02)",
                          border: `1px solid ${isActive ? "hsl(200 100% 55% / 0.25)" : "rgba(255,255,255,0.06)"}`,
                          color: isActive ? "hsl(200 100% 70%)" : "inherit",
                          boxShadow: isActive ? "0 0 20px hsl(200 100% 55% / 0.08)" : "none",
                        }}>
                        <span className="text-base">{p.icon}</span>
                        <span>{p.name}</span>
                        {isActive && (
                          <span className="ml-1 w-1.5 h-1.5 rounded-full" style={{ background: "hsl(200 100% 55%)" }} />
                        )}
                      </button>
                    )}

                    {/* Context menu */}
                    {isActive && !isEditing && (
                      <div className="absolute -top-1 -right-1 z-10">
                        <button onClick={() => setShowProfileMenu(showProfileMenu === p.id ? null : p.id)}
                          className="w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}>
                          <MoreVertical size={10} className="text-muted-foreground" />
                        </button>
                        <AnimatePresence>
                          {showProfileMenu === p.id && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                              className="absolute top-6 right-0 rounded-xl overflow-hidden z-30 min-w-[120px]"
                              style={{ background: "rgba(15,12,25,0.95)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}>
                              <button onClick={() => { setEditingProfileId(p.id); setEditProfileName(p.name); setShowProfileMenu(null); }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-white/[0.04] transition-colors text-foreground">
                                <Pencil size={11} /> Rename
                              </button>
                              <button onClick={() => deleteProfile(p.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-red-500/10 transition-colors text-red-400">
                                <Trash2 size={11} /> Delete
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl p-6 text-center"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}>
              <Gamepad2 size={24} className="text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-1">No profiles yet</p>
              <p className="text-[11px] text-muted-foreground/60">Create a profile for each game or stream activity</p>
            </div>
          )}

          {/* New profile form */}
          <AnimatePresence>
            {showNewProfile && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden">
                <div className="mt-3 rounded-xl p-4"
                  style={{ background: "rgba(12,10,20,0.9)", border: "1px solid hsl(200 100% 55% / 0.15)" }}>
                  <p className="text-xs font-semibold text-foreground mb-3">Create New Profile</p>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex gap-1 flex-wrap">
                      {profileIcons.map(icon => (
                        <button key={icon} onClick={() => setNewProfileIcon(icon)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all"
                          style={{
                            background: newProfileIcon === icon ? "hsl(200 100% 55% / 0.15)" : "rgba(255,255,255,0.03)",
                            border: `1px solid ${newProfileIcon === icon ? "hsl(200 100% 55% / 0.3)" : "rgba(255,255,255,0.06)"}`,
                          }}>
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={newProfileName} onChange={e => setNewProfileName(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && createProfile()}
                      placeholder="e.g. Fortnite, Just Chatting…"
                      autoFocus
                      className="flex-1 bg-muted/30 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                    <button onClick={createProfile} disabled={!newProfileName.trim()}
                      className="px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-40"
                      style={{ background: "hsl(200 100% 55% / 0.15)", border: "1px solid hsl(200 100% 55% / 0.2)", color: "hsl(200 100% 65%)" }}>
                      Create
                    </button>
                    <button onClick={() => { setShowNewProfile(false); setNewProfileName(""); }}
                      className="px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-muted/30 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Only show gift picker + config when a profile is active */}
        {!hasProfiles ? null : !activeProfile ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Select a profile above to get started</div>
        ) : (
          <>
            {/* Active profile badge */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-base">{activeProfile.icon}</span>
              <span className="text-sm font-bold text-foreground">{activeProfile.name}</span>
              <span className="text-[10px] text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full">{activeTriggers.length} triggers</span>
            </div>

            {/* Search */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-8">
              <div className="relative w-full">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="text" value={search}
                  onChange={e => { setSearch(e.target.value); setCurrentIndex(0); }}
                  placeholder="Search gifts..."
                  className="w-full bg-muted/30 border border-border/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                />
              </div>
            </motion.div>

            {giftsLoading ? (
              <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">Loading gifts...</div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Keyboard size={32} className="text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground text-sm">No gifts found</p>
              </div>
            ) : (
              <>
                {/* ── Gift Carousel ─────────────────────────────── */}
                <div className="flex items-center justify-center gap-4 mb-4">
                  <button onClick={goPrev} className="w-10 h-10 rounded-full bg-muted/40 border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all">
                    <ChevronLeft size={20} />
                  </button>
                  <AnimatePresence mode="wait">
                    {currentGift && (
                      <motion.div key={currentGift.gift_id}
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="rounded-3xl p-[1px] w-[240px]"
                        style={{ background: "linear-gradient(135deg, hsl(200 100% 55% / 0.25), hsl(200 100% 55% / 0.05))" }}>
                        <div className="rounded-3xl p-6 flex flex-col items-center gap-3"
                          style={{ background: "rgba(12,10,20,0.9)", backdropFilter: "blur(24px)" }}>
                          <img src={getImageUrl(currentGift.image_url)} alt={currentGift.name}
                            className="w-20 h-20 object-contain drop-shadow-[0_0_24px_hsl(200,100%,55%,0.25)]"
                            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }} />
                          <div className="text-center">
                            <h3 className="text-lg font-heading font-bold text-foreground">{currentGift.name}</h3>
                            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                              <Coins size={12} /> {currentGift.coin_value} coins
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <button onClick={goNext} className="w-10 h-10 rounded-full bg-muted/40 border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all">
                    <ChevronRight size={20} />
                  </button>
                </div>

                {/* Thumbnail strip */}
                <div className="flex items-center justify-center gap-2 mb-8">
                  {thumbs.map(({ gift, idx }) => {
                    const isActive = idx === currentIndex;
                    return (
                      <button key={`${gift.gift_id}-${idx}`} onClick={() => setCurrentIndex(idx)}
                        className={`rounded-xl p-2 transition-all duration-200 ${isActive ? "ring-2 ring-primary/40 scale-110" : "opacity-50 hover:opacity-80"}`}
                        style={{ background: "rgba(20,25,35,0.7)" }}>
                        <img src={getImageUrl(gift.image_url)} alt={gift.name} className="w-7 h-7 object-contain"
                          onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }} />
                      </button>
                    );
                  })}
                  <span className="text-[10px] text-muted-foreground/50 ml-2">{currentIndex + 1}/{filtered.length}</span>
                </div>

                {/* ── Config Panel ──────────────────────────────── */}
                {currentGift && (
                  <motion.div key={currentGift.gift_id + "-" + activeProfileId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl p-[1px]"
                    style={{ background: "linear-gradient(135deg, hsl(200 100% 55% / 0.12), hsl(200 100% 55% / 0.02))" }}>
                    <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(12,10,20,0.85)", backdropFilter: "blur(24px)" }}>

                      {/* Current keystroke display */}
                      <div className="px-5 py-4 border-b border-white/[0.04]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                              style={{ background: "hsl(200 100% 55% / 0.1)", border: "1px solid hsl(200 100% 55% / 0.2)" }}>
                              <Keyboard size={18} style={{ color: "hsl(200 100% 55%)" }} />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Current Trigger · {activeProfile.icon} {activeProfile.name}</p>
                              <p className="text-sm font-bold text-foreground font-mono">{displayKeystroke}</p>
                            </div>
                          </div>
                          {keystrokeConfig.key && (
                            <div className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-semibold flex items-center gap-1">
                              <Zap size={10} /> Active
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="px-5 py-4 space-y-5">
                        {/* ── Step 2: Keystroke Picker ──────────── */}
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold mb-3">⌨️ Choose Keystroke</p>
                          <div className="grid grid-cols-2 gap-2">
                            {keyPresets.map(preset => {
                              const isActive = keystrokeConfig.key === preset.key &&
                                JSON.stringify(keystrokeConfig.modifiers || []) === JSON.stringify(preset.modifiers);
                              return (
                                <button key={preset.display} onClick={() => { setKeystroke(preset.key, preset.modifiers); setShowCustom(false); }}
                                  className="relative rounded-xl p-3 text-left transition-all"
                                  style={{
                                    background: isActive ? "hsl(200 100% 55% / 0.08)" : "rgba(255,255,255,0.02)",
                                    border: `1px solid ${isActive ? "hsl(200 100% 55% / 0.3)" : "rgba(255,255,255,0.06)"}`,
                                    boxShadow: isActive ? "0 0 16px hsl(200 100% 55% / 0.1)" : "none",
                                  }}>
                                  <p className="text-xs font-bold font-mono text-foreground">{preset.display}</p>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">{preset.label}</p>
                                  {isActive && (
                                    <motion.div layoutId="activeKey"
                                      className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full"
                                      style={{ background: "hsl(200 100% 55%)" }} />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Custom key input */}
                          <button onClick={() => setShowCustom(!showCustom)}
                            className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all"
                            style={{
                              background: showCustom ? "hsl(280 100% 65% / 0.08)" : "rgba(255,255,255,0.02)",
                              border: `1px solid ${showCustom ? "hsl(280 100% 65% / 0.2)" : "rgba(255,255,255,0.06)"}`,
                              color: showCustom ? "hsl(280 100% 70%)" : "inherit",
                            }}>
                            <Command size={12} /> Custom Combo…
                          </button>

                          <AnimatePresence>
                            {showCustom && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden">
                                <div className="mt-3 rounded-xl p-4"
                                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                  <p className="text-[10px] text-muted-foreground mb-2">Press any key or combo:</p>
                                  <input type="text" readOnly value={customKey || displayKeystroke}
                                    onKeyDown={handleCustomKeyDown}
                                    placeholder="Click here and press keys..."
                                    className="w-full bg-muted/40 border border-border/50 rounded-lg px-4 py-3 text-center text-sm font-mono font-bold text-foreground placeholder:text-muted-foreground/40 outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                                  />
                                  <p className="text-[10px] text-muted-foreground/50 mt-2 text-center">
                                    Hold modifier keys (Ctrl, Shift, Alt) + press any key
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* ── Step 3: Sound Toggle ──────────────── */}
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold mb-3">🔊 Trigger Sound</p>
                          <button onClick={() => setSoundEnabled(!keystrokeConfig.sound_enabled)}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors"
                            style={{
                              background: keystrokeConfig.sound_enabled ? "hsl(160 100% 45% / 0.08)" : "rgba(255,255,255,0.03)",
                              border: `1px solid ${keystrokeConfig.sound_enabled ? "hsl(160 100% 45% / 0.15)" : "rgba(255,255,255,0.06)"}`,
                            }}>
                            <div className="flex items-center gap-3">
                              {keystrokeConfig.sound_enabled ? <Volume2 size={16} className="text-primary" /> : <VolumeX size={16} className="text-muted-foreground" />}
                              <span className="text-sm font-medium text-foreground">
                                {keystrokeConfig.sound_enabled ? "Sound ON" : "Sound OFF"}
                              </span>
                            </div>
                            <div className={`w-10 h-[22px] rounded-full relative transition-colors ${keystrokeConfig.sound_enabled ? "bg-primary/30" : "bg-muted/60"}`}>
                              <div className={`w-4 h-4 rounded-full absolute top-[3px] transition-all ${keystrokeConfig.sound_enabled ? "left-[22px] bg-primary" : "left-1 bg-muted-foreground/60"}`} />
                            </div>
                          </button>

                          <AnimatePresence>
                            {keystrokeConfig.sound_enabled && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden">
                                <div className="mt-2 relative">
                                  <button onClick={() => setShowSoundPicker(!showSoundPicker)}
                                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors"
                                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                    <div className="flex items-center gap-2">
                                      <span>{soundOptions.find(s => s.value === keystrokeConfig.sound_type)?.emoji || "🔔"}</span>
                                      <span className="text-sm text-foreground">{soundOptions.find(s => s.value === keystrokeConfig.sound_type)?.label || "Default Chime"}</span>
                                    </div>
                                    <ChevronDown size={14} className="text-muted-foreground" />
                                  </button>

                                  <AnimatePresence>
                                    {showSoundPicker && (
                                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                        className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-20"
                                        style={{ background: "rgba(15,12,25,0.95)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}>
                                        {soundOptions.map(s => (
                                          <button key={s.value} onClick={() => setSoundType(s.value)}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/[0.04]"
                                            style={{ color: keystrokeConfig.sound_type === s.value ? "hsl(160 100% 50%)" : "inherit" }}>
                                            <span>{s.emoji}</span>
                                            <span>{s.label}</span>
                                            {keystrokeConfig.sound_type === s.value && <Check size={14} className="ml-auto text-primary" />}
                                          </button>
                                        ))}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* ── Step 4: Preview ───────────────────── */}
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold mb-3">🎯 Preview</p>
                          <button onClick={handlePreview} disabled={!keystrokeConfig.key}
                            className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
                            style={{
                              background: "linear-gradient(135deg, hsl(200 100% 55% / 0.12), hsl(160 100% 50% / 0.08))",
                              border: "1px solid hsl(200 100% 55% / 0.2)",
                              color: "hsl(200 100% 70%)",
                            }}>
                            <Play size={16} /> Preview Trigger
                          </button>

                          <AnimatePresence>
                            {previewPlaying && (
                              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                                className="mt-3 rounded-xl p-4 flex flex-col items-center gap-2"
                                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                <motion.div className="flex gap-1.5"
                                  initial={{ scale: 0.5 }} animate={{ scale: [0.5, 1.2, 1] }} transition={{ duration: 0.4 }}>
                                  {[...(keystrokeConfig.modifiers || []), keystrokeConfig.key].map((k, i) => (
                                    <motion.span key={i} className="px-3 py-2 rounded-lg font-mono text-sm font-bold"
                                      style={{ background: "hsl(200 100% 55% / 0.15)", border: "1px solid hsl(200 100% 55% / 0.3)", color: "hsl(200 100% 70%)" }}
                                      initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}>
                                      {k}
                                    </motion.span>
                                  ))}
                                </motion.div>
                                <p className="text-[11px] text-muted-foreground mt-1">
                                  ⚡ This key event will fire when <span className="text-foreground font-medium">{currentGift.name}</span> is received
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {!keystrokeConfig.key && (
                            <p className="text-[10px] text-muted-foreground/50 text-center mt-2">Select a keystroke above to preview</p>
                          )}
                        </div>

                        {/* ── Trigger Name ─────────────────────── */}
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold mb-2">✏️ Trigger Name</p>
                          <input type="text" value={triggerName}
                            onChange={e => setTriggerName(e.target.value)}
                            placeholder={currentGift?.name || "e.g. Scene Switch, Confetti…"}
                            className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                          />
                          <p className="text-[10px] text-muted-foreground/50 mt-1">Give it a name so you remember what it does</p>
                        </div>

                        {/* ── Step 5: Save ──────────────────────── */}
                        <button onClick={handleSave} disabled={!keystrokeConfig.key}
                          className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
                          style={{
                            background: justSaved
                              ? "hsl(160 100% 45% / 0.15)"
                              : "linear-gradient(135deg, hsl(160 100% 45% / 0.15), hsl(200 100% 55% / 0.1))",
                            border: `1px solid ${justSaved ? "hsl(160 100% 45% / 0.3)" : "hsl(160 100% 45% / 0.2)"}`,
                            color: "hsl(160 100% 60%)",
                          }}>
                          {justSaved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Trigger</>}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── Active Triggers List ──────────────────────── */}
                {activeTriggers.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="mt-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Zap size={16} className="text-primary" />
                      <h2 className="text-sm font-bold text-foreground">Active Triggers</h2>
                      <span className="text-[10px] text-muted-foreground/60">· {activeProfile.icon} {activeProfile.name}</span>
                      <span className="text-[10px] text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">{activeTriggers.length}</span>
                    </div>
                    <div className="space-y-2">
                      {activeTriggers.map(t => (
                        <motion.div key={t.gift_id} layout
                          className="rounded-xl p-[1px]"
                          style={{ background: "linear-gradient(135deg, hsl(160 100% 45% / 0.1), hsl(200 100% 55% / 0.05))" }}>
                          <div className="rounded-xl px-4 py-3 flex items-center gap-3"
                            style={{ background: "rgba(12,10,20,0.85)", backdropFilter: "blur(16px)" }}>
                            <img src={t.giftImage || "/placeholder.svg"} alt={t.giftName}
                              className="w-9 h-9 object-contain flex-shrink-0"
                              onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-foreground truncate">
                                  {t.keystrokeName || t.giftName}
                                </p>
                                {t.soundEnabled && <Volume2 size={10} className="text-primary flex-shrink-0" />}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-muted-foreground">{t.giftName}</span>
                                <span className="text-[10px] text-muted-foreground/40">→</span>
                                <span className="text-[10px] font-mono font-bold" style={{ color: "hsl(200 100% 65%)" }}>{t.keystrokeDisplay}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button onClick={() => jumpToGift(t.gift_id)}
                                className="p-2 rounded-lg hover:bg-white/[0.04] transition-colors text-muted-foreground hover:text-foreground" title="Edit">
                                <Pencil size={13} />
                              </button>
                              <button onClick={() => removeKeystroke(t.gift_id)}
                                className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-400" title="Remove">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </>
        )}
      </div>

      <FeatureGuideModal open={showGuide} onClose={() => setShowGuide(false)}
        featureKey="keystroke_triggers" title="Keystroke Triggers" steps={keystrokeGuideSteps} />
    </AppLayout>
  );
};

export default KeystrokeTriggers;
