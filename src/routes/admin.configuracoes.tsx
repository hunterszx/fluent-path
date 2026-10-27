import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/section-placeholder";
export const Route = createFileRoute("/admin/configuracoes")({
  head: () => ({ meta: [{ title: "Administração · Configurações — Lunari" }, { name: "description", content: "Administração · Configurações na Lunari, plataforma de aprendizado de inglês com flashcards, pronúncia e aulas." }, { property: "og:title", content: "Administração · Configurações — Lunari" }, { property: "og:description", content: "Administração · Configurações na Lunari, plataforma de aprendizado de inglês com flashcards, pronúncia e aulas." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }), component: () => (
  <SectionPlaceholder title="Configurações" subtitle="Ajustes gerais da plataforma."
    items={[
      { label: "Identidade", description: "Logo, nome e cores." },
      { label: "E-mail", description: "Provedor e templates." },
      { label: "IA", description: "Modelos e limites por plano." },
      { label: "Pagamentos", description: "Provedor e taxas." },
      { label: "Armazenamento", description: "Áudios e materiais." },
      { label: "Permissões", description: "Papéis e acessos do time." },
    ]} />
) });