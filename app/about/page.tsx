import type { Metadata } from "next";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { StatsStrip } from "@/components/site/StatsStrip";
import { ButtonLink } from "@/components/ui/Button";
import { getPortfolio } from "@/lib/content/portfolio";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getPortfolio();
  return { title: "About", description: `About ${profile.name}: ${profile.positioning}.` };
}

// About (spec 002 US2): bio, background, current focus, photo, GitHub stats, resume.
export default async function AboutPage() {
  const { profile, stats } = await getPortfolio();
  const initials = profile.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  return (
    <article aria-labelledby="about-title" className="px-4 pb-24 pt-32 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12">
          <p className="eyebrow text-accent">About</p>
          <h1 id="about-title" className="mt-3 font-display text-5xl font-semibold tracking-tight md:text-7xl">
            {profile.name}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">{profile.positioning}.</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
          <aside className="glass flex flex-col items-start gap-6 self-start rounded-3xl p-6 sm:p-7">
            <div className="ai-gradient relative size-32 overflow-hidden rounded-[1.75rem] p-[2px]">
              {profile.photo ? (
                <Image src={profile.photo} alt={profile.name} fill sizes="128px" className="rounded-[1.65rem] object-cover" />
              ) : (
                <div aria-hidden="true" className="grid h-full w-full place-items-center rounded-[1.65rem] bg-surface font-display text-4xl font-semibold">
                  {initials}
                </div>
              )}
            </div>
            <div className="w-full rounded-2xl bg-accent/[0.06] p-4">
              <p className="eyebrow text-accent">Current focus</p>
              <p className="mt-1.5 text-sm">{profile.currentFocus}</p>
            </div>
            <div className="w-full rounded-2xl border border-dashed border-ai/40 p-4">
              <p className="eyebrow text-ai">Open to</p>
              <p className="mt-1.5 text-sm font-medium">{profile.openTo.term}</p>
              <p className="text-sm text-muted">{profile.openTo.roles.join(" · ")}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/resume">Resume</ButtonLink>
              <ButtonLink href="/#contact" variant="ghost">
                Contact
              </ButtonLink>
            </div>
          </aside>

          <div className="glass rounded-3xl p-6 sm:p-10">
            <div className="space-y-5 text-lg leading-relaxed text-ink/90 [&_strong]:font-semibold [&_strong]:text-ink">
              <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{profile.bio}</ReactMarkdown>
            </div>
            {profile.highlights.length > 0 && (
              <section aria-labelledby="background-title" className="mt-10">
                <h2 id="background-title" className="eyebrow text-muted">
                  Background
                </h2>
                <ol className="mt-5 space-y-5 border-l border-line pl-6">
                  {profile.highlights.map((h) => (
                    <li key={h.label} className="relative">
                      <span aria-hidden="true" className="ai-gradient absolute -left-[1.95rem] top-1.5 size-3 rounded-full ring-4 ring-surface" />
                      <p className="font-semibold">
                        {h.label}
                        {h.period && <span className="ml-2 text-sm font-normal text-muted">{h.period}</span>}
                      </p>
                      <p className="text-muted">{h.detail}</p>
                    </li>
                  ))}
                </ol>
              </section>
            )}
            <div className="mt-10">
              <StatsStrip stats={stats} />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
