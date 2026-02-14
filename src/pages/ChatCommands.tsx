import AppLayout from "@/components/AppLayout";
import { motion } from "framer-motion";
import { Terminal, Lock } from "lucide-react";

const ChatCommands = () => (
  <AppLayout>
    <div className="flex items-center justify-center h-[70vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: "hsl(160 100% 45% / 0.08)", border: "1px solid hsl(160 100% 45% / 0.15)" }}>
          <Terminal size={28} className="text-primary" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold mb-4" style={{ background: "hsl(280 100% 65% / 0.12)", color: "hsl(280 100% 75%)" }}>
          <Lock size={10} /> Coming Soon
        </div>
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">Chat Commands</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Create custom commands that viewers can trigger in your TikTok LIVE chat. This feature is currently under development.
        </p>
      </motion.div>
    </div>
  </AppLayout>
);

export default ChatCommands;
