import { adminRoute } from "@/lib/admin";
import { runSync } from "@/lib/sync/run";

export const dynamic = "force-dynamic";

// POST /api/admin/sync — "Sync now".
export const POST = adminRoute(
  async () => {
    const run = await runSync("manual");
    return Response.json(run, { status: run.ok ? 200 : 502 });
  },
  { mutates: false },
);
