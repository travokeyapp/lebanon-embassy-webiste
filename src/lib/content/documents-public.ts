import { unstable_cache } from "next/cache";
import type { DocumentRecord } from "@/lib/content/documents-schema";
import { listVisibleDocuments } from "@/lib/content/documents-store";

export const DOCUMENTS_CACHE_TAG = "documents";

// The files the site shipped with, shown until the library has entries.
export const DOCUMENT_DEFAULTS: DocumentRecord[] = [
  {
    id: "default-visa-form-pdf",
    title: { en: "Visa application form (PDF)", ar: "نموذج طلب التأشيرة (PDF)" },
    description: { en: "", ar: "" },
    category: "visa-forms",
    href: "/visa-form.pdf",
    fileName: "visa-form.pdf",
    contentType: "application/pdf",
    size: 0,
    visible: true,
    order: 0,
    createdAt: "",
    updatedAt: "",
    updatedBy: "",
  },
  {
    id: "default-visa-form-jpg",
    title: { en: "Visa application form (JPG)", ar: "نموذج طلب التأشيرة (JPG)" },
    description: { en: "", ar: "" },
    category: "visa-forms",
    href: "/visa-form.jpg",
    fileName: "visa-form.jpg",
    contentType: "image/jpeg",
    size: 0,
    visible: true,
    order: 1,
    createdAt: "",
    updatedAt: "",
    updatedBy: "",
  },
];

const cachedVisible = unstable_cache(async () => listVisibleDocuments(), ["visible-documents"], { tags: [DOCUMENTS_CACHE_TAG] });

export async function getPublicDocuments(): Promise<DocumentRecord[]> {
  try {
    const docs = await cachedVisible();
    return docs.length > 0 ? docs : DOCUMENT_DEFAULTS;
  } catch (error) {
    console.error("Loading documents failed:", error);
    return DOCUMENT_DEFAULTS;
  }
}
