import { HeroAsk } from "@/components/chat/HeroAsk";
import { HeroBackground } from "@/components/site/HeroBackground";
import { StatsStrip } from "@/components/site/StatsStrip";
import { ButtonLink } from "@/components/ui/Button";
import type { GitHubStats } from "@/lib/content/portfolio";
import type { Profile } from "@/lib/schemas";

export function Hero({ profile, stats }: { profile: Profile; stats: GitHubStats }) {
  // Split the positioning line so its second half carries the gradient.
  const words = profile.positioning.split(" ");
  const cut = Math.ceil(words.length / 2);
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden px-4 pb-16 pt-28 sm:px-6"
    >
      <HeroBackground />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-start gap-7">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
          <span className="text-cyan">◈</span> {profile.name}
        </p>
        <h1
          id="hero-title"
          className="max-w-4xl font-display text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
        >
          {words.slice(0, cut).join(" ")}{" "}
          <span className="text-gradient">{words.slice(cut).join(" ")}</span>
        </h1>
        <p className="max-w-xl text-base text-muted sm:text-lg">{profile.currentFocus}</p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/#featured">Explore work →</ButtonLink>
          <ButtonLink href="/#contact" variant="ghost">
            Get in touch
          </ButtonLink>
        </div>
        <HeroAsk suggestions={profile.suggestedQuestions} />
        <StatsStrip stats={stats} />
      </div>
    </section>
  );
}
