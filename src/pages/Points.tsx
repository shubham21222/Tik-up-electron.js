import AppLayout from "@/components/AppLayout";
import { Trophy, Plus, Gift, Star, Crown, TrendingUp } from "lucide-react";

const topViewers = [
  { rank: 1, name: "GiftKing", points: 12500, icon: Crown },
  { rank: 2, name: "StreamLover99", points: 8200, icon: Star },
  { rank: 3, name: "TikTokPro", points: 6800, icon: Star },
  { rank: 4, name: "CoolViewer42", points: 3200, icon: null },
  { rank: 5, name: "NewFan2025", points: 1500, icon: null },
];

const rewards = [
  { name: "Custom TTS Voice", cost: 500, claimed: 12 },
  { name: "Song Request", cost: 1000, claimed: 8 },
  { name: "Choose Game Mode", cost: 2500, claimed: 3 },
  { name: "VIP Badge", cost: 5000, claimed: 1 },
];

const Points = () => {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto animate-slide-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Trophy size={28} className="text-primary" />
              <h1 className="text-3xl font-heading font-bold text-foreground">Points System</h1>
            </div>
            <p className="text-muted-foreground">Reward loyal viewers with points they can redeem for special perks.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
            <Plus size={16} />
            Add Reward
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leaderboard */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-primary" />
              <h2 className="text-lg font-heading font-semibold text-foreground">Leaderboard</h2>
            </div>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {topViewers.map((viewer) => (
                <div
                  key={viewer.rank}
                  className="flex items-center gap-4 px-5 py-3.5 border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <span className={`text-lg font-heading font-bold w-8 ${viewer.rank <= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                    #{viewer.rank}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground">{viewer.name}</span>
                      {viewer.icon && <viewer.icon size={14} className="text-secondary" />}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-primary">{viewer.points.toLocaleString()} pts</span>
                </div>
              ))}
            </div>
          </section>

          {/* Rewards */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Gift size={18} className="text-secondary" />
              <h2 className="text-lg font-heading font-semibold text-foreground">Rewards</h2>
            </div>
            <div className="space-y-3">
              {rewards.map((reward) => (
                <div
                  key={reward.name}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/20 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0">
                    <Gift size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold text-foreground text-sm">{reward.name}</h3>
                    <p className="text-xs text-muted-foreground">{reward.claimed} times claimed</p>
                  </div>
                  <span className="text-sm font-semibold text-primary">{reward.cost} pts</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
};

export default Points;
