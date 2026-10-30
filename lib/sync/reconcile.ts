import type { RepoSnapshot } from "@/lib/github/repos";
import type { Project } from "@/lib/schemas";

// Pure merge of GitHub's repo list into curated projects (data-model.md state machine).
// GitHub fields are refreshed; curated fields are never touched except to keep invariants.

export type ReconcileResult = {
  projects: Project[];
  added: string[];
  updated: string[];
  removed: string[];
};

export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-app$/, "") || "project"
  );
}

function uniqueSlug(base: string, taken: Set<string>): string {
  let slug = base;
  for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
  taken.add(slug);
  return slug;
}

function githubFields(repo: RepoSnapshot, previous?: Project["github"]): Project["github"] {
  return {
    description: repo.description,
    url: repo.url,
    homepage: repo.homepage,
    languages: repo.languages ?? previous?.languages ?? {},
    topics: repo.topics,
    stars: repo.stars,
    isFork: repo.isFork,
    isArchived: repo.isArchived,
    pushedAt: repo.pushedAt,
    readmeExcerpt: repo.readmeExcerpt ?? previous?.readmeExcerpt ?? "",
  };
}

/** Recomputes system flags and keeps featured/order invariants. */
export function normalize(projects: Project[]): Project[] {
  const published = projects
    .filter((p) => p.status === "published")
    .sort((a, b) => a.order - b.order)
    .map((p) => p.id);
  return projects.map((p) => {
    const isPublished = p.status === "published";
    const flags: Project["flags"] = p.flags.filter((f) => f !== "needs-content");
    const thin = !(p.summary || p.github.description) || p.screenshots.length === 0;
    if (isPublished && thin) flags.push("needs-content");
    return {
      ...p,
      featured: isPublished && p.featured,
      // Published projects get contiguous display order; others keep their board position.
      order: isPublished ? published.indexOf(p.id) + 1 : p.order,
      flags,
    };
  });
}

export function reconcile(repos: RepoSnapshot[], current: Project[], now: string): ReconcileResult {
  const byId = new Map(repos.map((r) => [r.id, r]));
  const taken = new Set(current.map((p) => p.slug));
  const added: string[] = [];
  const updated: string[] = [];
  const removed: string[] = [];

  const projects = current.map((p): Project => {
    const repo = byId.get(p.id);
    if (!repo) {
      if (p.flags.includes("removed-from-github")) return p;
      removed.push(p.slug);
      return {
        ...p,
        status: p.status === "published" ? "hidden" : p.status,
        featured: false,
        flags: [...p.flags, "removed-from-github"],
        updatedAt: now,
      };
    }
    const github = githubFields(repo, p.github);
    const changed =
      JSON.stringify(github) !== JSON.stringify(p.github) || p.repoName !== repo.name;
    const returned = p.flags.includes("removed-from-github");
    if (!changed && !returned) return p;
    updated.push(p.slug);
    return {
      ...p,
      repoName: repo.name,
      github,
      flags: p.flags.filter((f) => f !== "removed-from-github"),
      updatedAt: now,
    };
  });

  const known = new Set(current.map((p) => p.id));
  for (const repo of repos) {
    if (known.has(repo.id)) continue;
    const slug = uniqueSlug(slugify(repo.name), taken);
    added.push(slug);
    projects.push({
      id: repo.id,
      repoName: repo.name,
      slug,
      github: githubFields(repo),
      highlights: [],
      tags: [],
      screenshots: [],
      // New repos are never public until the owner publishes them; forks start hidden.
      status: repo.isFork ? "hidden" : "pending",
      featured: false,
      order: 0,
      flags: [],
      firstSeenAt: now,
      updatedAt: now,
    });
  }

  return { projects: normalize(projects), added, updated, removed };
}
