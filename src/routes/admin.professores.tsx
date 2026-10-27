import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Check, X, RefreshCw, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { sendTeacherDecisionEmail } from "@/lib/teacher-emails.functions";

type TeacherStatus = "none" | "pending" | "approved" | "rejected";

interface ProfileRow {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  english_level: string | null;
  native_language: string | null;
  teacher_status: TeacherStatus;
  created_at: string;
}

interface AuditRow {
  id: string;
  teacher_id: string;
  admin_id: string;
  action: "approved" | "rejected";
  notes: string | null;
  created_at: string;
  admin_name: string | null;
}

const TABS: { key: TeacherStatus; label: string }[] = [
  { key: "pending", label: "Pendentes" },
  { key: "approved", label: "Aprovados" },
  { key: "rejected", label: "Rejeitados" },
];

function ProfessoresPage() {
  const [tab, setTab] = useState<TeacherStatus>("pending");
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [audit, setAudit] = useState<Record<string, AuditRow | undefined>>({});
  const sendEmail = useServerFn(sendTeacherDecisionEmail);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, english_level, native_language, teacher_status, created_at")
      .eq("teacher_status", tab)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    const profiles = (data ?? []) as ProfileRow[];
    setRows(profiles);

    if (tab !== "pending" && profiles.length > 0) {
      const ids = profiles.map((p) => p.id);
      const { data: auditRows } = await supabase
        .from("teacher_approval_audit")
        .select("id, teacher_id, admin_id, action, notes, created_at")
        .in("teacher_id", ids)
        .order("created_at", { ascending: false });
      const adminIds = Array.from(new Set((auditRows ?? []).map((r) => r.admin_id)));
      const { data: admins } = adminIds.length
        ? await supabase.from("profiles").select("id, display_name").in("id", adminIds)
        : { data: [] as { id: string; display_name: string | null }[] };
      const nameById = new Map((admins ?? []).map((a) => [a.id, a.display_name]));
      const latest: Record<string, AuditRow> = {};
      for (const r of (auditRows ?? []) as Omit<AuditRow, "admin_name">[]) {
        if (!latest[r.teacher_id]) {
          latest[r.teacher_id] = { ...r, admin_name: nameById.get(r.admin_id) ?? null };
        }
      }
      setAudit(latest);
    } else {
      setAudit({});
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function act(id: string, action: "approve" | "reject") {
    const notes =
      action === "reject"
        ? window.prompt("Motivo da rejeição (opcional, será registrado):") ?? undefined
        : undefined;
    setActing(id);
    const fn = action === "approve" ? "approve_teacher" : "reject_teacher";
    const { error } = await supabase.rpc(fn, { _user_id: id, _notes: notes ?? null });
    if (error) {
      setActing(null);
      toast.error(error.message);
      return;
    }
    try {
      await sendEmail({
        data: {
          teacherId: id,
          action: action === "approve" ? "approved" : "rejected",
          notes: notes ?? null,
        },
      });
      toast.success(
        action === "approve"
          ? "Professor aprovado — e-mail enviado"
          : "Cadastro rejeitado — e-mail enviado",
      );
    } catch (e) {
      toast.warning(
        `${action === "approve" ? "Aprovado" : "Rejeitado"}, mas falhou o envio do e-mail: ${
          e instanceof Error ? e.message : "erro desconhecido"
        }`,
      );
    }
    setActing(null);
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  const counts = useMemo(() => ({ shown: rows.length }), [rows]);

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Professores</h1>
          <p className="text-sm text-muted-foreground">
            Aprove ou rejeite cadastros de professores.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={loading ? "animate-spin" : ""} /> Atualizar
        </Button>
      </header>

      <div className="flex gap-2 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin" /> Carregando…
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
          Nenhum professor {tab === "pending" ? "pendente" : tab === "approved" ? "aprovado" : "rejeitado"}.
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li
              key={r.id}
              className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                {r.avatar_url ? (
                  <img src={r.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-muted grid place-items-center text-sm font-medium">
                    {(r.display_name ?? "?").slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="font-medium truncate">{r.display_name ?? "Sem nome"}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {r.native_language ?? "—"} · Nível {r.english_level ?? "—"} ·{" "}
                    {new Date(r.created_at).toLocaleDateString("pt-BR")}
                  </div>
                  {tab !== "pending" && audit[r.id] && (
                    <div className="mt-1 flex items-start gap-1 text-xs text-muted-foreground">
                      <History className="h-3 w-3 mt-0.5 shrink-0" />
                      <span className="truncate">
                        {audit[r.id]!.action === "approved" ? "Aprovado" : "Rejeitado"} por{" "}
                        <span className="font-medium text-foreground">
                          {audit[r.id]!.admin_name ?? "admin"}
                        </span>{" "}
                        em{" "}
                        {new Date(audit[r.id]!.created_at).toLocaleString("pt-BR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                        {audit[r.id]!.notes ? ` — "${audit[r.id]!.notes}"` : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {tab === "pending" && (
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => act(r.id, "reject")}
                    disabled={acting === r.id}
                  >
                    {acting === r.id ? <Loader2 className="animate-spin" /> : <X />} Rejeitar
                  </Button>
                  <Button size="sm" onClick={() => act(r.id, "approve")} disabled={acting === r.id}>
                    {acting === r.id ? <Loader2 className="animate-spin" /> : <Check />} Aprovar
                  </Button>
                </div>
              )}
              {tab === "rejected" && (
                <Button size="sm" onClick={() => act(r.id, "approve")} disabled={acting === r.id}>
                  {acting === r.id ? <Loader2 className="animate-spin" /> : <Check />} Aprovar
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">{counts.shown} resultado(s)</p>
    </div>
  );
}

export const Route = createFileRoute("/admin/professores")({
  head: () => ({ meta: [{ title: "Administração · Professores — Lunari" }, { name: "description", content: "Administração · Professores na Lunari, plataforma de aprendizado de inglês com flashcards, pronúncia e aulas." }, { property: "og:title", content: "Administração · Professores — Lunari" }, { property: "og:description", content: "Administração · Professores na Lunari, plataforma de aprendizado de inglês com flashcards, pronúncia e aulas." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }), component: ProfessoresPage });