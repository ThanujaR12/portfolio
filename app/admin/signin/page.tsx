import type { Metadata } from "next";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { auth, devLoginEnabled, isOwner, signIn } from "@/lib/auth";

/** Auth.js throws on a refused sign-in; show it as a message instead of an error page. */
async function attempt(provider: string, options: Record<string, string>) {
  try {
    await signIn(provider, options);
  } catch (e) {
    if (e instanceof AuthError)
      redirect(
        `/admin/signin?error=${e.type === "CallbackRouteError" || e.type === "CredentialsSignin" ? "AccessDenied" : e.type}`,
      );
    throw e;
  }
}

export const metadata: Metadata = { title: "Admin sign-in", robots: { index: false } };

const MESSAGES: Record<string, string> = {
  AccessDenied: "That GitHub account isn't allowed to manage this portfolio.",
  // Auth.js reports both missing keys and keys GitHub rejects as "Configuration".
  Configuration:
    "Sign-in couldn't complete. Check that AUTH_GITHUB_ID and AUTH_GITHUB_SECRET match your GitHub OAuth app; the server logs show GitHub's exact reason.",
  SessionExpired: "Your session expired. Sign in again to keep editing.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user && isOwner(session.user.login, session.user.githubId)) redirect("/admin");
  const { error } = await searchParams;
  const message = error ? (MESSAGES[error] ?? "Sign-in failed. Please try again.") : null;

  return (
    <section className="flex min-h-[80svh] items-center justify-center px-4 pt-24">
      <div className="glass w-full max-w-sm rounded-3xl p-8">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">{"// admin"}</p>
        <h1 className="mt-3 font-display text-2xl font-semibold">Manage your portfolio</h1>
        <p className="mt-2 text-sm text-muted">
          Only the portfolio owner&apos;s GitHub account can sign in.
        </p>
        {message && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm"
          >
            {message}
          </p>
        )}
        <form
          action={async () => {
            "use server";
            await attempt("github", { redirectTo: "/admin" });
          }}
          className="mt-6"
        >
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-medium text-canvas transition-opacity hover:opacity-90"
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 fill-current">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            Sign in with GitHub
          </button>
        </form>

        {devLoginEnabled && (
          <div className="mt-6 border-t border-line pt-5">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
              Development only
            </p>
            <div className="mt-3 flex gap-2">
              {[
                { login: process.env.ADMIN_GITHUB_LOGIN || "ThanujaR12", label: "Dev: owner" },
                { login: "someone-else", label: "Dev: other user" },
              ].map(({ login, label }) => (
                <form
                  key={login}
                  action={async () => {
                    "use server";
                    await attempt("dev", { login, redirectTo: "/admin" });
                  }}
                >
                  <button
                    type="submit"
                    className="rounded-lg border border-line px-3 py-1.5 text-xs hover:border-accent/50"
                  >
                    {label}
                  </button>
                </form>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
