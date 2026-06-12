import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/section-placeholder";
export const Route = createFileRoute("/professor/agenda")({ component: () => (
  <SectionPlaceholder title="Agenda" subtitle="Defina sua disponibilidade, bloqueie horários e gerencie reservas."
    items={[
      { label: "Disponibilidade", description: "Adicione horários livres por dia da semana." },
      { label: "Bloquear horários", description: "Indisponibilidade pontual ou recorrente." },
      { label: "Reagendar", description: "Mova aulas evitando conflitos." },
      { label: "Reservas confirmadas", description: "Quem está agendado e detalhes." },
      { label: "Lembretes", description: "Avisos automáticos para você e o aluno." },
      { label: "Calendário externo", description: "Exporte para Google/Apple Calendar." },
    ]} />
) });