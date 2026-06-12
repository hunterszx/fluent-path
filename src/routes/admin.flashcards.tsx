import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/section-placeholder";
export const Route = createFileRoute("/admin/flashcards")({ component: () => (
  <SectionPlaceholder title="Flashcards" subtitle="Banco global e curadoria."
    items={[
      { label: "Banco global", description: "Decks oficiais da plataforma." },
      { label: "Curadoria", description: "Aprovação de decks públicos." },
      { label: "Categorias e tags", description: "Estrutura do catálogo." },
      { label: "Áudio", description: "Gestão de áudios e qualidade." },
      { label: "Importação", description: "Importe decks externos." },
      { label: "Relatórios", description: "Decks mais usados e mais difíceis." },
    ]} />
) });