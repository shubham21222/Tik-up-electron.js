import { motion } from "framer-motion";
import { WifiOff, Loader2, AlertCircle, CheckCircle2, Settings } from "lucide-react";
import { Link } from "react-router-dom";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

import GlassCard from "@/components/ui/glass-card";

interface ConnectionBannerProps {
  connectionStatus: ConnectionStatus;
  tiktokUsername: string;
  inputUsername: string;
  connectionError: string;
  isLive: boolean;
  streamTitle?: string;
  onInputChange: (value: string) => void;
  onConnect: () => void;
  onDisconnect: () => void;
}

const ConnectionBanner = ({
  connectionStatus,
  tiktokUsername,
  inputUsername,
  connectionError,
  isLive,
  streamTitle,
  onInputChange,
  onConnect,
  onDisconnect,
}: ConnectionBannerProps) => {
  if (connectionStatus === "connected") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="mb-6"
      >
        <GlassCard className="px-5 py-3 flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-primary" />
            <span className="text-xs font-semibold text-primary">Connected</span>
            <span className="text-xs text-muted-foreground">@{tiktokUsername}</span>
          </div>
          <div className="md:ml-auto flex items-center gap-3 flex-wrap">
            {isLive && streamTitle && (
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">{streamTitle}</span>
            )}
            <Link to="/setup" className="text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
              <Settings size={11} /> Settings
            </Link>
            <button onClick={onDisconnect} className="text-[11px] text-destructive/70 hover:text-destructive transition-colors">
              Disconnect
            </button>
          </div>
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="mb-6"
    >
      <GlassCard className="p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "hsl(var(--primary) / 0.1)" }}>
              <WifiOff size={18} className="text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-heading font-bold text-foreground">Connect TikTok</h3>
              <p className="text-[11px] text-muted-foreground">Enter your username to power your stream</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold">@</span>
              <input
                type="text"
                value={inputUsername}
                onChange={(e) => onInputChange(e.target.value.replace(/^@/, ""))}
                placeholder="username"
                disabled={connectionStatus === "connecting"}
                className="w-full md:w-44 bg-muted/50 border border-border rounded-lg pl-8 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-1 focus:ring-primary/30 disabled:opacity-50 transition-all"
              />
            </div>
            <button
              onClick={onConnect}
              disabled={connectionStatus === "connecting"}
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 shrink-0"
            >
              {connectionStatus === "connecting" && <Loader2 size={14} className="animate-spin" />}
              Connect
            </button>
          </div>
        </div>
        {connectionError && (
          <div className="mt-3 flex items-center gap-2 text-xs text-destructive">
            <AlertCircle size={12} />
            {connectionError}
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
};

export default ConnectionBanner;
