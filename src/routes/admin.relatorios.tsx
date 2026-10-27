import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/section-placeholder";
export const Route = createFileRoute("/admin/relatorios")({
  head: () => ({ meta: [{ title: "Administração · Relatórios — Lunari" }, { name: "description", content: "Administração · Relatórios na Lunari, plataforma de aprendizado de inglês com flashcards, pronúncia e aulas." }, { property: "og:title", content: "Administração · Relatórios — Lunari" }, { property: "og:description", content: "Administração · Relatórios na Lunari, plataforma de aprendizado de inglês com flashcards, pronúncia e aulas." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }), component: () => (
  <SectionPlaceholder title="Relatórios" subtitle="Métricas e exportações."
    items={[
      { label: "Crescimento", description: "Cadastros e ativações." },
      { label: "Engajamento", description: "Sessões e tempo de estudo." },
      { label: "Receita", description: "MRR, ARPU e churn." },
      { label: "Conteúdo", description: "Decks e cards mais usados." },
      { label: "Aulas", description: "Volume e satisfação." },
      { label: "Exportar", description: "CSV e PDF." },
    ]} />
) });