import Image from "next/image";
import type { PortfolioProject } from "@/lib/content/merge";

// Deterministic hue pair per project so each fallback cover looks distinct but on-theme.
function hues(slug: string): [number, number] {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) % 360;
  const a = 185 + (h % 40); // cyan → teal range
  const b = 255 + (h % 45); // violet → magenta range
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
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(120% 90% at 15% 10%, hsl(${a} 90% 55% / 0.35), transparent 55%), radial-gradient(100% 80% at 90% 90%, hsl(${b} 85% 60% / 0.4), transparent 60%), #070a16`,
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgb(255 255 255 / 0.07) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.07) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
      <div aria-hidden="true" className="absolute inset-0 flex flex-col justify-between p-5">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2 rounded-full bg-white/20" />
          ))}
        </div>
        <div className={showTitle ? "" : "invisible"}>
          <p className="font-display text-4xl font-semibold tracking-tight text-white/90 sm:text-5xl">
            {project.title}
          </p>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-white/50">
            {project.topLanguages.join(" · ")}
          </p>
        </div>
      </div>
    </div>
  );
}
