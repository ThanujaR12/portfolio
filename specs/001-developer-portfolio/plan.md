# Implementation Plan: Developer Portfolio

**Branch**: `001-developer-portfolio` | **Date**: 2026-10-30 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-developer-portfolio/spec.md`

## Summary

A dark "deep-space glass" portfolio for Thanuja that shows GitHub projects to recruiters. Public
pages are server-rendered and cached. Project facts come from the GitHub REST API; the owner's
curation (status, featured, order, case-study copy, screenshots, profile, resume) is stored as
**versioned JSON and image files in the portfolio's own GitHub repository** ("Git-backed content"),
so there is no database to pay for or to pause. A GitHub-OAuth admin board (allowlisted to
`ThanujaR12`) edits that content through the GitHub Contents API and triggers on-demand cache
revalidation, so changes are live within seconds. The "Ask AI" assistant sends the whole (small)
portfolio corpus as grounding context to Google Gemini's free tier, streams the answer, and
returns cited project slugs. A daily cron plus a "Sync now" button reconcile repositories.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20+ (Vercel runtime)

**Primary Dependencies**: Next.js 15 (App Router, React 19 Server Components), Tailwind CSS v4,
Auth.js v5 (GitHub provider), `@google/genai` (Gemini), `zod` (validation), `@dnd-kit` (admin
board with keyboard drag), `motion` (small, reduced-motion-aware animation), `resend` (contact email),
`@upstash/ratelimit` + `@upstash/redis` (rate limiting), `react-markdown` + `rehype-sanitize`
(README excerpts)

**Storage**: Git-backed JSON content in this repository under `content/` (projects.json,
profile.json, sync-log.json) plus `public/uploads/` images and `public/resume.pdf`, read at runtime
via the GitHub API with tag-based caching; Upstash Redis free tier only for rate-limit counters

**Testing**: Vitest (unit: sync reconciliation, merge/fallback, grounding prompt, validation,
allowlist), Playwright (e2e: home, filter, case study, chat stub, admin auth refusal),
Lighthouse CI on the home and one case-study page

**Target Platform**: Vercel Hobby (free) serverless + edge; evergreen desktop and mobile browsers

**Project Type**: Web application (single Next.js app: public site + admin + API routes)

**Performance Goals**: LCP < 2.0s on mid-range mobile (4G); Lighthouse ≥ 90 in all four
categories; hero motion at 60fps using CSS/canvas, paused off-screen

**Constraints**: $0/month (all free tiers); GitHub API ≤ 5,000 req/h with token (cached so public
traffic causes ~0 calls); Gemini free-tier request limits → per-visitor limit 20 q/h; WCAG 2.2 AA;
320px minimum width; no tracking cookies

**Scale/Scope**: 1 owner, ~3–50 projects, low-thousands of visitors/month; ~6 public routes,
1 admin route, ~8 API routes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | How the design satisfies it | Status |
|-----------|-----------------------------|--------|
| I. Recruiter-First Clarity | Hero has name, positioning, CTA and Ask prompt above the fold; any case study is 1 click from Featured/grid; case-study order leads with problem/role/stack | ✅ |
| II. GitHub source of truth, owner curates | Sync reads GitHub; curated fields live separately and override; new repos → `pending`, forks → `hidden` (data-model state machine) | ✅ |
| III. Performance & Accessibility | Server Components + cached data, `next/image`, fonts self-hosted via `next/font`, hero effect is CSS + one small canvas disabled under reduced motion; axe checks in Playwright; Lighthouse CI gate | ✅ |
| IV. Honest, grounded AI | Prompt contains only portfolio corpus; model must return cited slugs, validated against real slugs; refusal instruction; rate limit; chat failure isolated to panel | ✅ |
| V. Secure by default | Auth.js GitHub provider; `ThanujaR12` allowlist checked in `signIn` callback **and** in every admin route handler / server action; secrets only in env; zod on every mutation | ✅ |
| VI. Simplicity & testability | One app, no database; corpus small enough to skip vector search; each story has unit + e2e tests | ✅ |
| Free-only constraint | Vercel Hobby, GitHub API, Gemini free tier, Upstash free, Resend free (100/day) | ✅ |

Post-design re-check (after Phase 1): ✅ no violations; Complexity Tracking not needed.

## Project Structure

### Documentation (this feature)

```text
specs/001-developer-portfolio/
├── plan.md              # This file
├── research.md          # Phase 0 decisions
├── data-model.md        # Entities, validation, state transitions
├── quickstart.md        # Setup + validation scenarios
├── contracts/
│   ├── http-api.md      # Route handlers / server actions
│   └── content-schema.md# JSON content file formats
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
app/
├── layout.tsx                 # fonts, metadata base, GlassNav, ChatLauncher, background
├── page.tsx                   # Home: Hero, Featured, Projects, Skills, About, Contact
├── projects/[slug]/page.tsx   # Case study (+ opengraph-image.tsx)
├── resume/page.tsx
├── admin/page.tsx             # Board (server-guarded)
├── admin/signin/page.tsx
├── not-found.tsx
├── sitemap.ts, robots.ts
└── api/
    ├── auth/[...nextauth]/route.ts
    ├── chat/route.ts          # POST, streaming
    ├── contact/route.ts       # POST
    ├── cron/sync/route.ts     # GET, CRON_SECRET
    └── admin/
        ├── sync/route.ts
        ├── projects/route.ts          # PATCH batch (status/order/featured)
        ├── projects/[id]/route.ts     # PATCH curated fields
        ├── uploads/route.ts           # POST image
        ├── profile/route.ts           # PATCH
        └── resume/route.ts            # POST pdf
components/
├── site/       # GlassNav, Hero, HeroBackground, StatsStrip, FeaturedCard, ProjectGrid,
│               # FilterChips, SkillsSection, AboutSection, ContactSection, Footer
├── project/    # CaseHero, QuickFacts, GlassPanel, Gallery, PrevNext
├── chat/       # ChatLauncher, ChatPanel, HeroAsk, MessageList, SuggestedQuestions
├── admin/      # Board, Column, ProjectCard, SideEditor, CardPreview, SyncBar
└── ui/         # Button, Chip, Glass, Dialog, VisuallyHidden
lib/
├── github/     # client.ts (REST + token), repos.ts, stats.ts, contents.ts (read/write files)
├── content/    # store.ts (load/save + cache tags), merge.ts (GitHub ⊕ curated), skills.ts
├── sync/       # reconcile.ts (pure), run.ts
├── ai/         # corpus.ts, prompt.ts, gemini.ts, citations.ts
├── auth.ts     # Auth.js config + requireOwner()
├── ratelimit.ts
├── email.ts
└── schemas.ts  # zod schemas shared by API + content files
content/        # Git-backed data (committed by admin/sync)
├── projects.json
├── profile.json
└── sync-log.json
public/uploads/ # screenshots (committed by admin)
tests/
├── unit/       # vitest
└── e2e/        # playwright
```

**Structure Decision**: Single Next.js App Router project at the repo root. Public UI, admin UI,
and API live together (one deploy, one free Vercel project). Pure logic (`lib/sync/reconcile.ts`,
`lib/content/merge.ts`, `lib/ai/prompt.ts`, `lib/ai/citations.ts`) is framework-free so it is
unit-tested in isolation.

## Complexity Tracking

No constitution violations; nothing to justify.
