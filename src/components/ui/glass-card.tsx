import React from "react";

const GlassCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className = "", ...rest }, ref) => (
    <div ref={ref} className={`glass-card ${className}`} {...rest}>
      {children}
    </div>
  )
);

GlassCard.displayName = "GlassCard";

export default GlassCard;
