"use client";

import { useEffect, useRef } from "react";

// Drifting grid (pure CSS) plus a glow that follows the pointer. The glow stays anchored on
// touch devices and under reduced motion (FR-004a).
export function HeroBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduced) return;

    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        ref.current?.style.setProperty("--glow-x", `${e.clientX - rect.left}px`);
        ref.current?.style.setProperty("--glow-y", `${e.clientY - rect.top}px`);
      });
    };
    el.addEventListener("pointermove", onMove);
    return () => {
      el.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgb(139_92_246/0.18),transparent_60%)]" />
      <div className="hero-grid" />
      <div className="hero-glow" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-space" />
    </div>
  );
}
