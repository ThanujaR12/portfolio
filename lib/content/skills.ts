import type { PortfolioProject } from "@/lib/content/merge";

export const SKILL_CATEGORIES = ["Languages", "Frontend", "Backend", "AI/Data", "Tools"] as const;
export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export type Skill = { name: string; category: SkillCategory; count: number; projectSlugs: string[] };

// Lower-cased GitHub languages/topics/tags → display name. `null` drops noise like topic tags
// that describe process rather than technology.
const ALIASES: Record<string, string | null> = {
  ts: "TypeScript",
  typescript: "TypeScript",
  js: "JavaScript",
  javascript: "JavaScript",
  python: "Python",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  // Build/helper-script languages say little about the project's stack.
  powershell: null,
  shell: null,
  batchfile: null,
  dockerfile: null,
  makefile: null,
  react: "React",
  reactjs: "React",
  "react-native": "React Native",
  expo: "Expo",
  zustand: "Zustand",
  angular: "Angular",
  nextjs: "Next.js",
  "next.js": "Next.js",
  node: "Node.js",
  nodejs: "Node.js",
  "node.js": "Node.js",
  express: "Express",
  flask: "Flask",
  mongodb: "MongoDB",
  firebase: "Firebase",
  openai: "OpenAI",
  langchain: "LangChain",
  pandas: "Pandas",
  faiss: "FAISS",
  "jupyter notebook": null,
  "spec-driven-development": null,
};

const CATEGORY: Record<string, SkillCategory> = {
  TypeScript: "Languages",
  JavaScript: "Languages",
  Python: "Languages",
  HTML: "Languages",
  CSS: "Languages",
  SCSS: "Languages",
  PowerShell: "Languages",
  React: "Frontend",
  "React Native": "Frontend",
  Expo: "Frontend",
  Angular: "Frontend",
  "Next.js": "Frontend",
  "Node.js": "Backend",
  Express: "Backend",
  Flask: "Backend",
  MongoDB: "Backend",
  Firebase: "Backend",
  OpenAI: "AI/Data",
  LangChain: "AI/Data",
  Pandas: "AI/Data",
  FAISS: "AI/Data",
  AI: "AI/Data",
  Zustand: "Frontend",
};

export function normalizeSkill(raw: string): string | null {
  const key = raw.trim().toLowerCase();
  if (!key) return null;
  if (key in ALIASES) return ALIASES[key];
  return raw.trim();
}

export function categoryOf(skill: string): SkillCategory {
  return CATEGORY[skill] ?? "Tools";
}

/** Skills grouped by category, most-used first within each group. */
export function buildSkills(projects: PortfolioProject[]): Record<SkillCategory, Skill[]> {
  const bySkill = new Map<string, string[]>();
  for (const p of projects) {
    for (const t of p.technologies) bySkill.set(t, [...(bySkill.get(t) ?? []), p.slug]);
  }
  const groups = Object.fromEntries(SKILL_CATEGORIES.map((c) => [c, [] as Skill[]])) as Record<
    SkillCategory,
    Skill[]
  >;
  for (const [name, projectSlugs] of bySkill) {
    groups[categoryOf(name)].push({
      name,
      category: categoryOf(name),
      count: projectSlugs.length,
      projectSlugs,
    });
  }
  for (const c of SKILL_CATEGORIES) {
    groups[c].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }
  return groups;
}
