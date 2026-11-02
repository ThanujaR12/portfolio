"use client";

import { useEffect, useRef, useState } from "react";

type Fields = { name: string; email: string; message: string };
type FieldErrors = Partial<Record<keyof Fields, string>>;
type State = { kind: "idle" | "sending" | "sent" | "error"; message?: string };

const EMPTY: Fields = { name: "", email: "", message: "" };

export function ContactForm({ fallbackEmail }: { fallbackEmail: string }) {
  const [fields, setFields] = useState(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [state, setState] = useState<State>({ kind: "idle" });
  const startedAt = useRef(0);
  const honeypot = useRef<HTMLInputElement>(null);
  const firstInvalid = useRef<Record<keyof Fields, HTMLElement | null>>({ name: null, email: null, message: null });

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const set = (key: keyof Fields, value: string) => {
    setFields((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, website: honeypot.current?.value ?? "", startedAt: startedAt.current }),
      });
      if (res.ok) {
        setFields(EMPTY);
        setState({ kind: "sent" });
        return;
      }
      const body = await res.json().catch(() => null);
      const fieldErrors: FieldErrors = body?.error?.fields ?? {};
      setErrors(fieldErrors);
      setState({ kind: "error", message: body?.error?.message ?? "Something went wrong." });
      const first = (["name", "email", "message"] as const).find((k) => fieldErrors[k]);
      if (first) firstInvalid.current[first]?.focus();
    } catch {
      setState({ kind: "error", message: "Network error. Check your connection and try again." });
    }
  };

  if (state.kind === "sent") {
    return (
      <div role="status" className="glass flex h-full flex-col items-start justify-center gap-3 rounded-3xl p-8">
        <span aria-hidden="true" className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-accent to-ai text-xl text-canvas">
          ✓
        </span>
        <p className="font-display text-2xl font-semibold">Message sent</p>
        <p className="text-muted">Thanks for reaching out. You&apos;ll get a reply by email.</p>
        <button type="button" onClick={() => setState({ kind: "idle" })} className="text-sm text-accent underline">
          Send another message
        </button>
      </div>
    );
  }

  const input =
    "mt-1.5 w-full rounded-xl border bg-ink/[0.03] px-4 py-3 text-base text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40";
  const border = (k: keyof Fields) => (errors[k] ? "border-amber-400/60" : "border-line focus:border-accent/60");

  return (
    <form onSubmit={submit} noValidate aria-labelledby="contact-form-title" className="glass space-y-4 rounded-3xl p-6 sm:p-8">
      <h3 id="contact-form-title" className="font-display text-xl font-semibold">
        Send a message
      </h3>
      {(["name", "email"] as const).map((key) => (
        <div key={key}>
          <label htmlFor={`contact-${key}`} className="text-sm font-medium">
            {key === "name" ? "Your name" : "Your email"}
          </label>
          <input
            id={`contact-${key}`}
            ref={(el) => {
              firstInvalid.current[key] = el;
            }}
            type={key === "email" ? "email" : "text"}
            autoComplete={key}
            required
            maxLength={key === "name" ? 80 : 200}
            value={fields[key]}
            onChange={(e) => set(key, e.target.value)}
            aria-invalid={Boolean(errors[key])}
            aria-describedby={errors[key] ? `contact-${key}-error` : undefined}
            className={`${input} ${border(key)}`}
          />
          {errors[key] && (
            <p id={`contact-${key}-error`} className="mt-1.5 text-sm text-amber-800">
              {errors[key]}
            </p>
          )}
        </div>
      ))}
      <div>
        <label htmlFor="contact-message" className="text-sm font-medium">
          Message
        </label>
        <textarea
          id="contact-message"
          ref={(el) => {
            firstInvalid.current.message = el;
          }}
          required
          rows={5}
          maxLength={2000}
          value={fields.message}
          onChange={(e) => set("message", e.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={`contact-message-hint${errors.message ? " contact-message-error" : ""}`}
          placeholder="An opportunity, a question about a project, or just hello…"
          className={`${input} ${border("message")} resize-y`}
        />
        <p id="contact-message-hint" className="mt-1 text-right font-mono text-xs text-muted">
          {fields.message.length}/2000
        </p>
        {errors.message && (
          <p id="contact-message-error" className="text-sm text-amber-800">
            {errors.message}
          </p>
        )}
      </div>
      {/* Honeypot: hidden from people and assistive tech; bots tend to fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 overflow-hidden">
        <label>
          Website
          <input ref={honeypot} name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {state.kind === "error" && (
        <p role="alert" className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm">
          {state.message}{" "}
          {!Object.keys(errors).length && (
            <a href={`mailto:${fallbackEmail}`} className="text-accent underline">
              Email {fallbackEmail}
            </a>
          )}
        </p>
      )}
      <button
        type="submit"
        disabled={state.kind === "sending"}
        className="w-full rounded-xl bg-gradient-to-r from-accent to-ai px-5 py-3 text-sm font-medium text-canvas disabled:opacity-60 sm:w-auto"
      >
        {state.kind === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
