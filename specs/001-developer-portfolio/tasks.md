---
description: "Task list for the Developer Portfolio"
---

# Tasks: Developer Portfolio

**Input**: Design documents from `/specs/001-developer-portfolio/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Required by the constitution (Principle VI): unit tests for server logic and at least one e2e check per story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story (US1–US5)
- Paths are relative to the repo root (single Next.js project; see plan.md)

---

## Phase 1: Setup

- [x] T001 Scaffold Next.js 15 + TypeScript + Tailwind v4 App Router app at repo root (`package.json`, `tsconfig.json`, `next.config.ts`, `app/`), keeping `.specify/` and `specs/`
- [x] T002 [P] Add ESLint + Prettier config and `npm run lint`/`format` scripts
- [x] T003 [P] Add Vitest (`vitest.config.ts`, `tests/unit/`) and Playwright + axe (`playwright.config.ts`, `tests/e2e/`) with `test`/`test:e2e` scripts
- [ ] T004 [P] Create `.env.example` listing every variable from quickstart.md, and `lib/env.ts` validating them with zod (optional ones may be absent in dev) _(partial: `.env.example` done; `lib/env.ts` validation lands with the first service that needs secrets)_
- [x] T005 [P] Add `.claude/launch.json` dev-server config (`npm run dev`, port 3000)

---

## Phase 2: Foundational (blocks all stories)

- [x] T006 Define zod schemas for Project, Screenshot, Profile, SyncRun, ChatRequest, ContactMessage in `lib/schemas.ts` (per data-model.md + content-schema.md, including invariants)
- [ ] T007 Implement content store `lib/content/store.ts`: `CONTENT_SOURCE=fs` (read/write `content/`) and `github` (Contents API with sha, retry-once on 409), cached with tag `content` _(partial: read path done for fs + github; write path lands with US4)_
- [ ] T008 [P] Implement GitHub client `lib/github/client.ts`, `lib/github/repos.ts` (list public repos, languages, README excerpt) cached with tag `github` _(deferred to US4 sync; stats strip derives from synced content per R9)_
- [x] T009 Implement `lib/content/merge.ts` (GitHub ⊕ curated → `PortfolioProject` view model with all fallbacks) + unit tests `tests/unit/merge.test.ts`
- [x] T010 [P] Implement `lib/content/skills.ts` (alias + category maps, counts) + unit tests `tests/unit/skills.test.ts`
- [x] T011 Seed `content/projects.json` and `content/profile.json` with the 3 current repos (PaletteBoard, campus-connect-app, AI-business-Assistant-) and placeholder profile copy
- [x] T012 Design system: tokens in `app/globals.css` (`@theme` colours, glass utilities, focus ring, reduced-motion rules), fonts via `next/font` in `app/layout.tsx`, primitives in `components/ui/` (Button, Chip, Glass, Dialog, VisuallyHidden)
- [x] T013 Root layout `app/layout.tsx`: page background, skip link, metadata base, `GlassNav` slot, footer

**Checkpoint**: content loads, design tokens render, unit tests pass.

---

## Phase 3: US1 — Recruiter scans the portfolio (P1) 🎯 MVP

**Goal**: Single-page home with hero, featured, filterable grid, skills, about, contact links.
**Independent test**: quickstart V1–V3.

- [x] T014 [P] [US1] `components/site/GlassNav.tsx`: sticky glass bar, section links + Resume + Ask AI, active section via IntersectionObserver, mobile menu (focus-trapped)
- [x] T015 [P] [US1] `components/site/HeroBackground.tsx`: CSS perspective grid drift + rAF cursor glow; off under reduced motion; anchored on `(hover: none)`
- [x] T016 [P] [US1] `lib/github/stats.ts` + `components/site/StatsStrip.tsx` (repo count, top 3 languages, last push; hidden on failure)
- [x] T017 [US1] `components/site/Hero.tsx`: name, gradient positioning line, Explore work CTA, HeroAsk placeholder input, StatsStrip
- [x] T018 [P] [US1] `components/site/FeaturedCard.tsx` + Featured section (1–3 cards adaptive layout; hidden when none)
- [x] T019 [US1] `components/site/ProjectGrid.tsx` + `FilterChips.tsx`: multi-select tech filter, sort (featured/recent/A–Z), URL-synced `?tech=&sort=`, empty state
- [x] T020 [P] [US1] `components/site/SkillsSection.tsx`: grouped glass chips with counts; click → set filter and scroll to grid
- [x] T021 [P] [US1] `components/site/AboutSection.tsx` and `ContactSection.tsx` (links only for now)
- [x] T022 [US1] Compose `app/page.tsx` (Server Component, revalidate 3600) + `app/sitemap.ts`, `app/robots.ts`, home metadata
- [x] T023 [US1] e2e `tests/e2e/home.spec.ts`: hero above fold at 375/1280, filter via chip + skill, nav jump, axe clean, reduced motion

**Checkpoint**: MVP — a usable, good-looking portfolio home.

---

## Phase 4: US2 — Project case study (P1)

**Goal**: `/projects/[slug]` cinematic case study. **Independent test**: V4–V5.

- [x] T024 [P] [US2] `components/project/CaseHero.tsx` (cover image, title, Live/Code buttons) and `QuickFacts.tsx`
- [x] T025 [P] [US2] `components/project/GlassPanel.tsx`, `Gallery.tsx` (grid + accessible lightbox), `PrevNext.tsx`
- [x] T026 [US2] `app/projects/[slug]/page.tsx` with `generateStaticParams`, `generateMetadata`, README-excerpt fallback (sanitized markdown), `notFound()` for unknown/hidden
- [x] T027 [P] [US2] `app/projects/[slug]/opengraph-image.tsx` (glass-styled OG card) and `app/not-found.tsx`
- [x] T028 [US2] e2e `tests/e2e/case-study.spec.ts`: sections render, links valid, OG tags, 404 page

---

## Phase 5: US3 — Ask AI (P2)

**Goal**: Grounded, streaming, cited assistant. **Independent test**: V6–V8.

- [x] T029 [P] [US3] `lib/ai/corpus.ts` (published projects + profile + resume text → `<portfolio>` block) and `lib/ai/prompt.ts` (system prompt per research R2)
- [x] T030 [P] [US3] `lib/ai/citations.ts` (parse/strip `CITATIONS:` line, validate slugs) + unit tests `tests/unit/citations.test.ts`, `tests/unit/prompt.test.ts`
- [x] T031 [P] [US3] `lib/ai/gemini.ts` provider + `mock` provider selected by `AI_PROVIDER`
- [x] T032 [P] [US3] `lib/ratelimit.ts` (Upstash sliding window, salted IP hash, in-memory fallback) + unit test
- [x] T033 [US3] `app/api/chat/route.ts`: validate, rate-limit, stream SSE `token`/`citations`/`done`, errors 400/429/503
- [x] T034 [US3] `components/chat/ChatPanel.tsx`, `MessageList.tsx`, `SuggestedQuestions.tsx`, `ChatLauncher.tsx` (floating button, side panel, Esc/focus return, AI-guide label), wire `HeroAsk.tsx` to open panel with question
- [x] T035 [US3] e2e `tests/e2e/chat.spec.ts` (mock provider): hero ask → streamed answer + citation link; out-of-scope decline; 429 message

---

## Phase 6: US4 — Owner curation (P2)

**Goal**: GitHub-sign-in admin board + sync. **Independent test**: V9–V10.

- [ ] T036 [US4] `lib/auth.ts` (Auth.js v5 GitHub, allowlist in `signIn`, `requireOwner()`), `app/api/auth/[...nextauth]/route.ts`, `app/admin/signin/page.tsx` + unit test for allowlist
- [ ] T037 [P] [US4] `lib/sync/reconcile.ts` (pure; new→pending, fork→hidden suggestion, removed flag/hide, field refresh) + unit tests `tests/unit/reconcile.test.ts`
- [ ] T038 [US4] `lib/sync/run.ts`, `app/api/admin/sync/route.ts`, `app/api/cron/sync/route.ts` (CRON_SECRET), `vercel.json` daily cron
- [ ] T039 [US4] `app/api/admin/projects/route.ts` (board PATCH, featured ≤ 3) and `projects/[id]/route.ts` (curated PATCH, slug rules), revalidateTag
- [ ] T040 [P] [US4] `app/api/admin/uploads/route.ts` (type/size checks, WebP via `sharp`, commit), `profile/route.ts`, `resume/route.ts` (PDF text extraction)
- [ ] T041 [US4] `components/admin/Board.tsx`, `Column.tsx`, `ProjectCard.tsx` with @dnd-kit (keyboard sensor), `SyncBar.tsx` (Sync now, last sync, errors, flags)
- [ ] T042 [US4] `components/admin/SideEditor.tsx` + `CardPreview.tsx` (live preview, screenshot upload/reorder/cover, unsaved-change guard on session expiry); `app/admin/page.tsx` guarded server-side
- [ ] T043 [US4] e2e `tests/e2e/admin.spec.ts`: signed-out redirect, non-owner 403 on every admin route, owner publish/feature flow (fs content source, mocked session)

---

## Phase 7: US5 — Resume & contact (P3)

**Independent test**: V11.

- [ ] T044 [P] [US5] `app/resume/page.tsx` (inline PDF embed with fallback link, Download button)
- [ ] T045 [P] [US5] `lib/email.ts` (Resend; console log when unset) and `app/api/contact/route.ts` (zod, honeypot, min-time, rate limit)
- [ ] T046 [US5] Contact form in `components/site/ContactSection.tsx` with inline field errors and success state
- [ ] T047 [US5] e2e `tests/e2e/contact.spec.ts`: resume download, valid/invalid submissions

---

## Phase 8: Polish & cross-cutting

- [ ] T048 [P] Lighthouse CI config (`lighthouserc.json`, `npm run lhci`) with 0.9 thresholds on `/` and one case study; fix any regressions
- [ ] T049 [P] `README.md`: what it is, setup (free keys), how to curate, deploy to Vercel
- [ ] T050 Run every quickstart.md scenario (V1–V12) in the browser at 375px and 1280px and fix issues

---

## Dependencies & execution order

- Setup → Foundational → stories. US1 is the MVP; US2 depends on US1's components/layout only loosely (can follow immediately). US3, US4, US5 each depend only on Foundational + the layout from US1 and are independent of each other.
- Within a story: lib + tests → API routes → components → page composition → e2e.

## Parallel opportunities

- T002–T005; T008/T010 alongside T007/T009; in US1 T014/T015/T016/T018/T020/T021; in US3 T029–T032; T037 and T040 alongside T036.

## Implementation strategy

1. Ship MVP: Phases 1–3 (home page), validate V1–V3.
2. Add US2 (case studies) → the portfolio is shareable.
3. Add US3 (AI), US4 (admin), US5 (resume/contact) in priority order, validating each.
4. Polish and the full quickstart run before any public deploy.
