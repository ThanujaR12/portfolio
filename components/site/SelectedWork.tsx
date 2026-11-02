import Link from "next/link";
import { ProjectCover } from "@/components/project/ProjectCover";
import { ArrowLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { PortfolioProject } from "@/lib/content/merge";

// Selected work (spec 002 US2): one large project per screen, alternating sides.
export function SelectedWork({ projects }: { projects: PortfolioProject[] }) {
  if (projects.length === 0) return null;
  return (
    <section id="work" aria-labelledby="work-title" className="px-4 py-24 sm:px-6 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          label="Selected work"
          id="work-title"
          title="Things I've designed and built"
          link={{ href: "/work", label: "All projects" }}
        />
        <ol className="space-y-24 md:space-y-36">
          {projects.map((p, i) => (
            <li key={p.id}>
              <article
                data-reveal
                className="group grid items-center gap-8 md:min-h-[70svh] md:grid-cols-12 md:gap-12"
              >
                <Link
                  href={`/projects/${p.slug}`}
                  tabIndex={-1}
                  aria-hidden="true"
                  className={`relative block aspect-[16/10] overflow-hidden rounded-[2rem] border border-line bg-surface shadow-[0_30px_80px_-40px_rgb(0_0_0/0.35)] md:col-span-7 ${
                    i % 2 ? "md:order-2" : ""
                  }`}
                >
                  <ProjectCover
                    project={p}
                    sizes="(min-width: 768px) 58vw, 100vw"
                    className="transition-transform duration-700 group-hover:scale-[1.025]"
                  />
                </Link>
                <div className={`md:col-span-5 ${i % 2 ? "md:order-1" : ""}`}>
                  <p className="eyebrow text-muted">
                    {String(i + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")} · {p.year}
                  </p>
                  <h3 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
                    <Link href={`/projects/${p.slug}`} className="hover:text-accent">
                      {p.title}
                    </Link>
                  </h3>
                  <p className="mt-4 text-lg leading-relaxed text-muted">{p.summary}</p>
                  {p.role && <p className="mt-4 text-sm font-medium text-ink">{p.role}</p>}
                  <ul className="mt-5 flex flex-wrap gap-2" aria-label="Technologies">
                    {p.technologies.slice(0, 5).map((t) => (
                      <li key={t} className="rounded-full border border-line bg-surface px-3 py-1 text-xs text-ink/80">
                        {t}
                      </li>
                    ))}
                  </ul>
                  <ArrowLink href={`/projects/${p.slug}`} className="mt-8">
                    View case study
                  </ArrowLink>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
