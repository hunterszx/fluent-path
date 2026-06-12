import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/section-placeholder";

export const Route = createFileRoute("/aluno/progresso")({ component: Page });
function Page() {
  return (
    <SectionPlaceholder
      title="Progresso"
      subtitle="XP, nível, metas semanais e evolução da pronúncia."
      items={[
        { label: "XP e nível", description: "Acompanhe seu nível atual e quanto falta para o próximo." },
        { label: "Metas semanais", description: "Defina objetivos e bata streaks." },
        { label: "Vocabulário dominado", description: "Quantas palavras você já tem na ponta da língua." },
        { label: "Pronúncia", description: "Curva de evolução das suas tentativas." },
        { label: "Tempo de estudo", description: "Minutos por dia, semana e mês." },
        { label: "Próximos passos", description: "Sugestões de IA com base no seu desempenho." },
      ]}
    />
  );
}