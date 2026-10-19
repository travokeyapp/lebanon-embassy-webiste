import { notFound } from "next/navigation";
import { getAnnouncementById } from "@/lib/content/announcements-store";
import AnnouncementForm from "../announcement-form";
import { requireArea } from "@/lib/auth/session";

export default async function EditAnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  await requireArea("announcements");
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
