import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { RoleGuard } from "@/components/role-guard";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Administração — Lunari" }, { name: "description", content: "Administração na Lunari, plataforma de aprendizado de inglês com flashcards, pronúncia e aulas." }, { property: "og:title", content: "Administração — Lunari" }, { property: "og:description", content: "Administração na Lunari, plataforma de aprendizado de inglês com flashcards, pronúncia e aulas." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => (
    <RoleGuard area="admin">
      <AppShell area="admin"><Outlet /></AppShell>
    </RoleGuard>
  ),
});