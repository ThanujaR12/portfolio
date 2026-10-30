import Image from "next/image";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Profile } from "@/lib/schemas";

export function AboutSection({ profile }: { profile: Profile }) {
  const initials = profile.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
  return (
    <section id="about" aria-labelledby="about-title" className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading index="04" label="About" id="about-title" title="Who's behind the work" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div className="glass flex flex-col items-start gap-5 rounded-3xl p-6">
            <div className="relative size-28 overflow-hidden rounded-2xl bg-gradient-to-br from-cyan/40 to-violet/50 p-[1px]">
              {profile.photo ? (
                <Image src={profile.photo} alt={profile.name} fill sizes="112px" className="rounded-2xl object-cover" />
              ) : (
                <div aria-hidden="true" className="grid h-full w-full place-items-center rounded-2xl bg-space-2 font-display text-3xl font-semibold">
                  {initials}
                </div>
              )}
            </div>
            <div>
              <p className="font-display text-xl font-semibold">{profile.name}</p>
              <p className="mt-1 text-sm text-muted">{profile.positioning}</p>
            </div>
            <div className="w-full rounded-2xl border border-cyan/20 bg-cyan/5 p-4">
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-cyan">Current focus</p>
              <p className="mt-1.5 text-sm">{profile.currentFocus}</p>
            </div>
          </div>
          <div className="glass rounded-3xl p-6 sm:p-8">
            <div className="space-y-4 leading-relaxed text-ink/90 [&_strong]:text-ink">
              <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{profile.bio}</ReactMarkdown>
            </div>
            {profile.highlights.length > 0 && (
              <ol className="mt-8 space-y-4 border-l border-line pl-5">
                {profile.highlights.map((h) => (
                  <li key={h.label} className="relative">
                    <span aria-hidden="true" className="absolute -left-[1.6rem] top-1.5 size-2.5 rounded-full bg-gradient-to-br from-cyan to-violet" />
                    <p className="font-medium">
                      {h.label}
                      {h.period && <span className="ml-2 font-mono text-xs text-muted">{h.period}</span>}
                    </p>
                    <p className="text-sm text-muted">{h.detail}</p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
