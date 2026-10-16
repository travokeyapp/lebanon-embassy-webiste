import Link from "next/link";
import { DOCUMENT_CATEGORY_LABELS, documentKindLabel, formatFileSize, type DocumentRecord } from "@/lib/content/documents-schema";
import { listDocuments } from "@/lib/content/documents-store";
import DocumentRowActions from "./row-actions";

export default async function DocumentsPage({ searchParams }: { searchParams: Promise<{ saved?: string | string[] }> }) {
  const query = await searchParams;
  const saved = (Array.isArray(query.saved) ? query.saved[0] : query.saved) === "1";

  let items: DocumentRecord[] = [];
  let loadError: string | null = null;
  try {
    items = await listDocuments();
  } catch (error) {
    console.error("Loading documents failed:", error);
    loadError = "Could not load documents from the database.";
  }

  return (
    <>
      <header className="admPageHead">
        <div>
          <h1>Documents &amp; forms</h1>
          <p className="admMuted">
            Files offered on the Forms &amp; Documents page. Visa forms also appear on the Visas page. Until something is
            added here the website offers the built-in visa form.
          </p>
        </div>
        <div className="admHeadActions">
          <a className="admBtn admBtnGhost" href="/en/downloads" target="_blank" rel="noreferrer">
            View page
          </a>
          <Link href="/admin/documents/new" className="admBtn admBtnPrimary">
            + Add document
          </Link>
        </div>
      </header>

      {saved ? (
        <p className="admAlert admAlertSuccess" role="status">
          Saved. Visible documents are on the website now.
        </p>
      ) : null}

      {loadError ? (
        <p className="admAlert admAlertError" role="alert">
          {loadError}
        </p>
      ) : items.length === 0 ? (
        <section className="admCard admEmpty">
          <p>No documents yet. The website currently offers the built-in visa form (PDF and JPG).</p>
          <Link href="/admin/documents/new" className="admBtn admBtnPrimary">
            Add the first document
          </Link>
        </section>
      ) : (
        <section className="admCard admTableWrap">
          <table className="admTable">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>File</th>
                <th>Status</th>
                <th className="admColActions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id}>
                  <td>
                    <Link href={`/admin/documents/${item.id}`} className="admRowTitle">
                      {item.title.en}
                    </Link>
                    {item.title.ar ? (
                      <div className="admRowSub" dir="rtl" lang="ar">
                        {item.title.ar}
                      </div>
                    ) : null}
                  </td>
                  <td className="admNowrap">{DOCUMENT_CATEGORY_LABELS[item.category].en}</td>
                  <td className="admMuted">
                    {documentKindLabel(item, "en")}
                    {item.size ? ` · ${formatFileSize(item.size)}` : ""}
                    <br />
                    <a href={item.href} target="_blank" rel="noreferrer" className="admSmall">
                      {item.fileName || "Open"}
                    </a>
                  </td>
                  <td>
                    <span className={`admBadge ${item.visible ? "admBadge-published" : "admBadge-draft"}`}>{item.visible ? "Visible" : "Hidden"}</span>
                  </td>
                  <td className="admColActions">
                    <DocumentRowActions id={item.id} title={item.title.en} visible={item.visible} isFirst={index === 0} isLast={index === items.length - 1} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}
