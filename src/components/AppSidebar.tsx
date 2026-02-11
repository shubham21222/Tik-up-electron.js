import { cn } from "@/lib/utils";
import {
  Home, Settings, Layers, Zap, Volume2, MessageCircle,
  Trophy, Music, Wrench, Crown
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import tikupLogo from "@/assets/tikup_logo.png";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  to: string;
}

const SidebarItem = ({ icon, label, active, to }: SidebarItemProps) => (
  <Link
    to={to}
    className={cn(
      "flex flex-col items-center gap-1 py-2.5 px-1 w-full rounded-lg transition-all duration-200 text-[11px] font-medium",
      active
        ? "bg-sidebar-accent text-primary"
        : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/50"
    )}
  >
    <span className={cn("transition-colors", active && "drop-shadow-[0_0_6px_hsl(174,80%,50%)]")}>
      {icon}
    </span>
    {label}
  </Link>
);

const sidebarItems = [
  { id: "/", label: "Start", icon: Home },
  { id: "/setup", label: "Setup", icon: Settings },
  { id: "/overlays", label: "Overlays", icon: Layers },
  { id: "/actions", label: "Actions", icon: Zap },
  { id: "/sounds", label: "Sounds", icon: Volume2 },
  { id: "/chat", label: "Chat", icon: MessageCircle },
  { id: "/points", label: "Points", icon: Trophy },
  { id: "/song", label: "Song", icon: Music },
  { id: "/tools", label: "Tools", icon: Wrench },
];

const AppSidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-[68px] h-screen bg-sidebar border-r border-sidebar-border flex flex-col items-center py-3 fixed left-0 top-0 z-50">
      <Link to="/" className="mb-4 flex items-center justify-center w-10 h-10 rounded-xl hover:opacity-80 transition-opacity">
        <img src={tikupLogo} alt="TikUp" className="w-9 h-9 object-contain" />
      </Link>

      <nav className="flex-1 flex flex-col gap-0.5 w-full px-1.5 overflow-y-auto">
        {sidebarItems.map((item) => (
          <SidebarItem
            key={item.id}
            icon={<item.icon size={20} />}
            label={item.label}
            active={location.pathname === item.id}
            to={item.id}
          />
        ))}
      </nav>

      <div className="flex flex-col gap-1 w-full px-1.5 mt-2">
        <Link to="/pro" className="flex items-center justify-center gap-1 py-2 px-2 w-full rounded-lg bg-secondary/10 hover:bg-secondary/20 transition-colors text-secondary text-[10px] font-semibold">
          <Crown size={14} />
          PRO
        </Link>
      </div>
    </aside>
  );
};

export default AppSidebar;
