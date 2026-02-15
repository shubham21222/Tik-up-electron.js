import { Wifi, WifiOff, Clock, Radio } from "lucide-react";
import { useSidebarState } from "@/hooks/use-sidebar-state";
import { useTikTokLive } from "@/hooks/use-tiktok-live";
import { cn } from "@/lib/utils";

const StatusBar = () => {
  const { collapsed } = useSidebarState();
  const { status, stats, connect, disconnect, error } = useTikTokLive();
  const connected = status === "connected";
  const connecting = status === "connecting";

  return (
    <div className={cn(
      "fixed bottom-0 right-0 h-10 bg-card border-t border-border flex items-center justify-between px-4 z-40 transition-all duration-300",
      collapsed ? "left-[60px]" : "left-[220px]"
    )}>
      {/* Left side */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {connected ? (
            <Wifi size={14} className="text-primary" />
          ) : (
            <WifiOff size={14} className="text-muted-foreground" />
          )}
          <span className="text-xs text-muted-foreground">
            {connected ? "Connected" : "Not Connected"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Radio size={12} />
          <span>{stats.viewerCount.toLocaleString()} Viewers</span>
        </div>
      </div>

      {/* Center - reactions */}
      <div className="flex items-center gap-3">
        {["🎁", "❤️", "⭐", "🔥"].map((emoji) => (
          <button key={emoji} className="text-base hover:scale-125 transition-transform opacity-50 hover:opacity-100">
            {emoji}
          </button>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => connected ? disconnect() : connect()}
          disabled={connecting}
          className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
            connected
              ? "bg-destructive/20 text-destructive hover:bg-destructive/30"
              : connecting
              ? "bg-muted text-muted-foreground cursor-wait"
              : "bg-primary/20 text-primary hover:bg-primary/30"
          }`}
        >
          {connecting ? "Connecting..." : connected ? "Disconnect" : "Connect to TikTok LIVE"}
        </button>

        {error && (
          <span className="text-xs text-destructive truncate max-w-[200px]">{error}</span>
        )}
      </div>
    </div>
  );
};

export default StatusBar;
