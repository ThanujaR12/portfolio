import { readFileSync } from "node:fs";
import { publishedProjects } from "@/lib/content/merge";
import { projectsFileSchema } from "@/lib/schemas";

// Expected counts come from the real content, so publishing a project in /admin doesn't
// break the tests. Read at import time, before the admin suite edits anything.
const projects = publishedProjects(
  projectsFileSchema.parse(JSON.parse(readFileSync("content/projects.json", "utf8"))).projects,
);

export const content = {
  published: projects.length,
  featured: projects.filter((p) => p.featured).slice(0, 3).length,
  usingTech: (tech: string) => projects.filter((p) => p.technologies.includes(tech)).length,
};
