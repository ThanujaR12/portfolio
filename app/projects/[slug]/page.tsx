import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { Gallery } from "@/components/project/Gallery";
import { GlassPanel } from "@/components/project/GlassPanel";
import { ProjectCover } from "@/components/project/ProjectCover";
import { ExternalButton } from "@/components/ui/Button";
import { getPortfolio } from "@/lib/content/portfolio";

export const revalidate = 3600;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { projects } = await getPortfolio();
  return projects.map((p) => ({ slug: p.slug }));
}

async function findProject(slug: string) {
  const { projects } = await getPortfolio();
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) return null;
  const at = (i: number) => projects[(i + projects.length) % projects.length];
  return {
    project: projects[index],
    prev: projects.length > 1 ? at(index - 1) : null,
    next: projects.length > 1 ? at(index + 1) : null,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await findProject((await params).slug);
  if (!found) return { title: "Project not found" };
  const { project } = found;
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { title: project.title, description: project.summary, type: "article" },
  };
}

const markdownClass =
  "space-y-4 leading-relaxed text-ink/90 [&_a]:text-accent [&_a]:underline [&_code]:font-mono [&_code]:text-sm [&_h1]:font-display [&_h1]:text-xl [&_h2]:font-display [&_h2]:text-lg [&_strong]:text-ink [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5";

export default async function ProjectPage({ params }: Props) {
  const found = await findProject((await params).slug);
  if (!found) notFound();
  const { project, prev, next } = found;
  const updated = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(
    new Date(project.updatedAt),
  );

  const facts = [
    project.role && { label: "Role", value: project.role },
    { label: "Stack", value: project.technologies.slice(0, 4).join(" · ") },
    { label: "Year", value: String(project.year) },
    { label: "Status", value: project.demoUrl ? "Live" : "Source available" },
  ].filter((f): f is { label: string; value: string } => Boolean(f));

  return (
    <article className="px-4 pb-24 pt-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Link href="/work" className="font-mono text-xs uppercase tracking-[0.2em] text-muted hover:text-accent">
          ← All projects
        </Link>

        {/* Cinematic hero */}
        <header className="relative mt-6 overflow-hidden rounded-3xl border border-line">
          <div className="aspect-[4/3] sm:aspect-[21/9]">
            <ProjectCover project={project} sizes="(min-width: 1152px) 1152px, 100vw" priority showTitle={false} />
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-canvas via-canvas/80 to-transparent p-5 pt-24 sm:p-8 sm:pt-32">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-6xl">{project.title}</h1>
                <p className="mt-2 max-w-2xl text-ink/80 sm:text-lg">{project.summary}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-3">
                {project.demoUrl && <ExternalButton href={project.demoUrl}>Live demo</ExternalButton>}
                <ExternalButton href={project.sourceUrl} variant="ghost">
                  Code
                </ExternalButton>
              </div>
            </div>
          </div>
        </header>

        {/* Quick facts */}
        <dl className="glass mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-2xl md:grid-cols-4">
          {facts.map((f) => (
            <div key={f.label} className="bg-canvas/40 p-4 sm:p-5">
              <dt className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">{f.label}</dt>
              <dd className="mt-1.5 text-sm text-ink sm:text-base">{f.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 grid gap-5">
          {project.problem && (
            <GlassPanel label="The problem" title="Why it exists">
              <div className={markdownClass}>
                <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{project.problem}</ReactMarkdown>
              </div>
            </GlassPanel>
          )}

          {project.highlights.length > 0 && (
            <GlassPanel label="Highlights" title="What it does well">
              <ul className="grid gap-3 sm:grid-cols-2">
                {project.highlights.map((h) => (
                  <li key={h} className="flex gap-3 rounded-2xl border border-line bg-ink/[0.02] p-4">
                    <span aria-hidden="true" className="text-accent">✦</span>
                    <span className="text-ink/90">{h}</span>
                  </li>
                ))}
              </ul>
            </GlassPanel>
          )}

          {/* GitHub README fills in until the owner writes the story (FR-009). */}
          {!project.problem && project.readmeExcerpt && (
            <GlassPanel label="From the README" title="Overview">
              <div className={markdownClass}>
                <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{project.readmeExcerpt}</ReactMarkdown>
              </div>
            </GlassPanel>
          )}

          {project.screenshots.length > 0 && (
            <GlassPanel label="Gallery" title="A closer look">
              <Gallery screenshots={project.screenshots} />
            </GlassPanel>
          )}

          <GlassPanel label="Built with" title="Technologies">
            <ul className="flex flex-wrap gap-2">
              {project.technologies.map((t) => (
                <li key={t}>
                  <Link
                    href={`/work?tech=${encodeURIComponent(t)}#projects`}
                    className="inline-block rounded-full border border-line px-3 py-1.5 font-mono text-xs transition-colors hover:border-accent/50 hover:text-accent"
                  >
                    {t}
                  </Link>
                </li>
              ))}
            </ul>
          </GlassPanel>
        </div>

        <p className="mt-6 font-mono text-xs text-muted">Last updated on GitHub: {updated}</p>

        {(prev || next) && (
          <nav aria-label="More projects" className="mt-10 grid gap-4 sm:grid-cols-2">
            {prev && (
              <Link href={`/projects/${prev.slug}`} className="glass glow-hover rounded-2xl p-5">
                <span className="font-mono text-xs text-muted">← Previous project</span>
                <span className="mt-1 block font-display text-lg">{prev.title}</span>
              </Link>
            )}
            {next && (
              <Link href={`/projects/${next.slug}`} className="glass glow-hover rounded-2xl p-5 sm:text-right">
                <span className="font-mono text-xs text-muted">Next project →</span>
                <span className="mt-1 block font-display text-lg">{next.title}</span>
              </Link>
            )}
          </nav>
        )}
      </div>
    </article>
  );
}
