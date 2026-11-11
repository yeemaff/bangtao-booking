# Bangtao Village Booking — handoff notes

Booking / front-desk app for Bangtao Village Resort (Phuket). Thai UI. Electron desktop app (Windows + Mac Apple silicon)
on a Supabase backend. Owner: คุณกิด (role "ผู้ดูแล"). Talk to the owner in Thai, plain language, no jargon.

## Layout
- `main.js` — Electron main: window, auto-update (Windows: electron-updater/NSIS; Mac: custom zip swap because the app is
  unsigned), native print/PDF, Google Drive download for the Excel sync (`bv-fetch-sheet`, Google hosts only).
- `preload.js` — `window.bvDesktop` bridge.
- `renderer/store.js` — Supabase client, realtime, self-healing reconnect, put/merge/del/putMany, undo tracking.
  All data lives in one table `docs(col, id, data)`; collections: rooms, bookings, finance, guests, ops, state,
  settings, log, files, todos, tododone, repairs.
- `renderer/parser.js` — reads the hotel's Booking Schedule .xlsx (cells, merged ranges, fill colours → channel).
- `renderer/app.js` — the whole UI. Sections are marked `/* ===== NAME ===== */` (CHART, BOOKING FORM, RATE CARD,
  ONE-WAY SYNC, REPAIRS, EXTRA BEDS & COTS inside the booking chart, notifications …).
- `renderer/styles.css` — base styles, then later override blocks (visual refresh v1.4, motion). Later rules win.
- `supabase-setup.sql` — schema + RLS. The owner runs it by hand in the Supabase SQL editor.

## Releasing
Bump `version` in package.json AND `VERSION` in renderer/app.js, push to `main`.
`.github/workflows/release.yml` builds Windows (NSIS) + Mac arm64 zip and publishes release `vX.Y.Z`;
installed apps update themselves. Claude sessions cannot create releases directly (403) — the workflow does it.
Always show changes in the web test first and release only when the owner says so.

## Rules agreed with the owner
- Excel → app only. Never write back to the Google Sheet. Sheet edits win; app-only edits are kept and listed as
  "ไม่ตรงกับ Excel". Synced every 30 min: bookings, airport-transfer tables, and the separate
  "Booking _Extra bed_Baby cot" workbook. Room prices are entered by hand (not synced).
- Never use or ask for the Supabase service_role / secret key. The BV1: connection code stays inside the hotel.
- Staff ("พนักงาน") have no finance back-office access; Admin ("manager") has everything except connection
  settings and user management; owner ("admin") has all. Never show staff wording that hints at admin-only features.
- Taxi status: only "ยังไม่จอง" / "เสร็จแล้ว". To-dos have no assignee. Repairs = small icon + chips on the daily page.
- Look: neutral light/dark, soft green accent, no black filled buttons, minimal colours. The owner tried and rejected
  the hotel orange (#d88232), warm/cream and navy+brass palettes — don't bring them back unasked.
- Motion: pages rise in from below (same everywhere), rolling numbers on headline stats, sliding highlight in menu and
  calendar. Respect prefers-reduced-motion.

## Open items / ideas
- Nov 2026: Supabase free plan egress blew past quota (20 GB of 5.5 GB); project restricted after 13 Nov. Owner paused
  the app ("closed beta"), staff back on Excel. Plan: fix what's needed, then one "open beta" release.
  Egress fixes so far: 1.4.1 incremental reload; on main (unreleased): reload throttled to 1/min + id list only when
  counts differ. Still unknown which traffic dominated — check Usage dashboard / API logs before the next release.
  Realtime broadcasts of full booking rows to every client are the next suspect.
- Owner should run the latest `supabase-setup.sql` (reception edit rates/docs/todos + `repairs` view).
- Future: LINE bot for repair notifications (read `public.repairs`, push via Supabase webhook/edge function).
- The Extra bed workbook on Drive is shared "anyone with link can edit" — recommend viewer-only.
- Windows install broke once after a power cut mid-update; fallback = Setup or Portable exe from Releases.
