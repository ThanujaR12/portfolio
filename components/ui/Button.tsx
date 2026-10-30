import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-[transform,box-shadow,background-color,border-color] duration-200 active:scale-[0.98]";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-cyan to-violet text-space shadow-[0_8px_30px_-8px_rgb(34_211_238/0.6)] hover:shadow-[0_10px_40px_-6px_rgb(139_92_246/0.7)]",
  ghost: "glass text-ink hover:border-cyan/50",
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
