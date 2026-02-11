import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, Share2, UserPlus, Eye, Gift, Users, Target, Coins, X
} from "lucide-react";

const goalTypes = [
  { id: "likes", icon: Heart, label: "Likes", color: "350 90% 55%" },
  { id: "shares", icon: Share2, label: "Shares", color: "200 100% 55%" },
  { id: "follows", icon: UserPlus, label: "Follows", color: "160 100% 45%" },
  { id: "viewers", icon: Eye, label: "Viewers", color: "45 100% 55%" },
  { id: "coins", icon: Coins, label: "Coins", color: "280 100% 65%" },
  { id: "gifts", icon: Gift, label: "Gifts", color: "350 90% 55%" },
  { id: "subscribers", icon: Users, label: "Subscribers", color: "160 100% 45%" },
  { id: "custom", icon: Target, label: "Custom", color: "200 100% 55%" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (type: string, title: string, target: number) => Promise<void>;
}

const GoalCreateDialog = ({ open, onClose, onCreate }: Props) => {
  const [selectedType, setSelectedType] = useState("likes");
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState(500);
  const [creating, setCreating] = useState(false);

  

  const handleCreate = async () => {
    if (!title.trim()) return;
    setCreating(true);
    await onCreate(selectedType, title, target);
    setCreating(false);
    setTitle("");
    setTarget(500);
    setSelectedType("likes");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl p-[1px]"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))" }}
          >
            <div className="rounded-2xl p-6" style={{ background: "rgba(12,16,22,0.95)", backdropFilter: "blur(20px)" }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-heading font-bold text-foreground">Create Goal Overlay</h2>
                <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
                  <X size={16} />
                </button>
              </div>

              {/* Goal Type Picker */}
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 block font-semibold">Goal Type</label>
              <div className="grid grid-cols-4 gap-2 mb-5">
                {goalTypes.map(type => {
                  const Icon = type.icon;
                  const isSelected = selectedType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => {
                        setSelectedType(type.id);
                        if (!title) setTitle(`${type.label} Goal`);
                      }}
                      className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border transition-all duration-200 ${
                        isSelected
                          ? "border-primary/40 bg-primary/5"
                          : "border-border/40 bg-muted/20 hover:border-border/60"
                      }`}
                    >
                      <Icon size={18} style={{ color: isSelected ? `hsl(${type.color})` : undefined }} className={isSelected ? "" : "text-muted-foreground"} />
                      <span className={`text-[11px] font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>{type.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Title */}
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block font-semibold">Goal Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Like Milestone"
                className="w-full bg-muted/30 border border-border/60 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/40 transition-colors mb-4"
              />

              {/* Target */}
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block font-semibold">Target Value</label>
              <input
                type="number"
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                min={1}
                className="w-full bg-muted/30 border border-border/60 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/40 transition-colors mb-6"
              />

              {/* Create Button */}
              <button
                onClick={handleCreate}
                disabled={creating || !title.trim() || target < 1}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_25px_hsl(160_100%_45%/0.25)] disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
              >
                {creating ? "Creating..." : "Create Goal"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GoalCreateDialog;
