import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { RoleGuard } from "@/components/role-guard";

export const Route = createFileRoute("/admin")({
  component: () => (
    <RoleGuard area="admin">
      <AppShell area="admin"><Outlet /></AppShell>
    </RoleGuard>
  ),
});