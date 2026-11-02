import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { CountUp } from "@/components/motion/CountUp";
import { FillWord, ScrollFillDriver } from "@/components/motion/ScrollFill";
import { SectionTracker } from "@/components/motion/SectionTracker";
import { Aurora } from "@/components/site/Aurora";
import { ButtonLink } from "@/components/ui/Button";
import { getPortfolio } from "@/lib/content/portfolio";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getPortfolio();
  return { title: "About", description: `About ${profile.name}: ${profile.positioning}.` };
}

const SECTIONS = [
  { id: "intro", label: "Intro" },
  { id: "approach", label: "Approach" },
  { id: "experience", label: "Experience" },
  { id: "wins", label: "Wins" },
  { id: "education", label: "Education" },
  { id: "toolkit", label: "Toolkit" },
  { id: "connect", label: "Let's connect" },
];

/** Section label. On the aurora (intro, connect) it uses solid ink to keep 4.5:1 contrast. */
function Eyebrow({ n, label, onAurora = false }: { n: number; label: string; onAurora?: boolean }) {
  return (
    <p className={`eyebrow ${onAurora ? "text-ink" : "text-muted"}`}>
      <span className={onAurora ? "font-bold" : "text-accent"}>{String(n).padStart(2, "0")}</span> — {label}
    </p>
  );
}

/** Giant section title that fills with the AI gradient while scrolling. */
function BigTitle({ id, children }: { id: string; children: string }) {
  return (
    <h2 id={id} className="mt-4 font-display text-[clamp(3.25rem,11vw,9.5rem)] font-bold uppercase leading-[0.9] tracking-[-0.035em]">
      <FillWord>{children}</FillWord>
    </h2>
  );
}

const md = "[&_strong]:font-semibold [&_strong]:text-ink";

// About (spec 003): an impact-led story in the reference's structure, in the light AI theme.
export default async function AboutPage() {
  const { profile, about } = await getPortfolio();
  const mail = `mailto:${profile.links.email}`;

  return (
    <>
      {/* 01 Intro */}
      <section id="intro" aria-labelledby="about-title" className="relative isolate overflow-hidden px-4 pb-20 pt-32 sm:px-6 xl:pl-28">
        <Aurora />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-canvas" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <div>
            <Eyebrow n={1} label="Intro" onAurora />
            <h1 id="about-title" className="mt-4 font-display text-[clamp(3.5rem,10vw,8.5rem)] font-bold uppercase leading-[0.88] tracking-[-0.04em]">
              <span className="sr-only">{profile.name}: </span>
              {about.headline.map((line, i) => (
                <span key={line} className={`block ${i === about.headline.length - 1 ? "text-gradient" : "text-ink"}`}>
                  {line}
                </span>
              ))}
            </h1>
            <div className={`mt-8 max-w-2xl text-lg leading-relaxed text-ink/80 sm:text-xl ${md}`}>
              <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{about.intro}</ReactMarkdown>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
            <div aria-hidden="true" className="ai-gradient absolute -inset-3 rounded-full opacity-30 blur-2xl" />
            <div className="ai-gradient relative aspect-square rounded-full p-[3px] shadow-[0_40px_90px_-40px_rgb(124_77_219/0.6)]">
              {profile.photo ? (
                <Image
                  src={profile.photo}
                  alt={`Portrait of ${profile.name}`}
                  width={640}
                  height={640}
                  priority
                  sizes="(min-width: 1024px) 34vw, 80vw"
                  className="h-full w-full rounded-full bg-surface object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center rounded-full bg-surface font-display text-6xl font-bold">
                  {profile.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2)}
                </div>
              )}
            </div>
            <div className="mt-5 flex justify-between gap-4">
              <p className="eyebrow text-ink">{profile.location.city}</p>
              <p className="eyebrow text-right text-ink">{profile.highlights.find((h) => !h.period)?.label}</p>
            </div>
            <div className="glass mt-5 rounded-2xl p-4">
              <p className="eyebrow text-accent">Current focus</p>
              <p className="mt-1.5 text-sm text-ink">{profile.currentFocus}</p>
            </div>
          </div>
        </div>

        {about.stats.length > 0 && (
          <dl data-reveal className="relative mx-auto mt-16 grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 border-t border-line pt-10 md:grid-cols-4">
            {about.stats.map((s) => (
              <div key={s.label}>
                <dd className="text-gradient font-display text-5xl font-bold tracking-tight sm:text-6xl">
                  <CountUp value={s.value} prefix={s.prefix} suffix={s.suffix} />
                </dd>
                <dt className="eyebrow mt-3 text-muted">{s.label}</dt>
              </div>
            ))}
          </dl>
        )}
      </section>

      {/* 02 Approach */}
      <section id="approach" aria-labelledby="approach-title" className="px-4 py-24 sm:px-6 md:py-36 xl:pl-28">
        <div className="mx-auto max-w-7xl">
          <Eyebrow n={2} label="Approach" />
          <BigTitle id="approach-title">Approach</BigTitle>
          <ol className="mt-14 divide-y divide-line border-y border-line">
            {about.principles.map((p, i) => (
              <li key={p.word} data-reveal className="grid items-center gap-4 py-10 md:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1fr)] md:gap-10">
                <span className="font-mono text-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
                <p className="font-display text-6xl font-bold uppercase tracking-[-0.03em] sm:text-7xl md:text-8xl">
                  <FillWord>{p.word}</FillWord>
                </p>
                <p className="text-lg leading-relaxed text-ink/80">{p.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 03 Experience */}
      <section id="experience" aria-labelledby="experience-title" className="px-4 py-24 sm:px-6 md:py-36 xl:pl-28">
        <div className="mx-auto max-w-7xl">
          <Eyebrow n={3} label="Experience" />
          <BigTitle id="experience-title">Experience</BigTitle>
          <ol className="mt-14 space-y-5">
            {about.experience.map((e) => (
              <li key={e.role + e.org} data-reveal>
                <article className="glass glow-hover grid gap-6 rounded-3xl p-6 sm:p-8 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] md:gap-10">
                  <div>
                    <p className="eyebrow text-muted">{e.period}</p>
                    {e.metric && (
                      <p className="mt-4">
                        <span className="text-gradient block font-display text-5xl font-bold tracking-tight">
                          <CountUp value={e.metric.value} prefix={e.metric.prefix} suffix={e.metric.suffix} />
                        </span>
                        <span className="mt-1 block text-sm text-muted">{e.metric.label}</span>
                      </p>
                    )}
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{e.role}</h3>
                    <p className="mt-1 font-medium text-accent">{e.org}</p>
                    <ul className="mt-4 space-y-2.5">
                      {e.points.map((pt) => (
                        <li key={pt} className="flex gap-3 leading-relaxed text-ink/80">
                          <span aria-hidden="true" className="ai-gradient mt-2.5 size-1.5 shrink-0 rounded-full" />
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 04 Wins */}
      <section id="wins" aria-labelledby="wins-title" className="px-4 py-24 sm:px-6 md:py-36 xl:pl-28">
        <div className="mx-auto max-w-7xl">
          <Eyebrow n={4} label="Wins" />
          <BigTitle id="wins-title">Wins</BigTitle>
          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {about.wins.map((w, i) => (
              <li key={w.title} data-reveal style={{ ["--reveal-delay" as string]: `${(i % 3) * 120}ms` }}>
                <div className="glass glow-hover h-full rounded-3xl p-6">
                  <p className="eyebrow text-accent">{w.period}</p>
                  <h3 className="mt-3 font-display text-xl font-semibold leading-snug tracking-tight">{w.title}</h3>
                  <p className="mt-2 text-muted">{w.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 05 Education */}
      <section id="education" aria-labelledby="education-title" className="px-4 py-24 sm:px-6 md:py-36 xl:pl-28">
        <div className="mx-auto max-w-7xl">
          <Eyebrow n={5} label="Education" />
          <BigTitle id="education-title">Education</BigTitle>
          <ol className="mt-14 divide-y divide-line border-y border-line">
            {about.education.map((ed) => (
              <li key={ed.school} data-reveal className="grid gap-3 py-8 md:grid-cols-[12rem_minmax(0,1fr)] md:gap-10">
                <p className="eyebrow pt-1.5 text-muted">{ed.period}</p>
                <div>
                  <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{ed.school}</h3>
                  <p className="mt-1 text-lg text-accent">{ed.detail}</p>
                  {ed.points.map((pt) => (
                    <p key={pt} className="mt-2 text-ink/75">
                      {pt}
                    </p>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 06 Toolkit */}
      <section id="toolkit" aria-labelledby="toolkit-title" className="px-4 py-24 sm:px-6 md:py-36 xl:pl-28">
        <div className="mx-auto max-w-7xl">
          <Eyebrow n={6} label="Toolkit" />
          <BigTitle id="toolkit-title">Toolkit</BigTitle>
          <dl className="mt-14 grid gap-5 md:grid-cols-2">
            {about.toolkit.map((g) => (
              <div key={g.group} data-reveal className="glass rounded-3xl p-6 sm:p-8">
                <dt className="eyebrow text-muted">{g.group}</dt>
                <dd className="mt-4 flex flex-wrap gap-2">
                  {g.items.map((t) => (
                    <span key={t} className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm shadow-sm">
                      {t}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 07 Let's connect */}
      <section id="connect" aria-labelledby="connect-title" className="relative isolate overflow-hidden px-4 py-28 text-center sm:px-6 md:py-40">
        <Aurora />
        <div className="relative mx-auto max-w-5xl">
          <Eyebrow n={7} label="Let's connect" onAurora />
          <h2 id="connect-title" className="mt-4 font-display text-[clamp(3.5rem,12vw,10rem)] font-bold uppercase leading-[0.9] tracking-[-0.04em]">
            <FillWord>Let&apos;s</FillWord> <FillWord>connect.</FillWord>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
            Open to <span className="text-ink">{profile.openTo.term}</span> in{" "}
            {new Intl.ListFormat("en", { type: "conjunction" }).format(profile.openTo.roles)}.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <ButtonLink href={mail} className="px-7 py-3">
              Email me
            </ButtonLink>
            {profile.links.linkedin && (
              <a
                href={profile.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-7 py-3 text-sm font-medium shadow-sm hover:border-ink/25"
              >
                LinkedIn <span aria-hidden="true">↗</span>
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
            <ButtonLink href="/resume" variant="ghost" className="px-7 py-3">
              Resume
            </ButtonLink>
          </div>
          <p className="mt-8 text-sm text-muted">
            Or <Link href="/#contact" className="text-accent underline">send a message</Link> from the home page.
          </p>
        </div>
      </section>

      {/* Fixed/behaviour-only pieces come last so the first DOM node is the intro (Next.js
          scrolls a new page to its first element). */}
      <SectionTracker sections={SECTIONS} />
      <ScrollFillDriver />
    </>
  );
}
