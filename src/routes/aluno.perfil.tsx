import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/section-placeholder";

export const Route = createFileRoute("/aluno/perfil")({ component: Page });
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