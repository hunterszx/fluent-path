import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Loader2, Mail, ArrowRight, ShieldCheck, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { LunariLogo } from "@/components/lunari-logo";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { sendVerificationCode, verifyEmailCode } from "@/lib/otp.functions";

const searchSchema = z.object({ email: z.string().email().optional() });

export const Route = createFileRoute("/verify")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Verificar e-mail — Lunari" }, { name: "description", content: "Verificar e-mail na Lunari, plataforma de aprendizado de inglês com flashcards, pronúncia e aulas." }, { property: "og:title", content: "Verificar e-mail — Lunari" }, { property: "og:description", content: "Verificar e-mail na Lunari, plataforma de aprendizado de inglês com flashcards, pronúncia e aulas." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: VerifyPage,
});

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m <= 0) return `${s}s`;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

function VerifyPage() {
  const { email: emailParam } = Route.useSearch();
  const navigate = useNavigate();
  const send = useServerFn(sendVerificationCode);
  const verify = useServerFn(verifyEmailCode);

  const [email] = useState(emailParam ?? "");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sending, setSending] = useState(false);
  const [resendIn, setResendIn] = useState(0); // segundos restantes do cooldown
  const [lockIn, setLockIn] = useState(0); // segundos restantes do bloqueio
  const [expiresAt, setExpiresAt] = useState<number | null>(null); // ms epoch
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);

  const expiresIn = useMemo(() => {
    if (!expiresAt) return null;
    return Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
  }, [expiresAt]);

  useEffect(() => {
    if (!email) navigate({ to: "/auth", search: { mode: "signup" } });
  }, [email, navigate]);

  // Ticker para countdown (reenviar / bloqueio / expiração)
  useEffect(() => {
    const id = setInterval(() => {
      setResendIn((s) => (s > 0 ? s - 1 : 0));
      setLockIn((s) => (s > 0 ? s - 1 : 0));
      // força recálculo de expiresIn:
      setExpiresAt((v) => v);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  async function resend() {
    if (!email || sending || resendIn > 0 || lockIn > 0) return;
    setSending(true);
    setError(null);
    setInfo(null);
    try {
      const res = await send({ data: { email } });
      if (res.ok) {
        setResendIn(res.resendAfter);
        setExpiresAt(new Date(res.expiresAt).getTime());
        setAttemptsLeft(null);
        setInfo(`Código reenviado. Válido por ${res.ttlMinutes} minutos.`);
      } else if (res.reason === "cooldown") {
        setResendIn(res.retryAfter);
        setError(`Aguarde ${res.retryAfter}s para reenviar.`);
      } else if (res.reason === "locked") {
        setLockIn(res.retryAfter);
        setError("Muitas tentativas. Tente novamente mais tarde.");
      } else {
        setError("Não foi possível enviar o código. Tente novamente.");
      }
    } catch {
      setError("Não foi possível enviar o código. Tente novamente.");
    } finally {
      setSending(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6 || submitting || lockIn > 0) return;
    setSubmitting(true);
    setError(null);
    setInfo(null);
    try {
      const res = await verify({ data: { email, code } });
      if (res.ok) {
        await supabase.auth.setSession(res.session);
        navigate({ to: "/aluno" });
        return;
      }
      if (res.reason === "locked") {
        setLockIn(res.retryAfter);
        setError("Muitas tentativas inválidas. Conta bloqueada temporariamente.");
      } else if (res.reason === "expired") {
        setError("O código expirou. Solicite um novo código.");
        setExpiresAt(Date.now());
      } else if (res.reason === "invalid") {
        setAttemptsLeft(res.attemptsLeft);
        setError(
          res.attemptsLeft > 0
            ? `Código inválido. Restam ${res.attemptsLeft} tentativa${res.attemptsLeft === 1 ? "" : "s"}.`
            : "Código inválido.",
        );
        setCode("");
      }
    } catch {
      setError("Erro ao verificar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  const locked = lockIn > 0;

  return (
    <div className="grid min-h-screen place-items-center bg-hero-radial p-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm"
      >
        <Link to="/" className="mb-6 flex items-center gap-2">
          <LunariLogo size={32} /> <span className="font-display text-xl font-bold">Lunari</span>
        </Link>

        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" /> Verificação
        </div>
        <h1 className="font-display text-2xl font-bold">Confirme seu e-mail</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enviamos um código de 6 dígitos para{" "}
          <span className="inline-flex items-center gap-1 font-medium text-foreground">
            <Mail className="h-3.5 w-3.5" /> {email}
          </span>
        </p>

        {expiresIn !== null && expiresIn > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            Código válido por <span className="font-semibold text-foreground">{fmt(expiresIn)}</span>.
          </p>
        )}
        {expiresIn === 0 && (
          <p className="mt-2 text-xs text-warning">Código expirado — solicite um novo.</p>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={setCode}
              disabled={locked || submitting}
              inputMode="numeric"
              pattern="[0-9]*"
            >
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} className="h-12 w-12 text-lg" />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <div>{error}</div>
                {locked && (
                  <div className="mt-0.5 text-xs opacity-80">
                    Desbloqueio em <span className="font-semibold">{fmt(lockIn)}</span>.
                  </div>
                )}
              </div>
            </div>
          )}
          {info && !error && (
            <div className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
              {info}
            </div>
          )}
          {attemptsLeft !== null && !error && (
            <p className="text-xs text-muted-foreground">
              Tentativas restantes: <span className="font-semibold">{attemptsLeft}</span>
            </p>
          )}

          <button
            type="submit"
            disabled={code.length !== 6 || submitting || locked}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl gradient-brand px-5 py-3 text-sm font-semibold text-white glow-brand transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Verificando…
              </>
            ) : (
              <>
                Verificar <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">Não recebeu?</span>
          <button
            type="button"
            onClick={resend}
            disabled={sending || resendIn > 0 || locked}
            className="cursor-pointer font-semibold text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
          >
            {sending
              ? "Enviando…"
              : resendIn > 0
                ? `Reenviar em ${resendIn}s`
                : "Reenviar código"}
          </button>
        </div>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Após 5 tentativas inválidas, o acesso é bloqueado por 15 minutos.
        </p>
      </motion.div>
    </div>
  );
}