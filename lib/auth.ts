import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";

// Admin sign-in (research.md R4). Only the owner's GitHub account gets a session; every admin
// route re-checks with requireOwner(), so the UI is never the only gate (Principle V).

declare module "next-auth" {
  interface Session {
    user: { login?: string; githubId?: string } & DefaultSession["user"];
  }
}

const ownerLogin = () => (process.env.ADMIN_GITHUB_LOGIN || "ThanujaR12").toLowerCase();

export function isOwner(login: unknown, githubId?: unknown): boolean {
  if (typeof login !== "string" || login.toLowerCase() !== ownerLogin()) return false;
  // Logins can be renamed and re-registered; the numeric id can't. Pin it once known.
  const pinnedId = process.env.ADMIN_GITHUB_ID;
  return !pinnedId || String(githubId) === pinnedId;
}

// Local-only sign-in for development and e2e tests when no GitHub OAuth app is set up.
// Never available in a production build.
export const devLoginEnabled =
  process.env.NODE_ENV === "development" && process.env.ADMIN_DEV_LOGIN === "1";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/admin/signin", error: "/admin/signin" },
  providers: [
    // Trimmed explicitly too: a newline pasted after the id makes GitHub answer 404.
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID?.trim(),
      clientSecret: process.env.AUTH_GITHUB_SECRET?.trim(),
    }),
    ...(devLoginEnabled
      ? [
          Credentials({
            id: "dev",
            name: "Development login",
            credentials: { login: {} },
            authorize: (c) =>
              typeof c?.login === "string" ? { id: `dev-${c.login}`, name: c.login, login: c.login } : null,
          }),
        ]
      : []),
  ],
  callbacks: {
    signIn({ account, profile, user }) {
      if (account?.provider === "github") return isOwner(profile?.login, profile?.id);
      if (account?.provider === "dev") return isOwner((user as { login?: string }).login);
      return false;
    },
    jwt({ token, account, profile, user }) {
      if (account?.provider === "github" && profile) {
        token.login = profile.login;
        token.githubId = String(profile.id);
      } else if (account?.provider === "dev") {
        token.login = (user as { login?: string }).login;
      }
      return token;
    },
    session({ session, token }) {
      session.user.login = token.login as string | undefined;
      session.user.githubId = token.githubId as string | undefined;
      return session;
    },
  },
});

export class AuthFailure extends Error {
  constructor(readonly status: 401 | 403) {
    super(status === 401 ? "unauthenticated" : "forbidden");
  }
}

/** Throws AuthFailure unless the request comes from the owner's session. */
export async function requireOwner() {
  const session = await auth();
  if (!session?.user) throw new AuthFailure(401);
  if (!isOwner(session.user.login, session.user.githubId)) {
    throw new AuthFailure(403);
  }
  return session;
}
