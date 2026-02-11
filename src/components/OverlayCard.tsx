import { cn } from "@/lib/utils";
import { Copy, Pencil, Trash2, ExternalLink } from "lucide-react";

interface OverlayCardProps {
  title: string;
  description: string;
  hasPreview?: boolean;
  url?: string;
}

const OverlayCard = ({ title, description, hasPreview = true, url }: OverlayCardProps) => {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <h3 className="font-heading font-semibold text-sm text-primary">{title}</h3>
        <div className="flex items-center gap-1">
          {url && (
            <button className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Copy URL">
              <Copy size={13} />
            </button>
          )}
          <button className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Edit">
            <Pencil size={13} />
          </button>
          <button className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-destructive" title="Delete">
            <Trash2 size={13} />
          </button>
          <button className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-primary" title="Open">
            <ExternalLink size={13} />
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="px-4 py-2 border-b border-border">
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>

      {/* Preview area */}
      {hasPreview && (
        <div className="aspect-video bg-[hsl(270,60%,25%)] relative flex items-center justify-center">
          <span className="text-xs text-muted-foreground/50 italic">Preview Area</span>
        </div>
      )}
    </div>
  );
};

export default OverlayCard;
