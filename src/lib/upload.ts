import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

// Deliberately outside /public: `next start` snapshots the public directory
// at boot and won't serve files written there afterwards. Uploaded files are
// served dynamically instead, via src/app/api/uploads/[...path]/route.ts.
export const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

const ALLOWED_EXTENSIONS: Record<string, string[]> = {
  image: ["jpg", "jpeg", "png", "webp", "heic"],
  pdf: ["pdf"],
};

function extensionOf(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return ext.replace(/[^a-z0-9]/g, "");
}

/** Saves an uploaded File to disk under uploads/{businessId}/{category}/
 * and returns the URL path (served by the /api/uploads route) to store in the database. */
export async function saveUploadedFile(
  file: File,
  businessId: string,
  category: "logos" | "fittings" | "job-photos" | "site-maps",
  kind: "image" | "pdf" = "image"
): Promise<string> {
  const ext = extensionOf(file.name);
  if (!ALLOWED_EXTENSIONS[kind].includes(ext)) {
    throw new Error(`Unsupported file type: .${ext}`);
  }

  const dir = path.join(UPLOAD_ROOT, businessId, category);
  await mkdir(dir, { recursive: true });

  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
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
