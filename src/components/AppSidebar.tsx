import { cn } from "@/lib/utils";
import {
  Home, Settings, Layers, Zap, Volume2, MessageCircle,
  Trophy, Music, Wrench, Search, Bell, HelpCircle, Crown
} from "lucide-react";
import { useState } from "react";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ icon, label, active, onClick }: SidebarItemProps) => (
  <button
    onClick={onClick}
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
  </button>
);

interface AppSidebarProps {
  activeItem: string;
  onItemChange: (item: string) => void;
}

const sidebarItems = [
  { id: "start", label: "Start", icon: Home },
  { id: "setup", label: "Setup", icon: Settings },
  { id: "overlays", label: "Overlays", icon: Layers },
  { id: "actions", label: "Actions", icon: Zap },
  { id: "sounds", label: "Sounds", icon: Volume2 },
  { id: "chat", label: "Chat", icon: MessageCircle },
  { id: "points", label: "Points", icon: Trophy },
  { id: "song", label: "Song", icon: Music },
  { id: "tools", label: "Tools", icon: Wrench },
];

const AppSidebar = ({ activeItem, onItemChange }: AppSidebarProps) => {
  return (
    <aside className="w-[68px] h-screen bg-sidebar border-r border-sidebar-border flex flex-col items-center py-3 fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="mb-4 flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
        <span className="text-lg font-heading font-bold text-primary">T</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col gap-0.5 w-full px-1.5 overflow-y-auto">
        {sidebarItems.map((item) => (
          <SidebarItem
            key={item.id}
            icon={<item.icon size={20} />}
            label={item.label}
            active={activeItem === item.id}
            onClick={() => onItemChange(item.id)}
          />
        ))}
      </nav>

      {/* Bottom */}
      <div className="flex flex-col gap-1 w-full px-1.5 mt-2">
        <button className="flex items-center justify-center gap-1 py-2 px-2 w-full rounded-lg bg-secondary/10 hover:bg-secondary/20 transition-colors text-secondary text-[10px] font-semibold">
          <Crown size={14} />
          PRO
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
