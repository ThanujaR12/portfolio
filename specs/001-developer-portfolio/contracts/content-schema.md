# Content File Contract

Files under `content/` are the system of record for curated data. Each has a `version` for
future migrations. Field rules are in [../data-model.md](../data-model.md); the zod schemas in
`lib/schemas.ts` are the executable form of this contract.

## content/projects.json

```json
{
  "version": 1,
  "projects": [
    {
      "id": 123456789,
      "repoName": "PaletteBoard",
      "slug": "paletteboard",
      "github": {
        "description": "Save, organize, and share image collections as colour-themed boards",
        "url": "https://github.com/ThanujaR12/PaletteBoard",
        "homepage": null,
        "languages": { "TypeScript": 182000, "CSS": 9000 },
        "topics": ["react", "firebase"],
        "stars": 0,
        "isFork": true,
        "isArchived": false,
        "pushedAt": "2026-09-18T20:11:00Z",
        "readmeExcerpt": "# PaletteBoard\n..."
      },
      "title": "PaletteBoard",
      "summary": "…",
      "problem": "…",
      "role": "Solo full-stack developer",
      "highlights": ["…"],
      "tags": ["React", "Node.js"],
      "demoUrl": null,
      "year": 2026,
      "screenshots": [{ "src": "/uploads/3f2c.webp", "alt": "Board grid view", "width": 1600, "height": 1000, "cover": true }],
      "status": "published",
      "featured": true,
      "order": 1,
      "flags": [],
      "firstSeenAt": "2026-10-30T00:00:00Z",
      "updatedAt": "2026-10-30T00:00:00Z"
    }
  ]
}
```

## content/profile.json

```json
{
  "version": 1,
  "name": "Thanuja",
  "positioning": "Full-stack developer building thoughtful, AI-powered products",
  "bio": "…",
  "photo": null,
  "currentFocus": "…",
  "highlights": [{ "label": "…", "detail": "…", "period": "2024–2028" }],
  "links": { "email": "…", "github": "https://github.com/ThanujaR12", "linkedin": null },
  "resume": { "path": "/resume.pdf", "updatedAt": null, "text": "" },
  "suggestedQuestions": ["What's Thanuja's strongest project?", "Has Thanuja used React?", "What does Thanuja want to work on next?"]
}
```

## content/sync-log.json

```json
{ "version": 1, "runs": [{ "at": "…", "trigger": "manual", "ok": true, "added": ["new-repo"], "updated": [], "removed": [] }] }
```

## Invariants (enforced on every write)
- `slug` unique; `id` unique.
- ≤ 3 projects with `featured: true` and `status: "published"`.
- `order` values contiguous from 1 among published projects.
- At most one `cover: true` per project.
