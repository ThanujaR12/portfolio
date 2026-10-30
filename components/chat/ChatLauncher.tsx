"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { OPEN_CHAT_EVENT, openChat, type OpenChatDetail } from "@/components/chat/events";

// Floating Ask AI button + side panel. The streaming assistant is wired in with US3; until
// then the panel explains that and points visitors to Contact.
export function ChatLauncher() {
  const [open, setOpen] = useState(false);
  // The hero has its own Ask box, so the floating button appears once it scrolls away.
  const [pastHero, setPastHero] = useState(false);
  const [question, setQuestion] = useState<string | undefined>();
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    returnFocus.current?.focus();
  }, []);

  useEffect(() => {
    const onOpen = (e: Event) => {
      returnFocus.current = document.activeElement as HTMLElement | null;
      setQuestion((e as CustomEvent<OpenChatDetail>).detail?.question);
      setOpen(true);
    };
    window.addEventListener(OPEN_CHAT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, onOpen);
  }, []);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

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
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
            </svg>
            Ask AI
          </span>
        </button>
      )}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-labelledby="chat-title"
          tabIndex={-1}
          className="glass fixed inset-x-3 bottom-3 z-50 flex max-h-[80dvh] flex-col rounded-3xl bg-space-2/80 p-5 focus:outline-none sm:inset-x-auto sm:right-5 sm:w-[400px]"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p id="chat-title" className="font-display text-lg font-semibold">Ask AI</p>
              <p className="font-mono text-xs text-muted">An AI guide to Thanuja&apos;s work</p>
            </div>
            <button type="button" onClick={close} className="rounded-lg p-1 text-muted hover:text-ink">
              <span className="sr-only">Close</span>
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          {question && (
            <p className="mt-4 self-end rounded-2xl rounded-br-sm bg-cyan/15 px-4 py-2 text-sm">{question}</p>
          )}
          <p className="mt-4 rounded-2xl rounded-bl-sm bg-white/5 px-4 py-3 text-sm text-ink/90">
            The AI guide is being connected and will be able to answer soon. Meanwhile, the{" "}
            <Link href="/#contact" onClick={close} className="text-cyan underline">
              contact section
            </Link>{" "}
            reaches Thanuja directly.
          </p>
        </div>
      )}
    </>
  );
}
