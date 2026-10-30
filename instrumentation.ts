// Runs once when the server starts: report which services are configured.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { envReport, trimEnv } = await import("@/lib/env");
  // Values pasted into a hosting dashboard often carry a stray newline or space.
  for (const key of trimEnv(process.env)) {
    console.warn(`[env] ${key} had leading/trailing whitespace; it was trimmed. Clean it up in your host's settings.`);
  }
  const production = process.env.NODE_ENV === "production";
  for (const issue of envReport(process.env, production)) {
    (issue.level === "error" ? console.error : console.warn)(`[env] ${issue.message}`);
  }
}
