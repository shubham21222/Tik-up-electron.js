import { LucideIcon } from "lucide-react";

interface UpdateItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
  tag?: string;
}

const UpdateItem = ({ icon: Icon, title, description, tag }: UpdateItemProps) => (
  <div className="flex gap-4 p-4 rounded-lg surface-raised hover:surface-overlay transition-colors group">
    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
      <Icon size={20} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <h4 className="font-heading font-semibold text-foreground text-sm">{title}</h4>
        {tag && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary/10 text-secondary uppercase tracking-wider">
            {tag}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  </div>
);

export default UpdateItem;
