"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { openChat } from "@/components/chat/events";

const SECTIONS = [
  { id: "featured", label: "Work" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
] as const;

export function GlassNav({ name }: { name: string }) {
  const pathname = usePathname();
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Highlight the section nearest the top of the viewport (home page only).
  useEffect(() => {
    if (pathname !== "/") return;
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      setActive(null);
    };
  }, [pathname]);

  // Mobile menu: Escape closes and returns focus to the toggle.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    menuRef.current?.querySelector("a")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  const linkClass = (id: string) =>
    `rounded-full px-3 py-1.5 text-sm transition-colors ${
      active === id ? "bg-white/10 text-ink" : "text-muted hover:text-ink"
    }`;

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:px-6">
      <nav
        aria-label="Main"
        className="glass-nav mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-3 py-2 sm:px-4"
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 font-display font-semibold tracking-wide"
        >
          <span
            aria-hidden="true"
            className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-cyan to-violet text-xs font-bold text-space"
          >
            {initials}
          </span>
          <span className="text-sm uppercase">{name.split(" ")[0]}</span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <Link
                href={`/#${s.id}`}
                className={linkClass(s.id)}
                aria-current={active === s.id ? "location" : undefined}
              >
                {s.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/resume"
              className={linkClass("resume")}
              aria-current={pathname === "/resume" ? "page" : undefined}
            >
              Resume
            </Link>
          </li>
        </ul>

        <div className="flex items-center gap-2">
          {!pathname.startsWith("/admin") && (
            <button
              type="button"
              onClick={() => openChat()}
              className="inline-flex items-center gap-2 rounded-full border border-cyan/40 bg-cyan/10 px-3.5 py-1.5 text-sm text-ink transition-colors hover:bg-cyan/20"
            >
              <span aria-hidden="true" className="size-1.5 animate-pulse rounded-full bg-cyan" />
              Ask AI
            </button>
          )}
          <button
            ref={toggleRef}
            type="button"
            className="grid size-9 place-items-center rounded-lg text-muted hover:text-ink md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div
          id="mobile-menu"
          ref={menuRef}
          className="glass-nav mx-auto mt-2 max-w-6xl rounded-2xl p-2 md:hidden"
        >
          <ul className="flex flex-col">
            {[...SECTIONS, { id: "resume", label: "Resume" }].map((s) => (
              <li key={s.id}>
                <Link
                  href={s.id === "resume" ? "/resume" : `/#${s.id}`}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 text-ink hover:bg-white/5"
                >
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
