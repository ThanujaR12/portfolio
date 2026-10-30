import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next-auth", () => ({ default: () => ({}) }));
vi.mock("next-auth/providers/github", () => ({ default: () => ({}) }));
vi.mock("next-auth/providers/credentials", () => ({ default: () => ({}) }));

import { excerptReadme, type RepoSnapshot } from "@/lib/github/repos";
import { isOwner } from "@/lib/auth";
import type { Project } from "@/lib/schemas";
import { normalize, reconcile, slugify } from "@/lib/sync/reconcile";

const NOW = "2026-10-30T12:00:00.000Z";

const repo = (id: number, name: string, extra: Partial<RepoSnapshot> = {}): RepoSnapshot => ({
  id,
  name,
  description: `${name} description`,
  url: `https://github.com/x/${name}`,
  homepage: null,
  topics: [],
  stars: 0,
  isFork: false,
  isArchived: false,
  pushedAt: "2026-01-01T00:00:00Z",
  languages: { TypeScript: 10 },
  readmeExcerpt: "# Readme",
  ...extra,
});

function project(id: number, slug: string, extra: Partial<Project> = {}): Project {
  const { github, ...rest } = extra;
  return {
    id,
    repoName: slug,
    slug,
    github: {
      description: `${slug} description`,
      url: `https://github.com/x/${slug}`,
      homepage: null,
      languages: { TypeScript: 10 },
      topics: [],
      stars: 0,
      isFork: false,
      isArchived: false,
      pushedAt: "2026-01-01T00:00:00Z",
      readmeExcerpt: "# Readme",
      ...github,
    },
    summary: "Curated summary",
    highlights: [],
    tags: [],
    screenshots: [{ src: "/uploads/a.webp", alt: "a screenshot", width: 10, height: 10 }],
    status: "published",
    featured: false,
    order: 1,
    flags: [],
    firstSeenAt: NOW,
    updatedAt: NOW,
    ...rest,
  };
}

describe("reconcile", () => {
  it("adds new repos as pending (never public) and forks as hidden", () => {
    const r = reconcile([repo(1, "existing"), repo(2, "New-Thing"), repo(3, "a-fork", { isFork: true })], [project(1, "existing")], NOW);
    expect(r.added).toEqual(["new-thing", "a-fork"]);
    const byId = new Map(r.projects.map((p) => [p.id, p]));
    expect(byId.get(2)?.status).toBe("pending");
    expect(byId.get(3)?.status).toBe("hidden");
    expect(byId.get(2)?.firstSeenAt).toBe(NOW);
  });

  it("never overwrites curated fields, only GitHub ones", () => {
    const current = [project(1, "existing", { title: "Mine", summary: "My words" })];
    const r = reconcile([repo(1, "existing", { description: "Changed upstream", stars: 5 })], current, NOW);
    const p = r.projects[0];
    expect(r.updated).toEqual(["existing"]);
    expect([p.title, p.summary]).toEqual(["Mine", "My words"]);
    expect([p.github.description, p.github.stars]).toEqual(["Changed upstream", 5]);
  });

  it("reports nothing when GitHub is unchanged", () => {
    const r = reconcile([repo(1, "existing")], [project(1, "existing")], NOW);
    expect([r.added, r.updated, r.removed]).toEqual([[], [], []]);
  });

  it("keeps languages and README when details were not refetched", () => {
    const { languages: _l, readmeExcerpt: _r, ...bare } = repo(1, "existing", { stars: 2 });
    const r = reconcile([bare], [project(1, "existing")], NOW);
    expect(r.projects[0].github.languages).toEqual({ TypeScript: 10 });
    expect(r.projects[0].github.readmeExcerpt).toBe("# Readme");
  });

  it("hides and flags repos deleted or made private, and restores the flag when they return", () => {
    const current = [project(1, "gone", { featured: true }), project(2, "stays", { order: 2 })];
    const r = reconcile([repo(2, "stays")], current, NOW);
    const gone = r.projects.find((p) => p.id === 1)!;
    expect(r.removed).toEqual(["gone"]);
    expect([gone.status, gone.featured, gone.flags]).toEqual(["hidden", false, ["removed-from-github"]]);

    const back = reconcile([repo(1, "gone"), repo(2, "stays")], r.projects, NOW);
    expect(back.projects.find((p) => p.id === 1)?.flags).toEqual([]);
    expect(back.projects.find((p) => p.id === 1)?.status).toBe("hidden");
  });

  it("gives new repos unique slugs", () => {
    const r = reconcile([repo(1, "x"), repo(2, "Campus Connect App")], [project(1, "campus-connect")], NOW);
    expect(r.added).toEqual(["campus-connect-2"]);
  });
});

describe("normalize", () => {
  it("renumbers published order, clears featured on unpublished, flags thin projects", () => {
    const out = normalize([
      project(1, "a", { order: 5 }),
      project(2, "b", { order: 9, screenshots: [] }),
      project(3, "c", { status: "hidden", featured: true, order: 4 }),
    ]);
    expect(out.map((p) => p.order)).toEqual([1, 2, 4]);
    expect(out[2].featured).toBe(false);
    expect(out[1].flags).toEqual(["needs-content"]);
    expect(out[0].flags).toEqual([]);
  });
});

describe("helpers", () => {
  it("slugifies repo names", () => {
    expect(slugify("AI-business-Assistant-")).toBe("ai-business-assistant");
    expect(slugify("campus-connect-app")).toBe("campus-connect");
    expect(slugify("---")).toBe("project");
  });

  it("cleans README excerpts", () => {
    const md = "# Title\n[![badge](x)](y)\n![shot](z.png)\n<p align=center>hi</p>\n<!-- c -->\n\n\n\nBody";
    expect(excerptReadme(md)).toBe("# Title\nhi\n\nBody");
    expect(excerptReadme("a\n".repeat(3000), 100).length).toBeLessThanOrEqual(100);
  });
});

describe("isOwner", () => {
  afterEach(() => {
    delete process.env.ADMIN_GITHUB_LOGIN;
    delete process.env.ADMIN_GITHUB_ID;
  });

  it("allows only the configured login, case-insensitively", () => {
    expect(isOwner("ThanujaR12")).toBe(true);
    expect(isOwner("thanujar12")).toBe(true);
    expect(isOwner("someone-else")).toBe(false);
    expect(isOwner(undefined)).toBe(false);
  });

  it("also requires the pinned numeric id when set", () => {
    process.env.ADMIN_GITHUB_ID = "42";
    expect(isOwner("ThanujaR12", 42)).toBe(true);
    expect(isOwner("ThanujaR12", 7)).toBe(false);
    expect(isOwner("ThanujaR12")).toBe(false);
  });
});
