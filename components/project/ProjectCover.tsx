import Image from "next/image";
import type { PortfolioProject } from "@/lib/content/merge";

// Deterministic hue pair per project so each fallback cover looks distinct but on-theme.
function hues(slug: string): [number, number] {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) % 360;
  const a = 210 + (h % 30); // blue range
  const b = 265 + (h % 60); // violet → rose range
  return [a, b];
}

/** The project's cover screenshot, or a generated glass "hologram" card when it has none. */
export function ProjectCover({
  project,
  sizes,
  priority = false,
  showTitle = true,
  className = "",
}: {
  project: PortfolioProject;
  sizes: string;
  priority?: boolean;
  /** Off where the page already overlays the title (case-study hero). */
  showTitle?: boolean;
  className?: string;
}) {
  if (project.cover) {
    return (
      <Image
        src={project.cover.src}
        alt={project.cover.alt}
        width={project.cover.width}
        height={project.cover.height}
        sizes={sizes}
        priority={priority}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }
  const [a, b] = hues(project.slug);
  return (
    <div
      role="img"
      aria-label={`${project.title} cover`}
      className={`@container relative h-full w-full overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(110% 90% at 12% 8%, hsl(${a} 95% 82% / 0.9), transparent 60%), radial-gradient(100% 85% at 92% 92%, hsl(${b} 90% 85% / 0.85), transparent 62%), linear-gradient(160deg, #ffffff, #f2f3f7)`,
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgb(0 0 0 / 0.05) 1px, transparent 1px), linear-gradient(90deg, rgb(0 0 0 / 0.05) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
      <div aria-hidden="true" className="absolute inset-0 flex flex-col justify-between p-5">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2 rounded-full bg-ink/20" />
          ))}
        </div>
        <div className={showTitle ? "" : "invisible"}>
          <p className="font-display text-[min(3rem,11cqw)] font-semibold leading-tight tracking-tight text-ink">
            {project.title}
          </p>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-ink/60">
            {project.topLanguages.join(" · ")}
          </p>
        </div>
      </div>
    </div>
  );
}
