import { useState } from "react";
import { HelpCircle } from "lucide-react";
import FeatureGuideModal from "@/components/FeatureGuideModal";
import { featureGuides } from "@/data/feature-guides";

interface PageHelpButtonProps {
  featureKey: string;
  title?: string;
}

const PageHelpButton = ({ featureKey, title }: PageHelpButtonProps) => {
  const [open, setOpen] = useState(false);
  const guide = featureGuides[featureKey];

  if (!guide) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-full transition-all duration-200 hover:scale-110"
        style={{
          background: "linear-gradient(135deg, hsl(280 100% 65% / 0.12), hsl(280 100% 55% / 0.06))",
          border: "1px solid hsl(280 100% 65% / 0.2)",
          color: "hsl(280 100% 70%)",
        }}
        title="How to use this feature"
      >
        <HelpCircle size={16} />
      </button>
      <FeatureGuideModal
        open={open}
        onClose={() => setOpen(false)}
        featureKey={featureKey}
        title={title || guide.title}
        steps={guide.steps}
      />
    </>
  );
};

export default PageHelpButton;
