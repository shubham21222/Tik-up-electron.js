import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { useTikTokLive } from "@/hooks/use-tiktok-live";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, LogOut, ChevronDown, Crown, Link2, Wifi, WifiOff,
  Settings, ExternalLink
} from "lucide-react";

const ProfileDropdown = () => {
  const { user, signOut } = useAuth();
  const { plan, isPro } = useSubscription();
  const { status } = useTikTokLive();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const connected = status === "connected";
  const displayName =
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    "User";
  const email = user?.email || "";

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all duration-200 hover:bg-muted/60"
      >
        {/* Avatar circle */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border"
          style={{
            background: "linear-gradient(135deg, hsl(var(--muted)), hsl(var(--muted)))",
            borderColor: connected ? "hsl(160 100% 45%)" : "hsl(var(--border))",
            color: "hsl(var(--foreground))",
          }}
        >
          {displayName.charAt(0).toUpperCase()}
        </div>

        <div className="hidden md:flex flex-col items-start">
          <span className="text-xs font-bold text-foreground leading-tight truncate max-w-[100px]">
            {displayName}
          </span>
          <span
            className="text-[10px] font-semibold leading-tight"
            style={{
              color: connected ? "hsl(160 100% 45%)" : "hsl(var(--destructive))",
            }}
          >
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>

        <ChevronDown
          size={14}
          className="text-muted-foreground hidden md:block transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-border overflow-hidden z-50"
            style={{
              background: "hsl(var(--card))",
              boxShadow: "0 16px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)",
            }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">My Profile</span>
                <span className="text-[11px] text-muted-foreground truncate max-w-[130px]">{email}</span>
              </div>
            </div>

            {/* Plan badge */}
            <div className="px-4 py-2.5 border-b border-border">
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wide"
                  style={
                    isPro
                      ? {
                          background: "linear-gradient(135deg, hsl(280 100% 65% / 0.15), hsl(280 100% 55% / 0.08))",
                          color: "hsl(280 100% 70%)",
                          border: "1px solid hsl(280 100% 65% / 0.2)",
                        }
                      : {
                          background: "hsl(var(--muted))",
                          color: "hsl(var(--muted-foreground))",
                          border: "1px solid hsl(var(--border))",
                        }
                  }
                >
                  {isPro ? <Crown size={10} /> : <User size={10} />}
                  {isPro ? "Pro Plan" : "Free Plan"}
                </div>
                <div className="flex items-center gap-1 ml-auto">
                  {connected ? (
                    <Wifi size={12} style={{ color: "hsl(160 100% 45%)" }} />
                  ) : (
                    <WifiOff size={12} className="text-muted-foreground" />
                  )}
                  <span
                    className="text-[10px] font-semibold"
                    style={{ color: connected ? "hsl(160 100% 45%)" : "hsl(var(--muted-foreground))" }}
                  >
                    {connected ? "Live" : "Offline"}
                  </span>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <DropdownItem
                icon={<Link2 size={16} />}
                label="Connect TikTok Account"
                onClick={() => { setOpen(false); navigate("/setup"); }}
              />

              {!isPro && (
                <DropdownItem
                  icon={<Crown size={16} style={{ color: "hsl(280 100% 70%)" }} />}
                  label="Upgrade to PRO"
                  highlight
                  onClick={() => { setOpen(false); navigate("/pro"); }}
                />
              )}

              <DropdownItem
                icon={<Settings size={16} />}
                label="Settings"
                onClick={() => { setOpen(false); navigate("/brand-settings"); }}
              />

              <div className="border-t border-border my-1" />

              <DropdownItem
                icon={<LogOut size={16} />}
                label="Sign Out"
                onClick={async () => {
                  setOpen(false);
                  await signOut();
                  navigate("/");
                }}
              />
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-border flex items-center justify-center gap-3 text-[10px] text-muted-foreground/50">
              <span>ToS</span>
              <span>·</span>
              <span>Privacy</span>
              <span>·</span>
              <span>v1.0.0</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DropdownItem = ({
  icon,
  label,
  onClick,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  highlight?: boolean;
}) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted/50"
  >
    <span className={highlight ? "" : "text-muted-foreground"}>{icon}</span>
    <span
      className="text-sm font-medium"
      style={highlight ? { color: "hsl(280 100% 70%)" } : undefined}
    >
      {label}
    </span>
  </button>
);

export default ProfileDropdown;
