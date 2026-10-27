import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/section-placeholder";
export const Route = createFileRoute("/admin/flashcards")({
  head: () => ({ meta: [{ title: "Administração · Flashcards — Lunari" }, { name: "description", content: "Administração · Flashcards na Lunari, plataforma de aprendizado de inglês com flashcards, pronúncia e aulas." }, { property: "og:title", content: "Administração · Flashcards — Lunari" }, { property: "og:description", content: "Administração · Flashcards na Lunari, plataforma de aprendizado de inglês com flashcards, pronúncia e aulas." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }), component: () => (
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