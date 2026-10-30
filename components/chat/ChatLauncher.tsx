"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { OPEN_CHAT_EVENT, openChat, type OpenChatDetail } from "@/components/chat/events";
import { useChat, type Message } from "@/components/chat/useChat";

// Floating Ask AI button + side panel (bottom sheet on phones). FR-013 – FR-017.
export function ChatLauncher({ name, suggestions }: { name: string; suggestions: string[] }) {
  const first = name.split(" ")[0];
  const [open, setOpen] = useState(false);
  // The hero has its own Ask box, so the floating button appears once it scrolls away.
  const [pastHero, setPastHero] = useState(false);
  const [draft, setDraft] = useState("");
  const { messages, busy, ask, reset } = useChat();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const pending = useRef<string | undefined>(undefined);
  const isAdmin = usePathname().startsWith("/admin");

  const close = useCallback(() => {
    setOpen(false);
    returnFocus.current?.focus();
  }, []);

  useEffect(() => {
    const onOpen = (e: Event) => {
      returnFocus.current = document.activeElement as HTMLElement | null;
      pending.current = (e as CustomEvent<OpenChatDetail>).detail?.question;
      setOpen(true);
    };
    window.addEventListener(OPEN_CHAT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, onOpen);
  }, []);

  // Ask the question the panel was opened with (hero box, suggestion chips).
  useEffect(() => {
    if (!open) return;
    if (pending.current) {
      const question = pending.current;
      pending.current = undefined;
      ask(question);
    }
    inputRef.current?.focus();
  }, [open, ask]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages]);

  if (isAdmin) return null;

  const submit = () => {
    if (!draft.trim() || busy) return;
    ask(draft);
    setDraft("");
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => openChat()}
          tabIndex={pastHero ? 0 : -1}
          aria-hidden={!pastHero}
          className={`fixed bottom-5 right-5 z-40 transition-[opacity,transform] duration-300 ${
            pastHero ? "opacity-100" : "pointer-events-none translate-y-4 opacity-0"
          }`}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan to-violet px-5 py-3 text-sm font-medium text-space shadow-[0_10px_40px_-8px_rgb(139_92_246/0.8)] transition-transform hover:scale-105">
            <ChatIcon />
            Ask AI
          </span>
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="false"
          aria-labelledby="chat-title"
          className="fixed inset-x-2 bottom-2 z-50 flex max-h-[85dvh] flex-col overflow-hidden rounded-3xl border border-line bg-space-2/95 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.9),0_0_60px_-20px_rgb(139_92_246/0.5)] backdrop-blur-xl sm:inset-x-auto sm:bottom-4 sm:right-4 sm:top-4 sm:max-h-none sm:w-[420px]"
        >
          <header className="flex items-start justify-between gap-4 border-b border-line p-5">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-cyan to-violet text-space"
              >
                <ChatIcon />
              </span>
              <div>
                <h2 id="chat-title" className="font-display text-lg font-semibold leading-tight">
                  Ask AI
                </h2>
                <p className="text-xs text-muted">
                  An AI guide · answers only from {first}&apos;s portfolio
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={reset}
                  disabled={busy}
                  className="rounded-lg px-2 py-1 text-xs text-muted hover:text-ink disabled:opacity-40"
                >
                  Clear
                </button>
              )}
              <button type="button" onClick={close} className="rounded-lg p-1 text-muted hover:text-ink">
                <span className="sr-only">Close Ask AI</span>
                <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          </header>

          <div
            ref={logRef}
            role="log"
            aria-live="polite"
            aria-busy={busy}
            aria-label="Conversation"
            className="flex-1 space-y-4 overflow-y-auto p-5"
          >
            {messages.length === 0 ? (
              <div>
                <p className="text-sm text-ink/90">
                  Hi! I can answer questions about {first}&apos;s projects, skills and experience. Try
                  one of these:
                </p>
                <ul className="mt-4 space-y-2">
                  {suggestions.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        onClick={() => ask(s)}
                        className="w-full rounded-xl border border-line bg-white/[0.03] px-4 py-2.5 text-left text-sm transition-colors hover:border-cyan/50"
                      >
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              messages.map((m) => <Bubble key={m.id} message={m} />)
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="border-t border-line p-3"
          >
            <div className="flex items-end gap-2 rounded-2xl border border-line bg-white/[0.03] p-1.5 focus-within:border-cyan/50">
              <label htmlFor="chat-input" className="sr-only">
                Your question
              </label>
              <textarea
                id="chat-input"
                ref={inputRef}
                rows={1}
                value={draft}
                maxLength={1000}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                placeholder={`Ask about ${first}'s work…`}
                className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-base text-ink placeholder:text-muted focus:outline-none sm:text-sm"
              />
              <button
                type="submit"
                disabled={busy || !draft.trim()}
                className="rounded-xl bg-gradient-to-r from-cyan to-violet px-4 py-2 text-sm font-medium text-space disabled:opacity-40"
              >
                Send
              </button>
            </div>
            <p className="mt-2 px-1 text-[0.7rem] text-muted">
              AI can make mistakes. Check the project pages for details.
            </p>
          </form>
        </div>
      )}
    </>
  );
}

function Bubble({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <div className="ml-10 rounded-2xl rounded-br-sm bg-cyan/15 px-4 py-2.5 text-sm">
        <span className="sr-only">You: </span>
        {message.content}
      </div>
    );
  }
  return (
    <div className="mr-4">
      <div
        className={`rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed ${
          message.status === "error" ? "border border-amber-400/30 bg-amber-400/10" : "bg-white/5"
        }`}
      >
        <span className="sr-only">AI guide: </span>
        {message.content ? (
          <div className="space-y-2 [&_li]:ml-4 [&_li]:list-disc [&_strong]:text-ink">
            {/* Plain formatting only: no links or images from model output. */}
            <ReactMarkdown
              allowedElements={["p", "strong", "em", "ul", "ol", "li", "code", "br"]}
              unwrapDisallowed
            >
              {message.content}
            </ReactMarkdown>
          </div>
        ) : (
          <span className="inline-flex gap-1" role="status" aria-label="Thinking">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="size-1.5 animate-pulse rounded-full bg-cyan"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </span>
        )}
        {message.status === "error" && (
          <Link href="/#contact" className="mt-2 inline-block text-cyan underline">
            Go to Contact
          </Link>
        )}
      </div>
      {message.citations && message.citations.length > 0 && (
        <div className="mt-2">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted">Sources</p>
          <ul className="mt-1.5 flex flex-wrap gap-2">
            {message.citations.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/projects/${c.slug}`}
                  className="inline-flex items-center gap-1 rounded-full border border-cyan/40 bg-cyan/10 px-3 py-1 text-xs transition-colors hover:bg-cyan/20"
                >
                  {c.title} <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ChatIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
    </svg>
  );
}
