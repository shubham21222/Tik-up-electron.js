import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Gift, MessageCircle, Users, BarChart3, Timer,
  Sparkles, Volume2, Activity, Target, Trophy, Terminal,
  Shield, BarChart, Link2, Palette, Settings,
  ChevronLeft, ChevronRight, Crown, Layers, ShieldCheck,
  Star, Keyboard, Coins, Image, Building2, Mic
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSidebarState } from "@/hooks/use-sidebar-state";
import { useIsAdmin } from "@/hooks/use-admin";
import { useIsMobile } from "@/hooks/use-mobile";
import tikupLogo from "@/assets/tikup_logo.png";

interface NavItem {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  pro?: boolean;
  adminOnly?: boolean;
}

interface SidebarSection {
  label: string;
  emoji: string;
  items: NavItem[];
}

interface AppSidebarProps {
  onNavigate?: () => void;
}

const sections: SidebarSection[] = [
  {
    label: "Live Controls",
    emoji: "📡",
    items: [
      { id: "/actions", label: "Gift Alerts", icon: Gift },
      { id: "/chat-overlay", label: "Chat Overlay", icon: MessageCircle },
      { id: "/viewer-count", label: "Viewer Count", icon: Users },
      { id: "/like-counter", label: "Like / Follower Counter", icon: BarChart3 },
      { id: "/stream-timer", label: "Stream Timer", icon: Timer },
      { id: "/presets", label: "Stream Themes", icon: Sparkles },
    ],
  },
  {
    label: "Engagement",
    emoji: "🔥",
    items: [
      { id: "/sounds", label: "Spotify Connect", icon: Volume2, pro: true },
      { id: "/overlays", label: "Effects Browser", icon: Layers },
      { id: "/backgrounds", label: "Backgrounds", icon: Image, pro: true },
      { id: "/recent-activity", label: "Event Feed", icon: Activity },
    ],
  },
  {
    label: "Growth & Goals",
    emoji: "🚀",
    items: [
      { id: "/goal-overlays", label: "Stream Goals", icon: Target },
      { id: "/leaderboard", label: "Top Supporters", icon: Trophy, pro: true },
      { id: "/points", label: "User & Points", icon: Coins },
    ],
  },
  {
    label: "Creator Tools",
    emoji: "🛠",
    items: [
      { id: "/chat-commands", label: "Chat Commands", icon: Terminal },
      { id: "/tts", label: "TTS Chat", icon: Mic },
      { id: "/auto-moderation", label: "Chat Protection", icon: Shield },
      { id: "/keystroke-triggers", label: "Keystroke Triggers", icon: Keyboard },
      { id: "/polls", label: "Polls", icon: BarChart, pro: true },
      { id: "/gift-browser", label: "Gift Browser", icon: Gift },
    ],
  },
  {
    label: "Enterprise",
    emoji: "🏢",
    items: [
      { id: "/enterprise", label: "Command Center", icon: BarChart3 },
      { id: "/agencies", label: "Agency Hub", icon: Building2 },
    ],
  },
  {
    label: "Settings",
    emoji: "⚙",
    items: [
      { id: "/setup", label: "Connect TikTok", icon: Link2 },
      { id: "/brand-settings", label: "Brand & Style", icon: Palette, pro: true },
      { id: "/integrations", label: "Integrations", icon: Settings },
      { id: "/admin", label: "Admin Panel", icon: ShieldCheck, adminOnly: true },
    ],
  },
];

const AppSidebar = ({ onNavigate }: AppSidebarProps) => {
  const location = useLocation();
  const { collapsed, toggle } = useSidebarState();
  const { isAdmin } = useIsAdmin();
  const isMobile = useIsMobile();

  // On mobile the sidebar is always expanded inside the sheet
  const isCollapsed = isMobile ? false : collapsed;

  const handleClick = () => {
    if (onNavigate) onNavigate();
  };

  return (
    <aside
      className={cn(
        "h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        isMobile
          ? "w-full relative"
          : cn("fixed left-0 top-0 z-50", isCollapsed ? "w-[60px]" : "w-[230px]")
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-center border-b border-sidebar-border flex-shrink-0 py-3">
        <Link to="/" className="flex items-center justify-center flex-shrink-0" onClick={handleClick}>
          <motion.img
            src={tikupLogo}
            alt="TikUp"
            className={cn(isCollapsed ? "w-12 h-12" : "w-28 h-28")}
            style={{ objectFit: "contain" }}
            animate={{
              filter: [
                "drop-shadow(0 0 8px hsl(160 100% 50% / 0.3))",
                "drop-shadow(0 0 16px hsl(160 100% 50% / 0.5))",
                "drop-shadow(0 0 8px hsl(160 100% 50% / 0.3))",
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            whileHover={{ scale: 1.1 }}
          />
        </Link>
      </div>

      {/* Dashboard */}
      <div className="px-2 pt-3 pb-1">
        <Link
          to="/dashboard"
          onClick={handleClick}
          className={cn(
            "flex items-center gap-3 rounded-xl transition-all duration-200 group relative",
            isCollapsed ? "justify-center p-3" : "px-3 py-3",
            location.pathname === "/dashboard"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          )}
        >
          {location.pathname === "/dashboard" && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
          )}
          <LayoutDashboard size={22} className={cn("flex-shrink-0", location.pathname === "/dashboard" && "drop-shadow-[0_0_6px_hsl(160,100%,50%)]")} />
          {!isCollapsed && <span className="text-sm font-bold">Dashboard</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2.5 py-1.5 rounded-lg bg-popover border border-border text-foreground text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-[60] shadow-lg">
              Dashboard
            </div>
          )}
        </Link>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto py-1 px-2 space-y-3" style={{ scrollbarWidth: "none" }}>
        {sections.map((section) => (
          <div key={section.label}>
            <div className={cn("mb-1.5 mt-1", isCollapsed ? "flex justify-center" : "px-2")}>
              <p className={cn(
                "uppercase tracking-[0.14em] text-muted-foreground/60 font-extrabold flex items-center gap-1.5",
                isCollapsed ? "text-[8px] text-center" : "text-[10px]"
              )}>
                {isCollapsed ? (
                  <span>{section.emoji}</span>
                ) : (
                  <>
                    <span className="text-xs">{section.emoji}</span>
                    {section.label}
                  </>
                )}
              </p>
            </div>
            <div className="space-y-0.5">
              {section.items.filter(item => !item.adminOnly || isAdmin).map((item) => {
                const isActive = location.pathname === item.id;
                return (
                  <Link
                    key={item.id}
                    to={item.id}
                    onClick={handleClick}
                    className={cn(
                      "flex items-center gap-3 rounded-xl transition-all duration-200 group relative",
                      isCollapsed ? "justify-center p-3" : "px-3 py-2.5",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
                    )}
                    <item.icon size={20} className={cn("flex-shrink-0", isActive && "drop-shadow-[0_0_6px_hsl(160,100%,50%)]")} />
                    {!isCollapsed && (
                      <>
                        <span className="text-[13px] font-bold truncate">{item.label}</span>
                        {item.pro && (
                          <span
                            className="ml-auto text-[8px] font-extrabold px-1.5 py-0.5 rounded-md flex-shrink-0 inline-flex items-center gap-0.5"
                            style={{
                              background: "linear-gradient(135deg, hsl(280 100% 65% / 0.15), hsl(280 100% 55% / 0.08))",
                              color: "hsl(280 100% 70%)",
                              border: "1px solid hsl(280 100% 65% / 0.2)",
                            }}
                          >
                            <Star size={7} />
                            PRO
                          </span>
                        )}
                      </>
                    )}
                    {isCollapsed && (
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

      {/* Go Pro CTA */}
      <div className="px-2 pb-1">
        <Link
          to="/pro"
          onClick={handleClick}
          className={cn(
            "flex items-center gap-3 rounded-xl transition-all duration-200 group relative",
            isCollapsed ? "justify-center p-3" : "px-3 py-3",
            location.pathname === "/pro"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          style={{
            background: location.pathname === "/pro"
              ? "linear-gradient(135deg, hsl(280 100% 65% / 0.15), hsl(280 100% 55% / 0.08))"
              : "linear-gradient(135deg, hsl(280 100% 65% / 0.08), hsl(280 100% 55% / 0.04))",
            border: "1px solid hsl(280 100% 65% / 0.15)",
          }}
        >
          <Crown size={20} className="flex-shrink-0" style={{ color: "hsl(280 100% 70%)" }} />
          {!isCollapsed && (
            <span className="text-sm font-extrabold" style={{ color: "hsl(280 100% 70%)" }}>Go Pro</span>
          )}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2.5 py-1.5 rounded-lg bg-popover border border-border text-foreground text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-[60] shadow-lg">
              Go Pro
            </div>
          )}
        </Link>
      </div>

      {/* Collapse toggle - desktop only */}
      {!isMobile && (
        <div className="border-t border-sidebar-border p-2 flex-shrink-0">
          <button
            onClick={toggle}
            className="flex items-center justify-center w-full p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      )}
    </aside>
  );
};

export default AppSidebar;
