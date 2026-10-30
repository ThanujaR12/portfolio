import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { z } from "zod";
import { profileSchema, projectsFileSchema, syncLogFileSchema } from "@/lib/schemas";

// Reads curated content. CONTENT_SOURCE=fs reads content/ from disk (dev, tests, and the
// deployed copy); "github" reads the live file from the content repo so admin edits show
// without a redeploy. Writes arrive with the admin feature (US4).

export const CONTENT_TAG = "content";

const files = {
  projects: { name: "projects.json", schema: projectsFileSchema },
  profile: { name: "profile.json", schema: profileSchema },
  syncLog: { name: "sync-log.json", schema: syncLogFileSchema },
} as const;

type FileKey = keyof typeof files;
type FileData<K extends FileKey> = z.infer<(typeof files)[K]["schema"]>;

async function readRaw(name: string): Promise<string> {
  const repo = process.env.GITHUB_CONTENT_REPO;
  if (process.env.CONTENT_SOURCE === "github" && repo) {
    const res = await fetch(`https://api.github.com/repos/${repo}/contents/content/${name}`, {
      headers: {
        Accept: "application/vnd.github.raw",
        ...(process.env.GITHUB_TOKEN && { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }),
      },
      next: { tags: [CONTENT_TAG], revalidate: 3600 },
    });
    if (res.ok) return res.text();
    console.error(`content: GitHub read of ${name} failed (${res.status}); using bundled copy`);
  }
  return readFile(path.join(process.cwd(), "content", name), "utf8");
}

export async function readContent<K extends FileKey>(key: K): Promise<FileData<K>> {
  const { name, schema } = files[key];
  return schema.parse(JSON.parse(await readRaw(name))) as FileData<K>;
}
