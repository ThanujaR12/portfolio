import { runSync } from "@/lib/sync/run";

export const dynamic = "force-dynamic";

// GET /api/cron/sync — daily Vercel Cron; authorised by CRON_SECRET, not a user session.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json(
      { error: { code: "unauthenticated", message: "Bad cron secret" } },
      { status: 401 },
    );
  }
  const run = await runSync("cron");
  return Response.json(run, { status: run.ok ? 200 : 502 });
}
