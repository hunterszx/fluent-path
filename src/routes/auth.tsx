import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { ArrowRight, Mail, Lock, User as UserIcon, Loader2, GraduationCap, BookOpen, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LunariLogo } from "@/components/lunari-logo";
import { useAuth, type Role } from "@/lib/auth-context";

const searchSchema = z.object({ mode: z.enum(["login", "signup"]).optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Entrar — Lunari" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { mode: initialMode } = Route.useSearch();
  const [mode, setMode] = useState<"login" | "signup">(initialMode ?? "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("aluno");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { user, login, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    if (user.teacherStatus === "pending") {
      navigate({ to: "/pendente" });
    } else {
      navigate({ to: `/${user.activeRole}` });
    }
  }, [user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const u = mode === "login"
        ? await login(email, password)
        : await signup(name, email, password, role);
      if (u.teacherStatus === "pending") {
        navigate({ to: "/pendente" });
      } else {
        navigate({ to: `/${u.activeRole}` });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao autenticar.");
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      // The browser usually redirects to Google. If tokens come back
      // directly, the auth listener hydrates the user and the effect
      // above performs the navigation.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar com Google.");
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-hero-radial lg:grid-cols-2">
      <div className="hidden flex-col justify-between p-12 lg:flex">
        <Link to="/" className="flex items-center gap-3">
          <LunariLogo size={40} />
          <span className="font-display text-2xl font-bold">Lunari</span>
        </Link>
        <div className="max-w-md">
          <h2 className="font-display text-4xl font-bold leading-tight">
            Inglês fluente, do seu jeito.{" "}
            <span className="text-gradient-brand">Com IA e professores reais.</span>
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Flashcards inteligentes, pronúncia por IA e aulas particulares com desconto Premium.
          </p>
        </div>
        <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} Lunari</div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <LunariLogo size={32} /> <span className="font-display text-xl font-bold">Lunari</span>
            </Link>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="font-display text-3xl font-bold">
                {mode === "login" ? "Entrar na Lunari" : "Criar sua conta"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {mode === "login" ? "Continue sua jornada de inglês." : "Comece grátis em segundos."}
              </p>
            </motion.div>
          </AnimatePresence>

          <button
            type="button"
            onClick={google}
            disabled={loading || googleLoading}
            className="group mt-8 flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-elevated hover:shadow-md active:translate-y-0 active:scale-[0.99] active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
          >
            {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
            {googleLoading ? "Conectando…" : "Continuar com Google"}
          </button>

          <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> ou <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            <AnimatePresence initial={false}>
              {mode === "signup" && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <Field icon={UserIcon} placeholder="Seu nome" value={name} onChange={setName} />
                </motion.div>
              )}
            </AnimatePresence>
            <Field icon={Mail} type="email" placeholder="seu@email.com" value={email} onChange={setEmail} required />
            <Field icon={Lock} type="password" placeholder="Senha" value={password} onChange={setPassword} required />

            <AnimatePresence initial={false}>
              {mode === "signup" && (
                <motion.div
                  key="role-picker"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <RolePicker role={role} onChange={setRole} />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl gradient-brand px-5 py-3 text-sm font-semibold text-white glow-brand transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95 hover:shadow-lg active:translate-y-0 active:scale-[0.99] active:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {mode === "login" ? "Entrando…" : "Criando conta…"}
                </>
              ) : (
                <>
                  {mode === "login" ? "Entrar" : "Criar conta"} <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>Novo na Lunari?{" "}
                <button onClick={() => setMode("signup")} className="font-semibold text-foreground hover:text-primary">
                  Criar conta
                </button>
              </>
            ) : (
              <>Já tem conta?{" "}
                <button onClick={() => setMode("login")} className="font-semibold text-foreground hover:text-primary">
                  Entrar
                </button>
              </>
            )}
          </div>

          <p className="mt-6 text-center text-[11px] text-muted-foreground">
            Ao continuar você aceita os termos de uso e a política de privacidade.
          </p>
        </div>
      </div>
    </div>
  );
}

function RolePicker({ role, onChange }: { role: Role; onChange: (r: Role) => void }) {
  const options: { value: Role; title: string; desc: string; icon: typeof BookOpen }[] = [
    { value: "aluno", title: "Sou aluno", desc: "Quero aprender inglês", icon: BookOpen },
    { value: "professor", title: "Sou professor", desc: "Quero ensinar na plataforma", icon: GraduationCap },
  ];
  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Eu sou
      </div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => {
          const active = role === opt.value;
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`group relative flex cursor-pointer flex-col items-start gap-1.5 overflow-hidden rounded-xl border p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                active
                  ? "border-primary/60 bg-gradient-to-br from-primary/10 to-brand-2/5 shadow-sm"
                  : "border-border bg-muted/30 hover:border-primary/30"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="role-active-bg"
                  className="pointer-events-none absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-primary/15 to-brand-2/10"
                  transition={{ type: "spring", stiffness: 280, damping: 26 }}
                />
              )}
              <div className="flex w-full items-center justify-between">
                <div className={`grid h-8 w-8 place-items-center rounded-lg transition ${active ? "bg-primary text-white shadow" : "bg-background text-muted-foreground group-hover:text-primary"}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <AnimatePresence>
                  {active && (
                    <motion.div
                      key="check"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 380, damping: 22 }}
                      className="grid h-5 w-5 place-items-center rounded-full bg-primary text-white"
                    >
                      <Check className="h-3 w-3" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="text-sm font-semibold">{opt.title}</div>
              <div className="text-[11px] text-muted-foreground">{opt.desc}</div>
            </button>
          );
        })}
      </div>
      <AnimatePresence mode="wait">
        {role === "professor" && (
          <motion.div
            key="prof-note"
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 overflow-hidden rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning"
          >
            Contas de professor passam por aprovação manual antes de liberar o acesso completo.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({
  icon: Icon, value, onChange, ...rest
}: { icon: any; value: string; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  return (
    <div className="flex items-center gap-2 rounded-xl border bg-card px-3.5 focus-within:ring-2 focus-within:ring-primary/40">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.4-7.2 2.4-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C40.8 35.7 44 30.3 44 24c0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}