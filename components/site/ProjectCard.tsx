import Link from "next/link";
import { ProjectCover } from "@/components/project/ProjectCover";
import type { PortfolioProject } from "@/lib/content/merge";

export function ProjectCard({ project }: { project: PortfolioProject }) {
  return (
    <article className="glass glow-hover group relative flex flex-col overflow-hidden rounded-2xl">
      <div className="aspect-[16/9] overflow-hidden">
        <ProjectCover
          project={project}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-display text-lg font-semibold">
          <Link href={`/projects/${project.slug}`} className="after:absolute after:inset-0">
            {project.title}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm text-muted">{project.summary}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <p className="truncate font-mono text-xs text-ink/70">
            {project.technologies.slice(0, 3).join(" · ")}
          </p>
          <span className="shrink-0 font-mono text-xs text-muted">{project.year}</span>
        </div>
      </div>
    </article>
  );
}
