import { AdminError, adminRoute } from "@/lib/admin";
import { readContent, updateContent } from "@/lib/content/store";
import { boardUpdateSchema, type Project } from "@/lib/schemas";
import { normalize } from "@/lib/sync/reconcile";

export const dynamic = "force-dynamic";

// GET /api/admin/projects — fresh list for the board (after a sync).
export const GET = adminRoute(
  async () => Response.json({ projects: (await readContent("projects", { fresh: true })).projects }),
  { mutates: false },
);

// PATCH /api/admin/projects — board moves: column membership, order, featured.
export const PATCH = adminRoute(async (request) => {
  const { columns, featured } = boardUpdateSchema.parse(await request.json());
  const placed = new Map<number, { status: Project["status"]; order: number }>();
  for (const status of ["pending", "published", "hidden"] as const) {
    columns[status].forEach((id, i) => placed.set(id, { status, order: i + 1 }));
  }
  if (!featured.every((id) => placed.get(id)?.status === "published")) {
    throw new AdminError(400, "invalid_input", "Only published projects can be featured.");
  }

  const file = await updateContent(
    "projects",
    (current) => {
      const ids = current.projects.map((p) => p.id);
      if (ids.length !== placed.size || !ids.every((id) => placed.has(id))) {
        throw new AdminError(409, "conflict", "The project list changed. Reload and try again.");
      }
      const now = new Date().toISOString();
      return {
        ...current,
        projects: normalize(
          current.projects.map((p) => {
            const { status, order } = placed.get(p.id)!;
            const moved = status !== p.status || order !== p.order || featured.includes(p.id) !== p.featured;
            return { ...p, status, order, featured: featured.includes(p.id), updatedAt: moved ? now : p.updatedAt };
          }),
        ),
      };
    },
    "content: update project board [admin]",
  );
  return Response.json({ projects: file.projects });
});
