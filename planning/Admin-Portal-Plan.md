# Admin Portal (CMS) Plan — Embassy of Lebanon Website

Goal: let embassy staff add and edit website content (news first, then services, notices, documents, contact details) from a password-protected admin area, without a developer touching code or git.

---

## 1) Where we are today

| Area | Where the content lives now | Who can change it |
|---|---|---|
| News & Events | `src/lib/news.ts` (`newsCatalog` array, EN + AR fields), images in `public/news/`, PDFs in `public/documents/` | Developer, via a git commit per item |
| Services cards | `src/app/[locale]/services/page.tsx` (`text` object) | Developer |
| Consular cards + workflow steps | `src/app/[locale]/consular/page.tsx` | Developer |
| Visa requirements, fees, forms | `src/app/[locale]/visas/page.tsx`, `public/visa-form.*` | Developer |
| Office hours, phones, map | `src/app/[locale]/contact/page.tsx` | Developer |
| Footer address / phone / links | `src/components/site-shell.tsx` | Developer |
| Gallery items | `src/app/[locale]/gallery/page.tsx` (placeholder data) | Developer |
| Hero slideshow images | `src/app/globals.css` (`.heroSlide*` background images) | Developer |
| Ambassador page, Relations page | Their `page.tsx` files | Developer |

Stack: Next.js 15.5 (App Router, server components), React 19, TypeScript, plain CSS (`globals.css`). No database, no auth, no file storage. One API route (`/api/contact`) that sends email via Resend with an in-memory rate limiter.

The recurring pain is the first row: the git log is mostly "Add news item ..." commits. That is what the portal must remove first.

---

## 2) Recommended approach

**Build the admin portal inside this same Next.js app, under `/admin`.** One codebase, one deploy, shared types, and the public pages can read from the database directly in server components. No separate CMS service (Strapi etc.) to host, patch, and keep in sync; that was already the Phase 1 recommendation in `Embassy-Website-Proposal.md`.

Core pieces:

| Concern | Choice | Why |
|---|---|---|
| Database | **MongoDB Atlas** via the official `mongodb` driver (decided; see section 10). The implemented document shape lives in `src/lib/news-store.ts`. |
| Auth | **Auth.js v5** (next-auth), Credentials provider (email + password, argon2/bcrypt hash), JWT session cookie, roles `ADMIN` / `EDITOR` | No public sign-up. Admin creates editor accounts. Middleware protects `/admin/*` and `/api/admin/*`. |
| File uploads | **Vercel Blob** if hosted on Vercel; otherwise S3-compatible (Cloudflare R2) or local disk on a VPS | Images and PDFs must not live in `public/` any more (that needs a rebuild). `sharp` reads width/height at upload time (the news cards need them) and strips EXIF. |
| Forms / mutations | Next.js **Server Actions** + `zod` validation | No separate REST layer to maintain; same-origin by default. |
| Publishing | `status: DRAFT | PUBLISHED`, `publishedAt`, on-demand revalidation (`revalidateTag("news")`) after every save | Public pages stay statically cached and update within seconds of clicking Publish. |
| Admin UI | Server-rendered pages + a few client components, own `admin.css` | Keep the no-Tailwind convention of the repo. |
| Audit | `AuditLog` table written by every action | "Who changed what, when" for an official site. |

Decision that must be confirmed before Phase 0: **where is the site hosted?** (No `vercel.json` / Dockerfile in the repo.)
- Vercel / serverless: Postgres (Neon) + Vercel Blob, as above.
- Single VPS: the cheapest viable option is SQLite (still via Prisma) + uploads on local disk behind `/uploads/*`. Same code, different adapter.

---

## 3) What staff will be able to manage (in priority order)

1. **News & Events** — slug (auto from EN title, editable), date, title EN/AR, excerpt EN/AR, main image + alt EN/AR, extra gallery photos, attachment (uploaded PDF *or* external link such as Facebook) with label EN/AR, draft/publish. Exactly the fields `NewsItem` has today, so the public pages do not change shape.
2. **Announcements / notice bar** (new, cheap, high value) — short EN/AR text, optional link, start/end date, on/off. Shown on the home page for emergency or holiday notices.
3. **Services cards** — title EN/AR, bullet list EN/AR, order, visible on/off.
4. **Documents & forms library** — upload PDF/JPG, title EN/AR, category (visa form, brochure, announcement), order. Replaces hand-placed files in `public/documents/`.
5. **Site settings** — address, phones, email, office hours, footer links, agency contact. One record, edited from a single form.
6. **Users** (admin only) — invite editor, deactivate, reset password.
7. Later: consular cards + workflow steps, visa requirements/fees, gallery, hero slides, ambassador message.

Everything bilingual is stored as paired `*En` / `*Ar` columns. The month label (`SEP` / `سبتمبر`) is derived from the real date with `Intl.DateTimeFormat` per locale instead of being typed by hand.

---

## 4) Data model (original Prisma sketch; implemented as MongoDB documents with the same fields, see `src/lib/news-store.ts` and `src/lib/auth/users.ts`)

```prisma
enum Role   { ADMIN EDITOR }
enum Status { DRAFT PUBLISHED }
enum MediaKind { IMAGE DOCUMENT }

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String
  passwordHash String
  role         Role     @default(EDITOR)
  active       Boolean  @default(true)
  lastLoginAt  DateTime?
  createdAt    DateTime @default(now())
}

model MediaAsset {
  id         String    @id @default(cuid())
  kind       MediaKind
  url        String            // blob / S3 / local URL
  mime       String
  size       Int
  width      Int?
  height     Int?
  altEn      String?
  altAr      String?
  uploadedBy String
  createdAt  DateTime  @default(now())
}

model NewsPost {
  id                String   @id @default(cuid())
  slug              String   @unique
  date              DateTime
  status            Status   @default(DRAFT)
  titleEn           String
  titleAr           String
  excerptEn         String
  excerptAr         String
  bodyEn            String?           // phase 3: full article for /news/[slug]
  bodyAr            String?
  imageId           String?
  image             MediaAsset? @relation("newsImage", fields: [imageId], references: [id])
  gallery           NewsGalleryImage[]
  attachmentHref    String?           // external link OR asset url
  attachmentLabelEn String?
  attachmentLabelAr String?
  publishedAt       DateTime?
  createdById       String
  updatedById       String
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model NewsGalleryImage {
  newsId  String
  assetId String
  order   Int
  @@id([newsId, assetId])
}

model Announcement {
  id        String   @id @default(cuid())
  textEn    String
  textAr    String
  linkHref  String?
  startsAt  DateTime?
  endsAt    DateTime?
  active    Boolean  @default(true)
}

model ServiceCard {
  id       String  @id @default(cuid())
  order    Int
  titleEn  String
  titleAr  String
  itemsEn  Json    // string[]
  itemsAr  Json
  visible  Boolean @default(true)
}

model Document {
  id        String   @id @default(cuid())
  titleEn   String
  titleAr   String
  category  String   // visa-form | brochure | announcement | other
  assetId   String
  order     Int
  visible   Boolean  @default(true)
}

model SiteSetting {   // single row, key = "site"
  key       String @id
  value     Json   // { address: {en, ar}, phones: [...], email, officeHours: {en: [], ar: []}, footerLinks: [...] }
  updatedAt DateTime @updatedAt
}

model AuditLog {
  id        String   @id @default(cuid())
  userId    String
  action    String   // news.create | news.publish | settings.update ...
  entity    String
  entityId  String?
  diff      Json?
  createdAt DateTime @default(now())
}
```

---

## 5) Code layout

```
middleware.ts                              ← redirects unauthenticated /admin/* to /admin/login
prisma/schema.prisma
prisma/seed.ts                             ← imports existing newsCatalog + services text + settings, creates first admin

src/lib/db.ts                              ← Prisma client singleton
src/lib/auth.ts                            ← Auth.js config, role helpers (requireAdmin, requireEditor)
src/lib/storage.ts                         ← upload(file) → { url, width, height, mime, size }; adapter per host
src/lib/content/news.ts                    ← getPublishedNews(locale), getNewsBySlug(); keeps pagination helpers from src/lib/news.ts
src/lib/content/services.ts
src/lib/content/announcements.ts
src/lib/content/settings.ts

src/actions/news.ts                        ← server actions: save, publish, unpublish, delete (+ zod schemas, audit log, revalidateTag)
src/actions/services.ts, announcements.ts, documents.ts, settings.ts, users.ts

src/app/admin/login/page.tsx
src/app/admin/(dashboard)/layout.tsx       ← sidebar, session check, noindex
src/app/admin/(dashboard)/page.tsx         ← dashboard: drafts, recent edits, quick "New news item"
src/app/admin/(dashboard)/news/page.tsx            ← list, filter by status, search
src/app/admin/(dashboard)/news/new/page.tsx
src/app/admin/(dashboard)/news/[id]/page.tsx       ← edit form (EN | AR tabs, image dropzone, gallery, attachment)
src/app/admin/(dashboard)/announcements/page.tsx
src/app/admin/(dashboard)/services/page.tsx
src/app/admin/(dashboard)/documents/page.tsx
src/app/admin/(dashboard)/settings/page.tsx
src/app/admin/(dashboard)/users/page.tsx           ← admin only
src/app/admin/admin.css

src/app/api/admin/upload/route.ts          ← multipart upload, auth-checked, type/size-limited
src/app/api/admin/preview/route.ts         ← enables draft preview cookie for /[locale]/news?preview=1

src/components/admin/*                     ← BilingualField, ImageDropzone, StatusBadge, ConfirmDelete, SlugField
```

Public pages change only their data source: `getNewsForLocale(locale)` becomes `await getPublishedNews(locale)` in `src/app/[locale]/page.tsx` and `src/app/[locale]/news/page.tsx`; `services/page.tsx` reads `ServiceCard` rows; `site-shell.tsx` and `contact/page.tsx` read `SiteSetting`. Markup and CSS stay as they are.

---

## 6) Editor experience (what staff see)

- Login at `/admin/login` (email + password). Sessions expire after 12 h of inactivity.
- Left sidebar: Dashboard · News · Announcements · Services · Documents · Settings · Users (admins only).
- News editor: two columns or tabs **English | العربية**; Arabic inputs render RTL. Slug auto-fills from the English title. Date picker. Drag-and-drop image upload shows a thumbnail immediately. "Save draft" and "Publish" are separate buttons; "Preview" opens the public page with drafts visible.
- Lists show status badge, date, last edited by. Delete asks for confirmation and is a soft delete (`status` → archived) so nothing is lost by accident.
- Publishing is instant on the public site (tag revalidation), no rebuild or deploy.

---

## 7) Security checklist

- All `/admin` and `/api/admin` routes behind middleware + per-action role check (never trust the UI alone).
- Passwords hashed with argon2id; minimum 12 characters; login rate-limited (reuse the pattern in `src/app/api/contact/route.ts`, backed by the DB rather than memory if on serverless).
- Uploads: allowlist `image/jpeg`, `image/png`, `image/webp`, `application/pdf`; max 10 MB; images re-encoded by `sharp` (strips metadata, blocks polyglot files); files served from storage, never executed.
- `robots: noindex` + `X-Robots-Tag` on `/admin`; `Cache-Control: no-store` on admin pages.
- Secrets only in env vars: `DATABASE_URL`, `AUTH_SECRET`, storage token. Update `.env.example`.
- Audit log on every mutation; admins can view it under Settings → Activity.
- Optional phase 3: TOTP two-factor for admins, IP allowlist for `/admin`.
- Backups: provider automatic daily DB backups + a weekly `pg_dump`/export job; storage bucket versioning on.

---

## 8) Migration of existing content

`prisma/seed.ts` runs once against the new database:
1. Reads the current `newsCatalog` from `src/lib/news.ts`, uploads each referenced file from `public/news/` and `public/documents/` to storage, creates `MediaAsset` + `NewsPost` rows as `PUBLISHED`. Dates come from the existing `day`/`month` plus the year in the slug.
2. Seeds `ServiceCard` from the `services/page.tsx` text, and `SiteSetting` from `site-shell.tsx` + `contact/page.tsx`.
3. Creates the first `ADMIN` user from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` env vars.

After the seed is verified on the live site, `newsCatalog` and the hardcoded objects are deleted from the code.

---

## 9) Delivery phases and rough effort

| Phase | Scope | Effort |
|---|---|---|
| **0. Foundation** | Confirm hosting; create DB + storage; add Prisma, Auth.js, zod, sharp; schema + first migration; `.env.example`; middleware; login page; first admin via seed | ~1 day |
| **1. News (ship this first)** | News list/new/edit, uploads, draft/publish/preview, audit log; public home + news pages read from DB with tag revalidation; seed existing news; remove `newsCatalog` | ~2 days |
| **2. The rest of the editable content** | Announcements bar on home, Services, Documents library, Site settings (hours/phones/footer), Users management, activity view | ~1.5–2 days |
| **3. Hardening + handover** | Security pass (headers, rate limits, upload limits), backups, short staff handbook (EN/AR screenshots), 30-min training | ~1 day |
| **Later (optional)** | Consular/visa pages, gallery, hero slides, ambassador message editable; full article body + `/news/[slug]` detail pages with a rich-text editor (Tiptap); 2FA; content versioning/rollback | as needed |

Phase 1 alone already removes the "developer commits every news item" problem and is a safe first release.

---

## 10) Decisions (confirmed 16 Oct 2026)

1. **Hosting**: Vercel. Storage adapters: MongoDB Atlas + Vercel Blob.
2. **Database**: MongoDB (native driver, no ORM).
3. **Users**: 1 or 2 editors for now; accounts are created with `npm run admin:create-user`, a user-management screen comes later.
4. **Delivery order**: news editor first (done in Phase 1), everything else afterwards.
5. Still open: whether Arabic is typed by staff (current assumption, both languages required to publish; drafts can be English-only) and whether news needs a full detail page.

---

## 11) New dependencies

`@prisma/client`, `prisma`, `next-auth@5`, `@node-rs/argon2` (or `bcryptjs`), `zod`, `sharp`, `@vercel/blob` (or `@aws-sdk/client-s3`), `tsx` (for the seed script). No UI framework; admin styles live in `src/app/admin/admin.css` alongside the existing CSS approach.
