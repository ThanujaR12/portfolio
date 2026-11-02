import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { z } from "zod";
import { aboutFileSchema, profileSchema, projectsFileSchema, syncLogFileSchema } from "@/lib/schemas";

// Curated content (research.md R1). CONTENT_SOURCE=fs reads/writes content/ on disk (dev,
// tests); "github" reads/writes the live files in the content repo through the Contents API,
// so admin edits show without a redeploy and every change is a commit you can undo.

export const CONTENT_TAG = "content";

const files = {
  projects: { name: "projects.json", schema: projectsFileSchema },
  profile: { name: "profile.json", schema: profileSchema },
  syncLog: { name: "sync-log.json", schema: syncLogFileSchema },
  about: { name: "about.json", schema: aboutFileSchema },
} as const;

type FileKey = keyof typeof files;
type FileData<K extends FileKey> = z.infer<(typeof files)[K]["schema"]>;

const repo = () => process.env.GITHUB_CONTENT_REPO;
const githubMode = () => process.env.CONTENT_SOURCE === "github" && Boolean(repo());

function githubHeaders(extra: Record<string, string> = {}) {
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(process.env.GITHUB_TOKEN && { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }),
    ...extra,
  };
}

const contentsUrl = (repoPath: string) => `https://api.github.com/repos/${repo()}/contents/${repoPath}`;

/** Public URL for a file under public/ (uploads, resume). */
export function assetUrl(publicPath: string): string {
  if (!githubMode()) return publicPath;
  return `https://raw.githubusercontent.com/${repo()}/main/public${publicPath}`;
}

async function readRaw(name: string, fresh: boolean): Promise<{ text: string; sha?: string }> {
  if (githubMode()) {
    const res = await fetch(contentsUrl(`content/${name}`), {
      headers: githubHeaders(),
      ...(fresh ? { cache: "no-store" } : { next: { tags: [CONTENT_TAG], revalidate: 3600 } }),
    });
    if (res.ok) {
      const body = (await res.json()) as { content: string; sha: string };
      return { text: Buffer.from(body.content, "base64").toString("utf8"), sha: body.sha };
    }
    if (fresh) throw new Error(`GitHub read of ${name} failed (${res.status})`);
    console.error(`content: GitHub read of ${name} failed (${res.status}); using bundled copy`);
  }
  return { text: await readFile(path.join(process.cwd(), "content", name), "utf8") };
}

/** Public pages: cached read. Pass fresh=true in admin for read-your-writes. */
export async function readContent<K extends FileKey>(key: K, { fresh = false } = {}): Promise<FileData<K>> {
  const { name, schema } = files[key];
  const { text } = await readRaw(name, fresh);
  return schema.parse(JSON.parse(text)) as FileData<K>;
}

export class ContentConflict extends Error {}

/**
 * Read-modify-write of one content file. The updater runs on the latest copy; on a concurrent
 * change (GitHub sha mismatch) it re-reads and runs once more, then gives up with a conflict.
 */
export async function updateContent<K extends FileKey>(
  key: K,
  update: (current: FileData<K>) => FileData<K>,
  message: string,
): Promise<FileData<K>> {
  const { name, schema } = files[key];
  for (let attempt = 0; attempt < 2; attempt++) {
    const { text, sha } = await readRaw(name, true);
    const next = schema.parse(update(schema.parse(JSON.parse(text)) as FileData<K>)) as FileData<K>;
    const body = `${JSON.stringify(next, null, 2)}\n`;
    if (await writeRaw(`content/${name}`, Buffer.from(body), message, sha)) return next;
  }
  throw new ContentConflict(`${name} changed while saving`);
}

/** Writes a binary file under public/ (e.g. "uploads/abc.webp"). */
export async function writePublicFile(relPath: string, data: Buffer, message: string): Promise<void> {
  let sha: string | undefined;
  if (githubMode()) {
    const res = await fetch(contentsUrl(`public/${relPath}`), { headers: githubHeaders(), cache: "no-store" });
    if (res.ok) sha = ((await res.json()) as { sha: string }).sha;
  }
  if (!(await writeRaw(`public/${relPath}`, data, message, sha))) {
    throw new ContentConflict(`${relPath} changed while saving`);
  }
}

/** Returns false on a sha conflict so the caller can retry. */
async function writeRaw(repoPath: string, data: Buffer, message: string, sha?: string): Promise<boolean> {
  if (!githubMode()) {
    // Statically scoped roots keep the bundler from tracing the whole project.
    const [root, ...rest] = repoPath.split("/");
    const file =
      root === "content"
        ? path.join(process.cwd(), "content", ...rest)
        : path.join(process.cwd(), "public", ...rest);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, data);
    return true;
  }
  const res = await fetch(contentsUrl(repoPath), {
    method: "PUT",
    headers: githubHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ message, content: data.toString("base64"), ...(sha && { sha }) }),
    cache: "no-store",
  });
  if (res.status === 409 || res.status === 422) return false;
  if (!res.ok) throw new Error(`GitHub write of ${repoPath} failed (${res.status})`);
  return true;
}
