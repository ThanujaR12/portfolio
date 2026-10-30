import { adminRoute } from "@/lib/admin";
import { updateContent } from "@/lib/content/store";
import { profilePatchSchema } from "@/lib/schemas";

export const dynamic = "force-dynamic";

// PATCH /api/admin/profile — About section, links, suggested questions.
export const PATCH = adminRoute(async (request) => {
  const patch = profilePatchSchema.parse(await request.json());
  const profile = await updateContent(
    "profile",
    (current) => ({ ...current, ...patch }),
    "content: edit profile [admin]",
  );
  return Response.json({ profile });
});
