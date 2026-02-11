import AppLayout from "@/components/AppLayout";
import { MessageCircle, Filter, Shield, Eye, EyeOff, Ban } from "lucide-react";

const chatSettings = [
  { icon: Filter, title: "Word Filters", description: "Block specific words or phrases from appearing in chat.", enabled: true },
  { icon: Shield, title: "Auto-Moderation", description: "Automatically filter spam, links, and inappropriate content.", enabled: false },
  { icon: Eye, title: "Chat Overlay", description: "Display chat messages as an overlay on your stream.", enabled: true },
  { icon: Ban, title: "User Blacklist", description: "Block specific users from triggering actions or TTS.", enabled: false },
];

const recentMessages = [
  { user: "CoolViewer42", message: "Love the stream! 🔥", time: "2m ago", type: "chat" },
  { user: "GiftKing", message: "Sent a Rose 🌹", time: "3m ago", type: "gift" },
  { user: "NewFan2025", message: "Just followed!", time: "5m ago", type: "follow" },
  { user: "StreamLover", message: "Can you play music?", time: "7m ago", type: "chat" },
  { user: "TikTokPro", message: "Sent a Lion 🦁", time: "8m ago", type: "gift" },
];

const Chat = () => {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto animate-slide-in">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle size={28} className="text-primary" />
            <h1 className="text-3xl font-heading font-bold text-foreground">Chat</h1>
          </div>
          <p className="text-muted-foreground">Manage chat settings, moderation, and view live chat activity.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Settings */}
          <div className="lg:col-span-3 space-y-3">
            <h2 className="text-lg font-heading font-semibold text-foreground mb-3">Chat Settings</h2>
            {chatSettings.map((setting) => (
              <div key={setting.title} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <setting.icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-semibold text-foreground text-sm">{setting.title}</h3>
                  <p className="text-xs text-muted-foreground">{setting.description}</p>
                </div>
                <div className={`w-10 h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors ${setting.enabled ? 'bg-primary justify-end' : 'bg-muted justify-start'}`}>
                  <div className={`w-4 h-4 rounded-full transition-colors ${setting.enabled ? 'bg-primary-foreground' : 'bg-muted-foreground'}`} />
                </div>
              </div>
            ))}
          </div>

          {/* Live preview */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-heading font-semibold text-foreground mb-3">Recent Activity</h2>
            <div className="rounded-xl border border-border bg-card p-3 space-y-1">
              {recentMessages.map((msg, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${msg.type === 'gift' ? 'bg-secondary' : msg.type === 'follow' ? 'bg-primary' : 'bg-muted-foreground'}`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">{msg.user}</span>
                      <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Chat;
