import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Sparkles, Mic, Calendar, Brain, Layers, Zap } from "lucide-react";
import { LunariLogo } from "@/components/lunari-logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lunari — Inglês fluente, do seu jeito. Com IA e professores reais." },
      { name: "description", content: "Flashcards inteligentes com repetição espaçada, feedback de pronúncia por IA e aulas particulares com desconto Premium." },
      { property: "og:title", content: "Lunari — Inglês fluente com IA e professores reais" },
      { property: "og:description", content: "Flashcards, IA de pronúncia e aulas — em um app moderno." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <Features />
      <Plans />
      <Footer />
    </div>
  );
}

function smoothScrollTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  // Atualiza a hash sem o "salto" do navegador
  history.replaceState(null, "", `#${id}`);
}

function anchorClick(id: string) {
  return (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    smoothScrollTo(id);
  };
}

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <LunariLogo size={36} />
          <span className="font-display text-xl font-bold tracking-tight">Lunari</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#recursos" onClick={anchorClick("recursos")} className="hover:text-foreground">Recursos</a>
          <a href="#planos" onClick={anchorClick("planos")} className="hover:text-foreground">Planos</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/auth" className="hidden rounded-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground sm:inline-flex">
            Entrar
          </Link>
          <Link
            to="/auth"
            search={{ mode: "signup" } as never}
            className="inline-flex items-center gap-1 rounded-full gradient-brand px-4 py-2 text-sm font-semibold text-white glow-brand transition hover:opacity-95"
          >
            Começar grátis
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero-radial">
      <div className="mx-auto max-w-6xl px-6 py-24 text-center sm:py-32">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/60 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-2" />
          IA de pronúncia em tempo real
        </div>
        <h1 className="mx-auto mt-8 max-w-4xl font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
          Inglês fluente, do seu jeito.{" "}
          <span className="text-gradient-brand">Com IA e professores reais.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Flashcards inteligentes com repetição espaçada, feedback de pronúncia por IA e aulas particulares com desconto Premium. Tudo em um app moderno.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/auth"
            search={{ mode: "signup" } as never}
            className="inline-flex items-center gap-2 rounded-full gradient-brand px-7 py-3.5 text-sm font-semibold text-white glow-brand transition hover:opacity-95"
          >
            Começar grátis <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#planos"
            onClick={anchorClick("planos")}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-7 py-3.5 text-sm font-semibold text-foreground transition hover:bg-elevated"
          >
            Ver planos
          </a>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { icon: Layers, title: "Flashcards inteligentes", desc: "Repetição espaçada que prioriza o que você ainda não dominou." },
    { icon: Mic, title: "Pronúncia com IA", desc: "Grave sua voz e receba feedback claro e útil em segundos." },
    { icon: Calendar, title: "Aulas particulares", desc: "Agende com professores reais e ganhe desconto Premium." },
    { icon: Brain, title: "Decks dos professores", desc: "Receba decks personalizados feitos pelo seu professor." },
    { icon: Zap, title: "Streak e XP", desc: "Construa o hábito com recompensas e progresso visível." },
    { icon: Sparkles, title: "Experiência premium", desc: "Visual moderno, rápido e focado em legibilidade." },
  ];
  return (
    <section id="recursos" className="border-t bg-background py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-[11px] font-semibold tracking-[0.18em] text-brand-2">RECURSOS</div>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Tudo o que você precisa para fluência.</h2>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <div key={it.title} className="surface-card p-6 transition hover:bg-elevated">
              <div className="grid h-11 w-11 place-items-center rounded-xl gradient-brand">
                <it.icon className="h-5 w-5 text-white" />
              </div>
              <div className="mt-5 font-display text-lg font-semibold">{it.title}</div>
              <p className="mt-2 text-sm text-muted-foreground">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Plans() {
  return (
    <section id="planos" className="border-t py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-[11px] font-semibold tracking-[0.18em] text-brand-2">PLANOS</div>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Comece grátis. Cresça com Premium.</h2>
          <p className="mt-3 text-sm text-muted-foreground">O Premium não libera aulas grátis — ele garante desconto automático em todas as aulas particulares.</p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <PlanCard
            badge="Grátis"
            price="R$ 0"
            suffix="para sempre"
            features={[
              "Flashcards essenciais",
              "Streak e XP",
              "Acesso a decks da plataforma",
              "1 revisão de pronúncia por dia",
            ]}
            ctaLabel="Criar conta grátis"
          />
          <PlanCard
            badge="Premium"
            highlight
            price="R$ 39"
            suffix="/mês"
            highlightNote="+ desconto automático nas aulas particulares"
            features={[
              "Tudo do Grátis",
              "Desconto em todas as aulas particulares",
              "Biblioteca de flashcards ilimitada",
              "Revisões e pronúncia por IA sem limite",
              "Recursos avançados de IA",
            ]}
            ctaLabel="Assinar Premium"
          />
        </div>
      </div>
    </section>
  );
}

function PlanCard({
  badge, price, suffix, features, ctaLabel, highlight, highlightNote,
}: {
  badge: string; price: string; suffix: string; features: string[]; ctaLabel: string; highlight?: boolean; highlightNote?: string;
}) {
  return (
    <div className={`surface-card relative overflow-hidden p-8 ${highlight ? "ring-1 ring-primary/40" : ""}`}>
      {highlight && (
        <div className="pointer-events-none absolute inset-0 -z-0 bg-gradient-to-br from-primary/15 via-transparent to-brand-2/15" />
      )}
      <div className="relative flex items-center gap-3 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{badge}</span>
        {highlight && (
          <span className="rounded-full gradient-brand px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            Mais popular
          </span>
        )}
      </div>
      <div className="relative mt-4 flex items-baseline gap-1.5">
        <span className="font-display text-5xl font-bold">{price}</span>
        <span className="text-sm text-muted-foreground">{suffix}</span>
      </div>
      {highlightNote && <div className="relative mt-2 text-sm text-brand-2">{highlightNote}</div>}
      {!highlightNote && <div className="relative mt-2 h-5" />}

      <ul className="relative mt-8 space-y-3.5 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <Link
        to="/auth"
        search={{ mode: "signup" } as never}
        className={`relative mt-8 flex w-full items-center justify-center rounded-full px-5 py-3.5 text-sm font-semibold transition ${
          highlight
            ? "gradient-brand text-white glow-brand hover:opacity-95"
            : "border border-border bg-card hover:bg-elevated"
        }`}
      >
        {ctaLabel}
      </Link>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LunariLogo size={24} /> © {new Date().getFullYear()} Lunari
        </div>
        <div className="text-xs text-muted-foreground">Inglês fluente, do seu jeito.</div>
      </div>
    </footer>
  );
}
