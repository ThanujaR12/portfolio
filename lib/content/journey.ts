import type { PortfolioProject } from "@/lib/content/merge";
import type { Profile } from "@/lib/schemas";

// Journey timeline (spec 002, FR-104): derived from content the owner already maintains.

export type JourneyItem = {
  key: string;
  year: number;
  title: string;
  detail: string;
  kind: "milestone" | "project" | "next";
  href?: string;
};

export type Journey = {
  /** Background entries without a year (e.g. the current degree) shown as context. */
  context: { title: string; detail: string }[];
  years: { year: number; items: JourneyItem[] }[];
};

const firstYear = (text: string | undefined) => {
  const m = text?.match(/\b(19|20)\d{2}\b/);
  return m ? Number(m[0]) : null;
};

const ORDER: Record<JourneyItem["kind"], number> = { milestone: 0, project: 1, next: 2 };

export function buildJourney(profile: Profile, projects: PortfolioProject[]): Journey {
  const context: Journey["context"] = [];
  const items: JourneyItem[] = [];

  for (const h of profile.highlights) {
    const year = firstYear(h.period);
    if (year === null) context.push({ title: h.label, detail: h.detail });
    else items.push({ key: `h-${h.label}`, year, title: h.label, detail: h.detail, kind: "milestone" });
  }
  for (const p of projects) {
    items.push({
      key: `p-${p.slug}`,
      year: p.year,
      title: p.title,
      detail: p.summary,
      kind: "project",
      href: `/projects/${p.slug}`,
    });
  }
  const nextYear = firstYear(profile.openTo.term);
  if (nextYear !== null) {
    items.push({
      key: "next",
      year: nextYear,
      title: profile.openTo.term,
      detail: profile.openTo.roles.join(" · "),
      kind: "next",
    });
  }

  const byYear = new Map<number, JourneyItem[]>();
  for (const item of items) byYear.set(item.year, [...(byYear.get(item.year) ?? []), item]);
  const years = [...byYear.entries()]
    .sort(([a], [b]) => a - b)
    .map(([year, list]) => ({
      year,
      items: list.sort((a, b) => ORDER[a.kind] - ORDER[b.kind] || a.title.localeCompare(b.title)),
    }));
  return { context, years };
}

/** Splits "I build **AI products**." into plain and bold segments (FR-102). */
export function parseStatement(statement: string): { text: string; bold: boolean }[] {
  return statement
    .split(/(\*\*[^*]+\*\*)/)
    .filter(Boolean)
    .map((part) =>
      part.startsWith("**") && part.endsWith("**")
        ? { text: part.slice(2, -2), bold: true }
        : { text: part, bold: false },
    );
}
