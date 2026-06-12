import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/section-placeholder";
export const Route = createFileRoute("/admin/aulas")({ component: () => (
  <SectionPlaceholder title="Aulas" subtitle="Acompanhe todas as aulas da plataforma."
    items={[
      { label: "Agendadas", description: "Lista das próximas aulas." },
      { label: "Concluídas", description: "Histórico de aulas finalizadas." },
      { label: "Canceladas", description: "Motivos e ressarcimentos." },
      { label: "Conflitos", description: "Detecção automática de sobreposição." },
      { label: "Avaliações", description: "Feedback dos alunos por aula." },
      { label: "Relatórios", description: "Volume de aulas por período." },
    ]} />
) });