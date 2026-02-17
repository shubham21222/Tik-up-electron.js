import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy, ExternalLink, RotateCcw, Trash2, Play, ChevronDown, Info,
  Eye, EyeOff, Settings, Sparkles, Lock
} from "lucide-react";
import { toast } from "sonner";
import ProBadge from "./ProBadge";
import type { OverlayWidget } from "@/hooks/use-overlay-widgets";
import { getOverlayBaseUrl } from "@/lib/overlay-url";
import { copyToClipboard } from "@/lib/clipboard";
import { useSubscription } from "@/hooks/use-subscription";

interface OverlaySettingsShellProps {
  widget: OverlayWidget;
  onDelete: () => void;
  onReset: () => void;
  onToggleActive: () => void;
  onTest: () => void;
  previewSlot: ReactNode;
  settingsSlot: ReactNode;
  advancedSlot?: ReactNode;
}

const OverlaySettingsShell = ({
  widget, onDelete, onReset, onToggleActive, onTest,
  previewSlot, settingsSlot, advancedSlot,
}: OverlaySettingsShellProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showOBS, setShowOBS] = useState(false);
  const { isPro } = useSubscription();
  const overlayUrl = `${getOverlayBaseUrl()}/overlay/${widget.widget_type.replace(/_/g, "-")}/${widget.public_token}`;

  const copyUrl = () => {
    if (!isPro) {
      toast.error("Upgrade to Pro to copy overlay URLs");
      return;
    }
    copyToClipboard(overlayUrl, "Overlay URL copied!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="overlay-shell-wrapper rounded-2xl p-[1px] transition-all duration-300"
    >
      <div className="overlay-shell-inner rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 overlay-shell-border-b">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-heading font-bold text-foreground">{widget.name}</h3>
            <ProBadge />
            <button
              onClick={onToggleActive}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors"
              style={{
                background: widget.is_active ? "hsl(160 100% 45% / 0.1)" : "hsl(0 0% 50% / 0.1)",
                color: widget.is_active ? "hsl(160 100% 50%)" : "hsl(0 0% 50%)",
              }}
            >
              {widget.is_active ? <Eye size={10} /> : <EyeOff size={10} />}
              {widget.is_active ? "Live" : "Off"}
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={onTest} className="p-2 rounded-lg text-muted-foreground hover:text-secondary hover:bg-secondary/5 transition-colors" title="Test">
              <Play size={14} />
            </button>
            <button onClick={onReset} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors" title="Reset">
              <RotateCcw size={14} />
            </button>
            <button onClick={onDelete} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors" title="Delete">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Live Preview – canvas stays dark for contrast */}
        <div className="overlay-shell-preview relative h-[220px] overflow-hidden overlay-shell-border-b">
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "24px 24px"
          }} />
          {previewSlot}
          <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10">
            <span className="text-[9px] text-white/40 font-mono">LIVE PREVIEW</span>
          </div>
        </div>

        {/* URL Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 px-4 md:px-5 py-3 overlay-shell-border-b overlay-shell-url-bar">
          <div className="flex-1 text-[11px] text-muted-foreground font-mono truncate min-w-0">
            {isPro ? overlayUrl : (
              <span className="flex items-center gap-1.5 select-none">
                <Lock size={10} className="shrink-0 text-secondary" />
                <span className="blur-[5px] pointer-events-none">https://tikup.xyz/overlay/••••••/••••-••••-••••</span>
              </span>
            )}
          </div>
          <button onClick={copyUrl} className="overlay-shell-copy-btn flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
            style={{ cursor: isPro ? "pointer" : "not-allowed" }}>
            {isPro ? <Copy size={11} /> : <Lock size={11} />} {isPro ? "Copy URL" : "Pro Only"}
          </button>
          {isPro && (
            <button onClick={() => window.open(overlayUrl, "_blank")} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
              <ExternalLink size={13} />
            </button>
          )}
        </div>

        {/* OBS Instructions */}
        <button onClick={() => setShowOBS(!showOBS)} className="w-full flex items-center justify-between px-5 py-2.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors overlay-shell-border-b">
          <span className="flex items-center gap-1.5"><Info size={11} /> OBS Browser Source Setup</span>
          <ChevronDown size={12} className={`transition-transform ${showOBS ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {showOBS && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden overlay-shell-border-b">
              <div className="px-5 py-3 space-y-2">
                <p className="text-[11px] text-muted-foreground">1. Open OBS Studio → Sources → <strong className="text-foreground">+</strong> → Browser</p>
                <p className="text-[11px] text-muted-foreground">2. Paste the URL above</p>
                <p className="text-[11px] text-muted-foreground">3. Set width: <strong className="text-foreground">1920</strong>, height: <strong className="text-foreground">1080</strong></p>
                <p className="text-[11px] text-muted-foreground">4. ✅ Delete cache on scene change</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings */}
        <div className="px-5 py-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Settings size={14} className="text-muted-foreground" />
            <span className="text-xs font-heading font-bold text-foreground uppercase tracking-wider">Customization</span>
          </div>
          {settingsSlot}
        </div>

        {/* Advanced */}
        {advancedSlot && (
          <>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between px-5 py-3 text-[11px] font-medium transition-colors overlay-shell-border-t text-secondary"
            >
              <span className="flex items-center gap-1.5"><Sparkles size={11} /> Advanced Settings (PRO)</span>
              <ChevronDown size={12} className={`transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {showAdvanced && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="px-5 py-5 space-y-4 overlay-shell-border-t">
                    {advancedSlot}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default OverlaySettingsShell;
