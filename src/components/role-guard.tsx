import { useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useAuth, type Role } from "@/lib/auth-context";

export function RoleGuard({ area, children }: { area: Role; children: ReactNode }) {
  const { user, switchRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user === null) return; // still loading from storage
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    const isTester = user.roles.includes("tester");
    const allowed = isTester || user.roles.includes(area);
    if (!allowed) {
      navigate({ to: `/${user.activeRole}` });
      return;
    }
    if (user.activeRole !== area) {
      switchRole(area);
    }
  }, [user, area, navigate, switchRole]);

  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">
        Carregando…
      </div>
    );
  }
  return <>{children}</>;
}