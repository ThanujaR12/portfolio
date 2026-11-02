import { CountUp } from "@/components/motion/CountUp";
import { ArrowLink } from "@/components/ui/Button";
import type { About } from "@/lib/schemas";

// Home "impact in numbers" band (spec 003): the About stats, counting up on scroll.
export function ImpactBand({ stats }: { stats: About["stats"] }) {
  if (stats.length === 0) return null;
  return (
    <section aria-labelledby="impact-title" className="px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div data-reveal className="glass rounded-[2rem] p-6 sm:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="impact-title" className="eyebrow text-accent">
              Impact in numbers
            </h2>
            <ArrowLink href="/about#experience">The stories behind them</ArrowLink>
          </div>
          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="border-l border-line pl-5">
                <dd className="text-gradient font-display text-5xl font-bold tracking-tight sm:text-6xl">
                  <CountUp value={s.value} prefix={s.prefix} suffix={s.suffix} />
                </dd>
                <dt className="mt-3 text-sm text-muted">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
