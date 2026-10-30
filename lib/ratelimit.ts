import "server-only";
import { createHash } from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type LimitResult = { ok: boolean; retryAfterSeconds: number };

type Window = { limit: number; windowSeconds: number };

// Upstash (free tier) in production; an in-memory sliding window when it isn't configured.
// In-memory limits reset per server instance, so they only protect local/dev use.
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;

const upstash = new Map<string, Ratelimit>();
const memory = new Map<string, number[]>();

export function clientKey(headers: Headers): string {
  const ip = headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "local";
  // Never store raw IPs (FR-017).
  return createHash("sha256")
    .update(`${process.env.AUTH_SECRET ?? "portfolio"}:${ip}`)
    .digest("hex")
    .slice(0, 32);
}

export async function rateLimit(bucket: string, key: string, { limit, windowSeconds }: Window): Promise<LimitResult> {
  if (redis) {
    let limiter = upstash.get(bucket);
    if (!limiter) {
      limiter = new Ratelimit({
        redis,
        prefix: `rl:${bucket}`,
        limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
      });
      upstash.set(bucket, limiter);
    }
    const r = await limiter.limit(key);
    return { ok: r.success, retryAfterSeconds: Math.max(0, Math.ceil((r.reset - Date.now()) / 1000)) };
  }
  return memoryLimit(`${bucket}:${key}`, { limit, windowSeconds });
}

export function memoryLimit(id: string, { limit, windowSeconds }: Window, now = Date.now()): LimitResult {
  const since = now - windowSeconds * 1000;
  const hits = (memory.get(id) ?? []).filter((t) => t > since);
  if (hits.length >= limit) {
    memory.set(id, hits);
    return { ok: false, retryAfterSeconds: Math.ceil((hits[0] + windowSeconds * 1000 - now) / 1000) };
  }
  hits.push(now);
  memory.set(id, hits);
  return { ok: true, retryAfterSeconds: 0 };
}
