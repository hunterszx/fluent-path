import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const inputSchema = z.object({
  teacherId: z.string().uuid(),
  action: z.enum(["approved", "rejected"]),
  notes: z.string().max(2000).optional().nullable(),
});

const APP_NAME = "Lunari";
const APP_URL = "https://lunari.app";
const FROM_NAME = "Equipe Lunari";

function b64url(s: string) {
  // Base64url-encode an RFC 2822 message (UTF-8 safe).
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function buildSubjectAndBody(action: "approved" | "rejected", name: string, notes?: string | null) {
  if (action === "approved") {
    return {
      subject: `${APP_NAME} — seu cadastro de professor foi aprovado 🎉`,
      html: `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#ffffff;color:#0f172a;padding:24px">
        <div style="max-width:560px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;padding:28px">
          <h1 style="margin:0 0 12px;font-size:22px">Olá, ${escapeHtml(name)}!</h1>
          <p style="line-height:1.55">Seu cadastro como <strong>professor</strong> na ${APP_NAME} foi <strong>aprovado</strong>.</p>
          <p style="line-height:1.55">Próximos passos:</p>
          <ol style="line-height:1.7">
            <li>Acesse sua conta e entre na área do professor.</li>
            <li>Complete seu perfil, disponibilidade e valores.</li>
            <li>Comece a receber aulas pela plataforma.</li>
          </ol>
          <p style="margin:24px 0">
            <a href="${APP_URL}/professor" style="background:#7c3aed;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;display:inline-block;font-weight:600">Entrar na área do professor</a>
          </p>
          <p style="font-size:12px;color:#64748b">Se você não solicitou este cadastro, ignore este e-mail.</p>
        </div>
      </body></html>`,
    };
  }
  const reason = notes?.trim()
    ? `<p style="background:#fef2f2;border:1px solid #fecaca;color:#991b1b;padding:12px;border-radius:8px"><strong>Motivo:</strong> ${escapeHtml(notes)}</p>`
    : "";
  return {
    subject: `${APP_NAME} — sobre seu cadastro de professor`,
    html: `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#ffffff;color:#0f172a;padding:24px">
      <div style="max-width:560px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;padding:28px">
        <h1 style="margin:0 0 12px;font-size:22px">Olá, ${escapeHtml(name)}.</h1>
        <p style="line-height:1.55">Agradecemos seu interesse em ensinar na ${APP_NAME}. Após análise, seu cadastro de professor <strong>não foi aprovado</strong> neste momento.</p>
        ${reason}
        <p style="line-height:1.55">Você pode continuar usando a plataforma como aluno normalmente. Caso queira reenviar seu cadastro com novas informações, basta responder este e-mail.</p>
        <p style="margin:24px 0">
          <a href="${APP_URL}" style="background:#0f172a;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;display:inline-block;font-weight:600">Voltar para a ${APP_NAME}</a>
        </p>
        <p style="font-size:12px;color:#64748b">Dúvidas? Responda este e-mail e nossa equipe te ajuda.</p>
      </div>
    </body></html>`,
  };
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!),
  );
}

export const sendTeacherDecisionEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => inputSchema.parse(data))
  .handler(async ({ data, context }) => {
    // Authorize: must be admin
    const { data: isAdmin, error: roleErr } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleErr) throw new Error(roleErr.message);
    if (!isAdmin) throw new Error("Forbidden");

    // Fetch teacher email + display name via admin client
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: userRes, error: userErr } = await supabaseAdmin.auth.admin.getUserById(data.teacherId);
    if (userErr || !userRes?.user?.email) {
      throw new Error(userErr?.message ?? "Teacher email not found");
    }
    const teacherEmail = userRes.user.email;
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("display_name")
      .eq("id", data.teacherId)
      .maybeSingle();
    const name = profile?.display_name ?? userRes.user.email.split("@")[0];

    const { subject, html } = buildSubjectAndBody(data.action, name, data.notes ?? undefined);

    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    const GOOGLE_MAIL_API_KEY = process.env.GOOGLE_MAIL_API_KEY;
    if (!LOVABLE_API_KEY || !GOOGLE_MAIL_API_KEY) {
      throw new Error("Gmail connector not configured");
    }

    const rfc2822 = [
      `From: ${FROM_NAME} <speak.and.chill.ofc@gmail.com>`,
      `To: ${teacherEmail}`,
      `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
      "MIME-Version: 1.0",
      'Content-Type: text/html; charset="UTF-8"',
      "Content-Transfer-Encoding: 7bit",
      "",
      html,
    ].join("\r\n");

    const res = await fetch(
      "https://connector-gateway.lovable.dev/google_mail/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": GOOGLE_MAIL_API_KEY,
        },
        body: JSON.stringify({ raw: b64url(rfc2822) }),
      },
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("[Gmail send] HTTP", res.status, text);
      throw new Error(`Falha ao enviar e-mail (${res.status})`);
    }

    return { ok: true as const, to: teacherEmail };
  });