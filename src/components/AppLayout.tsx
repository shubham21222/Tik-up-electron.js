import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";
import StatusBar from "./StatusBar";
import { Search, Bell, HelpCircle, User } from "lucide-react";
import { SidebarStateProvider, useSidebarState } from "@/hooks/use-sidebar-state";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
}

const LayoutInner = ({ children }: AppLayoutProps) => {
  const { collapsed } = useSidebarState();

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <div
        className={cn(
          "flex-1 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          collapsed ? "ml-[60px]" : "ml-[220px]"
        )}
      >
        <header className="h-14 border-b border-border flex items-center justify-between px-6 sticky top-0 bg-background/80 backdrop-blur-xl z-40">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5 w-64">
              <Search size={14} className="text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full font-body"
              />
              <kbd className="text-[10px] text-muted-foreground bg-background px-1.5 py-0.5 rounded">⌘K</kbd>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <Bell size={18} />
            </button>
            <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <HelpCircle size={18} />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <User size={18} />
              <span className="text-sm font-medium">Login</span>
            </button>
          </div>
        </header>

        <main className="p-6 pb-16">
          {children}
        </main>
      </div>

      <StatusBar />
    </div>
  );
};

const AppLayout = ({ children }: AppLayoutProps) => (
  <SidebarStateProvider>
    <LayoutInner>{children}</LayoutInner>
  </SidebarStateProvider>
);

export default AppLayout;
