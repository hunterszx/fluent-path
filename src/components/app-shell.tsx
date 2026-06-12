import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useState } from "react";
import {
  Home, Layers, Calendar, TrendingUp, History, User as UserIcon,
  Wallet, BookOpen, Users, GraduationCap, Shield, BarChart3, Settings,
  Flag, CreditCard, LogOut, Sun, Moon, Menu, X, ChevronsUpDown,
} from "lucide-react";
import { useAuth, type Role } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { LunariLogo } from "./lunari-logo";
import { cn } from "@/lib/utils";

type Item = { to: string; label: string; icon: any };

const ALUNO: Item[] = [
  { to: "/aluno", label: "Início", icon: Home },
  { to: "/aluno/flashcards", label: "Flashcards", icon: Layers },
  { to: "/aluno/aulas", label: "Aulas", icon: Calendar },
  { to: "/aluno/progresso", label: "Progresso", icon: TrendingUp },
  { to: "/aluno/historico", label: "Histórico", icon: History },
  { to: "/aluno/perfil", label: "Perfil", icon: UserIcon },
];
const PROFESSOR: Item[] = [
  { to: "/professor", label: "Início", icon: Home },
  { to: "/professor/agenda", label: "Agenda", icon: Calendar },
  { to: "/professor/flashcards", label: "Flashcards", icon: Layers },
  { to: "/professor/historico", label: "Histórico", icon: History },
  { to: "/professor/billing", label: "Billing", icon: Wallet },
];
const ADMIN: Item[] = [
  { to: "/admin", label: "Dashboard", icon: BarChart3 },
  { to: "/admin/usuarios", label: "Usuários", icon: Users },
  { to: "/admin/professores", label: "Professores", icon: GraduationCap },
  { to: "/admin/aulas", label: "Aulas", icon: Calendar },
  { to: "/admin/flashcards", label: "Flashcards", icon: Layers },
  { to: "/admin/assinaturas", label: "Assinaturas", icon: BookOpen },
  { to: "/admin/pagamentos", label: "Pagamentos", icon: CreditCard },
  { to: "/admin/moderacao", label: "Moderação", icon: Flag },
  { to: "/admin/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export function AppShell({ area, children }: { area: Role; children: ReactNode }) {
  const items = area === "aluno" ? ALUNO : area === "professor" ? PROFESSOR : ADMIN;
  const { user, logout, switchRole } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const areaLabel = area === "aluno" ? "ALUNO" : area === "professor" ? "PROFESSOR" : "ADMIN";
  const availableRoles = (user?.roles ?? []).filter((r) => r !== "tester") as Role[];
  const isTester = user?.roles.includes("tester");

  function onLogout() {
    logout();
    navigate({ to: "/" });
  }

  const sidebar = (
    <aside className="flex h-full w-72 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 p-5">
        <LunariLogo size={44} />
        <div className="min-w-0">
          <div className="font-display text-xl font-bold leading-none">Lunari</div>
          <div className="mt-1 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground">
            {areaLabel}
          </div>
        </div>
      </div>

      {(isTester || availableRoles.length > 1) && (
        <div className="mx-4 mb-2 rounded-xl border bg-card/60 p-2">
          <div className="px-2 pb-1 text-[10px] font-semibold tracking-wider text-muted-foreground">
            ÁREA ATIVA {isTester && "· TESTE"}
          </div>
          <div className="grid grid-cols-3 gap-1">
            {(["aluno", "professor", "admin"] as Role[]).map((r) => {
              const enabled = isTester || availableRoles.includes(r);
              const active = area === r;
              return (
                <button
                  key={r}
                  disabled={!enabled}
                  onClick={() => {
                    switchRole(r);
                    navigate({ to: `/${r}` });
                  }}
                  className={cn(
                    "rounded-lg px-2 py-1.5 text-[11px] font-semibold capitalize transition",
                    active && "gradient-brand text-white",
                    !active && enabled && "bg-muted/50 text-foreground hover:bg-muted",
                    !enabled && "opacity-30",
                  )}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const active = pathname === item.to || (item.to !== `/${area}` && pathname.startsWith(item.to));
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-elevated text-foreground shadow-sm ring-1 ring-border"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={toggle}
            className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Alternar tema"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">{sidebar}</div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0">{sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b px-4 py-3 lg:hidden">
          <button
            onClick={() => setOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-lg border"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <LunariLogo size={32} />
          <span className="font-display text-lg font-bold">Lunari</span>
          <span className="ml-auto text-[10px] font-semibold tracking-widest text-muted-foreground">
            {areaLabel}
          </span>
        </header>
        <main className="min-w-0 flex-1 p-6 sm:p-8 lg:p-10">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
      <div className="min-w-0">
        <h1 className="truncate text-3xl font-bold sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-muted-foreground sm:text-base">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon: any;
  tone?: "default" | "brand" | "warning" | "success";
}) {
  const tint =
    tone === "brand"
      ? "from-primary/20 to-brand-2/10"
      : tone === "warning"
        ? "from-warning/20 to-warning/5"
        : tone === "success"
          ? "from-success/20 to-success/5"
          : "from-muted/20 to-muted/5";
  const iconColor =
    tone === "brand"
      ? "text-primary"
      : tone === "warning"
        ? "text-warning"
        : tone === "success"
          ? "text-success"
          : "text-muted-foreground";
  return (
    <div className={cn("surface-card relative overflow-hidden p-5")}>
      <div className={cn("pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br opacity-60 blur-2xl", tint)} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
        <Icon className={cn("h-4 w-4 shrink-0", iconColor)} />
      </div>
      <div className="relative mt-3 font-display text-3xl font-bold sm:text-4xl">{value}</div>
      {hint && <div className="relative mt-2 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export { ChevronsUpDown };