"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { openChat } from "@/components/chat/events";

// Icon navigation (spec 002, FR-105): icons in the corners, labels slide out on hover/focus.
// Phones get a text menu.

type Item = { href: string; label: string; icon: keyof typeof ICONS; match: (p: string) => boolean };

const LEFT: Item[] = [
  { href: "/", label: "Home", icon: "home", match: (p) => p === "/" },
  { href: "/about", label: "About", icon: "person", match: (p) => p.startsWith("/about") },
];
const RIGHT: Item[] = [
  { href: "/work", label: "Work", icon: "grid", match: (p) => p.startsWith("/work") || p.startsWith("/projects") },
  { href: "/resume", label: "Resume", icon: "doc", match: (p) => p.startsWith("/resume") },
  { href: "/#contact", label: "Contact", icon: "mail", match: () => false },
];

const ICONS = {
  home: <path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1z" />,
  person: (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c.8-3.5 3.6-5.5 7-5.5s6.2 2 7 5.5" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
    </>
  ),
  doc: (
    <>
      <path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20z" />
      <path d="M14 3.5V8h4M9.5 12.5h6M9.5 16h6" />
    </>
  ),
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
};

function Icon({ name, className }: { name: keyof typeof ICONS; className: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
      {ICONS[name]}
    </svg>
  );
}

function NavIcon({ item, active }: { item: Item; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`group flex h-10 items-center rounded-full px-2.5 text-sm transition-colors duration-300 hover:bg-ink/5 ${
        active ? "text-ink" : "text-muted hover:text-ink"
      }`}
    >
      <Icon name={item.icon} className="size-5 shrink-0" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap font-medium transition-[max-width,margin] duration-300 group-hover:ml-2 group-hover:max-w-24 group-focus-visible:ml-2 group-focus-visible:max-w-24">
        {item.label}
      </span>
      {active && <span aria-hidden="true" className="ml-1 size-1 rounded-full bg-ink" />}
    </Link>
  );
}

export function GlassNav({ name }: { name: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <nav
        aria-label="Main"
        className={`mx-auto flex max-w-7xl items-center justify-between rounded-full px-2 py-1 transition-colors duration-300 ${
          scrolled || open ? "glass-nav shadow-sm" : "border border-transparent"
        }`}
      >
        <div className="flex items-center">
          <ul className="hidden items-center sm:flex">
            {LEFT.map((item) => (
              <li key={item.href}>
                <NavIcon item={item} active={item.match(pathname)} />
              </li>
            ))}
          </ul>
          <Link href="/" className="px-3 font-display text-sm font-semibold tracking-tight sm:hidden">
            {name}
          </Link>
        </div>

        <div className="flex items-center gap-1">
          <ul className="hidden items-center sm:flex">
            {RIGHT.map((item) => (
              <li key={item.href}>
                <NavIcon item={item} active={item.match(pathname)} />
              </li>
            ))}
          </ul>
          {!isAdmin && (
            <button
              type="button"
              onClick={() => openChat()}
              className="ai-gradient ml-1 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium text-white shadow-sm transition-transform hover:scale-[1.03]"
            >
              <span aria-hidden="true">✦</span>
              Ask AI
            </button>
          )}
          <button
            ref={toggleRef}
            type="button"
            className="grid size-10 place-items-center rounded-full text-ink hover:bg-ink/5 sm:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-menu" ref={menuRef} className="glass mx-auto mt-2 max-w-7xl rounded-3xl p-2 sm:hidden">
          <ul className="flex flex-col">
            {[...LEFT, ...RIGHT].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={item.match(pathname) ? "page" : undefined}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-ink hover:bg-ink/5"
                >
                  <Icon name={item.icon} className="size-5 text-muted" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
