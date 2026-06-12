import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/section-placeholder";

export const Route = createFileRoute("/aluno/flashcards")({ component: Page });
function Page() {
  return (
    <SectionPlaceholder
      title="Flashcards"
      subtitle="Revise com repetição espaçada e treine pronúncia com IA."
      items={[
        { label: "Decks da plataforma", description: "Curadoria oficial Lunari para acelerar seu progresso." },
        { label: "Decks dos professores", description: "Cards personalizados enviados pelos seus professores." },
        { label: "Favoritos", description: "Sua biblioteca pessoal de cards salvos." },
        { label: "Sessão de revisão", description: "Novo · Em estudo · Difícil · Dominado." },
        { label: "Pronúncia por IA", description: "Ouça a palavra e receba feedback ao gravar a sua." },
        { label: "Histórico", description: "Acompanhe sua evolução em cada deck." },
      ]}
    />
  );
}