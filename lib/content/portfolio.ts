import "server-only";
import { cache } from "react";
import { languagesBySize, publishedProjects } from "@/lib/content/merge";
import { buildSkills } from "@/lib/content/skills";
import { readContent } from "@/lib/content/store";

export type GitHubStats = { repoCount: number; topLanguages: string[]; lastPushAt: string | null };

/** Everything the public pages need, loaded once per request. */
export const getPortfolio = cache(async () => {
  const [{ projects: all }, profile] = await Promise.all([
    readContent("projects"),
    readContent("profile"),
  ]);
  const projects = publishedProjects(all);

  // Stats come from the synced repo list, so they cost no GitHub calls per request (R9).
  const onGitHub = all.filter((p) => !p.flags.includes("removed-from-github"));
  const languageTotals: Record<string, number> = {};
  for (const p of onGitHub) {
    for (const [lang, bytes] of Object.entries(p.github.languages)) {
      languageTotals[lang] = (languageTotals[lang] ?? 0) + bytes;
    }
  }
  const stats: GitHubStats = {
    repoCount: onGitHub.length,
    topLanguages: languagesBySize(languageTotals).slice(0, 3),
    lastPushAt: onGitHub.map((p) => p.github.pushedAt).sort().at(-1) ?? null,
  };

  return {
    profile,
    projects,
    featured: projects.filter((p) => p.featured).slice(0, 3),
    skills: buildSkills(projects),
    stats,
  };
});
