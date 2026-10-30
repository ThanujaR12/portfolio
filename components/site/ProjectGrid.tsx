"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ProjectCard } from "@/components/site/ProjectCard";
import {
  filterProjects,
  sortProjects,
  type PortfolioProject,
  type SortKey,
} from "@/lib/content/merge";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured first" },
  { value: "recent", label: "Most recent" },
  { value: "az", label: "A → Z" },
];

export function parseTech(value: string | null): string[] {
  return value ? value.split(",").filter(Boolean) : [];
}

export function ProjectGrid({
  projects,
  technologies,
}: {
  projects: PortfolioProject[];
  technologies: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const selected = parseTech(params.get("tech")).filter((t) => technologies.includes(t));
  const sort = (SORTS.find((s) => s.value === params.get("sort"))?.value ?? "featured") as SortKey;
  const visible = sortProjects(filterProjects(projects, selected), sort);

  // Filters live in the URL so a filtered view can be shared or bookmarked.
  const update = (next: { tech?: string[]; sort?: SortKey }) => {
    const q = new URLSearchParams(params.toString());
    const tech = next.tech ?? selected;
    if (tech.length) q.set("tech", tech.join(","));
    else q.delete("tech");
    const s = next.sort ?? sort;
    if (s !== "featured") q.set("sort", s);
    else q.delete("sort");
    const qs = q.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}#projects`, { scroll: false });
  };

  const toggle = (t: string) =>
    update({ tech: selected.includes(t) ? selected.filter((x) => x !== t) : [...selected, t] });

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <fieldset>
          <legend className="sr-only">Filter by technology</legend>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={selected.length === 0}
              onClick={() => update({ tech: [] })}
              className={chipClass(selected.length === 0)}
            >
              All
            </button>
            {technologies.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={selected.includes(t)}
                onClick={() => toggle(t)}
                className={chipClass(selected.includes(t))}
              >
                {t}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="flex shrink-0 items-center gap-2 text-sm text-muted">
          Sort
          <select
            value={sort}
            onChange={(e) => update({ sort: e.target.value as SortKey })}
            className="glass rounded-xl px-3 py-2 text-base text-ink sm:text-sm"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value} className="bg-space-2">
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p role="status" className="mb-4 font-mono text-xs text-muted">
        {visible.length} {visible.length === 1 ? "project" : "projects"}
        {selected.length > 0 && <> using {selected.join(" + ")}</>}
      </p>

      {visible.length > 0 ? (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p) => (
            <li key={p.id} className="flex">
              <div className="flex w-full">
                <ProjectCard project={p} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="glass rounded-2xl p-10 text-center text-muted">
          No projects match that combination.{" "}
          <button type="button" onClick={() => update({ tech: [] })} className="text-cyan underline">
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

function chipClass(active: boolean) {
  return `rounded-full border px-3.5 py-1.5 font-mono text-xs transition-colors ${
    active
      ? "border-cyan/60 bg-cyan/15 text-ink shadow-[0_0_20px_-6px_rgb(34_211_238/0.8)]"
      : "border-line text-muted hover:border-cyan/40 hover:text-ink"
  }`;
}
