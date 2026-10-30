// Startup check of the environment (task T004). Nothing here crashes the site: every missing
// service has a fallback, but in production the owner should know which one is active.

export type EnvIssue = { level: "error" | "warn"; message: string };

type Env = Record<string, string | undefined>;

export function envReport(env: Env, production: boolean): EnvIssue[] {
  const issues: EnvIssue[] = [];
  const missing = (...keys: string[]) => keys.filter((k) => !env[k]);
  const add = (level: EnvIssue["level"], keys: string[], effect: string) => {
    if (keys.length) issues.push({ level, message: `${keys.join(", ")} not set: ${effect}` });
  };

  add("error", missing("AUTH_SECRET"), "admin sign-in cannot work.");
  add(production ? "error" : "warn", missing("AUTH_GITHUB_ID", "AUTH_GITHUB_SECRET"), "GitHub sign-in to /admin is unavailable.");

  if (env.CONTENT_SOURCE === "github") {
    add("error", missing("GITHUB_CONTENT_REPO", "GITHUB_TOKEN"), "admin edits can't be saved to the content repo.");
  } else if (production) {
    issues.push({
      level: "warn",
      message: "CONTENT_SOURCE is not \"github\": admin edits are written to the server's disk and lost on the next deploy.",
    });
  }

  if (!production) return issues;

  add("warn", missing("GEMINI_API_KEY"), "Ask AI uses offline rule-based answers instead of Gemini.");
  add("error", missing("RESEND_API_KEY", "CONTACT_TO_EMAIL"), "the contact form asks visitors to email directly.");
  add("warn", missing("UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"), "rate limits are per server instance only.");
  add("warn", missing("CRON_SECRET"), "the daily GitHub sync is disabled (Sync now still works).");
  add("warn", missing("NEXT_PUBLIC_SITE_URL"), "share links and the sitemap point at localhost.");
  if (env.ADMIN_DEV_LOGIN === "1") {
    issues.push({ level: "warn", message: "ADMIN_DEV_LOGIN is set but ignored in production builds; remove it." });
  }
  return issues;
}
