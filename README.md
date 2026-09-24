# Nikah & Valima — a scroll-told wedding invitation

A cinematic, scroll-driven wedding invite built with Next.js, React Three Fiber and drei.
The story unfolds as guests scroll:

1. **Bismillah** — the couple's names condense out of a low-poly cloudscape.
2. **The Nikah** — the camera descends to a mosque in warm afternoon light.
3. **Inside the masjid** — the imam, groom and bride before the mihrab with the congregation; the Nikah date, time and location sit beside the scene.
4. **The Valima** — the sun sets as the camera flies to a function hall glowing with fairy lights.
5. **The reception** — inside, the groom in a dark brown suit and the bride in a red bridal lehenga on a floral stage, with the Valima venue details.
6. **RSVP** — "You are heartily invited": guests confirm Nikah, Valima, both, or regrets, and the reply is written to your Google Form / Google Sheet.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Personalise the invitation

Everything guest-facing lives in [`src/data/wedding.ts`](src/data/wedding.ts) — names, parents, city,
hashtag, and the date / time / venue / address / map link for both events. Edit that one file and the
3D captions, detail cards, page metadata and RSVP copy all update.

Colours for the couple's outfits and the buildings are set inline in `src/components/scene/*.tsx`.

## Saving RSVPs to Google Forms / Google Sheets

RSVPs are posted to `POST /api/rsvp` (see [`src/app/api/rsvp/route.ts`](src/app/api/rsvp/route.ts)),
which forwards them server-side to Google, so your form ids never reach the browser. Two
destinations are supported — use either or both. Copy `.env.example` to `.env.local` and fill it in.

### Option A — Google Form (responses land in its linked Sheet)

1. Create a Google Form with these **short answer** questions (any order):
   `Name`, `Phone`, `Guests`, `Attending`, `Message`. (Short-answer fields accept any value; if you
   prefer a multiple-choice "Attending" question, its options must be exactly
   `Both Nikah & Valima`, `Nikah only`, `Valima only`, `Unable to attend`.)
2. In the form, open **Responses → Link to Sheets** to create the Google Sheet that collects replies.
3. Click the **⋮ menu → Get pre-filled link**, type anything in every field and press **Get link**.
   The URL that is copied looks like
   `https://docs.google.com/forms/d/e/1FAIpQL.../viewform?usp=pp_url&entry.1234=Name&entry.5678=Phone…`
4. Set the env vars:

```env
GOOGLE_FORM_ACTION_URL=https://docs.google.com/forms/d/e/1FAIpQL.../viewform
GOOGLE_FORM_ENTRY_NAME=entry.1234
GOOGLE_FORM_ENTRY_PHONE=entry.5678
GOOGLE_FORM_ENTRY_GUESTS=entry.2345
GOOGLE_FORM_ENTRY_ATTENDING=entry.3456
GOOGLE_FORM_ENTRY_MESSAGE=entry.4567
```

`GOOGLE_FORM_ACTION_URL` may be the `viewform` link, the `formResponse` link, or just the form id —
it is normalised automatically. Entry ids may be given with or without the `entry.` prefix.

### Option B — Google Apps Script web app writing straight into a Sheet

1. Open your Google Sheet → **Extensions → Apps Script** and paste:

```js
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const d = JSON.parse(e.postData.contents);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Submitted at", "Name", "Phone", "Guests", "Attending", "Message"]);
  }
  sheet.appendRow([d.submittedAt, d.name, d.phone, d.guests, d.attendingLabel, d.message]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(
    ContentService.MimeType.JSON
  );
}
```

2. **Deploy → New deployment → Web app**, execute as *Me*, access *Anyone*, and copy the URL.
3. Set `GOOGLE_SHEETS_WEBAPP_URL=https://script.google.com/macros/s/.../exec`.

When neither destination is configured the API answers `503` and the form shows a friendly error,
so nothing is silently lost. Replies containing the hidden honeypot field are ignored.

## Scripts

- `npm run dev` — development server
- `npm run build` / `npm start` — production build
- `npm run lint` — ESLint

## Deploy

Deploy on [Vercel](https://vercel.com/new) and add the environment variables above in the project
settings.
