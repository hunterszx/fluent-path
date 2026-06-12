import { createFileRoute, Link } from "@tanstack/react-router";
import { Trophy, Flame, Layers, Calendar, BookOpen, Mic, ArrowRight, Sparkles } from "lucide-react";
import { PageHeader, StatCard } from "@/components/app-shell";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/aluno/")({
  component: AlunoHome,
});

function AlunoHome() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? "aluno";
  const week = ["S", "T", "Q", "Q", "S", "S", "D"];
  const completed = 3;

  return (
    <div>
      <PageHeader
        title={`Olá, ${firstName} 👋`}
        subtitle="Continue sua jornada — pequenos passos todos os dias."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="XP TOTAL" value="0" hint="Continue acumulando!" icon={Trophy} tone="brand" />
        <StatCard label="SEQUÊNCIA" value="0 dias" hint="Estude hoje para manter" icon={Flame} tone="warning" />
        <StatCard label="REVISÕES PENDENTES" value="12" hint="Cards prontos para revisar" icon={Layers} tone="success" />
        <StatCard label="PRÓXIMA AULA" value="—" hint="Nenhuma agendada" icon={Calendar} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="surface-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold tracking-[0.18em] text-brand-2">PROGRESSO DA SEMANA</div>
              <div className="mt-1 font-display text-xl font-semibold">Continue no ritmo</div>
            </div>
            <Sparkles className="h-5 w-5 text-brand-2" />
          </div>
          <div className="mt-6 grid grid-cols-7 gap-2 sm:gap-3">
            {week.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div
                  className={`aspect-square w-full rounded-xl ${
                    i < completed
                      ? "gradient-brand glow-brand"
                      : "bg-elevated"
                  }`}
                />
                <span className="text-xs text-muted-foreground">{d}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card p-6">
          <div className="text-[11px] font-semibold tracking-[0.18em] text-brand-2">ATALHOS</div>
          <div className="mt-4 space-y-2">
            <Shortcut to="/aluno/flashcards" icon={BookOpen} label="Revisar flashcards" />
            <Shortcut to="/aluno/flashcards" icon={Mic} label="Treinar pronúncia" />
            <Shortcut to="/aluno/aulas" icon={Calendar} label="Agendar aula" />
          </div>
        </div>
      </div>

      <div className="mt-6 surface-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold tracking-[0.18em] text-brand-2">FLASHCARDS RECOMENDADOS</div>
            <div className="mt-1 font-display text-xl font-semibold">Para revisar hoje</div>
          </div>
          <Link to="/aluno/flashcards" className="text-sm text-primary hover:underline">Ver todos</Link>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            { title: "Vocabulário do dia", count: 15 },
            { title: "Phrasal verbs", count: 15 },
            { title: "Pronúncia avançada", count: 15 },
          ].map((d) => (
            <Link
              key={d.title}
              to="/aluno/flashcards"
              className="surface-elevated block p-5 transition hover:ring-1 hover:ring-primary/40"
            >
              <div className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground">DECK</div>
              <div className="mt-2 font-display text-lg font-semibold">{d.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">{d.count} cards · 5 min</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Shortcut({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between gap-3 rounded-xl border bg-card/60 px-4 py-3 text-sm font-medium transition hover:bg-elevated"
    >
      <span className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </span>
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}