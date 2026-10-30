# Thanuja Portfolio

Next.js 16 (App Router) + TypeScript + Tailwind v4. Spec-driven: see `specs/001-developer-portfolio/`
(spec, plan, tasks) and `.specify/memory/constitution.md`.

- Next.js 16 docs ship in `node_modules/next/dist/docs/` — check them before using APIs that changed
  (e.g. `revalidateTag(tag, profile)`, async `params`).
- Caching uses the previous model (no `cacheComponents`): route `revalidate` + fetch tags.
- Curated content lives in `content/*.json`; `CONTENT_SOURCE=fs` locally.
- Commands: `npm run dev`, `npm test`, `npm run test:e2e`, `npm run typecheck`, `npm run lint`.
