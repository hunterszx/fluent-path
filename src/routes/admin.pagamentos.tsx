import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/section-placeholder";
export const Route = createFileRoute("/admin/pagamentos")({
  head: () => ({ meta: [{ title: "Administração · Pagamentos — Lunari" }, { name: "description", content: "Administração · Pagamentos na Lunari, plataforma de aprendizado de inglês com flashcards, pronúncia e aulas." }, { property: "og:title", content: "Administração · Pagamentos — Lunari" }, { property: "og:description", content: "Administração · Pagamentos na Lunari, plataforma de aprendizado de inglês com flashcards, pronúncia e aulas." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }), component: () => (
  <SectionPlaceholder title="Pagamentos" subtitle="Receita, faturas e repasses."
    items={[
      { label: "Receita", description: "Total recebido por período." },
      { label: "Faturas", description: "Status de cada cobrança." },
      { label: "Repasses", description: "Pagamentos aos professores." },
      { label: "Reembolsos", description: "Solicitações e processamento." },
      { label: "Gateway", description: "Conexão com provedor de pagamento." },
      { label: "Relatórios fiscais", description: "Exportação contábil." },
    ]} />
) });