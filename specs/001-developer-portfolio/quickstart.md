# Quickstart & Validation: Developer Portfolio

## Prerequisites
- Node.js 20+, npm
- Free accounts/keys (all optional for local dev except where noted):
  - GitHub fine-grained token with read access to public repos + contents read/write on this repo → `GITHUB_TOKEN`
  - GitHub OAuth App (callback `http://localhost:3000/api/auth/callback/github`) → `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`; `AUTH_SECRET`
  - Google AI Studio key → `GEMINI_API_KEY` (or set `AI_PROVIDER=mock`)
  - Upstash Redis → `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (optional locally)
  - Resend → `RESEND_API_KEY`, `CONTACT_TO_EMAIL` (optional locally; logs instead)
- Copy `.env.example` → `.env.local`. Set `CONTENT_SOURCE=fs` locally to read/write `content/` on disk instead of the GitHub API.

## Run
```bash
npm install
npm run dev          # http://localhost:3000
npm test             # vitest unit
npm run test:e2e     # playwright (uses AI_PROVIDER=mock, CONTENT_SOURCE=fs)
npm run lhci         # lighthouse on / and /projects/paletteboard
```

## Validation scenarios

| # | Story | Steps | Expected |
|---|-------|-------|----------|
| V1 | US1 | Open `/` at 375px and 1280px | Name, positioning, Explore work, Ask prompt visible without scrolling; grid + glow animate; with reduced motion emulated, no animation |
| V2 | US1 | Click "React" chip in Projects, then in Skills | Grid shows only React projects; URL has `?tech=React`; clearing restores all |
| V3 | US1 | Tab through the page | Visible focus everywhere; nav links jump to sections; no axe violations |
| V4 | US2 | Open `/projects/paletteboard` directly | Cover hero, quick facts, Problem, Highlights, Gallery, prev/next; OG tags present |
| V5 | US2 | Open `/projects/does-not-exist` | Styled 404 with link back to projects |
| V6 | US3 | Ask "Has Thanuja used React?" in hero | Panel opens, answer streams, ≥ 1 project citation link |
| V7 | US3 | Ask "What's the capital of France?" | Polite decline + contact suggestion, no citations |
| V8 | US3 | Send 21 questions in an hour (or set limit to 2) | Friendly limit message; rest of site works |
| V9 | US4 | Visit `/admin` signed out; sign in with a non-owner GitHub account | Redirect to sign-in; AccessDenied |
| V10 | US4 | Sign in as owner, "Sync now", drag new repo Pending → Published, star it, add summary + screenshot | Appears in Featured on `/` within 60s; commit visible in repo history |
| V11 | US5 | `/resume` → Download; submit contact form valid + invalid | PDF downloads; success toast; field errors shown, nothing sent |
| V12 | All | `npm run lhci` | ≥ 0.90 in Performance, Accessibility, Best Practices, SEO |
