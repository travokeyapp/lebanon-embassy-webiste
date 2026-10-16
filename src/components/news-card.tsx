import Link from "next/link";
import HydrationSafeImage from "@/components/hydration-safe-image";
import type { NewsItem } from "@/lib/news-item";

type NewsCardProps = {
  item: NewsItem;
  // When set, the title links to this address (home page). Otherwise plain text.
  titleHref?: string;
  // The archive page shows the extra photos; the home page does not.
  showGallery?: boolean;
  id?: string;
};

// The news card as shown on the public site. Also used by the admin preview,
// so any change here is reflected in both places.
export default function NewsCard({ item, titleHref, showGallery = false, id }: NewsCardProps) {
  return (
    <article className="newsItem" id={id}>
      <div className="dateBox">
        <span>{item.month}</span>
        <strong>{item.day}</strong>
      </div>

      <div>
        <h4>
          {titleHref ? (
            <Link className="newsTitleLink" href={titleHref}>
              {item.title}
            </Link>
          ) : (
            item.title
          )}
        </h4>
        <p>{item.excerpt}</p>
        {item.image ? (
          <HydrationSafeImage
            className="newsImage"
            src={item.image.src}
            alt={item.image.alt}
            width={item.image.width}
            height={item.image.height}
            sizes="(max-width: 720px) 92vw, 620px"
          />
        ) : null}
        {showGallery && item.gallery && item.gallery.length > 0 ? (
          <div className="newsGallery">
            {item.gallery.map((photo) => (
              <HydrationSafeImage
                className="newsImage"
                key={photo.src}
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                sizes="(max-width: 720px) 31vw, 200px"
              />
            ))}
          </div>
        ) : null}
        {item.attachment ? (
          <a className="newsAttachmentLink" href={item.attachment.href} target="_blank" rel="noreferrer">
            {item.attachment.label}
          </a>
        ) : null}
      </div>
    </article>
  );
}
