import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminApp } from "@/components/admin/AdminApp";
import { auth, isOwner, signOut } from "@/lib/auth";
import { assetUrl, readContent } from "@/lib/content/store";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/signin");
  if (!isOwner(session.user.login, session.user.githubId)) redirect("/admin/signin?error=AccessDenied");

  const [{ projects }, profile, { runs }] = await Promise.all([
    readContent("projects", { fresh: true }),
    readContent("profile", { fresh: true }),
    readContent("syncLog", { fresh: true }),
  ]);

  return (
    <div className="px-4 pb-24 pt-24 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">{"// admin"}</p>
            <h1 className="mt-2 font-display text-3xl font-semibold">Portfolio control room</h1>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
            className="flex items-center gap-3 text-sm text-muted"
          >
            Signed in as {session.user.login}
            <button type="submit" className="rounded-lg border border-line px-3 py-1.5 hover:text-ink">
              Sign out
            </button>
          </form>
        </header>
        <AdminApp
          initialProjects={projects}
          initialProfile={profile}
          lastRun={runs[0] ?? null}
          assetBase={assetUrl("/").replace(/\/$/, "")}
        />
      </div>
    </div>
  );
}
