import AppLayout from "@/components/AppLayout";
import { motion } from "framer-motion";
import {
  Link2, Webhook, Globe, Gamepad2, Music, Bot, CheckCircle2, Circle
} from "lucide-react";

const glassCard = "rounded-2xl p-[1px]";
const glassGradient = { background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" };
const glassInner = "rounded-2xl h-full transition-shadow duration-300 group-hover:shadow-[0_0_30px_hsl(160_100%_45%/0.06)]";
const glassInnerStyle = { background: "rgba(20,25,35,0.65)", backdropFilter: "blur(20px)" };

const integrations = [
  { icon: Gamepad2, name: "OBS Studio", desc: "Browser source integration for all overlays", connected: true, color: "160 100% 45%" },
  { icon: Webhook, name: "Webhooks", desc: "Send events to external services via HTTP", connected: true, color: "200 100% 55%" },
  { icon: Bot, name: "Discord Bot", desc: "Post stream notifications to your Discord server", connected: false, color: "235 86% 65%" },
  { icon: Music, name: "Spotify", desc: "Display currently playing song on stream", connected: false, color: "141 73% 42%" },
  { icon: Globe, name: "StreamElements", desc: "Import alerts and overlays from StreamElements", connected: false, color: "45 100% 55%" },
  { icon: Link2, name: "Custom API", desc: "Connect any external API with custom endpoints", connected: false, color: "280 100% 65%" },
];

const Integrations = () => (
  <AppLayout>
    <div className="fixed top-20 left-1/2 -translate-x-1/4 w-[500px] h-[300px] rounded-full pointer-events-none z-0"
      style={{ background: "radial-gradient(ellipse, hsl(200 100% 55% / 0.03), transparent 70%)" }} />

    <div className="max-w-6xl mx-auto relative z-10 pb-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Integrations</h1>
        <p className="text-muted-foreground text-sm">Connect third-party services and extend TikUp's functionality.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {integrations.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div key={item.name}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className={`${glassCard} group`} style={glassGradient}
            >
              <div className={glassInner} style={glassInnerStyle}>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `hsl(${item.color} / 0.1)` }}>
                        <Icon size={20} style={{ color: `hsl(${item.color})` }} />
                      </div>
                      <div>
                        <h3 className="text-sm font-heading font-bold text-foreground">{item.name}</h3>
                        <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                    {item.connected ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-primary"><CheckCircle2 size={12} /> Connected</span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground"><Circle size={12} /> Not connected</span>
                    )}
                  </div>

                  <button className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
                    item.connected
                      ? "border border-border/60 text-muted-foreground hover:text-foreground"
                      : "bg-primary/10 text-primary hover:bg-primary/15"
                  }`}>
                    {item.connected ? "Manage" : "Connect"}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  </AppLayout>
);

export default Integrations;
