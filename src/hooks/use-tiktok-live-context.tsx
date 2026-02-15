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

const fallbackValue: TikTokLiveContextValue = {
  status: "disconnected",
  stats: { viewerCount: 0, likeCount: 0, followerCount: 0, diamondCount: 0, shareCount: 0, giftCoins: 0, title: "", roomId: "" },
  events: [],
  error: null,
  connect: async () => {},
  disconnect: () => {},
};

export const useTikTokLiveGlobal = (): TikTokLiveContextValue => {
  const ctx = useContext(TikTokLiveContext);
  if (!ctx) return fallbackValue;
  return ctx;
};
