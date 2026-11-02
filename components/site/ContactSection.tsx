import { ContactChannels, type Channel } from "@/components/site/ContactChannels";
import { ContactForm } from "@/components/site/ContactForm";
import type { Profile } from "@/lib/schemas";

// "Let's build" closing section (spec 002 US2): the contact form, then direct channels.
export function ContactSection({ profile }: { profile: Profile }) {
  const channels = ([
    { label: "Email", value: profile.links.email, href: `mailto:${profile.links.email}`, copy: true },
    profile.links.linkedin && {
      label: "LinkedIn",
      value: profile.links.linkedin.replace(/^https:\/\/(www\.)?/, ""),
      href: profile.links.linkedin,
      external: true,
    },
    { label: "GitHub", value: profile.links.github.replace("https://", ""), href: profile.links.github, external: true },
    { label: "Resume", value: "View or download", href: "/resume" },
  ] as (Channel | "" | null | undefined)[]).filter((c): c is Channel => Boolean(c));

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
        <div data-reveal className="mx-auto mt-14 max-w-3xl">
          <ContactForm fallbackEmail={profile.links.email} />
        </div>
        <div data-reveal className="mt-24 md:mt-32">
          <p className="eyebrow mb-6 text-muted">Or reach me directly</p>
          <ContactChannels channels={channels} />
        </div>
      </div>
    </section>
  );
}
