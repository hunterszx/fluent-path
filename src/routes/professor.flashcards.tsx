import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/section-placeholder";
export const Route = createFileRoute("/professor/flashcards")({ component: () => (
  <SectionPlaceholder title="Flashcards" subtitle="Crie cards e decks diretamente na plataforma."
    items={[
      { label: "Criar flashcard", description: "Palavra, tradução, exemplo, categoria e áudio." },
      { label: "Criar deck", description: "Organize por tema, aula ou aluno." },
      { label: "Compartilhar com aluno", description: "Envie um deck para um aluno específico." },
      { label: "Reutilizar", description: "Aproveite decks em outras turmas." },
      { label: "Dificuldades do aluno", description: "Veja onde cada aluno tem mais erros." },
      { label: "Áudio", description: "Anexe pronúncia gravada ou gerada por IA." },
    ]} />
) });