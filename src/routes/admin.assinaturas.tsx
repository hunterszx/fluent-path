import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/section-placeholder";
export const Route = createFileRoute("/admin/assinaturas")({ component: () => (
  <SectionPlaceholder title="Assinaturas" subtitle="Planos, conversões e cancelamentos."
    items={[
      { label: "Planos ativos", description: "Free vs Premium." },
      { label: "Conversão", description: "Free → Premium por período." },
      { label: "Cancelamentos", description: "Motivos e churn." },
      { label: "Descontos", description: "Cupons e campanhas." },
      { label: "Renovações", description: "Próximas cobranças." },
      { label: "Configurar planos", description: "Preço, benefícios e regras." },
    ]} />
) });