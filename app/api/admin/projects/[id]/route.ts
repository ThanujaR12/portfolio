import { AdminError, adminRoute } from "@/lib/admin";
import { updateContent } from "@/lib/content/store";
import { curatedPatchSchema } from "@/lib/schemas";
import { normalize } from "@/lib/sync/reconcile";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

// PATCH /api/admin/projects/:id — curated case-study fields.
export const PATCH = adminRoute<Context>(async (request, { params }) => {
  const id = Number((await params).id);
  const patch = curatedPatchSchema.parse(await request.json());

  const file = await updateContent(
    "projects",
    (current) => {
      const project = current.projects.find((p) => p.id === id);
      if (!project) throw new AdminError(404, "not_found", "Project not found.");
      if (patch.slug && patch.slug !== project.slug) {
        // Public links must not break once shared.
        if (project.status === "published") {
          throw new AdminError(409, "slug_locked", "Hide the project before changing its URL.");
        }
        if (current.projects.some((p) => p.slug === patch.slug)) {
          throw new AdminError(409, "slug_taken", "Another project already uses that URL.");
        }
      }
      // Empty strings clear a field so the GitHub fallback shows again.
      const cleaned = Object.fromEntries(
        Object.entries(patch).map(([k, v]) => [k, v === "" ? undefined : v]),
      );
      return {
        ...current,
        projects: normalize(
          current.projects.map((p) =>
            p.id === id ? { ...p, ...cleaned, updatedAt: new Date().toISOString() } : p,
          ),
        ),
      };
    },
    `content: edit project ${id} [admin]`,
  );
  return Response.json({ project: file.projects.find((p) => p.id === id) });
});
