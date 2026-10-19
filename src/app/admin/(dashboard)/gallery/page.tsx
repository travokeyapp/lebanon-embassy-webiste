import Link from "next/link";
import { GALLERY_COLLECTION_LABELS, type GalleryRecord } from "@/lib/content/gallery-schema";
import { listGalleryItems } from "@/lib/content/gallery-store";
import GalleryRowActions from "./row-actions";
import { requireArea } from "@/lib/auth/session";

export default async function GalleryAdminPage({ searchParams }: { searchParams: Promise<{ saved?: string | string[] }> }) {
  await requireArea("gallery");
  const query = await searchParams;
  const saved = (Array.isArray(query.saved) ? query.saved[0] : query.saved) === "1";

  let items: GalleryRecord[] = [];
  let loadError: string | null = null;
  try {
    items = await listGalleryItems();
  } catch (error) {
    console.error("Loading gallery failed:", error);
    loadError = "Could not load the gallery from the database.";
  }

  return (
    <>
      <header className="admPageHead">
        <div>
          <h1>Gallery</h1>
          <p className="admMuted">Photos on the Gallery page, grouped by collection. Until photos are added the page shows illustrative placeholder cards.</p>
        </div>
        <div className="admHeadActions">
          <a className="admBtn admBtnGhost" href="/en/gallery" target="_blank" rel="noreferrer">
            View page
          </a>
          <Link href="/admin/gallery/new" className="admBtn admBtnPrimary">
            + Add photo
          </Link>
        </div>
      </header>

      {saved ? (
        <p className="admAlert admAlertSuccess" role="status">
          Saved. Visible photos are on the website now.
        </p>
      ) : null}

      {loadError ? (
        <p className="admAlert admAlertError" role="alert">
          {loadError}
        </p>
      ) : items.length === 0 ? (
        <section className="admCard admEmpty">
          <p>No photos yet.</p>
          <Link href="/admin/gallery/new" className="admBtn admBtnPrimary">
            Add the first photo
          </Link>
        </section>
      ) : (
        <section className="admCard admTableWrap">
          <table className="admTable">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Title</th>
                <th>Collection</th>
                <th>Status</th>
                <th className="admColActions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id}>
                  <td>
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="admThumb admThumbSmall" src={item.image.src} alt="" />
                    ) : null}
                  </td>
                  <td>
                    <Link href={`/admin/gallery/${item.id}`} className="admRowTitle">
                      {item.title.en}
                    </Link>
                    <div className="admRowSub">{item.date.en}</div>
                  </td>
                  <td className="admNowrap">{GALLERY_COLLECTION_LABELS[item.collection].en}</td>
                  <td>
                    <span className={`admBadge ${item.visible ? "admBadge-published" : "admBadge-draft"}`}>{item.visible ? "Visible" : "Hidden"}</span>
                  </td>
                  <td className="admColActions">
                    <GalleryRowActions id={item.id} title={item.title.en} visible={item.visible} isFirst={index === 0} isLast={index === items.length - 1} />
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
