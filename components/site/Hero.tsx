import { HeroAsk } from "@/components/chat/HeroAsk";
import { Aurora } from "@/components/site/Aurora";
import { CurrentlyCard } from "@/components/site/CurrentlyCard";
import { ArrowLink } from "@/components/ui/Button";
import { parseStatement } from "@/lib/content/journey";
import type { Profile } from "@/lib/schemas";

// Statement hero (spec 002 US1): statement + degree line on the left, Currently card right.
export function Hero({ profile }: { profile: Profile }) {
  const school = profile.highlights.find((h) => !h.period)?.label;
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden px-4 pb-20 pt-32 sm:px-6 lg:flex lg:min-h-[100svh] lg:items-center lg:pt-28"
    >
      <Aurora />
      {/* Fades the aurora into the page so the next section starts on a clean canvas. */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-canvas" />
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-16">
        <div className="flex flex-col items-start gap-7">
          <p className="eyebrow text-muted">
            {profile.name}
            {school && <> · {school}</>}
          </p>
          <h1
            id="hero-title"
            className="max-w-4xl font-display text-[2.5rem] font-light leading-[1.06] tracking-tight text-ink sm:text-6xl lg:text-[4.25rem]"
          >
            {parseStatement(profile.statement).map((part, i) =>
              part.bold ? (
                <strong key={i} className="text-gradient font-semibold">
                  {part.text}
                </strong>
              ) : (
                <span key={i}>{part.text}</span>
              ),
            )}
          </h1>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-10">
            <p className="max-w-md text-base leading-relaxed text-muted sm:text-lg">{profile.positioning}.</p>
            <div className="flex shrink-0 gap-6">
              <ArrowLink href="/about">More about me</ArrowLink>
              <ArrowLink href="/work">My work</ArrowLink>
            </div>
          </div>
          <HeroAsk suggestions={profile.suggestedQuestions} />
        </div>
        <CurrentlyCard openTo={profile.openTo} location={profile.location} />
      </div>
    </section>
  );
}
