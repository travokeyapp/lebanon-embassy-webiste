import { notFound } from "next/navigation";
import { getDocumentById } from "@/lib/content/documents-store";
import DocumentForm from "../document-form";

export default async function EditDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await getDocumentById(id);
  if (!record) {
    notFound();
  }
  return (
    <>
      <header className="admPageHead">
        <div>
          <h1>Edit document</h1>
        </div>
      </header>
      <DocumentForm initial={record} />
    </>
  );
}
