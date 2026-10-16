import GalleryForm from "../gallery-form";

export default function NewGalleryItemPage() {
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
