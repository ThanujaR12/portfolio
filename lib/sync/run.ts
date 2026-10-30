import "server-only";
import { publishChanges } from "@/lib/content/publish";
import { readContent, updateContent } from "@/lib/content/store";
import { listPublicRepos, repoDetails, type RepoSnapshot } from "@/lib/github/repos";
import type { SyncRun } from "@/lib/schemas";
import { reconcile } from "@/lib/sync/reconcile";

const user = () => process.env.GITHUB_USER || process.env.ADMIN_GITHUB_LOGIN || "ThanujaR12";

export async function runSync(trigger: SyncRun["trigger"]): Promise<SyncRun> {
  const at = new Date().toISOString();
  let run: SyncRun;
  try {
    const { projects: current } = await readContent("projects", { fresh: true });
    const known = new Map(current.map((p) => [p.id, p]));
    const repos = await listPublicRepos(user());

    // Languages + README only for new repos or ones with new pushes: keeps API calls low.
    const detailed: RepoSnapshot[] = await Promise.all(
      repos.map(async (r) => {
        const prev = known.get(r.id);
        if (prev && prev.github.pushedAt === r.pushedAt) return r;
        return { ...r, ...(await repoDetails(user(), r.name)) };
      }),
    );

    const result = reconcile(detailed, current, at);
    if (result.added.length || result.updated.length || result.removed.length) {
      await updateContent(
        "projects",
        (latest) => ({ ...latest, projects: reconcile(detailed, latest.projects, at).projects }),
        `content: sync from GitHub (+${result.added.length} ~${result.updated.length} -${result.removed.length}) [${trigger}]`,
      );
    }
    run = { at, trigger, ok: true, added: result.added, updated: result.updated, removed: result.removed };
  } catch (e) {
    run = { at, trigger, ok: false, added: [], updated: [], removed: [], error: e instanceof Error ? e.message : String(e) };
  }

  await updateContent(
    "syncLog",
    (log) => ({ ...log, runs: [run, ...log.runs].slice(0, 30) }),
    `content: sync log [${trigger}]`,
  ).catch((e) => console.error("sync: could not write log", e));
  publishChanges();
  return run;
}
