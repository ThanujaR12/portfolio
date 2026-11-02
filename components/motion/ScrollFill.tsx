"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Drives every [data-fill] element on the page: sets --p from 0 to 1 as the element travels
// from the lower to the upper part of the viewport, so outlined headings fill with the AI
// gradient while scrolling (spec 003). One rAF-throttled listener for the whole page.
export function ScrollFillDriver() {
  const pathname = usePathname();

  useEffect(() => {
    const els = [...document.querySelectorAll<HTMLElement>("[data-fill]")];
    if (els.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.style.setProperty("--p", "1"));
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      for (const el of els) {
        const top = el.getBoundingClientRect().top;
        // 0 when the word's top is at 90% of the viewport, 1 when it reaches 40%.
        const p = Math.min(1, Math.max(0, (vh * 0.9 - top) / (vh * 0.5)));
        el.style.setProperty("--p", p.toFixed(3));
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return null;
}

/** A giant word that starts as an outline and fills with the AI gradient on scroll. */
export function FillWord({ children, className = "" }: { children: string; className?: string }) {
  return (
    <span data-fill className={`fill-word ${className}`}>
      {children}
    </span>
  );
}
