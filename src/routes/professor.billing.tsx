import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/section-placeholder";
export const Route = createFileRoute("/professor/billing")({ component: () => (
  <SectionPlaceholder title="Billing" subtitle="Ganhos, repasses e histórico financeiro."
    items={[
      { label: "Ganhos", description: "Total recebido por período." },
      { label: "Aulas pagas", description: "Aulas confirmadas e faturadas." },
      { label: "Repasses", description: "Status dos pagamentos para você." },
      { label: "Histórico financeiro", description: "Extrato completo." },
      { label: "Status de pagamento", description: "Pendente, pago, em processamento." },
      { label: "Relatórios", description: "Exporte para o seu contador." },
    ]} />
) });