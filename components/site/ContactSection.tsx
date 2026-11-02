import Link from "next/link";
import { ContactForm } from "@/components/site/ContactForm";
import type { Profile } from "@/lib/schemas";

// "Let's build" closing section (spec 002 US2) with the contact form and direct links.
export function ContactSection({ profile }: { profile: Profile }) {
  const links = [
    { label: "Email", value: profile.links.email, href: `mailto:${profile.links.email}` },
    { label: "GitHub", value: profile.links.github.replace("https://", ""), href: profile.links.github },
    profile.links.linkedin && {
      label: "LinkedIn",
      value: profile.links.linkedin.replace(/^https:\/\/(www\.)?/, ""),
      href: profile.links.linkedin,
    },
  ].filter((l): l is { label: string; value: string; href: string } => Boolean(l));

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative isolate overflow-hidden px-4 py-24 sm:px-6 md:py-36">
      <div aria-hidden="true" className="aurora opacity-60">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="relative mx-auto max-w-7xl">
        <header data-reveal className="mx-auto max-w-4xl text-center">
          <h2 id="contact-title" className="font-display text-6xl font-semibold leading-[0.95] tracking-tight sm:text-8xl md:text-9xl">
            Let&apos;s <span className="text-gradient">build.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
            Open to <span className="text-ink">{profile.openTo.term}</span> in{" "}
            {new Intl.ListFormat("en", { type: "conjunction" }).format(profile.openTo.roles)}.
          </p>
        </header>
        <div data-reveal className="mx-auto mt-14 grid max-w-5xl gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <ContactForm fallbackEmail={profile.links.email} />
          <ul className="flex flex-col gap-3">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  {...(!l.href.startsWith("mailto:") && { target: "_blank", rel: "noopener noreferrer" })}
                  className="glass glow-hover block rounded-2xl p-5"
                >
                  <span className="eyebrow text-muted">{l.label}</span>
                  <span className="mt-1.5 block truncate text-ink">{l.value}</span>
                </a>
              </li>
            ))}
            <li>
              <Link href="/resume" className="glass glow-hover block rounded-2xl p-5">
                <span className="eyebrow text-muted">Resume</span>
                <span className="mt-1.5 block text-ink">View or download ↗</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
