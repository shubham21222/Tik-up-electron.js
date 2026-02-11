import { ReactNode } from "react";

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  accent?: boolean;
}

const FormSection = ({ title, description, children, accent }: FormSectionProps) => (
  <section className="rounded-lg border border-border bg-card overflow-hidden">
    <div className="px-5 py-3.5 border-b border-border">
      <h3 className={`font-heading font-semibold text-sm ${accent ? "text-secondary" : "text-primary"}`}>{title}</h3>
      {description && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>}
    </div>
    <div className="px-5 py-4 space-y-4">{children}</div>
  </section>
);

export default FormSection;
