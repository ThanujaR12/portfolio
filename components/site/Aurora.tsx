"use client";

import { useEffect, useRef } from "react";
import { AI_ACTIVITY_EVENT } from "@/components/chat/events";

// Signature AI aurora: soft drifting tints that brighten while a visitor types into Ask AI.
export function Aurora() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onActivity = () => {
      ref.current?.style.setProperty("--aurora-energy", "1");
      clearTimeout(timer);
      timer = setTimeout(() => ref.current?.style.setProperty("--aurora-energy", "0"), 1400);
    };
    window.addEventListener(AI_ACTIVITY_EVENT, onActivity);
    return () => {
      window.removeEventListener(AI_ACTIVITY_EVENT, onActivity);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden="true" className="aurora">
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}
