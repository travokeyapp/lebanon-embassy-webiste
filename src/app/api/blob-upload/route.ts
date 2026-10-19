import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse, type NextRequest } from "next/server";
import { logAudit } from "@/lib/audit";
import { SESSION_COOKIE, verifySessionToken, type SessionUser } from "@/lib/auth/session-token";

const IMAGE_PREFIXES = ["uploads/images/", "news/images/"];
const DOCUMENT_PREFIXES = ["uploads/documents/", "news/documents/"];
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024;

// Vercel Blob client uploads. Two kinds of request arrive here:
//  - "blob.generate-client-token": sent by the editor's browser before an
//    upload; requires a valid admin session.
//  - "blob.upload-completed": sent by Vercel Blob itself after the file lands;
//    carries a signature that handleUpload verifies with BLOB_READ_WRITE_TOKEN.
// The route lives outside /api/admin on purpose so the middleware does not
// block the second kind.
export async function POST(request: NextRequest) {
  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  let session: SessionUser | null = null;
  if (body.type !== "blob.upload-completed") {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    session = token ? await verifySessionToken(token) : null;
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!session) {
          throw new Error("Unauthorized");
        }
        const isImage = IMAGE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
        const isDocument = DOCUMENT_PREFIXES.some((prefix) => pathname.startsWith(prefix));
        if (!isImage && !isDocument) {
          throw new Error("Uploads are only allowed into the uploads folders.");
        }
        return {
          allowedContentTypes: isImage
            ? ["image/jpeg", "image/png", "image/webp"]
            : ["application/pdf", "image/jpeg", "image/png", "image/webp"],
          maximumSizeInBytes: isImage ? MAX_IMAGE_BYTES : MAX_DOCUMENT_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId: session.id, userEmail: session.email }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const payload = tokenPayload ? (JSON.parse(tokenPayload) as { userId: string; userEmail: string }) : null;
        if (payload) {
          await logAudit({
            userId: payload.userId,
            userEmail: payload.userEmail,
            action: "media.upload",
            entity: "media",
            summary: blob.url,
          });
        }
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
