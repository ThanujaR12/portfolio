import "server-only";
import { GoogleGenAI } from "@google/genai";
import type { Corpus } from "@/lib/ai/corpus";
import { localAnswer } from "@/lib/ai/local";
import { systemPrompt } from "@/lib/ai/prompt";
import type { PortfolioProject } from "@/lib/content/merge";
import type { Profile } from "@/lib/schemas";

export type ChatMessage = { role: "user" | "assistant"; content: string };
export type ChatContext = { profile: Profile; projects: PortfolioProject[]; corpus: Corpus };
export type Provider = (ctx: ChatContext, messages: ChatMessage[]) => AsyncIterable<string>;

const gemini: Provider = async function* (ctx, messages) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const stream = await ai.models.generateContentStream({
    model: process.env.GEMINI_MODEL || "gemini-flash-latest",
    contents: messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    config: {
      systemInstruction: systemPrompt(ctx.profile.name, ctx.corpus),
      temperature: 0.3,
      maxOutputTokens: 400,
    },
  });
  for await (const chunk of stream) {
    if (chunk.text) yield chunk.text;
  }
};

// Offline, rule-based answers from the same content: used when no Gemini key is configured
// and in tests, so the assistant never needs a paid or even a networked service to work.
const local: Provider = async function* (ctx, messages) {
  const question = messages.findLast((m) => m.role === "user")?.content ?? "";
  for (const word of localAnswer(question, ctx).split(/(?<= )/)) {
    yield word;
    await new Promise((r) => setTimeout(r, 12));
  }
};

export function getProvider(): { name: "gemini" | "local"; run: Provider } {
  const wantsGemini = process.env.AI_PROVIDER !== "mock" && Boolean(process.env.GEMINI_API_KEY);
  return wantsGemini ? { name: "gemini", run: gemini } : { name: "local", run: local };
}
