"use client";

import { useEffect, useState } from "react";
import type { Profile } from "@/lib/schemas";

function useLocalTime(timeZone: string) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);
  if (!now) return null;
  return new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit" }).format(now);
}

export function CurrentlyCard({ openTo, location }: Pick<Profile, "openTo" | "location">) {
  const time = useLocalTime(location.timeZone);
  return (
    <aside aria-labelledby="currently-title" className="glass w-full rounded-3xl p-6 sm:p-7">
      <div className="flex items-center justify-between">
        <h2 id="currently-title" className="eyebrow text-muted">
          Currently
        </h2>
        <span className="eyebrow flex items-center gap-1.5 text-muted">
          <span aria-hidden="true" className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500/50" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-600" />
          </span>
          Live
        </span>
      </div>
      <div aria-hidden="true" className="mt-4 flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className="ai-gradient h-0.5 flex-1 rounded-full" style={{ opacity: 1 - i * 0.15 }} />
        ))}
      </div>
      <p className="eyebrow mt-7 text-accent">Open to</p>
      <p className="mt-2 font-display text-2xl font-semibold tracking-tight">{openTo.term}</p>
      <p className="mt-1.5 text-sm text-muted">{openTo.roles.join(" · ")}</p>
      <p className="eyebrow mt-7 text-muted">
        {location.city}
        {time && (
          <>
            {" · "}
            <time suppressHydrationWarning>{time}</time>
          </>
        )}
      </p>
      <a
        href="#contact"
        className="mt-4 flex h-11 w-full items-center justify-center rounded-full bg-ink text-sm font-medium text-white transition-colors hover:bg-ink/85"
      >
        Contact
      </a>
    </aside>
  );
}
