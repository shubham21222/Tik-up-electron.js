import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import useOverlayBody from "@/hooks/use-overlay-body";
import { applyUrlOverrides } from "@/lib/overlay-params";
import ElectricGiftAlertPreview from "@/components/overlays/previews/ElectricGiftAlertPreview";

const ElectricGiftAlertRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams<{ publicToken: string }>();
  const [_settings, setSettings] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!publicToken) return;
    supabase
      .from("overlay_widgets" as any)
      .select("*")
      .eq("public_token", publicToken)
      .single()
      .then(({ data }) => {
        if (data) setSettings(applyUrlOverrides((data as any).settings || {}));
      });
  }, [publicToken]);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "transparent", overflow: "hidden" }}>
      <ElectricGiftAlertPreview />
    </div>
  );
};

export default ElectricGiftAlertRenderer;
