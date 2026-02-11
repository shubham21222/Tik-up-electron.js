import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  type?: "text" | "number" | "select" | "toggle" | "password";
  value?: string;
  placeholder?: string;
  options?: string[];
  checked?: boolean;
  className?: string;
}

const FormField = ({ label, type = "text", value = "", placeholder, options, checked, className }: FormFieldProps) => {
  if (type === "toggle") {
    return (
      <div className={cn("flex items-center justify-between", className)}>
        <span className="text-sm text-foreground">{label}</span>
        <div className={`w-10 h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors ${checked ? 'bg-primary justify-end' : 'bg-muted justify-start'}`}>
          <div className={`w-4 h-4 rounded-full transition-colors ${checked ? 'bg-primary-foreground' : 'bg-muted-foreground'}`} />
        </div>
      </div>
    );
  }

  if (type === "select") {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        <label className="text-sm text-foreground min-w-[140px] shrink-0">{label}</label>
        <select className="flex-1 bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary">
          {options?.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <label className="text-sm text-foreground min-w-[140px] shrink-0">{label}</label>
      <input
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        className="flex-1 bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  );
};

export default FormField;
