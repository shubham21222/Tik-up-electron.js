import { motion } from "framer-motion";
import { HelpCircle, RefreshCw } from "lucide-react";

interface DashboardHeaderProps {
  isLive: boolean;
  streamDuration: string;
  connectionStatus: string;
  tiktokUsername: string;
  statsLoading: boolean;
  onRefresh: () => void;
  onShowGuide: () => void;
}

const DashboardHeader = ({
  isLive,
  streamDuration,
  connectionStatus,
  tiktokUsername,
  statsLoading,
  onRefresh,
  onShowGuide,
}: DashboardHeaderProps) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4"
  >
    <div>
      <div className="flex items-center gap-3 mb-1 flex-wrap">
        <h1 className="text-2xl font-heading font-bold text-foreground">Dashboard</h1>
        <button onClick={onShowGuide}
          className="p-1.5 rounded-full transition-colors hover:bg-muted/40 text-muted-foreground hover:text-foreground">
          <HelpCircle size={16} />
        </button>
        {isLive && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 border border-destructive/20">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              <div className="w-2 h-2 rounded-full bg-destructive absolute inset-0 animate-ping" />
            </div>
            <span className="text-[11px] font-bold text-destructive">LIVE</span>
            {streamDuration && <span className="text-[10px] text-destructive/70">{streamDuration}</span>}
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        {connectionStatus === "connected"
          ? <>Streaming as <span className="text-primary font-semibold">@{tiktokUsername}</span></>
          : "Connect your TikTok to see live stats"}
      </p>
    </div>
    <div className="flex items-center gap-2">
      <button onClick={onRefresh} disabled={statsLoading}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors border border-border/30">
        <RefreshCw size={12} className={statsLoading ? "animate-spin" : ""} />
        Refresh
      </button>
    </div>
  </motion.div>
);

export default DashboardHeader;
