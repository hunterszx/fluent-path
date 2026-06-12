import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { RoleGuard } from "@/components/role-guard";

export const Route = createFileRoute("/aluno")({
  component: () => (
    <RoleGuard area="aluno">
      <AppShell area="aluno"><Outlet /></AppShell>
    </RoleGuard>
  ),
});