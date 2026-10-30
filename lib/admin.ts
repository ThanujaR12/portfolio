import "server-only";
import { ZodError } from "zod";
import { AuthFailure, requireOwner } from "@/lib/auth";
import { publishChanges } from "@/lib/content/publish";
import { ContentConflict } from "@/lib/content/store";

export class AdminError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message?: string,
  ) {
    super(message ?? code);
  }
}

const json = (status: number, code: string, message: string, extra: object = {}) =>
  Response.json({ error: { code, message, ...extra } }, { status });

/**
 * Wraps an admin route handler: owner check first (every request, server-side), then maps
 * failures to the error codes in contracts/http-api.md. Successful mutations republish pages.
 */
export function adminRoute<C>(
  handler: (request: Request, context: C) => Promise<Response>,
  { mutates = true } = {},
) {
  return async (request: Request, context: C) => {
    try {
      await requireOwner();
      const response = await handler(request, context);
      if (mutates && response.ok) publishChanges();
      return response;
    } catch (e) {
      if (e instanceof AuthFailure) {
        return json(e.status, e.message, e.status === 401 ? "Please sign in." : "This account can't manage the portfolio.");
      }
      if (e instanceof ZodError) {
        return json(400, "invalid_input", e.issues[0]?.message ?? "Invalid input", {
          fields: e.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
        });
      }
      if (e instanceof AdminError) return json(e.status, e.code, e.message);
      if (e instanceof ContentConflict) return json(409, "conflict", "Content changed while saving. Reload and try again.");
      console.error("admin:", e);
      return json(502, "save_failed", "Couldn't save the change. Please try again.");
    }
  };
}
