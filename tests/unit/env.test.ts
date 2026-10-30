import { describe, expect, it } from "vitest";
import { envReport } from "@/lib/env";

const full = {
  AUTH_SECRET: "x",
  AUTH_GITHUB_ID: "x",
  AUTH_GITHUB_SECRET: "x",
  CONTENT_SOURCE: "github",
  GITHUB_CONTENT_REPO: "ThanujaR12/portfolio",
  GITHUB_TOKEN: "x",
  GEMINI_API_KEY: "x",
  RESEND_API_KEY: "x",
  CONTACT_TO_EMAIL: "me@example.com",
  UPSTASH_REDIS_REST_URL: "x",
  UPSTASH_REDIS_REST_TOKEN: "x",
  CRON_SECRET: "x",
  NEXT_PUBLIC_SITE_URL: "https://example.com",
};

describe("envReport", () => {
  it("is quiet when production is fully configured", () => {
    expect(envReport(full, true)).toEqual([]);
  });

  it("explains each missing production service and its fallback", () => {
    const { GEMINI_API_KEY: _g, RESEND_API_KEY: _r, ...partial } = full;
    const messages = envReport(partial, true).map((i) => `${i.level}: ${i.message}`);
    expect(messages).toEqual([
      "warn: GEMINI_API_KEY not set: Ask AI uses offline rule-based answers instead of Gemini.",
      "error: RESEND_API_KEY not set: the contact form asks visitors to email directly.",
    ]);
  });

  it("flags admin edits that would be lost on redeploy", () => {
    const issues = envReport({ ...full, CONTENT_SOURCE: "fs" }, true);
    expect(issues.some((i) => i.message.includes("lost on the next deploy"))).toBe(true);
  });

  it("only needs an auth secret in development", () => {
    expect(envReport({ AUTH_SECRET: "x" }, false).map((i) => i.level)).toEqual(["warn"]);
    expect(envReport({}, false)[0]).toEqual({ level: "error", message: "AUTH_SECRET not set: admin sign-in cannot work." });
  });
});
