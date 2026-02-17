import { Crown } from "lucide-react";
import { motion } from "framer-motion";

interface ProBadgeProps {
  size?: "sm" | "md";
}

const ProBadge = ({ size = "sm" }: ProBadgeProps) => {
  const isSmall = size === "sm";
  return (
    <motion.span
      className={`pro-badge-overlay inline-flex items-center gap-1 font-bold rounded-md ${
        isSmall
          ? "text-[9px] px-1.5 py-0.5"
          : "text-[11px] px-2 py-1"
      }`}
      whileHover={{ scale: 1.05 }}
    >
      <Crown size={isSmall ? 9 : 12} />
      PRO
    </motion.span>
  );
};

export default ProBadge;
