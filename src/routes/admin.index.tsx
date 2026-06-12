import { createFileRoute } from "@tanstack/react-router";
import { Users, GraduationCap, CreditCard, BarChart3 } from "lucide-react";
import { PageHeader, StatCard } from "@/components/app-shell";

export const Route = createFileRoute("/admin/")({ component: Page });
function Page() {
  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Visão geral da plataforma Lunari." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="ALUNOS" value="0" icon={Users} tone="brand" />
        <StatCard label="PROFESSORES" value="0" icon={GraduationCap} tone="success" />
        <StatCard label="ASSINATURAS ATIVAS" value="0" icon={CreditCard} tone="warning" />
        <StatCard label="RECEITA DO MÊS" value="R$ 0" icon={BarChart3} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="surface-card p-6">
          <div className="font-display text-xl font-semibold">Atividade recente</div>
          <p className="mt-2 text-sm text-muted-foreground">Sem eventos para exibir.</p>
        </div>
        <div className="surface-card p-6">
          <div className="font-display text-xl font-semibold">Saúde do sistema</div>
          <p className="mt-2 text-sm text-muted-foreground">Tudo operando normalmente.</p>
        </div>
      </div>
    </div>
  );
}