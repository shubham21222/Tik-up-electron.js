import AppLayout from "@/components/AppLayout";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import {
  Trophy, Crown, Search, ArrowUpDown, ArrowUp, ArrowDown,
  Users, Coins, Heart, MessageCircle, Gift, RotateCcw, Medal
} from "lucide-react";
import { useViewerPoints } from "@/hooks/use-viewer-points";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const glassGradient = { background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" };
const glassInnerStyle = { background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" };

type SortField = "total_points" | "level" | "total_coins_sent" | "total_gifts_sent" | "total_likes" | "total_messages" | "last_activity" | "first_activity";

const columns: { key: SortField; label: string; icon?: typeof Trophy }[] = [
  { key: "total_points", label: "Points Total" },
  { key: "level", label: "Level" },
  { key: "total_coins_sent", label: "Coins Sent" },
  { key: "total_gifts_sent", label: "Gifts" },
  { key: "total_likes", label: "Likes" },
  { key: "total_messages", label: "Messages" },
  { key: "first_activity", label: "First Activity" },
  { key: "last_activity", label: "Last Activity" },
];

const rankColors: Record<number, string> = {
  1: "45 100% 55%",
  2: "0 0% 72%",
  3: "25 70% 45%",
};

const Points = () => {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState<SortField>("total_points");
  const [sortAsc, setSortAsc] = useState(false);
  const [search, setSearch] = useState("");
  const { viewers, isLoading, resetAllPoints } = useViewerPoints(sortBy, sortAsc);

  const filtered = useMemo(() => {
    if (!search.trim()) return viewers;
    const q = search.toLowerCase();
    return viewers.filter(v => v.viewer_username.toLowerCase().includes(q));
  }, [viewers, search]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) setSortAsc(!sortAsc);
    else { setSortBy(field); setSortAsc(false); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return <ArrowUpDown size={11} className="text-muted-foreground/40" />;
    return sortAsc ? <ArrowUp size={11} className="text-primary" /> : <ArrowDown size={11} className="text-primary" />;
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) +
      " " + date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset ALL viewer points? This cannot be undone.")) {
      resetAllPoints.mutate(undefined, {
        onSuccess: () => toast.success("All viewer points have been reset."),
        onError: () => toast.error("Failed to reset points."),
      });
    }
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Trophy size={48} className="text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">Sign in to view Points</h2>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse, hsl(280 100% 65% / 0.04), transparent 70%)" }} />

      <div className="max-w-7xl mx-auto relative z-10 pb-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-1">User & Points</h1>
          <p className="text-muted-foreground text-sm">
            Here you can see a list of users including points, levels and other info. You have <span className="text-foreground font-semibold">{filtered.length}</span> of max 2,500 users in your database.
            {" "}Visit the <Link to="/setup" className="text-primary hover:underline">Points System Settings</Link> to define rewards.
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Viewers", value: viewers.length, icon: Users, color: "200 100% 55%" },
            { label: "Total Points", value: viewers.reduce((s, v) => s + Number(v.total_points), 0), icon: Coins, color: "45 100% 55%" },
            { label: "Total Gifts", value: viewers.reduce((s, v) => s + v.total_gifts_sent, 0), icon: Gift, color: "280 100% 65%" },
            { label: "Total Messages", value: viewers.reduce((s, v) => s + v.total_messages, 0), icon: MessageCircle, color: "160 100% 45%" },
          ].map(stat => (
            <div key={stat.label} className="rounded-xl p-[1px]" style={glassGradient}>
              <div className="rounded-xl px-4 py-3" style={glassInnerStyle}>
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon size={14} style={{ color: `hsl(${stat.color})` }} />
                  <span className="text-[11px] text-muted-foreground font-medium">{stat.label}</span>
                </div>
                <p className="text-xl font-heading font-bold text-foreground">{stat.value.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Search & Actions */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by username..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border border-white/[0.08] bg-white/[0.02] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/30 transition-colors"
            />
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border border-white/[0.08] text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-all"
          >
            <RotateCcw size={12} /> Reset Points
          </button>
        </motion.div>

        {/* Table */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl p-[1px] overflow-hidden" style={glassGradient}>
          <div className="rounded-2xl overflow-hidden" style={glassInnerStyle}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-[280px]">
                      User
                    </th>
                    {columns.map(col => (
                      <th key={col.key}
                        onClick={() => handleSort(col.key)}
                        className="text-left px-3 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors whitespace-nowrap select-none"
                      >
                        <span className="flex items-center gap-1">
                          {col.label}
                          <SortIcon field={col.key} />
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    [...Array(8)].map((_, i) => (
                      <tr key={i} className="border-b border-white/[0.03]">
                        <td colSpan={9} className="px-4 py-4">
                          <div className="h-4 bg-muted/20 rounded animate-pulse" />
                        </td>
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-16">
                        <Trophy size={40} className="text-muted-foreground/20 mx-auto mb-3" />
                        <p className="text-sm font-heading font-bold text-foreground mb-1">No viewers yet</p>
                        <p className="text-xs text-muted-foreground">Viewer data will appear here as they interact with your stream.</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((viewer, i) => {
                      const rank = i + 1;
                      const rankColor = rankColors[rank];
                      return (
                        <motion.tr
                          key={viewer.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.02 }}
                          className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                        >
                          {/* User */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="relative flex-shrink-0">
                                {rankColor && rank <= 3 && (
                                  <div className="absolute -top-1 -left-1 w-4 h-4 rounded-full flex items-center justify-center z-10"
                                    style={{ background: `hsl(${rankColor})` }}>
                                    {rank === 1 ? <Crown size={8} className="text-black" /> : <Medal size={8} className="text-black" />}
                                  </div>
                                )}
                                {viewer.viewer_avatar_url ? (
                                  <img src={viewer.viewer_avatar_url} alt="" className="w-9 h-9 rounded-full object-cover border border-white/10" />
                                ) : (
                                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border border-white/10"
                                    style={{
                                      background: rankColor ? `linear-gradient(135deg, hsl(${rankColor} / 0.3), hsl(${rankColor} / 0.1))` : "hsl(var(--muted) / 0.3)",
                                      color: rankColor ? `hsl(${rankColor})` : "hsl(var(--muted-foreground))",
                                    }}>
                                    {viewer.viewer_username.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <span className="font-medium text-foreground truncate">@{viewer.viewer_username}</span>
                            </div>
                          </td>
                          {/* Points */}
                          <td className="px-3 py-3">
                            <span className="font-heading font-bold" style={{ color: "hsl(45 100% 55%)" }}>
                              {Number(viewer.total_points).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </td>
                          {/* Level */}
                          <td className="px-3 py-3">
                            <span className="font-heading font-bold text-foreground">{viewer.level}</span>
                          </td>
                          {/* Coins */}
                          <td className="px-3 py-3 text-muted-foreground">
                            {Number(viewer.total_coins_sent).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          {/* Gifts */}
                          <td className="px-3 py-3 text-muted-foreground">{viewer.total_gifts_sent.toLocaleString()}</td>
                          {/* Likes */}
                          <td className="px-3 py-3 text-muted-foreground">{viewer.total_likes.toLocaleString()}</td>
                          {/* Messages */}
                          <td className="px-3 py-3 text-muted-foreground">{viewer.total_messages.toLocaleString()}</td>
                          {/* First Activity */}
                          <td className="px-3 py-3 text-[11px] text-muted-foreground whitespace-nowrap">{formatDate(viewer.first_activity)}</td>
                          {/* Last Activity */}
                          <td className="px-3 py-3 text-[11px] text-muted-foreground whitespace-nowrap">{formatDate(viewer.last_activity)}</td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Points;
