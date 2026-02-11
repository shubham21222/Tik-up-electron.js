import { Slider } from "@/components/ui/slider";

interface SettingSliderProps {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
}

const SettingSlider = ({ value, onChange, min, max, step = 1, suffix = "" }: SettingSliderProps) => (
  <div className="flex items-center gap-3 min-w-[180px]">
    <Slider
      value={[value]}
      onValueChange={([v]) => onChange(v)}
      min={min}
      max={max}
      step={step}
      className="flex-1"
    />
    <span className="text-[11px] font-mono text-muted-foreground w-12 text-right">{value}{suffix}</span>
  </div>
);

export default SettingSlider;
