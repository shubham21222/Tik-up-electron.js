import { useEffect, useState } from "react";
import { Minus, Square, X, Maximize2 } from "lucide-react";
import { isElectron, isWindows } from "@/lib/electron";

export function ElectronTitleBar() {
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    if (!isElectron() || !isWindows()) return;
    window.electronAPI?.window?.isMaximized().then(setMaximized);
    window.electronAPI?.window?.onMaximizeChange((val) => setMaximized(val));
  }, []);

  if (!isElectron() || !isWindows()) return null;

  return (
    <div
      className="flex items-center justify-between h-8 bg-[#0a0a0f] border-b border-white/5 select-none flex-shrink-0"
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    >
      <div className="flex items-center gap-2 px-3">
        <img src="/favicon.ico" alt="" className="w-3.5 h-3.5" />
        <span className="text-xs text-white/40 font-medium tracking-wide">TikUp Pro</span>
      </div>

      <div
        className="flex items-center h-full"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        <button
          onClick={() => window.electronAPI?.window?.minimize()}
          className="flex items-center justify-center w-11 h-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Minimize"
        >
          <Minus size={12} />
        </button>
        <button
          onClick={() => window.electronAPI?.window?.maximize()}
          className="flex items-center justify-center w-11 h-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          aria-label={maximized ? "Restore" : "Maximize"}
        >
          {maximized ? <Square size={10} /> : <Maximize2 size={11} />}
        </button>
        <button
          onClick={() => window.electronAPI?.window?.close()}
          className="flex items-center justify-center w-11 h-full text-white/50 hover:text-white hover:bg-red-500 transition-colors"
          aria-label="Close"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}
