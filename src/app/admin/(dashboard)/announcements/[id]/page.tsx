import { notFound } from "next/navigation";
import { getAnnouncementById } from "@/lib/content/announcements-store";
import AnnouncementForm from "../announcement-form";

export default async function EditAnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await getAnnouncementById(id);
  if (!record) {
    notFound();
  }
  return (
    <>
      <header className="admPageHead">
        <div>
          <h1>Edit announcement</h1>
        </div>
      </header>
      <AnnouncementForm initial={record} />
    </>
  );
}
