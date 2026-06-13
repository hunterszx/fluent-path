import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Pluggable pronunciation pipeline.
 *
 * MVP provider: Lovable AI Gateway (Gemini multimodal audio).
 * The provider is selected by the `provider` field so a dedicated STT
 * service can be added later without touching call sites.
 */

const InputSchema = z.object({
  audioBase64: z.string().min(32),
  audioFormat: z.enum(["webm", "mp4", "m4a", "wav", "mp3", "ogg"]).default("webm"),
  expectedText: z.string().min(1).max(500),
  language: z.string().default("en-US"),
  flashcardId: z.string().uuid().optional(),
  provider: z.enum(["lovable-gemini"]).default("lovable-gemini"),
});

export type PronunciationFeedback = {
  transcript: string;
  score: number; // 0–100
  feedback: string;
  strengths: string[];
  improvements: string[];
  provider: string;
};

const SYSTEM_PROMPT = `You are a professional English pronunciation coach.
You will receive an audio clip of a learner attempting to pronounce a target word or sentence.

Return ONLY a compact JSON object (no markdown, no commentary) matching:
{
  "transcript": string,        // what you actually heard
  "score": number,             // 0–100, overall pronunciation accuracy vs target
  "feedback": string,          // 1–2 short sentences, friendly, in Brazilian Portuguese
  "strengths": string[],       // up to 2 short bullet phrases (PT-BR)
  "improvements": string[]     // up to 3 short bullet phrases (PT-BR)
}

Scoring guide: 90+ near-native, 75–89 clear, 60–74 understandable, 40–59 needs work, <40 unclear.`;

async function callLovableGemini(args: {
  audioBase64: string;
  audioFormat: string;
  expectedText: string;
  apiKey: string;
}): Promise<PronunciationFeedback> {
  const userText = `Target phrase: "${args.expectedText}"\nEvaluate the learner's pronunciation of this phrase.`;

  const body = {
    model: "google/gemini-2.5-flash",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: userText },
          {
            type: "input_audio",
            input_audio: { data: args.audioBase64, format: args.audioFormat },
          },
        ],
      },
    ],
    response_format: { type: "json_object" },
  };

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": args.apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("Limite de uso da IA atingido. Tente novamente em instantes.");
    if (res.status === 402) throw new Error("Créditos de IA esgotados. Adicione créditos para continuar.");
    throw new Error(`Falha na IA (${res.status}): ${text.slice(0, 200)}`);
  }

  const json = await res.json();
  const content: string = json?.choices?.[0]?.message?.content ?? "{}";

  let parsed: Partial<PronunciationFeedback> = {};
  try {
    parsed = JSON.parse(content);
  } catch {
    // try to extract a JSON object substring
    const m = content.match(/\{[\s\S]*\}/);
    if (m) parsed = JSON.parse(m[0]);
  }

  const score = Math.max(0, Math.min(100, Number(parsed.score ?? 0)));

  return {
    transcript: String(parsed.transcript ?? ""),
    score,
    feedback: String(parsed.feedback ?? "Continue praticando!"),
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 3).map(String) : [],
    improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 3).map(String) : [],
    provider: "lovable-gemini",
  };
}

export const assessPronunciation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY ausente no servidor.");

    let result: PronunciationFeedback;
    switch (data.provider) {
      case "lovable-gemini":
      default:
        result = await callLovableGemini({
          audioBase64: data.audioBase64,
          audioFormat: data.audioFormat,
          expectedText: data.expectedText,
          apiKey,
        });
    }

    // Persist attempt (RLS scopes to current user).
    const { error } = await context.supabase.from("pronunciation_attempts").insert({
      user_id: context.userId,
      flashcard_id: data.flashcardId ?? null,
      transcript: result.transcript,
      score: result.score,
      feedback_text: result.feedback,
    });
    if (error) console.error("pronunciation_attempts insert failed", error);

    return result;
  });