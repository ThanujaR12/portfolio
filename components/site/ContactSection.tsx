import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Profile } from "@/lib/schemas";

export function ContactSection({ profile }: { profile: Profile }) {
  const links = [
    { label: "Email", value: profile.links.email, href: `mailto:${profile.links.email}` },
    { label: "GitHub", value: profile.links.github.replace("https://", ""), href: profile.links.github },
    profile.links.linkedin && {
      label: "LinkedIn",
      value: profile.links.linkedin.replace("https://", ""),
      href: profile.links.linkedin,
    },
  ].filter((l): l is { label: string; value: string; href: string } => Boolean(l));

  return (
    <section id="contact" aria-labelledby="contact-title" className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          index="05"
          label="Contact"
          id="contact-title"
          title={
            <>
              Let&apos;s build something <span className="text-gradient">together</span>
            </>
          }
        />
        <ul className="grid gap-4 sm:grid-cols-3">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                {...(!l.href.startsWith("mailto:") && { target: "_blank", rel: "noopener noreferrer" })}
                className="glass glow-hover block rounded-2xl p-5"
              >
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">{l.label}</span>
                <span className="mt-2 block truncate text-ink">{l.value}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
