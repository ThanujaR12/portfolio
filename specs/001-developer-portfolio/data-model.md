# Data Model: Developer Portfolio

All persisted data is JSON in `content/` (see [contracts/content-schema.md](contracts/content-schema.md)).
GitHub-sourced fields are refreshed by sync and never edited by the owner; curated fields are
edited only by the owner and never overwritten by sync.

## Project

| Field | Source | Type | Rules |
|-------|--------|------|-------|
| id | GitHub | number | GitHub repo id; primary key (stable across renames) |
| repoName | GitHub | string | |
| slug | curated | string | `^[a-z0-9]+(-[a-z0-9]+)*$`, unique; defaults to kebab-case repoName on first sync; changing it is allowed only while `pending` or `hidden` |
| github.description | GitHub | string \| null | |
| github.url | GitHub | url | |
| github.homepage | GitHub | url \| null | used as live-demo fallback |
| github.languages | GitHub | Record<string, number> | bytes per language |
| github.topics | GitHub | string[] | |
| github.stars | GitHub | number | |
| github.isFork / isArchived | GitHub | boolean | |
| github.pushedAt | GitHub | ISO date | |
| github.readmeExcerpt | GitHub | string | Markdown, ≤ 4,000 chars, sanitized at render |
| title | curated | string? | ≤ 60 chars; fallback: repoName prettified |
| summary | curated | string? | ≤ 160 chars; fallback: github.description |
| problem | curated | string? | ≤ 1,200 chars (Markdown) |
| role | curated | string? | ≤ 80 chars |
| highlights | curated | string[] | 0–6 items, each ≤ 140 chars |
| tags | curated | string[] | 0–12 technology names; merged with languages/topics for filters |
| demoUrl | curated | url? | https only; fallback github.homepage |
| year | curated | number? | fallback: year of first sync / pushedAt |
| screenshots | curated | Screenshot[] | 0–8; first with `cover: true` (or index 0) is the cover |
| status | curated | `pending` \| `published` \| `hidden` | see state machine |
| featured | curated | boolean | at most 3 projects with `featured && status=published` |
| order | curated | number | display order among published (ascending) |
| flags | system | (`needs-content` \| `removed-from-github`)[] | |
| firstSeenAt / updatedAt | system | ISO date | |

### State transitions

```text
          (new repo found by sync)
                  │
       fork? ──yes──► pending (suggestHidden=true)
                  │no
                  ▼
               pending ──owner publish──► published ◄──owner publish── hidden
                  │                         │  ▲                        ▲
                  └──owner hide─────────────┼──┼────────────────────────┘
                                            └──owner hide──► hidden
repo deleted/private on GitHub (any state) → flag `removed-from-github`; if published → hidden
repo reappears → flag cleared, status stays as owner left it
```

- Unpublishing a featured project clears `featured`.
- `needs-content` is set when published but `summary` and `github.description` are both empty or
  there are no screenshots; cleared automatically when resolved.

## Screenshot

| Field | Type | Rules |
|-------|------|-------|
| src | string | path under `/uploads/` (PNG/JPEG/WebP, ≤ 2 MB, stored as WebP) |
| alt | string | required, 5–140 chars |
| width / height | number | recorded at upload for layout stability |
| cover | boolean? | at most one per project |

## Skill (derived, not stored)

Built at read time from published projects: union of `tags`, `github.languages` keys, and
`github.topics`, normalized through an alias map (e.g. `reactjs`→`React`, `ts`→`TypeScript`) and
a category map (Languages, Frontend, Backend, AI/Data, Tools; unknown → Tools).
`{ name, category, projectSlugs[], count }`.

## Profile

| Field | Type | Rules |
|-------|------|-------|
| name | string | ≤ 60 |
| positioning | string | ≤ 90, hero line |
| bio | string | ≤ 1,200 (Markdown) |
| photo | string? | `/uploads/...` |
| currentFocus | string | ≤ 140 |
| highlights | { label, detail, period? }[] | 0–8 (education/experience) |
| links | { email, github, linkedin? } | email valid; urls https |
| resume | { path, updatedAt, text } | path `/resume.pdf`; `text` = extracted plain text used for AI grounding |
| suggestedQuestions | string[] | 3–4, each ≤ 80 |

## SyncRun

`{ at, trigger: 'cron'|'manual', ok, added[], updated[], removed[], error? }` — last 30 kept.

## ContactMessage (transient)

`{ name ≤ 80, email valid, message 10–2,000, website (honeypot, must be empty), startedAt }`
— validated, emailed, never stored.

## ChatRequest (transient)

`{ messages: { role: 'user'|'assistant', content ≤ 1,000 }[] (≤ 10) }` — never stored.
