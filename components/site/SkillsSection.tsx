import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SKILL_CATEGORIES, type Skill, type SkillCategory } from "@/lib/content/skills";

// Skills strip: one row per category; each chip opens the work grid filtered to that skill.
export function SkillsSection({ skills }: { skills: Record<SkillCategory, Skill[]> }) {
  const groups = SKILL_CATEGORIES.filter((c) => skills[c].length > 0);
  return (
    <section id="skills" aria-labelledby="skills-title" className="px-4 py-24 sm:px-6 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading label="Skills" id="skills-title" title="Tools I build with" />
        <dl className="divide-y divide-line border-y border-line">
          {groups.map((category) => (
            <div key={category} data-reveal className="grid gap-4 py-6 md:grid-cols-[12rem_minmax(0,1fr)] md:items-center">
              <dt className="eyebrow text-muted">{category}</dt>
              <dd>
                <ul className="flex flex-wrap gap-2">
                  {skills[category].map((s) => (
                    <li key={s.name}>
                      <Link
                        href={`/work?tech=${encodeURIComponent(s.name)}#projects`}
                        className="group inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm shadow-sm transition-colors hover:border-accent/40 hover:text-accent"
                      >
                        {s.name}
                        <span className="rounded-full bg-ink/5 px-1.5 text-[0.7rem] text-muted group-hover:text-accent">
                          {s.count}
                          <span className="sr-only"> {s.count === 1 ? "project" : "projects"}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
