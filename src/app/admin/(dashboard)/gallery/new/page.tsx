import GalleryForm from "../gallery-form";
import { requireArea } from "@/lib/auth/session";

export default async function NewGalleryItemPage() {
  await requireArea("gallery");
  return (
    <>
      <header className="admPageHead">
        <div>
          <h1>Add a photo</h1>
        </div>
      </header>
      <GalleryForm initial={null} />
    </>
  );
}
