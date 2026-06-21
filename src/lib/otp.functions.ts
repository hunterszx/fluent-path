import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;
const RESEND_COOLDOWN_SECONDS = 60;
const CODE_TTL_MINUTES = 60; // Supabase default for email OTP

const emailSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
});
const verifySchema = emailSchema.extend({
  code: z.string().trim().regex(/^\d{6}$/, "Código deve ter 6 dígitos"),
});

function genericError(): never {
  throw new Error("Não foi possível processar a verificação.");
}

/** Envia / reenvia o código de verificação por e-mail, com cooldown. */
export const sendVerificationCode = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => emailSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email;
    const now = new Date();

    const { data: row } = await supabaseAdmin
      .from("otp_attempts")
      .select("last_sent_at, locked_until")
      .eq("email", email)
      .maybeSingle();

    if (row?.locked_until && new Date(row.locked_until) > now) {
      const seconds = Math.ceil((new Date(row.locked_until).getTime() - now.getTime()) / 1000);
      return { ok: false as const, reason: "locked" as const, retryAfter: seconds };
    }
    if (row?.last_sent_at) {
      const diff = Math.floor((now.getTime() - new Date(row.last_sent_at).getTime()) / 1000);
      if (diff < RESEND_COOLDOWN_SECONDS) {
        return {
          ok: false as const,
          reason: "cooldown" as const,
          retryAfter: RESEND_COOLDOWN_SECONDS - diff,
        };
      }
    }

    const { error } = await supabaseAdmin.auth.resend({ type: "signup", email });
    if (error) {
      // Não vazar detalhes do provider
      return { ok: false as const, reason: "send_failed" as const, retryAfter: 0 };
    }

    const expiresAt = new Date(now.getTime() + CODE_TTL_MINUTES * 60_000);
    await supabaseAdmin
      .from("otp_attempts")
      .upsert({
        email,
        attempts: 0,
        locked_until: null,
        last_sent_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      });

    return {
      ok: true as const,
      resendAfter: RESEND_COOLDOWN_SECONDS,
      expiresAt: expiresAt.toISOString(),
      ttlMinutes: CODE_TTL_MINUTES,
    };
  });

/** Verifica o código com limite de tentativas e devolve a sessão para o cliente. */
export const verifyEmailCode = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => verifySchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email;
    const now = new Date();

    const { data: row } = await supabaseAdmin
      .from("otp_attempts")
      .select("attempts, locked_until, expires_at")
      .eq("email", email)
      .maybeSingle();

    if (row?.locked_until && new Date(row.locked_until) > now) {
      const seconds = Math.ceil((new Date(row.locked_until).getTime() - now.getTime()) / 1000);
      return { ok: false as const, reason: "locked" as const, retryAfter: seconds };
    }
    if (row?.expires_at && new Date(row.expires_at) <= now) {
      return { ok: false as const, reason: "expired" as const, attemptsLeft: MAX_ATTEMPTS };
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabasePub = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    const { data: verifyData, error } = await supabasePub.auth.verifyOtp({
      email,
      token: data.code,
      type: "signup",
    });

    if (error || !verifyData.session) {
      const newAttempts = (row?.attempts ?? 0) + 1;
      const reached = newAttempts >= MAX_ATTEMPTS;
      const lockedUntil = reached
        ? new Date(now.getTime() + LOCK_MINUTES * 60_000).toISOString()
        : null;
      await supabaseAdmin.from("otp_attempts").upsert({
        email,
        attempts: reached ? 0 : newAttempts,
        locked_until: lockedUntil,
        // preserva last_sent_at/expires_at existentes
        last_sent_at: undefined as unknown as string,
        expires_at: undefined as unknown as string,
      } as never);
      if (reached) {
        return {
          ok: false as const,
          reason: "locked" as const,
          retryAfter: LOCK_MINUTES * 60,
        };
      }
      return {
        ok: false as const,
        reason: "invalid" as const,
        attemptsLeft: MAX_ATTEMPTS - newAttempts,
      };
    }

    // Sucesso → limpa tentativas
    await supabaseAdmin.from("otp_attempts").delete().eq("email", email);

    return {
      ok: true as const,
      session: {
        access_token: verifyData.session.access_token,
        refresh_token: verifyData.session.refresh_token,
      },
    };
  });

// Evita "unused" do helper acima
void genericError;