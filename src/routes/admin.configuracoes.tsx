import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/section-placeholder";
export const Route = createFileRoute("/admin/configuracoes")({ component: () => (
  <SectionPlaceholder title="Configurações" subtitle="Ajustes gerais da plataforma."
    items={[
      { label: "Identidade", description: "Logo, nome e cores." },
      { label: "E-mail", description: "Provedor e templates." },
      { label: "IA", description: "Modelos e limites por plano." },
      { label: "Pagamentos", description: "Provedor e taxas." },
      { label: "Armazenamento", description: "Áudios e materiais." },
      { label: "Permissões", description: "Papéis e acessos do time." },
    ]} />
) });