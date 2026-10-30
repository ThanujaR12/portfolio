"use client";

import { useCallback, useRef, useState } from "react";

export type Citation = { slug: string; title: string };
export type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  status?: "streaming" | "done" | "error";
};

const MAX_HISTORY = 10;

const FRIENDLY: Record<string, string> = {
  rate_limited:
    "You've asked a lot of questions in a short time, so the AI guide is taking a break. Please try again later, or use the Contact section.",
  ai_unavailable:
    "The AI guide is unavailable right now. The projects and Contact section on this page still work.",
  invalid_input: "Please ask a question of up to 1,000 characters.",
};

/** Sends the conversation to /api/chat and streams the answer into the last message. */
export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const nextId = useRef(0);

  const patchLast = (patch: (m: Message) => Partial<Message>) =>
    setMessages((all) => all.map((m, i) => (i === all.length - 1 ? { ...m, ...patch(m) } : m)));

  const ask = useCallback(
    async (question: string) => {
      const text = question.trim();
      if (!text || busy) return;
      setBusy(true);
      const user: Message = { id: nextId.current++, role: "user", content: text };
      const history = [...messages.filter((m) => m.status !== "error"), user]
        .slice(-MAX_HISTORY)
        .map(({ role, content }) => ({ role, content }));
      setMessages((all) => [
        ...all,
        user,
        { id: nextId.current++, role: "assistant", content: "", status: "streaming" },
      ]);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });
        if (!res.ok || !res.body) {
          const code = (await res.json().catch(() => null))?.error?.code ?? "ai_unavailable";
          patchLast(() => ({ content: FRIENDLY[code] ?? FRIENDLY.ai_unavailable, status: "error" }));
          return;
        }
        const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
        let buffer = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += value;
          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";
          for (const raw of events) {
            const event = raw.match(/^event: (\w+)/m)?.[1];
            const data = JSON.parse(raw.match(/^data: (.*)$/m)?.[1] ?? "{}");
            if (event === "token") patchLast((m) => ({ content: m.content + data.t }));
            if (event === "citations") patchLast(() => ({ citations: data.projects }));
            if (event === "error") {
              patchLast((m) => ({
                content: m.content || FRIENDLY.ai_unavailable,
                status: m.content ? "done" : "error",
              }));
            }
          }
        }
        patchLast((m) => (m.status === "streaming" ? { status: "done" } : {}));
      } catch {
        patchLast(() => ({ content: FRIENDLY.ai_unavailable, status: "error" }));
      } finally {
        setBusy(false);
      }
    },
    [busy, messages],
  );

  const reset = useCallback(() => setMessages([]), []);

  return { messages, busy, ask, reset };
}
