import { useState, useRef, useEffect } from "react";
import { useStreamProfiles } from "@/hooks/use-stream-profiles";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Pencil } from "lucide-react";

const ProfileSwitcher = () => {
  const { profiles, activeProfile, switchProfile, renameProfile, loading } = useStreamProfiles();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setEditingId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (editingId && inputRef.current) inputRef.current.focus();
  }, [editingId]);

  if (loading || !activeProfile) return null;

  const handleRename = async (id: string) => {
    const trimmed = editName.trim();
    if (trimmed && trimmed.length <= 30) {
      await renameProfile(id, trimmed);
    }
    setEditingId(null);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-muted/60 border border-border/50"
      >
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: "hsl(160 100% 45%)" }}
        />
        <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">
          {activeProfile.name}
        </span>
        <ChevronDown
          size={12}
          className="text-muted-foreground transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-2 w-64 rounded-xl border border-border overflow-hidden z-50"
            style={{
              background: "hsl(var(--card))",
              boxShadow: "0 16px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)",
            }}
          >
            <div className="px-4 py-3 border-b border-border">
              <span className="text-sm font-bold text-foreground">Stream Profiles</span>
              <p className="text-[10px] text-muted-foreground">Each profile has its own overlay settings</p>
            </div>

            <div className="py-1">
              {profiles.map((p, i) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-2 px-4 py-2.5 transition-colors hover:bg-muted/30 ${
                    p.is_active ? "bg-primary/[0.05]" : ""
                  }`}
                >
                  {editingId === p.id ? (
                    <input
                      ref={inputRef}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRename(p.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      onBlur={() => handleRename(p.id)}
                      maxLength={30}
                      className="flex-1 bg-muted/50 border border-border rounded px-2 py-1 text-xs text-foreground outline-none focus:border-primary"
                    />
                  ) : (
                    <>
                      <button
                        className="flex-1 text-left flex items-center gap-2"
                        onClick={() => {
                          switchProfile(p.id);
                          setOpen(false);
                        }}
                      >
                        <div
                          className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold"
                          style={{
                            background: p.is_active
                              ? "hsl(var(--primary) / 0.15)"
                              : "hsl(var(--muted))",
                            color: p.is_active
                              ? "hsl(var(--primary))"
                              : "hsl(var(--muted-foreground))",
                          }}
                        >
                          {i + 1}
                        </div>
                        <span className="text-sm text-foreground truncate">{p.name}</span>
                        {p.is_active && <Check size={14} className="text-primary ml-auto" />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(p.id);
                          setEditName(p.name);
                        }}
                        className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Pencil size={12} />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="px-4 py-2 border-t border-border">
              <p className="text-[10px] text-muted-foreground/50 text-center">
                Switch profiles to load different overlay configurations
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileSwitcher;
