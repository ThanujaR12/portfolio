"use client";

import { useEffect, useState } from "react";

// The owner's name "resolving" like AI output (spec 002, FR-108/109): each letter cycles
// through random glyphs, then settles left to right. Every letter keeps its final glyph in
// place (invisible while scrambling), so nothing shifts. Assistive tech reads the sr-only name.

// Medium-width glyphs only, so scrambling letters never spill over their neighbours.
const GLYPHS = "ABCDEFGHKLNOPRSTUVXYZ0123456789#$?+=";
const START_MS = 250;
const STEP_MS = 55;
const TICK_MS = 45;

export function ResolvingName({ lines, className = "" }: { lines: string[]; className?: string }) {
  // null = fully resolved (server render, no JS, reduced motion, or finished).
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const total = lines.join("").length;
  const doneAt = START_MS + total * STEP_MS;

  useEffect(() => {
    // Revealing here (not in render) keeps server and first client render identical.
    setReady(true);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const start = performance.now();
    let last = 0;
    let frame = requestAnimationFrame(function tick(now) {
      const t = now - start;
      if (t >= doneAt) {
        setElapsed(null);
        return;
      }
      if (now - last >= TICK_MS) {
        last = now;
        setElapsed(t);
      }
      frame = requestAnimationFrame(tick);
    });
    setElapsed(0);
    return () => cancelAnimationFrame(frame);
  }, [doneAt]);

  let index = 0;
  return (
    <span className={className}>
      <span className="sr-only">{lines.join(" ")}</span>
      <span aria-hidden="true" className="name-resolve block" data-ready={ready ? "" : undefined}>
        {lines.map((line) => (
          <span key={line} className="block whitespace-nowrap">
            {[...line].map((ch, j) => {
              const i = index++;
              const settled = elapsed === null || elapsed >= START_MS + i * STEP_MS;
              return (
                <span key={j} className="relative inline-block">
                  <span className={settled ? "" : "invisible"}>{ch}</span>
                  {!settled && (
                    <span className="text-gradient absolute inset-0 text-center">
                      {GLYPHS[Math.floor(Math.random() * GLYPHS.length)]}
                    </span>
                  )}
                </span>
              );
            })}
          </span>
        ))}
      </span>
    </span>
  );
}
