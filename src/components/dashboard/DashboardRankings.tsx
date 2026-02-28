import React from "react";
import { motion } from "framer-motion";
import { Trophy, RefreshCw, Loader2 } from "lucide-react";

import GlassCard from "@/components/ui/glass-card";

const formatCompact = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
};

export interface RankEntry {
  rank: number;
  diamonds: number;
  diamonds_description: string;
  nickname: string;
  unique_id: string;
  avatar: string;
  dollars?: string;
}

interface DashboardRankingsProps {
  rankings: RankEntry[];
  rankingsLoading: boolean;
  rankingsRegion: string;
  onRegionChange: (region: string) => void;
  onRefresh: () => void;
}

const REGIONS = [
  { value: "gb", label: "🇬🇧 GB" },
  { value: "us", label: "🇺🇸 US" },
  { value: "de", label: "🇩🇪 DE" },
  { value: "fr", label: "🇫🇷 FR" },
  { value: "es", label: "🇪🇸 ES" },
  { value: "br", label: "🇧🇷 BR" },
  { value: "id", label: "🇮🇩 ID" },
  { value: "my", label: "🇲🇾 MY" },
  { value: "ph", label: "🇵🇭 PH" },
  { value: "vn", label: "🇻🇳 VN" },
  { value: "th", label: "🇹🇭 TH" },
  { value: "sa", label: "🇸🇦 SA" },
  { value: "tr", label: "🇹🇷 TR" },
  { value: "jp", label: "🇯🇵 JP" },
];

const DashboardRankings = ({
  rankings,
  rankingsLoading,
  rankingsRegion,
  onRegionChange,
  onRefresh,
}: DashboardRankingsProps) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.3 }}
    className="mb-6"
  >
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy size={14} className="text-secondary" />
          <h2 className="text-sm font-heading font-bold text-foreground">TikTok LIVE Rankings</h2>
          <span className="text-[10px] text-muted-foreground font-medium px-2 py-0.5 rounded-md bg-muted/30">Daily</span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={rankingsRegion}
            onChange={(e) => onRegionChange(e.target.value)}
            className="text-[11px] px-2 py-1 rounded-lg border border-border bg-background text-foreground font-medium focus:outline-none focus:border-primary/30 transition-colors"
          >
            {REGIONS.map((r) => (
              <option key={r.value} value={r.value} className="bg-background text-foreground">{r.label}</option>
            ))}
          </select>
          <button onClick={onRefresh} disabled={rankingsLoading}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
            <RefreshCw size={12} className={rankingsLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>
      {rankingsLoading && rankings.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
          <Loader2 size={16} className="animate-spin mr-2" /> Loading…
        </div>
      ) : rankings.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground text-sm">No ranking data</div>
      ) : (
        <div className="w-full">
          <div className="flex items-center px-4 py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold border-b border-border/30">
            <span className="w-12">Rank</span>
            <span className="flex-1">User</span>
            <span className="w-24 text-right">Diamonds</span>
          </div>
          <div className="divide-y divide-border/20">
            {rankings.slice(0, 20).map((entry, i) => {
              const medalEmojis = ["🏆", "🏆", "🏆"];
              const isTop3 = i < 3;
              const rankColors = ["45 100% 55%", "0 0% 65%", "25 70% 45%"];
              return (
                <div
                  key={entry.unique_id || i}
                  className="flex items-center px-4 py-3 hover:bg-accent transition-colors"
                >
                  <span className="w-12 text-sm font-bold" style={{ color: isTop3 ? `hsl(${rankColors[i]})` : "hsl(var(--muted-foreground))" }}>
                    {isTop3 ? (
                      <span className="flex items-center gap-1.5">
                        {entry.rank} <span className="text-base">{medalEmojis[i]}</span>
                      </span>
                    ) : entry.rank}
                  </span>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {entry.avatar ? (
                      <img src={entry.avatar} alt={entry.nickname} className="w-9 h-9 rounded-full object-cover shrink-0 border border-border/30" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-muted/30 flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                        {entry.nickname.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium text-foreground truncate">{entry.nickname}</span>
                  </div>
                  <span className="w-24 text-right text-sm font-semibold" style={{ color: isTop3 ? `hsl(${rankColors[i]})` : "hsl(var(--muted-foreground))" }}>
                    {formatCompact(entry.diamonds || 0)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </GlassCard>
  </motion.div>
);

export default DashboardRankings;
