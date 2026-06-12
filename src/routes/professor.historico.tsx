import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/section-placeholder";
export const Route = createFileRoute("/professor/historico")({ component: () => (
  <SectionPlaceholder title="Histórico" subtitle="Aulas concluídas, alunos atendidos e evolução."
    items={[
      { label: "Aulas concluídas", description: "Lista cronológica e duração." },
      { label: "Alunos atendidos", description: "Perfil rápido e contato." },
      { label: "Observações", description: "Notas privadas por aluno." },
      { label: "Flashcards usados", description: "Decks aplicados em cada aula." },
      { label: "Evolução dos alunos", description: "Curva de progresso por aluno." },
      { label: "Feedback", description: "Avaliações recebidas." },
    ]} />
) });