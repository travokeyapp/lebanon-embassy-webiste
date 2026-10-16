import { upload } from "@vercel/blob/client";
import { slugify } from "@/lib/news-schema";

// Browser-side uploads straight to Vercel Blob. The server route at
// /api/blob-upload only issues a short-lived token after checking the admin
// session, so large photos never pass through a serverless function body.

const HANDLE_UPLOAD_URL = "/api/blob-upload";
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_INPUT_BYTES = 40 * 1024 * 1024;
const MAX_PDF_BYTES = 25 * 1024 * 1024;
const MAX_IMAGE_EDGE = 1800;
const JPEG_QUALITY = 0.86;

export type UploadedImage = { src: string; width: number; height: number };

function baseName(fileName: string): string {
  return slugify(fileName.replace(/\.[^.]+$/, "")) || "file";
}

function friendlyUploadError(error: unknown): Error {
  const message = error instanceof Error ? error.message : String(error);
  if (/token/i.test(message)) {
    return new Error("Upload storage is not configured (BLOB_READ_WRITE_TOKEN). Ask the website developer.");
  }
  if (/401|unauthori[sz]ed/i.test(message)) {
    return new Error("Your session has expired. Please sign in again.");
  }
  return new Error(`Upload failed: ${message}`);
}

// Re-encodes the photo as JPEG at web size. This also applies the camera
// orientation and drops EXIF metadata (location etc.) before anything leaves
// the browser.
async function prepareImage(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("This image could not be read. Please use a JPG or PNG photo.");
  }

  try {
    const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Image processing is not available in this browser.");
    }
    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error("Could not process the image."))),
        "image/jpeg",
        JPEG_QUALITY,
      );
    });
    return { blob, width, height };
  } finally {
    bitmap.close();
  }
}

export async function uploadImageFile(file: File): Promise<UploadedImage> {
  if (!IMAGE_TYPES.includes(file.type)) {
    throw new Error("Only JPG, PNG or WEBP photos can be uploaded.");
  }
  if (file.size > MAX_IMAGE_INPUT_BYTES) {
    throw new Error("That photo is too large (maximum 40 MB).");
  }

  const { blob, width, height } = await prepareImage(file);
  try {
    const result = await upload(`news/images/${Date.now()}-${baseName(file.name)}.jpg`, blob, {
      access: "public",
      handleUploadUrl: HANDLE_UPLOAD_URL,
      contentType: "image/jpeg",
    });
    return { src: result.url, width, height };
  } catch (error) {
    throw friendlyUploadError(error);
  }
}

export async function uploadDocumentFile(file: File): Promise<{ href: string; name: string }> {
  if (file.type !== "application/pdf" && !/\.pdf$/i.test(file.name)) {
    throw new Error("Only PDF files can be attached.");
  }
  if (file.size > MAX_PDF_BYTES) {
    throw new Error("That PDF is too large (maximum 25 MB).");
  }

  try {
    const result = await upload(`news/documents/${Date.now()}-${baseName(file.name)}.pdf`, file, {
      access: "public",
      handleUploadUrl: HANDLE_UPLOAD_URL,
      contentType: "application/pdf",
    });
    return { href: result.url, name: file.name };
  } catch (error) {
    throw friendlyUploadError(error);
  }
}
