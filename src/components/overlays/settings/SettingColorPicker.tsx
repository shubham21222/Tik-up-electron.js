import { useCallback, useRef } from "react";

/* ── HSL string ↔ hex helpers ── */

function hslToHex(hslStr: string): string {
  const parts = hslStr.match(/[\d.]+/g);
  if (!parts || parts.length < 3) return "#00ffaa";
  let h = parseFloat(parts[0]);
  let s = parseFloat(parts[1]) / 100;
  let l = parseFloat(parts[2]) / 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex: string): string {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
      case g: h = ((b - r) / d + 2) * 60; break;
      case b: h = ((r - g) / d + 4) * 60; break;
    }
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

interface SettingColorPickerProps {
  value: string;           // HSL string like "160 100% 45%"
  onChange: (v: string) => void;
}

const SettingColorPicker = ({ value, onChange }: SettingColorPickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const hex = hslToHex(value);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(hexToHsl(e.target.value));
    },
    [onChange],
  );

  return (
    <div className="flex items-center gap-2.5 min-w-[140px]">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-7 h-7 rounded-lg border border-border cursor-pointer transition-shadow hover:shadow-md flex-shrink-0"
        style={{ background: hex }}
        title={value}
      />
      <input
        ref={inputRef}
        type="color"
        value={hex}
        onChange={handleChange}
        className="sr-only"
      />
      <span className="text-[10px] font-mono text-muted-foreground select-all">{hex}</span>
    </div>
  );
};

export default SettingColorPicker;
