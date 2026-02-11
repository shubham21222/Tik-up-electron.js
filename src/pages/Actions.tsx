import AppLayout from "@/components/AppLayout";
import { Zap, Plus, Gift, UserPlus, Heart, Share2, MessageCircle, Star } from "lucide-react";

const eventTriggers = [
  { icon: Gift, label: "Gift Received", color: "text-secondary" },
  { icon: UserPlus, label: "New Follow", color: "text-primary" },
  { icon: Heart, label: "Like", color: "text-secondary" },
  { icon: Share2, label: "Share", color: "text-primary" },
  { icon: MessageCircle, label: "Chat Message", color: "text-primary" },
  { icon: Star, label: "Subscription", color: "text-secondary" },
];

const Actions = () => {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto animate-slide-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Zap size={28} className="text-primary" />
              <h1 className="text-3xl font-heading font-bold text-foreground">Actions & Events</h1>
            </div>
            <p className="text-muted-foreground">Create automated actions triggered by viewer interactions on your LIVE stream.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
            <Plus size={16} />
            New Action
          </button>
        </div>

        {/* Event triggers */}
        <section className="mb-8">
          <h2 className="text-lg font-heading font-semibold text-foreground mb-4">Event Triggers</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {eventTriggers.map((trigger) => (
              <div
                key={trigger.label}
                className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/20 transition-all cursor-pointer group"
              >
                <div className={`w-9 h-9 rounded-lg bg-muted flex items-center justify-center ${trigger.color}`}>
                  <trigger.icon size={18} />
                </div>
                <span className="font-medium text-sm text-foreground">{trigger.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Empty state */}
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
          <Zap size={40} className="text-muted-foreground mx-auto mb-4 opacity-40" />
          <h3 className="font-heading font-semibold text-foreground mb-2">No Actions Yet</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Create your first action to automate responses to viewer events. Combine triggers with effects like sound alerts, TTS, or game commands.
          </p>
          <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
            Create First Action
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Actions;
