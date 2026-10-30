import type { Project, Screenshot } from "@/lib/schemas";
import { normalizeSkill } from "@/lib/content/skills";

// The view model every public page renders: curated fields win, GitHub data fills the gaps.
export type PortfolioProject = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  problem: string | null;
  role: string | null;
  highlights: string[];
  technologies: string[];
  topLanguages: string[];
  sourceUrl: string;
  demoUrl: string | null;
  year: number;
  cover: Screenshot | null;
  screenshots: Screenshot[];
  featured: boolean;
  order: number;
  updatedAt: string;
  stars: number;
  readmeExcerpt: string;
};

const SMALL_WORDS = new Set(["ai", "ui", "api", "ml"]);

export function prettifyRepoName(name: string): string {
  return name
    .replace(/[-_]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((w) =>
      SMALL_WORDS.has(w.toLowerCase()) ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1),
    )
    .join(" ");
}

/** Stack languages, largest first (helper-script languages like PowerShell are skipped). */
export function languagesBySize(languages: Record<string, number>): string[] {
  return Object.entries(languages)
    .sort(([, a], [, b]) => b - a)
    .map(([name]) => normalizeSkill(name))
    .filter((name): name is string => name !== null);
}

export function toPortfolioProject(p: Project): PortfolioProject {
  const topLanguages = languagesBySize(p.github.languages).slice(0, 3);
  const technologies = [
    ...new Set(
      [...p.tags, ...topLanguages, ...p.github.topics]
        .map(normalizeSkill)
        .filter((t): t is string => t !== null),
    ),
  ];
  const cover = p.screenshots.find((s) => s.cover) ?? p.screenshots[0] ?? null;
  return {
    id: p.id,
    slug: p.slug,
    title: p.title || prettifyRepoName(p.repoName),
    summary: p.summary || p.github.description || "Project details coming soon.",
    problem: p.problem || null,
    role: p.role || null,
    highlights: p.highlights,
    technologies,
    topLanguages,
    sourceUrl: p.github.url,
    demoUrl: p.demoUrl ?? p.github.homepage ?? null,
    year: p.year ?? new Date(p.github.pushedAt).getUTCFullYear(),
    cover,
    screenshots: p.screenshots,
    featured: p.featured,
    order: p.order,
    updatedAt: p.github.pushedAt,
    stars: p.github.stars,
    readmeExcerpt: p.github.readmeExcerpt,
  };
}

/** Published projects in owner order, as public pages see them. */
export function publishedProjects(projects: Project[]): PortfolioProject[] {
  return projects
    .filter((p) => p.status === "published")
    .sort((a, b) => a.order - b.order)
    .map(toPortfolioProject);
}

export type SortKey = "featured" | "recent" | "az";

export function sortProjects(projects: PortfolioProject[], sort: SortKey): PortfolioProject[] {
  const copy = [...projects];
  if (sort === "recent") return copy.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  if (sort === "az") return copy.sort((a, b) => a.title.localeCompare(b.title));
  return copy.sort((a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order);
}

/** Projects using every selected technology (empty selection = all). */
export function filterProjects(projects: PortfolioProject[], tech: string[]): PortfolioProject[] {
  if (tech.length === 0) return projects;
  return projects.filter((p) => tech.every((t) => p.technologies.includes(t)));
}
