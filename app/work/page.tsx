import type { Metadata } from "next";
import { Suspense } from "react";
import { ProjectCard } from "@/components/site/ProjectCard";
import { ProjectGrid } from "@/components/site/ProjectGrid";
import { getPortfolio } from "@/lib/content/portfolio";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getPortfolio();
  return { title: "Work", description: `All projects by ${profile.name}, filterable by technology.` };
}

// All projects with technology filters (moved from the home page in spec 002).
export default async function WorkPage() {
  const { projects, technologies } = await getPortfolio();
  return (
    <section id="projects" aria-labelledby="projects-title" className="px-4 pb-24 pt-32 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-12">
          <p className="eyebrow text-accent">Work</p>
          <h1 id="projects-title" className="mt-3 font-display text-5xl font-semibold tracking-tight md:text-7xl">
            Everything I&apos;ve built
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted">
            Filter by technology to find the projects that matter to you. Filtered views are shareable links.
          </p>
        </header>
        {/* Keeps the heading outline h1 → h2 → h3 (cards) for screen readers. */}
        <h2 className="sr-only">All projects</h2>
        {projects.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center text-muted">Projects coming soon.</div>
        ) : (
          <Suspense
            fallback={
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((p) => (
                  <li key={p.id} className="flex">
                    <ProjectCard project={p} />
                  </li>
                ))}
              </ul>
            }
          >
            <ProjectGrid projects={projects} technologies={technologies} />
          </Suspense>
        )}
      </div>
    </section>
  );
}
