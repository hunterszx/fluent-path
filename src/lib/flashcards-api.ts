import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Deck = Database["public"]["Tables"]["flashcard_decks"]["Row"];
export type Card = Database["public"]["Tables"]["flashcards"]["Row"];
export type Review = Database["public"]["Tables"]["flashcard_reviews"]["Row"];
export type DeckInsert = Database["public"]["Tables"]["flashcard_decks"]["Insert"];
export type CardInsert = Database["public"]["Tables"]["flashcards"]["Insert"];
export type CefrLevel = Database["public"]["Enums"]["cefr_level"];
export type Visibility = Database["public"]["Enums"]["card_visibility"];
export type Source = Database["public"]["Enums"]["card_source"];

/** Decks visible to current user (RLS does the filtering). */
export async function listDecks(opts?: { ownerOnly?: string; visibility?: Visibility }) {
  let q = supabase
    .from("flashcard_decks")
    .select("*")
    .order("updated_at", { ascending: false });
  if (opts?.ownerOnly) q = q.eq("owner_id", opts.ownerOnly);
  if (opts?.visibility) q = q.eq("visibility", opts.visibility);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getDeck(deckId: string) {
  const { data, error } = await supabase
    .from("flashcard_decks")
    .select("*")
    .eq("id", deckId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createDeck(input: Omit<DeckInsert, "owner_id"> & { owner_id: string }) {
  const { data, error } = await supabase
    .from("flashcard_decks")
    .insert(input)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateDeck(id: string, patch: Partial<DeckInsert>) {
  const { data, error } = await supabase
    .from("flashcard_decks")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteDeck(id: string) {
  const { error } = await supabase.from("flashcard_decks").delete().eq("id", id);
  if (error) throw error;
}

export async function listCards(deckId: string) {
  const { data, error } = await supabase
    .from("flashcards")
    .select("*")
    .eq("deck_id", deckId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createCard(input: CardInsert) {
  const { data, error } = await supabase
    .from("flashcards")
    .insert(input)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCard(id: string) {
  const { error } = await supabase.from("flashcards").delete().eq("id", id);
  if (error) throw error;
}

/** Cards due for review for current user (joined with reviews state). */
export async function getDueCards(userId: string, limit = 20) {
  // 1. fetch reviews due or new
  const { data: reviews, error } = await supabase
    .from("flashcard_reviews")
    .select("*")
    .eq("user_id", userId)
    .lte("next_review_at", new Date().toISOString())
    .order("next_review_at", { ascending: true })
    .limit(limit);
  if (error) throw error;

  const reviewedIds = (reviews ?? []).map((r) => r.flashcard_id);
  let cards: Card[] = [];
  if (reviewedIds.length) {
    const { data: c, error: e2 } = await supabase
      .from("flashcards")
      .select("*")
      .in("id", reviewedIds);
    if (e2) throw e2;
    cards = c ?? [];
  }

  // 2. backfill with brand-new cards (no review row yet) from accessible decks
  if (cards.length < limit) {
    const { data: newCards } = await supabase
      .from("flashcards")
      .select("*")
      .not("id", "in", `(${reviewedIds.length ? reviewedIds.join(",") : "00000000-0000-0000-0000-000000000000"})`)
      .limit(limit - cards.length);
    cards = [...cards, ...(newCards ?? [])];
  }

  const byId = new Map((reviews ?? []).map((r) => [r.flashcard_id, r]));
  return cards.map((c) => ({ card: c, review: byId.get(c.id) ?? null }));
}

export type ReviewGrade = "again" | "hard" | "good" | "easy";

/** Lightweight SM-2 inspired update. */
function nextReviewState(prev: Review | null, grade: ReviewGrade) {
  let ease = prev?.ease ? Number(prev.ease) : 2.5;
  let interval = prev?.interval_days ?? 0;
  let correct = prev?.correct_count ?? 0;
  let wrong = prev?.wrong_count ?? 0;
  let status: Database["public"]["Enums"]["review_status"] = "learning";

  if (grade === "again") {
    interval = 0;
    ease = Math.max(1.3, ease - 0.2);
    wrong += 1;
    status = "hard";
  } else if (grade === "hard") {
    interval = Math.max(1, Math.round(interval * 1.2));
    ease = Math.max(1.3, ease - 0.05);
    correct += 1;
    status = "hard";
  } else if (grade === "good") {
    interval = interval === 0 ? 1 : Math.round(interval * ease);
    correct += 1;
    status = interval >= 21 ? "mastered" : "learning";
  } else {
    interval = interval === 0 ? 3 : Math.round(interval * ease * 1.3);
    ease += 0.15;
    correct += 1;
    status = interval >= 14 ? "mastered" : "learning";
  }

  const next = new Date();
  next.setDate(next.getDate() + Math.max(0, interval));
  const mastery = Math.min(100, Math.round((correct / Math.max(1, correct + wrong)) * 100));

  return {
    status,
    interval_days: interval,
    ease: Number(ease.toFixed(2)),
    correct_count: correct,
    wrong_count: wrong,
    mastery_score: mastery,
    last_reviewed_at: new Date().toISOString(),
    next_review_at: next.toISOString(),
  };
}

export async function recordReview(params: {
  userId: string;
  cardId: string;
  grade: ReviewGrade;
  previous: Review | null;
}) {
  const patch = nextReviewState(params.previous, params.grade);
  const { data, error } = await supabase
    .from("flashcard_reviews")
    .upsert(
      { user_id: params.userId, flashcard_id: params.cardId, ...patch },
      { onConflict: "flashcard_id,user_id" },
    )
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function getReviewStats(userId: string) {
  const { data, error } = await supabase
    .from("flashcard_reviews")
    .select("status,next_review_at")
    .eq("user_id", userId);
  if (error) throw error;
  const rows = data ?? [];
  const now = Date.now();
  return {
    studied: rows.length,
    mastered: rows.filter((r) => r.status === "mastered").length,
    hard: rows.filter((r) => r.status === "hard").length,
    due: rows.filter((r) => new Date(r.next_review_at ?? 0).getTime() <= now).length,
  };
}

export async function saveCardToLibrary(userId: string, cardId: string, deckId: string, source: Source) {
  const { error } = await supabase
    .from("student_flashcards")
    .upsert(
      { user_id: userId, flashcard_id: cardId, deck_id: deckId, source_type: source },
      { onConflict: "user_id,flashcard_id" },
    );
  if (error) throw error;
}