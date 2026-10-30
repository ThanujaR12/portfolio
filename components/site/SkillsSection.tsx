import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SKILL_CATEGORIES, type Skill, type SkillCategory } from "@/lib/content/skills";

export function SkillsSection({ skills }: { skills: Record<SkillCategory, Skill[]> }) {
  const groups = SKILL_CATEGORIES.filter((c) => skills[c].length > 0);
  return (
    <section id="skills" aria-labelledby="skills-title" className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading index="03" label="Skills" id="skills-title" title="Tools I build with" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((category) => (
            <div key={category} className="glass rounded-2xl p-6">
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">{category}</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {skills[category].map((s) => (
                  <li key={s.name}>
                    <Link
                      href={`/?tech=${encodeURIComponent(s.name)}#projects`}
                      scroll={false}
                      className="group inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3 py-1.5 text-sm transition-colors hover:border-cyan/50 hover:shadow-[0_0_20px_-6px_rgb(34_211_238/0.8)]"
                    >
                      {s.name}
                      <span className="rounded-full bg-white/10 px-1.5 font-mono text-[0.65rem] text-muted group-hover:text-cyan">
                        {s.count}
                        <span className="sr-only"> {s.count === 1 ? "project" : "projects"}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted">Select a skill to see the projects that use it.</p>
      </div>
    </section>
  );
}
