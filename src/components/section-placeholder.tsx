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
          <div key={it.label} className="surface-card p-6 transition hover:bg-elevated">
            <div className="text-[11px] font-semibold tracking-[0.18em] text-brand-2">SEÇÃO</div>
            <div className="mt-2 font-display text-lg font-semibold">{it.label}</div>
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