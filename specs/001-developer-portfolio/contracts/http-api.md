# HTTP Contract: Developer Portfolio

All bodies are JSON unless noted and validated with zod (`lib/schemas.ts`). Errors use
`{ error: { code, message, fields? } }` with the status shown.

## Public

### POST /api/chat
- Body: `ChatRequest` (see data-model).
- 200: `text/event-stream` with events:
  - `event: token` `data: {"t":"..."}` (repeated)
  - `event: citations` `data: {"projects":[{"slug","title"}]}` (once, may be empty)
  - `event: done`
- 400 `invalid_input` · 429 `rate_limited` (`retryAfterSeconds`) · 503 `ai_unavailable`
- Never returns content outside the portfolio corpus; citations only reference published slugs.

### POST /api/contact
- Body: `{ name, email, message, website, startedAt }`
- 200 `{ ok: true }` · 400 `invalid_input` (`fields`) · 429 `rate_limited` · 502 `send_failed`
- Honeypot filled or `now - startedAt < 3s` → 200 `{ ok: true }` silently, nothing sent.

### GET /api/cron/sync
- Header `Authorization: Bearer ${CRON_SECRET}`; else 401.
- 200 `SyncRun`.

## Auth
- `/api/auth/*` — Auth.js GitHub provider. Sign-in denied (redirect to `/admin/signin?error=AccessDenied`)
  unless GitHub login/id matches the owner allowlist.

## Admin (all require owner session; otherwise 401 `unauthenticated` / 403 `forbidden`)

Every successful mutation commits to `content/` (or `public/`) via the GitHub Contents API with
message `content: <action> [admin]`, then calls `revalidateTag('content')`. Writes send the
file's last known `sha`; on 409 the server reloads, re-applies the change once, else returns
409 `conflict`.

### POST /api/admin/sync
- 200 `SyncRun` · 502 `github_unavailable`

### PATCH /api/admin/projects
- Board moves. Body: `{ columns: { pending: id[], published: id[], hidden: id[] }, featured: id[] }`
  (`featured` ⊆ published, length ≤ 3).
- 200 `{ projects: Project[] }` · 400 `invalid_input` (e.g. `too_many_featured`)

### PATCH /api/admin/projects/:id
- Body: partial curated fields `{ slug?, title?, summary?, problem?, role?, highlights?, tags?, demoUrl?, year?, screenshots? }`
- 200 `{ project }` · 400 · 404 `not_found` · 409 `slug_taken` / `slug_locked`

### POST /api/admin/uploads
- `multipart/form-data`: `file` (png/jpeg/webp ≤ 2 MB), `kind` = `screenshot` | `photo`
- Server converts to WebP (max 1920px wide), commits to `public/uploads/<uuid>.webp`.
- 201 `{ src, width, height }` · 400 · 413 `too_large`

### PATCH /api/admin/profile
- Body: partial `Profile` (excluding `resume`). 200 `{ profile }` · 400

### POST /api/admin/resume
- `multipart/form-data`: `file` (application/pdf ≤ 5 MB). Commits `public/resume.pdf`,
  extracts text into `profile.resume.text`. 200 `{ resume: { path, updatedAt } }` · 400 · 413

## Public pages (UI contract)

| Route | Content | Cache |
|-------|---------|-------|
| `/` | Hero (+StatsStrip, HeroAsk), Featured, Projects grid (`?tech=React,AI&sort=recent` reflected in URL), Skills, About, Contact | tag `content`,`github`; revalidate 3600 |
| `/projects/[slug]` | CaseHero, QuickFacts, Problem, Highlights, Gallery, PrevNext; OG image | same; `generateStaticParams` for published |
| `/resume` | inline PDF viewer + Download | static |
| `/admin` | Board (owner only) | dynamic, no-store |
| 404 | glass "not found" with link to `/#projects` | — |
