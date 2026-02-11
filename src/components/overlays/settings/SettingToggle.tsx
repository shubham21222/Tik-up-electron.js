import { Switch } from "@/components/ui/switch";

interface SettingToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
}

const SettingToggle = ({ checked, onChange }: SettingToggleProps) => (
  <Switch checked={checked} onCheckedChange={onChange} />
);

export default SettingToggle;
