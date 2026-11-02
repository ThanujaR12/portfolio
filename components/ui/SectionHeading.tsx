import { ArrowLink } from "@/components/ui/Button";

export function SectionHeading({
  label,
  title,
  id,
  link,
}: {
  label: string;
  title: React.ReactNode;
  id: string;
  link?: { href: string; label: string };
}) {
  return (
    <header data-reveal className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between md:mb-16">
      <div>
        <p className="eyebrow text-accent">{label}</p>
        <h2 id={id} className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight md:text-6xl">
          {title}
        </h2>
      </div>
      {link && (
        <ArrowLink href={link.href} className="shrink-0 self-start sm:self-auto">
          {link.label}
        </ArrowLink>
      )}
    </header>
  );
}
