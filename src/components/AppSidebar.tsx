import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Gift, MessageCircle, Users, BarChart3, Timer,
  Sparkles, Activity, Target, Trophy, Terminal,
  Shield, Link2, Palette, Settings, CreditCard, SlidersHorizontal,
  ChevronLeft, ChevronRight, Crown, Layers,
  Star, Keyboard, Coins, Image, Building2, Mic, Music,
  Monitor, Clock, Share2, List, Bell, CircleDot
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSidebarState } from "@/hooks/use-sidebar-state";
import { useIsAdmin } from "@/hooks/use-admin";
import { useSubscription } from "@/hooks/use-subscription";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFeatureFlags, type FeatureFlag } from "@/hooks/use-feature-flags";
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
  sectionIcon: typeof LayoutDashboard;
  items: NavItem[];
}

interface AppSidebarProps {
  onNavigate?: () => void;
}

const sections: SidebarSection[] = [
  {
    label: "Live Studio",
    emoji: "🎥",
    sectionIcon: Monitor,
    items: [
      { id: "/actions", label: "Gift & Sound Alerts", icon: Gift },
      { id: "/chat-overlay", label: "Chat Overlay", icon: MessageCircle },
      { id: "/viewer-count", label: "Viewer Count", icon: Users },
      { id: "/like-counter", label: "Like & Follower Counter", icon: BarChart3 },
      { id: "/stream-timer", label: "Stream Timer", icon: Timer },
      { id: "/tts", label: "Text-to-Speech", icon: Mic },
      { id: "/recent-activity", label: "Event Feed", icon: Activity },
    ],
  },
  {
    label: "Engagement & Growth",
    emoji: "📈",
    sectionIcon: Target,
    items: [
      { id: "/goal-overlays", label: "Stream Goals", icon: Target },
      { id: "/leaderboard", label: "Top Supporters", icon: Trophy },
      { id: "/points", label: "Points & Loyalty", icon: Coins },
      { id: "/social-rotator", label: "Social Rotator", icon: Share2 },
    ],
  },
  {
    label: "Creator Tools",
    emoji: "🛠",
    sectionIcon: Terminal,
    items: [
      { id: "/chat-commands", label: "Chat Commands", icon: Terminal },
      { id: "/auto-moderation", label: "Chat Protection", icon: Shield },
      { id: "/keystroke-triggers", label: "Keystroke Triggers", icon: Keyboard },
      { id: "/gta-triggers", label: "Subathon Timer", icon: Clock },
    ],
  },
  {
    label: "Visual Tools",
    emoji: "🎨",
    sectionIcon: Palette,
    items: [
      { id: "/backgrounds", label: "Backgrounds", icon: Image },
      { id: "/overlays", label: "Premium Overlays", icon: Layers },
      { id: "/neon-event-list", label: "Neon Event List", icon: List, pro: true },
      { id: "/glow-alert-popup", label: "Glow Alert Popup", icon: Bell, pro: true },
      { id: "/circular-profile-widget", label: "Circular Profile Widget", icon: CircleDot, pro: true },
      { id: "/sounds", label: "AI Voice Packs", icon: Music, pro: true },
    ],
  },
  {
    label: "Enterprise",
    emoji: "🏢",
    sectionIcon: Building2,
    items: [
      { id: "/enterprise", label: "Command Center", icon: BarChart3 },
      { id: "/agencies", label: "Agency Hub", icon: Building2 },
    ],
  },
  {
    label: "Settings",
    emoji: "⚙",
    sectionIcon: Settings,
    items: [
      { id: "/setup", label: "Account", icon: Link2 },
      { id: "/integrations", label: "Integrations", icon: Settings },
      { id: "/pro", label: "Billing", icon: CreditCard },
      { id: "/brand-settings", label: "Appearance", icon: Palette, pro: true },
      { id: "/admin", label: "Advanced", icon: SlidersHorizontal, adminOnly: true },
    ],
  },
];

/* ── Build filtered sections + coming soon bucket ── */

/* ── Build filtered sections + coming soon bucket ── */
function buildFilteredSections(
  allSections: SidebarSection[],
  isVisible: (key: string) => boolean,
  isAdmin: boolean,
): { filtered: SidebarSection[]; comingSoon: NavItem[] } {
  const comingSoon: NavItem[] = [];
  const filtered = allSections.map(section => {
    const visible: NavItem[] = [];
    for (const item of section.items) {
      if (item.adminOnly && !isAdmin) continue;
      if (!isVisible(item.id)) {
        comingSoon.push(item);
      } else {
        visible.push(item);
      }
    }
    return { ...section, items: visible };
  }).filter(s => s.items.length > 0);
  return { filtered, comingSoon };
}

/* ── Nav item component ── */
const SidebarNavItem = ({
  item,
  isActive,
  isCollapsed,
  onClick,
  isHidden,
}: {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
  isHidden?: boolean;
}) => {
  if (isHidden) {
    return (
      <div
        className={cn(
          "sidebar-nav-item group relative flex items-center gap-3 rounded-xl transition-all duration-200 opacity-40 cursor-not-allowed select-none",
          isCollapsed ? "justify-center p-2.5" : "px-3 py-2",
        )}
      >
        <div className={cn(
          "flex items-center justify-center rounded-lg flex-shrink-0 sidebar-icon-glass opacity-50",
          isCollapsed ? "w-8 h-8" : "w-7 h-7",
        )}>
          <item.icon size={isCollapsed ? 17 : 15} className="flex-shrink-0" />
        </div>
        {!isCollapsed && (
          <>
            <span className="text-[12.5px] font-semibold tracking-wide truncate text-muted-foreground/50">{item.label}</span>
            <span className="ml-auto text-[7px] font-extrabold px-1.5 py-0.5 rounded-md flex-shrink-0 bg-muted/30 text-muted-foreground/60">
              SOON
            </span>
          </>
        )}
        {isCollapsed && (
          <div className="sidebar-tooltip absolute left-full ml-3 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 z-[60]">
            {item.label} (Coming Soon)
          </div>
        )}
      </div>
    );
  }

  return (
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
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[2.5px] h-5 rounded-r-full bg-secondary"
            style={{ boxShadow: "0 0 8px hsl(var(--secondary) / 0.6)" }}
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
};

/* ── Section group component ── */
const SidebarSectionGroup = ({
  section,
  isOpen,
  isCollapsed,
  onToggle,
  onNavigate,
  location,
}: {
  section: SidebarSection;
  isOpen: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
  onNavigate: () => void;
  location: ReturnType<typeof useLocation>;
  isAdmin?: boolean;
  isVisible?: (key: string) => boolean;
}) => {
  const visibleItems = section.items;
  if (visibleItems.length === 0) return null;

  return (
    <div className="space-y-0.5">
      {/* Section header */}
      <button
        onClick={() => !isCollapsed && onToggle()}
        className={cn(
          "sidebar-section-header w-full flex items-center gap-2.5 rounded-lg transition-all duration-200",
          isCollapsed ? "justify-center p-2" : "px-3 py-2",
          "text-muted-foreground/60 hover:text-muted-foreground/90 hover:bg-[hsl(0_0%_100%/0.03)]"
        )}
      >
        {isCollapsed ? (
          <section.sectionIcon size={16} className="sidebar-section-icon flex-shrink-0 opacity-80" />
        ) : (
          <>
            <section.sectionIcon size={14} className="sidebar-section-icon flex-shrink-0 opacity-80" />
            <span className="sidebar-section-label uppercase tracking-[0.14em] font-bold text-[10px] flex-1 text-left">
              {section.label}
            </span>
            <motion.div
              animate={{ rotate: isOpen ? 0 : -90 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <ChevronRight size={12} className="flex-shrink-0 opacity-40" />
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
              isHidden={false}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

/* ── What's New item with description & badge ── */
const ComingSoonItemNew = ({ item, isCollapsed, flag }: { item: NavItem; isCollapsed: boolean; flag?: FeatureFlag }) => (
  <div
    className={cn(
      "sidebar-nav-item group relative flex items-center gap-3 rounded-xl transition-all duration-200 opacity-60 cursor-not-allowed select-none",
      isCollapsed ? "justify-center p-2.5" : "px-3 py-2.5",
    )}
  >
    <div className={cn(
      "flex items-center justify-center rounded-lg flex-shrink-0 sidebar-icon-glass opacity-60",
      isCollapsed ? "w-8 h-8" : "w-7 h-7",
    )}>
      <item.icon size={isCollapsed ? 17 : 15} className="flex-shrink-0" />
    </div>
    {!isCollapsed && (
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-bold tracking-wide truncate text-foreground/60">{item.label}</span>
          {flag?.badge && (
            <span className={cn(
              "text-[8px] font-extrabold px-1.5 py-0.5 rounded-md flex-shrink-0 uppercase",
              flag.badge === "New" ? "bg-secondary/20 text-secondary" :
              flag.badge === "Popular" ? "bg-orange-500/20 text-orange-400" :
              "bg-muted/30 text-muted-foreground/60"
            )}>
              {flag.badge}
            </span>
          )}
        </div>
        {flag?.description && (
          <p className="text-[10px] text-muted-foreground/40 truncate leading-tight mt-0.5">{flag.description}</p>
        )}
      </div>
    )}
    {isCollapsed && (
      <div className="sidebar-tooltip absolute left-full ml-3 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 z-[60]">
        {item.label} (Coming Soon)
      </div>
    )}
  </div>
);

/* ── Main Sidebar ── */
const AppSidebar = ({ onNavigate }: AppSidebarProps) => {
  const location = useLocation();
  const { collapsed, toggle } = useSidebarState();
  const { isAdmin } = useIsAdmin();
  const { isPro, loading: subLoading } = useSubscription();
  const { isVisible, flags: allFlags } = useFeatureFlags();
  const isMobile = useIsMobile();
  const isCollapsed = isMobile ? false : collapsed;

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries([...sections, { label: "Coming Soon" }].map(s => [s.label, true]))
  );

  const toggleSection = useCallback((label: string) => {
    setOpenSections(prev => ({ ...prev, [label]: !prev[label] }));
  }, []);

  // Build filtered sections and collect coming soon items
  const { filtered: filteredCore, comingSoon: comingSoonCore } = buildFilteredSections(
    sections.filter(s => !["Enterprise", "Settings"].includes(s.label)), isVisible, isAdmin
  );
  const { filtered: filteredBottom, comingSoon: comingSoonBottom } = buildFilteredSections(
    sections.filter(s => ["Enterprise", "Settings"].includes(s.label)), isVisible, isAdmin
  );
  const comingSoonItems = [...comingSoonCore, ...comingSoonBottom];
  const comingSoonFlags = allFlags.filter(f => !f.is_visible);

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
              background: "radial-gradient(circle, hsl(var(--secondary) / 0.12) 0%, transparent 70%)",
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
              "relative z-10 drop-shadow-[0_0_10px_hsl(var(--secondary)/0.3)]",
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
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[2.5px] h-5 rounded-r-full bg-secondary"
                style={{ boxShadow: "0 0 8px hsl(var(--secondary) / 0.6)" }}
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
        {filteredCore.map((section) => (
          <SidebarSectionGroup
            key={section.label}
            section={section}
            isOpen={openSections[section.label] ?? true}
            isCollapsed={isCollapsed}
            onToggle={() => toggleSection(section.label)}
            onNavigate={handleClick}
            location={location}
          />
        ))}

        {/* Separator before bottom sections */}
        <div className="mx-1 h-px sidebar-separator my-2" />

        {filteredBottom.map((section) => (
          <SidebarSectionGroup
            key={section.label}
            section={section}
            isOpen={openSections[section.label] ?? true}
            isCollapsed={isCollapsed}
            onToggle={() => toggleSection(section.label)}
            onNavigate={handleClick}
            location={location}
          />
        ))}

        {/* ── Coming Soon / What's New section ── */}
        {comingSoonItems.length > 0 && (
          <>
            <div className="mx-1 h-px sidebar-separator my-2" />
            <div className="space-y-0.5">
              <button
                onClick={() => !isCollapsed && toggleSection("Coming Soon")}
                className={cn(
                  "sidebar-section-header w-full flex items-center gap-2.5 rounded-lg transition-all duration-200",
                  isCollapsed ? "justify-center p-2" : "px-3 py-2",
                  "text-muted-foreground/60 hover:text-muted-foreground/90 hover:bg-[hsl(0_0%_100%/0.03)]"
                )}
              >
                {isCollapsed ? (
                  <Sparkles size={16} className="sidebar-section-icon flex-shrink-0 opacity-80" />
                ) : (
                  <>
                    <Sparkles size={14} className="sidebar-section-icon flex-shrink-0 text-secondary opacity-90" />
                    <span className="sidebar-section-label uppercase tracking-[0.14em] font-bold text-[10px] flex-1 text-left">
                      What's New
                    </span>
                    <motion.div
                      animate={{ rotate: (openSections["Coming Soon"] ?? true) ? 0 : -90 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <ChevronRight size={12} className="flex-shrink-0 opacity-40" />
                    </motion.div>
                  </>
                )}
              </button>
              <motion.div
                initial={false}
                animate={{
                  height: isCollapsed || (openSections["Coming Soon"] ?? true) ? "auto" : 0,
                  opacity: isCollapsed || (openSections["Coming Soon"] ?? true) ? 1 : 0,
                }}
                transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                className="overflow-hidden"
              >
                <div className="space-y-px">
                  {comingSoonItems.map((item) => (
                    <ComingSoonItemNew key={item.id} item={item} isCollapsed={isCollapsed} flag={comingSoonFlags.find(f => f.feature_key === item.id)} />
                  ))}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </nav>

      {/* ── Go Pro CTA ── */}
      {!subLoading && !isPro && !isAdmin && (
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
      )}

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
