# Feature Specification: Light Redesign — Statement Home

**Feature Branch**: `002-light-redesign`

**Created**: 2026-11-02

**Status**: Approved (design choices made by the owner)

**Input**: "I want my profile and home page to be similar to rayhanm.com — this type of setup — with lighter colours, more like Apple's or Google's theme, with a uniqueness to me and AI."

Supersedes the visual design of spec 001 (FR-001…FR-004b, FR-011, FR-012 layout). All behaviour of 001
(case studies, Ask AI, admin, sync, resume, contact) is kept.

## Clarifications

### Session 2026-11-02

- Q: Light look? → A: **Apple-clean + AI aurora**: white/very light grey canvas, near-black type, generous whitespace, soft-shadow rounded cards; signature is a soft, slowly drifting blue→violet→rose "aurora" glow behind the hero that intensifies while a visitor types into Ask AI. Light only (no dark toggle).
- Q: Hero? → A: **Statement + Currently card**: large statement mixing light and bold weights, degree line, "More about me ↗"; right-hand "Currently" card with Open to (term + roles), city with live local time, Contact button. Ask AI box under the statement.
- Q: Page flow? → A: **Reference flow, adapted**: Hero → Journey timeline → Selected work (one project per screen) → Skills → "Let's build" closing section with the contact form. About moves to `/about`; the filterable project grid moves to `/work`.
- Q: Motion? → A: **Smooth & subtle**: sections fade/slide in, the timeline draws itself when reached, projects ease in; all disabled under reduced motion.
- Q: Open to? → A: Summer 2027 internships · Software Engineering · AI · Product.
- Q: Statement? → A: "I design and build **AI-powered products** and aim to lead the teams that ship them."
- Q: Navigation? → A: Icons with labels revealed on hover/focus (text labels on phones): Home, About, Work, Resume, Contact, plus an Ask AI button.
- Location for the live clock: Nashville (America/Chicago), editable in admin (owner preference: recommended defaults for non-design choices).

## User Scenarios & Testing

### User Story 1 — First impression in one screen (P1)

A recruiter opens the link and, on the first screen, reads a clear statement of what Thanuja does,
sees the degree, and sees in the Currently card what Thanuja is open to and how to make contact.

**Acceptance**
1. Statement, degree line, "More about me", Ask AI box and the Currently card are visible without scrolling at 1280×800; on a 375px phone the statement, Ask AI box and Currently card stack in that order.
2. The Currently card shows the term, roles, city and a live local time that updates each minute, and Contact jumps to the Let's build section.
3. The aurora is decorative only, never reduces text contrast, and is static under reduced motion.

### User Story 2 — Story and work at a glance (P1)

Scrolling down, the visitor sees a Journey timeline (education, challenge, projects by year, and the
next step "Summer 2027 — open to internships"), then each selected project large on its own screen,
then skills, then a closing "Let's build" section with the contact form and links.

**Acceptance**
1. Journey shows items in date order on a horizontal axis (desktop) or vertical list (phone).
2. Selected work shows featured projects (topped up to 3 with the next published ones) each with cover, title, summary, technologies and a case-study link; "All projects ↗" leads to `/work`.
3. `/work` keeps the filterable grid with shareable `?tech=` links; skill chips link there.
4. `/about` shows bio, education/background, current focus, photo (if any), GitHub stats and a resume link.

## Requirements

- **FR-101** Light visual system: canvas `#FBFBFD`, surface `#FFFFFF`, ink `#1D1D1F`, muted `#6E6E73`, hairline borders, accent link blue `#0066CC`; AI accents `#3D6DF2 → #7C4DDB`; aurora tints (blue, violet, rose, mint). All text ≥ 4.5:1 contrast.
- **FR-102** Hero statement is editable by the owner, with `**bold**` segments rendered heavier.
- **FR-103** Currently card fields (term, roles, city, IANA time zone) are editable in admin.
- **FR-104** Journey is derived from profile background entries (with periods), published projects (by year) and the Open-to term; no separate data entry.
- **FR-105** Icon navigation with accessible names; labels appear on hover/focus; phone menu with text.
- **FR-106** Existing pages (case study, resume, admin, sign-in, 404, chat panel, share images, icon) adopt the light theme.
- **FR-107** Scroll reveals use IntersectionObserver + CSS only; no animation library.

## Success Criteria

- **SC-101** Lighthouse (mobile) stays ≥ 90 in all four categories on `/`, `/about`, `/work`, a case study.
- **SC-102** Zero axe violations on all public pages.
- **SC-103** All existing behaviours of spec 001 keep passing their tests (paths updated for `/work`).

## Assumptions

- Light only; the dark "deep-space" theme is retired.
- Layout patterns are inspired by the reference, but imagery, copy and visual identity are original.
