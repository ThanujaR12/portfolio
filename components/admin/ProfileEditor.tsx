"use client";

import { useState } from "react";
import { adminFetch, SESSION_EXPIRED } from "@/components/admin/api";
import type { Profile } from "@/lib/schemas";

type Status = { kind: "idle" | "saving" | "saved" | "error"; message?: string };

// "Label | Detail | Period" per line keeps the background list editable in one textarea.
const highlightsToText = (h: Profile["highlights"]) =>
  h.map((x) => [x.label, x.detail, x.period].filter(Boolean).join(" | ")).join("\n");
const textToHighlights = (t: string): Profile["highlights"] =>
  t
    .split("\n")
    .map((l) => l.split("|").map((s) => s.trim()))
    .filter(([label]) => label)
    .map(([label, detail = "", period]) => ({ label, detail, ...(period && { period }) }));

export function ProfileEditor({ initial, assetBase }: { initial: Profile; assetBase: string }) {
  const [profile, setProfile] = useState(initial);
  const [highlights, setHighlights] = useState(highlightsToText(initial.highlights));
  const [questions, setQuestions] = useState(initial.suggestedQuestions.join("\n"));
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [resumeStatus, setResumeStatus] = useState<Status>({ kind: "idle" });

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    setProfile((p) => ({ ...p, [key]: value }));
    setStatus({ kind: "idle" });
  };
  const fail = (status: number, message: string) => ({ kind: "error" as const, message: status === 401 ? SESSION_EXPIRED : message });

  const save = async () => {
    setStatus({ kind: "saving" });
    const res = await adminFetch<{ profile: Profile }>("/api/admin/profile", {
      method: "PATCH",
      body: JSON.stringify({
        name: profile.name,
        positioning: profile.positioning,
        bio: profile.bio,
        photo: profile.photo,
        currentFocus: profile.currentFocus,
        highlights: textToHighlights(highlights),
        links: { ...profile.links, linkedin: profile.links.linkedin || null },
        suggestedQuestions: questions.split("\n").map((q) => q.trim()).filter(Boolean),
      }),
    });
    if (res.ok) {
      setProfile(res.data.profile);
      setStatus({ kind: "saved", message: "Saved. The public site updates within a minute." });
    } else setStatus(fail(res.status, res.message));
  };

  const uploadPhoto = async (file: File | undefined) => {
    if (!file) return;
    const form = new FormData();
    form.set("file", file);
    form.set("kind", "photo");
    const res = await adminFetch<{ src: string }>("/api/admin/uploads", { method: "POST", body: form });
    if (res.ok) set("photo", res.data.src);
    else setStatus(fail(res.status, res.message));
  };

  const uploadResume = async (file: File | undefined) => {
    if (!file) return;
    setResumeStatus({ kind: "saving", message: "Uploading…" });
    const form = new FormData();
    form.set("file", file);
    const res = await adminFetch<{ resume: { updatedAt: string; hasText: boolean } }>("/api/admin/resume", {
      method: "POST",
      body: form,
    });
    if (res.ok) {
      setProfile((p) => ({ ...p, resume: { ...p.resume, updatedAt: res.data.resume.updatedAt } }));
      setResumeStatus({
        kind: "saved",
        message: res.data.resume.hasText
          ? "Resume replaced. The AI guide now knows its contents."
          : "Resume replaced, but no text could be read from it (is it a scanned image?).",
      });
    } else setResumeStatus(fail(res.status, res.message));
  };

  const field = "mt-1 w-full rounded-xl border border-line bg-white/[0.03] px-3 py-2 text-base text-ink focus:border-cyan/60 focus:outline-none sm:text-sm";
  const label = "block text-xs font-medium text-muted";

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <form
        className="glass space-y-4 rounded-2xl p-5"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <h2 className="font-display text-lg font-semibold">About you</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={label}>
            Name
            <input className={field} value={profile.name} maxLength={60} required onChange={(e) => set("name", e.target.value)} />
          </label>
          <label className={label}>
            Headline (hero) <span className="font-mono">({profile.positioning.length}/90)</span>
            <input className={field} value={profile.positioning} maxLength={90} required onChange={(e) => set("positioning", e.target.value)} />
          </label>
        </div>
        <label className={label}>
          Current focus
          <input className={field} value={profile.currentFocus} maxLength={140} onChange={(e) => set("currentFocus", e.target.value)} />
        </label>
        <label className={label}>
          Bio (Markdown) <span className="font-mono">({profile.bio.length}/1200)</span>
          <textarea className={`${field} min-h-36`} value={profile.bio} maxLength={1200} onChange={(e) => set("bio", e.target.value)} />
        </label>
        <label className={label}>
          Background, one per line: Label | Detail | Period
          <textarea className={`${field} min-h-24 font-mono`} value={highlights} onChange={(e) => setHighlights(e.target.value)} />
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className={label}>
            Email
            <input className={field} type="email" required value={profile.links.email} onChange={(e) => set("links", { ...profile.links, email: e.target.value })} />
          </label>
          <label className={label}>
            GitHub URL
            <input className={field} type="url" required value={profile.links.github} onChange={(e) => set("links", { ...profile.links, github: e.target.value })} />
          </label>
          <label className={label}>
            LinkedIn URL
            <input className={field} type="url" value={profile.links.linkedin ?? ""} placeholder="https://linkedin.com/in/…" onChange={(e) => set("links", { ...profile.links, linkedin: e.target.value })} />
          </label>
        </div>
        <label className={label}>
          Suggested AI questions (3–4, one per line)
          <textarea className={`${field} min-h-24`} value={questions} onChange={(e) => setQuestions(e.target.value)} />
        </label>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={status.kind === "saving"} className="rounded-xl bg-gradient-to-r from-cyan to-violet px-5 py-2 text-sm font-medium text-space disabled:opacity-50">
            {status.kind === "saving" ? "Saving…" : "Save profile"}
          </button>
          {status.message && (
            <p role={status.kind === "error" ? "alert" : "status"} className={`text-sm ${status.kind === "error" ? "text-amber-200" : "text-emerald-200"}`}>
              {status.message}
            </p>
          )}
        </div>
      </form>

      <div className="space-y-5">
        <section className="glass rounded-2xl p-5" aria-labelledby="photo-title">
          <h2 id="photo-title" className="font-display text-lg font-semibold">Photo</h2>
          <div className="mt-3 flex items-center gap-4">
            {profile.photo ? (
              // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail of a just-uploaded file
              <img src={`${assetBase}${profile.photo}`} alt="Current profile photo" className="size-20 rounded-2xl object-cover" />
            ) : (
              <div className="grid size-20 place-items-center rounded-2xl border border-dashed border-line text-xs text-muted">None</div>
            )}
            <div className="space-y-2 text-sm">
              <label className="inline-block cursor-pointer rounded-lg border border-line px-3 py-1.5 hover:border-cyan/50 focus-within:border-cyan">
                Upload photo
                <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => uploadPhoto(e.target.files?.[0])} />
              </label>
              {profile.photo && (
                <button type="button" onClick={() => set("photo", null)} className="block text-xs text-amber-300 hover:underline">
                  Remove photo
                </button>
              )}
              <p className="text-xs text-muted">Save the profile to publish photo changes.</p>
            </div>
          </div>
        </section>

        <section className="glass rounded-2xl p-5" aria-labelledby="resume-title">
          <h2 id="resume-title" className="font-display text-lg font-semibold">Resume (PDF)</h2>
          <p className="mt-1 text-sm text-muted">
            {profile.resume.updatedAt
              ? `Last replaced ${new Date(profile.resume.updatedAt).toLocaleDateString()}.`
              : "No resume uploaded yet."}
          </p>
          <label className="mt-3 inline-block cursor-pointer rounded-lg border border-line px-3 py-1.5 text-sm hover:border-cyan/50 focus-within:border-cyan">
            {resumeStatus.kind === "saving" ? "Uploading…" : "Upload new PDF"}
            <input type="file" accept="application/pdf" className="sr-only" disabled={resumeStatus.kind === "saving"} onChange={(e) => uploadResume(e.target.files?.[0])} />
          </label>
          {resumeStatus.message && resumeStatus.kind !== "saving" && (
            <p role={resumeStatus.kind === "error" ? "alert" : "status"} className={`mt-2 text-sm ${resumeStatus.kind === "error" ? "text-amber-200" : "text-emerald-200"}`}>
              {resumeStatus.message}
            </p>
          )}
          <p className="mt-2 text-xs text-muted">Up to 5 MB. Its text is used to answer questions in Ask AI.</p>
        </section>
      </div>
    </div>
  );
}
