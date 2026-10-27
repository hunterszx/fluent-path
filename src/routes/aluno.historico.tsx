import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/section-placeholder";

export const Route = createFileRoute("/aluno/historico")({
  head: () => ({ meta: [{ title: "Área do aluno · Histórico — Lunari" }, { name: "description", content: "Área do aluno · Histórico na Lunari, plataforma de aprendizado de inglês com flashcards, pronúncia e aulas." }, { property: "og:title", content: "Área do aluno · Histórico — Lunari" }, { property: "og:description", content: "Área do aluno · Histórico na Lunari, plataforma de aprendizado de inglês com flashcards, pronúncia e aulas." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }), component: Page });
function Page() {
  return (
    <SectionPlaceholder
      title="Histórico"
      subtitle="Aulas anteriores, revisões e tentativas de pronúncia."
      items={[
        { label: "Aulas concluídas", description: "Lista cronológica com observações do professor." },
        { label: "Flashcards revisados", description: "Cards por dia e desempenho geral." },
        { label: "Exercícios", description: "Acertos, erros e padrões." },
        { label: "Tentativas de pronúncia", description: "Áudios anteriores e feedback da IA." },
        { label: "Evolução", description: "Linha do tempo com marcos importantes." },
        { label: "Exportar", description: "Baixe um relatório do seu progresso." },
      ]}
    />
  );
}