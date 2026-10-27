import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/section-placeholder";
export const Route = createFileRoute("/admin/assinaturas")({
  head: () => ({ meta: [{ title: "Administração · Assinaturas — Lunari" }, { name: "description", content: "Administração · Assinaturas na Lunari, plataforma de aprendizado de inglês com flashcards, pronúncia e aulas." }, { property: "og:title", content: "Administração · Assinaturas — Lunari" }, { property: "og:description", content: "Administração · Assinaturas na Lunari, plataforma de aprendizado de inglês com flashcards, pronúncia e aulas." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }), component: () => (
  <SectionPlaceholder title="Assinaturas" subtitle="Planos, conversões e cancelamentos."
    items={[
      { label: "Planos ativos", description: "Free vs Premium." },
      { label: "Conversão", description: "Free → Premium por período." },
      { label: "Cancelamentos", description: "Motivos e churn." },
      { label: "Descontos", description: "Cupons e campanhas." },
      { label: "Renovações", description: "Próximas cobranças." },
      { label: "Configurar planos", description: "Preço, benefícios e regras." },
    ]} />
) });