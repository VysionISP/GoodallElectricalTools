import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";

// Deliberately outside /public: `next start` snapshots the public directory
// at boot and won't serve files written there afterwards. Uploaded files are
// served dynamically instead, via src/app/api/uploads/[...path]/route.ts.
export const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

// Source formats accepted from the browser. Photos are always re-encoded to
// JPEG on write (see below) — @react-pdf/renderer can only embed JPEG/PNG,
// so HEIC (the default on iPhone/Mac photo pickers) and WebP would otherwise
// upload fine but silently fail to appear in generated PDF reports.
const ALLOWED_EXTENSIONS: Record<string, string[]> = {
  image: ["jpg", "jpeg", "png", "webp", "heic", "heif", "gif"],
  pdf: ["pdf"],
};

function extensionOf(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return ext.replace(/[^a-z0-9]/g, "");
}

// Reserved "businessId" folder for shared/global fitting-model catalog
// photos — visible to every business, not just whoever uploaded it. See
// the businessId === SHARED_UPLOAD_SCOPE check in the uploads API route.
export const SHARED_UPLOAD_SCOPE = "shared";

/** Saves an uploaded File to disk under uploads/{businessId}/{category}/
 * and returns the URL path (served by the /api/uploads route) to store in the database.
 * Images are normalized to JPEG (and auto-rotated per EXIF orientation) so
 * every format the browser can hand us is guaranteed to render both on the
 * web and inside generated PDF reports. Pass SHARED_UPLOAD_SCOPE as
 * businessId for a shared catalog entry's photo instead of a real business id. */
export async function saveUploadedFile(
  file: File,
  businessId: string,
  category: "logos" | "customer-logos" | "fittings" | "job-photos" | "site-maps" | "fitting-models",
  kind: "image" | "pdf" = "image"
): Promise<string> {
  const sourceExt = extensionOf(file.name);
  if (!ALLOWED_EXTENSIONS[kind].includes(sourceExt)) {
    throw new Error(`Unsupported file type: .${sourceExt}`);
  }

  const dir = path.join(UPLOAD_ROOT, businessId, category);
  await mkdir(dir, { recursive: true });

  const sourceBuffer = Buffer.from(await file.arrayBuffer());

  let ext = sourceExt;
  let buffer: Buffer = sourceBuffer;
  if (kind === "image") {
    ext = "jpg";
    try {
      buffer = await sharp(sourceBuffer).rotate().jpeg({ quality: 85 }).toBuffer();
    } catch {
      throw new Error("Could not process that image — try a JPEG or PNG instead.");
    }
  }

  const filename = `${randomUUID()}.${ext}`;
  await writeFile(path.join(dir, filename), buffer);

  return `/api/uploads/${businessId}/${category}/${filename}`;
}

/** Deletes a previously uploaded file given its URL path, scoped to the business. */
export async function deleteUploadedFile(businessId: string, filePath: string | null | undefined) {
  if (!filePath) return;
  const prefix = `/api/uploads/${businessId}/`;
  if (!filePath.startsWith(prefix)) return; // only allow deleting within this business's own folder
  const rel = filePath.slice("/api/uploads/".length);
  const absolutePath = path.join(UPLOAD_ROOT, rel);
  try {
    await unlink(absolutePath);
  } catch {
    // ignore if already missing
  }
}
