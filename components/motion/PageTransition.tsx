"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

// Cinematic route transition (spec 003): two frosted panels seal along a glowing AI-gradient
// beam (with the destination name resolving on it), the route changes behind them, then the
// panels split open from the seam. Internal links only; skipped under reduced motion.

type Phase = "idle" | "closing" | "closed" | "opening" | "jump";

const CLOSE_MS = 480;
const OPEN_MS = 720;
const FAILSAFE_MS = 4000;
const JUMP_MS = 900;

const LABELS: Record<string, string> = { "/": "Home", "/about": "About", "/work": "Work", "/resume": "Resume" };

function labelFor(pathname: string) {
  if (LABELS[pathname]) return LABELS[pathname];
  if (pathname.startsWith("/projects/")) return "Project";
  if (pathname.startsWith("/admin")) return "Admin";
  return "Loading";
}

function internalTarget(event: MouseEvent): URL | null {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return null;
  }
  const anchor = (event.target as Element | null)?.closest?.("a");
  if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return null;
  const href = anchor.getAttribute("href");
  if (!href || href === "#" || href.startsWith("mailto:") || href.startsWith("tel:")) return null;
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin || url.pathname.startsWith("/api/")) return null;
  return url;
}

/** "#contact" → "Contact" for the in-page jump label. */
const sectionLabel = (hash: string) => hash.replace(/^#/, "").replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());

export function PageTransition({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [label, setLabel] = useState("");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lastPath = useRef(pathname);
  // True while a click-started navigation is in flight (not back/forward).
  const fromClick = useRef(false);

  const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const open = useCallback(() => {
    clearTimers();
    setPhase("opening");
    later(() => setPhase("idle"), OPEN_MS);
  }, []);

  // Intercept internal link clicks: close the aperture, then navigate behind it.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onClick = (event: MouseEvent) => {
      const url = internalTarget(event);
      if (!url) return;
      // Same page with a section hash: let the browser glide there, and sweep the beam across.
      if (url.pathname === window.location.pathname) {
        if (!url.hash) return;
        setLabel(sectionLabel(url.hash));
        clearTimers();
        setPhase("jump");
        later(() => setPhase("idle"), JUMP_MS);
        return;
      }
      // Runs in the capture phase, before next/link's own handler would navigate instantly.
      event.preventDefault();
      event.stopPropagation();
      const destination = url.pathname + url.search + url.hash;
      router.prefetch(destination);
      setLabel(labelFor(url.pathname));
      clearTimers();
      setPhase("closing");
      later(() => {
        setPhase("closed");
        fromClick.current = true;
        router.push(destination);
      }, CLOSE_MS);
      // Never leave the visitor behind a closed aperture if navigation stalls.
      later(open, CLOSE_MS + FAILSAFE_MS);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router, open]);

  // New route rendered: split the panels open (also plays a short reveal on back/forward).
  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;
    // Clicked links arrive at the top (or their section); back/forward keeps the browser's
    // restored scroll position.
    if (fromClick.current && !window.location.hash) window.scrollTo({ top: 0, behavior: "instant" });
    fromClick.current = false;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const frame = requestAnimationFrame(() => requestAnimationFrame(open));
    return () => cancelAnimationFrame(frame);
  }, [pathname, open]);

  useEffect(() => clearTimers, []);

  return (
    <>
      {/* Keyed by route so the arriving page replays its focus-in animation. */}
      <div key={pathname} className={phase === "opening" ? "page-arrive" : ""}>
        {children}
      </div>
      <div aria-hidden="true" className="page-aperture" data-phase={phase}>
        <div className="aperture-panel aperture-top" />
        <div className="aperture-panel aperture-bottom" />
        <div className="aperture-beam">
          <span className="aperture-glow" />
          <span className="aperture-core" />
          <span className="aperture-spark" />
        </div>
        <p className="aperture-label eyebrow">{label}</p>
      </div>
      <p role="status" className="sr-only">
        {phase === "closing" || phase === "closed" ? `Loading ${label}` : ""}
      </p>
    </>
  );
}
