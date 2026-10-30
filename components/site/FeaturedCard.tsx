import Link from "next/link";
import { ProjectCover } from "@/components/project/ProjectCover";
import type { PortfolioProject } from "@/lib/content/merge";

export function FeaturedCard({ project, large }: { project: PortfolioProject; large: boolean }) {
  return (
    <article
      className={`glass glow-hover group relative flex flex-col overflow-hidden rounded-3xl ${
        large ? "lg:col-span-2 lg:row-span-2" : ""
      }`}
    >
      <div className={`overflow-hidden ${large ? "aspect-[16/10]" : "aspect-[16/9]"}`}>
        <ProjectCover
          project={project}
          sizes={large ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 33vw, 100vw"}
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-center justify-between gap-3 font-mono text-xs text-muted">
          <span className="text-cyan">★ Featured</span>
          <span>{project.year}</span>
        </div>
        <h3 className="font-display text-2xl font-semibold tracking-tight">
          <Link href={`/projects/${project.slug}`} className="after:absolute after:inset-0">
            {project.title}
          </Link>
        </h3>
        <p className="text-muted">{project.summary}</p>
        <ul className="mt-auto flex flex-wrap gap-2 pt-2" aria-label="Technologies">
          {project.technologies.slice(0, large ? 6 : 4).map((t) => (
            <li key={t} className="rounded-full border border-line px-2.5 py-0.5 font-mono text-xs text-ink/80">
              {t}
            </li>
          ))}
        </ul>
        <span aria-hidden="true" className="text-sm text-cyan transition-transform group-hover:translate-x-1">
          View case study →
        </span>
      </div>
    </article>
  );
}
