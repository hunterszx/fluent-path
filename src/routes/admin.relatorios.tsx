import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/section-placeholder";
export const Route = createFileRoute("/admin/relatorios")({ component: () => (
  <SectionPlaceholder title="Relatórios" subtitle="Métricas e exportações."
    items={[
      { label: "Crescimento", description: "Cadastros e ativações." },
      { label: "Engajamento", description: "Sessões e tempo de estudo." },
      { label: "Receita", description: "MRR, ARPU e churn." },
      { label: "Conteúdo", description: "Decks e cards mais usados." },
      { label: "Aulas", description: "Volume e satisfação." },
      { label: "Exportar", description: "CSV e PDF." },
    ]} />
) });