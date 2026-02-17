interface SettingSelectProps {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}

const SettingSelect = ({ value, onChange, options }: SettingSelectProps) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="text-[11px] px-3 py-1.5 rounded-lg border border-border bg-muted/50 text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-secondary/30 transition-colors min-w-[140px]"
  >
    {options.map(o => (
      <option key={o.value} value={o.value} className="bg-popover text-foreground">{o.label}</option>
    ))}
  </select>
);

export default SettingSelect;
