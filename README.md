# Lebanon Embassy Website (Phase 1)

Initial **Next.js** implementation for the Embassy of Lebanon website.

## Included in Phase 1 kickoff
- Next.js App Router project scaffold (TypeScript)
- Lebanon-themed responsive layout (red / white / green)
- Bilingual route structure (`/en`, `/ar`) with RTL support for Arabic
- Core public pages:
  - Home
  - About
  - Services
  - Contact

## Run locally
```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Contact Form Email Setup (Resend)
1. Create a Resend account and verify your sending domain (for current setup: `lebanonembassy.pk`).
2. Copy `.env.example` to `.env.local` and fill the values.
3. Keep `CONTACT_FROM_EMAIL` on the verified sending domain (for example: `noreply@lebanonembassy.pk`).
4. Keep `CONTACT_TO_EMAIL` as the embassy mailbox that receives submissions.
5. Set `CONTACT_WEBSITE_URL` for links shown in email footer.

The API route sends with:
- `From`: configured no-reply sender
- `To`: embassy recipient mailbox
- `Reply-To`: visitor email from the form

## Admin Portal

Embassy staff manage the website at `/admin` (sign in at `/admin/login`). Content is stored in MongoDB and
photos/PDFs in Vercel Blob; every save updates the public site within seconds, no deploy needed.

### What can be managed
| Section | What it controls |
|---|---|
| Dashboard | Figures, quick actions, recent activity |
| News & Events | Home page news and the news archive: bilingual title and text, date, photos, PDF or link, draft/publish, live preview |
| Announcements | A notice strip under the header on every page, with optional link, dates and on/off switch |
| Home banners | The two slideshows at the top of the home page (4 Pakistan + 4 Lebanon pictures with captions) |
| Documents & forms | Files on the Forms & Documents page (`/downloads`); visa forms also appear on the Visas page |
| Gallery | Photos on the Gallery page, by collection |
| Pages | Text of Services, Consular, Visas, The Ambassador (and portraits), Relations, About. The recommended-agency (Crown International Travels) cards and footer block are fixed in code and not editable |
| Contact & footer | Address, phones, fax, email, office hours, map, top ribbon, footer text and related links |
| Staff accounts | Administrators add editors/administrators, reset passwords, deactivate accounts |
| My account | Change your own password; full activity log |

Pages start with the wording the site shipped with (`src/lib/content/defaults/*.json`) and keep it until
someone saves a change. If the database is ever unreachable the public site falls back to that wording and to
an empty news list, so it stays up.

Roles and permissions: **administrators** can change everything and manage staff accounts. **Editors** can be
limited to any combination of sections (News, Announcements, Home banners, Documents, Gallery, Pages, Contact &
footer); an administrator sets this when creating the account and can change it later from *Staff accounts*. A
limit applies to the menu, the pages and the save actions. Deactivating someone, resetting a password or changing
permissions signs them out immediately.

### One-time setup
1. **MongoDB**: create a free cluster on MongoDB Atlas, add a database user, and under *Network Access* allow
   `0.0.0.0/0` (required for Vercel). Copy the connection string into `MONGODB_URI`. Prefer a cluster in AWS
   N. Virginia (us-east-1), the same region as the Vercel function.
2. **Session secret**: run `openssl rand -base64 48` (or `node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"`)
   and put the result in `AUTH_SECRET`.
3. **File storage**: in the Vercel project open *Storage → Create → Blob* (public access) and connect it to this
   project. Vercel adds `BLOB_READ_WRITE_TOKEN` automatically.
4. Add `MONGODB_URI`, `MONGODB_DB`, and `AUTH_SECRET` to the Vercel project environment variables (Production
   and Preview) and redeploy.
5. Locally: copy `.env.example` to `.env.local` and fill the same values (or run `vercel env pull .env.local`).
6. **Import the existing news** once (reads the values from `.env.local`):
   ```bash
   npm run admin:seed-news
   ```
7. **Create the first administrator**:
   ```bash
   npm run admin:create-user -- --email editor@lebanonembassy.pk --name "Editor Name"
   ```
   A random password is printed once. Further accounts are created from *Staff accounts* in the admin.
   To reset a forgotten password from the command line: `npm run admin:create-user -- --email editor@lebanonembassy.pk --reset`.
8. If the public site showed "No news for now" before the import, sign in and click **Refresh website** on the
   News & Events page.

### Day to day
- Both languages are required to publish a news item; drafts can be saved with English only.
- Photos are resized in the browser before upload; banners up to 2400 px wide, other photos 1800 px.
- Every editor has a **Restore original text** button that reloads the shipped wording into the form (nothing is
  saved until you click Save).
- Deleting an item does not delete its uploaded file from storage.
