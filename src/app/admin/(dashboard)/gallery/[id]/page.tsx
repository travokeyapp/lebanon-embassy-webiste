import { notFound } from "next/navigation";
import { getGalleryItemById } from "@/lib/content/gallery-store";
import GalleryForm from "../gallery-form";
import { requireArea } from "@/lib/auth/session";

export default async function EditGalleryItemPage({ params }: { params: Promise<{ id: string }> }) {
  await requireArea("gallery");
  const { id } = await params;
  const record = await getGalleryItemById(id);
  if (!record) {
    notFound();
  }
  return (
    <>
      <header className="admPageHead">
        <div>
          <h1>Edit photo</h1>
        </div>
      </header>
      <GalleryForm initial={record} />
    </>
  );
}
