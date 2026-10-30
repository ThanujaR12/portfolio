# Portfolio decisions (input for /speckit-specify)

Recorded 2026-10-30. Owner: Thanuja (GitHub `ThanujaR12`).

## Product / technical (recommended options)
- Projects: GitHub sync + owner curation. New repos land as "pending review".
- AI: "Ask me" chatbot grounded in portfolio content, citing projects.
- Stack: Next.js (App Router) + TypeScript, Vercel free tier.
- Cost: free only (Gemini/Groq free tier or in-browser model).
- Admin sign-in: GitHub OAuth, allowlisted to `ThanujaR12`.
- Location: `C:\Portfolio`, own git repo.

## Design (chosen by owner)
- Feel: "airy, futuristic, modern, efficient techno theme that makes my projects stand out".
- Theme: **Deep-space glass** — deep navy-black background, faint animated grid,
  frosted-glass cards, cyan→violet gradient glow on hover/accents.
- Structure: single scrolling home (Hero → Featured → All projects → Skills → About → Contact)
  with sticky glass nav; each project has its own case-study page (`/projects/[slug]`);
  `/resume`; `/admin`.
- Project list: 2–3 large featured spotlight cards, then a filterable grid
  (tech chips + sort).
- Chatbot entry: "Ask me anything" input in the hero with suggested questions, plus a
  floating chat button on every page opening a side panel.
