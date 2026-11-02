"use client";

import { useEffect, useRef, useState } from "react";
import { adminFetch, SESSION_EXPIRED } from "@/components/admin/api";
import { ProjectCard } from "@/components/site/ProjectCard";
import { toPortfolioProject } from "@/lib/content/merge";
import type { Project, Screenshot } from "@/lib/schemas";

type Draft = {
  slug: string;
  title: string;
  summary: string;
  problem: string;
  role: string;
  highlights: string;
  tags: string;
  demoUrl: string;
  year: string;
  screenshots: Screenshot[];
};

const toDraft = (p: Project): Draft => ({
  slug: p.slug,
  title: p.title ?? "",
  summary: p.summary ?? "",
  problem: p.problem ?? "",
  role: p.role ?? "",
  highlights: p.highlights.join("\n"),
  tags: p.tags.join(", "),
  demoUrl: p.demoUrl ?? "",
  year: p.year ? String(p.year) : "",
  screenshots: p.screenshots,
});

const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);
const list = (s: string) => s.split(",").map((l) => l.trim()).filter(Boolean);

function toPatch(d: Draft) {
  return {
    slug: d.slug.trim(),
    title: d.title.trim(),
    summary: d.summary.trim(),
    problem: d.problem.trim(),
    role: d.role.trim(),
    highlights: lines(d.highlights),
    tags: list(d.tags),
    demoUrl: d.demoUrl.trim() || null,
    ...(d.year.trim() && { year: Number(d.year) }),
    screenshots: d.screenshots,
  };
}

const storageKey = (id: number) => `portfolio-admin-draft-${id}`;

export function SideEditor({
  project,
  assetBase,
  onClose,
  onSaved,
}: {
  project: Project;
  assetBase: string;
  onClose: () => void;
  onSaved: (project: Project) => void;
}) {
  const [draft, setDraft] = useState<Draft>(() => {
    // An unsaved draft survives a session expiry or reload.
    try {
      const saved = sessionStorage.getItem(storageKey(project.id));
      if (saved) return JSON.parse(saved) as Draft;
    } catch {}
    return toDraft(project);
  });
  const [status, setStatus] = useState<{ kind: "idle" | "saving" | "saved" | "error"; message?: string }>({ kind: "idle" });
  const [uploading, setUploading] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dirty = JSON.stringify(toPatch(draft)) !== JSON.stringify(toPatch(toDraft(project)));

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  useEffect(() => {
    try {
      if (dirty) sessionStorage.setItem(storageKey(project.id), JSON.stringify(draft));
      else sessionStorage.removeItem(storageKey(project.id));
    } catch {}
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, draft, project.id]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setStatus({ kind: "idle" });
  };

  const close = () => {
    if (dirty && !confirm("Discard unsaved changes?")) return;
    try {
      sessionStorage.removeItem(storageKey(project.id));
    } catch {}
    onClose();
  };

  const save = async () => {
    setStatus({ kind: "saving" });
    const res = await adminFetch<{ project: Project }>(`/api/admin/projects/${project.id}`, {
      method: "PATCH",
      body: JSON.stringify(toPatch(draft)),
    });
    if (res.ok) {
      onSaved(res.data.project);
      setDraft(toDraft(res.data.project));
      setStatus({ kind: "saved", message: "Saved. The public site updates within a minute." });
    } else {
      setStatus({ kind: "error", message: res.status === 401 ? SESSION_EXPIRED : res.message });
    }
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    const added: Screenshot[] = [];
    for (const file of Array.from(files).slice(0, 8 - draft.screenshots.length)) {
      const form = new FormData();
      form.set("file", file);
      form.set("kind", "screenshot");
      const res = await adminFetch<{ src: string; width: number; height: number }>("/api/admin/uploads", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        setStatus({ kind: "error", message: `${file.name}: ${res.status === 401 ? SESSION_EXPIRED : res.message}` });
        break;
      }
      added.push({ ...res.data, alt: `${draft.title || project.repoName} screenshot` });
    }
    setUploading(false);
    if (added.length) set("screenshots", [...draft.screenshots, ...added]);
  };

  const moveShot = (i: number, delta: number) => {
    const next = [...draft.screenshots];
    const [s] = next.splice(i, 1);
    next.splice(i + delta, 0, s);
    set("screenshots", next);
  };

  // Live preview of the public card, built exactly like the public site builds it.
  const preview = (() => {
    const patch = toPatch(draft);
    const merged: Project = {
      ...project,
      ...patch,
      title: patch.title || undefined,
      summary: patch.summary || undefined,
      problem: patch.problem || undefined,
      role: patch.role || undefined,
      highlights: patch.highlights.filter((h) => h.length <= 140),
      tags: patch.tags,
      screenshots: draft.screenshots.map((s) => ({ ...s, src: `${assetBase}${s.src}` })),
    };
    return toPortfolioProject(merged);
  })();

  const field = "w-full rounded-xl border border-line bg-ink/[0.03] px-3 py-2 text-base text-ink placeholder:text-muted focus:border-accent/60 focus:outline-none sm:text-sm";
  const label = "block text-xs font-medium text-muted";

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="editor-title"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      className="m-0 ml-auto h-dvh max-h-dvh w-full max-w-3xl border-l border-line bg-surface p-0 text-ink backdrop:bg-canvas/70 backdrop:backdrop-blur-sm"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 id="editor-title" className="truncate font-display text-xl font-semibold">
              Edit {preview.title}
            </h2>
            <p className="font-mono text-xs text-muted">
              {project.repoName} · {project.status}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={close} className="rounded-lg border border-line px-3 py-1.5 text-sm text-muted hover:text-ink">
              Close
            </button>
            <button
              type="button"
              onClick={save}
              disabled={!dirty || status.kind === "saving" || uploading}
              className="rounded-lg bg-gradient-to-r from-accent to-ai px-4 py-1.5 text-sm font-medium text-canvas disabled:opacity-40"
            >
              {status.kind === "saving" ? "Saving…" : "Save"}
            </button>
          </div>
        </header>
        {status.message && (
          <p
            role={status.kind === "error" ? "alert" : "status"}
            className={`mx-5 mt-3 rounded-xl px-4 py-2 text-sm ${
              status.kind === "error" ? "border border-amber-400/30 bg-amber-400/10" : "bg-emerald-400/10 text-emerald-800"
            }`}
          >
            {status.message}
          </p>
        )}

        <div className="grid flex-1 gap-6 overflow-y-auto p-5 md:grid-cols-[minmax(0,1fr)_260px]">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={label}>
                Display title
                <input className={`${field} mt-1`} value={draft.title} maxLength={60} placeholder={preview.title} onChange={(e) => set("title", e.target.value)} />
              </label>
              <label className={label}>
                Your role
                <input className={`${field} mt-1`} value={draft.role} maxLength={80} placeholder="e.g. Solo full-stack developer" onChange={(e) => set("role", e.target.value)} />
              </label>
            </div>
            <label className={label}>
              One-line summary <span className="font-mono">({draft.summary.length}/160)</span>
              <input className={`${field} mt-1`} value={draft.summary} maxLength={160} placeholder={project.github.description ?? ""} onChange={(e) => set("summary", e.target.value)} />
            </label>
            <label className={label}>
              The problem (Markdown) <span className="font-mono">({draft.problem.length}/1200)</span>
              <textarea className={`${field} mt-1 min-h-28`} value={draft.problem} maxLength={1200} onChange={(e) => set("problem", e.target.value)} />
            </label>
            <label className={label}>
              Highlights (one per line, up to 6)
              <textarea className={`${field} mt-1 min-h-28`} value={draft.highlights} onChange={(e) => set("highlights", e.target.value)} />
            </label>
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_110px]">
              <label className={label}>
                Technology tags (comma separated)
                <input className={`${field} mt-1`} value={draft.tags} placeholder="React, Node.js, MongoDB" onChange={(e) => set("tags", e.target.value)} />
              </label>
              <label className={label}>
                Year
                <input className={`${field} mt-1`} value={draft.year} inputMode="numeric" maxLength={4} onChange={(e) => set("year", e.target.value.replace(/\D/g, ""))} />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={label}>
                Live demo URL (https)
                <input className={`${field} mt-1`} type="url" value={draft.demoUrl} placeholder={project.github.homepage ?? "https://"} onChange={(e) => set("demoUrl", e.target.value)} />
              </label>
              <label className={label}>
                Page URL: /projects/…
                <input
                  className={`${field} mt-1 disabled:opacity-50`}
                  value={draft.slug}
                  disabled={project.status === "published"}
                  title={project.status === "published" ? "Hide the project to change its URL" : undefined}
                  onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                />
              </label>
            </div>

            <fieldset className="rounded-2xl border border-line p-4">
              <legend className="px-1 text-xs font-medium text-muted">Screenshots ({draft.screenshots.length}/8)</legend>
              <ul className="space-y-3">
                {draft.screenshots.map((s, i) => (
                  <li key={s.src} className="flex gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail of a just-uploaded file */}
                    <img src={`${assetBase}${s.src}`} alt="" className="h-16 w-24 shrink-0 rounded-lg border border-line object-cover" />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <label className="sr-only" htmlFor={`alt-${i}`}>Alt text for screenshot {i + 1}</label>
                      <input
                        id={`alt-${i}`}
                        className={field}
                        value={s.alt}
                        maxLength={140}
                        placeholder="Describe the screenshot"
                        onChange={(e) => set("screenshots", draft.screenshots.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))}
                      />
                      <div className="flex flex-wrap gap-2 text-xs">
                        <label className="flex items-center gap-1.5">
                          <input
                            type="radio"
                            name="cover"
                            checked={preview.cover?.src.endsWith(s.src) ?? false}
                            onChange={() => set("screenshots", draft.screenshots.map((x, j) => ({ ...x, cover: j === i || undefined })))}
                          />
                          Cover
                        </label>
                        <button type="button" disabled={i === 0} onClick={() => moveShot(i, -1)} className="text-muted hover:text-ink disabled:opacity-30">
                          ↑ <span className="sr-only">Move up</span>
                        </button>
                        <button type="button" disabled={i === draft.screenshots.length - 1} onClick={() => moveShot(i, 1)} className="text-muted hover:text-ink disabled:opacity-30">
                          ↓ <span className="sr-only">Move down</span>
                        </button>
                        <button type="button" onClick={() => set("screenshots", draft.screenshots.filter((_, j) => j !== i))} className="text-amber-700 hover:underline">
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {draft.screenshots.length < 8 && (
                <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-line px-3 py-2 text-sm hover:border-accent/50 focus-within:border-accent">
                  {uploading ? "Uploading…" : "+ Add screenshots"}
                  <input type="file" accept="image/png,image/jpeg,image/webp" multiple className="sr-only" disabled={uploading} onChange={(e) => upload(e.target.files)} />
                </label>
              )}
              <p className="mt-2 text-xs text-muted">PNG, JPEG or WebP up to 2 MB. Converted to WebP automatically.</p>
            </fieldset>
          </div>

          <aside aria-label="Live preview" className="space-y-2">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">Live preview</p>
            <div className="pointer-events-none" inert>
              <ProjectCard project={preview} />
            </div>
            <p className="text-xs text-muted">Empty fields fall back to GitHub data.</p>
          </aside>
        </div>
      </div>
    </dialog>
  );
}
