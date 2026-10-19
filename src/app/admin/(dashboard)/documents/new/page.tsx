import DocumentForm from "../document-form";
import { requireArea } from "@/lib/auth/session";

export default async function NewDocumentPage() {
  await requireArea("documents");
  return (
    <>
      <header className="admPageHead">
        <div>
          <h1>Add a document</h1>
          <p className="admMuted">Upload a PDF or image, or link to a file elsewhere, then give it a title in both languages.</p>
        </div>
      </header>
      <DocumentForm initial={null} />
    </>
  );
}
