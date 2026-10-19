import AnnouncementForm from "../announcement-form";
import { requireArea } from "@/lib/auth/session";

export default async function NewAnnouncementPage() {
  await requireArea("announcements");
  return (
    <>
      <header className="admPageHead">
        <div>
          <h1>New announcement</h1>
          <p className="admMuted">It appears on every page of the website while switched on and within its dates.</p>
        </div>
      </header>
      <AnnouncementForm initial={null} />
    </>
  );
}
