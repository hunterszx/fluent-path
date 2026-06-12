import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/section-placeholder";

export const Route = createFileRoute("/aluno/historico")({ component: Page });
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