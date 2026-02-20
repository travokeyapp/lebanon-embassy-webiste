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
