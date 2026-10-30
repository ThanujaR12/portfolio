import { CITATIONS_MARKER } from "@/lib/ai/prompt";

/**
 * Splits a streamed model reply into visible text and the trailing "CITATIONS: a, b" line.
 * `push` returns only text that can safely be shown now: anything that might be the start of
 * the marker is held back until it is ruled out.
 */
export class CitationStream {
  private buffer = "";
  private emitted = 0;
  private markerAt = -1;

  push(chunk: string): string {
    if (this.markerAt !== -1) {
      this.buffer += chunk;
      return "";
    }
    this.buffer += chunk;
    const found = this.buffer.toUpperCase().indexOf(CITATIONS_MARKER);
    if (found !== -1) {
      this.markerAt = found;
      return this.take(found);
    }
    return this.take(this.buffer.length - heldBack(this.buffer));
  }

  /** Remaining visible text plus the raw citation slugs (unvalidated). */
  finish(): { text: string; slugs: string[] } {
    if (this.markerAt === -1) return { text: this.take(this.buffer.length), slugs: [] };
    const raw = this.buffer.slice(this.markerAt + CITATIONS_MARKER.length);
    const slugs = raw
      .split(/[,\n]/)
      .map((s) => s.trim().toLowerCase().replace(/[^a-z0-9-]/g, ""))
      .filter((s) => s && s !== "none");
    return { text: "", slugs: [...new Set(slugs)] };
  }

  private take(end: number): string {
    if (end <= this.emitted) return "";
    const out = this.buffer.slice(this.emitted, end);
    this.emitted = end;
    return out;
  }
}

/** Length of the buffer's tail that could still grow into the marker. */
function heldBack(buffer: string): number {
  const upper = buffer.toUpperCase();
  for (let n = Math.min(CITATIONS_MARKER.length - 1, upper.length); n > 0; n--) {
    if (CITATIONS_MARKER.startsWith(upper.slice(-n))) return n;
  }
  return 0;
}

/** Keeps only slugs of published projects, mapped to their titles. */
export function validateCitations(slugs: string[], known: Map<string, string>) {
  return slugs.filter((s) => known.has(s)).map((slug) => ({ slug, title: known.get(slug)! }));
}
