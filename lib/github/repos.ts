import "server-only";

// Public repositories of the portfolio owner (research.md R5). A token is optional: without
// one GitHub allows 60 requests/hour, enough for a sync of ~25 repos.

export type RepoSnapshot = {
  id: number;
  name: string;
  description: string | null;
  url: string;
  homepage: string | null;
  topics: string[];
  stars: number;
  isFork: boolean;
  isArchived: boolean;
  pushedAt: string;
  languages?: Record<string, number>;
  readmeExcerpt?: string;
};

type ApiRepo = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  topics?: string[];
  stargazers_count: number;
  fork: boolean;
  archived: boolean;
  private: boolean;
  pushed_at: string;
};

const API = "https://api.github.com";

function headers(accept = "application/vnd.github+json") {
  return {
    Accept: accept,
    "X-GitHub-Api-Version": "2022-11-28",
    ...(process.env.GITHUB_TOKEN && { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }),
  };
}

async function get(path: string, accept?: string): Promise<Response> {
  const res = await fetch(`${API}${path}`, { headers: headers(accept), cache: "no-store" });
  if (res.status === 403 || res.status === 429) throw new Error("GitHub rate limit reached; try again later");
  return res;
}

export async function listPublicRepos(user: string): Promise<RepoSnapshot[]> {
  const res = await get(`/users/${encodeURIComponent(user)}/repos?type=owner&per_page=100&sort=pushed`);
  if (!res.ok) throw new Error(`GitHub repo list failed (${res.status})`);
  const repos = (await res.json()) as ApiRepo[];
  return repos
    .filter((r) => !r.private)
    .map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      url: r.html_url,
      homepage: r.homepage?.startsWith("https://") ? r.homepage : null,
      topics: r.topics ?? [],
      stars: r.stargazers_count,
      isFork: r.fork,
      isArchived: r.archived,
      pushedAt: r.pushed_at,
    }));
}

/** Languages and README for one repo (only fetched when the repo is new or has new pushes). */
export async function repoDetails(user: string, name: string) {
  const base = `/repos/${encodeURIComponent(user)}/${encodeURIComponent(name)}`;
  const [langRes, readmeRes] = await Promise.all([
    get(`${base}/languages`),
    get(`${base}/readme`, "application/vnd.github.raw"),
  ]);
  const languages = langRes.ok ? ((await langRes.json()) as Record<string, number>) : {};
  const readmeExcerpt = readmeRes.ok ? excerptReadme(await readmeRes.text()) : "";
  return { languages, readmeExcerpt };
}

/** Drops badges/images/HTML and trims to ≤ 4,000 chars at a line break. */
export function excerptReadme(markdown: string, max = 4000): string {
  const cleaned = markdown
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, "")
    .split("\n")
    .filter((line) => !/^\s*(\[!\[|!\[)/.test(line))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (cleaned.length <= max) return cleaned;
  const cut = cleaned.lastIndexOf("\n", max);
  return cleaned.slice(0, cut > max / 2 ? cut : max).trim();
}
