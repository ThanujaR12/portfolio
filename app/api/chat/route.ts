import { CitationStream, validateCitations } from "@/lib/ai/citations";
import { buildCorpus } from "@/lib/ai/corpus";
import { getProvider } from "@/lib/ai/providers";
import { getPortfolio } from "@/lib/content/portfolio";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import { chatRequestSchema } from "@/lib/schemas";

// POST /api/chat — contracts/http-api.md. Streams SSE: token* → citations → done.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 20/hour in production (FR-016); generous in dev so repeated local testing isn't blocked.
const CHAT_LIMIT = {
  limit: Number(process.env.CHAT_LIMIT_PER_HOUR) || (process.env.NODE_ENV === "production" ? 20 : 500),
  windowSeconds: 3600,
};

const error = (status: number, code: string, message: string, extra: object = {}) =>
  Response.json({ error: { code, message, ...extra } }, { status });

export async function POST(request: Request) {
  const parsed = chatRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return error(400, "invalid_input", "Please send a question of up to 1,000 characters.");

  const limit = await rateLimit("chat", clientKey(request.headers), CHAT_LIMIT);
  if (!limit.ok) {
    return error(429, "rate_limited", "You've reached the question limit for now.", {
      retryAfterSeconds: limit.retryAfterSeconds,
    });
  }

  const { profile, projects } = await getPortfolio();
  const corpus = buildCorpus(profile, projects);
  const provider = getProvider();

  // Pull the first chunk before answering so an unavailable AI service is a clean 503.
  let iterator: AsyncIterator<string>;
  let first: IteratorResult<string>;
  try {
    iterator = provider.run({ profile, projects, corpus }, parsed.data.messages)[Symbol.asyncIterator]();
    first = await iterator.next();
  } catch (e) {
    console.error(`chat: ${provider.name} provider failed`, e);
    return error(503, "ai_unavailable", "The AI guide is unavailable right now.");
  }

  const encoder = new TextEncoder();
  const send = (controller: ReadableStreamDefaultController, event: string, data: object) =>
    controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));

  const body = new ReadableStream({
    async start(controller) {
      const parser = new CitationStream();
      const emit = (text: string) => text && send(controller, "token", { t: text });
      try {
        for (let r = first; !r.done; r = await iterator.next()) emit(parser.push(r.value));
        const { text, slugs } = parser.finish();
        emit(text);
        send(controller, "citations", { projects: validateCitations(slugs, corpus.slugs) });
      } catch (e) {
        console.error(`chat: ${provider.name} stream failed`, e);
        send(controller, "error", { code: "ai_unavailable" });
      }
      send(controller, "done", {});
      controller.close();
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store",
      "X-AI-Provider": provider.name,
    },
  });
}
