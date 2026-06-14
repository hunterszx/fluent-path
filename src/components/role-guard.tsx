import { useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useAuth, type Role } from "@/lib/auth-context";

export function RoleGuard({ area, children }: { area: Role; children: ReactNode }) {
  const { user, loading, switchRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    if (user.teacherStatus === "pending") {
      navigate({ to: "/pendente" });
      return;
    }
    const allowed = user.roles.includes(area);
    if (!allowed) {
      navigate({ to: `/${user.activeRole}` });
      return;
    }
    if (user.activeRole !== area) switchRole(area);
  }, [user, loading, area, navigate, switchRole]);

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">
        Carregando…
      </div>
    );
  }
  return <>{children}</>;
}