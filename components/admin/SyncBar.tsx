"use client";

import { useState } from "react";
import { adminFetch } from "@/components/admin/api";
import type { Project, SyncRun } from "@/lib/schemas";

const when = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" });

export function SyncBar({
  lastRun,
  projects,
  onSynced,
}: {
  lastRun: SyncRun | null;
  projects: Project[];
  onSynced: (projects: Project[]) => void;
}) {
  const [run, setRun] = useState(lastRun);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const sync = async () => {
    setBusy(true);
    setNote(null);
    const res = await adminFetch<SyncRun>("/api/admin/sync", { method: "POST" });
    if (res.ok) {
      const r = res.data;
      setRun(r);
      const parts = [
        r.added.length && `${r.added.length} new`,
        r.updated.length && `${r.updated.length} updated`,
        r.removed.length && `${r.removed.length} removed`,
      ].filter(Boolean);
      setNote(parts.length ? `Synced: ${parts.join(", ")}.` : "Already up to date.");
      const list = await adminFetch<{ projects: Project[] }>("/api/admin/projects", { method: "GET" });
      if (list.ok) onSynced(list.data.projects);
    } else if (res.status === 401) {
      setNote("Your session expired. Reload the page to sign in again.");
    } else {
      setNote("Sync failed. GitHub may be unreachable; the site keeps its last data.");
    }
    setBusy(false);
  };

  const needsContent = projects.filter((p) => p.flags.includes("needs-content")).length;
  const removed = projects.filter((p) => p.flags.includes("removed-from-github")).length;
  const pending = projects.filter((p) => p.status === "pending").length;

  return (
    <div className="glass mb-5 flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm">
        <p>
          {run ? (
            <>
              Last sync {when.format(new Date(run.at))}{" "}
              {run.ok ? (
                <span className="text-emerald-300">✓</span>
              ) : (
                <span className="text-amber-300">failed: {run.error}</span>
              )}
            </>
          ) : (
            <span className="text-muted">Not synced from GitHub yet.</span>
          )}
        </p>
        <p className="mt-1 flex flex-wrap gap-3 font-mono text-xs text-muted">
          {pending > 0 && <span className="text-cyan">{pending} pending review</span>}
          {needsContent > 0 && <span>{needsContent} need content</span>}
          {removed > 0 && <span className="text-amber-300">{removed} removed from GitHub</span>}
        </p>
        <p role="status" className="mt-1 text-xs text-ink/80">
          {note}
        </p>
      </div>
      <button
        type="button"
        onClick={sync}
        disabled={busy}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan to-violet px-4 py-2 text-sm font-medium text-space disabled:opacity-60"
      >
        <span aria-hidden="true" className={busy ? "animate-spin" : ""}>
          ⟳
        </span>
        {busy ? "Syncing…" : "Sync now"}
      </button>
    </div>
  );
}
