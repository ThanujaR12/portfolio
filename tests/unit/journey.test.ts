import { describe, expect, it } from "vitest";
import { buildJourney, parseStatement } from "@/lib/content/journey";
import type { PortfolioProject } from "@/lib/content/merge";
import type { Profile } from "@/lib/schemas";

const profile = {
  highlights: [
    { label: "Vanderbilt University", detail: "CS and Applied Math" },
    { label: "Change++ Challenge", detail: "Built PaletteBoard", period: "2026" },
  ],
  openTo: { term: "Summer 2027 internships", roles: ["Software Engineering", "AI"] },
} as Profile;

const project = (slug: string, year: number) =>
  ({ slug, title: slug.toUpperCase(), summary: `${slug} summary`, year }) as PortfolioProject;

describe("buildJourney", () => {
  it("puts undated background in context and groups the rest by year", () => {
    const j = buildJourney(profile, [project("b", 2026), project("a", 2025)]);
    expect(j.context).toEqual([{ title: "Vanderbilt University", detail: "CS and Applied Math" }]);
    expect(j.years.map((y) => y.year)).toEqual([2025, 2026, 2027]);
    expect(j.years[1].items.map((i) => i.kind)).toEqual(["milestone", "project"]);
    expect(j.years[2].items[0]).toMatchObject({ kind: "next", title: "Summer 2027 internships", detail: "Software Engineering · AI" });
    expect(j.years[0].items[0].href).toBe("/projects/a");
  });

  it("skips the next step when the open-to term has no year", () => {
    const j = buildJourney({ ...profile, openTo: { term: "Internships", roles: [] } }, []);
    expect(j.years.map((y) => y.year)).toEqual([2026]);
  });
});

describe("parseStatement", () => {
  it("splits bold segments marked with double stars", () => {
    expect(parseStatement("I build **AI products** and **teams**.")).toEqual([
      { text: "I build ", bold: false },
      { text: "AI products", bold: true },
      { text: " and ", bold: false },
      { text: "teams", bold: true },
      { text: ".", bold: false },
    ]);
  });

  it("leaves text without markers alone", () => {
    expect(parseStatement("Plain words")).toEqual([{ text: "Plain words", bold: false }]);
  });
});
