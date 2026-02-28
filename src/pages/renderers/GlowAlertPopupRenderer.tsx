import { useRendererSettings } from "@/hooks/use-renderer-settings";
import GlowAlertPopupPreview from "@/components/overlays/previews/GlowAlertPopupPreview";

const defaultGlowAlertSettings = {
  transparent_bg: true,
};

const GlowAlertPopupRenderer = () => {
  useRendererSettings(defaultGlowAlertSettings, "glow-alert");

  return (
    <div style={{ width: "100vw", height: "100vh", background: "transparent", overflow: "hidden" }}>
      <GlowAlertPopupPreview />
    </div>
  );
};

export default GlowAlertPopupRenderer;
