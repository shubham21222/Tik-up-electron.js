import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import useOverlayBody from "@/hooks/use-overlay-body";
import { applyUrlOverrides } from "@/lib/overlay-params";
import CircularProfileWidgetPreview from "@/components/overlays/previews/CircularProfileWidgetPreview";

const CircularProfileWidgetRenderer = () => {
  useOverlayBody();
  const { publicToken } = useParams<{ publicToken: string }>();
  const [settings, setSettings] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!publicToken) return;
    supabase.from("overlay_widgets" as any).select("*").eq("public_token", publicToken).single().then(({ data }) => {
      if (data) setSettings(applyUrlOverrides((data as any).settings || {}));
    });
  }, [publicToken]);

  void settings;
  return (
    <div style={{ width: "100vw", height: "100vh", background: "transparent", overflow: "hidden" }}>
      <CircularProfileWidgetPreview />
    </div>
  );
};

export default CircularProfileWidgetRenderer;
