import { Crown } from "lucide-react";
import { motion } from "framer-motion";

interface ProBadgeProps {
  size?: "sm" | "md";
}

const ProBadge = ({ size = "sm" }: ProBadgeProps) => {
  const isSmall = size === "sm";
  return (
    <motion.span
      className={`inline-flex items-center gap-1 font-bold rounded-md ${
        isSmall
          ? "text-[9px] px-1.5 py-0.5"
          : "text-[11px] px-2 py-1"
      }`}
      style={{
        background: "linear-gradient(135deg, hsl(280 100% 65% / 0.15), hsl(280 100% 55% / 0.08))",
        color: "hsl(280 100% 70%)",
        border: "1px solid hsl(280 100% 65% / 0.2)",
        boxShadow: "0 0 12px hsl(280 100% 65% / 0.1)",
      }}
      whileHover={{ boxShadow: "0 0 20px hsl(280 100% 65% / 0.2)" }}
    >
      <Crown size={isSmall ? 9 : 12} />
      PRO
    </motion.span>
  );
};

export default ProBadge;
