import AppLayout from "@/components/AppLayout";
import FormSection from "@/components/FormSection";
import FormField from "@/components/FormField";
import TabNav from "@/components/TabNav";
import { MessageCircle, Info } from "lucide-react";
import { useState } from "react";

const recentMessages = [
  { user: "CoolViewer42", message: "Love the stream! 🔥", time: "2m ago", type: "chat" as const },
  { user: "GiftKing", message: "Sent a Rose 🌹", time: "3m ago", type: "gift" as const },
  { user: "NewFan2025", message: "Just followed!", time: "5m ago", type: "follow" as const },
  { user: "StreamLover", message: "Can you play music?", time: "7m ago", type: "chat" as const },
  { user: "TikTokPro", message: "Sent a Lion 🦁", time: "8m ago", type: "gift" as const },
  { user: "WatcherX", message: "Great content as always!", time: "9m ago", type: "chat" as const },
  { user: "Supporter99", message: "Shared your stream!", time: "10m ago", type: "share" as const },
  { user: "VibeCheck", message: "😂😂😂", time: "11m ago", type: "chat" as const },
];

const tabs = ["Live Chat", "Chat Settings", "Moderation", "Word Filters", "Blacklist"];

const Chat = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto animate-slide-in pb-12">
        <TabNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border mb-6">
          <Info size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground leading-relaxed">
            <p>View and manage your <span className="text-primary font-medium">TikTok LIVE Chat</span>. Configure moderation, word filters, and blacklists.</p>
          </div>
        </div>

        {activeTab === "Live Chat" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-5">
              <FormSection title="Chat Display Settings">
                <FormField label="Chat overlay" type="toggle" checked={true} />
                <FormField label="Font size" type="select" options={["Small", "Medium", "Large"]} />
                <FormField label="Animation" type="select" options={["Slide In", "Fade In", "None"]} />
                <FormField label="Show badges" type="toggle" checked={true} />
                <FormField label="Show timestamps" type="toggle" checked={false} />
                <FormField label="Max messages shown" type="number" value="50" />
              </FormSection>
            </div>
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-border bg-card overflow-hidden sticky top-20">
                <div className="px-4 py-3 border-b border-border">
                  <h3 className="font-heading font-semibold text-sm text-primary flex items-center gap-2">
                    <MessageCircle size={14} /> Live Chat Feed
                  </h3>
                </div>
                <div className="max-h-[500px] overflow-y-auto">
                  {recentMessages.map((msg, i) => (
                    <div key={i} className="flex items-start gap-2.5 px-4 py-2.5 border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        msg.type === 'gift' ? 'bg-secondary' : msg.type === 'follow' ? 'bg-primary' : msg.type === 'share' ? 'bg-green-400' : 'bg-muted-foreground'
                      }`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-foreground">{msg.user}</span>
                          <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-border bg-muted/30">
                  <p className="text-xs text-muted-foreground text-center italic">Connect to TikTok LIVE to see real-time chat</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Chat Settings" && (
          <FormSection title="General Chat Settings">
            <FormField label="Chat overlay enabled" type="toggle" checked={true} />
            <FormField label="Show viewer badges" type="toggle" checked={true} />
            <FormField label="Chat theme" type="select" options={["Default Dark", "Light", "Transparent", "Neon"]} />
            <FormField label="Max message length" type="number" value="300" />
          </FormSection>
        )}

        {activeTab === "Moderation" && (
          <FormSection title="Moderation Rules" accent>
            <FormField label="Block links" type="toggle" checked={true} />
            <FormField label="Block repeated messages" type="toggle" checked={true} />
            <FormField label="Slow mode (seconds)" type="number" value="0" />
            <FormField label="Min account age (days)" type="number" value="0" />
            <FormField label="Auto-ban spam bots" type="toggle" checked={true} />
          </FormSection>
        )}

        {activeTab === "Word Filters" && (
          <FormSection title="Word Filters" description="Add words or phrases to auto-block from chat and TTS.">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a word or phrase..."
                className="flex-1 bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
              />
              <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
                Add
              </button>
            </div>
            <p className="text-xs text-muted-foreground italic">No words added yet.</p>
          </FormSection>
        )}

        {activeTab === "Blacklist" && (
          <FormSection title="User Blacklist" description="Block specific users from triggering actions, TTS, and alerts.">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter username to blacklist..."
                className="flex-1 bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
              />
              <button className="px-4 py-2 rounded-md bg-destructive/20 text-destructive text-sm font-semibold hover:bg-destructive/30 transition-colors">
                Block
              </button>
            </div>
            <p className="text-xs text-muted-foreground italic">No users blacklisted.</p>
          </FormSection>
        )}
      </div>
    </AppLayout>
  );
};

export default Chat;
