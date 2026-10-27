import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/section-placeholder";
export const Route = createFileRoute("/professor/billing")({
  head: () => ({ meta: [{ title: "Área do professor · Ganhos — Lunari" }, { name: "description", content: "Área do professor · Ganhos na Lunari, plataforma de aprendizado de inglês com flashcards, pronúncia e aulas." }, { property: "og:title", content: "Área do professor · Ganhos — Lunari" }, { property: "og:description", content: "Área do professor · Ganhos na Lunari, plataforma de aprendizado de inglês com flashcards, pronúncia e aulas." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }), component: () => (
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