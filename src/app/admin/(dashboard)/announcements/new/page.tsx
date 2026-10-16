import AnnouncementForm from "../announcement-form";

export default function NewAnnouncementPage() {
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
