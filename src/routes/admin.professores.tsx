import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/section-placeholder";
export const Route = createFileRoute("/admin/professores")({ component: () => (
  <SectionPlaceholder title="Professores" subtitle="Aprovações, edição e métricas."
    items={[
      { label: "Aprovar novos", description: "Revise currículo e libere o cadastro." },
      { label: "Editar perfil", description: "Foto, bio, especialidades e preço base." },
      { label: "Bloquear", description: "Suspenda professores com violações." },
      { label: "Avaliações", description: "Veja notas e comentários dos alunos." },
      { label: "Repasses", description: "Status financeiro por professor." },
      { label: "Carga horária", description: "Disponibilidade média da base." },
    ]} />
) });