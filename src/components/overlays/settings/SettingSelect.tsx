interface SettingSelectProps {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}

const SettingSelect = ({ value, onChange, options }: SettingSelectProps) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="text-[11px] px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-foreground font-medium focus:outline-none focus:border-primary/30 transition-colors min-w-[140px]"
  >
    {options.map(o => (
      <option key={o.value} value={o.value} className="bg-[#0a0a0f] text-foreground">{o.label}</option>
    ))}
  </select>
);

export default SettingSelect;
