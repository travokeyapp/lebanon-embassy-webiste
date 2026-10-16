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

## Admin Portal (news editor)

Embassy staff manage **News & Events** at `/admin` (sign in at `/admin/login`). Items are stored in MongoDB and
photos/PDFs in Vercel Blob; publishing updates the public site immediately, no deploy needed.

### One-time setup
1. **MongoDB**: create a free cluster on MongoDB Atlas, add a database user, and allow access from anywhere
   (`0.0.0.0/0`, required for Vercel). Copy the connection string into `MONGODB_URI`.
2. **Session secret**: run `openssl rand -base64 48` and put the result in `AUTH_SECRET`.
3. **File storage**: in the Vercel project open *Storage → Create → Blob* and connect it to this project. Vercel adds
   `BLOB_READ_WRITE_TOKEN` automatically.
4. Add `MONGODB_URI`, `MONGODB_DB`, and `AUTH_SECRET` to the Vercel project environment variables and redeploy.
5. Locally: copy `.env.example` to `.env.local` and fill the same values (or run `vercel env pull .env.local`).
6. **Import the existing news** once (reads the values from `.env.local`):
   ```bash
   npm run admin:seed-news
   ```
7. **Create the first login**:
   ```bash
   npm run admin:create-user -- --email editor@lebanonembassy.pk --name "Editor Name"
   ```
   A random password is printed once. Staff can change it later under *My account*.
   To reset a forgotten password: `npm run admin:create-user -- --email editor@lebanonembassy.pk --reset`.

### Day to day
- `/admin/news`: list of items with status (Draft / Published), edit, publish, unpublish, delete.
- Each item has English and Arabic title and text, a date, a main photo, optional extra photos, and an optional
  attachment (uploaded PDF or an external link). Photos are resized in the browser before upload.
- Both languages are required to publish; drafts can be saved with English only.
