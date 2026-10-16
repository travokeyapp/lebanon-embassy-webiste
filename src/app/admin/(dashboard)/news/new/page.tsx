import { todayIsoDate } from "@/lib/news-dates";
import NewsForm from "../news-form";
import { requireArea } from "@/lib/auth/session";

export default async function NewNewsPage() {
  await requireArea("news");
  return (
    <>
      <header className="admPageHead">
        <div>
          <h1>New news item</h1>
          <p className="admMuted">Fill in English and Arabic, add photos, then publish.</p>
        </div>
      </header>
      <NewsForm initial={null} defaultDate={todayIsoDate()} />
    </>
  );
}
