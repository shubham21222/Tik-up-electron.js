import { useEffect, useState } from "react";
import { useElectronStore } from "@/hooks/use-electron-store";
import { isElectron } from "@/lib/electron";

interface AudioDevice {
  deviceId: string;
  label: string;
}

const KNOWN_VIRTUAL_NAMES = [
  "CABLE Input",
  "VB-Audio",
  "VoiceMeeter",
  "BlackHole",
  "Soundflower",
];

export const AudioDeviceSelector = () => {
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [selectedId, setSelectedId] = useElectronStore<string | null>("ttsAudioDevice", null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isElectron()) return;
    if (!navigator.mediaDevices?.enumerateDevices) return;

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const all = await navigator.mediaDevices.enumerateDevices();
        if (cancelled) return;
        const outs = all
          .filter((d) => d.kind === "audiooutput")
          .map((d) => ({
            deviceId: d.deviceId,
            label: d.label || "Unknown device",
          }));
        setDevices(outs);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!isElectron()) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-foreground">
          Output device (desktop)
        </p>
        <span className="text-[10px] text-muted-foreground">
          Route TTS into virtual cable
        </span>
      </div>
      {loading ? (
        <p className="text-[11px] text-muted-foreground">Detecting devices…</p>
      ) : devices.length === 0 ? (
        <p className="text-[11px] text-muted-foreground">
          No audio output devices found. Make sure your virtual cable is installed.
        </p>
      ) : (
        <select
          className="w-full text-[11px] px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-foreground"
          value={selectedId ?? ""}
          onChange={(e) => setSelectedId(e.target.value || null)}
        >
          <option value="">System default</option>
          {devices.map((d) => {
            const highlight = KNOWN_VIRTUAL_NAMES.some((name) =>
              d.label.toLowerCase().includes(name.toLowerCase())
            );
            return (
              <option key={d.deviceId} value={d.deviceId}>
                {highlight ? "⭐ " : ""}
                {d.label || d.deviceId}
              </option>
            );
          })}
        </select>
      )}
      <p className="text-[10px] text-muted-foreground">
        Works best with virtual audio devices like VB-Audio Cable, VoiceMeeter, or BlackHole.
      </p>
    </div>
  );
};

