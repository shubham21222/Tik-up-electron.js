import React from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { Eye, Heart, Users, Gift } from "lucide-react";

const AnimatedCounter = ({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) => {
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => `${prefix}${Math.round(v).toLocaleString()}${suffix}`);

  useEffect(() => {
    const ctrl = animate(mv, value, { duration: 2, ease: [0.22, 1, 0.36, 1] });
    return ctrl.stop;
  }, [value, mv]);

  return <motion.span>{display}</motion.span>;
};

import GlassCard from "@/components/ui/glass-card";

export interface StatCardData {
  label: string;
  value: number;
  icon: typeof Eye;
  change: string;
  changeColor: string;
  accentColor: string;
  prefix?: string;
}

interface DashboardStatCardsProps {
  statCards: StatCardData[];
}

const DashboardStatCards = ({ statCards }: DashboardStatCardsProps) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
    {statCards.map((stat, i) => {
      const Icon = stat.icon;
      return (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 + i * 0.05 }}
        >
          <GlassCard className="p-5 hover:border-[hsl(0_0%_100%/0.08)] transition-colors group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[12px] text-muted-foreground font-medium tracking-wide uppercase">{stat.label}</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center opacity-40 group-hover:opacity-70 transition-opacity"
                style={{ background: `hsl(${stat.accentColor} / 0.1)` }}>
                <Icon size={14} style={{ color: `hsl(${stat.accentColor})` }} />
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-1">
              <AnimatedCounter value={stat.value} prefix={stat.prefix} />
            </p>
            <span className="text-[11px] font-semibold" style={{ color: stat.changeColor }}>
              {stat.change}
            </span>
          </GlassCard>
        </motion.div>
      );
    })}
  </div>
);

export default DashboardStatCards;
