import { describe, expect, it } from "vitest";
import type { PortfolioProject } from "@/lib/content/merge";
import { buildSkills, categoryOf, normalizeSkill } from "@/lib/content/skills";

const p = (slug: string, technologies: string[]) => ({ slug, technologies }) as PortfolioProject;

describe("skills", () => {
  it("normalises aliases and drops noise", () => {
    expect(normalizeSkill("reactjs")).toBe("React");
    expect(normalizeSkill(" TS ")).toBe("TypeScript");
    expect(normalizeSkill("spec-driven-development")).toBeNull();
    expect(normalizeSkill("Svelte")).toBe("Svelte");
  });

  it("categorises known skills and defaults to Tools", () => {
    expect(categoryOf("React")).toBe("Frontend");
    expect(categoryOf("Flask")).toBe("Backend");
    expect(categoryOf("Svelte")).toBe("Tools");
  });

  it("groups skills with project counts, most-used first", () => {
    const groups = buildSkills([p("a", ["React", "TypeScript"]), p("b", ["TypeScript", "Angular"])]);
    expect(groups.Languages).toEqual([
      { name: "TypeScript", category: "Languages", count: 2, projectSlugs: ["a", "b"] },
    ]);
    expect(groups.Frontend.map((s) => s.name)).toEqual(["Angular", "React"]);
    expect(groups.Backend).toEqual([]);
  });
});
