import { Wifi, WifiOff, Clock, Radio } from "lucide-react";
import { useState, useEffect } from "react";

const StatusBar = () => {
  const [time, setTime] = useState("00:00");
  const [connected, setConnected] = useState(false);

  return (
    <div className="fixed bottom-0 left-[68px] right-0 h-10 bg-card border-t border-border flex items-center justify-between px-4 z-40">
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
          <span>0 Viewers</span>
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
          onClick={() => setConnected(!connected)}
          className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
            connected
              ? "bg-destructive/20 text-destructive hover:bg-destructive/30"
              : "bg-primary/20 text-primary hover:bg-primary/30"
          }`}
        >
          {connected ? "Disconnect" : "Connect to TikTok LIVE"}
        </button>

        <div className="flex items-center gap-4 text-xs text-muted-foreground border-l border-border pl-4">
          <div className="flex items-center gap-1.5">
            <Clock size={12} />
            <span className="font-mono">{time}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
