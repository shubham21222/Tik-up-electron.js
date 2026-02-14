import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Target, BarChart3, Zap, MessageCircle, Gift,
  Heart, UserPlus, Share2, Users, Timer, Activity, Trophy,
  Volume2, Terminal, Shield, Mic, PartyPopper, BarChart,
  Puzzle, Link2, Palette, CreditCard, ChevronLeft,
  ChevronRight, Layers, Type, Settings, ShieldCheck, Sparkles
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSidebarState } from "@/hooks/use-sidebar-state";
import tikupLogo from "@/assets/tikup_logo.png";

interface SidebarSection {
  label: string;
  items: { id: string; label: string; icon: typeof LayoutDashboard; pro?: boolean }[];
}

const sections: SidebarSection[] = [
  {
    label: "My Stream",
    items: [
      { id: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "/actions", label: "Gift Alerts", icon: Gift },
      { id: "/chat-overlay", label: "Chat Overlay", icon: MessageCircle },
      { id: "/like-counter", label: "Like / Follower Counter", icon: BarChart3 },
      { id: "/stream-timer", label: "Stream Timer", icon: Timer },
      { id: "/viewer-count", label: "Viewer Count", icon: Users },
      { id: "/sounds", label: "Sound Alerts", icon: Volume2 },
    ],
  },
  {
    label: "PRO Features",
    items: [
      { id: "/share-alerts", label: "Share Reactions", icon: Share2, pro: true },
      { id: "/follow-alerts", label: "Follow Reactions", icon: UserPlus, pro: true },
      { id: "/like-alerts", label: "Like Reactions", icon: Heart, pro: true },
      { id: "/leaderboard", label: "Top Gifters Board", icon: Trophy, pro: true },
      { id: "/custom-text", label: "Custom Text", icon: Type, pro: true },
      { id: "/chat-commands", label: "Chat Commands", icon: Terminal, pro: true },
      { id: "/tts", label: "Text-to-Speech", icon: Mic, pro: true },
    ],
  },
  {
    label: "More",
    items: [
      { id: "/overlays", label: "All Overlays", icon: Layers },
      { id: "/presets", label: "Stream Themes", icon: Sparkles },
      { id: "/gift-browser", label: "Gift Browser", icon: Gift },
      { id: "/recent-activity", label: "Live Feed", icon: Activity },
      { id: "/auto-moderation", label: "Chat Protection", icon: Shield },
      { id: "/setup", label: "Connect TikTok", icon: Settings },
      { id: "/integrations", label: "Integrations", icon: Link2 },
      { id: "/brand-settings", label: "Brand & Style", icon: Palette },
      { id: "/pro", label: "Go Pro", icon: CreditCard },
      { id: "/admin", label: "Admin Panel", icon: ShieldCheck },
    ],
  },
];

const AppSidebar = () => {
  const location = useLocation();
  const { collapsed, toggle } = useSidebarState();

  return (
    <aside
      className={cn(
        "h-screen bg-sidebar border-r border-sidebar-border flex flex-col fixed left-0 top-0 z-50 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        collapsed ? "w-[60px]" : "w-[220px]"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center h-14 border-b border-sidebar-border px-3 flex-shrink-0", collapsed ? "justify-center" : "gap-3")}>
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <img src={tikupLogo} alt="TikUp" className={cn(collapsed ? "w-10 h-10" : "w-12 h-12")} style={{ objectFit: "contain" }} />
          {!collapsed && (
            <span className="text-base font-heading font-bold text-foreground tracking-tight">TikUp</span>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4" style={{ scrollbarWidth: "none" }}>
        {sections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/50 font-semibold px-2 mb-1.5">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = location.pathname === item.id;
                return (
                  <Link
                    key={item.id}
                    to={item.id}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg transition-all duration-200 group relative",
                      collapsed ? "justify-center p-2.5" : "px-2.5 py-[7px]",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-r-full bg-primary" />
                    )}
                    <item.icon size={16} className={cn("flex-shrink-0", isActive && "drop-shadow-[0_0_6px_hsl(160,100%,50%)]")} />
                    {!collapsed && (
                      <>
                        <span className="text-[13px] font-medium truncate">{item.label}</span>
                        {item.pro && (
                          <span className="ml-auto text-[9px] font-bold text-secondary bg-secondary/10 px-1.5 py-0.5 rounded-md flex-shrink-0">
                            PRO
                          </span>
                        )}
                      </>
                    )}
                    {collapsed && (
                      <div className="absolute left-full ml-2 px-2.5 py-1.5 rounded-lg bg-popover border border-border text-foreground text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-[60] shadow-lg">
                        {item.label}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-sidebar-border p-2 flex-shrink-0">
        <button
          onClick={toggle}
          className="flex items-center justify-center w-full p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
