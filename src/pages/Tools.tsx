import AppLayout from "@/components/AppLayout";
import { Wrench, Timer, QrCode, Calculator, Palette, Type, BarChart } from "lucide-react";

const tools = [
  { icon: Timer, title: "Stream Timer", description: "Configurable countdown or count-up timer that viewers can extend with gifts.", category: "Stream" },
  { icon: QrCode, title: "QR Code Generator", description: "Generate QR codes linking to your TikTok profile or custom URLs for on-stream display.", category: "Utility" },
  { icon: Calculator, title: "Gift Calculator", description: "Calculate the real-world value of TikTok gifts and track your earnings per stream.", category: "Analytics" },
  { icon: Palette, title: "Theme Editor", description: "Customize colors, fonts, and styles for all your overlays and widgets in one place.", category: "Design" },
  { icon: Type, title: "TTS Tester", description: "Preview how Text-to-Speech messages will sound with different voices and settings.", category: "Testing" },
  { icon: BarChart, title: "Stream Analytics", description: "View detailed analytics including viewer count, engagement rate, and gift breakdown.", category: "Analytics" },
];

const Tools = () => {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto animate-slide-in">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Wrench size={28} className="text-primary" />
            <h1 className="text-3xl font-heading font-bold text-foreground">Tools</h1>
          </div>
          <p className="text-muted-foreground">Utility tools to enhance your streaming workflow and productivity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <div
              key={tool.title}
              className="group p-5 rounded-xl border border-border bg-card hover:border-primary/20 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-primary/5 to-transparent" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <tool.icon size={20} />
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wider">
                    {tool.category}
                  </span>
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-1">{tool.title}</h3>
                <p className="text-sm text-muted-foreground">{tool.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Tools;
