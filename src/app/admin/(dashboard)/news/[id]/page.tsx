import { notFound } from "next/navigation";
import { getNewsById } from "@/lib/news-store";
import NewsForm from "../news-form";

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await getNewsById(id);
  if (!record) {
    notFound();
  }

  return (
    <>
      <header className="admPageHead">
        <div>
          <h1>Edit news item</h1>
          <p className="admMuted">
            {record.status === "published"
              ? "This item is live on the website."
              : "This item is a draft and is not shown on the website."}
          </p>
        </div>
      </header>
      <NewsForm initial={record} defaultDate={record.date} />
    </>
  );
}
