import AppLayout from "@/components/AppLayout";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2, Plus, Trash2, Play, Search, Gift,
  Pause
} from "lucide-react";
import { useSoundAlerts } from "@/hooks/use-sound-alerts";
import { useGiftCatalog } from "@/hooks/use-gift-catalog";
import { useAuth } from "@/hooks/use-auth";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import SoundLibraryPicker from "@/components/sound-alerts/SoundLibraryPicker";

const TRIGGER_TYPES = [
  { value: "any_gift", label: "Any Gift", icon: "🎁" },
  { value: "gift", label: "Specific Gift", icon: "🎀" },
];



/* ── Main Page ── */
const SoundAlertsPage = () => {
  const { user } = useAuth();
  const { alerts, loading, createAlert, updateAlert, deleteAlert, toggleEnabled } = useSoundAlerts();
  const { gifts } = useGiftCatalog();
  const [showCreate, setShowCreate] = useState(false);
  const [createTrigger, setCreateTrigger] = useState("any_gift");
  const [createGiftId, setCreateGiftId] = useState("");
  const [giftSearch, setGiftSearch] = useState("");
  const [search, setSearch] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const filteredGifts = gifts.filter(g =>
    g.name.toLowerCase().includes(giftSearch.toLowerCase())
  ).slice(0, 20);

  const filteredAlerts = alerts.filter(a => {
    if (!search) return true;
    const gift = gifts.find(g => g.gift_id === a.gift_id);
    const giftName = gift?.name || a.trigger_type;
    return giftName.toLowerCase().includes(search.toLowerCase()) ||
      a.sound_name.toLowerCase().includes(search.toLowerCase());
  });

  const handleCreate = async () => {
    const giftId = createTrigger === "gift" ? createGiftId : null;
    await createAlert(createTrigger === "gift" ? "gift" : createTrigger, giftId);
    setShowCreate(false);
    setCreateGiftId("");
    setCreateTrigger("any_gift");
  };

  const handlePlay = (id: string, url: string) => {
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (!url) return;
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play().catch(() => {});
    setPlayingId(id);
    audio.onended = () => setPlayingId(null);
  };

  const getGiftInfo = (giftId: string | null) => {
    if (!giftId) return null;
    return gifts.find(g => g.gift_id === giftId);
  };

  const getTriggerLabel = (alert: typeof alerts[0]) => {
    if (alert.trigger_type === "gift" && alert.gift_id) {
      const gift = getGiftInfo(alert.gift_id);
      return gift ? `${gift.name} (${gift.coin_value} Coins)` : "Unknown Gift";
    }
    return TRIGGER_TYPES.find(t => t.value === alert.trigger_type)?.label || alert.trigger_type;
  };

  const getTriggerIcon = (alert: typeof alerts[0]) => {
    if (alert.trigger_type === "gift" && alert.gift_id) {
      const gift = getGiftInfo(alert.gift_id);
      if (gift?.image_url) return <img src={gift.image_url} alt={gift.name} className="w-6 h-6 rounded object-contain" />;
      return <span>🎁</span>;
    }
    return <span>🎁</span>;
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Volume2 size={48} className="text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">Sign in to use Sound Alerts</h2>
            <p className="text-sm text-muted-foreground">Map gifts to custom sounds on your stream.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse, hsl(160 100% 45% / 0.04), transparent 70%)" }}
      />

      <div className="max-w-5xl mx-auto relative z-10 pb-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(160 100% 45% / 0.1)" }}>
              <Volume2 size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">Sound Alerts</h1>
              <p className="text-sm text-muted-foreground">Map TikTok gifts to sounds that play on your stream.</p>
            </div>
          </div>
        </motion.div>


        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mb-4 flex items-center gap-3"
        >
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, hsl(160 100% 45%), hsl(160 80% 35%))",
              color: "white",
              boxShadow: "0 0 20px hsl(160 100% 45% / 0.2)",
            }}
          >
            <Plus size={14} /> Add Gift Sound
          </button>
          <span className="text-xs text-muted-foreground">
            {alerts.filter(a => a.is_enabled).length} of {alerts.length} enabled
          </span>
          <div className="flex-1" />
          <div className="relative w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-8 h-9 text-xs bg-white/[0.03] border-white/[0.08]"
            />
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl border border-white/[0.06] overflow-hidden"
          style={{ background: "rgba(11,15,20,0.65)" }}
        >
          {/* Table header */}
          <div className="grid grid-cols-[40px_40px_44px_1fr_1fr_100px] gap-3 px-4 py-3 border-b border-white/[0.06] text-[10px] uppercase tracking-wider text-muted-foreground/60 font-bold">
            <span></span>
            <span></span>
            <span>On</span>
            <span>Gift Trigger</span>
            <span>Sound</span>
            <span>Volume</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
          ) : filteredAlerts.length === 0 ? (
            <div className="p-12 text-center">
              <Gift size={32} className="text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No gift sound alerts yet. Add one to get started.</p>
            </div>
          ) : (
            <div>
              <AnimatePresence>
                {filteredAlerts.map((alert, idx) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: idx * 0.03 }}
                    className="grid grid-cols-[40px_40px_44px_1fr_1fr_100px] gap-3 items-center px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* Play */}
                    <button
                      onClick={() => handlePlay(alert.id, alert.sound_url)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                      style={{ background: "hsl(160 100% 45% / 0.06)" }}
                      disabled={!alert.sound_url}
                    >
                      {playingId === alert.id ? <Pause size={14} /> : <Play size={14} />}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>

                    {/* Enabled toggle */}
                    <Switch
                      checked={alert.is_enabled}
                      onCheckedChange={() => toggleEnabled(alert.id)}
                      className="scale-75"
                    />

                    {/* Trigger */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(255,255,255,0.04)" }}>
                        {getTriggerIcon(alert)}
                      </div>
                      <span className="text-sm text-foreground font-medium truncate">
                        {getTriggerLabel(alert)}
                      </span>
                    </div>

                    {/* Sound - Library Picker */}
                    <div className="min-w-0">
                      <SoundLibraryPicker
                        currentUrl={alert.sound_url}
                        currentName={alert.sound_name}
                        onSelect={(url, name) => updateAlert(alert.id, { sound_url: url, sound_name: name })}
                      />
                    </div>

                    {/* Volume */}
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[alert.volume]}
                        onValueChange={([v]) => updateAlert(alert.id, { volume: v })}
                        min={0}
                        max={100}
                        step={5}
                        className="flex-1"
                      />
                      <span className="text-[10px] text-muted-foreground w-6 text-right">{alert.volume}%</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md bg-background border-white/[0.08]">
          <DialogHeader>
            <DialogTitle className="font-heading">Add Gift Sound</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Trigger type */}
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-2 block">Trigger Type</label>
              <div className="grid grid-cols-2 gap-2">
                {TRIGGER_TYPES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => { setCreateTrigger(t.value); if (t.value !== "gift") setCreateGiftId(""); }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border"
                    style={{
                      background: createTrigger === t.value ? "hsl(160 100% 45% / 0.1)" : "transparent",
                      borderColor: createTrigger === t.value ? "hsl(160 100% 45% / 0.3)" : "rgba(255,255,255,0.06)",
                      color: createTrigger === t.value ? "hsl(160 100% 60%)" : undefined,
                    }}
                  >
                    <span>{t.icon}</span> {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gift picker */}
            {createTrigger === "gift" && (
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-2 block">Select Gift</label>
                <Input
                  value={giftSearch}
                  onChange={e => setGiftSearch(e.target.value)}
                  placeholder="Search gifts..."
                  className="mb-2 bg-white/[0.03] border-white/[0.08]"
                />
                <div className="max-h-40 overflow-y-auto space-y-1 rounded-lg border border-white/[0.06] p-1" style={{ background: "rgba(0,0,0,0.3)" }}>
                  {filteredGifts.map(g => (
                    <button
                      key={g.gift_id}
                      onClick={() => setCreateGiftId(g.gift_id)}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-left transition-colors"
                      style={{
                        background: createGiftId === g.gift_id ? "hsl(160 100% 45% / 0.1)" : "transparent",
                      }}
                    >
                      {g.image_url ? (
                        <img src={g.image_url} alt={g.name} className="w-5 h-5 rounded object-contain" />
                      ) : (
                        <Gift size={14} className="text-muted-foreground" />
                      )}
                      <span className="flex-1 truncate text-foreground">{g.name}</span>
                      <span className="text-[10px] text-muted-foreground">{g.coin_value} coins</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleCreate}
              disabled={createTrigger === "gift" && !createGiftId}
              className="w-full py-2.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, hsl(160 100% 45%), hsl(160 80% 35%))" }}
            >
              Add Gift Sound
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default SoundAlertsPage;
