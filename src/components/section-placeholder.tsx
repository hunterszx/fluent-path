import type { ReactNode } from "react";
import { PageHeader } from "./app-shell";

export function SectionPlaceholder({
  title,
  subtitle,
  items,
  cta,
}: {
  title: string;
  subtitle?: string;
  items: { label: string; description: string }[];
  cta?: ReactNode;
}) {
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} actions={cta} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((it) => (
          <div
            key={it.label}
            role="button"
            tabIndex={0}
            className="surface-card group cursor-pointer p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-elevated hover:shadow-lg hover:shadow-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 active:translate-y-0 active:scale-[0.99]"
          >
            <div className="text-[11px] font-semibold tracking-[0.18em] text-brand-2">SEÇÃO</div>
            <div className="mt-2 font-display text-lg font-semibold transition-colors group-hover:text-primary">{it.label}</div>
            <p className="mt-2 text-sm text-muted-foreground">{it.description}</p>
          </div>
        ))}
      </div>
      <div className="surface-elevated mt-6 p-6 text-sm text-muted-foreground">
        Esta área está pronta para receber os dados reais quando você ativar o backend (Lovable Cloud). A estrutura, navegação e visual já estão prontos.
      </div>
    </div>
  );
}