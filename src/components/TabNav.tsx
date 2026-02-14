import { cn } from "@/lib/utils";

interface TabNavProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  rightAction?: React.ReactNode;
}

const TabNav = ({ tabs, activeTab, onTabChange, rightAction }: TabNavProps) => (
  <div className="flex items-center gap-1 mb-4 border-b border-border pb-2 overflow-x-auto scrollbar-none" style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
    {tabs.map((tab) => (
      <button
        key={tab}
        onClick={() => onTabChange(tab)}
        className={cn(
          "px-4 py-2 md:py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap min-h-[44px] md:min-h-0",
          activeTab === tab
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        {tab}
      </button>
    ))}
    {rightAction && <><div className="flex-1" />{rightAction}</>}
  </div>
);

export default TabNav;
