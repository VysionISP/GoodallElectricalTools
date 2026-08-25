import { NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";
import { auth } from "@/auth";
import { UPLOAD_ROOT, SHARED_UPLOAD_SCOPE } from "@/lib/upload";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  pdf: "application/pdf",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { path: segments } = await params;
  const [businessId, category, filename] = segments;

  // Shared fitting-model catalog photos are visible to every logged-in
  // user, not just the business that uploaded them — everything else stays
  // scoped strictly to the requester's own business.
  const isShared = businessId === SHARED_UPLOAD_SCOPE;

  if (
    !businessId ||
    !category ||
    !filename ||
    segments.length !== 3 ||
    (!isShared && businessId !== session.user.businessId)
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const filePath = path.join(UPLOAD_ROOT, businessId, category, filename);

  // Defend against path traversal even though segments come pre-split.
  if (!filePath.startsWith(path.join(UPLOAD_ROOT, businessId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await stat(filePath);
    const buffer = await readFile(filePath);
    const ext = filename.split(".").pop()?.toLowerCase() ?? "";
    const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
