import React, { createContext, useContext, ReactNode } from "react";
import { useTikTokLive, ConnectionStatus, LiveStats, TikTokLiveEvent } from "@/hooks/use-tiktok-live";

interface TikTokLiveContextValue {
  status: ConnectionStatus;
  stats: LiveStats;
  events: TikTokLiveEvent[];
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const TikTokLiveContext = createContext<TikTokLiveContextValue | null>(null);

export const TikTokLiveProvider = ({ children }: { children: ReactNode }) => {
  const tikTokLive = useTikTokLive();

  return (
    <TikTokLiveContext.Provider value={tikTokLive}>
      {children}
    </TikTokLiveContext.Provider>
  );
};

export const useTikTokLiveGlobal = (): TikTokLiveContextValue => {
  const ctx = useContext(TikTokLiveContext);
  if (!ctx) throw new Error("useTikTokLiveGlobal must be used within TikTokLiveProvider");
  return ctx;
};
