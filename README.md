# Thanuja Rameshbaabu — Developer Portfolio

A fast, accessible portfolio that showcases my GitHub projects to recruiters, with an AI guide
that answers questions about my work and an admin area where I curate everything.

**Design:** "deep-space glass": a dark, airy, futuristic theme with a drifting grid, frosted-glass
cards and a cyan→violet accent, built so the projects are what stands out.

## What visitors get

- **One-page overview** (hero, featured work, all projects, skills, about, contact) with a sticky
  navigation bar that highlights where you are.
- **Featured spotlight + filterable grid**: filter by technology and sort; filtered views are
  shareable links (`/?tech=React`).
- **Case studies** at `/projects/<name>`: cover, quick facts (role, stack, year, status), the
  problem, highlights, screenshot gallery, live demo and code links, share image.
- **Ask AI**: a guide that answers only from portfolio content, cites the projects it used, and
  says plainly when it doesn't know. Streams answers; rate-limited; degrades gracefully.
- **Resume** page with inline PDF, download, and a text version.
- **Contact form** delivered to my inbox, with spam protection that needs no CAPTCHA.
- **Live GitHub stats** strip, a skills map that links to projects, and full keyboard/screen-reader
  support. Lighthouse (mobile): 100 / 100 / 100 / 100.

## What I get (`/admin`)

- **Sign in with GitHub**: only my account is allowed (checked on the server for every request).
- **GitHub sync**: daily and on demand. New repos arrive in *Pending review* and are never public
  until I publish them; deleted/private repos are hidden automatically.
- **Board**: drag projects between *Pending / Published / Hidden*, reorder, ★ feature up to three.
- **Editor**: write each case study, upload screenshots (auto-converted to WebP), see a live
  preview of the public card.
- **Profile & resume**: edit the About section and links, upload a photo, replace the resume PDF
  (its text also teaches the AI guide).

Every save is a commit to this repository, so all content has history and can be undone.

## Tech

Next.js 16 (App Router, React Server Components) · TypeScript · Tailwind CSS v4 · Auth.js v5 ·
Google Gemini (free tier) · Upstash Redis (free) · Resend (free) · Vercel Hobby (free) ·
Vitest · Playwright + axe. **Running cost: $0.**

Built spec-first with [Spec Kit](https://github.com/github/spec-kit) and Claude Code:
the [spec](specs/001-developer-portfolio/spec.md), [plan](specs/001-developer-portfolio/plan.md),
[tasks](specs/001-developer-portfolio/tasks.md) and [constitution](.specify/memory/constitution.md)
are in the repo.

## Run locally

```bash
npm install
cp .env.example .env.local   # then set AUTH_SECRET and ADMIN_DEV_LOGIN=1
npm run dev                  # http://localhost:3000
```

Locally everything works without any accounts: content is read from and saved to `content/`,
Ask AI uses offline answers, contact messages are logged, and `/admin` offers development-only
sign-in buttons when `ADMIN_DEV_LOGIN=1`. Generate `AUTH_SECRET` with `npx auth secret`.

| Command | What it does |
|---|---|
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | Browser tests on desktop, phone and admin (Playwright, uses installed Chrome; dev server must allow `ADMIN_DEV_LOGIN=1`) |
| `npm run lint` · `npm run typecheck` | ESLint · TypeScript |
| `npm run build` then `npm start -- -p 3001` and `npm run lighthouse` | Production build + mobile Lighthouse gate (fails below 90) |
| `node scripts/screenshots.mjs <dir> [route…]` | Desktop + phone screenshots with headless Chrome |

## Deploy (free)

1. **Push this repo to GitHub** (e.g. `ThanujaR12/portfolio`) and import it in
   [Vercel](https://vercel.com/new). Framework: Next.js; no build settings to change.
2. **GitHub OAuth app** (Settings → Developer settings → OAuth Apps → New):
   homepage `https://<your-domain>`, callback `https://<your-domain>/api/auth/callback/github`.
   → `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`.
3. **Fine-grained GitHub token** (Settings → Developer settings → Fine-grained tokens):
   repository access *only this repo*, permission **Contents: Read and write**.
   → `GITHUB_TOKEN`, and set `GITHUB_CONTENT_REPO=ThanujaR12/portfolio`, `CONTENT_SOURCE=github`.
4. **Gemini key** from [Google AI Studio](https://aistudio.google.com) → `GEMINI_API_KEY`.
5. **Resend** ([resend.com](https://resend.com)) API key → `RESEND_API_KEY`, and
   `CONTACT_TO_EMAIL` = the email you signed up with.
6. **Upstash Redis** ([upstash.com](https://upstash.com), free database) →
   `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
7. Also set `AUTH_SECRET` (`npx auth secret`), `CRON_SECRET` (any long random string) and
   `NEXT_PUBLIC_SITE_URL=https://<your-domain>`. Optionally `ADMIN_GITHUB_ID` (your numeric
   GitHub id) to pin the admin account.
8. Redeploy. The server log lists any missing setting at startup (`[env] …`) and what falls
   back without it. The daily sync runs from [`vercel.json`](vercel.json).

Enter keys only in Vercel's Environment Variables settings, never in the repository.

## Project layout

```text
app/                 routes: home, projects/[slug], resume, admin, api/*
components/          site/ project/ chat/ admin/ ui/
lib/                 content store + merge, GitHub sync, AI grounding, auth, rate limits, email
content/             curated data (JSON), edited through /admin
public/uploads/      screenshots and photo uploaded through /admin
specs/               spec-driven documents for this feature
tests/               unit/ (Vitest) and e2e/ (Playwright)
```
