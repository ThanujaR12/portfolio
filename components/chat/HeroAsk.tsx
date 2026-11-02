"use client";

import { useState } from "react";
import { openChat, signalAiActivity } from "@/components/chat/events";

export function HeroAsk({ suggestions }: { suggestions: string[] }) {
  const [question, setQuestion] = useState("");

  const ask = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    openChat(trimmed);
    setQuestion("");
  };

  return (
    <div className="w-full max-w-xl">
      <form
        role="search"
        aria-label="Ask the AI guide about Thanuja's work"
        onSubmit={(e) => {
          e.preventDefault();
          ask(question);
        }}
        className="flex items-center gap-2 rounded-full border border-line bg-surface p-1.5 pl-5 shadow-[0_10px_40px_-18px_rgb(43_95_224/0.45)] transition-shadow focus-within:ring-2 focus-within:ring-accent/40"
      >
        <span aria-hidden="true" className="text-gradient text-base font-semibold">
          ✦
        </span>
        <label htmlFor="hero-ask" className="sr-only">
          Ask about Thanuja&apos;s work
        </label>
        <input
          id="hero-ask"
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value);
            signalAiActivity();
          }}
          maxLength={1000}
          placeholder="Ask my AI guide anything about my work…"
          className="min-w-0 flex-1 bg-transparent py-2 text-base text-ink placeholder:text-muted focus:outline-none"
        />
        <button
          type="submit"
          className="ai-gradient shrink-0 rounded-full px-5 py-2 text-sm font-medium text-white"
        >
          Ask
        </button>
      </form>
      <ul className="mt-3 flex flex-wrap gap-2" aria-label="Suggested questions">
        {suggestions.slice(0, 3).map((s) => (
          <li key={s}>
            <button
              type="button"
              onClick={() => ask(s)}
              className="rounded-full border border-line bg-surface/70 px-3 py-1 text-xs text-muted transition-colors hover:border-accent/40 hover:text-ink"
            >
              {s}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
