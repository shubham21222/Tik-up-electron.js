import { useEffect, useState } from "react";
import { isElectron } from "@/lib/electron";

export function useElectronStore<T = unknown>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!isElectron() || !window.electronAPI?.store) return;
      try {
        const stored = await window.electronAPI.store.get(key);
        if (!cancelled && stored !== undefined) {
          setValue(stored as T);
        }
      } catch {
        // ignore
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [key]);

  const update = async (next: T) => {
    setValue(next);
    if (!isElectron() || !window.electronAPI?.store) return;
    try {
      await window.electronAPI.store.set(key, next);
    } catch {
      // ignore
    }
  };

  return [value, update];
}

