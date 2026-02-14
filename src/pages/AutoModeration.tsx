import AppLayout from "@/components/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import {
  Shield, Type, AlertTriangle, Link2, Clock,
  MessageSquareX, Ban, Eye, Upload, Download,
  X, Filter, Zap, Volume2, VolumeX, Search,
  ChevronDown, Trash2, UserX, History,
  Sparkles, MonitorPlay
} from "lucide-react";
import { useModeration, WORD_CATEGORIES, SEVERITY_OPTIONS, type BannedWord } from "@/hooks/use-moderation";
import { toast } from "sonner";
import AlertStylesTab from "@/components/moderation/AlertStylesTab";
import OverlayUrlsTab from "@/components/moderation/OverlayUrlsTab";

const glassCard = "rounded-2xl p-[1px]";
const glassGradient = { background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" };
const glassInnerStyle = { background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" };

type ModRule = {
  key: string;
  icon: any;
  label: string;
  desc: string;
};

const modRules: ModRule[] = [
  { key: "block_links", icon: Link2, label: "Block links in chat", desc: "Auto-delete messages containing URLs" },
  { key: "caps_filter", icon: Type, label: "Caps lock filter", desc: "Block all-caps messages (>80% uppercase)" },
  { key: "spam_detection", icon: AlertTriangle, label: "Spam detection", desc: "Block repeated messages within 5 seconds" },
  { key: "block_banned_words", icon: Shield, label: "Block banned words", desc: "Block banned words from chat & TTS" },
  { key: "allow_subscriber_links", icon: Link2, label: "Allow subscriber links", desc: "Subscribers can post links in chat" },
  { key: "slow_mode", icon: Clock, label: "Slow mode", desc: "Users can only send one message every 5 seconds" },
  { key: "emoji_only_filter", icon: MessageSquareX, label: "Emoji-only filter", desc: "Block messages that are only emojis (3+ emojis, no text)" },
  { key: "first_message_review", icon: Eye, label: "First-message review", desc: "Hold first-time chatter messages for manual approval" },
];

const tabs = [
  { key: "rules", label: "Rules", icon: Shield },
  { key: "words", label: "Word Filters", icon: Filter },
  { key: "users", label: "Banned Users", icon: Ban },
  { key: "styles", label: "Alert Styles", icon: Sparkles },
  { key: "overlays", label: "Overlay URLs", icon: MonitorPlay },
  { key: "log", label: "Mod Log", icon: History },
];

const categoryColors: Record<string, string> = {
  custom: "bg-primary/15 text-primary border-primary/20",
  hate_speech: "bg-red-500/15 text-red-400 border-red-500/20",
  sexual: "bg-pink-500/15 text-pink-400 border-pink-500/20",
  violence: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  fraud: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  deceptive: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  bullying: "bg-purple-500/15 text-purple-400 border-purple-500/20",
};

const severityIcons: Record<string, string> = {
  block: "🚫",
  warn: "⚠️",
  replace: "✏️",
};

const AutoModeration = () => {
  const {
    config, bannedWords, bannedUsers, modLog, loading,
    saveConfig, addBannedWord, addBannedWords, removeBannedWord,
    updateBannedWord, addBannedUser, removeBannedUser,
  } = useModeration();

  const [activeTab, setActiveTab] = useState("rules");
  const [wordInput, setWordInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("custom");
  const [selectedSeverity, setSelectedSeverity] = useState("block");
  const [banInput, setBanInput] = useState("");
  const [banReason, setBanReason] = useState("");
  const [wordSearch, setWordSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showCategoryDrop, setShowCategoryDrop] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleToggle = (key: string) => {
    saveConfig({ [key]: !(config as any)[key] } as any);
  };

  const handleAddWord = () => {
    if (!wordInput.trim()) return;
    const words = wordInput.split(",").map(w => w.trim()).filter(Boolean);
    if (words.length > 1) {
      addBannedWords(words, selectedCategory, selectedSeverity);
    } else {
      addBannedWord(words[0], selectedCategory, selectedSeverity);
    }
    setWordInput("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const words = text.split(/[\n,;]+/).map(w => w.trim()).filter(Boolean);
      if (words.length) {
        addBannedWords(words, selectedCategory, selectedSeverity);
        toast.success(`Importing ${words.length} words...`);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleExport = () => {
    const text = bannedWords.map(w => w.word).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "banned-words.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddBannedUser = () => {
    if (!banInput.trim()) return;
    addBannedUser(banInput, banReason || undefined);
    setBanInput("");
    setBanReason("");
  };

  const filteredWords = bannedWords.filter(w => {
    if (categoryFilter !== "all" && w.category !== categoryFilter) return false;
    if (wordSearch && !w.word.includes(wordSearch.toLowerCase())) return false;
    return true;
  });

  const wordsByCategory = WORD_CATEGORIES.map(cat => ({
    ...cat,
    count: bannedWords.filter(w => w.category === cat.value).length,
  }));

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Ambient glow */}
      <div className="fixed top-20 left-1/2 -translate-x-1/4 w-[500px] h-[300px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse, hsl(280 100% 65% / 0.04), transparent 70%)" }} />
      <div className="fixed top-40 right-1/4 w-[400px] h-[250px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse, hsl(160 100% 45% / 0.03), transparent 70%)" }} />

      <div className="max-w-6xl mx-auto relative z-10 pb-12">
        {/* ═══ HEADER ═══ */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground mb-1">
                Auto Moderation & Alert Preview
              </h1>
              <p className="text-sm text-muted-foreground max-w-xl">
                Manage what's allowed in chat, preview how alerts will appear on stream, and grab ready-to-use overlay URLs.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Safe Mode Toggle */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/30 border border-border/40">
                <Zap size={14} className={config.safe_mode ? "text-primary" : "text-muted-foreground"} />
                <span className="text-xs font-medium text-muted-foreground">Safe Mode</span>
                <button onClick={() => saveConfig({ safe_mode: !config.safe_mode })}
                  className={`w-9 h-[20px] rounded-full relative transition-colors duration-200 ${config.safe_mode ? "bg-primary/30" : "bg-muted/60"}`}>
                  <div className={`w-3.5 h-3.5 rounded-full absolute top-[3px] transition-all duration-200 ${config.safe_mode ? "left-[19px] bg-primary" : "left-1 bg-muted-foreground/60"}`} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══ TABS ═══ */}
        <div className="flex items-center gap-1 mb-6 p-1 rounded-xl bg-muted/30 w-fit overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon size={13} />
              {tab.label}
              {tab.key === "words" && bannedWords.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-md bg-muted/50 text-[10px]">{bannedWords.length}</span>
              )}
              {tab.key === "users" && bannedUsers.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-md bg-muted/50 text-[10px]">{bannedUsers.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ═══ TAB CONTENT ═══ */}
        <AnimatePresence mode="wait">
          {/* RULES TAB */}
          {activeTab === "rules" && (
            <motion.div key="rules" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className={`${glassCard} mb-6`} style={glassGradient}>
              <div className="rounded-2xl p-6" style={glassInnerStyle}>
                <h2 className="text-sm font-heading font-bold text-foreground mb-5 flex items-center gap-2">
                  <Shield size={16} className="text-primary" /> Moderation Rules
                </h2>
                <div className="space-y-4">
                  {modRules.map((rule) => {
                    const active = (config as any)[rule.key] as boolean;
                    return (
                      <div key={rule.key} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${active ? "bg-primary/10" : "bg-muted/50"}`}>
                            <rule.icon size={14} className={active ? "text-primary" : "text-muted-foreground"} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{rule.label}</p>
                            <p className="text-xs text-muted-foreground">{rule.desc}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Volume2 size={11} className={active ? "text-primary/60" : "text-muted-foreground/30"} />
                            <VolumeX size={11} className={active ? "text-primary/60" : "text-muted-foreground/30"} />
                          </div>
                          <button onClick={() => handleToggle(rule.key)}
                            className={`w-10 h-[22px] rounded-full relative transition-colors duration-200 ${active ? "bg-primary/30" : "bg-muted/60"}`}>
                            <div className={`w-4 h-4 rounded-full absolute top-[3px] transition-all duration-200 ${active ? "left-[22px] bg-primary" : "left-1 bg-muted-foreground/60"}`} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Applied to indicators */}
                <div className="mt-6 pt-4 border-t border-border/30">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-2">Filters apply to</p>
                  <div className="flex gap-2">
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/8 text-primary text-[11px] font-medium border border-primary/10">
                      <MessageSquareX size={11} /> Chat Messages
                    </span>
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/8 text-primary text-[11px] font-medium border border-primary/10">
                      <Volume2 size={11} /> TTS Engine
                    </span>
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/8 text-primary text-[11px] font-medium border border-primary/10">
                      <Zap size={11} /> Alert Triggers
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* WORD FILTERS TAB */}
          {activeTab === "words" && (
            <motion.div key="words" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              {/* Category summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
                {wordsByCategory.map(cat => (
                  <button key={cat.value} onClick={() => setCategoryFilter(cat.value === categoryFilter ? "all" : cat.value)}
                    className={`rounded-xl p-3 text-center transition-all duration-200 border ${
                      categoryFilter === cat.value
                        ? "border-primary/30 bg-primary/5"
                        : "border-border/30 bg-muted/20 hover:bg-muted/30"
                    }`}>
                    <p className={`text-lg font-bold ${cat.color}`}>{cat.count}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{cat.label}</p>
                  </button>
                ))}
              </div>

              <div className={glassCard} style={glassGradient}>
                <div className="rounded-2xl p-6" style={glassInnerStyle}>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-heading font-bold text-foreground flex items-center gap-2">
                      <Filter size={16} className="text-destructive" /> Blocked Words & Phrases
                    </h2>
                    <div className="flex items-center gap-2">
                      <input type="file" ref={fileRef} onChange={handleFileUpload} accept=".txt,.csv" className="hidden" />
                      <button onClick={() => fileRef.current?.click()}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/50 transition-colors">
                        <Upload size={12} /> Import
                      </button>
                      <button onClick={handleExport}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/50 transition-colors">
                        <Download size={12} /> Export
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-5">Messages containing these words are auto-blocked from chat and won't be read by TTS. Supports comma-separated bulk entry.</p>

                  {/* Add word input row */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <input type="text" value={wordInput} onChange={e => setWordInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleAddWord()}
                      placeholder="Add words (comma-separated)..."
                      className="flex-1 min-w-[200px] bg-muted/40 border border-border/60 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/40 transition-colors" />

                    {/* Category picker */}
                    <div className="relative">
                      <button onClick={() => setShowCategoryDrop(!showCategoryDrop)}
                        className="flex items-center gap-1 px-3 py-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                        {WORD_CATEGORIES.find(c => c.value === selectedCategory)?.label} <ChevronDown size={12} />
                      </button>
                      {showCategoryDrop && (
                        <div className="absolute top-full mt-1 left-0 z-20 rounded-xl border border-border/60 overflow-hidden min-w-[160px]"
                          style={glassInnerStyle}>
                          {WORD_CATEGORIES.map(cat => (
                            <button key={cat.value} onClick={() => { setSelectedCategory(cat.value); setShowCategoryDrop(false); }}
                              className={`w-full text-left px-3 py-2 text-xs hover:bg-muted/30 transition-colors ${cat.color}`}>
                              {cat.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Severity picker */}
                    <select value={selectedSeverity} onChange={e => setSelectedSeverity(e.target.value)}
                      className="px-3 py-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs font-medium text-muted-foreground outline-none">
                      {SEVERITY_OPTIONS.map(s => (
                        <option key={s.value} value={s.value}>{s.label} – {s.desc}</option>
                      ))}
                    </select>

                    <button onClick={handleAddWord}
                      className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
                      Add
                    </button>
                  </div>

                  {/* Search / Filter bar */}
                  {bannedWords.length > 5 && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="relative flex-1">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                        <input type="text" value={wordSearch} onChange={e => setWordSearch(e.target.value)}
                          placeholder="Search banned words..."
                          className="w-full bg-muted/30 border border-border/40 rounded-lg pl-9 pr-3 py-2 text-xs text-foreground outline-none focus:border-primary/30 transition-colors" />
                      </div>
                      {categoryFilter !== "all" && (
                        <button onClick={() => setCategoryFilter("all")}
                          className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground bg-muted/30">
                          <X size={12} /> Clear filter
                        </button>
                      )}
                    </div>
                  )}

                  {/* Word chips */}
                  <div className="flex flex-wrap gap-2 max-h-[320px] overflow-y-auto pr-1">
                    {filteredWords.length === 0 && (
                      <p className="text-xs text-muted-foreground italic py-4">
                        {bannedWords.length === 0 ? "No banned words yet. Add words above to get started." : "No words match your filter."}
                      </p>
                    )}
                    {filteredWords.map(w => (
                      <WordChip key={w.id} word={w} onRemove={removeBannedWord} onUpdate={updateBannedWord} />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* BANNED USERS TAB */}
          {activeTab === "users" && (
            <motion.div key="users" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className={glassCard} style={glassGradient}>
              <div className="rounded-2xl p-6" style={glassInnerStyle}>
                <h2 className="text-sm font-heading font-bold text-foreground mb-2 flex items-center gap-2">
                  <Ban size={16} className="text-destructive" /> Banned Users
                </h2>
                <p className="text-xs text-muted-foreground mb-5">These users are blocked from triggering any chat actions, TTS, or alerts.</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <input type="text" value={banInput} onChange={e => setBanInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAddBannedUser()}
                    placeholder="Enter username..."
                    className="flex-1 min-w-[160px] bg-muted/40 border border-border/60 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/40 transition-colors" />
                  <input type="text" value={banReason} onChange={e => setBanReason(e.target.value)}
                    placeholder="Reason (optional)..."
                    className="flex-1 min-w-[160px] bg-muted/40 border border-border/60 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/40 transition-colors" />
                  <button onClick={handleAddBannedUser}
                    className="px-5 py-2.5 rounded-xl bg-destructive/20 text-destructive text-sm font-semibold hover:bg-destructive/30 transition-colors">
                    Block
                  </button>
                </div>

                {bannedUsers.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-4">No users banned yet.</p>
                ) : (
                  <div className="space-y-2">
                    {bannedUsers.map(u => (
                      <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/30 group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                            <UserX size={14} className="text-destructive" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">@{u.username}</p>
                            {u.reason && <p className="text-[11px] text-muted-foreground">{u.reason}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {u.block_chat && <span className="px-1.5 py-0.5 rounded text-[9px] bg-muted/40 text-muted-foreground">Chat</span>}
                            {u.block_tts && <span className="px-1.5 py-0.5 rounded text-[9px] bg-muted/40 text-muted-foreground">TTS</span>}
                            {u.block_alerts && <span className="px-1.5 py-0.5 rounded text-[9px] bg-muted/40 text-muted-foreground">Alerts</span>}
                          </div>
                          <button onClick={() => removeBannedUser(u.id)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ALERT STYLES TAB */}
          {activeTab === "styles" && <AlertStylesTab />}

          {/* OVERLAY URLS TAB */}
          {activeTab === "overlays" && <OverlayUrlsTab />}

          {/* MOD LOG TAB */}
          {activeTab === "log" && (
            <motion.div key="log" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className={glassCard} style={glassGradient}>
              <div className="rounded-2xl p-6" style={glassInnerStyle}>
                <h2 className="text-sm font-heading font-bold text-foreground mb-5 flex items-center gap-2">
                  <History size={16} className="text-primary" /> Moderation Log
                </h2>
                {modLog.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-4">No moderation events recorded yet. Events appear here when messages are filtered.</p>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {modLog.map(entry => (
                      <div key={entry.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/15 border border-border/20">
                        <div className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                          <Shield size={12} className="text-destructive" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-medium text-foreground">@{entry.username}</span>
                            <span className="text-[10px] text-muted-foreground/60">
                              {new Date(entry.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">{entry.original_message}</p>
                          {entry.triggered_word && (
                            <span className="text-[10px] text-destructive">Trigger: "{entry.triggered_word}" · {entry.action_taken}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

/* ─── Word Chip Component ─── */
function WordChip({ word, onRemove, onUpdate }: {
  word: BannedWord;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<BannedWord>) => void;
}) {
  const colorClass = categoryColors[word.category] || categoryColors.custom;

  return (
    <span className={`group/chip flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${colorClass}`}>
      <span className="text-[10px] opacity-70">{severityIcons[word.severity] || "🚫"}</span>
      {word.word}
      <div className="flex items-center gap-0.5 ml-1">
        {word.apply_to_chat && <MessageSquareX size={9} className="opacity-40" />}
        {word.apply_to_tts && <VolumeX size={9} className="opacity-40" />}
      </div>
      <button onClick={() => onRemove(word.id)}
        className="ml-0.5 opacity-0 group-hover/chip:opacity-100 hover:scale-110 transition-all">
        <X size={12} />
      </button>
    </span>
  );
}

export default AutoModeration;
