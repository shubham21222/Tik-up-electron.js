import AppLayout from "@/components/AppLayout";
import ProGate from "@/components/ProGate";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import {
  Gamepad2, Plus, Trash2, X, Zap,
  Save, Search, Shield, Copy, HelpCircle,
  Car, Flame, CloudRain, DollarSign, Users, Clock, Bomb,
  Swords, Music, Eye
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useGiftCatalog } from "@/hooks/use-gift-catalog";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/clipboard";

/* ── Game action definitions ─────────────────────────────────── */
const GAME_ACTIONS = [
  { id: "spawn_vehicle", label: "Spawn Vehicle", icon: Car, emoji: "🚗", category: "Vehicles", description: "Spawn a vehicle near the player" },
  { id: "explosion", label: "Explosion", icon: Bomb, emoji: "💥", category: "Effects", description: "Create an explosion at/near the player" },
  { id: "weather_change", label: "Change Weather", icon: CloudRain, emoji: "🌧️", category: "Environment", description: "Change the in-game weather" },
  { id: "time_change", label: "Change Time", icon: Clock, emoji: "⏰", category: "Environment", description: "Set the in-game time of day" },
  { id: "give_money", label: "Give Money", icon: DollarSign, emoji: "💰", category: "Rewards", description: "Award in-game money to the player" },
  { id: "spawn_ped", label: "Spawn Ped/NPC", icon: Users, emoji: "🧟", category: "Entities", description: "Spawn a pedestrian or animal near player" },
  { id: "set_on_fire", label: "Set Player on Fire", icon: Flame, emoji: "🔥", category: "Effects", description: "Set the player character on fire" },
  { id: "wanted_level", label: "Set Wanted Level", icon: Shield, emoji: "🚨", category: "Gameplay", description: "Change the player's wanted level" },
  { id: "teleport", label: "Teleport Player", icon: Zap, emoji: "⚡", category: "Movement", description: "Teleport to a random location" },
  { id: "play_animation", label: "Play Animation", icon: Music, emoji: "💃", category: "Animations", description: "Force the player to perform an animation" },
  { id: "spawn_weapon", label: "Give Weapon", icon: Swords, emoji: "🔫", category: "Weapons", description: "Give a weapon to the player" },
  { id: "screen_effect", label: "Screen Effect", icon: Eye, emoji: "👁️", category: "Effects", description: "Apply a screen filter/effect" },
];

const VEHICLE_MODELS = [
  "adder", "zentorno", "t20", "entityxf", "turismor", "osiris",
  "elegy", "sultan", "jester", "massacro", "banshee", "infernus",
  "voltic", "comet2", "carbonrs", "bati", "sanchez", "blazer",
  "hydra", "buzzard", "rhino", "insurgent", "kuruma", "dump",
];

const WEATHER_OPTIONS = [
  "CLEAR", "EXTRASUNNY", "CLOUDS", "OVERCAST", "RAIN", "CLEARING",
  "THUNDER", "SMOG", "FOGGY", "XMAS", "SNOWLIGHT", "BLIZZARD",
];

const PED_MODELS = [
  "a_m_m_skater_01", "a_m_y_hipster_01", "s_m_y_clown_01",
  "a_c_cat_01", "a_c_dog", "a_c_shark_tiger", "a_c_chimp",
  "s_m_y_mime", "u_m_y_zombie_01", "s_m_y_fireman_01",
];

const ANIMATION_OPTIONS = [
  "Celebrate", "Dance", "Cower", "Surrender", "Push-ups", "Sit", "Wave",
];

const SCREEN_EFFECTS = [
  "DrugsMichaelAliensFight", "SwitchHUDMichaelOut", "DeathFailNeutralIn",
  "RaceTurbo", "FocusIn", "SuccessNeutral", "ExplosionJosh3",
];

const EVENT_TYPES = [
  { id: "gift", label: "Gift Received", emoji: "🎁" },
  { id: "follow", label: "New Follow", emoji: "👤" },
  { id: "like", label: "Like", emoji: "❤️" },
  { id: "share", label: "Share", emoji: "🔗" },
  { id: "chat_command", label: "Chat Command", emoji: "💬" },
];

/* ── Types ───────────────────────────────────────────────────── */
interface GameTrigger {
  id: string;
  name: string;
  event_type: string;
  event_config: Record<string, any>;
  game_action: string;
  action_params: Record<string, any>;
  cooldown: number;
  is_enabled: boolean;
  priority: number;
}

/* ── Component ──────────────────────────────────────────────── */
const GTATriggers = () => {
  const { user } = useAuth();
  const { gifts } = useGiftCatalog();
  const [triggers, setTriggers] = useState<GameTrigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");

  // Form state
  const [form, setForm] = useState<Partial<GameTrigger>>({
    name: "",
    event_type: "gift",
    event_config: {},
    game_action: "spawn_vehicle",
    action_params: {},
    cooldown: 10,
    is_enabled: true,
  });

  /* ── Fetch triggers ──────────────────────────────────────── */
  const fetchTriggers = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("game_triggers" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("priority", { ascending: false });
    if (data) setTriggers(data as any);
    setLoading(false);
  };

  useEffect(() => { fetchTriggers(); }, [user]);

  /* ── CRUD ─────────────────────────────────────────────────── */
  const saveTrigger = async () => {
    if (!user || !form.name?.trim()) {
      toast.error("Please enter a trigger name");
      return;
    }

    if (editingId) {
      await supabase.from("game_triggers" as any)
        .update({
          name: form.name,
          event_type: form.event_type,
          event_config: form.event_config,
          game_action: form.game_action,
          action_params: form.action_params,
          cooldown: form.cooldown,
          is_enabled: form.is_enabled,
        } as any)
        .eq("id", editingId);
      toast.success("Trigger updated!");
    } else {
      await supabase.from("game_triggers" as any)
        .insert({
          user_id: user.id,
          name: form.name,
          event_type: form.event_type,
          event_config: form.event_config,
          game_action: form.game_action,
          action_params: form.action_params,
          cooldown: form.cooldown,
          is_enabled: form.is_enabled ?? true,
        } as any);
      toast.success("Trigger created! 🎮");
    }

    setShowCreate(false);
    setEditingId(null);
    resetForm();
    fetchTriggers();
  };

  const deleteTrigger = async (id: string) => {
    await supabase.from("game_triggers" as any).delete().eq("id", id);
    toast.success("Trigger deleted");
    fetchTriggers();
  };

  const toggleTrigger = async (id: string, enabled: boolean) => {
    await supabase.from("game_triggers" as any).update({ is_enabled: enabled } as any).eq("id", id);
    setTriggers(prev => prev.map(t => t.id === id ? { ...t, is_enabled: enabled } : t));
  };

  const startEdit = (trigger: GameTrigger) => {
    setForm(trigger);
    setEditingId(trigger.id);
    setShowCreate(true);
  };

  const resetForm = () => {
    setForm({
      name: "",
      event_type: "gift",
      event_config: {},
      game_action: "spawn_vehicle",
      action_params: {},
      cooldown: 10,
      is_enabled: true,
    });
  };

  

  const filteredTriggers = useMemo(() => {
    if (!search) return triggers;
    const s = search.toLowerCase();
    return triggers.filter(t =>
      t.name.toLowerCase().includes(s) ||
      t.game_action.toLowerCase().includes(s)
    );
  }, [triggers, search]);

  /* ── Action params UI ─────────────────────────────────────── */
  const renderActionParams = () => {
    switch (form.game_action) {
      case "spawn_vehicle":
        return (
          <div>
            <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Vehicle Model</label>
            <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
              {VEHICLE_MODELS.map(m => (
                <button key={m} onClick={() => setForm(f => ({ ...f, action_params: { ...f.action_params, model: m } }))}
                  className="px-2 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all"
                  style={{
                    background: form.action_params?.model === m ? "hsl(160 100% 45% / 0.15)" : "hsl(0 0% 100% / 0.03)",
                    border: `1px solid ${form.action_params?.model === m ? "hsl(160 100% 45% / 0.3)" : "hsl(0 0% 100% / 0.06)"}`,
                    color: form.action_params?.model === m ? "hsl(160 100% 55%)" : "hsl(0 0% 100% / 0.5)",
                  }}>
                  {m}
                </button>
              ))}
            </div>
          </div>
        );
      case "weather_change":
        return (
          <div>
            <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Weather Type</label>
            <div className="grid grid-cols-3 gap-1.5">
              {WEATHER_OPTIONS.map(w => (
                <button key={w} onClick={() => setForm(f => ({ ...f, action_params: { ...f.action_params, weather: w } }))}
                  className="px-2 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all"
                  style={{
                    background: form.action_params?.weather === w ? "hsl(200 100% 50% / 0.15)" : "hsl(0 0% 100% / 0.03)",
                    border: `1px solid ${form.action_params?.weather === w ? "hsl(200 100% 50% / 0.3)" : "hsl(0 0% 100% / 0.06)"}`,
                    color: form.action_params?.weather === w ? "hsl(200 100% 60%)" : "hsl(0 0% 100% / 0.5)",
                  }}>
                  {w}
                </button>
              ))}
            </div>
          </div>
        );
      case "give_money":
        return (
          <div>
            <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Amount ($)</label>
            <input type="number" value={form.action_params?.amount || 1000}
              onChange={e => setForm(f => ({ ...f, action_params: { ...f.action_params, amount: Number(e.target.value) } }))}
              className="w-full px-3 py-2 rounded-lg text-sm font-mono bg-black/30 border text-foreground outline-none focus:ring-1"
              style={{ borderColor: "hsl(0 0% 100% / 0.08)", "--tw-ring-color": "hsl(160 100% 45% / 0.4)" } as any}
            />
          </div>
        );
      case "wanted_level":
        return (
          <div>
            <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Wanted Stars (0–5)</label>
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setForm(f => ({ ...f, action_params: { ...f.action_params, level: n } }))}
                  className="w-9 h-9 rounded-lg text-sm font-bold transition-all"
                  style={{
                    background: form.action_params?.level === n ? "hsl(40 100% 50% / 0.15)" : "hsl(0 0% 100% / 0.03)",
                    border: `1px solid ${form.action_params?.level === n ? "hsl(40 100% 50% / 0.3)" : "hsl(0 0% 100% / 0.06)"}`,
                    color: form.action_params?.level === n ? "hsl(40 100% 60%)" : "hsl(0 0% 100% / 0.5)",
                  }}>
                  {n}⭐
                </button>
              ))}
            </div>
          </div>
        );
      case "explosion":
        return (
          <div>
            <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Radius (meters)</label>
            <input type="number" value={form.action_params?.radius || 5}
              onChange={e => setForm(f => ({ ...f, action_params: { ...f.action_params, radius: Number(e.target.value) } }))}
              className="w-full px-3 py-2 rounded-lg text-sm font-mono bg-black/30 border text-foreground outline-none"
              style={{ borderColor: "hsl(0 0% 100% / 0.08)" }}
            />
          </div>
        );
      case "spawn_ped":
        return (
          <div>
            <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Ped Model</label>
            <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
              {PED_MODELS.map(m => (
                <button key={m} onClick={() => setForm(f => ({ ...f, action_params: { ...f.action_params, model: m } }))}
                  className="px-2 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all text-left"
                  style={{
                    background: form.action_params?.model === m ? "hsl(280 100% 55% / 0.15)" : "hsl(0 0% 100% / 0.03)",
                    border: `1px solid ${form.action_params?.model === m ? "hsl(280 100% 55% / 0.3)" : "hsl(0 0% 100% / 0.06)"}`,
                    color: form.action_params?.model === m ? "hsl(280 100% 65%)" : "hsl(0 0% 100% / 0.5)",
                  }}>
                  {m}
                </button>
              ))}
            </div>
          </div>
        );
      case "play_animation":
        return (
          <div>
            <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Animation</label>
            <div className="flex flex-wrap gap-1.5">
              {ANIMATION_OPTIONS.map(a => (
                <button key={a} onClick={() => setForm(f => ({ ...f, action_params: { ...f.action_params, animation: a } }))}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                  style={{
                    background: form.action_params?.animation === a ? "hsl(340 100% 55% / 0.15)" : "hsl(0 0% 100% / 0.03)",
                    border: `1px solid ${form.action_params?.animation === a ? "hsl(340 100% 55% / 0.3)" : "hsl(0 0% 100% / 0.06)"}`,
                    color: form.action_params?.animation === a ? "hsl(340 100% 65%)" : "hsl(0 0% 100% / 0.5)",
                  }}>
                  {a}
                </button>
              ))}
            </div>
          </div>
        );
      case "screen_effect":
        return (
          <div>
            <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Effect</label>
            <div className="grid grid-cols-2 gap-1.5">
              {SCREEN_EFFECTS.map(e => (
                <button key={e} onClick={() => setForm(f => ({ ...f, action_params: { ...f.action_params, effect: e } }))}
                  className="px-2 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all text-left"
                  style={{
                    background: form.action_params?.effect === e ? "hsl(160 100% 45% / 0.15)" : "hsl(0 0% 100% / 0.03)",
                    border: `1px solid ${form.action_params?.effect === e ? "hsl(160 100% 45% / 0.3)" : "hsl(0 0% 100% / 0.06)"}`,
                    color: form.action_params?.effect === e ? "hsl(160 100% 55%)" : "hsl(0 0% 100% / 0.5)",
                  }}>
                  {e}
                </button>
              ))}
            </div>
          </div>
        );
      case "time_change":
        return (
          <div>
            <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Hour (0–23)</label>
            <input type="number" min={0} max={23} value={form.action_params?.hour ?? 12}
              onChange={e => setForm(f => ({ ...f, action_params: { ...f.action_params, hour: Number(e.target.value) } }))}
              className="w-full px-3 py-2 rounded-lg text-sm font-mono bg-black/30 border text-foreground outline-none"
              style={{ borderColor: "hsl(0 0% 100% / 0.08)" }}
            />
          </div>
        );
      default:
        return null;
    }
  };

  /* ── FiveM code snippet ───────────────────────────────────── */
  const luaSnippet = `-- TikUp GTA Plugin for FiveM
-- Place in your server resources folder

local wsUrl = "wss://your-server.com/gta-ws" -- Replace with your relay URL

RegisterNetEvent("tikup:spawn_vehicle")
AddEventHandler("tikup:spawn_vehicle", function(model)
  local ped = PlayerPedId()
  local coords = GetEntityCoords(ped)
  local hash = GetHashKey(model)
  RequestModel(hash)
  while not HasModelLoaded(hash) do Wait(1) end
  local veh = CreateVehicle(hash, coords.x + 3.0, coords.y, coords.z, GetEntityHeading(ped), true, false)
  SetVehicleNumberPlateText(veh, "TIKUP")
  SetPedIntoVehicle(ped, veh, -1)
end)

RegisterNetEvent("tikup:explosion")
AddEventHandler("tikup:explosion", function(radius)
  local ped = PlayerPedId()
  local coords = GetEntityCoords(ped)
  local rx = math.random(-radius, radius)
  local ry = math.random(-radius, radius)
  AddExplosion(coords.x + rx, coords.y + ry, coords.z, 2, 1.0, true, false, 1.0)
end)

RegisterNetEvent("tikup:weather_change")
AddEventHandler("tikup:weather_change", function(weather)
  SetWeatherTypeNow(weather)
end)

RegisterNetEvent("tikup:give_money")
AddEventHandler("tikup:give_money", function(amount)
  -- Requires your economy system
  TriggerEvent("esx:addMoney", amount)
end)

RegisterNetEvent("tikup:wanted_level")
AddEventHandler("tikup:wanted_level", function(level)
  SetPlayerWantedLevel(PlayerId(), level, false)
  SetPlayerWantedLevelNow(PlayerId(), false)
end)

print("[TikUp] GTA Plugin loaded! Waiting for events...")`;

  return (
    <AppLayout>
      <ProGate feature="GTA Interactive">
        <div className="max-w-3xl mx-auto relative z-10 pb-12">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-heading font-bold text-foreground">GTA Interactive</h1>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md"
                    style={{ background: "hsl(160 100% 45% / 0.12)", color: "hsl(160 100% 55%)", border: "1px solid hsl(160 100% 45% / 0.2)" }}>
                    FiveM
                  </span>
                </div>
                <p className="text-muted-foreground text-sm mt-1">
                  Bind TikTok LIVE events to real GTA V game actions
                </p>
              </div>
              <button onClick={() => { resetForm(); setEditingId(null); setShowCreate(true); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, hsl(160 100% 45%), hsl(160 80% 40%))", color: "white", boxShadow: "0 4px 20px hsl(160 100% 45% / 0.3)" }}>
                <Plus size={16} /> New Trigger
              </button>
            </div>
          </motion.div>

          {/* How it works */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="rounded-2xl border p-5 mb-6"
            style={{ background: "hsl(0 0% 100% / 0.02)", borderColor: "hsl(0 0% 100% / 0.06)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Gamepad2 size={16} style={{ color: "hsl(160 100% 55%)" }} />
              <h3 className="text-sm font-bold text-foreground">How It Works</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {[
                { step: "1", icon: "🎁", title: "Gift Arrives", desc: "Viewer sends a TikTok gift" },
                { step: "2", icon: "⚡", title: "Trigger Matches", desc: "System finds matching rule" },
                { step: "3", icon: "📡", title: "Action Sent", desc: "Command pushed to FiveM" },
                { step: "4", icon: "🚗", title: "GTA Reacts", desc: "In-game action executes" },
              ].map(s => (
                <div key={s.step} className="text-center">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <p className="text-xs font-bold text-foreground">{s.title}</p>
                  <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Search */}
          {triggers.length > 0 && (
            <div className="relative mb-4">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Search triggers..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-black/20 border text-foreground placeholder:text-muted-foreground/40 outline-none"
                style={{ borderColor: "hsl(0 0% 100% / 0.06)" }}
              />
            </div>
          )}

          {/* Triggers list */}
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground text-sm">Loading...</div>
            ) : filteredTriggers.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-16 rounded-2xl border"
                style={{ background: "hsl(0 0% 100% / 0.01)", borderColor: "hsl(0 0% 100% / 0.05)" }}>
                <Gamepad2 size={40} className="mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-sm font-bold text-foreground mb-1">No triggers yet</p>
                <p className="text-xs text-muted-foreground">Create your first trigger to link TikTok events to GTA actions</p>
              </motion.div>
            ) : filteredTriggers.map((trigger, i) => {
              const action = GAME_ACTIONS.find(a => a.id === trigger.game_action);
              const event = EVENT_TYPES.find(e => e.id === trigger.event_type);
              return (
                <motion.div
                  key={trigger.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="rounded-xl border p-4 flex items-center gap-4 group hover:border-primary/20 transition-all"
                  style={{ background: "hsl(0 0% 100% / 0.02)", borderColor: "hsl(0 0% 100% / 0.06)" }}
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ background: "hsl(160 100% 45% / 0.1)", border: "1px solid hsl(160 100% 45% / 0.15)" }}>
                    {action?.emoji || "🎮"}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-foreground truncate">{trigger.name}</p>
                      {!trigger.is_enabled && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">OFF</span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {event?.emoji} {event?.label || trigger.event_type}
                      {trigger.event_config?.gift_name && ` → ${trigger.event_config.gift_name}`}
                      {" → "}
                      {action?.label || trigger.game_action}
                      {trigger.action_params?.model && ` (${trigger.action_params.model})`}
                    </p>
                  </div>

                  {/* Cooldown badge */}
                  <span className="text-[10px] text-muted-foreground/60 font-mono shrink-0">{trigger.cooldown}s cd</span>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => toggleTrigger(trigger.id, !trigger.is_enabled)}
                      className="p-2 rounded-lg hover:bg-muted/30 transition-colors"
                      title={trigger.is_enabled ? "Disable" : "Enable"}>
                      <Zap size={14} style={{ color: trigger.is_enabled ? "hsl(160 100% 55%)" : "hsl(0 0% 50%)" }} />
                    </button>
                    <button onClick={() => startEdit(trigger)}
                      className="p-2 rounded-lg hover:bg-muted/30 text-muted-foreground hover:text-foreground transition-colors">
                      <HelpCircle size={14} />
                    </button>
                    <button onClick={() => deleteTrigger(trigger.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* FiveM Plugin Code Section */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="mt-8 rounded-2xl border overflow-hidden"
            style={{ borderColor: "hsl(0 0% 100% / 0.06)" }}>
            <div className="flex items-center justify-between px-5 py-3 border-b"
              style={{ background: "hsl(0 0% 100% / 0.03)", borderColor: "hsl(0 0% 100% / 0.06)" }}>
              <div className="flex items-center gap-2">
                <span className="text-lg">📜</span>
                <h3 className="text-sm font-bold text-foreground">FiveM Lua Plugin</h3>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground">client.lua</span>
              </div>
              <button onClick={() => copyToClipboard(luaSnippet, "Lua code copied!")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:bg-white/[0.06]"
                style={{ color: "hsl(160 100% 55%)" }}>
                <Copy size={12} /> Copy Code
              </button>
            </div>
            <pre className="p-4 text-[11px] font-mono text-muted-foreground/80 overflow-x-auto max-h-64" style={{ scrollbarWidth: "thin", background: "hsl(0 0% 0% / 0.3)" }}>
              {luaSnippet}
            </pre>
          </motion.div>

          {/* Create/Edit Modal */}
          <AnimatePresence>
            {showCreate && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={() => setShowCreate(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="relative rounded-2xl p-6 max-w-lg w-full border overflow-y-auto max-h-[85vh]"
                  style={{
                    background: "hsl(var(--card))",
                    borderColor: "hsl(0 0% 100% / 0.08)",
                    boxShadow: "0 25px 80px hsl(0 0% 0% / 0.6)",
                    scrollbarWidth: "thin",
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-heading font-bold text-foreground">
                      {editingId ? "Edit Trigger" : "New GTA Trigger"}
                    </h3>
                    <button onClick={() => setShowCreate(false)} className="p-2 rounded-lg hover:bg-muted/30 text-muted-foreground">
                      <X size={16} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Trigger Name</label>
                      <input type="text" value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="e.g. Rose → Spawn Car"
                        className="w-full px-3 py-2.5 rounded-xl text-sm bg-black/30 border text-foreground placeholder:text-muted-foreground/40 outline-none"
                        style={{ borderColor: "hsl(0 0% 100% / 0.08)" }}
                      />
                    </div>

                    {/* Event type */}
                    <div>
                      <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">TikTok Event</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {EVENT_TYPES.map(et => (
                          <button key={et.id} onClick={() => setForm(f => ({ ...f, event_type: et.id, event_config: {} }))}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold transition-all"
                            style={{
                              background: form.event_type === et.id ? "hsl(280 100% 55% / 0.12)" : "hsl(0 0% 100% / 0.03)",
                              border: `1px solid ${form.event_type === et.id ? "hsl(280 100% 55% / 0.25)" : "hsl(0 0% 100% / 0.06)"}`,
                              color: form.event_type === et.id ? "hsl(280 100% 70%)" : "hsl(0 0% 100% / 0.5)",
                            }}>
                            {et.emoji} {et.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Gift selector (if gift event) */}
                    {form.event_type === "gift" && (
                      <div>
                        <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Gift (optional — leave blank for any)</label>
                        <select
                          value={form.event_config?.gift_name || ""}
                          onChange={e => setForm(f => ({ ...f, event_config: { ...f.event_config, gift_name: e.target.value || undefined } }))}
                          className="w-full px-3 py-2.5 rounded-xl text-sm bg-black/30 border text-foreground outline-none"
                          style={{ borderColor: "hsl(0 0% 100% / 0.08)" }}
                        >
                          <option value="">Any Gift</option>
                          {gifts.map(g => (
                            <option key={g.gift_id} value={g.name}>{g.name} ({g.coin_value} coins)</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Chat command (if chat event) */}
                    {form.event_type === "chat_command" && (
                      <div>
                        <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Command Keyword</label>
                        <input type="text" value={form.event_config?.command || ""} placeholder="!car"
                          onChange={e => setForm(f => ({ ...f, event_config: { ...f.event_config, command: e.target.value } }))}
                          className="w-full px-3 py-2.5 rounded-xl text-sm bg-black/30 border text-foreground placeholder:text-muted-foreground/40 outline-none"
                          style={{ borderColor: "hsl(0 0% 100% / 0.08)" }}
                        />
                      </div>
                    )}

                    {/* Game action */}
                    <div>
                      <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">GTA Action</label>
                      <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
                        {GAME_ACTIONS.map(a => (
                          <button key={a.id} onClick={() => setForm(f => ({ ...f, game_action: a.id, action_params: {} }))}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all"
                            style={{
                              background: form.game_action === a.id ? "hsl(160 100% 45% / 0.12)" : "hsl(0 0% 100% / 0.02)",
                              border: `1px solid ${form.game_action === a.id ? "hsl(160 100% 45% / 0.25)" : "hsl(0 0% 100% / 0.05)"}`,
                            }}>
                            <span className="text-base">{a.emoji}</span>
                            <div>
                              <p className="text-[11px] font-bold" style={{ color: form.game_action === a.id ? "hsl(160 100% 55%)" : "hsl(0 0% 100% / 0.7)" }}>
                                {a.label}
                              </p>
                              <p className="text-[9px] text-muted-foreground/50">{a.category}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Action parameters */}
                    {renderActionParams()}

                    {/* Cooldown */}
                    <div>
                      <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Cooldown (seconds)</label>
                      <input type="number" min={0} value={form.cooldown || 10}
                        onChange={e => setForm(f => ({ ...f, cooldown: Number(e.target.value) }))}
                        className="w-full px-3 py-2 rounded-xl text-sm font-mono bg-black/30 border text-foreground outline-none"
                        style={{ borderColor: "hsl(0 0% 100% / 0.08)" }}
                      />
                    </div>

                    {/* Save */}
                    <button onClick={saveTrigger}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02]"
                      style={{ background: "linear-gradient(135deg, hsl(160 100% 45%), hsl(160 80% 40%))", color: "white", boxShadow: "0 4px 20px hsl(160 100% 45% / 0.3)" }}>
                      <Save size={16} /> {editingId ? "Update Trigger" : "Create Trigger"}
                    </button>
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

export default GTATriggers;
