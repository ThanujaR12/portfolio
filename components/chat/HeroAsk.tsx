"use client";

import { useState } from "react";
import { openChat } from "@/components/chat/events";

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
        className="glass glow-hover flex items-center gap-2 rounded-2xl p-1.5 pl-4 focus-within:ring-2 focus-within:ring-cyan/60 hover:transform-none"
      >
        <span aria-hidden="true" className="font-mono text-sm text-cyan">
          &gt;_
        </span>
        <label htmlFor="hero-ask" className="sr-only">
          Ask about Thanuja&apos;s work
        </label>
        <input
          id="hero-ask"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={1000}
          placeholder="Ask anything about my work…"
          className="min-w-0 flex-1 bg-transparent py-2 text-base text-ink placeholder:text-muted focus:outline-none"
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-gradient-to-r from-cyan to-violet px-4 py-2 text-sm font-medium text-space"
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
              className="rounded-full border border-line px-3 py-1 text-xs text-muted transition-colors hover:border-cyan/50 hover:text-ink"
            >
              {s}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
