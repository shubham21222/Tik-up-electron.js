import AppLayout from "@/components/AppLayout";
import { Settings, Wifi, MonitorSmartphone, Key, Globe, Shield, Bell as BellIcon } from "lucide-react";

const settingSections = [
  {
    icon: Wifi,
    title: "TikTok LIVE Connection",
    description: "Connect your TikTok account to enable live stream interactions. Enter your TikTok username and start receiving events.",
    status: "Not Connected",
  },
  {
    icon: MonitorSmartphone,
    title: "Streaming Software",
    description: "Configure your streaming software integration. Supports OBS Studio, TikTok LIVE Studio, and Streamlabs.",
    status: "Not Configured",
  },
  {
    icon: Key,
    title: "API Keys",
    description: "Manage your API keys for third-party integrations including Voicemod, Streamer.bot, and more.",
    status: "0 Keys",
  },
  {
    icon: Globe,
    title: "Language & Region",
    description: "Set your preferred language, region, and time zone for accurate stream analytics.",
    status: "English",
  },
  {
    icon: Shield,
    title: "Moderation",
    description: "Configure auto-moderation rules, word filters, and user blacklists to keep your chat clean.",
    status: "Disabled",
  },
  {
    icon: BellIcon,
    title: "Notifications",
    description: "Choose which events trigger desktop notifications during your live stream.",
    status: "All On",
  },
];

const Setup = () => {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto animate-slide-in">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings size={28} className="text-primary" />
            <h1 className="text-3xl font-heading font-bold text-foreground">Setup</h1>
          </div>
          <p className="text-muted-foreground">Configure your TikUp environment and connect your accounts.</p>
        </div>

        <div className="space-y-3">
          {settingSections.map((section) => (
            <div
              key={section.title}
              className="flex items-center gap-5 p-5 rounded-xl border border-border bg-card hover:border-primary/20 transition-all cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                <section.icon size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-semibold text-foreground mb-0.5">{section.title}</h3>
                <p className="text-sm text-muted-foreground">{section.description}</p>
              </div>
              <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-muted text-muted-foreground flex-shrink-0">
                {section.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Setup;
