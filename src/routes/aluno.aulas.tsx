import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/section-placeholder";

export const Route = createFileRoute("/aluno/aulas")({ component: Page });
function Page() {
  return (
    <SectionPlaceholder
      title="Aulas"
      subtitle="Suas próximas aulas, materiais e status das reservas."
      items={[
        { label: "Próximas aulas", description: "Veja o que está agendado para os próximos dias." },
        { label: "Histórico de aulas", description: "Tudo que você já fez, organizado por professor." },
        { label: "Detalhes da aula", description: "Pauta, materiais e link de acesso." },
        { label: "Professor responsável", description: "Perfil, avaliações e especialidades." },
        { label: "Status da reserva", description: "Confirmada, pendente, cancelada." },
        { label: "Desconto Premium", description: "Aplicado automaticamente em todas as aulas." },
      ]}
    />
  );
}