import AppLayout from "@/components/AppLayout";
import PageHelpButton from "@/components/PageHelpButton";
import { useTTSSettings, TTS_VOICES, TTS_LANGUAGES } from "@/hooks/use-tts-settings";
import type { AllowedUsers, SpecialUser } from "@/hooks/use-tts-settings";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Mic, Play, Plus, Trash2, Search, Copy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

const sectionClass = "rounded-2xl border border-border bg-card p-5 space-y-4";
const sectionTitle = "text-sm font-heading font-bold text-primary uppercase tracking-wider mb-3";
const rowClass = "flex items-center justify-between gap-4";
const labelClass = "text-[12px] font-medium text-foreground";
const descClass = "text-[10px] text-muted-foreground";
const selectClass = "text-[11px] px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-foreground font-medium focus:outline-none focus:border-primary/30 transition-colors min-w-[160px]";
const numberClass = "w-20 text-[11px] px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-foreground font-medium focus:outline-none focus:border-primary/30 text-center";

const TTSOverlayPage = () => {
  const { user } = useAuth();
  const { settings, saveSettings, loading } = useTTSSettings();
  const [local, setLocal] = useState(settings);
  const [testText, setTestText] = useState("This is a test!");
  const [testing, setTesting] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [ttsWidget, setTtsWidget] = useState<{ public_token: string } | null>(null);

  useEffect(() => { setLocal(settings); }, [settings]);

  // Fetch or create TTS overlay widget
  useEffect(() => {
    if (!user) return;
    const ensureTTSWidget = async () => {
      const { data } = await supabase
        .from("overlay_widgets")
        .select("public_token")
        .eq("user_id", user.id)
        .eq("widget_type", "tts")
        .maybeSingle();
      if (data) {
        setTtsWidget(data);
      } else {
        // Auto-create TTS widget
        const token = crypto.randomUUID().replace(/-/g, '');
        const { data: created } = await supabase
          .from("overlay_widgets")
          .insert({
            user_id: user.id,
            widget_type: "tts",
            name: "TTS Overlay",
            public_token: token,
            is_active: true,
            settings: {},
          })
          .select("public_token")
          .single();
        if (created) setTtsWidget(created);
      }
    };
    ensureTTSWidget();
  }, [user]);

  const update = (patch: Partial<typeof settings>) => {
    setLocal(prev => ({ ...prev, ...patch }));
    saveSettings(patch);
  };

  const updateAllowed = (key: keyof AllowedUsers, value: any) => {
    const next = { ...local.allowed_users, [key]: value };
    update({ allowed_users: next });
  };

  const handleTest = () => {
    if (testing || !testText.trim()) return;
    if (!('speechSynthesis' in window)) {
      toast.error("Browser doesn't support speech synthesis");
      return;
    }
    setTesting(true);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(testText);
    utterance.volume = local.volume / 100;
    utterance.rate = local.speed / 50; // map 1-100 to 0.02-2.0
    utterance.pitch = local.pitch / 50; // map 1-100 to 0.02-2.0
    utterance.onend = () => { setTesting(false); toast.success("TTS played!"); };
    utterance.onerror = () => { setTesting(false); toast.error("TTS playback failed"); };
    window.speechSynthesis.speak(utterance);
  };

  const addSpecialUser = () => {
    if (!newUsername.trim()) return;
    const exists = local.special_users.some(u => u.username === newUsername.trim());
    if (exists) { toast.error("User already added"); return; }
    const user: SpecialUser = { username: newUsername.trim(), allowed: true, voice_id: local.voice_id, speed: local.speed, pitch: local.pitch };
    update({ special_users: [...local.special_users, user] });
    setNewUsername("");
  };

  const removeSpecialUser = (username: string) => {
    update({ special_users: local.special_users.filter(u => u.username !== username) });
  };

  const updateSpecialUser = (username: string, patch: Partial<SpecialUser>) => {
    update({
      special_users: local.special_users.map(u =>
        u.username === username ? { ...u, ...patch } : u
      ),
    });
  };

  const filteredSpecial = userSearch
    ? local.special_users.filter(u => u.username.toLowerCase().includes(userSearch.toLowerCase()))
    : local.special_users;

  if (loading) return <AppLayout><div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto pb-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-heading font-bold text-primary flex items-center gap-2 mb-2">
            <Mic size={24} /> Text-to-Speech Chat
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Here you can read out the chat comments from your viewers automatically via Text-to-Speech (TTS).<br />
            The voice is played directly in the browser. No Overlay is required!<br />
            A TTS feature is also available via <Link to="/actions" className="text-primary hover:underline">Actions &amp; Events</Link> which offers more flexibility (e.g. Read out gifts).
          </p>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* General Settings */}
          <div className={sectionClass}>
            <h3 className={sectionTitle}>General Settings</h3>
            <div className={rowClass}>
              <span className={labelClass}>Enabled</span>
              <Switch checked={local.enabled} onCheckedChange={(v) => update({ enabled: v })} />
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Language</span>
              <select className={selectClass} value={local.language} onChange={(e) => update({ language: e.target.value })}>
                {TTS_LANGUAGES.map(l => <option key={l.value} value={l.value} className="bg-[#0a0a0f]">{l.label}</option>)}
              </select>
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Voice</span>
              <select className={selectClass} value={local.voice_id} onChange={(e) => update({ voice_id: e.target.value })}>
                {TTS_VOICES.map(v => <option key={v.id} value={v.id} className="bg-[#0a0a0f]">{v.name} — {v.tag}</option>)}
              </select>
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Random Voice</span>
              <Switch checked={local.random_voice} onCheckedChange={(v) => update({ random_voice: v })} />
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Default Speed</span>
              <input type="number" className={numberClass} value={local.speed} min={1} max={100}
                onChange={(e) => update({ speed: Number(e.target.value) })} />
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Default Pitch</span>
              <input type="number" className={numberClass} value={local.pitch} min={1} max={100}
                onChange={(e) => update({ pitch: Number(e.target.value) })} />
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Volume</span>
              <div className="flex items-center gap-2 flex-1 max-w-[160px]">
                <input type="range" className="flex-1 accent-primary" min={0} max={100} value={local.volume}
                  onChange={(e) => update({ volume: Number(e.target.value) })} />
                <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">{local.volume}%</span>
              </div>
            </div>
          </div>

          {/* Allowed Users */}
          <div className={sectionClass}>
            <h3 className={sectionTitle}>Allowed Users</h3>
            {([
              ["all_users", "All Users"],
              ["followers", "Followers"],
              ["subscribers", "Super Fans / Subscribers"],
              ["moderators", "Moderators"],
              ["team_members", "Team Members"],
            ] as [keyof AllowedUsers, string][]).map(([key, label]) => (
              <div key={key} className={rowClass}>
                <span className={labelClass}>{label}</span>
                <Switch checked={!!local.allowed_users[key]} onCheckedChange={(v) => updateAllowed(key, v)} />
              </div>
            ))}
            <div className={rowClass}>
              <div>
                <span className={labelClass}>Top Gifters</span>
                {local.allowed_users.top_gifters && (
                  <span className="text-[9px] text-primary ml-1.5">Top {local.allowed_users.top_gifters_count}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {local.allowed_users.top_gifters && (
                  <input type="number" className={numberClass + " !w-14"} min={1} max={100}
                    value={local.allowed_users.top_gifters_count}
                    onChange={(e) => updateAllowed("top_gifters_count", Number(e.target.value))} />
                )}
                <Switch checked={local.allowed_users.top_gifters} onCheckedChange={(v) => updateAllowed("top_gifters", v)} />
              </div>
            </div>
          </div>

          {/* Comment Types */}
          <div className={sectionClass}>
            <h3 className={sectionTitle}>Comment Types</h3>
            <p className="text-[11px] text-muted-foreground mb-2">Read...</p>
            {([
              ["any", "Any comment"],
              ["dot", "Comments starting with dot (.)"],
              ["slash", "Comments starting with slash (/)"],
              ["command", "Comments starting with Command:"],
            ] as [string, string][]).map(([val, label]) => (
              <label key={val} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="comment_type" className="accent-primary" checked={local.comment_type === val}
                  onChange={() => update({ comment_type: val })} />
                <span className={labelClass}>{label}</span>
              </label>
            ))}
            {local.comment_type === "command" && (
              <div className="flex items-center gap-2 mt-1 ml-6">
                <span className={`${labelClass} flex-shrink-0`}>Command</span>
                <Input className="h-7 text-[11px] bg-white/[0.03] border-white/[0.08]" value={local.comment_command}
                  onChange={(e) => update({ comment_command: e.target.value })} />
              </div>
            )}
          </div>

          {/* Charge Points */}
          <div className={sectionClass}>
            <h3 className={sectionTitle}>Charge Points</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="charge" className="accent-primary" checked={!local.charge_points}
                onChange={() => update({ charge_points: false })} />
              <span className={labelClass}>No, its free</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="charge" className="accent-primary" checked={local.charge_points}
                onChange={() => update({ charge_points: true })} />
              <span className={labelClass}>Yes, withdraw the following amount:</span>
            </label>
            {local.charge_points && (
              <div className={`${rowClass} ml-6`}>
                <span className={labelClass}>Cost per Message</span>
                <input type="number" className={numberClass} value={local.cost_per_message} min={1}
                  onChange={(e) => update({ cost_per_message: Number(e.target.value) })} />
              </div>
            )}
            {local.charge_points && (
              <p className="text-[9px] text-muted-foreground ml-6">(If the user doesn't have enough points, the comment will NOT be read)</p>
            )}
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Special Users */}
          <div className={`${sectionClass} lg:col-span-2`}>
            <h3 className={sectionTitle}>Special Users</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Here you can allow and disallow users to use TTS and assign their own voices!<br />
              If you disable the "Allowed" option, the user is entirely blocked from TTS.<br />
              Click on + to add a new user.
            </p>

            <div className="flex items-center gap-2 mt-3">
              <button onClick={addSpecialUser} className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors flex-shrink-0">
                <Plus size={14} />
              </button>
              <Input className="h-8 text-[11px] bg-white/[0.03] border-white/[0.08] flex-1" placeholder="Username (@handle)"
                value={newUsername} onChange={(e) => setNewUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSpecialUser()} />
              <div className="relative flex-1">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input className="h-8 text-[11px] bg-white/[0.03] border-white/[0.08] pl-7" placeholder="Search users..."
                  value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
              </div>
            </div>

            {/* Table */}
            <div className="mt-3 border border-border rounded-lg overflow-hidden">
              <div className="grid grid-cols-[1fr_70px_1fr_70px_70px_40px] gap-0 text-[10px] text-muted-foreground font-medium bg-muted/30 px-3 py-2 border-b border-border">
                <span>Username (@handle)</span>
                <span className="text-center">Allowed</span>
                <span>Voice</span>
                <span className="text-center">Speed</span>
                <span className="text-center">Pitch</span>
                <span></span>
              </div>
              {filteredSpecial.length === 0 ? (
                <div className="px-3 py-6 text-center text-[11px] text-muted-foreground">No Special Users defined</div>
              ) : (
                filteredSpecial.map((u) => (
                  <div key={u.username} className="grid grid-cols-[1fr_70px_1fr_70px_70px_40px] gap-0 items-center px-3 py-2 border-b border-border last:border-0 text-[11px]">
                    <span className="text-foreground font-medium">@{u.username}</span>
                    <div className="flex justify-center">
                      <Switch checked={u.allowed} onCheckedChange={(v) => updateSpecialUser(u.username, { allowed: v })} />
                    </div>
                    <select className={selectClass + " !min-w-0 !text-[10px]"} value={u.voice_id}
                      onChange={(e) => updateSpecialUser(u.username, { voice_id: e.target.value })}>
                      {TTS_VOICES.map(v => <option key={v.id} value={v.id} className="bg-[#0a0a0f]">{v.name}</option>)}
                    </select>
                    <input type="number" className={numberClass + " !w-14"} value={u.speed} min={1} max={100}
                      onChange={(e) => updateSpecialUser(u.username, { speed: Number(e.target.value) })} />
                    <input type="number" className={numberClass + " !w-14"} value={u.pitch} min={1} max={100}
                      onChange={(e) => updateSpecialUser(u.username, { pitch: Number(e.target.value) })} />
                    <button onClick={() => removeSpecialUser(u.username)}
                      className="p-1.5 rounded text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Voice Tester + TTS Logs */}
          <div className="space-y-4">
            <div className={sectionClass}>
              <h3 className={sectionTitle}>Voice Tester</h3>
              <div className="flex items-center gap-2">
                <Input className="h-8 text-[11px] bg-white/[0.03] border-white/[0.08] flex-1" placeholder="This is a test!"
                  value={testText} onChange={(e) => setTestText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleTest()} />
                <button onClick={handleTest} disabled={testing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[11px] font-medium hover:bg-primary/20 transition-colors disabled:opacity-50">
                  <Play size={12} /> {testing ? "Playing..." : "Play"}
                </button>
              </div>
            </div>

            <div className={sectionClass}>
              <h3 className={sectionTitle}>TTS Overlay URL</h3>
              {ttsWidget ? (
                <div className="space-y-2">
                  <p className="text-[11px] text-muted-foreground">Add this URL as a Browser Source in OBS:</p>
                  <div className="flex items-center gap-2">
                    <Input className="h-7 text-[10px] bg-white/[0.03] border-white/[0.08] flex-1 font-mono" readOnly
                      value={`https://tikup.xyz/overlay/tts/${ttsWidget.public_token}`} />
                    <button onClick={() => {
                      navigator.clipboard.writeText(`https://tikup.xyz/overlay/tts/${ttsWidget.public_token}`);
                      toast.success("URL copied!");
                    }} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                      <Copy size={12} />
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground">Creating TTS overlay...</p>
              )}
            </div>

            <div className={sectionClass}>
              <h3 className={sectionTitle}>TTS Logs</h3>
              <p className="text-[11px] text-muted-foreground">No Entries</p>
            </div>
          </div>
        </div>

        {/* Third Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Spam Protection */}
          <div className={sectionClass}>
            <h3 className={sectionTitle}>Spam Protection</h3>
            <div className={rowClass}>
              <span className={labelClass}>User Cooldown (seconds)</span>
              <input type="number" className={numberClass} value={local.cooldown_seconds} min={0}
                onChange={(e) => update({ cooldown_seconds: Number(e.target.value) })} />
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Max Queue Length</span>
              <input type="number" className={numberClass} value={local.max_queue_length} min={1} max={50}
                onChange={(e) => update({ max_queue_length: Number(e.target.value) })} />
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Max Comment Length</span>
              <input type="number" className={numberClass} value={local.max_length} min={10} max={1000}
                onChange={(e) => update({ max_length: Number(e.target.value) })} />
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Filter Letter Spam</span>
              <Switch checked={local.filter_letter_spam} onCheckedChange={(v) => update({ filter_letter_spam: v })} />
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Filter @mentions</span>
              <Switch checked={local.filter_mentions} onCheckedChange={(v) => update({ filter_mentions: v })} />
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Filter !commands</span>
              <Switch checked={local.filter_commands} onCheckedChange={(v) => update({ filter_commands: v })} />
            </div>
          </div>

          {/* Advanced */}
          <div className={sectionClass}>
            <h3 className={sectionTitle}>Advanced</h3>
            <div className={rowClass}>
              <span className={labelClass}>Message Template</span>
              <Input className="h-7 text-[11px] bg-white/[0.03] border-white/[0.08] max-w-[200px]"
                value={local.message_template}
                onChange={(e) => update({ message_template: e.target.value })} />
            </div>
            <div className="mt-2 p-3 rounded-lg bg-muted/20 border border-border">
              <p className="text-[10px] text-muted-foreground">
                <strong className="text-foreground">Placeholder Params:</strong> {"{nickname}"} {"{username}"} {"{comment}"}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                <strong className="text-foreground">Example:</strong> {"{nickname}"} says {"{comment}"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default TTSOverlayPage;
