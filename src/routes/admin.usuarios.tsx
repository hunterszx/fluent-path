import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/section-placeholder";
export const Route = createFileRoute("/admin/usuarios")({ component: () => (
  <SectionPlaceholder title="Usuários" subtitle="Gerencie alunos e contas da plataforma."
    items={[
      { label: "Lista de alunos", description: "Buscar, filtrar e visualizar perfis." },
      { label: "Plano", description: "Free ou Premium, com histórico de mudança." },
      { label: "Bloquear / Reativar", description: "Suspensão de contas com motivo." },
      { label: "Atividade", description: "Última sessão e uso." },
      { label: "Suporte", description: "Tickets associados ao usuário." },
      { label: "Exportar", description: "Baixe lista em CSV." },
    ]} />
) });