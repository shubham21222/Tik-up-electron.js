import { Copy } from "lucide-react";
import { toast } from "sonner";

const GoalOBSInstructions = ({ url: _url }: { url: string }) => {
  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  return (
    <div className="space-y-4 px-1">
      {/* OBS */}
      <div>
        <h4 className="text-xs font-heading font-bold text-foreground mb-2">OBS Studio</h4>
        <ol className="text-[11px] text-muted-foreground space-y-1.5 list-decimal list-inside">
          <li>Add a <strong className="text-foreground">Browser Source</strong></li>
          <li>Paste the URL below</li>
          <li>Set Width: <button onClick={() => copy("1920")} className="inline-flex items-center gap-0.5 text-primary hover:underline">1920 <Copy size={9} /></button>, Height: <button onClick={() => copy("300")} className="inline-flex items-center gap-0.5 text-primary hover:underline">300 <Copy size={9} /></button></li>
          <li>Enable <strong className="text-foreground">Hardware Acceleration</strong></li>
        </ol>
      </div>

      {/* TikTok Live Studio */}
      <div>
        <h4 className="text-xs font-heading font-bold text-foreground mb-2">TikTok Live Studio</h4>
        <ol className="text-[11px] text-muted-foreground space-y-1.5 list-decimal list-inside">
          <li>Click <strong className="text-foreground">Add Web Overlay</strong></li>
          <li>Paste the URL</li>
          <li>Resize the layer to fit</li>
          <li>Lock position</li>
        </ol>
      </div>

      {/* Presets */}
      <div>
        <h4 className="text-xs font-heading font-bold text-foreground mb-2">Resolution Presets</h4>
        <div className="flex flex-wrap gap-2">
          {["1920×300", "1280×200", "800×150", "1080×1920"].map(preset => (
            <button key={preset} onClick={() => copy(preset)}
              className="px-2.5 py-1 rounded-lg bg-muted/30 text-[10px] font-mono text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center gap-1">
              {preset} <Copy size={9} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GoalOBSInstructions;
