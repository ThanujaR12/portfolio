import { readFileSync } from "node:fs";
import { publishedProjects } from "@/lib/content/merge";
import { profileSchema, projectsFileSchema } from "@/lib/schemas";

// Expected counts come from the real content, so publishing a project in /admin doesn't
// break the tests. Read at import time, before the admin suite edits anything.
const projects = publishedProjects(
  projectsFileSchema.parse(JSON.parse(readFileSync("content/projects.json", "utf8"))).projects,
);
const profile = profileSchema.parse(JSON.parse(readFileSync("content/profile.json", "utf8")));
const featured = projects.filter((p) => p.featured).slice(0, 3).length;

export const content = {
  published: projects.length,
  featured,
  /** Home "Selected work": featured topped up to three. */
  selected: Math.min(3, projects.length),
  openTo: profile.openTo.term,
  usingTech: (tech: string) => projects.filter((p) => p.technologies.includes(tech)).length,
};
