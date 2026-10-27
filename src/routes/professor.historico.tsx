import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/section-placeholder";
export const Route = createFileRoute("/professor/historico")({
  head: () => ({ meta: [{ title: "Área do professor · Histórico — Lunari" }, { name: "description", content: "Área do professor · Histórico na Lunari, plataforma de aprendizado de inglês com flashcards, pronúncia e aulas." }, { property: "og:title", content: "Área do professor · Histórico — Lunari" }, { property: "og:description", content: "Área do professor · Histórico na Lunari, plataforma de aprendizado de inglês com flashcards, pronúncia e aulas." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }), component: () => (
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