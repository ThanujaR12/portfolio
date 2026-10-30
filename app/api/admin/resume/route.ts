import { extractText, getDocumentProxy } from "unpdf";
import { AdminError, adminRoute } from "@/lib/admin";
import { updateContent, writePublicFile } from "@/lib/content/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;

// POST /api/admin/resume — replaces public/resume.pdf and refreshes the text the AI reads.
export const POST = adminRoute(async (request) => {
  const file = (await request.formData()).get("file");
  if (!(file instanceof File)) throw new AdminError(400, "invalid_input", "Send a PDF file.");
  if (file.size > MAX_BYTES) throw new AdminError(413, "too_large", "The resume must be 5 MB or smaller.");
  const data = Buffer.from(await file.arrayBuffer());
  if (data.subarray(0, 5).toString() !== "%PDF-") {
    throw new AdminError(400, "invalid_input", "That file is not a PDF.");
  }

  let text = "";
  try {
    const pdf = await getDocumentProxy(new Uint8Array(data));
    text = (await extractText(pdf, { mergePages: true })).text.replace(/\s+\n/g, "\n").trim().slice(0, 20_000);
  } catch (e) {
    console.error("resume: text extraction failed", e);
  }

  await writePublicFile("resume.pdf", data, "content: replace resume [admin]");
  const updatedAt = new Date().toISOString();
  await updateContent(
    "profile",
    (p) => ({ ...p, resume: { path: "/resume.pdf", updatedAt, text } }),
    "content: resume text [admin]",
  );
  return Response.json({ resume: { path: "/resume.pdf", updatedAt, hasText: text.length > 0 } });
});
