import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Gift, MessageCircle, Users, BarChart3, Timer,
  Sparkles, Volume2, Activity, Target, Trophy, Terminal,
  Shield, Link2, Palette, Settings,
  ChevronLeft, ChevronRight, Crown, Layers, ShieldCheck,
  Star, Keyboard, Coins, Image, Building2, Mic, Gamepad2,
  ChevronDown
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSidebarState } from "@/hooks/use-sidebar-state";
import { useIsAdmin } from "@/hooks/use-admin";
import { useIsMobile } from "@/hooks/use-mobile";
import tikupLogo from "@/assets/tikup_logo.png";
import { useState, useCallback } from "react";

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
      { id: "/sound-alerts", label: "Sound Alerts", icon: Volume2 },
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
      { id: "/gta-triggers", label: "GTA Interactive", icon: Gamepad2, pro: true },
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

/* ── Separate core vs bottom sections ── */
const coreSections = sections.filter(s => !["Enterprise", "Settings"].includes(s.label));
const bottomSections = sections.filter(s => ["Enterprise", "Settings"].includes(s.label));

/* ── Nav item component ── */
const SidebarNavItem = ({
  item,
  isActive,
  isCollapsed,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}) => (
  <Link
    to={item.id}
    onClick={onClick}
    className={cn(
      "sidebar-nav-item group relative flex items-center gap-3 rounded-xl transition-all duration-200",
      isCollapsed ? "justify-center p-2.5" : "px-3 py-2",
      isActive
        ? "sidebar-nav-active"
        : "text-muted-foreground/70 hover:text-foreground/90"
    )}
  >
    {/* Active indicator bar */}
    <AnimatePresence>
      {isActive && (
        <motion.div
          layoutId="sidebar-active-bar"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[2.5px] h-5 rounded-r-full bg-primary"
          style={{ boxShadow: "0 0 8px hsl(var(--primary) / 0.6)" }}
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          exit={{ opacity: 0, scaleY: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      )}
    </AnimatePresence>

    {/* Icon in glass card */}
    <motion.div
      className={cn(
        "flex items-center justify-center rounded-lg transition-all duration-200 flex-shrink-0",
        isCollapsed ? "w-8 h-8" : "w-7 h-7",
        isActive
          ? "sidebar-icon-active"
          : "sidebar-icon-glass"
      )}
      whileHover={{ scale: 1.08 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      <item.icon size={isCollapsed ? 17 : 15} className="flex-shrink-0" />
    </motion.div>

    {!isCollapsed && (
      <>
        <span className="text-[12.5px] font-semibold tracking-wide truncate">{item.label}</span>
        {item.pro && (
          <span className="sidebar-pro-badge ml-auto text-[7px] font-extrabold px-1.5 py-0.5 rounded-md flex-shrink-0 inline-flex items-center gap-0.5">
            <Star size={6} />
            PRO
          </span>
        )}
      </>
    )}

    {/* Collapsed tooltip */}
    {isCollapsed && (
      <div className="sidebar-tooltip absolute left-full ml-3 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 z-[60]">
        {item.label}
      </div>
    )}
  </Link>
);

/* ── Section group component ── */
const SidebarSectionGroup = ({
  section,
  isOpen,
  isCollapsed,
  onToggle,
  isAdmin,
  onNavigate,
  location,
}: {
  section: SidebarSection;
  isOpen: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
  isAdmin: boolean;
  onNavigate: () => void;
  location: ReturnType<typeof useLocation>;
}) => {
  const visibleItems = section.items.filter(item => !item.adminOnly || isAdmin);
  if (visibleItems.length === 0) return null;

  return (
    <div className="space-y-0.5">
      {/* Section header */}
      <button
        onClick={() => !isCollapsed && onToggle()}
        className={cn(
          "w-full flex items-center gap-2 transition-colors duration-200",
          isCollapsed ? "justify-center px-0 py-1" : "px-3 py-1.5",
          "text-muted-foreground/40 hover:text-muted-foreground/60"
        )}
      >
        {isCollapsed ? (
          <span className="text-[10px]">{section.emoji}</span>
        ) : (
          <>
            <span className="text-[10px]">{section.emoji}</span>
            <span className="uppercase tracking-[0.18em] font-bold text-[9px] flex-1 text-left">
              {section.label}
            </span>
            <motion.div
              animate={{ rotate: isOpen ? 0 : -90 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <ChevronDown size={10} className="flex-shrink-0 opacity-50" />
            </motion.div>
          </>
        )}
      </button>

      {/* Items */}
      <motion.div
        initial={false}
        animate={{
          height: isCollapsed || isOpen ? "auto" : 0,
          opacity: isCollapsed || isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        className="overflow-hidden"
      >
        <div className="space-y-px">
          {visibleItems.map((item) => (
            <SidebarNavItem
              key={item.id}
              item={item}
              isActive={location.pathname === item.id}
              isCollapsed={isCollapsed}
              onClick={onNavigate}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

/* ── Main Sidebar ── */
const AppSidebar = ({ onNavigate }: AppSidebarProps) => {
  const location = useLocation();
  const { collapsed, toggle } = useSidebarState();
  const { isAdmin } = useIsAdmin();
  const isMobile = useIsMobile();
  const isCollapsed = isMobile ? false : collapsed;

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(sections.map(s => [s.label, true]))
  );

  const toggleSection = useCallback((label: string) => {
    setOpenSections(prev => ({ ...prev, [label]: !prev[label] }));
  }, []);

  const handleClick = () => {
    if (onNavigate) onNavigate();
  };

  return (
    <aside
      className={cn(
        "sidebar-shell h-screen flex flex-col transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        isMobile
          ? "w-full relative"
          : cn("fixed left-0 top-0 z-50", isCollapsed ? "w-[58px]" : "w-[224px]")
      )}
    >
      {/* ── Logo area ── */}
      <div className="flex items-center justify-center flex-shrink-0 py-4 px-2">
        <Link to="/" className="relative flex items-center justify-center flex-shrink-0" onClick={handleClick}>
          {/* Glow pulse behind logo */}
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{
              background: "radial-gradient(circle, hsl(var(--primary) / 0.12) 0%, transparent 70%)",
            }}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.img
            src={tikupLogo}
            alt="TikUp"
            className={cn(
              "relative z-10 drop-shadow-[0_0_10px_hsl(var(--primary)/0.3)]",
              isCollapsed ? "w-9 h-9" : "w-20 h-20"
            )}
            style={{ objectFit: "contain" }}
            whileHover={{ scale: 1.06 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          />
        </Link>
      </div>

      {/* Subtle separator */}
      <div className="mx-3 h-px sidebar-separator" />

      {/* ── Dashboard link ── */}
      <div className="px-2 pt-3 pb-1">
        <Link
          to="/dashboard"
          onClick={handleClick}
          className={cn(
            "sidebar-nav-item group relative flex items-center gap-3 rounded-xl transition-all duration-200",
            isCollapsed ? "justify-center p-2.5" : "px-3 py-2.5",
            location.pathname === "/dashboard"
              ? "sidebar-nav-active"
              : "text-muted-foreground/70 hover:text-foreground/90"
          )}
        >
          <AnimatePresence>
            {location.pathname === "/dashboard" && (
              <motion.div
                layoutId="sidebar-active-bar"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[2.5px] h-5 rounded-r-full bg-primary"
                style={{ boxShadow: "0 0 8px hsl(var(--primary) / 0.6)" }}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </AnimatePresence>
          <motion.div
            className={cn(
              "flex items-center justify-center rounded-lg transition-all duration-200 flex-shrink-0",
              isCollapsed ? "w-8 h-8" : "w-7 h-7",
              location.pathname === "/dashboard" ? "sidebar-icon-active" : "sidebar-icon-glass"
            )}
            whileHover={{ scale: 1.08 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <LayoutDashboard size={isCollapsed ? 17 : 15} />
          </motion.div>
          {!isCollapsed && <span className="text-[13px] font-bold tracking-wide">Dashboard</span>}
          {isCollapsed && (
            <div className="sidebar-tooltip absolute left-full ml-3 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 z-[60]">
              Dashboard
            </div>
          )}
        </Link>
      </div>

      {/* ── Core nav sections ── */}
      <nav className="flex-1 overflow-y-auto py-1 px-2 space-y-2 sidebar-scrollbar">
        {coreSections.map((section) => (
          <SidebarSectionGroup
            key={section.label}
            section={section}
            isOpen={openSections[section.label] ?? true}
            isCollapsed={isCollapsed}
            onToggle={() => toggleSection(section.label)}
            isAdmin={isAdmin}
            onNavigate={handleClick}
            location={location}
          />
        ))}

        {/* Separator before bottom sections */}
        <div className="mx-1 h-px sidebar-separator my-2" />

        {bottomSections.map((section) => (
          <SidebarSectionGroup
            key={section.label}
            section={section}
            isOpen={openSections[section.label] ?? true}
            isCollapsed={isCollapsed}
            onToggle={() => toggleSection(section.label)}
            isAdmin={isAdmin}
            onNavigate={handleClick}
            location={location}
          />
        ))}
      </nav>

      {/* ── Go Pro CTA ── */}
      <div className="px-2 pb-2">
        <Link
          to="/pro"
          onClick={handleClick}
          className={cn(
            "sidebar-pro-cta group relative flex items-center gap-3 rounded-xl transition-all duration-300",
            isCollapsed ? "justify-center p-2.5" : "px-3 py-2.5",
          )}
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 3 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Crown size={18} className="flex-shrink-0 sidebar-pro-icon" />
          </motion.div>
          {!isCollapsed && (
            <span className="text-[12.5px] font-extrabold tracking-wide sidebar-pro-text">
              Go Pro
            </span>
          )}
          {isCollapsed && (
            <div className="sidebar-tooltip absolute left-full ml-3 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 z-[60]">
              Go Pro
            </div>
          )}
        </Link>
      </div>

      {/* ── Collapse toggle ── */}
      {!isMobile && (
        <div className="px-2 pb-2 flex-shrink-0">
          <motion.button
            onClick={toggle}
            className="sidebar-collapse-btn flex items-center justify-center w-full p-2 rounded-lg transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </motion.button>
        </div>
      )}
    </aside>
  );
};

export default AppSidebar;
