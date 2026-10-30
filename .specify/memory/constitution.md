<!--
Sync Impact Report
- Version: 0.0.0 → 1.0.0 (initial ratification)
- Principles added: I–VI (all new)
- Sections added: Technology & Cost Constraints, Development Workflow, Governance
- Templates: plan/spec/tasks templates reviewed — no changes required (Constitution Check gate reads this file)
- Deferred TODOs: none
-->

# Thanuja Portfolio Constitution

## Core Principles

### I. Recruiter-First Clarity
Every page MUST let a recruiter or hiring manager understand who Thanuja is, what Thanuja
builds, and how to get in touch within 10 seconds of landing. Project content leads with the
problem, the outcome, the stack, and the owner's role — not implementation trivia. Any project
detail is at most two clicks from home.

### II. GitHub Is the Source of Truth, the Owner Curates
Project facts (name, description, languages, stars, last update, README) come from the GitHub
API for user `ThanujaR12`. The owner decides visibility, order, featured status, and adds
curated extras (screenshots, highlights, live demo links). New repositories MUST appear as
"pending review" for the owner and never go public automatically.

### III. Performance & Accessibility Are Requirements
Public pages MUST score ≥ 90 on Lighthouse Performance, Accessibility, Best Practices, and SEO
on mobile. WCAG 2.2 AA is the floor: keyboard navigable, visible focus, sufficient contrast,
respects `prefers-reduced-motion`, and semantic HTML. Layouts MUST work from 320px upward with
no horizontal scroll.

### IV. Honest, Grounded AI
The "Ask me" chatbot MUST answer only from portfolio content (curated projects, READMEs,
resume/about data). It cites the projects it draws from, says "I don't know" when content does
not cover a question, never invents experience, and is rate-limited per visitor. AI failure
MUST degrade gracefully — the rest of the site keeps working.

### V. Secure by Default
The admin area is reachable only by the GitHub account `ThanujaR12` (allowlist enforced on the
server, not just the UI). Secrets live in environment variables, never in the repo or client
bundle. All admin mutations are validated server-side.

### VI. Simplicity & Testability
Prefer the smallest design that meets the spec. Every user story ships with automated tests for
its server logic (sync, curation, chat grounding) and at least one end-to-end check of its
public behavior. No dependency is added without a stated need.

## Technology & Cost Constraints

- Next.js (App Router) + TypeScript, deployed on Vercel's free tier.
- Zero recurring cost: only free tiers (e.g. Gemini/Groq free API tier for AI, free hosted
  storage). Any paid service requires an explicit constitution amendment.
- GitHub API calls are cached/revalidated so public traffic never hits rate limits.

## Development Workflow

- Spec-driven: `/speckit-specify` → `/speckit-clarify` → `/speckit-plan` → `/speckit-tasks`
  → `/speckit-implement`. Design decisions (visual style, layout, interactions) are confirmed
  with the owner; other choices default to the recommended option and are recorded in the spec.
- Every change is verified in a real browser (desktop and mobile widths) before being called done.
- Commits are small and conventional (`feat:`, `fix:`, `docs:`).

## Governance

This constitution supersedes other practices. Amendments are made by editing this file with a
version bump (MAJOR: principle removed/redefined; MINOR: principle/section added; PATCH:
wording) and a Sync Impact Report. Every plan's Constitution Check MUST pass or justify
deviations in its Complexity Tracking table.

**Version**: 1.0.0 | **Ratified**: 2026-10-30 | **Last Amended**: 2026-10-30
