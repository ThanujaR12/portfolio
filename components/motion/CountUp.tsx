"use client";

import { useEffect, useRef, useState } from "react";

const format = (n: number) => new Intl.NumberFormat("en-US").format(n);

// A number that counts up when it scrolls into view (spec 003). The server renders the final
// value, so it is correct without JavaScript; numbers already on screen at load don't animate.
export function CountUp({
  value,
  prefix = "",
  suffix = "",
  className = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    setShown(0);
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const duration = 1300;
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          setShown(Math.round(value * (1 - Math.pow(1 - t, 3))));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">
        {prefix}
        {format(value)}
        {suffix}
      </span>
      <span aria-hidden="true" className="tabular-nums">
        {prefix}
        {format(shown)}
        {suffix}
      </span>
    </span>
  );
}
