import AppLayout from "@/components/AppLayout";
import FormSection from "@/components/FormSection";
import FormField from "@/components/FormField";
import TabNav from "@/components/TabNav";
import { TrendingUp, Gift, Crown, Star, Plus } from "lucide-react";
import { useState } from "react";

const topViewers = [
  { rank: 1, name: "GiftKing", points: 12500, icon: Crown },
  { rank: 2, name: "StreamLover99", points: 8200, icon: Star },
  { rank: 3, name: "TikTokPro", points: 6800, icon: Star },
  { rank: 4, name: "CoolViewer42", points: 3200, icon: null },
  { rank: 5, name: "NewFan2025", points: 1500, icon: null },
  { rank: 6, name: "VibeCheck", points: 900, icon: null },
  { rank: 7, name: "WatcherX", points: 700, icon: null },
  { rank: 8, name: "Supporter99", points: 550, icon: null },
];

const rewards = [
  { name: "Custom TTS Voice", cost: 500, claimed: 12 },
  { name: "Song Request", cost: 1000, claimed: 8 },
  { name: "Choose Game Mode", cost: 2500, claimed: 3 },
  { name: "VIP Badge", cost: 5000, claimed: 1 },
  { name: "Shoutout on Stream", cost: 750, claimed: 6 },
  { name: "Pick Next Challenge", cost: 3000, claimed: 2 },
];

const pointHistory = [
  { user: "GiftKing", action: "Sent Rose", points: "+50", time: "2m ago" },
  { user: "StreamLover99", action: "Watch bonus", points: "+10", time: "5m ago" },
  { user: "CoolViewer42", action: "Redeemed Song Request", points: "-1000", time: "8m ago" },
  { user: "TikTokPro", action: "Sent Lion", points: "+500", time: "12m ago" },
  { user: "NewFan2025", action: "Follow bonus", points: "+25", time: "15m ago" },
];

const tabs = ["Leaderboard", "Rewards", "Points Settings", "History"];

const Points = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto animate-slide-in pb-12">
        <TabNav
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          rightAction={
            activeTab === "Rewards" ? (
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 transition-opacity">
                <Plus size={14} /> Add Reward
              </button>
            ) : undefined
          }
        />

        {activeTab === "Leaderboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border flex items-center gap-2">
                <TrendingUp size={16} className="text-primary" />
                <h3 className="font-heading font-semibold text-sm text-primary">Top Viewers</h3>
              </div>
              {topViewers.map((viewer) => (
                <div key={viewer.rank} className="flex items-center gap-4 px-5 py-3 border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <span className={`text-base font-heading font-bold w-8 ${viewer.rank <= 3 ? 'text-primary' : 'text-muted-foreground'}`}>#{viewer.rank}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="font-medium text-sm text-foreground">{viewer.name}</span>
                    {viewer.icon && <viewer.icon size={14} className="text-secondary" />}
                  </div>
                  <span className="text-sm font-semibold text-primary">{viewer.points.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border flex items-center gap-2">
                <Gift size={16} className="text-secondary" />
                <h3 className="font-heading font-semibold text-sm text-secondary">Rewards</h3>
              </div>
              {rewards.map((reward) => (
                <div key={reward.name} className="flex items-center gap-4 px-5 py-3 border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <div className="flex-1">
                    <span className="font-medium text-sm text-foreground">{reward.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">({reward.claimed}x claimed)</span>
                  </div>
                  <span className="text-sm font-semibold text-primary">{reward.cost} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Rewards" && (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center gap-2">
              <Gift size={16} className="text-secondary" />
              <h3 className="font-heading font-semibold text-sm text-secondary">Manage Rewards</h3>
            </div>
            {rewards.map((reward) => (
              <div key={reward.name} className="flex items-center gap-4 px-5 py-3 border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <div className="flex-1">
                  <span className="font-medium text-sm text-foreground">{reward.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">({reward.claimed}x claimed)</span>
                </div>
                <span className="text-sm font-semibold text-primary">{reward.cost} pts</span>
                <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">Edit</button>
                <button className="text-xs text-destructive hover:text-destructive/80 transition-colors">Delete</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Points Settings" && (
          <FormSection title="Points Configuration">
            <FormField label="Points per minute" type="number" value="1" />
            <FormField label="Gift multiplier" type="number" value="10" />
            <FormField label="Subscriber bonus" type="toggle" checked={true} />
            <FormField label="Bonus multiplier" type="select" options={["1.5x", "2x", "3x"]} />
            <FormField label="Points for follow" type="number" value="25" />
            <FormField label="Points for share" type="number" value="50" />
          </FormSection>
        )}

        {activeTab === "History" && (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
              <h3 className="font-heading font-semibold text-sm text-primary">Recent Points Activity</h3>
            </div>
            {pointHistory.map((entry, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3 border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <span className="text-sm font-semibold text-foreground w-28">{entry.user}</span>
                <span className="flex-1 text-sm text-muted-foreground">{entry.action}</span>
                <span className={`text-sm font-semibold ${entry.points.startsWith("+") ? "text-primary" : "text-destructive"}`}>{entry.points}</span>
                <span className="text-xs text-muted-foreground w-16 text-right">{entry.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Points;
