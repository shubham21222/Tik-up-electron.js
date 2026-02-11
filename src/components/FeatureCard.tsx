import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient?: "primary" | "accent";
}

const FeatureCard = ({ icon: Icon, title, description, gradient = "primary" }: FeatureCardProps) => (
  <div className={cn(
    "group relative rounded-xl border border-border p-5 transition-all duration-300 hover:border-primary/30 cursor-pointer overflow-hidden",
    "bg-card hover:glow-primary"
  )}>
    <div className={cn(
      "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
      gradient === "primary"
        ? "bg-gradient-to-br from-primary/5 to-transparent"
        : "bg-gradient-to-br from-secondary/5 to-transparent"
    )} />
    <div className="relative z-10">
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors",
        gradient === "primary"
          ? "bg-primary/10 text-primary"
          : "bg-secondary/10 text-secondary"
      )}>
        <Icon size={20} />
      </div>
      <h3 className="font-heading font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  </div>
);

export default FeatureCard;
