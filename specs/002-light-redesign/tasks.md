# Tasks: Light Redesign (002)

**Plan**: no new dependencies; same Next.js app. Data changes are additive optional profile
fields (`statement`, `openTo`, `location`) with defaults, so existing content keeps validating.

- [x] R001 Profile schema + content: `statement`, `openTo {term, roles}`, `location {city, timeZone}`
- [x] R002 Light design tokens in `app/globals.css`; `card`, `nav-surface`, `ai-gradient`, aurora + reveal utilities; retire dark-only effects
- [x] R003 Restyle every existing component to the light tokens (nav, cards, chat, admin, case study, resume, 404, sign-in, OG images, icon, generated covers)
- [x] R004 Icon nav with hover/focus labels and phone menu (Home, About, Work, Resume, Contact, Ask AI)
- [x] R005 Hero: statement with bold segments, degree line, More about me, Ask AI, Currently card with live clock; aurora that reacts to typing
- [x] R006 Journey timeline (derived) — horizontal desktop, vertical phone, draws on reveal
- [x] R007 Selected work: one large project per screen + "All projects ↗"
- [x] R008 Skills strip + "Let's build" closing section with contact form and links
- [x] R009 `/about` page and `/work` page (filterable grid moved from home)
- [x] R010 Admin: edit statement, open-to and location
- [x] R011 Tests updated/added (unit for journey + statement parsing; e2e for new home, /about, /work)
- [x] R012 Verify desktop + phone, Lighthouse ≥ 90, deploy

## Validation (2026-11-02)

- Unit: 55 passed (journey, statement parsing, profile patch keeps unsent fields, time-zone validation).
- E2E: 65 passed + 1 flaky-on-cold-start retry (desktop, phone, admin suites).
- Lighthouse mobile (production build): `/` 98–100, `/about` 100, `/work` 100, case study 99–100, `/resume` 96–99 performance; 100 accessibility, best practices and SEO on all five.
- Caught during build: `profilePatchSchema` derived from the defaulted schema injected defaults into partial
  admin updates (would have reset the statement on any profile save); fixed by deriving it from a
  default-free base, with a regression test.

## Addendum tasks — name intro

- [x] R013 `ResolvingName` client component (no layout shift, reduced-motion aware, sr-only real name)
- [x] R014 `NameIntro` first screen: aurora, horizon line, roles, degree, buttons, scroll cue; statement hero → `#intro`, `h2`
- [x] R015 Tests (h1 is the name; statement h2; reduced motion shows final name) + Lighthouse ≥ 90 + deploy

### Addendum validation (2026-11-02)

- Unit 55 passed; E2E 69 passed + 1 flaky-on-retry (adds: name is h1, scroll cue → #intro, reduced motion shows the name, no-JS shows the name).
- Lighthouse mobile: `/` performance 95 (name hidden until the resolve starts), all other pages 99–100; accessibility, best practices, SEO 100 everywhere.
