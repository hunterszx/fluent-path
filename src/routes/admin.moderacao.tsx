import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/section-placeholder";
export const Route = createFileRoute("/admin/moderacao")({
  head: () => ({ meta: [{ title: "Administração · Moderação — Lunari" }, { name: "description", content: "Administração · Moderação na Lunari, plataforma de aprendizado de inglês com flashcards, pronúncia e aulas." }, { property: "og:title", content: "Administração · Moderação — Lunari" }, { property: "og:description", content: "Administração · Moderação na Lunari, plataforma de aprendizado de inglês com flashcards, pronúncia e aulas." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }), component: () => (
  <SectionPlaceholder title="Moderação" subtitle="Denúncias, conteúdo e segurança."
    items={[
      { label: "Denúncias", description: "Fila com prioridade." },
      { label: "Conteúdo sinalizado", description: "Cards e mensagens reportadas." },
      { label: "Regras", description: "Políticas da plataforma." },
      { label: "Banimentos", description: "Histórico de ações." },
      { label: "Apelos", description: "Pedidos de revisão." },
      { label: "Logs", description: "Auditoria de ações dos admins." },
    ]} />
) });