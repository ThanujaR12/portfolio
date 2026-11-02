"use client";

import { useEffect, useState } from "react";

// Fixed 01–0n index on the left (large screens) that highlights the section in view.
export function SectionTracker({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  const activeIndex = sections.findIndex((s) => s.id === active);

  return (
    <nav aria-label="On this page" className="fixed left-6 top-1/2 z-30 hidden -translate-y-1/2 xl:block">
      <div aria-hidden="true" className="absolute bottom-0 left-0 top-0 w-px bg-ink/10">
        <div
          className="ai-gradient w-px transition-[height] duration-500"
          style={{ height: `${((activeIndex + 1) / sections.length) * 100}%` }}
        />
      </div>
      <ol className="space-y-3 pl-4">
        {sections.map((s, i) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              aria-current={s.id === active ? "location" : undefined}
              className={`group flex items-center gap-2 font-mono text-[0.7rem] transition-colors ${
                s.id === active ? "text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {String(i + 1).padStart(2, "0")}
              <span
                aria-hidden="true"
                className={`h-px transition-all duration-300 ${s.id === active ? "w-6 bg-ink" : "w-3 bg-muted/60"}`}
              />
              <span className="max-w-0 overflow-hidden whitespace-nowrap transition-[max-width] duration-300 group-hover:max-w-28 group-focus-visible:max-w-28">
                {s.label}
              </span>
              <span className="sr-only">{s.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
