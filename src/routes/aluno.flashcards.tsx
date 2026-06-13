import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Layers, Sparkles, Search, Volume2, RotateCcw, Check, Flame, Trophy, BookOpen, Mic, Square, Loader2 } from "lucide-react";
import { PageHeader, StatCard } from "@/components/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { listDecks, getDueCards, recordReview, getReviewStats, type ReviewGrade } from "@/lib/flashcards-api";
import { assessPronunciation, type PronunciationFeedback } from "@/lib/pronunciation.functions";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

export const Route = createFileRoute("/aluno/flashcards")({ component: Page });

function Page() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const [tab, setTab] = useState<"revisar" | "biblioteca">("revisar");

  return (
    <div>
      <PageHeader
        title="Flashcards"
        subtitle="Estude com repetição espaçada. Memorização real, no seu ritmo."
      />

      <div className="mb-6 inline-flex rounded-xl border bg-card p-1">
        {(["revisar", "biblioteca"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition ${
              tab === t ? "gradient-brand text-white" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "revisar" ? <ReviewPanel userId={userId} /> : <Library userId={userId} />}
    </div>
  );
}

function ReviewPanel({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const stats = useQuery({
    queryKey: ["fc-stats", userId],
    queryFn: () => getReviewStats(userId),
    enabled: !!userId,
  });
  const due = useQuery({
    queryKey: ["fc-due", userId],
    queryFn: () => getDueCards(userId, 20),
    enabled: !!userId,
  });
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const items = due.data ?? [];
  const current = items[index];

  const review = useMutation({
    mutationFn: (grade: ReviewGrade) =>
      recordReview({ userId, cardId: current!.card.id, grade, previous: current!.review }),
    onSuccess: () => {
      setFlipped(false);
      if (index + 1 < items.length) setIndex(index + 1);
      else {
        qc.invalidateQueries({ queryKey: ["fc-due", userId] });
        qc.invalidateQueries({ queryKey: ["fc-stats", userId] });
        setIndex(0);
        toast.success("Sessão concluída!", { description: "Volte amanhã para manter o ritmo." });
      }
    },
    onError: (e: Error) => toast.error("Não foi possível salvar", { description: e.message }),
  });

  function speak(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="A REVISAR" value={stats.data?.due ?? "—"} icon={Layers} tone="brand" />
        <StatCard label="ESTUDADOS" value={stats.data?.studied ?? "—"} icon={BookOpen} />
        <StatCard label="DOMINADOS" value={stats.data?.mastered ?? "—"} icon={Trophy} tone="success" />
        <StatCard label="DIFÍCEIS" value={stats.data?.hard ?? "—"} icon={Flame} tone="warning" />
      </div>

      {due.isLoading ? (
        <Skeleton className="h-72 w-full" />
      ) : !current ? (
        <EmptyState />
      ) : (
        <div className="surface-card mx-auto max-w-2xl p-6 sm:p-10">
          <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>Card {index + 1} de {items.length}</span>
            <span className="rounded-full bg-elevated px-2 py-0.5 font-semibold capitalize">
              {current.review?.status ?? "novo"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            className="block w-full rounded-2xl border bg-elevated p-8 text-center transition hover:ring-1 hover:ring-primary/40"
          >
            <div className="text-[11px] font-semibold tracking-[0.18em] text-brand-2">
              {flipped ? "TRADUÇÃO" : "PALAVRA"}
            </div>
            <div className="mt-4 font-display text-3xl font-bold sm:text-4xl">
              {flipped ? current.card.back_text : current.card.front_text}
            </div>
            {flipped && current.card.example_sentence && (
              <p className="mt-4 text-sm italic text-muted-foreground">
                “{current.card.example_sentence}”
              </p>
            )}
            <div className="mt-6 text-xs text-muted-foreground">
              Toque para {flipped ? "voltar" : "ver tradução"}
            </div>
          </button>

          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => speak(current.card.front_text)}
              className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-elevated"
            >
              <Volume2 className="h-3.5 w-3.5" /> Ouvir pronúncia
            </button>
          </div>

          <PronunciationCoach
            cardId={current.card.id}
            target={current.card.front_text}
          />

          {flipped && (
            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <GradeButton label="De novo" tone="danger" onClick={() => review.mutate("again")} disabled={review.isPending} />
              <GradeButton label="Difícil" tone="warn" onClick={() => review.mutate("hard")} disabled={review.isPending} />
              <GradeButton label="Bom" tone="brand" onClick={() => review.mutate("good")} disabled={review.isPending} />
              <GradeButton label="Fácil" tone="success" onClick={() => review.mutate("easy")} disabled={review.isPending} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GradeButton({
  label, tone, onClick, disabled,
}: { label: string; tone: "danger" | "warn" | "brand" | "success"; onClick: () => void; disabled?: boolean }) {
  const cls =
    tone === "danger" ? "bg-destructive/15 text-destructive hover:bg-destructive/25" :
    tone === "warn" ? "bg-warning/15 text-warning hover:bg-warning/25" :
    tone === "success" ? "bg-success/15 text-success hover:bg-success/25" :
    "gradient-brand text-white";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl px-3 py-3 text-sm font-semibold transition disabled:opacity-50 ${cls}`}
    >
      {label}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="surface-card mx-auto max-w-2xl p-10 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl gradient-brand glow-brand">
        <Sparkles className="h-6 w-6 text-white" />
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold">Tudo em dia por aqui ✨</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Não há cards para revisar agora. Adicione decks na sua biblioteca ou aguarde o próximo intervalo de revisão.
      </p>
    </div>
  );
}

function Library({ userId }: { userId: string }) {
  const [q, setQ] = useState("");
  const decks = useQuery({
    queryKey: ["fc-decks-all"],
    queryFn: () => listDecks(),
    enabled: !!userId,
  });

  const filtered = useMemo(() => {
    const all = decks.data ?? [];
    if (!q) return all;
    const t = q.toLowerCase();
    return all.filter((d) =>
      d.title.toLowerCase().includes(t) || (d.topic ?? "").toLowerCase().includes(t),
    );
  }, [decks.data, q]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 rounded-xl border bg-card px-3.5">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por palavra, tema, nível…"
          className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {decks.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="surface-card p-10 text-center text-muted-foreground">
          Nenhum deck disponível ainda. Peça ao seu professor para compartilhar um deck com você.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => (
            <div key={d.id} className="surface-elevated p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground">
                    {d.source_type.toUpperCase()}{d.level ? ` · ${d.level}` : ""}
                  </div>
                  <div className="mt-1 font-display text-lg font-semibold">{d.title}</div>
                </div>
                <span className="text-2xl">{d.cover_emoji ?? "📘"}</span>
              </div>
              {d.description && <p className="mt-2 text-xs text-muted-foreground">{d.description}</p>}
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Check className="h-3.5 w-3.5" /> {d.topic ?? "geral"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Silence unused-import warning when tree-shake doesn't catch it
void RotateCcw;

function PronunciationCoach({ cardId, target }: { cardId: string; target: string }) {
  const assess = useServerFn(assessPronunciation);
  const [recording, setRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<PronunciationFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function start() {
    setError(null);
    setFeedback(null);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("Microfone não suportado neste navegador.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "";
      const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = async () => {
        stopStream();
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        await analyze(blob);
      };
      recorderRef.current = rec;
      rec.start();
      setRecording(true);
      // Auto-stop após 8s para evitar áudios longos.
      setTimeout(() => {
        if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      }, 8000);
    } catch {
      setError("Permissão de microfone negada.");
    }
  }

  function stop() {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    setRecording(false);
  }

  async function analyze(blob: Blob) {
    setAnalyzing(true);
    try {
      const buf = await blob.arrayBuffer();
      // base64 encode
      let binary = "";
      const bytes = new Uint8Array(buf);
      const chunk = 0x8000;
      for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
      }
      const audioBase64 = btoa(binary);
      const audioFormat = blob.type.includes("mp4") ? "mp4" : "webm";
      const res = await assess({
        data: { audioBase64, audioFormat, expectedText: target, flashcardId: cardId },
      });
      setFeedback(res);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Falha ao analisar áudio.";
      setError(msg);
      toast.error("Não foi possível analisar", { description: msg });
    } finally {
      setAnalyzing(false);
      setRecording(false);
    }
  }

  const scoreColor = feedback
    ? feedback.score >= 80 ? "text-success" : feedback.score >= 60 ? "text-brand-2" : "text-warning"
    : "";

  return (
    <div className="mt-6 rounded-2xl border bg-card/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold tracking-[0.18em] text-brand-2">PRONÚNCIA · IA</div>
          <div className="text-xs text-muted-foreground">Grave sua voz e receba feedback instantâneo.</div>
        </div>
        {!recording ? (
          <button
            onClick={start}
            disabled={analyzing}
            className="flex items-center gap-2 rounded-lg gradient-brand px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            {analyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mic className="h-3.5 w-3.5" />}
            {analyzing ? "Analisando…" : "Gravar"}
          </button>
        ) : (
          <button
            onClick={stop}
            className="flex items-center gap-2 rounded-lg bg-destructive/15 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/25"
          >
            <Square className="h-3.5 w-3.5" /> Parar
          </button>
        )}
      </div>

      {recording && (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
          </span>
          Gravando… (parará automaticamente em 8s)
        </div>
      )}

      {error && <div className="mt-3 text-xs text-destructive">{error}</div>}

      {feedback && (
        <div className="mt-4 space-y-3 rounded-xl bg-elevated p-4">
          <div className="flex items-baseline justify-between">
            <div className="text-xs text-muted-foreground">Você disse: <span className="text-foreground italic">“{feedback.transcript || "—"}”</span></div>
            <div className={`font-display text-2xl font-bold ${scoreColor}`}>{Math.round(feedback.score)}<span className="text-xs text-muted-foreground">/100</span></div>
          </div>
          <p className="text-sm">{feedback.feedback}</p>
          {feedback.strengths.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold tracking-wider text-success">PONTOS FORTES</div>
              <ul className="mt-1 list-inside list-disc text-xs text-muted-foreground">
                {feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
          {feedback.improvements.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold tracking-wider text-warning">A MELHORAR</div>
              <ul className="mt-1 list-inside list-disc text-xs text-muted-foreground">
                {feedback.improvements.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}