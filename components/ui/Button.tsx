import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-[transform,box-shadow,background-color,border-color] duration-200 active:scale-[0.98]";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-white shadow-sm hover:bg-ink/85",
  ghost: "border border-line bg-surface text-ink shadow-sm hover:border-ink/25",
};

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function ExternalButton({
  variant = "primary",
  className = "",
  children,
  ...props
}: ComponentProps<"a"> & { variant?: Variant }) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
      <span aria-hidden="true">↗</span>
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

/** Underlined uppercase text link with an arrow, e.g. "MORE ABOUT ME ↗". */
export function ArrowLink({ className = "", children, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={`eyebrow group inline-flex items-center gap-2 border-b border-ink/30 pb-1 text-ink transition-colors hover:border-accent hover:text-accent ${className}`}
      {...props}
    >
      {children}
      <span aria-hidden="true" className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
        ↗
      </span>
    </Link>
  );
}
