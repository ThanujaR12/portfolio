"use client";

export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; code: string; message: string };

/** Calls an admin endpoint; never throws. 401 means the session expired. */
export async function adminFetch<T>(url: string, init: RequestInit): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: init.body instanceof FormData ? init.headers : { "Content-Type": "application/json", ...init.headers },
    });
    const body = await res.json().catch(() => null);
    if (res.ok) return { ok: true, data: body as T };
    return {
      ok: false,
      status: res.status,
      code: body?.error?.code ?? "error",
      message: body?.error?.message ?? "Something went wrong.",
    };
  } catch {
    return { ok: false, status: 0, code: "network", message: "Network error. Check your connection." };
  }
}

export const SESSION_EXPIRED =
  "Your session expired. Sign in again in a new tab, then save. Your edits are kept here.";
