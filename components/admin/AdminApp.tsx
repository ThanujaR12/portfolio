"use client";

import { useState } from "react";
import { Board } from "@/components/admin/Board";
import { ProfileEditor } from "@/components/admin/ProfileEditor";
import { SyncBar } from "@/components/admin/SyncBar";
import type { Profile, Project, SyncRun } from "@/lib/schemas";

const TABS = [
  { id: "projects", label: "Projects" },
  { id: "profile", label: "Profile & resume" },
] as const;

export function AdminApp({
  initialProjects,
  initialProfile,
  lastRun,
  assetBase,
}: {
  initialProjects: Project[];
  initialProfile: Profile;
  lastRun: SyncRun | null;
  assetBase: string;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("projects");
  const [projects, setProjects] = useState(initialProjects);

  return (
    <div>
      <div role="tablist" aria-label="Admin sections" className="mb-5 inline-flex gap-1 rounded-xl border border-line p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-1.5 text-sm transition-colors ${
              tab === t.id ? "bg-white/10 text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id="panel-projects" aria-labelledby="tab-projects" hidden={tab !== "projects"}>
        <SyncBar lastRun={lastRun} projects={projects} onSynced={setProjects} />
        <Board projects={projects} onChange={setProjects} assetBase={assetBase} />
      </div>
      <div role="tabpanel" id="panel-profile" aria-labelledby="tab-profile" hidden={tab !== "profile"}>
        <ProfileEditor initial={initialProfile} assetBase={assetBase} />
      </div>
    </div>
  );
}
