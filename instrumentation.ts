// Runs once when the server starts: report which services are configured.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { envReport } = await import("@/lib/env");
  const production = process.env.NODE_ENV === "production";
  for (const issue of envReport(process.env, production)) {
    (issue.level === "error" ? console.error : console.warn)(`[env] ${issue.message}`);
  }
}
