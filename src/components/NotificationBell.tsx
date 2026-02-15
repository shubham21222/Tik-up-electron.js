import { useState, useRef, useEffect } from "react";
import { Bell, Check, CheckCheck, Megaphone, Info, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications, Notification } from "@/hooks/use-notifications";

const typeIcon: Record<string, typeof Megaphone> = {
  announcement: Megaphone,
  update: Info,
  alert: AlertTriangle,
};

const typeColor: Record<string, string> = {
  announcement: "hsl(280 100% 65%)",
  update: "hsl(200 100% 55%)",
  alert: "hsl(45 100% 55%)",
};

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllRead, loading } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground relative"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
            style={{
              background: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border overflow-hidden z-50"
            style={{
              background: "hsl(var(--card))",
              boxShadow: "0 16px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)",
            }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-bold text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead()}
                  className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 transition-colors"
                >
                  <CheckCheck size={12} /> Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center text-sm text-muted-foreground animate-pulse">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell size={24} className="mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <NotificationItem key={n.id} notification={n} onRead={() => markAsRead(n.id)} />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const NotificationItem = ({ notification, onRead }: { notification: Notification; onRead: () => void }) => {
  const Icon = typeIcon[notification.type] || Info;
  const color = typeColor[notification.type] || "hsl(var(--primary))";

  return (
    <div
      className={`px-4 py-3 border-b border-border/50 transition-colors hover:bg-muted/30 cursor-pointer ${
        !notification.read ? "bg-primary/[0.03]" : ""
      }`}
      onClick={onRead}
    >
      <div className="flex gap-3">
        <div
          className="mt-0.5 p-1.5 rounded-lg shrink-0"
          style={{ background: `${color}15` }}
        >
          <Icon size={14} style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{notification.title}</span>
            {!notification.read && (
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "hsl(var(--primary))" }} />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.body}</p>
          <span className="text-[10px] text-muted-foreground/60 mt-1 block">
            {new Date(notification.created_at).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NotificationBell;
