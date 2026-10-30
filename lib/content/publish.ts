import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import { CONTENT_TAG } from "@/lib/content/store";

/** After any content write: refresh cached GitHub reads and every pre-rendered page (FR-024). */
export function publishChanges() {
  revalidateTag(CONTENT_TAG, { expire: 0 });
  revalidatePath("/", "layout");
}
