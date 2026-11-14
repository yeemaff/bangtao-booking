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
- **PAUSED (Nov 2026).** Supabase free plan egress hit 40.7 GB of 5.5 GB; services restricted 14 Nov, quota refills
  3 Dec 2026. Owner is pausing the Supabase project (Settings → General → Pause project) — must be restored within
  90 days (~mid Feb 2027) or only a backup download is left. Staff are on Excel. Owner wants to stay on the FREE plan;
  paying (Pro $25/mo) is the last resort. The app is treated as a closed beta; next release = "open beta".
  Supabase Logs on the free plan did not keep the bad traffic, so the cause is still unknown. Expected normal use is
  < 1 GB/month (~5,100 bookings ≈ 3 MB per full load), so 40 GB means a loop/bug.
  Done: 1.4.1 incremental reload (released); on main, unreleased: reload throttled to 1/min, id list only when counts differ.
  Plan agreed (do in this order, show in web test, release only when owner says):
  1. In-app egress meter: count bytes received from Supabase per machine per day; show in admin settings and store
     a daily total in `state` so we can see which PC/what burns quota.
  2. Daily cap / circuit breaker (e.g. 50 MB per machine per day): stop auto reloads, show a "load manually" notice.
  3. Local cache (IndexedDB): on start load from disk, then fetch only rows changed since last updated_at.
  4. Load only active bookings (e.g. checkOut ≥ 3 months ago + future); older history on demand (search/open).
  5. Realtime: stop broadcasting full rows to every client — use a light "changed" signal and fetch the delta;
     let only one designated PC run the 30-min Excel sync (others skip).
  6. Restore project after 3 Dec, test on 1–2 PCs for ~3 days watching the meter, then roll out to all.
  Fallback before paying: move to another free backend (big job, avoid if possible).
- Owner should run the latest `supabase-setup.sql` (reception edit rates/docs/todos + `repairs` view).
- Future: LINE bot for repair notifications (read `public.repairs`, push via Supabase webhook/edge function).
- The Extra bed workbook on Drive is shared "anyone with link can edit" — recommend viewer-only.
- Windows install broke once after a power cut mid-update; fallback = Setup or Portable exe from Releases.
