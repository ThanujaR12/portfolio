import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { AdminError, adminRoute } from "@/lib/admin";
import { writePublicFile } from "@/lib/content/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BYTES = 2 * 1024 * 1024;
const TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

// POST /api/admin/uploads — screenshot or profile photo, stored as WebP.
export const POST = adminRoute(
  async (request) => {
    const form = await request.formData();
    const file = form.get("file");
    const kind = form.get("kind");
    if (!(file instanceof File) || (kind !== "screenshot" && kind !== "photo")) {
      throw new AdminError(400, "invalid_input", "Send an image file and its kind.");
    }
    if (!TYPES.has(file.type)) throw new AdminError(400, "invalid_input", "Use a PNG, JPEG or WebP image.");
    if (file.size > MAX_BYTES) throw new AdminError(413, "too_large", "Images must be 2 MB or smaller.");

    let image: { data: Buffer; info: { width: number; height: number } };
    try {
      image = await sharp(Buffer.from(await file.arrayBuffer()))
        .rotate()
        .resize({ width: kind === "photo" ? 640 : 1920, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer({ resolveWithObject: true });
    } catch {
      throw new AdminError(400, "invalid_input", "That file is not a readable image.");
    }
    const name = `${randomUUID().slice(0, 12)}.webp`;
    await writePublicFile(`uploads/${name}`, image.data, `content: upload ${kind} ${name} [admin]`);
    return Response.json(
      { src: `/uploads/${name}`, width: image.info.width, height: image.info.height },
      { status: 201 },
    );
  },
  { mutates: false },
);
