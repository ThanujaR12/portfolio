import { Aurora } from "@/components/site/Aurora";
import { ResolvingName } from "@/components/site/ResolvingName";
import { ButtonLink } from "@/components/ui/Button";
import type { Profile } from "@/lib/schemas";

// First screen (spec 002 addendum): the owner's name, large, resolving like AI output over the
// aurora, with a glowing AI-gradient horizon line, roles, degree, actions and a scroll cue.
export function NameIntro({ profile }: { profile: Profile }) {
  const [first, ...rest] = profile.name.trim().split(/\s+/);
  const lines = rest.length ? [first, rest.join(" ")] : [first];
  const school = profile.highlights.find((h) => !h.period);

  return (
    <section
      aria-labelledby="name-title"
      className="relative isolate flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 pb-28 pt-28 text-center sm:px-6"
    >
      <Aurora />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-canvas" />

      <div className="relative w-full max-w-7xl">
        <h1
          id="name-title"
          className="font-display text-[clamp(2.75rem,12vw,10.5rem)] font-bold uppercase leading-[0.88] tracking-[-0.035em] text-ink"
        >
          <ResolvingName lines={lines} />
        </h1>

        {/* Horizon: a crisp AI-gradient line with a soft glow beneath the name. */}
        <div aria-hidden="true" className="relative mx-auto mt-8 h-px w-full max-w-5xl sm:mt-10">
          <div className="ai-gradient absolute inset-0 opacity-90" />
          <div className="ai-gradient absolute inset-x-[15%] -inset-y-2 opacity-40 blur-md" />
          <div className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_18px_6px_rgb(124_77_219/0.55)]" />
        </div>

        <p className="eyebrow mt-8 text-accent sm:mt-10">
          {profile.openTo.roles.join(" · ")}
        </p>
        {school && (
          <p className="mt-3 text-sm text-muted sm:text-base">
            {school.detail} · {school.label}
          </p>
        )}

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/#contact" className="px-7 py-3">
            Get in touch
          </ButtonLink>
          <ButtonLink href="/#work" variant="ghost" className="px-7 py-3">
            View projects
          </ButtonLink>
        </div>
      </div>

      <a
        href="#intro"
        className="group absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 text-muted hover:text-ink"
      >
        <span className="eyebrow">
          Scroll<span className="sr-only"> to the introduction</span>
        </span>
        <span aria-hidden="true" className="scroll-cue relative block h-10 w-px overflow-hidden bg-ink/15">
          <span className="ai-gradient absolute inset-x-0 top-0 h-1/2" />
        </span>
      </a>
    </section>
  );
}
