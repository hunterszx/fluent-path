import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/section-placeholder";

export const Route = createFileRoute("/aluno/perfil")({
  head: () => ({ meta: [{ title: "Área do aluno · Perfil — Lunari" }, { name: "description", content: "Área do aluno · Perfil na Lunari, plataforma de aprendizado de inglês com flashcards, pronúncia e aulas." }, { property: "og:title", content: "Área do aluno · Perfil — Lunari" }, { property: "og:description", content: "Área do aluno · Perfil na Lunari, plataforma de aprendizado de inglês com flashcards, pronúncia e aulas." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }), component: Page });
function Page() {
  return (
    <SectionPlaceholder
      title="Perfil"
      subtitle="Preferências, idioma, notificações e assinatura."
      items={[
        { label: "Dados pessoais", description: "Nome, foto, e-mail e senha." },
        { label: "Idioma e nível", description: "Defina seu nível e meta de aprendizado." },
        { label: "Notificações", description: "E-mail, push e lembretes diários." },
        { label: "Assinatura", description: "Plano atual, faturas e gestão do Premium." },
        { label: "Privacidade", description: "Visibilidade do perfil e dados." },
        { label: "Segurança", description: "Sessões ativas e autenticação." },
      ]}
    />
  );
}