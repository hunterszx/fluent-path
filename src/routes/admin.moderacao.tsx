import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/section-placeholder";
export const Route = createFileRoute("/admin/moderacao")({ component: () => (
  <SectionPlaceholder title="Moderação" subtitle="Denúncias, conteúdo e segurança."
    items={[
      { label: "Denúncias", description: "Fila com prioridade." },
      { label: "Conteúdo sinalizado", description: "Cards e mensagens reportadas." },
      { label: "Regras", description: "Políticas da plataforma." },
      { label: "Banimentos", description: "Histórico de ações." },
      { label: "Apelos", description: "Pedidos de revisão." },
      { label: "Logs", description: "Auditoria de ações dos admins." },
    ]} />
) });