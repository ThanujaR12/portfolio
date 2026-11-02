import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Journey, JourneyItem } from "@/lib/content/journey";

function ItemCard({ item }: { item: JourneyItem }) {
  const body = (
    <>
      <p className={`eyebrow ${item.kind === "next" ? "text-ai" : item.kind === "project" ? "text-accent" : "text-muted"}`}>
        {item.kind === "next" ? "Next" : item.kind === "project" ? "Project" : "Milestone"}
      </p>
      <p className="mt-1.5 font-display text-lg font-semibold leading-snug tracking-tight">{item.title}</p>
      <p className="mt-1 line-clamp-2 text-sm text-muted">{item.detail}</p>
    </>
  );
  const base = "block rounded-2xl p-4 text-left transition-colors";
  if (item.kind === "next") {
    return <div className={`${base} border border-dashed border-ai/40 bg-ai/[0.04]`}>{body}</div>;
  }
  if (item.href) {
    return (
      <Link href={item.href} className={`${base} glass glow-hover`}>
        {body}
      </Link>
    );
  }
  return <div className={`${base} glass`}>{body}</div>;
}

// Journey (spec 002 US2): horizontal year axis on desktop, vertical list on phones.
export function JourneySection({ journey }: { journey: Journey }) {
  if (journey.years.length === 0) return null;
  return (
    <section id="journey" aria-labelledby="journey-title" className="px-4 py-24 sm:px-6 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading label="Journey" id="journey-title" title="Where I've been building" />

        {journey.context.length > 0 && (
          <ul data-reveal className="mb-10 flex flex-wrap gap-3">
            {journey.context.map((c) => (
              <li key={c.title} className="rounded-full border border-line bg-surface px-4 py-2 text-sm shadow-sm">
                <span className="font-semibold">{c.title}</span>
                <span className="text-muted"> · {c.detail}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Desktop: one column per year along a line that draws itself in. */}
        <div data-reveal className="relative hidden md:block">
          <div aria-hidden="true" className="journey-line ai-gradient absolute inset-x-0 top-[2.15rem] h-px" />
          <ol
            className="grid gap-6"
            style={{ gridTemplateColumns: `repeat(${journey.years.length}, minmax(0, 1fr))` }}
          >
            {journey.years.map(({ year, items }, col) => (
              <li key={year} data-reveal style={{ ["--reveal-delay" as string]: `${200 + col * 150}ms` }}>
                <p className="font-display text-2xl font-semibold tracking-tight text-ink">{year}</p>
                <span aria-hidden="true" className="relative mt-2 block size-3 rounded-full border-2 border-surface bg-accent shadow" />
                <ul className="mt-6 space-y-3">
                  {items.map((item) => (
                    <li key={item.key}>
                      <ItemCard item={item} />
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>

        {/* Phones: vertical timeline. */}
        <ol className="space-y-8 border-l border-line pl-6 md:hidden">
          {journey.years.map(({ year, items }) => (
            <li key={year} data-reveal className="relative">
              <span aria-hidden="true" className="ai-gradient absolute -left-[1.95rem] top-2 size-3 rounded-full ring-4 ring-canvas" />
              <p className="font-display text-xl font-semibold">{year}</p>
              <ul className="mt-3 space-y-3">
                {items.map((item) => (
                  <li key={item.key}>
                    <ItemCard item={item} />
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
