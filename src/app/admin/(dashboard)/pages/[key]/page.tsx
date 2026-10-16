import { notFound } from "next/navigation";
import { PAGE_DEFS, isPageKey, mergePageContent, type PageContent } from "@/lib/content/page-schema";
import { PAGE_DEFAULTS } from "@/lib/content/pages-public";
import { getStoredPage } from "@/lib/content/pages-store";
import { formatAdminDateTime } from "@/lib/news-dates";
import PageContentForm from "./page-content-form";

export default async function EditPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!isPageKey(key)) {
    notFound();
  }
  const def = PAGE_DEFS[key];
  const defaults = PAGE_DEFAULTS[key];

  let content: PageContent = defaults;
  let savedInfo: string | null = null;
  let loadError: string | null = null;
  try {
    const stored = await getStoredPage(key);
    if (stored) {
      content = mergePageContent(defaults, stored.content);
      savedInfo = `Last saved ${formatAdminDateTime(stored.updatedAt.toISOString())} by ${stored.updatedBy}.`;
    } else {
      savedInfo = "Showing the original website text. Saving creates the editable copy.";
    }
  } catch (error) {
    console.error(`Loading page "${key}" for admin failed:`, error);
    loadError = "Could not load the saved version from the database; showing the original text. Saving will fail until the database is reachable.";
  }

  return (
    <>
      <header className="admPageHead">
        <div>
          <h1>{def.label}</h1>
          <p className="admMuted">{def.description}</p>
          {savedInfo ? <p className="admMuted admSmall">{savedInfo}</p> : null}
        </div>
        <a className="admBtn admBtnGhost" href={`/en${def.publicPath}`} target="_blank" rel="noreferrer">
          View page
        </a>
      </header>
      {loadError ? (
        <p className="admAlert admAlertError" role="alert">
          {loadError}
        </p>
      ) : null}
      <PageContentForm def={def} initial={content} defaults={defaults} />
    </>
  );
}
