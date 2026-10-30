import { describe, expect, it } from "vitest";
import {
  filterProjects,
  languagesBySize,
  prettifyRepoName,
  publishedProjects,
  sortProjects,
  toPortfolioProject,
} from "@/lib/content/merge";
import type { Project } from "@/lib/schemas";

function project(overrides: Partial<Project> = {}): Project {
  return {
    id: 1,
    repoName: "my-cool-app",
    slug: "my-cool-app",
    github: {
      description: "From GitHub",
      url: "https://github.com/x/my-cool-app",
      homepage: null,
      languages: { TypeScript: 100, PowerShell: 500, CSS: 10 },
      topics: ["react", "spec-driven-development"],
      stars: 0,
      isFork: false,
      isArchived: false,
      pushedAt: "2025-03-01T00:00:00Z",
      readmeExcerpt: "",
    },
    highlights: [],
    tags: [],
    screenshots: [],
    status: "published",
    featured: false,
    order: 1,
    flags: [],
    firstSeenAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("toPortfolioProject", () => {
  it("falls back to GitHub data when curated fields are missing", () => {
    const p = toPortfolioProject(project());
    expect(p.title).toBe("My Cool App");
    expect(p.summary).toBe("From GitHub");
    expect(p.year).toBe(2025);
    expect(p.demoUrl).toBeNull();
    expect(p.cover).toBeNull();
  });

  it("prefers curated fields over GitHub data", () => {
    const p = toPortfolioProject(
      project({ title: "Curated", summary: "Mine", year: 2024, demoUrl: "https://demo.app" }),
    );
    expect([p.title, p.summary, p.year, p.demoUrl]).toEqual([
      "Curated",
      "Mine",
      2024,
      "https://demo.app",
    ]);
  });

  it("uses the GitHub homepage as the demo link fallback", () => {
    const p = toPortfolioProject(
      project({ github: { ...project().github, homepage: "https://home.page" } }),
    );
    expect(p.demoUrl).toBe("https://home.page");
  });

  it("merges tags, languages and topics, normalised and without noise", () => {
    const p = toPortfolioProject(project({ tags: ["Next.js", "reactjs"] }));
    expect(p.technologies).toEqual(["Next.js", "React", "TypeScript", "CSS"]);
    expect(p.topLanguages).toEqual(["TypeScript", "CSS"]);
  });

  it("picks the screenshot marked as cover, else the first", () => {
    const shot = (src: string, cover?: boolean) => ({ src, alt: "a screenshot", width: 10, height: 10, cover });
    expect(toPortfolioProject(project({ screenshots: [shot("/uploads/a"), shot("/uploads/b", true)] })).cover?.src).toBe("/uploads/b");
    expect(toPortfolioProject(project({ screenshots: [shot("/uploads/a")] })).cover?.src).toBe("/uploads/a");
  });
});

describe("publishedProjects / sort / filter", () => {
  const list = [
    project({ id: 1, slug: "b", title: "Beta", order: 2, featured: true, tags: ["React"] }),
    project({ id: 2, slug: "a", title: "Alpha", order: 1, tags: ["Python"], github: { ...project().github, pushedAt: "2026-01-01T00:00:00Z" } }),
    project({ id: 3, slug: "hidden", status: "hidden", order: 0 }),
    project({ id: 4, slug: "pending", status: "pending", order: 0 }),
  ];

  it("returns only published projects in owner order", () => {
    expect(publishedProjects(list).map((p) => p.slug)).toEqual(["a", "b"]);
  });

  it("sorts featured-first, most recent and alphabetically", () => {
    const pub = publishedProjects(list);
    expect(sortProjects(pub, "featured").map((p) => p.slug)).toEqual(["b", "a"]);
    expect(sortProjects(pub, "recent").map((p) => p.slug)).toEqual(["a", "b"]);
    expect(sortProjects(pub, "az").map((p) => p.title)).toEqual(["Alpha", "Beta"]);
  });

  it("filters to projects using every selected technology", () => {
    const pub = publishedProjects(list);
    expect(filterProjects(pub, []).length).toBe(2);
    // Both fixtures carry the "react" topic; only "a" has Python.
    expect(filterProjects(pub, ["React"]).length).toBe(2);
    expect(filterProjects(pub, ["React", "Python"]).map((p) => p.slug)).toEqual(["a"]);
    expect(filterProjects(pub, ["Python", "Next.js"])).toEqual([]);
  });
});

describe("helpers", () => {
  it("prettifies repo names", () => {
    expect(prettifyRepoName("AI-business-Assistant-")).toBe("AI Business Assistant");
    expect(prettifyRepoName("campus_connect-app")).toBe("Campus Connect App");
  });

  it("orders languages by size and drops helper-script languages", () => {
    expect(languagesBySize({ CSS: 1, PowerShell: 99, Python: 50 })).toEqual(["Python", "CSS"]);
  });
});
