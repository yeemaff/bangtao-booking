/* Reads the old Excel booking chart (merged cells = stays) */
const XP = (() => {
  const MONTHS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
  const p2 = n => String(n).padStart(2, '0');
  const addD = (s, n) => { const [y,m,d] = s.split('-').map(Number); const t = new Date(Date.UTC(y, m-1, d + n)); return `${t.getUTCFullYear()}-${p2(t.getUTCMonth()+1)}-${p2(t.getUTCDate())}`; };
  function monthLabel(txt) {
    if (txt == null) return null;
    const s = String(txt).toLowerCase();
    const mm = s.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/);
    if (!mm) return null;
    const m = MONTHS.indexOf(mm[1]);
    const ym = s.match(/(\d{4}|\d{2})/);
    let y = null;
    if (ym) { y = +ym[1]; if (y < 100) y += 2000; if (y < 2000 || y > 2100) y = null; }
    return { m, y };
  }
  function fillOf(c) {
    const s = c && c.s; if (!s || !s.patternType || s.patternType === 'none') return null;
    const f = s.fgColor || {};
    if (f.theme === 0 && !f.tint) return null; // the sheet's plain white background
    const k = f.rgb ? String(f.rgb).slice(-6).toUpperCase() : (f.theme != null ? 't' + f.theme + ':' + (f.tint || 0) : (f.indexed != null ? 'i' + f.indexed : null));
    return k && k !== 'FFFFFF' ? k : null;
  }
  // Office theme used by the hotel sheet (theme index → colour), so theme fills turn into real colours
  const THEME = ['FFFFFF', '000000', 'FFFFFF', '000000', '4472C4', 'ED7D31', 'A5A5A5', 'FFC000', '5B9BD5', '70AD47'];
  function hexOf(k) {
    if (!k) return '';
    if (/^[0-9A-F]{6}$/.test(k)) return '#' + k;
    const m = /^t(\d+):(-?[\d.]+)$/.exec(k); if (!m || !THEME[+m[1]]) return '';
    const base = THEME[+m[1]], t = +m[2];
    return '#' + [0, 2, 4].map(i => { let c = parseInt(base.slice(i, i + 2), 16); c = t > 0 ? c + (255 - c) * t : c * (1 + t); return Math.round(Math.max(0, Math.min(255, c))).toString(16).padStart(2, '0'); }).join('').toUpperCase();
  }
  function txtOf(c) { if (!c) return ''; if (c.w != null) return String(c.w).trim(); if (c.v == null) return ''; return String(c.v).trim(); }
  function parseSheet(XLSX, ws, name) {
    if (!ws || !ws['!ref']) return null;
    const R = XLSX.utils.decode_range(ws['!ref']);
    const get = (r, c) => ws[XLSX.utils.encode_cell({ r, c })];
    let dateRow = -1;
    for (let r = R.s.r; r <= Math.min(R.e.r, R.s.r + 20); r++) {
      if (/^date$/i.test(txtOf(get(r, 0)))) { dateRow = r; break; }
    }
    if (dateRow < 0) return weekdaySheet(XLSX, ws, name, R, get);
    const cols = []; let seg = 0, prev = null;
    for (let c = 1; c <= R.e.c; c++) {
      const cell = get(dateRow, c);
      const v = cell ? (typeof cell.v === 'number' ? cell.v : parseInt(txtOf(cell), 10)) : NaN;
      if (!Number.isInteger(v) || v < 1 || v > 31) continue;
      if (prev != null && v === prev) continue;
      if (prev != null && v < prev) seg++;
      cols.push({ c, d: v, seg }); prev = v;
    }
    if (!cols.length) return null;
    const first = {}, last = {};
    cols.forEach(x => { if (!(x.seg in first)) first[x.seg] = x.c; last[x.seg] = x.c; });
    const votes = {};
    for (let r = R.s.r; r < dateRow; r++) for (let c = 1; c <= R.e.c; c++) {
      const lab = monthLabel(txtOf(get(r, c)));
      if (!lab || lab.y == null) continue;
      let s = null;
      for (const k in first) { if (c >= first[k] - 1 && c <= last[k]) { s = +k; break; } }
      if (s == null) continue;
      const b = lab.y * 12 + lab.m - s;
      votes[b] = (votes[b] || 0) + 1;
    }
    let base = null, best = 0;
    for (const k in votes) if (votes[k] > best) { best = votes[k]; base = +k; }
    if (base == null) { const lab = monthLabel(name); if (lab && lab.y != null) base = lab.y * 12 + lab.m; }
    return { name, R, get, dateRow, cols, base, nSeg: seg + 1 };
  }
  const WD = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  function weekdaySheet(XLSX, ws, name, R, get) {
    let wdRow = -1, wdCols = [];
    for (let r = R.s.r; r <= Math.min(R.e.r, R.s.r + 8) && wdRow < 0; r++) {
      const cs = [];
      for (let c = 1; c <= R.e.c; c++) { const t = txtOf(get(r, c)).toLowerCase().slice(0, 3); if (WD.includes(t)) cs.push({ c, w: WD.indexOf(t) }); }
      if (cs.length >= 7) { wdRow = r; wdCols = cs; }
    }
    if (wdRow < 0) return null;
    let lab = null;
    for (let r = R.s.r; r < wdRow && !lab; r++) for (let c = 1; c <= Math.min(R.e.c, wdCols[0].c + 3) && !lab; c++) { const l = monthLabel(txtOf(get(r, c))); if (l && l.y != null) lab = l; }
    if (!lab) { const l = monthLabel(name); if (l && l.y != null) lab = l; }
    if (!lab) return null;
    let start = null;
    for (let d = 1; d <= 7 && !start; d++) { const t = new Date(Date.UTC(lab.y, lab.m, d)); if (t.getUTCDay() === wdCols[0].w) start = `${lab.y}-${p2(lab.m + 1)}-${p2(d)}`; }
    if (!start) return null;
    const cols = wdCols.map((x, i) => ({ c: x.c, date: addD(start, i) }));
    return { name, R, get, dateRow: wdRow, cols, base: 0, nSeg: 1 };
  }
  function dateOf(base, x) {
    if (x.date) return x.date;
    const t = base + x.seg; const y = Math.floor(t / 12), m = t % 12;
    const dim = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    if (x.d > dim) return null;
    return `${y}-${p2(m + 1)}-${p2(x.d)}`;
  }
  const NUM = /(\d{1,3}(?:[.,]\d{3})+|\d{3,6})/g;
  function toNum(s) { return +String(s).replace(/[.,]/g, ''); }
  function classify(text) {
    const t = text.replace(/\s+/g, ' ').trim();
    if (t.length < 2 || /^[\d,.\s\/\-]+$/.test(t)) return { skip: true };
    if (/^(l\s*\/\s*o|late\s*c\s*\/?\s*o|latec\/o|late\b)/i.test(t)) return { skip: true };
    if (/^\*{2,}|^notice\b|^noted?\s*:|^stop sale|^bilio\b/i.test(t)) return { skip: true };
    if (/^(\(?\s*oo\b\s*\)?|o\.b\.t|out of order|renov|renob|fix|repair|re-?paint|paint|wood paint|grout|air con|notice|stop sale)/i.test(t) || /out of order/i.test(t))
      return { block: true, reason: t.replace(/^\(?\s*oo\b\s*\)?[\s:.-]*/i, '').trim() || 'ปิดซ่อม' };
    const low = t.toLowerCase();
    let channel = '';
    if (/agoda/.test(low)) channel = 'Agoda';
    else if (/trip(\.com)?\b/.test(low)) channel = 'Trip.com';
    else if (/expedia/.test(low)) channel = 'Expedia';
    else if (/hotel ?bed/.test(low)) channel = 'Hotelbeds';
    else if (/biblio/.test(low)) channel = 'Biblio Globus';
    else if (/booking\.com|bk ?id|booking id|b'book/.test(low)) channel = 'Booking.com';
    else if (/walk ?in/.test(low)) channel = 'Walk-in';
    else if (/whats ?app/.test(low)) channel = 'WhatsApp';
    else if (/e-?mail|emai/.test(low)) channel = 'Email / โทร';
    const breakfast = /(^|[\s\/+(])bf(\d|\b)/i.test(t);
    const monthly = /mont?h|montly|monthy/i.test(t);
    let rate = 0, rateType = 'night';
    if (monthly) {
      const n = [...t.matchAll(NUM)].map(m => toNum(m[1])).find(n => n >= 10000 && n <= 100000);
      if (n) { rate = n; rateType = 'month'; }
    } else {
      const m = t.match(/(\d{1,3}(?:[.,]\d{3})+|\d{3,5})(?:\.\d{1,2})?\s*(?:bath|baht|\/\s*n\b|\/\s*night|\/\s*day|per\s*n)/i)
        || t.match(/(?:rate|@)[^\d]{0,12}(\d{1,3}(?:[.,]\d{3})+|\d{3,5})/i);
      if (m) { const n = toNum(m[1]); if (n >= 300 && n <= 20000) rate = n; }
    }
    if (/^ext(e)?n?d\b|^exten\b|^extend/i.test(t)) return { extend: true, text: t, channel, breakfast, rate, rateType };
    let guest = t.split(/\\?>|\n|,?\s*res\.?\s*no\b|,?\s*bk\s*id\b|,?\s*booking\s*id\b/i)[0];
    guest = guest.split(/\/|\+|#|@|\(| rate | on rate|\s\d{1,3},\d{3}/i)[0].replace(/^["'“”\s]+|["'“”\s.]+$/g, '').trim();
    // strip booking numbers, prices and request notes that were typed after the name
    guest = guest.replace(/,\s*[A-Z]{3}\b.*$/, '').replace(/\s*(\*+|no\.?|bk\s*no\.?|#)?\s*\d[\d\- ]{4,}.*$/i, '').replace(/\d{1,3}[.,]\d{3}.*$/, '')
      .replace(/\s+(bf|ro|req\b|last night|dbl|twn)\b.*$/i, '').replace(/[\s.,*]+$/, '').trim();
    if (!guest || guest.length < 2 || /^\d/.test(guest) || /baht|bath/i.test(guest)) guest = 'ไม่ระบุชื่อ';
    return { guest, channel, breakfast, rate, rateType };
  }
  function extract(XLSX, wb) {
    const items = [], sheets = [];
    for (const name of wb.SheetNames) {
      const ws = wb.Sheets[name];
      const P = parseSheet(XLSX, ws, name);
      if (!P) { sheets.push({ name, ok: false }); continue; }
      const merges = ws['!merges'] || [];
      const mergeAt = new Map(), covered = new Set();
      merges.forEach(m => {
        mergeAt.set(m.s.r + ':' + m.s.c, m);
        for (let r = m.s.r; r <= m.e.r; r++) for (let c = m.s.c; c <= m.e.c; c++) if (r !== m.s.r || c !== m.s.c) covered.add(r + ':' + c);
      });
      const colDate = new Map();
      if (P.base != null) P.cols.forEach(x => { const d = dateOf(P.base, x); if (d) colDate.set(x.c, d); });
      let count = 0, firstD = null, lastD = null; const roomsSeen = new Set();
      for (let r = P.dateRow + 1; r <= P.R.e.r; r++) {
        const type = txtOf(P.get(r, 0)).toUpperCase();
        const no = txtOf(P.get(r, 1));
        if (!/^(DB|TW|FM|DBL|TWN|FAM|SGL)$/.test(type) || !/^\d{1,3}$/.test(no)) continue;
        const roomNo = p2(+no); roomsSeen.add(roomNo);
        let lastBk = null;
        for (let c = 2; c <= P.R.e.c; c++) {
          const key = r + ':' + c;
          if (covered.has(key)) continue;
          const txt = txtOf(P.get(r, c));
          if (!txt) continue;
          const m = mergeAt.get(key);
          let endC = m ? m.e.c : c;
          if (!m) while (endC + 1 <= P.R.e.c && txtOf(P.get(r, endC + 1)) === txt && !mergeAt.get(r + ':' + (endC + 1)) && !covered.has(r + ':' + (endC + 1))) endC++;
          // the rest of the stay is shaded in the same colour with no text
          const fk = fillOf(P.get(r, c));
          if (fk) while (endC + 1 <= P.R.e.c) {
            const nk = r + ':' + (endC + 1), nc = P.get(r, endC + 1);
            if (txtOf(nc) || mergeAt.get(nk) || covered.has(nk) || fillOf(nc) !== fk) break;
            endC++;
          }
          let ci = null, co = null;
          for (let k = c; k <= endC; k++) { const d = colDate.get(k); if (d) { if (!ci) ci = d; co = d; } }
          c = endC;
          if (!ci) continue;
          const checkOut = addD(co, 1);
          const cl = classify(txt);
          if (cl.skip) continue;
          if (cl.extend && lastBk && lastBk.checkOut === ci) {
            lastBk.checkOut = checkOut; lastBk.notes += ' | ' + txt;
            if (cl.rate && !lastBk.rate) { lastBk.rate = cl.rate; lastBk.rateType = cl.rateType; }
            continue;
          }
          let item; const color = hexOf(fk);
          if (cl.block) item = { kind: 'block', roomNo, checkIn: ci, checkOut, reason: cl.reason, notes: txt };
          else item = { kind: 'booking', roomNo, checkIn: ci, checkOut,
            guest: cl.extend ? ((lastBk && lastBk.guest) || 'Extend') : cl.guest,
            channel: cl.channel, breakfast: cl.breakfast, rate: cl.rate, rateType: cl.rateType, notes: txt, color };
          items.push(item); count++;
          lastBk = item.kind === 'booking' ? item : null;
          if (!firstD || ci < firstD) firstD = ci;
          if (!lastD || checkOut > lastD) lastD = checkOut;
        }
      }
      sheets.push({ name, ok: P.base != null, base: P.base, count, first: firstD, last: lastD, rooms: roomsSeen.size });
    }
    // merge pieces of one stay split across sheets / adjacent same-name cells
    items.sort((a, b) => a.roomNo === b.roomNo ? (a.checkIn < b.checkIn ? -1 : a.checkIn > b.checkIn ? 1 : 0) : (a.roomNo < b.roomNo ? -1 : 1));
    const out = [];
    for (const it of items) {
      const p = out[out.length - 1];
      const same = p && p.roomNo === it.roomNo && p.kind === it.kind && it.checkIn <= p.checkOut &&
        ((it.kind === 'booking' && p.guest.toLowerCase() === it.guest.toLowerCase()) || (it.kind === 'block' && it.checkIn <= p.checkOut));
      if (same) { if (it.checkOut > p.checkOut) p.checkOut = it.checkOut; if (!p.rate && it.rate) { p.rate = it.rate; p.rateType = it.rateType; } if (!p.channel && it.channel) p.channel = it.channel; continue; }
      out.push(it);
    }
    return { sheets, items: out };
  }
  // Drop the parts of a cell note that talk about money, so staff never see prices.
  const MONEY = /(\d[\d,.]*\s*(baht|bath|฿|thb|\/\s*n\b|\/\s*night|\/\s*day|\/\s*month))|\b(rate|monthly|montly|deposit|paid|charge|chrg|ttl|total|price|outstanding|baht|bath|cash|invoice)\b|฿|\d{1,3},\d{3}/i;
  function redact(text) {
    return String(text || '').split(/\\?>|\n/).map(x => x.trim()).filter(x => x && !MONEY.test(x)).join(' > ');
  }
  return { extract, classify, monthLabel, redact, hexOf };
})();
if (typeof module !== 'undefined') module.exports = XP;
