import { EmailNotConfigured, sendContactEmail } from "@/lib/email";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import { contactMessageSchema } from "@/lib/schemas";

// POST /api/contact — contracts/http-api.md. Spam defence without a CAPTCHA (FR-028):
// honeypot field, minimum fill time and a per-visitor rate limit.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_FILL_MS = 3000;
const CONTACT_LIMIT = {
  limit: Number(process.env.CONTACT_LIMIT_PER_HOUR) || (process.env.NODE_ENV === "production" ? 3 : 100),
  windowSeconds: 3600,
};

const error = (status: number, code: string, message: string, extra: object = {}) =>
  Response.json({ error: { code, message, ...extra } }, { status });

export async function POST(request: Request) {
  const parsed = contactMessageSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const fields = Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message]));
    return error(400, "invalid_input", "Please fix the highlighted fields.", { fields });
  }
  const { name, email, message, website, startedAt } = parsed.data;

  // Bots: pretend success so they learn nothing, but send nothing.
  if (website || Date.now() - startedAt < MIN_FILL_MS) return Response.json({ ok: true });

  const limit = await rateLimit("contact", clientKey(request.headers), CONTACT_LIMIT);
  if (!limit.ok) {
    return error(429, "rate_limited", "You've sent several messages already. Please try again later.", {
      retryAfterSeconds: limit.retryAfterSeconds,
    });
  }

  try {
    await sendContactEmail({ name, email, message });
  } catch (e) {
    console.error("contact: send failed", e);
    const notSetUp = e instanceof EmailNotConfigured;
    return error(
      notSetUp ? 503 : 502,
      "send_failed",
      "Your message couldn't be sent right now. Please email directly instead.",
    );
  }
  return Response.json({ ok: true });
}
