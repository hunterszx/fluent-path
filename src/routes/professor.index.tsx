import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Users, Bell, Wallet } from "lucide-react";
import { PageHeader, StatCard } from "@/components/app-shell";

export const Route = createFileRoute("/professor/")({ component: Page });
function Page() {
  return (
    <div>
      <PageHeader title="Painel do professor" subtitle="Aulas do dia, próximos alunos e seus ganhos." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="AULAS HOJE" value="0" icon={Calendar} tone="brand" />
        <StatCard label="PRÓXIMOS ALUNOS" value="0" icon={Users} tone="success" />
        <StatCard label="NOTIFICAÇÕES" value="0" icon={Bell} tone="warning" />
        <StatCard label="GANHOS DO MÊS" value="R$ 0" icon={Wallet} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Link
          to="/professor/agenda"
          className="surface-card group block cursor-pointer p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <div className="font-display text-xl font-semibold transition-colors group-hover:text-primary">Agenda resumida</div>
          <p className="mt-2 text-sm text-muted-foreground">Sem aulas para hoje. Atualize sua disponibilidade na Agenda.</p>
        </Link>
        <Link
          to="/professor/agenda"
          className="surface-card group block cursor-pointer p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <div className="font-display text-xl font-semibold transition-colors group-hover:text-primary">Aulas em aberto</div>
          <p className="mt-2 text-sm text-muted-foreground">Nenhuma solicitação pendente no momento.</p>
        </Link>
      </div>
    </div>
  );
}