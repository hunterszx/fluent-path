import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, BookOpen, Eye, Lock, Globe } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import {
  listDecks, createDeck, deleteDeck, listCards, createCard, deleteCard,
  type Deck, type CefrLevel, type Visibility,
} from "@/lib/flashcards-api";

export const Route = createFileRoute("/professor/flashcards")({ component: Page });

function Page() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Deck | null>(null);
  const [showNewDeck, setShowNewDeck] = useState(false);

  const decks = useQuery({
    queryKey: ["pf-decks", userId],
    queryFn: () => listDecks({ ownerOnly: userId }),
    enabled: !!userId,
  });

  const removeDeck = useMutation({
    mutationFn: (id: string) => deleteDeck(id),
    onSuccess: () => {
      toast.success("Deck excluído");
      setSelected(null);
      qc.invalidateQueries({ queryKey: ["pf-decks", userId] });
    },
    onError: (e: Error) => toast.error("Erro", { description: e.message }),
  });

  return (
    <div>
      <PageHeader
        title="Flashcards"
        subtitle="Crie decks e cards para seus alunos. Pronúncia, exemplos e tags."
        actions={
          <button
            onClick={() => setShowNewDeck(true)}
            className="flex items-center gap-2 rounded-xl gradient-brand px-4 py-2.5 text-sm font-semibold text-white glow-brand hover:opacity-95"
          >
            <Plus className="h-4 w-4" /> Novo deck
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-2">
          {decks.isLoading ? (
            [0, 1, 2].map((i) => <Skeleton key={i} className="h-20" />)
          ) : (decks.data ?? []).length === 0 ? (
            <div className="surface-card p-6 text-center text-sm text-muted-foreground">
              Nenhum deck ainda. Crie o primeiro.
            </div>
          ) : (
            (decks.data ?? []).map((d) => (
              <button
                key={d.id}
                onClick={() => setSelected(d)}
                className={`block w-full rounded-xl border bg-card p-4 text-left transition hover:bg-elevated ${
                  selected?.id === d.id ? "ring-2 ring-primary/60" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{d.title}</div>
                    <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      {d.level ?? "—"} · {d.visibility}
                    </div>
                  </div>
                  <span className="text-xl">{d.cover_emoji ?? "📘"}</span>
                </div>
              </button>
            ))
          )}
        </aside>

        <section className="min-w-0">
          {!selected ? (
            <div className="surface-card grid place-items-center p-10 text-center">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                Selecione um deck à esquerda ou crie um novo.
              </p>
            </div>
          ) : (
            <DeckEditor
              deck={selected}
              userId={userId}
              onDelete={() => removeDeck.mutate(selected.id)}
            />
          )}
        </section>
      </div>

      {showNewDeck && (
        <NewDeckDialog
          userId={userId}
          onClose={() => setShowNewDeck(false)}
          onCreated={(d) => {
            setSelected(d);
            setShowNewDeck(false);
            qc.invalidateQueries({ queryKey: ["pf-decks", userId] });
          }}
        />
      )}
    </div>
  );
}

function DeckEditor({ deck, userId, onDelete }: { deck: Deck; userId: string; onDelete: () => void }) {
  const qc = useQueryClient();
  const cards = useQuery({
    queryKey: ["pf-cards", deck.id],
    queryFn: () => listCards(deck.id),
  });

  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [example, setExample] = useState("");

  const addCard = useMutation({
    mutationFn: () =>
      createCard({
        deck_id: deck.id,
        owner_id: userId,
        front_text: front.trim(),
        back_text: back.trim(),
        example_sentence: example.trim() || null,
        source_type: "teacher",
        visibility: deck.visibility,
      }),
    onSuccess: () => {
      setFront(""); setBack(""); setExample("");
      qc.invalidateQueries({ queryKey: ["pf-cards", deck.id] });
      toast.success("Card adicionado");
    },
    onError: (e: Error) => toast.error("Erro", { description: e.message }),
  });

  const removeCard = useMutation({
    mutationFn: (id: string) => deleteCard(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pf-cards", deck.id] }),
  });

  const VisibilityIcon = deck.visibility === "public" ? Globe : deck.visibility === "shared" ? Eye : Lock;

  return (
    <div className="space-y-6">
      <div className="surface-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              <VisibilityIcon className="h-3.5 w-3.5" /> {deck.visibility}
              {deck.level && <span>· {deck.level}</span>}
            </div>
            <h2 className="mt-1 font-display text-2xl font-bold">{deck.title}</h2>
            {deck.description && <p className="mt-1 text-sm text-muted-foreground">{deck.description}</p>}
          </div>
          <button
            onClick={onDelete}
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" /> Excluir deck
          </button>
        </div>
      </div>

      <div className="surface-card p-6">
        <h3 className="font-display text-lg font-semibold">Novo flashcard</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Input label="Palavra / frente" value={front} onChange={setFront} placeholder="ex.: serendipity" />
          <Input label="Tradução / verso" value={back} onChange={setBack} placeholder="ex.: acaso feliz" />
          <div className="sm:col-span-2">
            <Input label="Frase de exemplo (opcional)" value={example} onChange={setExample} placeholder="ex.: It was pure serendipity that we met." />
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={() => addCard.mutate()}
            disabled={!front.trim() || !back.trim() || addCard.isPending}
            className="flex items-center gap-2 rounded-xl gradient-brand px-4 py-2.5 text-sm font-semibold text-white glow-brand transition hover:opacity-95 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Adicionar
          </button>
        </div>
      </div>

      <div className="surface-card p-6">
        <h3 className="font-display text-lg font-semibold">Cards do deck ({cards.data?.length ?? 0})</h3>
        <div className="mt-4 divide-y divide-border">
          {cards.isLoading ? (
            [0, 1].map((i) => <Skeleton key={i} className="my-2 h-12" />)
          ) : (cards.data ?? []).length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Nenhum card neste deck ainda.</p>
          ) : (
            (cards.data ?? []).map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <div className="truncate font-semibold">{c.front_text}</div>
                  <div className="truncate text-xs text-muted-foreground">{c.back_text}</div>
                </div>
                <button
                  onClick={() => removeCard.mutate(c.id)}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Excluir card"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function NewDeckDialog({
  userId, onClose, onCreated,
}: { userId: string; onClose: () => void; onCreated: (d: Deck) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState<CefrLevel | "">("");
  const [visibility, setVisibility] = useState<Visibility>("private");

  const create = useMutation({
    mutationFn: () =>
      createDeck({
        owner_id: userId,
        teacher_id: userId,
        title: title.trim(),
        description: description.trim() || null,
        topic: topic.trim() || null,
        level: (level || null) as CefrLevel | null,
        visibility,
        source_type: "teacher",
      }),
    onSuccess: (d) => { toast.success("Deck criado"); onCreated(d); },
    onError: (e: Error) => toast.error("Erro", { description: e.message }),
  });

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="surface-card w-full max-w-lg p-6">
        <h3 className="font-display text-xl font-bold">Novo deck</h3>
        <p className="mt-1 text-sm text-muted-foreground">Organize cards por tema, nível e visibilidade.</p>
        <div className="mt-4 space-y-3">
          <Input label="Título" value={title} onChange={setTitle} placeholder="ex.: Vocabulário B2 — Tecnologia" />
          <Input label="Descrição" value={description} onChange={setDescription} placeholder="Resumo curto do deck" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Tema" value={topic} onChange={setTopic} placeholder="ex.: business" />
            <div>
              <Label>Nível</Label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as CefrLevel | "")}
                className="mt-1 w-full rounded-xl border bg-card px-3 py-2.5 text-sm"
              >
                <option value="">—</option>
                {(["A1","A2","B1","B2","C1","C2"] as CefrLevel[]).map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Label>Visibilidade</Label>
            <div className="mt-1 grid grid-cols-3 gap-2">
              {(["private","shared","public"] as Visibility[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVisibility(v)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize transition ${
                    visibility === v ? "gradient-brand text-white" : "bg-muted/40 hover:bg-muted"
                  }`}
                >{v}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl border px-4 py-2 text-sm">Cancelar</button>
          <button
            onClick={() => create.mutate()}
            disabled={!title.trim() || create.isPending}
            className="rounded-xl gradient-brand px-4 py-2 text-sm font-semibold text-white glow-brand disabled:opacity-50"
          >
            Criar deck
          </button>
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{children}</div>;
}
function Input({
  label, value, onChange, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
      />
    </div>
  );
}