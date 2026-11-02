"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { Screenshot } from "@/lib/schemas";

// Screenshot grid; clicking one opens it enlarged in a native <dialog> (focus trap + Esc built in).
export function Gallery({ screenshots }: { screenshots: Screenshot[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const current = screenshots[index];

  const show = (i: number) => {
    setIndex(i);
    dialogRef.current?.showModal();
  };
  const step = (delta: number) =>
    setIndex((i) => (i + delta + screenshots.length) % screenshots.length);

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2">
        {screenshots.map((s, i) => (
          <li key={s.src}>
            <button
              type="button"
              onClick={() => show(i)}
              className="group block w-full overflow-hidden rounded-2xl border border-line"
            >
              <Image
                src={s.src}
                alt={s.alt}
                width={s.width}
                height={s.height}
                sizes="(min-width: 640px) 50vw, 100vw"
                className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <span className="sr-only">Enlarge</span>
            </button>
          </li>
        ))}
      </ul>
      <dialog
        ref={dialogRef}
        aria-label="Screenshot viewer"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
        onClick={(e) => e.target === dialogRef.current && dialogRef.current?.close()}
        className="m-auto max-h-[92dvh] w-[min(1200px,94vw)] bg-transparent p-0 backdrop:bg-canvas/85 backdrop:backdrop-blur-sm"
      >
        {current && (
          <figure className="glass rounded-2xl p-3">
            <Image
              src={current.src}
              alt={current.alt}
              width={current.width}
              height={current.height}
              sizes="94vw"
              className="h-auto max-h-[78dvh] w-full rounded-xl object-contain"
            />
            <figcaption className="flex items-center justify-between gap-3 px-1 pt-3 text-sm text-muted">
              <span>{current.alt}</span>
              <span className="flex shrink-0 gap-2">
                {screenshots.length > 1 && (
                  <>
                    <button type="button" onClick={() => step(-1)} className="rounded-lg border border-line px-3 py-1 hover:text-ink">
                      ← <span className="sr-only">Previous</span>
                    </button>
                    <button type="button" onClick={() => step(1)} className="rounded-lg border border-line px-3 py-1 hover:text-ink">
                      → <span className="sr-only">Next</span>
                    </button>
                  </>
                )}
                <button type="button" onClick={() => dialogRef.current?.close()} className="rounded-lg border border-line px-3 py-1 hover:text-ink">
                  Close
                </button>
              </span>
            </figcaption>
          </figure>
        )}
      </dialog>
    </>
  );
}
