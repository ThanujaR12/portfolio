"use client";

import { useEffect, useRef, useState } from "react";

// Direct contact channels: giant "channel" rows. On hover the word fills with the AI gradient,
// a light sweep crosses the row, the signal wave speeds up, a spotlight follows the cursor and
// the address decodes itself. Reduced motion keeps the colour change and drops the movement.

export type Channel = { label: string; value: string; href: string; external?: boolean; copy?: boolean };

const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&*+=<>";
const KEEP = new Set([" ", "@", ".", "/", "-", "_"]);

function useDecode(value: string) {
  const [text, setText] = useState(value);
  const frame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  const run = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    cancelAnimationFrame(frame.current);
    const total = 22;
    let step = 0;
    const tick = () => {
      const settled = (step / total) * value.length;
      setText(
        [...value]
          .map((ch, i) => (i < settled || KEEP.has(ch) ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join(""),
      );
      if (step++ < total) frame.current = requestAnimationFrame(tick);
    };
    tick();
  };
  return [text, run] as const;
}

function Wave() {
  return (
    <span aria-hidden="true" className="channel-wave">
      <svg viewBox="0 0 120 16" width="120" height="16" fill="none">
        <path d="M0 8 Q7.5 1 15 8 T30 8 T45 8 T60 8 T75 8 T90 8 T105 8 T120 8" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </span>
  );
}

function ChannelRow({ channel, index }: { channel: Channel; index: number }) {
  const [text, decode] = useDecode(channel.value);
  const [copied, setCopied] = useState(false);
  const reset = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(reset.current), []);

  const track = (e: React.PointerEvent<HTMLLIElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(channel.value);
      setCopied(true);
      clearTimeout(reset.current);
      reset.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = channel.href;
    }
  };

  return (
    <li className="channel" onPointerMove={track} onPointerEnter={decode} onFocus={decode}>
      <a
        href={channel.href}
        {...(channel.external && { target: "_blank", rel: "noopener noreferrer" })}
        className="channel-link"
      >
        <span className="channel-index">CH {String(index + 1).padStart(2, "0")}</span>
        <span className="min-w-0">
          <span className="flex items-center gap-6">
            <span className="channel-word">{channel.label}</span>
            <Wave />
          </span>
          <span aria-hidden="true" className="mt-2 block truncate font-mono text-sm text-muted md:hidden">
            {channel.value}
          </span>
        </span>
        <span aria-hidden="true" className="channel-value">
          {text}
        </span>
        <span className="sr-only">: {channel.value}</span>
        {!channel.copy && (
          <span aria-hidden="true" className="channel-btn">
            <Arrow />
          </span>
        )}
      </a>
      {channel.copy && (
        <button type="button" onClick={copy} className="channel-btn" data-copied={copied || undefined} aria-label="Copy email address">
          {copied ? <Check /> : <CopyIcon />}
        </button>
      )}
      {channel.copy && (
        <span role="status" className="channel-toast" data-show={copied || undefined}>
          {copied ? "Copied to clipboard" : ""}
        </span>
      )}
    </li>
  );
}

const Arrow = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const CopyIcon = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <rect x="5.5" y="5.5" width="8" height="8" rx="1.8" />
    <path d="M10.5 3.5v-.2A1.8 1.8 0 0 0 8.7 1.5H3.3A1.8 1.8 0 0 0 1.5 3.3v5.4a1.8 1.8 0 0 0 1.8 1.8h.2" />
  </svg>
);
const Check = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="m3.5 8.5 3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function ContactChannels({ channels }: { channels: Channel[] }) {
  return (
    <ol aria-label="Contact channels" className="channels">
      {channels.map((c, i) => (
        <ChannelRow key={c.label} channel={c} index={i} />
      ))}
    </ol>
  );
}
