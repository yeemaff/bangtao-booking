'use strict';
const VERSION = '1.3.9';

/* ================= utilities ================= */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const parseD = s => { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
const toStr = d => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const addDays = (s, n) => { const d = parseD(s); d.setUTCDate(d.getUTCDate() + n); return toStr(d); };
const diffDays = (a, b) => Math.round((parseD(b) - parseD(a)) / 864e5);
const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const validD = s => /^\d{4}-\d{2}-\d{2}$/.test(s || '');
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MON_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DOW_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const fmtD = s => { if (!validD(s)) return '—'; const d = parseD(s); return `${DOW[d.getUTCDay()]} ${d.getUTCDate()} ${MON[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };
const fmtShort = s => { if (!validD(s)) return '—'; const d = parseD(s); return `${d.getUTCDate()} ${MON[d.getUTCMonth()]}`; };
const fmtLong = s => { if (!validD(s)) return ''; const d = parseD(s); return `${DOW_FULL[d.getUTCDay()]} ${d.getUTCDate()} ${MON[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };
const fmtTime = v => { if (!v) return ''; const d = new Date(v); return `${DOW[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const money = n => Math.round(+n || 0).toLocaleString('en-US');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const lsGet = (k, f) => { try { const v = localStorage.getItem(k); return v == null ? f : JSON.parse(v); } catch { return f; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

const ICONS = {
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  dashboard: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  chart: '<path d="M3 3v18h18"/><path d="M7 16v-5M12 16V8M17 16v-9"/>',
  key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
  settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  plus: '<path d="M5 12h14M12 5v14"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
  bed: '<path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/>',
  door: '<path d="M13 4h3a2 2 0 0 1 2 2v14M2 20h3M13 20h9M10 12v.01"/><path d="M13 4.56v16.16a1 1 0 0 1-1.24.97L5 20V5.56a2 2 0 0 1 1.52-1.94l4-1A2 2 0 0 1 13 4.56z"/>',
  userplus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
  wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  login: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="m10 17 5-5-5-5M15 12H3"/>',
  pie: '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
  left: '<path d="m15 18-6-6 6-6"/>', right: '<path d="m9 18 6-6-6-6"/>',
  more: '<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>',
  sparkle: '<path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0l1.58 6.14a2 2 0 0 0 1.44 1.44l6.14 1.58a.5.5 0 0 1 0 .96l-6.14 1.58a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0z"/>',
  broom: '<path d="m13 11 9-9M14.6 12.6c.8.8.9 2.1.2 3L10 21l-7-7 5.4-4.8c.9-.7 2.2-.6 3 .2z"/><path d="m6.8 10.4 6.8 6.8M5 17l-1 3 3-1"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  coffee: '<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><path d="M6 2v2M10 2v2M14 2v2"/>',
  bell: '<path d="M3 18h18M5 18a7 7 0 0 1 14 0M12 9V7M10 6h4"/>',
  utensils: '<path d="M5.5 3v6a2.5 2.5 0 0 0 5 0V3M8 3v6M8 11.5V21"/><ellipse cx="16.5" cy="7" rx="2.6" ry="4"/><path d="M16.5 11v10"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-2.64-6.36L21 8"/><path d="M21 3v5h-5"/>',
  cake: '<path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20M7 8v3M12 8v3M17 8v3M7 4h.01M12 4h.01M17 4h.01"/>',
  tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><path d="M7.5 7.5h.01"/>',
  car: '<path d="M5 17h14M5 17a2 2 0 1 0 4 0M15 17a2 2 0 1 0 4 0"/><path d="M3 17v-5l2-5h14l2 5v5"/><path d="M3 12h18"/>',
  shirt: '<path d="M8 3 4 6l2 4 2-1v12h8V9l2 1 2-4-4-3a4 4 0 0 1-8 0z"/>',
  note: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
  print: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/>',
  xls: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13l4 5M12 13l-4 5M15 13v5h3"/>',
  arrowin: '<path d="M5 12h14M13 5l7 7-7 7"/>', arrowout: '<path d="M19 12H5M11 19l-7-7 7-7"/>',
};
const icon = (n, cls = 'i') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;
const AV_COLORS = ['#0b7285', '#7048e8', '#e8590c', '#2f6fde', '#2b8a3e', '#c2255c', '#5c7cfa', '#b8860b'];
const avColor = s => { let h = 0; for (const c of String(s || '')) h = (h * 31 + c.charCodeAt(0)) >>> 0; return AV_COLORS[h % AV_COLORS.length]; };
const initials = s => { const w = String(s || '?').trim().split(/\s+/).filter(Boolean); if (!w.length) return '?'; if (/[฀-๿]/.test(w[0][0])) return w[0][0]; return (w[0][0] + (w[1] ? w[1][0] : '')).toUpperCase(); };
const avatar = (name, cls = 'avatar') => `<span class="${cls}" style="background:${avColor(name)}">${esc(initials(name))}</span>`;

function toast(msg, kind, undo) {
  const el = document.createElement('div'); el.className = 'toast' + (kind ? ' ' + kind : '');
  const t = document.createElement('span'); t.textContent = msg; el.appendChild(t);
  if (undo && undo.length) {
    const b = document.createElement('button'); b.className = 'toast-undo'; b.textContent = 'เลิกทำ'; el.appendChild(b);
    b.onclick = async () => { b.disabled = true; try { await Store.undo(undo); el.remove(); toast('ยกเลิกการแก้ไขแล้ว · กลับเป็นเหมือนเดิม'); logAct('เลิกทำ: ' + msg); } catch (e) { toast(errMsg(e), 'err'); } };
  }
  $('#toastRoot').replaceChildren(el); setTimeout(() => el.remove(), kind === 'err' ? 5500 : undo && undo.length ? 9000 : 3000);
}
function openModal(html, onClose) {
  const ov = document.createElement('div'); ov.className = 'overlay'; ov.innerHTML = html;
  const close = () => { ov.remove(); document.removeEventListener('keydown', onKey); onClose && onClose(); };
  const onKey = e => { if (e.key === 'Escape' && $('#modalRoot').lastElementChild === ov) close(); };
  ov.addEventListener('mousedown', e => { if (e.target === ov) close(); });
  ov.addEventListener('click', e => { if (e.target.closest('[data-close]')) close(); });
  document.addEventListener('keydown', onKey);
  $('#modalRoot').appendChild(ov); labelDates(ov);
  return { el: ov, close };
}
// tidy text for LINE / WhatsApp: title, summary, one block per item, hotel name at the end
const MSG_RULE = '━━━━━━━━━━━━━━';
const msgItem = (head, lines) => [head, ...lines.filter(Boolean).map(l => '   ' + l)].join('\n');
const msgDoc = (title, sub, items, foot) => { const p = [title, sub, MSG_RULE, '', items.join('\n\n')]; if (foot) p.push('', foot); p.push('', `— ${settings().hotelName || ''}`); return p.join('\n'); };
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); toast('คัดลอกแล้ว วางใน LINE ได้เลย'); }
  catch { openModal(`<div class="sheet narrow"><div class="sheet-h"><h3>คัดลอกข้อความ</h3></div><div class="sheet-b"><textarea id="cpTxt" rows="12" readonly>${esc(text)}</textarea></div><div class="sheet-f"><div class="spacer"></div><button class="btn" data-close>ปิด</button></div></div>`); const t = $('#cpTxt'); t.focus(); t.select(); }
}
/* ----- date fields: dd/mm/yyyy everywhere + our own calendar (the browser's one follows the PC language) ----- */
const fmtNum = s => validD(s) ? `${s.slice(8, 10)}/${s.slice(5, 7)}/${s.slice(0, 4)}` : '';
const VALUE = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
function enhanceDate(inp) {
  if (inp._btn) return;
  const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'dfield';
  const lab = document.createElement('span'); lab.className = 'dlab';
  inp.classList.add('dnative'); inp.tabIndex = -1; inp.after(btn); btn.after(lab);
  inp._btn = btn; inp._lab = lab;
  inp._paint = () => { const v = VALUE.get.call(inp); btn.innerHTML = `${icon('calendar')}<span class="${validD(v) ? '' : 'ph'}">${validD(v) ? fmtNum(v) : 'วว/ดด/ปปปป'}</span>`; btn.disabled = inp.disabled; lab.textContent = fmtLong(v); };
  Object.defineProperty(inp, 'value', { configurable: true, get() { return VALUE.get.call(inp); }, set(v) { VALUE.set.call(inp, v); inp._paint(); } });
  btn.onclick = () => openDatePop(inp, btn);
}
function labelDates(root = document) { root.querySelectorAll('input[type=date]').forEach(inp => { enhanceDate(inp); inp._paint(); }); }
function openDatePop(inp, anchor) {
  closePop();
  const t = todayStr(), cur = VALUE.get.call(inp), dob = /dob/i.test(inp.id) || inp.dataset.dob != null;
  let ym = validD(cur) ? cur.slice(0, 7) : dob ? `${+t.slice(0, 4) - 30}-01` : t.slice(0, 7);
  const ty = +t.slice(0, 4), years = dob ? Array.from({ length: ty - 1919 }, (_, i) => ty - i) : Array.from({ length: 12 }, (_, i) => ty - 6 + i);
  const el = document.createElement('div'); el.className = 'pop dpick';
  const pick = v => { inp.value = v; inp.dispatchEvent(new Event('input', { bubbles: true })); inp.dispatchEvent(new Event('change', { bubbles: true })); el.remove(); anchor.focus(); };
  const draw = () => {
    const first = parseD(ym + '-01'), start = addDays(ym + '-01', -first.getUTCDay());
    let g = DOW.map(x => `<b>${x}</b>`).join('');
    for (let i = 0; i < 42; i++) { const d = addDays(start, i), off = (inp.min && d < inp.min) || (inp.max && d > inp.max);
      g += `<button type="button" data-d="${d}" class="${d.slice(0, 7) !== ym ? 'out ' : ''}${d === t ? 'today ' : ''}${d === cur ? 'on' : ''}"${off ? ' disabled' : ''}>${+d.slice(8)}</button>`; }
    const y = +ym.slice(0, 4), ys = years.includes(y) ? years : [...years, y].sort((p, q) => dob ? q - p : p - q);
    el.innerHTML = `<div class="dp-h"><button type="button" class="iconbtn" data-m="-1">${icon('left')}</button>
        <div class="dp-sel"><select data-pm>${MON_FULL.map((x, i) => `<option value="${i + 1}"${i + 1 === +ym.slice(5) ? ' selected' : ''}>${x}</option>`).join('')}</select><select data-py>${ys.map(v => `<option${v === y ? ' selected' : ''}>${v}</option>`).join('')}</select></div>
        <button type="button" class="iconbtn" data-m="1">${icon('right')}</button></div>
      <input type="text" class="dp-type" placeholder="หรือพิมพ์ วว/ดด/ปปปป เช่น 18/11/1975" inputmode="numeric">
      <div class="dp-g">${g}</div><div class="dp-f"><button type="button" class="btn sm" data-d="${t}">วันนี้ · ${esc(fmtShort(t))}</button>${inp.required ? '' : '<button type="button" class="btn sm ghost" data-clear>ล้าง</button>'}</div>`;
  };
  el.addEventListener('change', e => { const pm = el.querySelector('[data-pm]').value, py = el.querySelector('[data-py]').value; if (e.target.matches('[data-pm],[data-py]')) { ym = `${py}-${pad(+pm)}`; draw(); } });
  el.addEventListener('keydown', e => { if (!e.target.matches('.dp-type')) return; if (e.key !== 'Enter') return; e.preventDefault();
    const m = e.target.value.trim().match(/^(\d{1,2})[\/.\-\s](\d{1,2})[\/.\-\s](\d{2,4})$/);
    if (!m) return toast('พิมพ์เป็น วว/ดด/ปปปป เช่น 18/11/1975', 'err');
    let yy = +m[3]; if (yy < 100) yy += yy > +t.slice(2, 4) ? 1900 : 2000; if (yy > 2400) yy -= 543;
    const v = `${yy}-${pad(+m[2])}-${pad(+m[1])}`, dt = parseD(v);
    if (!validD(v) || toStr(dt) !== v) return toast('วันที่ไม่ถูกต้อง', 'err');
    pick(v); });
  el.addEventListener('click', e => { e.stopPropagation();
    const mv = e.target.closest('[data-m]'); if (mv) { ym = ymAdd(ym, +mv.dataset.m); draw(); return; }
    const d = e.target.closest('[data-d]'); if (d && !d.disabled) { pick(d.dataset.d); return; }
    if (e.target.closest('[data-clear]')) pick(''); });
  draw(); placePop(el, anchor);
}
document.addEventListener('input', e => { if (e.target.matches && e.target.matches('input[type=date]')) labelDates(e.target.parentElement); });
document.addEventListener('change', e => { if (e.target.matches && e.target.matches('input[type=date]')) labelDates(e.target.parentElement); });
async function downloadFile(name, text, type = 'text/csv;charset=utf-8') {
  // inside the claude.ai test page, files go through the viewer's save dialog
  if (window.claude && typeof window.claude.use === 'function') {
    const dl = await window.claude.use('downloads').catch(() => null);
    if (dl) { try { await dl.save({ filename: name, data: text }); toast('บันทึกไฟล์แล้ว'); } catch (e) { if (e && e.code !== 'declined') toast('บันทึกไฟล์ไม่สำเร็จ', 'err'); } return; }
  }
  const url = URL.createObjectURL(text instanceof Blob ? text : new Blob([text], { type }));
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
function isDark() { const t = lsGet('bv.theme', 'auto'); return t === 'dark' || (t === 'auto' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches); }
function syncThemeBtn() { const b = document.getElementById('themeBtn'); if (b) { b.innerHTML = icon(isDark() ? 'sun' : 'moon'); b.title = isDark() ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'; } }
function applyTheme() { const t = lsGet('bv.theme', 'auto'); if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t); }

/* ================= constants ================= */
const STATUS = { tentative: 'รอยืนยัน', confirmed: 'ยืนยันแล้ว', checked_in: 'เข้าพักอยู่', checked_out: 'ออกแล้ว', cancelled: 'ยกเลิก', noshow: 'ไม่มาเข้าพัก' };
const HK = { dirty: 'รอทำความสะอาด', clean: 'สะอาดแล้ว', inspected: 'ตรวจแล้ว พร้อมขาย' };
const TAGS = { vip: 'VIP', regular: 'แขกประจำ', blacklist: 'ห้ามรับจอง' };
const BLOCK_REASONS = ['ซ่อมแอร์', 'ซ่อมประปา', 'ซ่อมไฟฟ้า', 'รีโนเวท', 'ทาสี', 'ทำความสะอาดใหญ่', 'ห้องพักพนักงาน', 'กันห้องไว้'];
const DEFAULT_SETTINGS = {
  xlsxUrl: 'https://docs.google.com/spreadsheets/d/1h4xZwDAZ2292qbFXmeXd1gEg7ozKU8MG/edit', xlsxAuto: true,
  hotelName: 'Bangtao Village Resort', elecRate: 8, times: '14:00 / 12:00', extraBedStock: 6, babyCotStock: 3,
  channels: ['Walk-in', 'Email / โทร', 'WhatsApp', 'Booking.com', 'Agoda', 'Trip.com', 'Expedia', 'Hotelbeds', 'Biblio Globus', 'Airbnb', 'แขกประจำ / รายเดือน', 'อื่นๆ'],
};
const FAMILY = ['14', '15', '16', '17', '19', '20', '21'];
const TWIN = ['02', '03', '04', '05', '07', '09', '29'];
const DEFAULT_ROOMS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29']
  .map(no => ({ id: 'r' + no, no, type: FAMILY.includes(no) ? 'family' : 'single', bed: FAMILY.includes(no) ? '' : (TWIN.includes(no) ? 'Twin' : 'Double'), sort: +no, active: true, note: FAMILY.includes(no) ? '2 ห้องนอน 2 ห้องน้ำ' : '' }));
const PLAN_TOP = { '28': 6, '27': 7, '26': 8, '25': 9, '24': 10, '23': 11, '22': 12, '21': 13, '20': 14, '19': 15, '18': 16 };
const PLAN_BOTTOM = { '01': 1, '02': 2, '03': 3, '04': 4, '05': 5, '06': 6, '07': 7, '08': 8, '09': 9, '10': 10, '11': 11, '12': 12, '29': 13, '14': 14, '15': 15, '16': 16, '17': 17 };
// nationality list: [ISO code, country, nationality] · values are stored as the nationality (e.g. "German")
const NAT_LIST = [["THA", "Thailand", "Thai"], ["RUS", "Russia", "Russian"], ["GBR", "United Kingdom", "British"], ["DEU", "Germany", "German"], ["AUS", "Australia", "Australian"], ["USA", "United States", "American"], ["CHN", "China", "Chinese"], ["IND", "India", "Indian"], ["FRA", "France", "French"], ["SWE", "Sweden", "Swedish"], ["DNK", "Denmark", "Danish"], ["NOR", "Norway", "Norwegian"], ["FIN", "Finland", "Finnish"], ["NLD", "Netherlands", "Dutch"], ["CHE", "Switzerland", "Swiss"], ["ITA", "Italy", "Italian"], ["ESP", "Spain", "Spanish"], ["POL", "Poland", "Polish"], ["CZE", "Czech Republic", "Czech"], ["IRL", "Ireland", "Irish"], ["ISR", "Israel", "Israeli"], ["KAZ", "Kazakhstan", "Kazakhstani"], ["UKR", "Ukraine", "Ukrainian"], ["KOR", "South Korea", "South Korean"], ["JPN", "Japan", "Japanese"], ["MYS", "Malaysia", "Malaysian"], ["SGP", "Singapore", "Singaporean"], ["SAU", "Saudi Arabia", "Saudi Arabian"], ["KWT", "Kuwait", "Kuwaiti"], ["ARE", "United Arab Emirates", "Emirati"], ["CAN", "Canada", "Canadian"], ["NZL", "New Zealand", "New Zealander"], ["BEL", "Belgium", "Belgian"], ["AUT", "Austria", "Austrian"], ["PRT", "Portugal", "Portuguese"], ["GRC", "Greece", "Greek"], ["HUN", "Hungary", "Hungarian"], ["ROU", "Romania", "Romanian"], ["BGR", "Bulgaria", "Bulgarian"], ["SVK", "Slovakia", "Slovak"], ["SVN", "Slovenia", "Slovenian"], ["HRV", "Croatia", "Croatian"], ["SRB", "Serbia", "Serbian"], ["EST", "Estonia", "Estonian"], ["LVA", "Latvia", "Latvian"], ["LTU", "Lithuania", "Lithuanian"], ["BLR", "Belarus", "Belarusian"], ["ISL", "Iceland", "Icelandic"], ["LUX", "Luxembourg", "Luxembourger"], ["MLT", "Malta", "Maltese"], ["CYP", "Cyprus", "Cypriot"], ["TUR", "Turkey", "Turkish"], ["GEO", "Georgia", "Georgian"], ["ARM", "Armenia", "Armenian"], ["AZE", "Azerbaijan", "Azerbaijani"], ["UZB", "Uzbekistan", "Uzbek"], ["KGZ", "Kyrgyzstan", "Kyrgyz"], ["MDA", "Moldova", "Moldovan"], ["MNG", "Mongolia", "Mongolian"], ["TWN", "Taiwan", "Taiwanese"], ["HKG", "Hong Kong", "Hongkonger"], ["VNM", "Vietnam", "Vietnamese"], ["KHM", "Cambodia", "Cambodian"], ["LAO", "Laos", "Lao"], ["MMR", "Myanmar", "Burmese"], ["IDN", "Indonesia", "Indonesian"], ["PHL", "Philippines", "Filipino"], ["BRN", "Brunei", "Bruneian"], ["PAK", "Pakistan", "Pakistani"], ["BGD", "Bangladesh", "Bangladeshi"], ["LKA", "Sri Lanka", "Sri Lankan"], ["NPL", "Nepal", "Nepalese"], ["MDV", "Maldives", "Maldivian"], ["IRN", "Iran", "Iranian"], ["IRQ", "Iraq", "Iraqi"], ["JOR", "Jordan", "Jordanian"], ["LBN", "Lebanon", "Lebanese"], ["QAT", "Qatar", "Qatari"], ["BHR", "Bahrain", "Bahraini"], ["OMN", "Oman", "Omani"], ["EGY", "Egypt", "Egyptian"], ["MAR", "Morocco", "Moroccan"], ["TUN", "Tunisia", "Tunisian"], ["DZA", "Algeria", "Algerian"], ["ZAF", "South Africa", "South African"], ["NGA", "Nigeria", "Nigerian"], ["KEN", "Kenya", "Kenyan"], ["ETH", "Ethiopia", "Ethiopian"], ["MEX", "Mexico", "Mexican"], ["BRA", "Brazil", "Brazilian"], ["ARG", "Argentina", "Argentine"], ["CHL", "Chile", "Chilean"], ["COL", "Colombia", "Colombian"], ["PER", "Peru", "Peruvian"], ["URY", "Uruguay", "Uruguayan"], ["VEN", "Venezuela", "Venezuelan"], ["ECU", "Ecuador", "Ecuadorian"], ["CRI", "Costa Rica", "Costa Rican"], ["CUB", "Cuba", "Cuban"]];
const NATIONALITIES = NAT_LIST.map(x => x[2]);
const NAT_ALIAS = { korean: 'South Korean', kazakh: 'Kazakhstani', saudi: 'Saudi Arabian', uae: 'Emirati', english: 'British', scottish: 'British', welsh: 'British', uk: 'British', usa: 'American', us: 'American', holland: 'Dutch', burma: 'Burmese', 'czech republic': 'Czech', czechia: 'Czech', philippine: 'Filipino', argentinian: 'Argentine', nepali: 'Nepalese', 'hong kong': 'Hongkonger', 'ไทย': 'Thai', 'รัสเซีย': 'Russian', 'จีน': 'Chinese', 'อังกฤษ': 'British', 'เยอรมัน': 'German', 'ฝรั่งเศส': 'French', 'อเมริกัน': 'American', 'ออสเตรเลีย': 'Australian', 'ญี่ปุ่น': 'Japanese', 'เกาหลี': 'South Korean', 'อินเดีย': 'Indian' };
const ISO2 = { TH: 'THA', RU: 'RUS', GB: 'GBR', UK: 'GBR', DE: 'DEU', AU: 'AUS', US: 'USA', CN: 'CHN', IN: 'IND', FR: 'FRA', SE: 'SWE', DK: 'DNK', NO: 'NOR', FI: 'FIN', NL: 'NLD', CH: 'CHE', IT: 'ITA', ES: 'ESP', PL: 'POL', CZ: 'CZE', IE: 'IRL', IL: 'ISR', KZ: 'KAZ', UA: 'UKR', KR: 'KOR', JP: 'JPN', MY: 'MYS', SG: 'SGP', SA: 'SAU', KW: 'KWT', AE: 'ARE', CA: 'CAN', NZ: 'NZL', BE: 'BEL', AT: 'AUT', PT: 'PRT', GR: 'GRC', TR: 'TUR', HK: 'HKG', TW: 'TWN', VN: 'VNM', ID: 'IDN', PH: 'PHL', ZA: 'ZAF', BR: 'BRA', MX: 'MEX' };
// turn whatever was typed (code, country, Thai name, small typo) into the standard nationality
function normNat(s) {
  const t = String(s || '').trim(); if (!t) return '';
  const k = t.toLowerCase().replace(/\s+/g, ' '), up = t.toUpperCase();
  const code = ISO2[up] || up;
  const hit = NAT_LIST.find(x => x[0] === code || x[1].toLowerCase() === k || x[2].toLowerCase() === k);
  if (hit) return hit[2];
  if (NAT_ALIAS[k]) return NAT_ALIAS[k];
  const near = NAT_LIST.find(x => x[2].toLowerCase().startsWith(k) && k.length >= 4) || NAT_LIST.find(x => x[1].toLowerCase().startsWith(k) && k.length >= 4);
  if (near) return near[2];
  if (k.length >= 5) { const lev = (x, y) => { const d = Array.from({ length: x.length + 1 }, (_, i) => [i]); for (let j = 1; j <= y.length; j++) d[0][j] = j;
      for (let i = 1; i <= x.length; i++) for (let j = 1; j <= y.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1)); return d[x.length][y.length]; };
    let best = null, bd = 3; for (const x of NAT_LIST) for (const c of [x[2], x[1]]) { const dd = lev(k, c.toLowerCase()); if (dd < bd) { bd = dd; best = x[2]; } }
    if (best) return best; }
  return t.replace(/\b\w/g, c => c.toUpperCase());
}
const natCode = s => { const n = normNat(s); const x = NAT_LIST.find(r => r[2] === n); return x ? x[0] : n; };
const natOptions = () => NAT_LIST.map(x => `<option value="${esc(x[2])}">${esc(x[1])} · ${x[0]}</option>`).join('');
const GENERIC_NAME = /^(extend|ext|thai|china|walk ?in|walk|com\.?|comp\.?|complimentary|oc|guest|unknow|unknown|ไม่ระบุ|ไม่ระบุชื่อ|mr\.?|mrs\.?|ms\.?|bf|ro)$/i;

/* ================= state + data access ================= */
const S = { page: lsGet('bv.page', 'dashboard'), day: todayStr(), gMonth: todayStr().slice(0, 7), calMonth: todayStr().slice(0, 7), planFilter: '' };
const M = Store.maps;
const roomsList = () => [...M.rooms.values()].sort((a, b) => (+a.sort || 0) - (+b.sort || 0) || String(a.no).localeCompare(String(b.no)));
const activeRooms = () => roomsList().filter(r => r.active !== false);
const roomById = id => M.rooms.get(id);
const settings = () => ({ ...DEFAULT_SETTINGS, ...(M.settings.get('main') || {}) });
const roomState = () => M.state.get('rooms') || {};
const opsOf = d => M.ops.get(d) || { rooms: {} };
// roles: 'admin' = ผู้ดูแล (owner, full control) · 'manager' = Admin (everything except users & connection) · 'staff' = พนักงาน
const isOwner = () => Store.me?.role === 'admin';
const isAdmin = () => Store.me?.role === 'admin' || Store.me?.role === 'manager';
const ROLE_LABEL = { admin: 'ผู้ดูแล', manager: 'Admin', staff: 'พนักงาน' };
const roleLabel = r => ROLE_LABEL[r] || ROLE_LABEL.staff;
const nameOf = id => { const s = Store.staff.get(id); return s ? (s.display_name || s.username) : 'ผู้ใช้'; };
const times = () => { const [a, b] = String(settings().times || '14:00 / 12:00').split('/').map(x => x.trim()); return { in: a || '14:00', out: b || '12:00' }; };

const isActive = b => b.status !== 'cancelled' && b.status !== 'noshow';
const nightsOf = b => Math.max(0, diffDays(b.checkIn, b.checkOut));
// Money lives in its own 'finance' record per booking, which only admins can read.
const FIN_FIELDS = ['rate', 'extras', 'deposit', 'paid', 'payMethod', 'payRef', 'srcNote', 'fx', 'fines', 'depRefund', 'discType', 'discVal', 'discNote'];
const FINE_SUGG = ['กุญแจ / คีย์การ์ดหาย', 'สูบบุหรี่ในห้อง', 'ผ้าเช็ดตัว / ผ้าปูเสียหาย', 'ของในห้องเสียหาย', 'เช็คเอาท์เกินเวลา', 'ทำความสะอาดพิเศษ', 'รีโมท / อุปกรณ์หาย'];
const DEP_ST = { none: 'ยังไม่คืนมัดจำ', full: 'คืนเต็มจำนวน', part: 'คืนบางส่วน', kept: 'ไม่คืน (หักทั้งหมด)' };
/* ----- foreign currency → baht (live rate once a day, falls back to approximate rates) ----- */
const FX_CURS = ['USD', 'EUR', 'GBP', 'AUD', 'CNY', 'RUB', 'SGD', 'HKD', 'JPY', 'KRW', 'INR'];
const FX_APPROX = { USD: 32.5, EUR: 37.5, GBP: 43.5, AUD: 21.5, CNY: 4.55, RUB: 0.4, SGD: 25, HKD: 4.2, JPY: 0.22, KRW: 0.024, INR: 0.39 };
let FX = lsGet('bv.fx', null);
async function loadFx(force) {
  if (!force && FX && FX.date === todayStr()) return FX;
  try { const r = await fetch('https://open.er-api.com/v6/latest/THB'); const j = await r.json();
    if (j && j.rates) { const rates = {}; FX_CURS.forEach(c => { if (j.rates[c]) rates[c] = 1 / j.rates[c]; }); FX = { date: todayStr(), rates }; lsSet('bv.fx', FX); }
  } catch {}
  return FX;
}
const fxRate = c => (FX && FX.rates && FX.rates[c]) || FX_APPROX[c] || 0;
const fxLive = () => !!(FX && FX.rates && Object.keys(FX.rates).length);
// prices & payments of a booking: everyone · revenue totals, reports and statistics: ผู้ดูแล / Admin only
const canFinance = () => !!Store.me;
const canStats = () => isAdmin();
const withFin = b => (b.rate !== undefined || !b.id) ? b : { ...b, ...(M.finance.get(b.id) || {}) };
const nightRate = b => { if (b.kind === 'block') return 0; const x = withFin(b); return b.rateType === 'month' ? (+x.rate || 0) / 30 : (+x.rate || 0); };
const roomCharge = b => nightRate(b) * nightsOf(b);
const elecCharge = b => (+b.elecEnd > +b.elecStart) ? (+b.elecEnd - +b.elecStart) * (+settings().elecRate || 0) : 0;
const grossOf = b => b.kind === 'block' ? 0 : Math.round(roomCharge(b) + elecCharge(b) + (+withFin(b).extras || 0));
// discount in baht (a fixed amount or a % of the room total), never more than the total
const discOf = b => { if (b.kind === 'block') return 0; const x = withFin(b), v = +x.discVal || 0; if (v <= 0) return 0; const g = grossOf(b); return Math.min(g, Math.round(x.discType === 'pct' ? g * Math.min(v, 100) / 100 : v)); };
const totalOf = b => b.kind === 'block' ? 0 : grossOf(b) - discOf(b);
// what the guest must hand over = room total + deposit; balance = that minus what was received
// check-out fines and what happened to the deposit
const finesOf = b => { const x = withFin(b); return Array.isArray(x.fines) ? x.fines.reduce((s, f) => s + (+f.amt || 0), 0) : 0; };
const depRefOf = b => { const r = withFin(b).depRefund; return r && r.st && r.st !== 'none' ? r : null; };
const refundAmtOf = b => { const r = depRefOf(b), d = +withFin(b).deposit || 0; return !r ? 0 : r.st === 'full' ? d : r.st === 'part' ? Math.min(d, Math.max(0, +r.amt || 0)) : 0; };
// most the guest can ever be asked to pay: room + extras + fines + the deposit they hand over
const capOf = b => b.kind === 'block' ? 0 : totalOf(b) + finesOf(b) + (+withFin(b).deposit || 0);
// once the deposit is settled, only the part handed back still sits in "paid"
const dueOf = b => b.kind === 'block' ? 0 : totalOf(b) + finesOf(b) + (depRefOf(b) ? refundAmtOf(b) : (+withFin(b).deposit || 0));
const balanceOf = b => dueOf(b) - (+withFin(b).paid || 0);
const roomNo = id => roomById(id)?.no ?? '?';
const roomLabel = r => r.type === 'family' ? 'Family · 2 ห้องนอน 2 ห้องน้ำ' : (r.bed ? `ห้องเดี่ยว · ${r.bed}` : 'ห้องเดี่ยว');
const allBookings = () => [...M.bookings.values()];
function overlapping(roomId, ci, co, exceptId) { return allBookings().filter(b => b.id !== exceptId && isActive(b) && b.roomId === roomId && b.checkIn < co && ci < b.checkOut); }
function roomDayStatus(roomId, d) {
  const list = allBookings().filter(b => isActive(b) && b.roomId === roomId && b.checkIn <= d && d <= b.checkOut);
  const block = list.find(b => b.kind === 'block' && b.checkIn <= d && d < b.checkOut);
  if (block) return { k: 'block', label: 'ปิดห้อง', b: block };
  const bk = list.filter(b => b.kind !== 'block');
  const arr = bk.find(b => b.checkIn === d), dep = bk.find(b => b.checkOut === d), stay = bk.find(b => b.checkIn < d && d < b.checkOut);
  if (stay) return { k: 'in', label: 'มีแขกพักอยู่', b: stay };
  if (arr && dep) return { k: 'arr', label: 'ออก + เข้าวันนี้', b: arr, dep };
  if (arr) return { k: 'arr', label: 'เข้าวันนี้', b: arr };
  if (dep) return { k: 'dep', label: 'ออกวันนี้', b: dep };
  return { k: 'vacant', label: 'ว่าง' };
}
function dayMetrics(d) {
  const rooms = activeRooms(); const occ = new Set(), blk = new Set(); let rev = 0, arr = 0, arrDone = 0, dep = 0, pax = 0;
  for (const b of M.bookings.values()) {
    if (!isActive(b)) continue;
    if (b.kind === 'block') { if (b.checkIn <= d && d < b.checkOut) blk.add(b.roomId); continue; }
    if (b.checkIn <= d && d < b.checkOut) { occ.add(b.roomId); rev += nightRate(b); pax += (+b.adults || 0) + (+b.children || 0); }
    if (b.checkIn === d) { arr++; if (b.status === 'checked_in' || b.status === 'checked_out') arrDone++; }
    if (b.checkOut === d) dep++;
  }
  const sellable = Math.max(0, rooms.length - blk.size);
  return { occ: occ.size, sellable, total: rooms.length, rev, arr, arrDone, dep, pax, pct: sellable ? occ.size / sellable * 100 : 0 };
}

function errMsg(e) {
  const c = e && (e.code || ''); const m = String(e && e.message || '');
  if (c === '42501' || /row-level security|permission denied/i.test(m)) return 'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง';
  if (/Failed to fetch|NetworkError|network/i.test(m)) return 'เชื่อมต่ออินเทอร์เน็ตไม่ได้ ตรวจการเชื่อมต่อแล้วลองอีกครั้ง';
  if (/JWT|token/i.test(m)) return 'การเข้าสู่ระบบหมดอายุ กรุณาเข้าสู่ระบบใหม่';
  return 'บันทึกไม่สำเร็จ: ' + (m || 'ไม่ทราบสาเหตุ');
}
const undoStack = [];
async function save(fn, okMsg) {
  try { const undo = await Store.track(fn); if (okMsg) toast(okMsg, null, undo); if (undo && undo.length) { undoStack.push({ msg: okMsg || 'แก้ไข', undo }); if (undoStack.length > 30) undoStack.shift(); const u = document.getElementById('gtUndo'); if (u) u.disabled = false; } return true; }
  catch (e) { console.error(e); toast(errMsg(e), 'err'); return false; }
}
function logAct(text) { Store.put('log', Store.newId(), { at: Date.now(), by: Store.me?.id, text }).catch(() => {}); }

/* ================= boot & auth screens ================= */
const APP = () => $('#app');
async function boot() {
  applyTheme();
  const conn = Store.readConn();
  if (!conn) return showSetup();
  Store.init(conn);
  try {
    const sess = await Store.currentSession();
    if (sess) { const me = await Store.loadMe(); if (me) return startMain(); await Store.signOut(); return showLogin('บัญชีนี้ถูกระงับหรือยังไม่ได้เพิ่มเป็นผู้ใช้งาน ติดต่อผู้ดูแล'); }
    if (await Store.setupNeeded()) return showFirstAdmin();
    showLogin();
  } catch (e) {
    console.error(e);
    if (/setup_needed|function|schema/i.test(String(e.message))) return showSetup('ยังไม่ได้ติดตั้งฐานข้อมูล ให้รันไฟล์ supabase-setup.sql ใน Supabase ก่อน');
    showLogin(navigator.onLine ? 'เชื่อมต่อฐานข้อมูลไม่ได้ ตรวจอินเทอร์เน็ตหรือการตั้งค่าการเชื่อมต่อ' : 'ไม่มีอินเทอร์เน็ต โปรแกรมต้องต่ออินเทอร์เน็ตเพื่อซิงก์ข้อมูลกับเครื่องอื่น');
  }
}
const SCENE = `<img class="scene-photo" src="login.jpg" alt="" aria-hidden="true"><div class="scene-shade"></div>`;
function authFrame(inner) {
  APP().innerHTML = `<div class="auth"><div class="auth-art"><div class="row" style="gap:12px"><img class="mark mark-img" src="icon.png" alt=""><div><b style="font-family:var(--f-display);font-size:18px">Bangtao Village Resort</b><div style="opacity:.8;font-size:12px">ระบบจองห้องพัก · v${VERSION}</div></div></div>
    ${SCENE}</div>
    <div class="auth-form"><div class="auth-box">${inner}</div></div></div>`;
}
function showSetup(err) {
  authFrame(`<div><h2>เชื่อมต่อฐานข้อมูล</h2><div class="hint" style="margin-top:6px">ทำครั้งเดียวต่อเครื่อง ถ้ามีเครื่องอื่นตั้งไว้แล้ว ให้วาง “รหัสเชื่อมต่อ” จากเมนูตั้งค่าของเครื่องนั้น</div></div>
    ${err ? `<div class="notice err">${esc(err)}</div>` : ''}
    <label class="f"><span>รหัสเชื่อมต่อ (ขึ้นต้นด้วย BV1:)</span><input type="text" id="cCode" placeholder="BV1:…"></label>
    <div class="hint" style="text-align:center">หรือกรอกข้อมูลจาก Supabase → Project Settings → API</div>
    <label class="f"><span>Project URL</span><input type="url" id="cUrl" placeholder="https://xxxx.supabase.co"></label>
    <label class="f"><span>anon public key</span><input type="text" id="cKey" placeholder="eyJhbGciOi…"></label>
    <button class="btn primary" id="cGo">${icon('link')} เชื่อมต่อ</button>
    <div class="hint" id="cMsg"></div>`);
  $('#cGo').onclick = async () => {
    let url = $('#cUrl').value, key = $('#cKey').value.trim(); const code = $('#cCode').value.trim();
    if (code) { try { const o = JSON.parse(decodeURIComponent(escape(atob(code.replace(/^BV1:/, ''))))); url = o.u; key = o.k; } catch { $('#cMsg').textContent = 'รหัสเชื่อมต่อไม่ถูกต้อง'; return; } }
    url = Store.normaliseUrl(url);
    if (!url || !key) { $('#cMsg').textContent = 'กรอก Project URL และ anon key ให้ครบ'; return; }
    $('#cGo').disabled = true; $('#cMsg').textContent = 'กำลังทดสอบการเชื่อมต่อ…';
    try { await Store.testConnection({ url, key }); Store.saveConn({ url, key }); boot(); }
    catch (e) {
      $('#cGo').disabled = false;
      $('#cMsg').textContent = /setup_needed|function|schema|404/i.test(String(e.message || e.code)) ? 'เชื่อมต่อได้ แต่ยังไม่ได้รันไฟล์ supabase-setup.sql ใน SQL Editor' : 'เชื่อมต่อไม่ได้ ตรวจ URL และ key อีกครั้ง (' + (e.message || e) + ')';
    }
  };
}
function showLogin(err) {
  authFrame(`<div><h2>เข้าสู่ระบบ</h2><div class="hint" style="margin-top:6px">ใช้ชื่อผู้ใช้และรหัสผ่านที่ผู้ดูแลสร้างให้</div></div>
    ${err ? `<div class="notice err">${esc(err)}</div>` : ''}
    ${window.BV_DEMO ? '<div class="notice ok"><b>โหมดทดลอง</b> · รหัสผ่าน <b>123456</b> ทุกบัญชี<br>ผู้ดูแล: <b>admin</b> · Admin: <b>manager</b> · พนักงาน: <b>staff</b></div>' : ''}
    <form id="lForm" class="auth-box" style="gap:14px">
      <label class="f"><span>ชื่อผู้ใช้</span><input type="text" id="lUser" autocomplete="username" autofocus></label>
      <label class="f"><span>รหัสผ่าน</span><input type="password" id="lPass" autocomplete="current-password"></label>
      <button class="btn primary" type="submit" id="lGo">${icon('login')} เข้าสู่ระบบ</button>
    </form>
    <div class="hint" id="lMsg"></div>
    <div class="hint">ลืมรหัสผ่าน ให้ผู้ดูแลตั้งรหัสใหม่ให้</div>
    <button class="btn ghost sm" id="lConn" style="align-self:flex-start">${icon('link')} เปลี่ยนการเชื่อมต่อฐานข้อมูล</button>`);
  setTimeout(() => $('#lUser')?.focus(), 50);
  $('#lForm').onsubmit = async e => {
    e.preventDefault();
    const u = $('#lUser').value.trim(), p = $('#lPass').value;
    if (!u || !p) { $('#lMsg').textContent = 'กรอกชื่อผู้ใช้และรหัสผ่าน'; return; }
    $('#lGo').disabled = true; $('#lMsg').textContent = 'กำลังเข้าสู่ระบบ…';
    try { await Store.signIn(u, p); startMain(); }
    catch (er) { $('#lGo').disabled = false; $('#lMsg').textContent = er.code === 'inactive' ? 'บัญชีนี้ถูกระงับ ติดต่อผู้ดูแล' : /Invalid login/i.test(er.message) ? 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' : errMsg(er); }
  };
  $('#lConn').onclick = () => { Store.clearConn(); showSetup(); };
}
function showFirstAdmin() {
  authFrame(`<div><h2>สร้างบัญชีผู้ดูแล</h2><div class="hint" style="margin-top:6px">ฐานข้อมูลนี้ยังไม่มีผู้ใช้ บัญชีแรกที่สร้างจะเป็นผู้ดูแล ซึ่งเพิ่มผู้ใช้อื่นและกำหนดรหัสผ่านได้</div></div>
    <label class="f"><span>ชื่อที่แสดง</span><input type="text" id="aName" placeholder="เช่น คุณกฤษ"></label>
    <label class="f"><span>ชื่อผู้ใช้ (ภาษาอังกฤษหรือตัวเลข)</span><input type="text" id="aUser" placeholder="เช่น owner"></label>
    <label class="f"><span>รหัสผ่าน (อย่างน้อย 6 ตัว)</span><input type="password" id="aPass"></label>
    <label class="f"><span>ยืนยันรหัสผ่าน</span><input type="password" id="aPass2"></label>
    <button class="btn primary" id="aGo">${icon('userplus')} สร้างบัญชีและเริ่มใช้งาน</button><div class="hint" id="aMsg"></div>`);
  $('#aGo').onclick = async () => {
    const name = $('#aName').value.trim(), u = $('#aUser').value.trim().toLowerCase(), p = $('#aPass').value, p2 = $('#aPass2').value;
    if (!name) return $('#aMsg').textContent = 'กรอกชื่อที่แสดง';
    if (!/^[a-z0-9._-]{3,30}$/.test(u)) return $('#aMsg').textContent = 'ชื่อผู้ใช้ใช้ a-z, 0-9, จุด, ขีด ได้ 3–30 ตัว';
    if (p.length < 6) return $('#aMsg').textContent = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัว';
    if (p !== p2) return $('#aMsg').textContent = 'รหัสผ่านทั้งสองช่องไม่ตรงกัน';
    $('#aGo').disabled = true; $('#aMsg').textContent = 'กำลังสร้างบัญชี…';
    try { await Store.createFirstAdmin(u, name, p); startMain(true); }
    catch (e) {
      $('#aGo').disabled = false;
      $('#aMsg').textContent = e.code === 'confirm_email_on' ? 'ต้องปิด “Confirm email” ใน Supabase ก่อน (Authentication → Sign In / Providers → Email) แล้วกดอีกครั้ง' : e.code === 'already_setup' ? 'มีผู้ดูแลอยู่แล้ว ให้เข้าสู่ระบบแทน' : /already registered/i.test(e.message) ? 'ชื่อผู้ใช้นี้ถูกใช้แล้ว' : errMsg(e);
    }
  };
}

/* ================= main shell ================= */
const SUB_PAGES = { equip: 'dashboard' }; // pages opened from the dashboard, not listed in the menu
const NAV = [
  ['dashboard', 'แดชบอร์ด', 'dashboard'], ['daily', 'งานประจำวัน', 'clipboard'], ['chart', 'ผังการจอง', 'calendar'], ['plan', 'ห้องพัก', 'map'], ['repairs', 'แจ้งซ่อม', 'wrench'],
  ['guests', 'ฐานข้อมูลแขก', 'users'], ['docs', 'เอกสาร', 'file'], ['reports', 'รายงานการเงิน', 'chart', true], ['users', 'ผู้ใช้งาน', 'key', 'owner'], ['settings', 'ตั้งค่า', 'settings'],
];
let unsub = null;
async function startMain(fresh) {
  APP().innerHTML = shellHtml();
  bindShell();
  setPage(S.page);
  try { await Store.loadAll(); } catch (e) { toast(errMsg(e), 'err'); }
  xsAutoStart();
  if (isAdmin() && !M.rooms.size) {
    await save(() => Store.putMany([...DEFAULT_ROOMS.map(r => ({ col: 'rooms', id: r.id, data: { ...r, id: undefined } })), { col: 'settings', id: 'main', data: DEFAULT_SETTINGS }]), fresh ? 'สร้างห้องพัก 28 ห้องตามแผนผังให้แล้ว' : null);
  }
  Store.subscribe();
  try { const ub = upcomingBirthdays(); if (ub.length && lsGet('bv.bdayNote', '') !== todayStr()) { lsSet('bv.bdayNote', todayStr()); setTimeout(() => toast(`วันเกิดแขกที่พักอยู่ใน 3 วันข้างหน้า ${ub.length} คน · ดูได้ที่ “วันเกิดแขก” ในทางลัดหน้าแดชบอร์ด`, 'info'), 1200); } } catch {}
  unsub && unsub();
  unsub = Store.on(onStoreEvent);
  render();
}
let remoteQueue = [], remoteTimer = null;
function onStoreEvent(what, info) {
  if (what === 'status') { renderSync(); return; }
  if (what === 'doc' && info.col === 'bookings' && info.by && Store.me && info.by !== Store.me.id && (info.type === 'insert' || info.type === 'update')) {
    const b = M.bookings.get(info.id); if (b) { remoteQueue.push({ by: info.by, b, type: info.type }); clearTimeout(remoteTimer); remoteTimer = setTimeout(flushRemote, 900); }
    if (b) notifyChange(b, info.prev, info.by);
  }
  if (what === 'doc' && info.col === 'repairs' && info.by && Store.me && info.by !== Store.me.id && (info.type === 'insert' || info.type === 'update')) {
    const r = M.repairs.get(info.id), was = info.prev?.status;
    if (r && (!info.prev || (r.status !== was && r.status === 'done'))) pushNotif('repair', null, info.by, `${rpWhere(r)} · ${r.title}${r.category ? ' (' + r.category + ')' : ''} · โดย ${nameOf(info.by)}`, !info.prev ? (r.urgent ? '🔧 แจ้งซ่อมด่วน' : '🔧 แจ้งซ่อมใหม่') : '✅ ซ่อมเสร็จแล้ว');
  }
  scheduleRender();
}
/* ---- desktop notifications (Windows / Mac), switched on or off per computer in Settings ---- */
const NOTIF_KINDS = { repair: 'แจ้งซ่อม', checkin: 'แขกเช็คอิน', checkout: 'แขกเช็คเอาท์', newb: 'มีการจองใหม่', cancel: 'มีการยกเลิกการจอง', taxi: 'เตือนรถรับส่ง / แท็กซี่', bday: 'วันเกิดแขก', excel: 'อัปเดตจาก Excel' };
const notifCfg = () => { let c = null; try { c = JSON.parse(localStorage.getItem('bv.notif') || 'null'); } catch {} return { on: true, repair: true, checkin: true, checkout: true, newb: true, cancel: true, taxi: true, bday: true, excel: true, always: false, lead: 60, ...(c || {}) }; };
const setNotifCfg = c => { try { localStorage.setItem('bv.notif', JSON.stringify(c)); } catch {} };
let notifQ = [], notifT = null;
function notifyChange(b, prev, by) {
  if (b.kind === 'block') return;
  const st = b.status, was = prev ? prev.status : null; let kind = null;
  if (st === 'checked_in' && was && was !== 'checked_in') kind = 'checkin';
  else if (st === 'checked_out' && was === 'checked_in') kind = 'checkout';
  else if (st === 'cancelled' && was && was !== 'cancelled' && !b.xgone) kind = 'cancel';
  else if (!prev && isActive(b) && b.checkOut >= todayStr()) kind = 'newb';
  if (kind) pushNotif(kind, b, by);
}
function pushNotif(kind, b, by, text, title) {
  const c = notifCfg(); if (!c.on || !c[kind] || typeof Notification === 'undefined') return;
  if (!c.always && !title && document.hasFocus()) return; // the app is in front: the usual message inside the app is enough
  notifQ.push({ kind, b, by, text, title }); clearTimeout(notifT); notifT = setTimeout(flushNotif, 1200);
}
// requireInteraction false: the banner shows for a few seconds and goes away by itself, then waits in the notification centre
function flushNotif() {
  const q = notifQ; notifQ = []; if (!q.length) return;
  const show = (title, body, bid) => { try { const n = new Notification(title, { body, silent: false, requireInteraction: false }); n.onclick = () => { try { window.focus(); window.bvDesktop && window.bvDesktop.focus && window.bvDesktop.focus(); } catch {} const b = bid && M.bookings.get(bid); if (b) openBooking(b); }; } catch (e) { console.warn('notification', e); } };
  const timed = q.filter(x => x.title); for (const x of timed) show(x.title, x.text, x.b && x.b.id);
  q.splice(0, q.length, ...q.filter(x => !x.title)); if (!q.length) return;
  if (q.length > 3) {
    const n = k => q.filter(x => x.kind === k).length;
    return show('Bangtao Village · มีการอัปเดต ' + q.length + ' รายการ', Object.keys(NOTIF_KINDS).filter(n).map(k => `${NOTIF_KINDS[k]} ${n(k)}`).join(' · '));
  }
  for (const x of q) {
    if (x.text) { show('Bangtao Village · ' + NOTIF_KINDS[x.kind], x.text); continue; }
    const who = x.by ? ` · โดย ${nameOf(x.by)}` : '';
    const line = `ห้อง ${roomNo(x.b.roomId)} · ${x.b.guest || ''}`;
    const extra = x.kind === 'newb' ? `\n${fmtShort(x.b.checkIn)} → ${fmtShort(x.b.checkOut)}${x.b.channel ? ' · ' + x.b.channel : ''}` : '';
    show(NOTIF_KINDS[x.kind], line + extra + who, x.b.id);
  }
}
// reminders worked out on this computer: a ride coming up soon, rides for tomorrow not booked yet, birthdays
function notifTick() {
  const c = notifCfg(); if (!c.on || !Store.me) return;
  let done = {}; try { done = JSON.parse(localStorage.getItem('bv.nfDone') || '{}'); } catch {}
  const t = todayStr(), now = new Date(), mins = now.getHours() * 60 + now.getMinutes(), fresh = k => !done[k] && (done[k] = t);
  if (c.taxi) {
    for (const [day, plus] of [[t, 0], [addDays(t, 1), 1440]]) for (const { b, t: x } of transfersOn(day)) { // tomorrow too, for a ride just after midnight
      if (x.status === 'done' || x.status === 'cancelled') continue;
      const m = String(x.time || '').match(/^(\d{1,2}):(\d{2})/); if (!m) continue;
      const left = +m[1] * 60 + +m[2] + plus - mins;
      if (left > 0 && left <= (+c.lead || 60) && fresh(`tx:${day}:${x.id}:${x.time}`))
        pushNotif('taxi', b, null, `${x.type === 'pickup' ? 'รับ' : x.type === 'dropoff' ? 'ส่ง' : 'รถ'} ห้อง ${roomNo(b.roomId)} · ${b.guest}\n${x.time} · ${txLine(x)}${x.flight ? ' · ✈ ' + x.flight : ''}${x.pax ? ' · ' + x.pax + ' คน' : ''}${x.status === 'need' ? '\nยังไม่ได้จองรถ' : x.driver || x.plate ? '\n' + [x.driver, x.plate].filter(Boolean).join(' · ') : ''}`, `รถรับส่งอีก ${left} นาที`);
    }
    if (mins >= 17 * 60) { const tm = addDays(t, 1), need = transfersOn(tm).filter(x => x.t.status === 'need');
      if (need.length && fresh(`txtm:${tm}`)) pushNotif('taxi', need[0].b, null, need.map(({ b, t: x }) => `${x.time || '—'} ${x.type === 'pickup' ? 'รับ' : 'ส่ง'} ห้อง ${roomNo(b.roomId)} · ${b.guest}`).join('\n'), `พรุ่งนี้มีรถ ${need.length} เที่ยวที่ยังไม่ได้จองรถ`); }
  }
  if (c.bday && mins >= 8 * 60) for (const x of upcomingBirthdays(1)) if (fresh(`bd:${x.date}:${x.g.id}`))
    pushNotif('bday', x.stay, null, `${x.g.name}${x.age ? ' · อายุ ' + x.age + ' ปี' : ''} · ห้อง ${roomNo(x.stay.roomId)}`, x.inDays === 0 ? '🎂 วันนี้วันเกิดแขก' : '🎂 พรุ่งนี้วันเกิดแขก');
  for (const k of Object.keys(done)) if (done[k] < addDays(t, -3)) delete done[k];
  try { localStorage.setItem('bv.nfDone', JSON.stringify(done)); } catch {}
}
setInterval(() => { try { notifTick(); } catch (e) { console.warn('reminders', e); } }, 60e3);
function renderNotifCard() {
  const box = $('#notifCard'); if (!box) return; const c = notifCfg();
  $('#nfOn').checked = c.on; $('#nfLead').value = String(c.lead || 60); $('#nfLead').disabled = !c.on || !c.taxi; $$('#notifCard [data-nf]').forEach(i => { i.checked = !!c[i.dataset.nf]; i.disabled = !c.on; });
  $('#nfPerm').textContent = typeof Notification === 'undefined' ? 'เครื่องนี้ไม่รองรับการแจ้งเตือน' : Notification.permission === 'denied' ? 'เครื่องนี้ปิดการแจ้งเตือนของแอปไว้ · เปิดได้ที่การตั้งค่าของ Windows / Mac' : '';
}
function bindNotifCard() {
  const box = $('#notifCard'); if (!box) return;
  box.addEventListener('change', async e => { const c = notifCfg();
    if (e.target.id === 'nfOn') c.on = e.target.checked; else if (e.target.id === 'nfLead') c.lead = +e.target.value; else if (e.target.dataset.nf) c[e.target.dataset.nf] = e.target.checked;
    setNotifCfg(c);
    if (c.on && typeof Notification !== 'undefined' && Notification.permission === 'default') { try { await Notification.requestPermission(); } catch {} }
    renderNotifCard(); });
  $('#nfTest').onclick = async () => { if (typeof Notification !== 'undefined' && Notification.permission === 'default') { try { await Notification.requestPermission(); } catch {} }
    try { new Notification('Bangtao Village · ทดสอบการแจ้งเตือน', { body: 'ถ้าเห็นข้อความนี้ แสดงว่าการแจ้งเตือนใช้ได้แล้ว' }); } catch { toast('แสดงการแจ้งเตือนไม่ได้', 'err'); } renderNotifCard(); };
}
function flushRemote() {
  if (!remoteQueue.length) return;
  const q = remoteQueue; remoteQueue = [];
  const first = q[q.length - 1];
  const msg = q.length === 1 ? `${nameOf(first.by)} ${first.type === 'insert' ? 'เพิ่ม' : 'แก้ไข'}การจอง ${first.b.kind === 'block' ? 'ปิดห้อง ' + roomNo(first.b.roomId) : first.b.guest}` : `${nameOf(first.by)} อัปเดตการจอง ${q.length} รายการ`;
  toast(msg, 'info');
}
let rq = false;
function scheduleRender() { if (rq) return; rq = true; requestAnimationFrame(() => { rq = false; render(); }); }

function shellHtml() {
  const collapsed = lsGet('bv.collapsed', false);
  return `<div class="shell${collapsed ? ' collapsed' : ''}" id="shell">
    <aside class="side">
      <div class="logo"><img class="mark mark-img" src="icon.png" alt=""><div><b>Bangtao Village</b><span>Booking System</span></div></div>
      <nav class="nav" id="nav">
        <div class="nav-label">เมนู</div>
        ${NAV.map(([k, label, ic, admin]) => `<button data-page="${k}"${admin === 'owner' ? ' data-owner="1"' : admin ? ' data-admin="1"' : ''} title="${label}">${icon(ic)}<span>${label}</span>${k === 'daily' ? '<em class="badge" id="navDaily" hidden></em>' : k === 'repairs' ? '<em class="badge" id="navRepairs" hidden></em>' : ''}</button>`).join('')}
      </nav>
    </aside>
    <div class="main">
      <header class="topbar">
        <button class="iconbtn" id="collapse" title="ย่อ/ขยายเมนู">${icon('menu')}</button>
        <div class="search">${icon('search')}<input type="search" id="gsearch" placeholder="ค้นหาแขก การจอง หรือเลขห้อง…" autocomplete="off"><kbd>Ctrl K</kbd><div class="search-pop" id="gpop" hidden></div></div>
        <div class="top-spacer"></div>
        <button class="iconbtn" id="themeBtn" title="สลับโหมดสว่าง / มืด"></button>
        <button class="iconbtn" id="refreshBtn" title="รีเฟรชข้อมูล (F5)">${icon('refresh')}</button>
        <div class="sync" id="sync"><i></i><span>กำลังเชื่อมต่อ…</span></div>
        <button class="btn primary" id="topNew">${icon('plus')} จองใหม่</button>
        <button class="userchip" id="userchip">${avatar(Store.me?.display_name || Store.me?.username)}<span><b>${esc(Store.me?.display_name || Store.me?.username || '')}</b><small>${roleLabel(Store.me?.role)} · @${esc(Store.me?.username || '')}</small></span></button>
      </header>
      <div class="content" id="content">${pagesHtml()}</div>
    </div>
  </div>`;
}
function bindShell() {
  $('#nav').addEventListener('click', e => { const b = e.target.closest('[data-page]'); if (b) setPage(b.dataset.page); });
  $('#collapse').onclick = () => { const s = $('#shell'); s.classList.toggle('collapsed'); lsSet('bv.collapsed', s.classList.contains('collapsed')); scheduleRender(); };
  $('#topNew').onclick = () => openBooking(null, { checkIn: todayStr(), checkOut: addDays(todayStr(), 1) });
  $('#userchip').onclick = e => openUserMenu(e.currentTarget);
  $('#refreshBtn').onclick = refreshAll;
  $('#themeBtn').onclick = () => { lsSet('bv.theme', isDark() ? 'light' : 'dark'); applyTheme(); syncThemeBtn(); toast(isDark() ? 'โหมดมืด' : 'โหมดสว่าง'); };
  syncThemeBtn();
  bindSearch();
  bindPages();
  document.addEventListener('keydown', e => {
    if (!Store.me) return;
    if (e.ctrlKey && (e.key === 'k' || e.key === 'K' || e.key === 'f' || e.key === 'F')) { e.preventDefault(); $('#gsearch').focus(); $('#gsearch').select(); }
    if (e.ctrlKey && (e.key === 'n' || e.key === 'N') && !$('#modalRoot').children.length) { e.preventDefault(); $('#topNew').click(); }
    if (e.key === 'F5' || (e.ctrlKey && (e.key === 'r' || e.key === 'R'))) { e.preventDefault(); refreshAll(); }
  });
}
// pull the latest data from the shared database and redraw everything
async function refreshAll() {
  const btn = $('#refreshBtn'); if (!btn || btn.disabled) return;
  btn.disabled = true; btn.classList.add('spin');
  try { if (!Store.online) await Store.reconnect(); await Store.loadAll(); closePop(); render(); const d = new Date(); toast(`อัปเดตข้อมูลล่าสุดแล้ว · ${pad(d.getHours())}:${pad(d.getMinutes())}`); }
  catch (e) { toast(errMsg(e), 'err'); }
  finally { btn.disabled = false; btn.classList.remove('spin'); }
}
function setPage(p, opt = {}) {
  if ((!NAV.some(n => n[0] === p) && !SUB_PAGES[p]) || ((p === 'users' && !isOwner()) || (p === 'reports' && !isAdmin()))) p = 'dashboard';
  S.page = p; lsSet('bv.page', p);
  $$('#nav [data-page]').forEach(b => b.setAttribute('aria-current', b.dataset.page === (SUB_PAGES[p] || p) ? 'page' : 'false'));
  $$('#content > section').forEach(s => s.hidden = s.id !== 'p-' + p);
  $('#content').scrollTop = 0;
  render();
}
function renderSync() { const el = $('#sync'); if (!el) return; el.className = 'sync ' + (Store.online ? 'ok' : 'err'); el.querySelector('span').textContent = Store.statusText; el.title = Store.online ? '' : 'กดเพื่อเชื่อมต่อใหม่'; el.style.cursor = Store.online ? '' : 'pointer'; if (!el.dataset.bound) { el.dataset.bound = 1; el.addEventListener('click', () => { if (!Store.online) Store.reconnect(true); }); } }
function render() {
  if (!$('#shell')) return;
  $$('#nav [data-admin], .quick [data-admin], [data-fin]').forEach(b => b.hidden = !isAdmin());
  $$('[data-owner]').forEach(b => b.hidden = !isOwner());
  $$('.quick [data-staff]').forEach(b => b.hidden = isAdmin());
  renderSync(); renderSideCard(); renderBirthdayBadge();
  const r = { dashboard: renderDashboard, plan: renderPlan, chart: renderChart, daily: renderDaily, repairs: renderRepairs, equip: renderEquip, guests: S.gView === 'channel' ? renderChannels : renderGuests, docs: renderDocs, reports: renderReports, users: renderUsers, settings: renderSettings }[S.page];
  try { r && r(); } catch (e) { console.error(e); }
  labelDates($('#p-' + S.page));
}
function renderSideCard() {
  if (!$('#sideCard')) return;
  const m = dayMetrics(todayStr());
  $('#sideCard').innerHTML = `<small>คืนนี้มีแขก</small><b>${m.occ} / ${m.sellable} ห้อง</b><div class="meter"><i style="width:${Math.round(m.pct)}%"></i></div><small>${Math.round(m.pct)}% · ${m.pax} ท่าน · ว่าง ${m.sellable - m.occ} ห้อง</small><button id="sideFind">${icon('door')} หาห้องว่าง</button>`;
  $('#sideFind').onclick = () => openFinder();
  const nd = $('#navDaily'); if (nd) { const n = m.arr - m.arrDone; nd.hidden = !n; nd.textContent = n; }
  renderRepairCard();
}
function openUserMenu(anchor) {
  document.querySelector('.menu')?.remove();
  const r = anchor.getBoundingClientRect();
  const m = document.createElement('div'); m.className = 'menu'; m.style.top = (r.bottom + 6) + 'px'; m.style.right = (window.innerWidth - r.right) + 'px';
  const th = lsGet('bv.theme', 'auto');
  m.innerHTML = `<button data-act="pw">${icon('lock')} เปลี่ยนรหัสผ่าน</button>
    <button data-act="theme">${icon(th === 'dark' ? 'sun' : 'moon')} ธีม: ${th === 'auto' ? 'ตามระบบ' : th === 'dark' ? 'มืด' : 'สว่าง'}</button>
    <hr><button data-act="out">${icon('logout')} ออกจากระบบ</button>`;
  document.body.appendChild(m);
  const off = e => { if (!m.contains(e.target)) { m.remove(); document.removeEventListener('mousedown', off); } };
  setTimeout(() => document.addEventListener('mousedown', off), 0);
  m.onclick = async e => {
    const a = e.target.closest('[data-act]')?.dataset.act; if (!a) return; m.remove();
    if (a === 'pw') openChangePw();
    if (a === 'theme') { const next = { auto: 'light', light: 'dark', dark: 'auto' }[th]; lsSet('bv.theme', next); applyTheme(); syncThemeBtn(); toast('ธีม: ' + ({ auto: 'ตามระบบ', light: 'สว่าง', dark: 'มืด' }[next])); }
    if (a === 'out') { await Store.signOut(); unsub && unsub(); showLogin(); }
  };
}
function openChangePw() {
  const m = openModal(`<div class="sheet narrow"><div class="sheet-h"><h2>เปลี่ยนรหัสผ่าน</h2><div class="spacer"></div><button class="btn ghost" data-close>✕</button></div>
    <div class="sheet-b"><label class="f"><span>รหัสผ่านปัจจุบัน</span><input type="password" id="pw0"></label><label class="f"><span>รหัสผ่านใหม่ (อย่างน้อย 6 ตัว)</span><input type="password" id="pw1"></label><label class="f"><span>ยืนยันรหัสผ่านใหม่</span><input type="password" id="pw2"></label></div>
    <div class="sheet-f"><div class="spacer"></div><button class="btn" data-close>ยกเลิก</button><button class="btn primary" id="pwGo">บันทึก</button></div></div>`);
  $('#pwGo', m.el).onclick = async () => {
    const a = $('#pw0', m.el).value, b = $('#pw1', m.el).value, c = $('#pw2', m.el).value;
    if (b.length < 6) return toast('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัว', 'err');
    if (b !== c) return toast('รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน', 'err');
    try { await Store.changeOwnPassword(a, b); toast('เปลี่ยนรหัสผ่านแล้ว'); m.close(); }
    catch (e) { toast(e.code === 'wrong_password' ? 'รหัสผ่านปัจจุบันไม่ถูกต้อง' : errMsg(e), 'err'); }
  };
}

/* ---------- global search ---------- */
function bindSearch() {
  const inp = $('#gsearch'), pop = $('#gpop');
  const run = () => {
    const q = inp.value.trim().toLowerCase();
    if (q.length < 1) { pop.hidden = true; return; }
    const rooms = activeRooms().filter(r => r.no.includes(q)).slice(0, 4);
    const guests = q.length >= 2 ? [...M.guests.values()].filter(g => [g.name, g.phone, g.passport, g.email].some(x => x && String(x).toLowerCase().includes(q))).slice(0, 6) : [];
    const bks = q.length >= 2 ? allBookings().filter(b => b.kind !== 'block' && [b.guest, b.ref, b.phone].some(x => x && String(x).toLowerCase().includes(q))).sort((a, b) => a.checkIn < b.checkIn ? 1 : -1).slice(0, 6) : [];
    let h = '';
    if (rooms.length) h += `<h4>ห้อง</h4>` + rooms.map(r => `<button data-room="${esc(r.id)}">${icon('bed')}<span>ห้อง ${esc(r.no)}</span><small>${esc(roomDayStatus(r.id, todayStr()).label)}</small></button>`).join('');
    if (guests.length) h += `<h4>แขก</h4>` + guests.map(g => `<button data-guest="${esc(g.id)}">${avatar(g.name, 'avatar sm')}<span>${esc(g.name)}</span><small>${esc(g.nationality || g.phone || '')}</small></button>`).join('');
    if (bks.length) h += `<h4>การจอง</h4>` + bks.map(b => `<button data-bk="${esc(b.id)}">${icon('calendar')}<span>${esc(b.guest)} · ห้อง ${esc(roomNo(b.roomId))}</span><small>${fmtShort(b.checkIn)} → ${fmtShort(b.checkOut)}</small></button>`).join('');
    pop.innerHTML = h || '<div class="empty">ไม่พบผลลัพธ์</div>'; pop.hidden = false;
    pop.querySelector('button')?.classList.add('hl');
  };
  inp.addEventListener('input', run); inp.addEventListener('focus', run);
  inp.addEventListener('keydown', e => {
    const btns = $$('button', pop); let i = btns.findIndex(b => b.classList.contains('hl'));
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (!btns.length) return; btns[i]?.classList.remove('hl'); i = (i + (e.key === 'ArrowDown' ? 1 : -1) + btns.length) % btns.length; btns[i].classList.add('hl'); btns[i].scrollIntoView({ block: 'nearest' }); }
    if (e.key === 'Enter') { e.preventDefault(); btns[i]?.click(); }
    if (e.key === 'Escape') { pop.hidden = true; inp.blur(); }
  });
  inp.addEventListener('blur', () => setTimeout(() => pop.hidden = true, 160));
  pop.addEventListener('mousedown', e => e.preventDefault());
  pop.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return; pop.hidden = true; inp.value = '';
    if (b.dataset.room) openRoomPanel(b.dataset.room, todayStr());
    if (b.dataset.guest) openGuest(b.dataset.guest);
    if (b.dataset.bk) { const x = M.bookings.get(b.dataset.bk); if (x) openBooking(x); }
  });
}

/* ================= pages skeleton ================= */
function datebar(prefix) { return `<div class="row datebar-wrap"><div class="datebar"><button class="btn sm" id="${prefix}Prev" title="วันก่อนหน้า">${icon('left')}</button><input type="date" id="${prefix}Date" required><button class="btn sm" id="${prefix}Next" title="วันถัดไป">${icon('right')}</button></div><button class="btn" id="${prefix}Today" title="กลับไปวันนี้">${icon('sun')} วันนี้</button></div>`; }
function pagesHtml() {
  return `
  <section class="page" id="p-dashboard" hidden>
    <div class="page-head"><div><h1 id="dHello">สวัสดี</h1><div class="sub" id="dSub"></div></div></div>
    <div class="dash"><div class="dash-main">
      <div class="kpis" id="dKpis"></div>
      <div><h3 style="margin-bottom:12px">บริการวันนี้</h3><div class="quick svc" id="dSvc"></div></div>
      <div class="card"><div class="card-head"><h3>การจองล่าสุด</h3><div class="spacer"></div><button class="btn sm" data-goto="chart">ดูทั้งหมด</button></div><div class="bk-list" id="dRecent"></div></div>
    </div><div class="dash-side">
      <div class="side-card" id="sideCard"></div>
      <div class="card cal"><div class="card-head"><h3 id="calTitle"></h3><div class="spacer"></div><button class="iconbtn" id="calPrev" style="width:32px;height:32px">${icon('left')}</button><button class="iconbtn" id="calNext" style="width:32px;height:32px">${icon('right')}</button></div><div class="cal-grid" id="calGrid"></div><div class="hint">สีเข้มขึ้น = มีแขกมากขึ้น · จุดส้ม = มีแขกเข้า กดวันที่เพื่อดูงานของวันนั้น</div></div>
      <div class="card"><div class="card-head"><h3>ตารางวันนี้</h3><div class="spacer"></div><button class="btn sm" data-goto="daily">ดูงานประจำวัน</button></div><div class="timeline" id="dTimeline"></div></div>
      <div class="card"><div class="card-head"><h3>เตียงเสริม / เปลเด็ก</h3><div class="spacer"></div><button class="btn sm" data-goto="equip">ดูผังทั้งเดือน</button></div><div id="dEquip"></div></div>
      <div class="card"><div class="card-head"><h3>วันเกิดแขก</h3><div class="spacer"></div><button class="btn sm" id="dBdayAll">ดูทั้งเดือน</button></div><div id="dBday"></div></div>
      <div class="card"><div class="card-head"><h3>งานแม่บ้าน</h3><div class="spacer"></div><button class="btn sm" data-goto="plan">ดูแผนผัง</button></div><div class="hk-sum" id="dHk"></div></div>
    </div></div>
  </section>

  <section class="page" id="p-plan" hidden>
    <div class="page-head"><div><h1>ห้องพัก</h1><div class="sub">กดที่ห้องเพื่อดูแขกที่พักอยู่ เปลี่ยนสถานะแม่บ้าน หรือจองห้อง</div></div><div class="spacer"></div>${datebar('p')}</div>
    <div class="statgrid" id="pStats"></div>
    <div class="plan-filters" id="pFilters"></div>
    <div class="card plan-card"><div class="plan-scroll"><div class="plan" id="plan"></div></div></div>
  </section>

  <section class="page" id="p-chart" hidden>
    <div class="page-head"><div><h1>ผังการจอง</h1><div class="sub">ลากเพื่อย้าย · ลากขอบเพื่อเปลี่ยนวัน · ลากในช่องว่างเพื่อจองใหม่ · คลิกเพื่อแก้ไข · คลิกขวาเพื่อดูเมนู</div></div><div class="spacer"></div>
      </div>
    <div class="g-tools" id="gTools">
      <div class="gt-grp"><button class="btn sm primary" id="gtNew">${icon('plus')} จองใหม่</button><button class="btn sm" id="gtBlock">ปิดห้อง / ซ่อม</button><button class="btn sm" id="findFree">${icon('door')} หาห้องว่าง</button></div>
      <div class="gt-grp"><button class="btn sm" id="gtUndo" title="เลิกทำ (Ctrl+Z)" disabled>↶ เลิกทำ</button></div>
      <div class="gt-grp"><span class="gt-l">แสดง</span><select id="gtRange" class="inline"><option value="1">1 เดือน</option><option value="2">2 เดือน</option><option value="3">3 เดือน</option></select>
        <span class="gt-l">ซูม</span><button class="btn sm" id="gtZoomOut" title="ย่อ">−</button><span id="gtZoomVal" class="gt-v">100%</span><button class="btn sm" id="gtZoomIn" title="ขยาย">+</button></div>
      <div class="gt-grp"><input type="search" id="gtFind" placeholder="ค้นหาแขก / เลขที่จอง" style="width:190px"><select id="gtChan" class="inline"><option value="">ทุกช่องทาง</option></select></div>
      <div class="gt-grp"><div class="datebar gt-dates"><button class="btn sm" id="gPrev">${icon('left')} เดือนก่อน</button><button class="btn sm" id="gMonthBtn" style="min-width:150px;justify-content:space-between"><span id="gMonthLabel"></span>${icon('calendar')}</button><button class="btn sm" id="gNext">เดือนถัดไป ${icon('right')}</button><button class="btn sm" id="gToday">เดือนนี้</button></div></div>
      <div class="gt-grp"><button class="btn sm" id="gtXls">${icon('xls')} Excel</button></div>
    </div>
    <div class="gscroll" id="gscroll"></div>
    <div class="row chart-foot"><div class="seg" id="gColorMode"><button type="button" data-cmode="channel">สีตามช่องทาง (เหมือน Excel)</button><button type="button" data-cmode="status">สีตามสถานะ</button></div><div class="legend" id="gLegend"></div></div>
  </section>

  <section class="page" id="p-daily" hidden>
    <div class="page-head"><div><h1 id="dlTitle">งานประจำวัน</h1><div class="sub">เช็คอิน เช็คเอาท์ อาหารเช้า ทำความสะอาด และผ้าซัก ทุกเครื่องเห็นพร้อมกัน</div></div><div class="spacer"></div><button class="btn" id="inHouseBtn">${icon('print')} In House Report</button>${datebar('dl')}</div>
    <div class="statgrid" id="dlStats"></div>
    <div class="mini-strip" id="dlMini"><button class="mini-btn" id="todoAdd" title="ฝากงาน (To Do List)">${icon('check')}<em class="badge" id="todoCount" hidden></em></button><div id="todoList" class="mini-list"></div><button class="mini-btn" id="dlRpNew" title="แจ้งซ่อม">${icon('wrench')}<em class="badge" id="dlRpCount" hidden></em></button><div id="dlRepairs" class="mini-list"></div></div>
    <div class="grid2">
      <div class="card"><div class="card-head"><h3>เช็คอินวันนี้</h3><span class="hint" id="arrCount"></span></div><div class="tw" id="arrivals"></div></div>
      <div class="card"><div class="card-head"><h3>เช็คเอาท์วันนี้</h3><span class="hint" id="depCount"></span></div><div class="tw" id="departures"></div></div>
    </div>
    <div class="card"><div class="card-head"><h3>${icon('car')} รถรับส่ง / แท็กซี่</h3><span class="hint" id="txCount"></span><div class="spacer"></div><button class="btn sm" id="copyTx">${icon('copy')} คัดลอกรายการรถ</button></div><div id="txList" class="tx-day"></div></div>
    <div class="card"><div class="card-head"><h3>ห้องที่มีแขก</h3><span class="hint" id="opsCount"></span><div class="spacer"></div>
      <button class="btn sm" id="copyBf">${icon('coffee')} คัดลอกรายการอาหารเช้า</button><button class="btn sm" id="copyLaundry">${icon('copy')} คัดลอกรายการผ้าซัก</button><button class="btn sm" id="copyTm30">${icon('copy')} คัดลอกรายชื่อแจ้ง ตม.30</button></div>
      <div class="hint" style="margin-bottom:10px">อาหารเช้าคิดจากคืนที่พักก่อนวันนี้ · กดปุ่มเพื่อเปิด/ปิดแต่ละรายการ ทุกเครื่องเห็นพร้อมกัน</div><div id="opsTable"></div></div>
  </section>

  <section class="page" id="p-guests" hidden>
    <div class="page-head"><div><h1>ฐานข้อมูลแขก</h1><div class="sub" id="gCount"></div></div><div class="seg viewtabs" id="gViews"><button type="button" data-gview="list" aria-pressed="true">${icon('users')} รายชื่อแขก</button><button type="button" data-gview="channel" aria-pressed="false">${icon('chart')} ตามช่องทางการจอง</button></div><div class="spacer"></div><button class="btn primary" id="gAdd">${icon('userplus')} เพิ่มแขก</button></div>
    <div id="gChannels" hidden></div>
    <div id="gListView">
    <div id="gBackfillBox"></div>
    <div class="row"><input type="search" id="gq" placeholder="ค้นหาชื่อ เบอร์โทร อีเมล พาสปอร์ต หรือสัญชาติ" style="flex:1 1 320px;width:auto">
      <select id="gTag" class="inline"><option value="">แขกทั้งหมด</option><option value="inhouse">พักอยู่ตอนนี้</option><option value="vip">VIP</option><option value="regular">แขกประจำ</option><option value="repeat">มามากกว่า 1 ครั้ง</option><option value="blacklist">ห้ามรับจอง</option></select>
      <select id="gSort" class="inline"><option value="last">มาล่าสุด</option><option value="stays">มาบ่อยที่สุด</option><option value="spent" data-fin="1">ใช้จ่ายมากที่สุด</option><option value="name">ชื่อ A–Z</option></select></div>
    <div class="card"><div class="tw" id="gResults"></div></div>
    </div>
  </section>

  <section class="page" id="p-repairs" hidden>
    <div class="page-head"><div><h1>แจ้งซ่อม</h1><div class="sub">ของเสีย ห้องมีปัญหา และงานซ่อมทั้งหมด · ทุกเครื่องเห็นพร้อมกัน</div></div><div class="spacer"></div><button class="btn primary" id="rpNew">${icon('wrench')} แจ้งซ่อม</button></div>
    <div class="row"><input type="search" id="rpQ" placeholder="ค้นหา ห้อง อะไรเสีย หรือเลขงาน" style="flex:1 1 280px;width:auto"></div>
    <div class="plan-filters" id="rpChips"></div>
    <div class="card"><div class="rp-list" id="rpList"></div></div>
  </section>

  <section class="page" id="p-docs" hidden>
    <div class="page-head"><div><h1>เอกสาร</h1><div class="sub">ใบมัดจำ สัญญา และแบบฟอร์มต่างๆ</div></div><div class="spacer"></div><button class="btn primary" id="docUpload">${icon('upload')} อัปโหลดเอกสาร</button></div>
    <div class="row"><input type="search" id="docQ" placeholder="ค้นหาเอกสาร" style="flex:1 1 280px;width:auto"></div>
    <div class="plan-filters" id="docCats"></div>
    <div class="doc-list" id="docList"></div>
  </section>

  <section class="page" id="p-reports" hidden>
    <div class="page-head"><div><h1>รายงาน</h1><div class="sub">ข้อมูลคำนวณจากการจองทั้งหมดในระบบ</div></div><div class="spacer"></div><select id="rYear" class="inline"></select></div>
    <div class="statgrid" id="rKpis"></div>
    <div class="grid2"><div class="card chart"><h3>อัตราการเข้าพักรายเดือน</h3><div id="chOcc"></div></div><div class="card chart"><h3>รายได้ค่าห้องรายเดือน (บาท)</h3><div id="chRev"></div></div></div>
    <div class="card"><h3>สรุปรายเดือน</h3><div class="tw" id="rMonths"></div></div>
    <div class="grid2"><div class="card"><div class="card-head"><h3>แยกตามช่องทางการจอง</h3><div class="spacer"></div><button class="btn sm primary" id="rChRep">${icon('file')} รายชื่อและยอดชำระ</button></div><div class="tw" id="rChannels"></div></div><div class="card"><h3>ยอดค้างชำระ</h3><div class="tw" id="rOwe"></div></div></div>
    <div class="card" id="rCompCard"><div class="card-head"><h3>แขกรับรอง · มูลค่าห้องที่ให้พักฟรี</h3><span class="hint">คิดจากตารางราคาห้องของเดือนนั้น × จำนวนคืน</span><div class="spacer"></div><span id="rCompBtns"><button class="btn sm" id="rCompPdf">${icon('file')} PDF</button> <button class="btn sm" id="rCompPrint">${icon('print')} พิมพ์</button></span></div><div class="tw" id="rComp"></div></div>
    <div class="hint" id="rNote"></div>
  </section>

  <section class="page" id="p-users" hidden>
    <div class="page-head"><div><h1>ผู้ใช้งาน</h1><div class="sub">สร้างชื่อผู้ใช้และรหัสผ่านให้พนักงาน แต่ละคนล็อกอินจากเครื่องไหนก็ได้</div></div><div class="spacer"></div><button class="btn primary" id="uAdd">${icon('userplus')} เพิ่มผู้ใช้</button></div>
    <div class="card"><div class="tw" id="uTable"></div></div>
    <div class="card"><h3>สิทธิ์การใช้งาน</h3><table class="perm"><thead><tr><th></th><th>ผู้ดูแล</th><th>Admin</th><th>พนักงาน</th></tr></thead><tbody>
      <tr><td>จองห้อง เช็คอิน/เอาท์ แขก งานประจำวัน เตียงเสริม</td><td>✓</td><td>✓</td><td>✓</td></tr>
      <tr><td>ใส่ราคา มัดจำ การชำระเงินของแต่ละการจอง · พิมพ์ใบจองพร้อมราคา</td><td>✓</td><td>✓</td><td>✓</td></tr>
      <tr><td>รายงานการเงิน รายได้รวม และสถิติรายได้</td><td>✓</td><td>✓</td><td>—</td></tr>
      <tr><td>ตั้งราคาห้องรายเดือน · อัปโหลดและแก้ไขเอกสาร</td><td>✓</td><td>✓</td><td>✓</td></tr>
      <tr><td>ลบเอกสาร · แก้ข้อมูลห้อง ตั้งค่าโรงแรม สีช่องทาง นำเข้า Excel</td><td>✓</td><td>✓</td><td>—</td></tr>
      <tr><td>หน้าผู้ใช้งาน (เพิ่มผู้ใช้ ตั้งรหัสใหม่)</td><td>✓</td><td>—</td><td>—</td></tr>
      <tr><td>การเชื่อมต่อฐานข้อมูล (รหัส BV1:)</td><td>✓</td><td>—</td><td>—</td></tr></tbody></table></div>
  </section>

  <section class="page" id="p-equip" hidden>
    <div class="page-head"><div><button class="btn sm ghost" data-goto="dashboard" style="margin-bottom:6px">${icon('left')} แดชบอร์ด</button><h1>เตียงเสริม / เปลเด็ก</h1><div class="sub">ดูว่าแต่ละคืนใช้เตียงเสริมและเปลเด็กไปกี่ตัว ใครใช้อยู่ · ใส่จำนวนได้ที่การจองแต่ละรายการ</div></div><div class="spacer"></div>
      <div class="row"><button class="btn" id="eqImportBtn" data-fin="1">${icon('xls')} นำเข้าจาก Excel</button><input type="file" id="eqFile" accept=".xlsx,.xls" hidden>
      <div class="datebar"><button class="btn sm" id="eqPrev">${icon('left')} เดือนก่อน</button><b id="eqMonthLabel" style="min-width:150px;text-align:center"></b><button class="btn sm" id="eqNext">เดือนถัดไป ${icon('right')}</button><button class="btn sm" id="eqToday">เดือนนี้</button></div></div></div>
    <div class="statgrid" id="eqStats"></div>
    <div class="gscroll eq" id="eqScroll"></div>
    <div class="legend"><span><i class="s-confirmed"></i>เตียงเสริม</span><span><i class="s-cot"></i>เปลเด็ก</span><span><i class="s-over"></i>เกินจำนวนที่มี</span></div>
    <div class="card"><div class="card-head"><h3>รายการเดือนนี้</h3><span class="hint" id="eqCount"></span></div><div class="tw" id="eqList"></div></div>
  </section>

  <section class="page" id="p-settings" hidden>
    <div class="page-head"><div><h1>ตั้งค่า</h1></div></div>
    <div class="grid2">
      <div class="card" id="generalCard"><h3>ข้อมูลทั่วไป</h3><div class="fields">
        <label class="f w2"><span>ชื่อโรงแรม</span><input type="text" id="sName"></label>
        <label class="f w2"><span>ที่อยู่โรงแรม (แสดงบนใบจอง)</span><input type="text" id="sAddr"></label>
        <label class="f"><span>เบอร์โทรโรงแรม</span><input type="tel" id="sPhone"></label>
        <label class="f"><span>อีเมลโรงแรม</span><input type="email" id="sEmail"></label>
        <label class="f"><span>ค่าไฟ (บาท/หน่วย)</span><input type="number" id="sElec" min="0" step="0.5"></label>
        <label class="f"><span>เวลาเช็คอิน / เช็คเอาท์</span><input type="text" id="sTimes" placeholder="14:00 / 12:00"></label>
        <label class="f"><span>จำนวนเตียงเสริมที่มี</span><input type="number" id="sXbed" min="0"></label>
        <label class="f"><span>จำนวนเปลเด็ก (Baby cot) ที่มี</span><input type="number" id="sCot" min="0"></label>
        <label class="f w2"><span>ช่องทางการจอง (บรรทัดละหนึ่งช่องทาง)</span><textarea id="sChannels" rows="5"></textarea></label></div>
        <div class="row"><button class="btn primary" id="sSave">บันทึก</button><span class="hint" id="adminHint"></span></div></div>
      <div class="card" id="chanColorCard"><h3>สีของช่องทางการจอง</h3><div class="hint">สีที่ใช้ในผังการจอง ตั้งให้ตรงกับที่ใช้ใน Excel เดิม</div><div id="chanColors" class="chan-colors"></div>
        <div class="row"><button class="btn primary" id="ccSave">บันทึกสี</button><button class="btn ghost" id="ccReset">ใช้สีเริ่มต้น</button></div></div>
      <div class="card" data-owner="1"><h3>การเชื่อมต่อ</h3>
        <div class="hint">ทุกเครื่องที่ใช้รหัสเชื่อมต่อเดียวกันจะเห็นข้อมูลชุดเดียวกัน ติดตั้งโปรแกรมบนเครื่องใหม่แล้ววางรหัสนี้ตอนเปิดครั้งแรก</div>
        <div class="gdl"><dt>ฐานข้อมูล</dt><dd class="num" id="connUrl"></dd><dt>เวอร์ชัน</dt><dd>${VERSION}</dd></div>
        <div class="row"><button class="btn" id="connCopy">${icon('copy')} คัดลอกรหัสเชื่อมต่อ</button><button class="btn ghost" id="connChange">${icon('link')} เปลี่ยนฐานข้อมูล</button></div>
        <div class="hint">เก็บรหัสนี้ไว้ภายในโรงแรม รหัสนี้ใช้เชื่อมต่อได้ แต่ยังต้องมีชื่อผู้ใช้และรหัสผ่านจึงจะเห็นข้อมูล</div><div id="demoResetBox"></div></div>
    </div>
    <div class="card"><div class="card-head"><h3>ห้องพัก</h3><span class="hint" id="roomCount"></span><div class="spacer"></div><button class="btn sm" id="addRoom">${icon('plus')} เพิ่มห้อง</button></div><div class="tw" id="roomsTable"></div></div>
    <div class="grid2">
      <div class="card" id="notifCard"><div class="card-head"><h3>การแจ้งเตือน</h3><div class="spacer"></div><button class="btn sm" id="nfTest">ทดสอบ</button></div>
        <div class="hint">ขึ้นที่มุมจอของ Windows / Mac แล้วหายไปเอง (ดูย้อนหลังได้ในศูนย์การแจ้งเตือน) · การเปลี่ยนแปลงจากเครื่องอื่นจะเตือนตอนที่ไม่ได้เปิดหน้าแอปอยู่ · ตั้งแยกแต่ละเครื่อง</div>
        <div class="row" style="flex-wrap:wrap;gap:8px 18px;margin-top:8px"><label class="chk"><input type="checkbox" id="nfOn"> <b>เปิดการแจ้งเตือน</b></label>
          ${Object.entries(NOTIF_KINDS).map(([k, l]) => `<label class="chk"><input type="checkbox" data-nf="${k}"> ${l}</label>`).join('')}
          <label class="chk"><input type="checkbox" data-nf="always"> แจ้งแม้ตอนเปิดหน้าแอปอยู่</label></div>
        <div class="row" style="margin-top:8px;gap:8px"><span>เตือนรถรับส่งก่อนเวลา</span><select id="nfLead" style="width:auto">${[15, 30, 60, 90, 120].map(m => `<option value="${m}">${m < 60 ? m + ' นาที' : m / 60 + ' ชั่วโมง'}</option>`).join('')}</select><span class="hint">· วันเกิดแขกเตือนตอน 8 โมงเช้า · รถของพรุ่งนี้ที่ยังไม่ได้จองเตือนตอน 5 โมงเย็น</span></div>
        <div class="hint owe" id="nfPerm"></div></div>
      <div class="card" id="xsCard"><div class="card-head"><h3>ดึงข้อมูลจาก Excel อัตโนมัติ</h3><div class="spacer"></div><button class="btn sm primary" id="xsNow">${icon('refresh')} ดึงตอนนี้</button><label class="btn sm" title="ใช้ไฟล์ที่ดาวน์โหลดไว้แทน">เลือกไฟล์<input type="file" id="xsFile" accept=".xlsx" hidden></label></div>
        <div class="hint">ดึงการจองและตารางรถรับส่งสนามบินจาก Excel บน Google Drive มาอัปเดตในแอป ทุก 30 นาที · ไม่มีการเขียนกลับไปที่ Excel · ข้อมูลที่แก้ใน Excel จะใช้ตาม Excel · ที่แก้ในแอปอย่างเดียวจะเก็บไว้ และขึ้นรายการที่ไม่ตรงกับ Excel ให้ตรวจ</div>
        <div class="fields"><label class="f w2"><span>ลิงก์ไฟล์ Excel (Google Drive)</span><input type="url" id="xsUrl" placeholder="https://docs.google.com/spreadsheets/d/…"></label></div>
        <div class="row"><label class="chk"><input type="checkbox" id="xsAuto"> ดึงอัตโนมัติ</label><button class="btn sm" id="xsSaveCfg">บันทึก</button></div>
        <div class="hint" id="xsStatus"></div><div id="xsConflicts"></div></div>
      <div class="card" data-fin="1"><h3>นำเข้าข้อมูลจาก Excel เดิม</h3><div class="hint">ดาวน์โหลดไฟล์ Booking Schedule จาก Google Drive เป็น .xlsx แล้วเลือกไฟล์ ระบบอ่านช่องที่ผสานเป็นช่วงวันพัก นำเข้าซ้ำได้โดยไม่เกิดรายการซ้ำ</div><input type="file" id="xFile" accept=".xlsx,.xls"><div id="xPreview"></div></div>
      <div class="card" data-fin="1"><h3>ส่งออกข้อมูล</h3><div class="hint">บันทึกการจองเป็นไฟล์ CSV เปิดด้วย Excel ได้</div>
        <div class="fields"><label class="f"><span>ตั้งแต่</span><input type="date" id="eFrom"></label><label class="f"><span>ถึง</span><input type="date" id="eTo"></label></div>
        <div class="row"><button class="btn" id="eGo">บันทึกไฟล์ CSV</button><button class="btn" id="eGuests">บันทึกรายชื่อแขก CSV</button></div></div>
    </div>
    <div class="card"><h3>ประวัติการแก้ไขล่าสุด</h3><div class="tw" id="logTable"></div></div>
  </section>`;
}

function bindPages() {
  // dashboard
  $('#p-dashboard').addEventListener('click', e => {
    const q = e.target.closest('[data-q]')?.dataset.q;
    if (q === 'new') openBooking(null, { checkIn: todayStr(), checkOut: addDays(todayStr(), 1) });
    if (q === 'guest') openGuest(null); if (q === 'free') openFinder(); if (q === 'rates') openRates(); if (q === 'taxi') setPage('daily'); if (q === 'equip') setPage('equip'); if (q === 'inhouse') openInHouse(todayStr()); if (q === 'report') setPage('reports'); if (q === 'daily') setPage('daily'); if (q === 'bday') openBirthdayPop(e.target.closest('[data-q]'));
    const it = e.target.closest('[data-bk]'); if (it) { const b = M.bookings.get(it.dataset.bk); if (b) openBooking(b); }
    const d = e.target.closest('[data-day]'); if (d) { S.day = d.dataset.day; setPage('daily'); }
  });
  $('#content').addEventListener('click', e => { const g = e.target.closest('[data-goto]'); if (g) setPage(g.dataset.goto); });
  $('#dBdayAll').onclick = () => openBirthdays(todayStr().slice(0, 7));
  $('#calPrev').onclick = () => { const d = parseD(S.calMonth + '-01'); d.setUTCMonth(d.getUTCMonth() - 1); S.calMonth = toStr(d).slice(0, 7); renderDashboard(); };
  $('#calNext').onclick = () => { const d = parseD(S.calMonth + '-01'); d.setUTCMonth(d.getUTCMonth() + 1); S.calMonth = toStr(d).slice(0, 7); renderDashboard(); };
  // date bars
  for (const p of ['p', 'dl']) {
    $(`#${p}Prev`).onclick = () => { S.day = addDays(S.day, -1); render(); };
    $(`#${p}Next`).onclick = () => { S.day = addDays(S.day, 1); render(); };
    $(`#${p}Today`).onclick = () => { S.day = todayStr(); render(); };
    $(`#${p}Date`).onchange = e => { if (validD(e.target.value)) { S.day = e.target.value; render(); } };
  }
  // plan
  $('#plan').addEventListener('click', e => { const t = e.target.closest('.room'); if (t) openRoomPanel(t.dataset.room, S.day); });
  $('#pFilters').addEventListener('click', e => { const c = e.target.closest('[data-f]'); if (c) { S.planFilter = S.planFilter === c.dataset.f ? '' : c.dataset.f; renderPlan(); } });
  // chart
  bindChart();
  const shiftMonth = n => { const d = parseD(S.gMonth + '-01'); d.setUTCMonth(d.getUTCMonth() + n); S.gMonth = toStr(d).slice(0, 7); $('#gscroll').scrollLeft = 0; renderChart(); };
  $('#gPrev').onclick = () => shiftMonth(-1);
  $('#gNext').onclick = () => shiftMonth(1);
  $('#gToday').onclick = () => { S.gMonth = todayStr().slice(0, 7); renderChart(); };
  $('#gMonthBtn').onclick = e => openMonthPicker(e.currentTarget);
  $('#findFree').onclick = () => openFinder();
  // daily
  bindDaily(); bindEquip();
  // guests
  bindChannels(); bindDocs(); bindTodos(); bindRepairs();
  $('#gViews').addEventListener('click', e => { const b = e.target.closest('[data-gview]'); if (!b) return; S.gView = b.dataset.gview; lsSet('bv.gView', S.gView);
    $$('#gViews [data-gview]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.gview === S.gView))); $('#gChannels').hidden = S.gView !== 'channel'; $('#gListView').hidden = S.gView === 'channel'; render(); });
  S.gView = lsGet('bv.gView', 'list'); $$('#gViews [data-gview]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.gview === S.gView))); $('#gChannels').hidden = S.gView !== 'channel'; $('#gListView').hidden = S.gView === 'channel';
  const gReset = () => { S.gPage = 1; renderGuests(); };
  $('#gq').addEventListener('input', gReset); $('#gTag').onchange = gReset; $('#gSort').onchange = gReset;
  $('#gResults').addEventListener('click', e => { const b = e.target.closest('[data-pg]'); if (b && !b.disabled) { S.gPage = +b.dataset.pg; renderGuests(); $('#gResults').scrollIntoView({ block: 'start' }); } });
  $('#gBackfillBox').addEventListener('click', async e => { if (!e.target.closest('#gFixNat')) return;
    const rows = [...M.guests.values()].filter(g => g.nationality && normNat(g.nationality) !== g.nationality).map(g => ({ col: 'guests', id: g.id, data: { ...g, nationality: normNat(g.nationality) } }))
      .concat(allBookings().filter(b => b.nationality && normNat(b.nationality) !== b.nationality).map(b => ({ col: 'bookings', id: b.id, data: { ...b, nationality: normNat(b.nationality) } })));
    if (await save(() => Store.putMany(rows), `แก้สัญชาติแล้ว ${rows.length} รายการ`)) logAct(`แก้สัญชาติให้ตรงมาตรฐาน ${rows.length} รายการ`); });
  $('#gAdd').onclick = () => openGuest(null);
  $('#gResults').addEventListener('click', e => { const tr = e.target.closest('tr[data-gid]'); if (tr) openGuest(tr.dataset.gid); });
  $('#gBackfillBox').addEventListener('click', e => { if (e.target.closest('#gBackfill')) backfillGuests(); });
  // reports
  $('#rYear').onchange = renderReports;
  $('#p-reports').addEventListener('click', e => {
    if (e.target.closest('#rChRep')) { openChannelReport(+$('#rYear').value); return; }
    if (e.target.closest('[data-goto-comp]')) { $('#rCompCard').scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    const pr = e.target.closest('#rCompPrint, #rCompPdf');
    if (pr) { const y = +$('#rYear').value, h = `<div class="ih"><div class="ih-title">แขกรับรอง · ปี ${y}<span>${esc(settings().hotelName || '')}</span></div>${compReportHtml(y, compRows(y))}</div>`; pr.id === 'rCompPdf' ? exportPdf(h, `Complimentary_${y}`) : printHtml(h); return; }
    const tr = e.target.closest('tr.click[data-id]'); if (tr) { const b = M.bookings.get(tr.dataset.id); if (b) openBooking(b); } });
  // users
  $('#uAdd').onclick = () => openUser(null);
  $('#uTable').addEventListener('click', e => { const b = e.target.closest('[data-u]'); if (!b) return; const id = b.dataset.u, act = b.dataset.act; if (act === 'edit') openUser(id); if (act === 'pw') openResetPw(id); });
  // settings
  bindSettings();
}

/* ================= DASHBOARD ================= */
function spark(vals, color) {
  const W = 200, H = 42, max = Math.max(1, ...vals), min = Math.min(0, ...vals), n = vals.length;
  const pts = vals.map((v, i) => [i * (W / (n - 1)), H - 4 - (v - min) / (max - min || 1) * (H - 10)]);
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const last = pts[pts.length - 1];
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="color:${color}"><path d="${line} L${W} ${H} L0 ${H} Z" fill="currentColor" opacity=".12"/><path d="${line}" fill="none" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke"/><circle cx="${last[0]}" cy="${last[1]}" r="3" fill="currentColor"/></svg>`;
}
function delta(a, b) {
  if (!b && !a) return '<em>0%</em>';
  if (!b) return '<em class="up">ใหม่</em>';
  const p = (a - b) / b * 100; const up = p >= 0;
  return `<em class="${up ? 'up' : 'down'}">${up ? '↑' : '↓'} ${Math.abs(p).toFixed(0)}%</em>`;
}
function renderDashboard() {
  const t = todayStr(), me = Store.me;
  const h = new Date().getHours();
  $('#dHello').textContent = `${h < 12 ? 'สวัสดีตอนเช้า' : h < 17 ? 'สวัสดีตอนบ่าย' : 'สวัสดีตอนเย็น'}, ${me?.display_name || me?.username || ''}`;
  $('#dSub').textContent = `ภาพรวมของ ${settings().hotelName} · ${fmtLong(t)}`;
  const days = Array.from({ length: 14 }, (_, i) => addDays(t, i - 13));
  const ms = days.map(dayMetrics); const m = ms[13], y = ms[12];
  $('#dKpis').innerHTML = `
    ${canStats() ? `<div class="kpi k-violet"><div class="ic">${icon('wallet')}</div><span>รายได้ค่าห้องคืนนี้</span><b>฿${money(m.rev)}</b><div class="delta">${delta(m.rev, y.rev)} เทียบเมื่อวาน</div>${spark(ms.map(x => x.rev), 'var(--violet)')}</div>`
      : `<div class="kpi k-violet"><div class="ic">${icon('users')}</div><span>แขกที่พักคืนนี้</span><b>${m.pax}<small style="font-size:15px;color:var(--muted)"> ท่าน</small></b><div class="delta">${delta(m.pax, y.pax)} เทียบเมื่อวาน</div>${spark(ms.map(x => x.pax), 'var(--violet)')}</div>`}
    <div class="kpi k-green"><div class="ic">${icon('bed')}</div><span>ห้องมีแขกคืนนี้</span><b>${m.occ}<small style="font-size:15px;color:var(--muted)"> / ${m.sellable}</small></b><div class="delta">${delta(m.occ, y.occ)} เทียบเมื่อวาน</div>${spark(ms.map(x => x.occ), 'var(--green)')}</div>
    <div class="kpi k-blue"><div class="ic">${icon('arrowin')}</div><span>เช็คอินวันนี้</span><b>${m.arr}</b><div class="delta"><em>${m.arrDone} เข้าแล้ว</em> · ออก ${m.dep}</div>${spark(ms.map(x => x.arr), 'var(--blue)')}</div>
    <div class="kpi k-orange"><div class="ic">${icon('pie')}</div><span>อัตราการเข้าพัก</span><b>${Math.round(m.pct)}%</b><div class="delta">${delta(m.pct, y.pct)} เทียบเมื่อวาน</div>${spark(ms.map(x => x.pct), 'var(--orange)')}</div>`;
  const near = b => Math.abs(diffDays(t, b.checkIn));
  const recent = allBookings().filter(b => b.kind !== 'block').sort((a, b) => String(b._at || '').localeCompare(String(a._at || '')) || near(a) - near(b)).slice(0, 6);
  $('#dRecent').innerHTML = recent.length ? recent.map(b => { const r = roomById(b.roomId) || {}; const g = b.guestId ? M.guests.get(b.guestId) : null; return `
    <div class="bk-item" data-bk="${esc(b.id)}"><div class="roomtag ${r.type === 'family' ? 'rt-family' : 'rt-single'}">${esc(r.no || '?')}<small>${r.type === 'family' ? 'FAMILY' : esc((r.bed || 'ROOM').toUpperCase())}</small></div>
      <div style="min-width:0"><b>${esc(b.guest)}</b><div class="sm">${esc((g?.email || b.email || g?.phone || b.phone || b.channel || '—'))}</div></div>
      <div style="min-width:0"><b style="font-weight:500">${fmtShort(b.checkIn)} → ${fmtShort(b.checkOut)}</b><div class="sm">${nightsOf(b)} คืน${b.channel ? ' · ' + esc(b.channel) : ''}</div></div>
      <span class="pill p-${b.status}">${STATUS[b.status] || ''}</span><button class="iconbtn" style="width:32px;height:32px;border:0" title="เปิด">${icon('more')}</button></div>`; }).join('') : '<div class="empty">ยังไม่มีการจอง กด “จองใหม่” เพื่อเริ่ม</div>';
  // calendar
  const first = parseD(S.calMonth + '-01'); const start = addDays(S.calMonth + '-01', -first.getUTCDay());
  $('#calTitle').textContent = `${MON_FULL[first.getUTCMonth()]} ${first.getUTCFullYear()}`;
  let cg = DOW.map(d => `<div class="dow">${d.toUpperCase()}</div>`).join('');
  for (let i = 0; i < 42; i++) {
    const d = addDays(start, i); const mm = dayMetrics(d);
    const lvl = mm.pct >= 85 ? 4 : mm.pct >= 60 ? 3 : mm.pct >= 30 ? 2 : mm.pct > 0 ? 1 : 0;
    cg += `<button data-day="${d}" class="${d.slice(0, 7) !== S.calMonth ? 'out ' : ''}${lvl ? 'o' + lvl + ' ' : ''}${d === t ? 'today ' : ''}${d === S.day && d !== t ? 'sel' : ''}" title="${fmtLong(d)} · มีแขก ${mm.occ} ห้อง${mm.arr ? ' · เข้า ' + mm.arr : ''}">${parseD(d).getUTCDate()}${mm.arr ? '<i></i>' : ''}</button>`;
  }
  $('#calGrid').innerHTML = cg;
  // timeline
  const tm = times(); const items = [];
  for (const b of allBookings()) {
    if (!isActive(b) || b.kind === 'block') continue;
    if (b.checkIn === t) items.push({ t: b.eta || tm.in, kind: 'in', b, done: b.status === 'checked_in' || b.status === 'checked_out' });
    if (b.checkOut === t) items.push({ t: tm.out, kind: 'out', b, done: b.status === 'checked_out' });
  }
  for (const x of transfersOn(t)) items.push({ t: x.t.time || '—', kind: 'tx', b: x.b, tx: x.t, done: x.t.status === 'done' });
  items.sort((a, b) => a.t.localeCompare(b.t));
  $('#dTimeline').innerHTML = items.length ? items.slice(0, 8).map(x => `<div class="tl tl-${x.kind}${x.done ? ' tl-done' : ''}" data-bk="${esc(x.b.id)}"><div class="t">${esc(x.t)}</div><div class="dot"></div><div class="box"><b>${x.kind === 'tx' ? (x.tx.type === 'pickup' ? 'รถรับ' : x.tx.type === 'dropoff' ? 'รถส่ง' : 'รถ') : x.kind === 'in' ? 'เช็คอิน' : 'เช็คเอาท์'} · ห้อง ${esc(roomNo(x.b.roomId))}${x.done ? ' ✓' : ''}</b><span>${esc(x.b.guest)} · ${x.kind === 'tx' ? esc(txLine(x.tx)) + (x.tx.status === 'need' ? ' · ยังไม่ได้จองรถ' : '') : nightsOf(x.b) + ' คืน'}</span></div></div>`).join('') + (items.length > 8 ? `<div class="hint">และอีก ${items.length - 8} รายการ</div>` : '') : '<div class="empty">วันนี้ไม่มีแขกเข้าหรือออก</div>';
  renderBirthdayCard(); renderEquipCard(); renderServices();
  // housekeeping
  const rs = roomState(); const c = { clean: 0, dirty: 0, inspected: 0 };
  activeRooms().forEach(r => { const k = rs[r.id]?.hk; if (c[k] != null) c[k]++; });
  $('#dHk').innerHTML = `<div style="background:var(--green-soft)"><b style="color:var(--green)">${c.clean}</b><span>สะอาดแล้ว</span></div><div style="background:var(--amber-soft)"><b style="color:var(--amber)">${c.dirty}</b><span>รอทำความสะอาด</span></div><div style="background:var(--accent-soft)"><b style="color:var(--accent)">${c.inspected}</b><span>ตรวจแล้ว</span></div>`;
}

/* ================= PLAN ================= */
function renderPlan() {
  const d = S.day; $('#pDate').value = d;
  const box = $('#plan');
  if (!M.rooms.size) { box.innerHTML = '<div class="empty" style="grid-column:1/-1">กำลังโหลดห้องพัก…</div>'; return; }
  const rs = roomState();
  const counts = { all: 0, vacant: 0, in: 0, arr: 0, dep: 0, block: 0 }; let guestsIn = 0, dirty = 0;
  const tile = (r, col, pos) => {
    const st = roomDayStatus(r.id, d); counts.all++; counts[st.k]++; if (st.dep) counts.dep++;
    const hk = rs[r.id]?.hk || 'none'; if (hk === 'dirty') dirty++;
    let cls = st.k; if (st.k === 'vacant' && (hk === 'clean' || hk === 'inspected')) cls = 'ready';
    let label = { vacant: 'ว่าง', ready: 'พร้อมขาย', in: 'มีแขก', arr: st.dep ? 'ออก+เข้า' : 'เข้าวันนี้', dep: 'ออกวันนี้', block: 'ปิดห้อง' }[cls];
    let guest = '', sub = '';
    if (st.b && st.b.kind === 'block') { guest = st.b.reason || 'ปิดห้อง'; sub = `ถึง ${fmtShort(st.b.checkOut)}`; }
    else if (st.b) {
      guest = st.b.guest; guestsIn += (+st.b.adults || 0) + (+st.b.children || 0);
      const left = diffDays(d, st.b.checkOut);
      sub = st.k === 'in' ? `อีก ${left} คืน · ออก ${fmtShort(st.b.checkOut)}` : st.dep ? `ออก: ${st.dep.guest}` : `${nightsOf(st.b)} คืน${st.b.eta ? ' · ถึง ' + st.b.eta : ''}`;
      if (st.b.breakfast) sub += ' · BF';
      if (compOf(st.b)) sub += ' · COMP';
    }
    const fam = r.type === 'family';
    const match = !S.planFilter || S.planFilter === st.k || (S.planFilter === 'dep' && st.dep);
    return `<button class="room st-${cls}${fam ? ' fam' : ''} ${pos}${match ? '' : ' dim'}" data-room="${esc(r.id)}" style="grid-column:${col}" title="${esc('ห้อง ' + r.no + ' · ' + roomLabel(r))}">
      <div class="band"></div><div class="rb">
        <div class="rtop"><div><span class="rno">${esc(r.no)}</span><span class="rty">${fam ? 'Family' : esc(r.bed || 'Room')}</span></div><span class="hkic ${hk}" title="${esc(HK[hk] || 'ยังไม่ระบุสถานะแม่บ้าน')}">${icon(hk === 'dirty' ? 'broom' : hk === 'none' ? 'more' : 'check')}</span></div>
        <span class="rst"><i></i>${esc(label)}</span>
        ${guest ? `<div class="rguest" title="${esc(guest)}">${esc(guest)}</div>` : ''}
        ${sub ? `<span class="rsub" title="${esc(sub)}">${esc(sub)}</span>` : ''}
      </div></button>`;
  };
  let html = `<div class="bldg"><div>${icon('bell')}Front Office</div><div>${icon('utensils')}Restaurant</div></div>`;
  const placed = new Set();
  for (const r of activeRooms()) {
    if (PLAN_TOP[r.no]) { html += tile(r, PLAN_TOP[r.no], 'top'); placed.add(r.id); }
    else if (PLAN_BOTTOM[r.no]) { html += tile(r, PLAN_BOTTOM[r.no], 'bot'); placed.add(r.id); }
  }
  let extra = 1; for (const r of activeRooms()) if (!placed.has(r.id)) html += tile(r, extra++, 'extra');
  box.innerHTML = html;
  const m = dayMetrics(d);
  $('#pStats').innerHTML = `<div class="stat"><span>มีแขกคืนนี้</span><b>${m.occ} / ${m.sellable}</b><small>${Math.round(m.pct)}% · ${m.pax} ท่าน</small></div><div class="stat"><span>เข้าวันนี้</span><b>${m.arr}</b><small>เข้าแล้ว ${m.arrDone}</small></div><div class="stat"><span>ออกวันนี้</span><b>${m.dep}</b><small>${fmtLong(d)}</small></div><div class="stat"><span>ว่างคืนนี้</span><b>${m.sellable - m.occ}</b><small>ห้องที่ขายได้</small></div><div class="stat"><span>รอทำความสะอาด</span><b>${dirty}</b><small>ห้อง</small></div>`;
  const F = [['', 'ทั้งหมด', 'var(--ink)', counts.all], ['vacant', 'ว่าง', 'var(--green)', counts.vacant], ['in', 'มีแขกพักอยู่', 'var(--accent)', counts.in], ['arr', 'เข้าวันนี้', 'var(--blue)', counts.arr], ['dep', 'ออกวันนี้', 'var(--orange)', counts.dep], ['block', 'ปิดห้อง', 'var(--red)', counts.block]];
  $('#pFilters').innerHTML = F.map(([k, l, c, n]) => `<button class="chip" data-f="${k}" aria-pressed="${S.planFilter === k}"><i style="background:${c}"></i>${l}<b>${n}</b></button>`).join('');
}
function guestCard(b, d, heading) {
  const g = b.guestId ? M.guests.get(b.guestId) : null;
  const visits = g ? (guestStats().get(g.id)?.stays || 0) : 0;
  const nat = g?.nationality || b.nationality, phone = g?.phone || b.phone, pass = g?.passport || b.passport;
  const bal = (b.src === 'excel' || !canFinance()) ? 0 : balanceOf(b), left = diffDays(d, b.checkOut);
  const tags = (g?.tags || []).map(t => `<span class="pill ${t === 'blacklist' ? 'p-bad' : 'p-vip'}">${esc(TAGS[t] || t)}</span>`).join('');
  return `<div class="gcard"><div class="hint">${esc(heading)}</div>
    <div class="gname">${avatar(b.guest)} ${esc(b.guest)} ${tags}</div>
    <div class="gmeta">${[nat && esc(nat), ((+b.adults || 0) + (+b.children || 0)) ? `${+b.adults || 0} ผู้ใหญ่${+b.children ? ' · ' + b.children + ' เด็ก' : ''}` : '', visits > 1 ? `มาพักครั้งที่ ${visits}` : (g ? 'มาพักครั้งแรก' : '')].filter(Boolean).join(' · ')}</div>
    <dl class="gdl"><dt>เช็คอิน</dt><dd>${fmtLong(b.checkIn)}</dd><dt>เช็คเอาท์</dt><dd>${fmtLong(b.checkOut)}${left > 0 ? ` <span class="hint">(อีก ${left} คืน)</span>` : ''}</dd>
      ${phone ? `<dt>โทร</dt><dd class="num">${esc(phone)}</dd>` : ''}${pass ? `<dt>พาสปอร์ต</dt><dd class="num">${esc(pass)}</dd>` : ''}
      <dt>สถานะ</dt><dd><span class="pill p-${b.status}">${STATUS[b.status] || ''}</span>${b.breakfast ? ' <span class="pill p-checked_in">รวมอาหารเช้า</span>' : ''}</dd>
      ${b.channel ? `<dt>ช่องทาง</dt><dd>${esc(b.channel)}${b.ref ? ' · ' + esc(b.ref) : ''}</dd>` : ''}
      ${bal > 0 ? `<dt>คงค้าง</dt><dd class="owe num">${money(bal)} บาท</dd>` : ''}${b.notes ? `<dt>หมายเหตุ</dt><dd>${esc(b.notes)}</dd>` : ''}${g?.notes ? `<dt>บันทึกแขก</dt><dd>${esc(g.notes)}</dd>` : ''}</dl>
    <div class="row"><button class="btn sm" data-open-bk="${esc(b.id)}">เปิดการจอง</button>${g ? `<button class="btn sm" data-open-guest="${esc(g.id)}">โปรไฟล์แขก</button>` : ''}
      ${b.status !== 'checked_in' && b.status !== 'checked_out' && b.checkIn <= todayStr() ? `<button class="btn sm primary" data-quick-st="checked_in" data-id="${esc(b.id)}">เช็คอิน</button>` : ''}
      ${b.status === 'checked_in' ? `<button class="btn sm" data-quick-st="checked_out" data-id="${esc(b.id)}">เช็คเอาท์</button>` : ''}</div></div>`;
}
function openRoomPanel(roomId, d) {
  const r = roomById(roomId); if (!r) return;
  const st = roomDayStatus(roomId, d);
  const all = allBookings().filter(b => isActive(b) && b.roomId === roomId);
  const next = all.filter(b => b.checkIn > d).sort((a, b) => a.checkIn < b.checkIn ? -1 : 1)[0];
  const past = all.filter(b => b.kind !== 'block' && b.checkOut < d).sort((a, b) => a.checkIn < b.checkIn ? 1 : -1).slice(0, 5);
  const hk = roomState()[roomId]?.hk;
  const row = b => `<tr class="click" data-id="${esc(b.id)}"><td>${esc(b.kind === 'block' ? (b.reason || 'ปิดห้อง') : b.guest)}</td><td class="num">${fmtD(b.checkIn)} → ${fmtD(b.checkOut)}</td><td class="num r">${nightsOf(b)} คืน</td></tr>`;
  let main = '';
  if (st.k === 'block') main = `<div class="notice err">ปิดห้อง: ${esc(st.b.reason || '')} · ${fmtD(st.b.checkIn)} → ${fmtD(st.b.checkOut)}</div>
    <div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn sm" data-unblock="all" data-id="${esc(st.b.id)}">ยกเลิกปิดห้อง (กดผิด)</button>${st.b.checkIn < d ? `<button class="btn sm" data-unblock="today" data-id="${esc(st.b.id)}">เปิดห้องตั้งแต่วันนี้</button>` : ''}<button class="btn sm ghost" data-open-bk="${esc(st.b.id)}">แก้ไขวันปิดห้อง</button></div>`;
  else {
    if (st.dep && st.b !== st.dep) main += guestCard(st.dep, d, 'แขกที่ออกวันนี้');
    if (st.b) main += guestCard(st.b, d, st.k === 'in' ? 'แขกที่พักอยู่' : st.k === 'arr' ? 'แขกที่จะเข้าวันนี้' : 'แขกที่ออกวันนี้');
    if (!main) main = `<div class="empty">ห้องว่างใน ${esc(fmtLong(d))}</div>`;
  }
  const m = openModal(`<div class="sheet narrow" style="width:min(560px,100%)"><div class="sheet-h"><div class="roomtag ${r.type === 'family' ? 'rt-family' : 'rt-single'}">${esc(r.no)}<small>${r.type === 'family' ? 'FAMILY' : esc((r.bed || '').toUpperCase())}</small></div><div><h2>ห้อง ${esc(r.no)}</h2><div class="hint">${esc(roomLabel(r))}</div></div><div class="spacer"></div><button class="btn ghost" data-close>✕</button></div>
    <div class="sheet-b"><div class="hint">${esc(fmtLong(d))} · ${esc(st.label)}</div>${main}
      ${next ? `<div><h4 style="margin-bottom:6px">รายการถัดไป</h4><table><tbody>${row(next)}</tbody></table></div>` : ''}
      ${past.length ? `<details class="fold"><summary><h4>แขกที่เคยพักห้องนี้ล่าสุด <span class="hint">${past.length} รายการ</span></h4>${icon('right')}</summary><table><tbody>${past.map(row).join('')}</tbody></table></details>` : ''}
      <div><h4 style="margin-bottom:8px">สถานะแม่บ้าน ${roomState()[roomId]?.at ? `<span class="hint" style="font-weight:400">· อัปเดต ${fmtTime(roomState()[roomId].at)} โดย ${esc(nameOf(roomState()[roomId].by))}</span>` : ''}</h4>
        <div class="seg">${Object.entries(HK).map(([k, v]) => `<button type="button" data-hk="${k}" aria-pressed="${hk === k}">${v}</button>`).join('')}</div></div></div>
    <div class="sheet-f"><button class="btn" id="rpBlock">ปิดห้อง / ซ่อม</button><div class="spacer"></div><button class="btn primary" id="rpBook">${icon('plus')} จองห้องนี้</button></div></div>`);
  m.el.addEventListener('click', async e => {
    const ub = e.target.closest('[data-unblock]');
    if (ub) { const b = M.bookings.get(ub.dataset.id); if (!b) return; ub.disabled = true;
      const ok = ub.dataset.unblock === 'today'
        ? await save(() => Store.put('bookings', b.id, { ...b, checkOut: d, updatedAt: Date.now(), updatedBy: Store.me?.id }), `เปิดห้อง ${roomNo(b.roomId)} ตั้งแต่วันนี้แล้ว`)
        : await save(() => Store.del('bookings', b.id), `ยกเลิกปิดห้อง ${roomNo(b.roomId)} แล้ว`);
      if (ok) { logAct(`${ub.dataset.unblock === 'today' ? 'เปิดห้อง' : 'ยกเลิกปิดห้อง'} ${roomNo(b.roomId)} (${b.reason || 'ปิดซ่อม'})`); m.close(); } else ub.disabled = false; return; }
    const h = e.target.closest('[data-hk]'); if (h) { await setHk(roomId, h.dataset.hk); m.close(); return; }
    const qs = e.target.closest('[data-quick-st]'); if (qs) { const b = M.bookings.get(qs.dataset.id); if (b) { await setBookingStatus(b, qs.dataset.quickSt); m.close(); } return; }
    const ob = e.target.closest('[data-open-bk]'); if (ob) { const b = M.bookings.get(ob.dataset.openBk); m.close(); if (b) openBooking(b); return; }
    const og = e.target.closest('[data-open-guest]'); if (og) { m.close(); openGuest(og.dataset.openGuest); return; }
    const tr = e.target.closest('tr[data-id]'); if (tr) { const b = M.bookings.get(tr.dataset.id); m.close(); if (b) openBooking(b); }
  });
  $('#rpBook', m.el).onclick = () => { m.close(); openBooking(null, { roomId, checkIn: d, checkOut: addDays(d, 1) }); };
  $('#rpBlock', m.el).onclick = () => { m.close(); openBooking(null, { kind: 'block', roomId, checkIn: d, checkOut: addDays(d, 1) }); };
}
async function setHk(roomId, hk, quiet) {
  const ok = await save(() => Store.merge('state', 'rooms', { [roomId]: { hk, at: Date.now(), by: Store.me?.id } }), quiet ? null : `ห้อง ${roomNo(roomId)}: ${HK[hk]}`);
  if (ok && !quiet) logAct(`ห้อง ${roomNo(roomId)} → ${HK[hk]}`);
}
// check-out: add fines, hand back the deposit, see what is still owed — then check out
function checkoutDialog(b0) {
  return new Promise(resolve => {
    const b = withFin(b0), dep = +b.deposit || 0; let fines = Array.isArray(b.fines) ? b.fines.map(x => ({ ...x })) : [], done = false;
    const m = openModal(`<div class="sheet narrow"><div class="sheet-h"><h2>เช็คเอาท์ · ห้อง ${esc(roomNo(b.roomId))}</h2><div class="spacer"></div><button class="btn ghost" data-close>✕</button></div>
      <div class="sheet-b"><div class="co-guest"><b>${esc(b.guest)}</b><span>${fmtD(b.checkIn)} → ${fmtD(b.checkOut)} · ${nightsOf(b)} คืน</span></div>
        <div class="fx-h"><b>ค่าปรับ</b><span class="hint">ถ้ามี เช่น กุญแจหาย สูบบุหรี่ในห้อง</span><div class="spacer"></div><button type="button" class="btn sm" id="coAdd">${icon('plus')} เพิ่มค่าปรับ</button></div>
        <div id="coFines" class="fine-list"></div><datalist id="coSugg">${FINE_SUGG.map(s => `<option>${esc(s)}</option>`).join('')}</datalist>
        <div class="co-sum" id="coSum"></div></div>
      <div class="sheet-f" id="coBtns"></div></div>`, () => { if (!done) resolve(false); });
    const $m = s => m.el.querySelector(s), box = $m('#coFines');
    const row = it => { const d = document.createElement('div'); d.className = 'fine-row';
      d.innerHTML = `<input type="text" data-fn="name" list="coSugg" value="${esc(it.name || '')}" placeholder="รายการที่ปรับ"><input type="number" data-fn="amt" min="0" value="${+it.amt || ''}" placeholder="บาท"><button type="button" class="iconbtn" data-findel title="ลบ">✕</button>`;
      box.appendChild(d); return d; };
    const read = () => [...box.querySelectorAll('.fine-row')].map(r => ({ name: r.querySelector('[data-fn=name]').value.trim(), amt: +r.querySelector('[data-fn=amt]').value || 0 })).filter(x => x.name || x.amt);
    fines.forEach(row);
    const calc = () => {
      const f = read(), ft = f.reduce((s, x) => s + x.amt, 0), settled = depRefOf(b), back = settled ? refundAmtOf(b) : Math.max(0, dep - ft);
      const after = { ...b, fines: f, depRefund: dep && !settled ? { st: back >= dep ? 'full' : back > 0 ? 'part' : 'kept', amt: back } : b.depRefund };
      const bal = b.src === 'excel' ? 0 : balanceOf(after);
      return { f, ft, back, bal, after, settled };
    };
    const draw = () => {
      const c = calc();
      $m('#coSum').innerHTML = `${dep ? `<div><span>มัดจำที่แขกวางไว้</span><b>฿${money(dep)}</b></div>` : ''}${c.ft ? `<div><span>ค่าปรับรวม</span><b>฿${money(c.ft)}</b></div>` : ''}
        ${dep ? (c.settled ? `<div><span>มัดจำ</span><b>${esc(DEP_ST[c.settled.st])} ฿${money(refundAmtOf(b))}</b></div>` : `<div class="hl"><span>คืนมัดจำให้แขก</span><b>฿${money(c.back)}</b></div>${dep - c.back ? `<div><span>หักจากมัดจำ</span><b>฿${money(dep - c.back)}</b></div>` : ''}`) : ''}
        <div class="${c.bal > 0 ? 'owe' : ''}"><span>${c.bal > 0 ? 'แขกต้องจ่ายเพิ่ม' : c.bal < 0 ? 'ต้องคืนแขกเพิ่ม' : 'ยอดคงค้าง'}</span><b>${c.bal ? '฿' + money(Math.abs(c.bal)) : 'ครบแล้ว ✓'}</b></div>`;
      $m('#coBtns').innerHTML = `${dep && !c.settled ? '<button class="btn" id="coLater">ยังไม่คืนมัดจำ · เช็คเอาท์ไปก่อน</button>' : ''}<div class="spacer"></div><button class="btn" data-close>ยกเลิก</button>
        <button class="btn primary" id="coGo">${dep && !c.settled ? (c.back ? `คืนมัดจำ ฿${money(c.back)} · เช็คเอาท์` : 'หักมัดจำทั้งหมด · เช็คเอาท์') : 'เช็คเอาท์'}</button>`;
    };
    const go = async refundNow => {
      const c = calc(), fin = { ...(M.finance.get(b.id) || {}), fines: c.f };
      if (dep && !c.settled && refundNow) { const note = c.ft ? 'หักค่าปรับ: ' + c.f.map(x => x.name).filter(Boolean).join(', ') : ''; fin.depRefund = { ...c.after.depRefund, note, at: Date.now(), by: Store.me?.id }; }
      $m('#coGo').disabled = true;
      const data = { ...b0, status: 'checked_out', updatedAt: Date.now(), updatedBy: Store.me?.id };
      const ok = await save(async () => { await Store.put('finance', b.id, fin); await Store.put('bookings', b.id, data); }, `เช็คเอาท์ ${b.guest} แล้ว`);
      if (ok) { logAct(`เช็คเอาท์ ${b.guest} · ห้อง ${roomNo(b.roomId)}${c.ft ? ` · ค่าปรับ ฿${money(c.ft)}` : ''}${fin.depRefund && refundNow ? ` · คืนมัดจำ ฿${money(c.back)}` : ''}`); setHk(b.roomId, 'dirty', true); done = true; m.close(); resolve(true); }
      else $m('#coGo').disabled = false;
    };
    $m('#coAdd').onclick = () => { row({}).querySelector('input').focus(); };
    box.addEventListener('click', e => { const d = e.target.closest('[data-findel]'); if (d) { d.closest('.fine-row').remove(); draw(); } });
    box.addEventListener('input', draw);
    $m('#coBtns').addEventListener('click', e => { if (e.target.closest('#coGo')) go(true); else if (e.target.closest('#coLater')) go(false); });
    draw();
  });
}
async function setBookingStatus(b, status, direct) {
  if (status === 'checked_out' && !direct && canFinance() && b.src !== 'excel') return checkoutDialog(b);
  const data = { ...b, status, updatedAt: Date.now(), updatedBy: Store.me?.id };
  const label = status === 'checked_out' ? 'เช็คเอาท์' : status === 'confirmed' ? 'ยกเลิกเช็คอิน' : (b.status === 'checked_out' ? 'ยกเลิกเช็คเอาท์' : 'เช็คอิน');
  const ok = await save(() => Store.put('bookings', b.id, data), `${label} ${b.guest} แล้ว`);
  if (ok) { logAct(`${label} ${b.guest} · ห้อง ${roomNo(b.roomId)}`); if (status === 'checked_out') setHk(b.roomId, 'dirty', true); }
  return ok;
}

/* ================= CHART ================= */
const cw = () => parseFloat(getComputedStyle(document.getElementById('gscroll') || document.documentElement).getPropertyValue('--cw')) || 46;
function renderChart() {
  const box = $('#gscroll');
  if (!M.rooms.size) { box.innerHTML = '<div class="empty">กำลังโหลดผังห้อง…</div>'; return; }
  const keepX = box.scrollLeft, keepY = box.scrollTop;
  const start = S.gMonth + '-01', ms = parseD(start); ms.setUTCMonth(ms.getUTCMonth() + (+S.gRange || 1));
  const end = toStr(ms), N = diffDays(start, end), t = todayStr();
  // stretch the days so the whole month fits the screen
  const roomW = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--roomw')) || 104;
  const W = Math.max(18, Math.round(Math.max(34, Math.floor((box.clientWidth - roomW - 4) / N)) * (S.gZoom || 1)));
  box.style.setProperty('--cw', W + 'px');
  const days = Array.from({ length: N }, (_, i) => addDays(start, i));
  { const d = parseD(start); $('#gMonthLabel').textContent = `${MON_FULL[d.getUTCMonth()]} ${d.getUTCFullYear()}`; }
  let months = '', i = 0;
  while (i < N) { const mo = days[i].slice(0, 7); let j = i; while (j < N && days[j].slice(0, 7) === mo) j++; const d = parseD(days[i]); months += `<div class="g-month" style="width:${(j - i) * W}px">${MON_FULL[d.getUTCMonth()]} ${d.getUTCFullYear()}</div>`; i = j; }
  let dayrow = '', colsOv = '';
  days.forEach((d, k) => { const dow = parseD(d).getUTCDay(), we = dow === 0 || dow === 6, td = d === t;
    dayrow += `<div class="g-day${we ? ' we' : ''}${td ? ' td' : ''}" title="${fmtLong(d)}"><b>${parseD(d).getUTCDate()}</b>${DOW[dow]}</div>`;
    if (we || td) colsOv += `<div class="${td ? 'td' : 'we'}" style="left:${k * W}px"></div>`; });
  const inView = allBookings().filter(b => isActive(b) && b.checkIn < end && b.checkOut > start);
  const q = (S.gFind || '').trim().toLowerCase(), chf = S.gChan || '';
  const hit = b => (!q || [b.guest, b.ref, b.phone, b.reason].some(x => x && String(x).toLowerCase().includes(q))) && (!chf || (chf === '__none' ? !b.channel && b.kind !== 'block' : b.channel === chf));
  const clash = new Set();
  inView.forEach(a => inView.forEach(b => { if (a.id < b.id && a.roomId === b.roomId && a.checkIn < b.checkOut && b.checkIn < a.checkOut) { clash.add(a.id); clash.add(b.id); } }));
  const rs = roomState(); let rows = '';
  for (const [gk, gl] of [['single', 'ห้องเดี่ยว'], ['family', 'ห้อง Family · 2 ห้องนอน 2 ห้องน้ำ']]) {
    const list = activeRooms().filter(r => (r.type === 'family' ? 'family' : 'single') === gk); if (!list.length) continue;
    rows += `<div class="g-group">${gl} · ${list.length} ห้อง</div>`;
    for (const r of list) {
      const hk = rs[r.id]?.hk || 'none'; let bars = '';
      for (const b of inView.filter(b => b.roomId === r.id)) {
        const s = b.checkIn < start ? start : b.checkIn, e = b.checkOut > end ? end : b.checkOut;
        const left = diffDays(start, s) * W + (b.checkIn >= start ? W / 2 : 0), right = diffDays(start, e) * W + (b.checkOut <= end ? W / 2 : 0);
        const cls = b.kind === 'block' ? 's-block' : 's-' + (b.status || 'confirmed');
        const name = b.kind === 'block' ? (b.reason || 'ปิดห้อง') : b.guest;
        const tags = b.kind === 'block' ? '' : [compOf(b) ? 'COMP' : '', b.breakfast ? 'BF' : '', b.rateType === 'month' ? 'รายเดือน' : '', (canFinance() && b.status !== 'checked_out' && b.src !== 'excel' && balanceOf(b) > 0) ? 'ค้าง' : ''].filter(Boolean).map(x => `<span class="tg">${x}</span>`).join('');
        const bw = Math.max(14, right - left - 3);
        const col = S.chartColor !== 'status' ? barColor(b) : '', cstyle = col ? `;--bc:${col};--bi:${inkOn(col)}` : '';
        bars += `<div class="bk ${cls}${col ? ' chan' : ''}${clash.has(b.id) ? ' clash' : ''}${(q || chf) ? (hit(b) ? ' hit' : ' miss') : ''}" data-id="${esc(b.id)}" style="left:${left + 1}px;width:${bw}px${cstyle}" title="${esc(`${name} · ${fmtD(b.checkIn)} → ${fmtD(b.checkOut)} (${nightsOf(b)} คืน)${b.channel ? ' · ' + b.channel : ''}`)}"><span class="nm">${esc(name)}</span>${bw > 110 ? tags : ''}${b.status !== 'checked_out' ? `${b.status !== 'checked_in' ? '<i class="hd l"></i>' : ''}<i class="hd r"></i>` : ''}</div>`;
      }
      rows += `<div class="g-row" data-room="${esc(r.id)}"><div class="g-rh" data-roomhead="${esc(r.id)}" title="${esc(roomLabel(r))}"><span class="no">${esc(r.no)}</span><span class="ty">${r.type === 'family' ? 'Family' : esc(r.bed || '')}</span><i class="hk ${hk}" title="${esc(HK[hk] || '')}"></i></div><div class="g-lane" data-start="${start}" style="width:${N * W}px">${bars}</div></div>`;
    }
  }
  box.innerHTML = `<div class="g" style="width:calc(var(--roomw) + ${N * W}px)"><div class="g-head"><div class="g-corner">ห้อง</div><div class="g-days"><div class="g-months">${months}</div><div class="g-dayrow">${dayrow}</div></div></div><div class="g-body"><div class="g-cols">${colsOv}</div>${rows}</div></div>`;
  box.scrollLeft = keepX; box.scrollTop = keepY;
  renderChartLegend();
  $('#gtRange').value = String(S.gRange || 1); $('#gtZoomVal').textContent = Math.round((S.gZoom || 1) * 100) + '%'; $('#gtUndo').disabled = !undoStack.length;
  const sel = $('#gtChan'), chans = [...new Set(allBookings().map(b => b.channel).filter(Boolean))].sort();
  if (sel.dataset.k !== chans.join('|')) { sel.dataset.k = chans.join('|'); sel.innerHTML = '<option value="">ทุกช่องทาง</option>' + chans.map(c => `<option>${esc(c)}</option>`).join('') + '<option value="__none">ไม่ระบุช่องทาง</option>'; }
  sel.value = chf;
  if (q && !keepFind) { const f = box.querySelector('.bk.hit'); if (f) { const br = f.getBoundingClientRect(), xr = box.getBoundingClientRect(); if (br.right < xr.left || br.left > xr.right || br.top < xr.top || br.bottom > xr.bottom) f.scrollIntoView({ block: 'nearest', inline: 'center' }); } }
  keepFind = false;
}
function renderChartLegend() {
  const mode = S.chartColor === 'status' ? 'status' : 'channel';
  $$('#gColorMode [data-cmode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cmode === mode)));
  if (mode === 'status') { $('#gLegend').innerHTML = '<span><i class="s-tentative"></i>รอยืนยัน</span><span><i class="s-confirmed"></i>ยืนยันแล้ว</span><span><i class="s-checked_in"></i>เข้าพักอยู่</span><span><i class="s-checked_out"></i>ออกแล้ว</span><span><i class="s-block"></i>ปิดห้อง / ซ่อม</span>'; return; }
  const names = ['Booking.com', 'Expedia', 'Direct', 'Hotelbeds', 'Agoda', 'Biblio Globus', 'Trip.com', ...(settings().channels || [])];
  const byColor = new Map(); names.forEach(n => { const c = chanColor(n); if (!c) return; if (!byColor.has(c)) byColor.set(c, []); if (!byColor.get(c).includes(n)) byColor.get(c).push(n); });
  $('#gLegend').innerHTML = [...byColor].map(([c, ns]) => `<span><i style="background:${c}"></i>${esc(ns.join(' / '))}</span>`).join('') + '<span><i class="lg-dash"></i>รอยืนยัน</span><span><i class="lg-in"></i>เข้าพักอยู่</span><span><i class="lg-out"></i>ออกแล้ว (จาง)</span><span><i class="s-block"></i>ปิดห้อง / ซ่อม</span>';
}
let chartDragged = false, keepFind = false;
async function undoLast() {
  const u = undoStack.pop(); if (!u) return toast('ไม่มีอะไรให้เลิกทำ');
  try { await Store.undo(u.undo); toast('เลิกทำแล้ว: ' + u.msg); logAct('เลิกทำ: ' + u.msg); } catch (e) { toast(errMsg(e), 'err'); }
  const b = document.getElementById('gtUndo'); if (b) b.disabled = !undoStack.length;
}
function chartMenu(x, y, items) {
  closePop(); const el = document.createElement('div'); el.className = 'pop ctx';
  el.innerHTML = items.map((it, i) => it === '-' ? '<hr>' : `<button type="button" data-i="${i}"${it.danger ? ' class="danger"' : ''}>${it.icon ? icon(it.icon) : '<i class="i"></i>'}<span>${it.label}</span></button>`).join('');
  document.body.appendChild(el);
  el.style.left = Math.min(x, window.innerWidth - el.offsetWidth - 8) + 'px'; el.style.top = Math.min(y, window.innerHeight - el.offsetHeight - 8) + 'px';
  el.addEventListener('click', e => { const b = e.target.closest('[data-i]'); if (!b) return; el.remove(); items[+b.dataset.i].run(); });
  const off = ev => { if (!el.contains(ev.target)) { el.remove(); document.removeEventListener('mousedown', off, true); } };
  setTimeout(() => document.addEventListener('mousedown', off, true), 0);
}
function stayMenu(b, x, y) {
  const d = S.day || todayStr(), here = b.checkIn <= d && d <= b.checkOut, x2 = dailyRows(d).find(r => r.b && r.b.id === b.id);
  const items = b.kind === 'block' ? [
    { label: 'แก้ไขการปิดห้อง', icon: 'note', run: () => openBooking(M.bookings.get(b.id) || b) },
    { label: 'ยกเลิกปิดห้อง', icon: 'check', danger: true, run: async () => { if (await save(() => Store.del('bookings', b.id), `ยกเลิกปิดห้อง ${roomNo(b.roomId)}`)) logAct(`ยกเลิกปิดห้อง ${roomNo(b.roomId)} (ผังการจอง)`); } },
  ] : [
    { label: 'แก้ไขการจอง', icon: 'note', run: () => openBooking(M.bookings.get(b.id) || b) },
    { label: 'ดูรายละเอียดทั้งหมด', icon: 'users', run: () => { const r = dailyRows(here ? d : b.checkIn).find(r => r.b && r.b.id === b.id) || { r: roomById(b.roomId) || {}, b, o: {} }; openRoomSummary(r, here ? d : b.checkIn); } },
    '-',
    { label: 'รถรับส่ง / แท็กซี่', icon: 'car', run: () => openTxEditor(M.bookings.get(b.id) || b) },
    { label: 'อาหารเช้า', icon: 'coffee', run: () => openBfDetail(M.bookings.get(b.id) || b, roomNo(b.roomId)) },
    { label: 'ทำความสะอาด', icon: 'sparkle', run: () => openCleanDetail(M.bookings.get(b.id) || b, roomNo(b.roomId)) },
    ...(here ? [{ label: `ส่งผ้าซัก (${fmtShort(d)})`, icon: 'shirt', run: () => openLaundryDetail(b.roomId, M.bookings.get(b.id) || b, d, !!(x2 && x2.o.laundry)) },
      { label: `หมายเหตุ (${fmtShort(d)})`, icon: 'note', run: () => openNoteDetail(b.roomId, M.bookings.get(b.id) || b, d, (x2 && x2.o.note) || '') }] : []),
    '-',
    ...(b.status === 'confirmed' || b.status === 'tentative' ? [{ label: 'เช็คอิน', icon: 'check', run: () => setBookingStatus(M.bookings.get(b.id) || b, 'checked_in') }] : []),
    ...(b.status === 'checked_in' ? [{ label: 'เช็คเอาท์', icon: 'check', run: () => setBookingStatus(M.bookings.get(b.id) || b, 'checked_out') }] : []),
    { label: 'พิมพ์ใบจอง', icon: 'print', run: () => openReservation(M.bookings.get(b.id) || b) },
  ];
  chartMenu(x, y, items);
}
function exportChartXls() {
  const start = S.gMonth + '-01', e = parseD(start); e.setUTCMonth(e.getUTCMonth() + (+S.gRange || 1)); const end = toStr(e);
  const list = allBookings().filter(b => isActive(b) && b.checkIn < end && b.checkOut > start).sort((x, y) => roomNo(x.roomId) < roomNo(y.roomId) ? -1 : roomNo(x.roomId) > roomNo(y.roomId) ? 1 : x.checkIn < y.checkIn ? -1 : 1);
  const rows = [['ห้อง', 'ประเภท', 'แขก / เหตุผล', 'เข้า', 'ออก', 'คืน', 'ช่องทาง', 'เลขที่จอง', 'สถานะ', 'ผู้ใหญ่', 'เด็ก', 'อาหารเช้า', 'เตียงเสริม', 'เปลเด็ก', 'หมายเหตุ']]
    .concat(list.map(b => [roomNo(b.roomId), b.kind === 'block' ? 'ปิดห้อง' : 'จอง', b.kind === 'block' ? b.reason : b.guest, b.checkIn, b.checkOut, nightsOf(b), b.channel || '', b.ref || '', STATUS[b.status] || '', +b.adults || '', +b.children || '', b.breakfast ? 'BF' : '', xbedOf(b) || '', cotOf(b) || '', String(b.notes || '').trim()]));
  const ws = XLSX.utils.aoa_to_sheet(rows); ws['!cols'] = [6, 8, 28, 11, 11, 5, 14, 14, 11, 6, 5, 8, 8, 8, 40].map(w => ({ wch: w }));
  const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Bookings');
  const out = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  downloadFile(`Booking_chart_${S.gMonth}${(+S.gRange || 1) > 1 ? '_' + S.gRange + 'm' : ''}.xlsx`, new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
}
function bindChart() {
  S.gRange = lsGet('bv.gRange', 1); S.gZoom = lsGet('bv.gZoom', 1);
  $('#gtNew').onclick = () => openBooking(null, {});
  $('#gtBlock').onclick = () => openBooking(null, { kind: 'block', checkIn: todayStr(), checkOut: addDays(todayStr(), 1) });
  $('#gtUndo').onclick = undoLast;
  $('#gtRange').onchange = e => { S.gRange = +e.target.value; lsSet('bv.gRange', S.gRange); renderChart(); };
  const zoom = f => { S.gZoom = Math.min(3, Math.max(0.5, Math.round(((S.gZoom || 1) * f) * 100) / 100)); lsSet('bv.gZoom', S.gZoom); renderChart(); };
  $('#gtZoomIn').onclick = () => zoom(1.25); $('#gtZoomOut').onclick = () => zoom(0.8);
  $('#gtFind').addEventListener('input', e => { S.gFind = e.target.value; renderChart(); });
  $('#gtChan').onchange = e => { S.gChan = e.target.value; keepFind = true; renderChart(); };
  $('#gtXls').onclick = exportChartXls;
  document.addEventListener('keydown', e => { if (S.page !== 'chart' || document.querySelector('.overlay')) return; if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '')) { e.preventDefault(); undoLast(); } });
  // right-click: menu for a stay, or for an empty cell
  $('#gscroll').addEventListener('contextmenu', e => {
    const bar = e.target.closest('.bk'); const lane = e.target.closest('.g-lane'); if (!bar && !lane) return; e.preventDefault();
    if (bar) { const b = M.bookings.get(bar.dataset.id); if (b) stayMenu(b, e.clientX, e.clientY); return; }
    const row = lane.closest('.g-row[data-room]'); if (!row) return; const day = laneDay(lane, e.clientX);
    chartMenu(e.clientX, e.clientY, [
      { label: `จองห้อง ${roomNo(row.dataset.room)} · ${fmtShort(day)}`, icon: 'plus', run: () => openBooking(null, { roomId: row.dataset.room, checkIn: day, checkOut: addDays(day, 1) }) },
      { label: 'ปิดห้อง / ซ่อม', icon: 'door', run: () => openBooking(null, { kind: 'block', roomId: row.dataset.room, checkIn: day, checkOut: addDays(day, 1) }) },
    ]);
  });
  // drag across empty cells to pick the nights, like selecting cells in Excel
  let pick = null;
  $('#gscroll').addEventListener('pointerdown', e => {
    if (e.button !== 0 || e.target.closest('.bk')) return; const lane = e.target.closest('.g-lane'); const row = lane && lane.closest('.g-row[data-room]'); if (!row) return;
    pick = { lane, room: row.dataset.room, d0: laneDay(lane, e.clientX), d1: null, el: null, x0: e.clientX };
  });
  window.addEventListener('pointermove', e => {
    if (!pick) return; if (!pick.el && Math.abs(e.clientX - pick.x0) < 6) return;
    if (!pick.el) { pick.el = document.createElement('div'); pick.el.className = 'g-pick'; pick.lane.appendChild(pick.el); }
    pick.d1 = laneDay(pick.lane, e.clientX);
    const a1 = pick.d0 < pick.d1 ? pick.d0 : pick.d1, b1 = pick.d0 < pick.d1 ? pick.d1 : pick.d0, W = cw(), start = pick.lane.dataset.start;
    pick.el.style.left = diffDays(start, a1) * W + 'px'; pick.el.style.width = (diffDays(a1, b1) + 1) * W + 'px';
    const n = diffDays(a1, b1) + 1, busy = overlapping(pick.room, a1, addDays(b1, 1)).length > 0; pick.el.classList.toggle('bad', busy);
    pick.el.textContent = `${n} คืน${busy ? ' · ไม่ว่าง' : ''}`;
  });
  window.addEventListener('pointerup', () => {
    if (!pick) return; const p = pick; pick = null; if (!p.el) return; p.el.remove();
    const a1 = p.d0 < p.d1 ? p.d0 : p.d1, b1 = p.d0 < p.d1 ? p.d1 : p.d0;
    chartDragged = true; setTimeout(() => { chartDragged = false; }, 250);
    openBooking(null, { roomId: p.room, checkIn: a1, checkOut: addDays(b1, 1) });
  });
  $('#gscroll').addEventListener('dblclick', e => { if (e.target.closest('.bk')) return; const lane = e.target.closest('.g-lane'); const row = lane && lane.closest('.g-row[data-room]'); if (!row) return; const d = laneDay(lane, e.clientX); openBooking(null, { roomId: row.dataset.room, checkIn: d, checkOut: addDays(d, 1) }); });
  S.chartColor = lsGet('bv.chartColor', 'channel');
  $('#gColorMode').addEventListener('click', e => { const b = e.target.closest('[data-cmode]'); if (!b) return; S.chartColor = b.dataset.cmode; lsSet('bv.chartColor', S.chartColor); renderChart(); });
  // view-only chart: clicking a bar shows the stay, nothing can be changed here
  let t = null; window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { if (S.page === 'chart') renderChart(); }, 150); });
  $('#gscroll').addEventListener('click', e => { const bar = e.target.closest('.bk'); if (bar) { e.stopPropagation(); if (chartDragged) return; const b = M.bookings.get(bar.dataset.id); if (b) openBooking(b); } });
  // drag a stay like in Excel: move it to other days or another room, or pull an edge to change check-in / check-out
  const box = $('#gscroll'); let drag = null, tip = null;
  box.addEventListener('pointerdown', e => {
    const bar = e.target.closest('.bk'); if (!bar || e.button !== 0) return;
    const b = M.bookings.get(bar.dataset.id); if (!b || b.status === 'checked_out') return;
    const hd = e.target.closest('.hd');
    let mode = hd ? (hd.classList.contains('l') ? 'start' : 'end') : 'move';
    if (b.status === 'checked_in' && mode === 'move') mode = 'room'; // guest is in the room: dates stay, room can change
    drag = { b, bar, mode, x0: e.clientX, y0: e.clientY, left0: parseFloat(bar.style.left), w0: parseFloat(bar.style.width), days: 0, room: b.roomId, on: false };
  });
  const tipShow = (e, text, bad) => { if (!tip) { tip = document.createElement('div'); tip.className = 'drag-tip'; document.body.appendChild(tip); } tip.textContent = text; tip.classList.toggle('bad', !!bad); tip.style.left = (e.clientX + 14) + 'px'; tip.style.top = (e.clientY + 16) + 'px'; };
  const result = () => { const { b, mode, days } = drag; let ci = b.checkIn, co = b.checkOut;
    if (mode === 'move') { ci = addDays(ci, days); co = addDays(co, days); } else if (mode === 'start') ci = addDays(ci, days); else if (mode === 'end') co = addDays(co, days);
    return { ci, co, room: drag.room }; };
  window.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    if (!drag.on) { if (Math.hypot(dx, dy) < 6) return; drag.on = true; drag.bar.classList.add('dragging'); document.body.classList.add('g-dragging'); closePop(); }
    const W = cw(), { b, bar, mode } = drag, n = nightsOf(b);
    let days = mode === 'room' ? 0 : Math.round(dx / W);
    if (mode === 'start') days = Math.min(days, n - 1); if (mode === 'end') days = Math.max(days, 1 - n);
    drag.days = days;
    if (mode === 'move' || mode === 'room') {
      bar.style.left = (drag.left0 + days * W) + 'px';
      const row = document.elementFromPoint(e.clientX, e.clientY)?.closest('.g-row[data-room]');
      if (row && row.dataset.room !== drag.room) { const lane = row.querySelector('.g-lane'); if (lane) { lane.appendChild(bar); drag.room = row.dataset.room; } }
    } else if (mode === 'start') { bar.style.left = (drag.left0 + days * W) + 'px'; bar.style.width = Math.max(14, drag.w0 - days * W) + 'px'; }
    else { bar.style.width = Math.max(14, drag.w0 + days * W) + 'px'; }
    const r = result(), clash = overlapping(r.room, r.ci, r.co, b.id).length > 0;
    bar.classList.toggle('drag-bad', clash);
    tipShow(e, `ห้อง ${roomNo(r.room)} · ${fmtShort(r.ci)} → ${fmtShort(r.co)} · ${diffDays(r.ci, r.co)} คืน${clash ? ' · ห้องไม่ว่าง' : ''}`, clash);
  });
  window.addEventListener('pointerup', async () => {
    if (!drag) return; const d = drag; drag = null; if (tip) { tip.remove(); tip = null; } document.body.classList.remove('g-dragging');
    if (!d.on) return;
    chartDragged = true; setTimeout(() => { chartDragged = false; }, 250);
    const { b } = d, r = (() => { drag = d; const x = result(); drag = null; return x; })();
    if (r.ci === b.checkIn && r.co === b.checkOut && r.room === b.roomId) { renderChart(); return; }
    const c = overlapping(r.room, r.ci, r.co, b.id);
    if (c.length) { toast(`ห้อง ${roomNo(r.room)} ไม่ว่างช่วงนี้ (${c.map(x => x.kind === 'block' ? (x.reason || 'ปิดห้อง') : x.guest).join(', ')}) · ไม่ได้ย้าย`, 'err'); renderChart(); return; }
    const what = r.room !== b.roomId ? `ย้าย ${b.guest || b.reason} ไปห้อง ${roomNo(r.room)}` : `เปลี่ยนวัน ${b.guest || b.reason}`;
    const ok = await save(() => Store.merge('bookings', b.id, { checkIn: r.ci, checkOut: r.co, roomId: r.room, updatedAt: Date.now(), updatedBy: Store.me?.id }), `${what} · ${fmtShort(r.ci)} → ${fmtShort(r.co)}`);
    if (ok) logAct(`${what} · ${fmtD(r.ci)} → ${fmtD(r.co)} (ลากในผังการจอง)`); else renderChart();
  });
  $('#gscroll').addEventListener('scroll', closePop, { passive: true });
}
const laneDay = (lane, clientX) => { const r = lane.getBoundingClientRect(); return addDays(lane.dataset.start, Math.max(0, Math.floor((clientX - r.left) / cw()))); };
function closePop() { document.querySelectorAll('.pop').forEach(x => x.remove()); }
function placePop(el, anchor) {
  document.body.appendChild(el);
  const r = anchor.getBoundingClientRect(), w = el.offsetWidth, h = el.offsetHeight;
  let left = Math.min(Math.max(12, r.left), window.innerWidth - w - 12);
  let top = r.bottom + 6; if (top + h > window.innerHeight - 12) top = Math.max(12, r.top - h - 6);
  el.style.left = left + 'px'; el.style.top = top + 'px';
  const off = ev => { if (!el.contains(ev.target)) { el.remove(); document.removeEventListener('mousedown', off); document.removeEventListener('keydown', esc2); } };
  const esc2 = ev => { if (ev.key === 'Escape') { el.remove(); document.removeEventListener('mousedown', off); document.removeEventListener('keydown', esc2); } };
  setTimeout(() => { document.addEventListener('mousedown', off); document.addEventListener('keydown', esc2); }, 0);
}
function showStayCard(bar) {
  closePop();
  const b = M.bookings.get(bar.dataset.id); if (!b) return;
  const r = roomById(b.roomId) || {}, g = b.guestId ? M.guests.get(b.guestId) : null;
  const n = nightsOf(b), pax = (+b.adults || 0) + (+b.children || 0);
  const el = document.createElement('div'); el.className = 'pop stay';
  const row = (k, v) => v ? `<dt>${k}</dt><dd>${v}</dd>` : '';
  el.innerHTML = b.kind === 'block'
    ? `<div class="pop-h"><span class="pill p-block">ปิดห้อง</span><b>ห้อง ${esc(r.no || '?')}</b></div><div class="pop-t">${esc(b.reason || 'ปิดซ่อม')}</div>
       <dl class="gdl">${row('ตั้งแต่', fmtLong(b.checkIn))}${row('ถึง', fmtLong(b.checkOut))}${row('จำนวน', n + ' คืน')}${row('หมายเหตุ', esc(b.notes || ''))}</dl>`
    : `<div class="pop-h">${avatar(b.guest, 'avatar sm')}<div style="min-width:0"><div class="pop-t">${esc(b.guest)}</div><div class="hint">ห้อง ${esc(r.no || '?')} · ${esc(roomLabel(r))}</div></div></div>
       <dl class="gdl">${row('เช็คอิน', fmtLong(b.checkIn) + (b.eta ? ' · ' + esc(b.eta) : ''))}${row('เช็คเอาท์', fmtLong(b.checkOut))}${row('จำนวน', `${n} คืน${pax ? ' · ' + pax + ' ท่าน' : ''}`)}
       ${row('สถานะ', `<span class="pill p-${b.status}">${STATUS[b.status] || ''}</span>${b.breakfast ? ' <span class="pill p-checked_in">รวมอาหารเช้า</span>' : ''}`)}
       ${row('ช่องทาง', esc(b.channel || ''))}${row('สัญชาติ', esc(g?.nationality || b.nationality || ''))}${row('โทร', esc(g?.phone || b.phone || ''))}${row('หมายเหตุ', normName(b.notes) === normName(b.guest) ? '' : esc(b.notes || ''))}</dl>`;
  placePop(el, bar);
}
function openMonthPicker(anchor) {
  closePop();
  let year = +S.gMonth.slice(0, 4);
  const el = document.createElement('div'); el.className = 'pop mpick';
  const draw = () => {
    el.innerHTML = `<div class="mp-h"><button class="iconbtn" data-y="-1" style="width:30px;height:30px">${icon('left')}</button><b>${year}</b><button class="iconbtn" data-y="1" style="width:30px;height:30px">${icon('right')}</button></div>
      <div class="mp-g">${MON.map((m, i) => { const v = `${year}-${pad(i + 1)}`; return `<button data-m="${v}" class="${v === S.gMonth ? 'on' : ''}${v === todayStr().slice(0, 7) ? ' now' : ''}">${m}</button>`; }).join('')}</div>`;
  };
  draw();
  el.addEventListener('click', e => {
    const y = e.target.closest('[data-y]'); if (y) { year += +y.dataset.y; draw(); return; }
    const m = e.target.closest('[data-m]'); if (m) { S.gMonth = m.dataset.m; el.remove(); renderChart(); }
  });
  placePop(el, anchor);
}


/* ================= RATE CARD (room prices per month) ================= */
const RATE_CATS = [
  { k: 'double', label: 'Double', sub: 'ห้องเดี่ยว เตียงใหญ่' },
  { k: 'twin', label: 'Twin', sub: 'ห้องเดี่ยว 2 เตียง' },
  { k: 'family', label: 'Family', sub: '2 ห้องนอน 2 ห้องน้ำ' },
];
const RATE_COLS = [['night', 'ต่อคืน'], ['nightBF', 'ต่อคืน + อาหารเช้า'], ['month', 'รายเดือน']];
const EXTRA_PRICES = [['xbed', 'เตียงเสริม (Extra bed)', 'ต่อเตียง ต่อคืน'], ['cot', 'เปลเด็ก (Baby cot)', 'ต่อเปล ต่อคืน']];
const rateCat = r => !r ? 'double' : r.type === 'family' ? 'family' : /twin/i.test(r.bed || '') ? 'twin' : 'double';
const rateDocId = ym => 'rates-' + ym;
// prices for a month; if not set, carry over the latest earlier month
function ratesFor(ym) {
  const own = M.settings.get(rateDocId(ym));
  if (own) return { data: own, from: ym };
  const prev = [...M.settings.keys()].filter(k => k.startsWith('rates-') && k.slice(6) < ym).sort().pop();
  return prev ? { data: M.settings.get(prev), from: prev.slice(6) } : { data: null, from: null };
}
const ymLabel = ym => { const [y, m] = ym.split('-').map(Number); return `${MON_FULL[m - 1]} ${y}`; };
const ymAdd = (ym, n) => { let [y, m] = ym.split('-').map(Number); m += n; while (m > 12) { m -= 12; y++; } while (m < 1) { m += 12; y--; } return `${y}-${pad(m)}`; };
function suggestRate(roomId, checkIn, rateType, breakfast) {
  if (!validD(checkIn)) return 0;
  const { data } = ratesFor(checkIn.slice(0, 7)); if (!data || !data.cats) return 0;
  const c = data.cats[rateCat(roomById(roomId))] || {};
  return +(rateType === 'month' ? c.month : (breakfast && +c.nightBF ? c.nightBF : c.night)) || 0;
}
// normal list price of one night, from the rate card of that month
function listRate(b, d) {
  if (b.rateType === 'month') return suggestRate(b.roomId, d, 'month', b.breakfast) / 30;
  return suggestRate(b.roomId, d, 'night', b.breakfast);
}
// what a complimentary stay would have cost, nights inside [from, to)
function compValue(b, from = b.checkIn, to = b.checkOut) {
  const s = b.checkIn > from ? b.checkIn : from, e = b.checkOut < to ? b.checkOut : to;
  let v = 0, miss = 0, n = 0;
  for (let d = s; d < e; d = addDays(d, 1)) { const r = listRate(b, d); n++; if (r) v += r; else miss++; }
  return { value: Math.round(v), nights: n, miss };
}
function compRows(y) {
  const ys = `${y}-01-01`, ye = `${y + 1}-01-01`;
  return allBookings().filter(b => compOf(b) && isActive(b) && b.checkIn < ye && b.checkOut > ys)
    .map(b => ({ b, c: compOf(b), ...compValue(b, ys, ye) })).filter(x => x.nights > 0).sort((p, q) => p.b.checkIn < q.b.checkIn ? -1 : 1);
}
const compGroup = c => c.type === COMP_HOST ? 'ในนามของ ' + (c.by || '—') : c.type;
function compReportHtml(y, rows) {
  const grp = new Map();
  for (const x of rows) { const k = compGroup(x.c); if (!grp.has(k)) grp.set(k, { k, n: 0, nights: 0, value: 0, guests: new Set() }); const g = grp.get(k); g.n++; g.nights += x.nights; g.value += x.value; g.guests.add(x.b.guestId || normName(x.b.guest)); }
  const gs = [...grp.values()].sort((p, q) => q.value - p.value), tot = rows.reduce((s, x) => s + x.value, 0), nights = rows.reduce((s, x) => s + x.nights, 0);
  const guests = new Set(rows.map(x => x.b.guestId || normName(x.b.guest))).size;
  return `<div class="comp-rep"><div class="comp-tot"><div><span>มูลค่าห้องที่ให้พักฟรีทั้งปี ${y}</span><b>฿${money(tot)}</b></div><div><span>คืน</span><b>${money(nights)}</b></div><div><span>การจอง</span><b>${rows.length}</b></div><div><span>แขก</span><b>${guests} คน</b></div></div>
    <h4>แยกตามหัวข้อ</h4><table><thead><tr><th>หัวข้อ</th><th class="r">การจอง</th><th class="r">แขก</th><th class="r">คืน</th><th class="r">มูลค่า (บาท)</th></tr></thead><tbody>${gs.map(g => `<tr><td>${esc(g.k)}</td><td class="r num">${g.n}</td><td class="r num">${g.guests.size}</td><td class="r num">${g.nights}</td><td class="r num">${money(g.value)}</td></tr>`).join('')}</tbody></table>
    <h4>รายการทั้งหมด</h4><table><thead><tr><th>แขก</th><th>ห้อง</th><th>เข้า</th><th>ออก</th><th class="r">คืน</th><th>หัวข้อ</th><th>รายละเอียด</th><th class="r">ราคาปกติ/คืน</th><th class="r">มูลค่า (บาท)</th></tr></thead><tbody>${rows.map(x => `<tr class="click" data-id="${esc(x.b.id)}"><td>${esc(x.b.guest)}</td><td class="rn">${esc(roomNo(x.b.roomId))}</td><td class="num">${fmtD(x.b.checkIn)}</td><td class="num">${fmtD(x.b.checkOut)}</td><td class="r num">${x.nights}</td><td>${esc(compGroup(x.c))}</td><td>${esc(x.c.note || '')}</td><td class="r num">${x.nights ? money(x.value / x.nights) : '—'}</td><td class="r num">${x.miss === x.nights ? '<span class="owe">ไม่มีราคา</span>' : money(x.value)}${x.miss && x.miss < x.nights ? ' *' : ''}</td></tr>`).join('')}</tbody></table></div>`;
}
function openRates(ym = todayStr().slice(0, 7)) {
  const edit = !!Store.me;
  const m = openModal(`<div class="sheet"><div class="sheet-h"><h2>ราคาห้อง</h2><div class="spacer"></div>
      <button class="iconbtn" id="rtPrev" title="เดือนก่อน">${icon('left')}</button><b id="rtTitle" style="min-width:150px;text-align:center"></b><button class="iconbtn" id="rtNext" title="เดือนถัดไป">${icon('right')}</button>
      <button class="btn ghost" data-close>✕</button></div>
    <div class="sheet-b" id="rtBody"></div>
    <div class="sheet-f"><span class="hint" id="rtHint"></span><div class="spacer"></div>${edit ? '<button class="btn" data-close>ยกเลิก</button><button class="btn primary" id="rtSave">บันทึกราคา</button>' : '<button class="btn" data-close>ปิด</button>'}</div></div>`);
  const $m = s => m.el.querySelector(s);
  const draw = () => {
    const { data, from } = ratesFor(ym), cats = (data && data.cats) || {};
    $m('#rtTitle').textContent = ymLabel(ym);
    const counts = {}; activeRooms().forEach(r => { const k = rateCat(r); counts[k] = (counts[k] || 0) + 1; });
    const cell = (k, c) => { const val = +((cats[k] || {})[c]) || 0;
      return edit ? `<input type="number" min="0" step="50" class="rt-in" data-k="${k}" data-c="${c}" value="${val || ''}" placeholder="—">` : `<b class="num">${val ? money(val) : '—'}</b>`; };
    $m('#rtBody').innerHTML = `
      ${from && from !== ym ? `<div class="notice">ยังไม่ได้ตั้งราคาของ ${ymLabel(ym)} · แสดงราคาล่าสุดจาก ${ymLabel(from)}${edit ? ' กดบันทึกเพื่อใช้ราคานี้กับเดือนนี้' : ''}</div>` : ''}
      ${!data ? `<div class="notice">ยังไม่มีราคาห้อง${edit ? ' กรอกราคาแล้วกดบันทึก ราคาจะใช้ต่อไปทุกเดือนจนกว่าจะแก้' : ''}</div>` : ''}
      <table class="rt"><thead><tr><th>ประเภทห้อง</th>${RATE_COLS.map(([, l]) => `<th class="r">${l} (บาท)</th>`).join('')}</tr></thead><tbody>
      ${RATE_CATS.map(cat => `<tr><td><b>${cat.label}</b><div class="hint">${cat.sub} · ${counts[cat.k] || 0} ห้อง</div></td>${RATE_COLS.map(([c]) => `<td class="r">${cell(cat.k, c)}</td>`).join('')}</tr>`).join('')}
      </tbody></table>
      <table class="rt" style="margin-top:10px"><thead><tr><th>บริการเสริม</th><th class="r">ราคา (บาท)</th><th>คิดแบบ</th></tr></thead><tbody>
      ${EXTRA_PRICES.map(([k, l, u]) => { const val = +(((data && data.extras) || {})[k]) || 0;
        return `<tr><td><b>${l}</b></td><td class="r">${edit ? `<input type="number" min="0" step="50" class="rt-in rt-ex" data-x="${k}" value="${val || ''}" placeholder="—">` : `<b class="num">${val ? money(val) : '—'}</b>`}</td><td class="hint">${u}</td></tr>`; }).join('')}
      </tbody></table>
      <label class="f" style="margin-top:14px"><span>หมายเหตุ / โปรโมชันเดือนนี้</span>${edit ? `<textarea id="rtNote" rows="2" placeholder="เช่น High season, พัก 7 คืนลด 10%">${esc((data && data.note) || '')}</textarea>` : `<div>${esc((data && data.note) || '—')}</div>`}</label>`;
    $m('#rtHint').textContent = edit ? 'ราคาห้องที่ตั้งไว้จะเติมให้อัตโนมัติเมื่อสร้างการจองใหม่' : '';
  };
  $m('#rtPrev').onclick = () => { ym = ymAdd(ym, -1); draw(); };
  $m('#rtNext').onclick = () => { ym = ymAdd(ym, 1); draw(); };
  if (edit) $m('#rtSave').onclick = async () => {
    const cats = {}, extras = {}; m.el.querySelectorAll('.rt-ex').forEach(i => { extras[i.dataset.x] = +i.value || 0; }); m.el.querySelectorAll('.rt-in:not(.rt-ex)').forEach(i => { (cats[i.dataset.k] = cats[i.dataset.k] || {})[i.dataset.c] = +i.value || 0; });
    if (await save(() => Store.put('settings', rateDocId(ym), { cats, extras, note: $m('#rtNote').value.trim(), updatedAt: Date.now() }), `บันทึกราคา ${ymLabel(ym)} แล้ว`)) { logAct(`แก้ไขราคาห้อง ${ymLabel(ym)}`); draw(); }
  };
  draw();
}

/* ================= BOOKING FORM ================= */
function openBooking(existing, prefill = {}) {
  const b = existing ? { ...existing, ...(M.finance.get(existing.id) || {}) } : { kind: 'booking', status: 'confirmed', adults: 2, children: 0, rateType: 'night', rate: 0, extras: 0, deposit: 0, paid: 0, breakfast: false, channel: '', roomId: activeRooms()[0]?.id, ...prefill };
  const isNew = !existing;
  const bookingId = existing ? existing.id : Store.newId();
  const roomOpts = activeRooms().map(r => `<option value="${esc(r.id)}"${r.id === b.roomId ? ' selected' : ''}>ห้อง ${esc(r.no)} · ${esc(roomLabel(r))}</option>`).join('');
  const chans = [...new Set([...(settings().channels || []), b.channel].filter(Boolean))];
  const html = `<div class="sheet">
    <div class="sheet-h"><h2>${isNew ? (b.kind === 'block' ? 'ปิดห้อง / ซ่อม' : 'การจองใหม่') : (b.kind === 'block' ? 'ปิดห้อง / ซ่อม' : esc(b.guest))}</h2><div class="spacer"></div>
      <div class="seg"><button type="button" data-kind="booking" aria-pressed="${b.kind !== 'block'}">การจอง</button><button type="button" data-kind="block" aria-pressed="${b.kind === 'block'}">ปิดห้อง / ซ่อม</button></div>
      <button class="btn ghost" data-close>✕</button></div>
    <form class="sheet-b" id="bkForm" novalidate>
      <div class="stepbar bk-only" id="fSteps"><button type="button" data-step="1"><i>1</i>ข้อมูลแขก</button><span class="stepline"></span><button type="button" data-step="2"><i>2</i>อาหารเช้าและรถรับส่ง</button><span class="stepline"></span><button type="button" data-step="3"><i>3</i>ชำระเงิน</button></div>
      <fieldset class="st1"><legend>ห้องและวันที่</legend><div class="fields">
        <label class="f w2"><span>ห้อง · แสดงเฉพาะห้องที่ว่างตามวันเช็คอิน-เช็คเอาท์</span><select id="fRoom">${roomOpts}</select><span class="hint" id="fRoomHint"></span></label>
        <label class="f"><span>เช็คอิน</span><input type="date" id="fIn" value="${esc(b.checkIn || '')}"></label>
        <label class="f"><span>เช็คเอาท์</span><input type="date" id="fOut" value="${esc(b.checkOut || '')}"></label>
        <label class="f bk-only"><span>สถานะ</span><select id="fStatus">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}"${k === b.status ? ' selected' : ''}>${v}</option>`).join('')}</select></label>
        <label class="f bk-only"><span>เวลาที่จะมาถึง</span><input type="time" id="fEta" value="${esc(b.eta || '')}"></label>
        <label class="f blk-only w2"><span>เหตุผลที่ปิดห้อง</span><select id="fReason">${[...new Set([...BLOCK_REASONS, b.reason].filter(Boolean))].map(x => `<option${x === b.reason ? ' selected' : ''}>${esc(x)}</option>`).join('')}<option value="__other">อื่นๆ (พิมพ์เอง)</option></select></label>
        <label class="f blk-only w2" id="fReasonOtherWrap" hidden><span>ระบุเหตุผล</span><input type="text" id="fReasonOther"></label>
      </div><div id="fClash"></div></fieldset>
      <fieldset class="bk-only st1"><legend>ข้อมูลแขก</legend><div class="fields">
        <div class="w2" style="position:relative;min-width:0"><label class="f"><span>ชื่อแขก * · พิมพ์เพื่อค้นหาแขกเดิม</span><input type="text" id="fGuest" value="${esc(b.guest || '')}" autocomplete="off"></label><div class="sugg" id="fSugg" hidden></div></div>
        <label class="f"><span>โทรศัพท์ / WhatsApp</span><input type="tel" id="fPhone" value="${esc(b.phone || '')}"></label>
        <label class="f"><span>อีเมล</span><input type="email" id="fEmail" value="${esc(b.email || '')}"></label>
        <label class="f"><span>สัญชาติ</span><input type="text" id="fNat" list="natListB" value="${esc(b.nationality || '')}"></label>
        <label class="f"><span>วันเกิด</span><input type="date" id="fDob" value="${esc(b.dob || (b.guestId && M.guests.get(b.guestId)?.dob) || '')}"></label>
        <label class="f"><span>พาสปอร์ต / บัตรประชาชน</span><input type="text" id="fPass" value="${esc(b.passport || (b.guestId && M.guests.get(b.guestId)?.passport) || '')}"></label>
        <label class="f"><span>ผู้ใหญ่</span><input type="number" id="fAdults" min="0" value="${+b.adults || 0}"></label>
        <label class="f"><span>เด็ก</span><input type="number" id="fKids" min="0" value="${+b.children || 0}"></label>
      </div><div id="fGLink"></div><datalist id="natListB">${natOptions()}</datalist></fieldset>
      <fieldset class="bk-only st2"><legend>อาหารเช้า เตียงเสริม และเปลเด็ก</legend>
      <div class="row" style="gap:18px">
        <label class="chk"><input type="checkbox" id="fBf"${b.breakfast ? ' checked' : ''}> อาหารเช้า</label><button type="button" class="linkbtn" id="fBfMore" hidden></button>
        <label class="chk">เตียงเสริม <input type="number" id="fXbed" min="0" max="9" class="cnt" value="${xbedOf(b)}"></label>
        <label class="chk">เปลเด็ก <input type="number" id="fCot" min="0" max="9" class="cnt" value="${cotOf(b)}"></label>
        <label class="chk"><input type="checkbox" id="fTwin"${b.twin ? ' checked' : ''}> ขอเตียงแยก (Twin)</label>
</div><div id="fEqHint" class="hint"></div>
</fieldset>
      <fieldset class="bk-only st2"><legend>รถรับส่ง / แท็กซี่</legend>
        <div id="fTx" class="tx-list"></div>
        <div class="row" style="gap:8px"><button type="button" class="btn sm" data-addtx="pickup">${icon('plus')} รับจากสนามบิน</button><button type="button" class="btn sm" data-addtx="dropoff">${icon('plus')} ส่งไปสนามบิน</button><button type="button" class="btn sm" data-addtx="other">${icon('plus')} ที่อื่นๆ</button></div></fieldset>
      <div class="bk-only st3 comp-wrap"><label class="chk comp-chk"><input type="checkbox" id="fComp"${compOf(b) ? ' checked' : ''}> แขกรับรอง (Complimentary)</label>
      <div class="comp-box" id="fCompBox" hidden>
        <div class="fx-h"><b>แขกรับรอง</b><span class="hint">เลือกว่ามาพักในนามของใคร หรือมาจากโครงการไหน</span></div>
        <div class="comp-types" id="fCompTypes"></div>
        <div class="fields">
          <label class="f" id="fCompByWrap"><span id="fCompByLbl">ในนามของ (ชื่อผู้รับรอง) *</span><input type="text" id="fCompBy" list="compHosts" value="${esc(compOf(b)?.by || '')}"></label>
          <label class="f"><span>รายละเอียด</span><input type="text" id="fCompNote" value="${esc(compOf(b)?.note || '')}" placeholder="เช่น เลขที่ voucher, ชื่อมัสยิด, ผู้อนุมัติ"></label>
        </div><datalist id="compHosts">${compHosts().map(h => `<option>${esc(h)}</option>`).join('')}</datalist>
        <div class="hint" id="fCompHint"></div></div>
      <div class="step-next" id="fNextWrap" hidden><button type="button" class="btn primary" id="fNext">ถัดไป</button></div></div>
      <fieldset class="bk-only st3"><legend id="fFinLeg">${canFinance() ? 'ราคาและการชำระเงิน' : 'ช่องทางการจอง'}</legend><div class="fields">
        <label class="f"><span>ช่องทางการจอง</span><select id="fChan"><option value="">— เลือก —</option>${chans.map(c => `<option${c === b.channel ? ' selected' : ''}>${esc(c)}</option>`).join('')}</select></label>
        <label class="f"><span>เลขที่จอง (Booking ID)</span><input type="text" id="fRef" value="${esc(b.ref || '')}"></label>
        <label class="f fin-only"><span>คิดราคา</span><select id="fRateType"><option value="night"${b.rateType !== 'month' ? ' selected' : ''}>ต่อคืน</option><option value="month"${b.rateType === 'month' ? ' selected' : ''}>รายเดือน (30 คืน)</option></select></label>
        <label class="f fin-only"><span id="fRateLbl">ราคา (บาท)</span><input type="number" id="fRate" min="0" value="${+b.rate || 0}"></label>
        <label class="f month-only fin-only"><span>มิเตอร์ไฟ เข้า</span><input type="number" id="fE1" min="0" value="${b.elecStart ?? ''}"></label>
        <label class="f month-only fin-only"><span>มิเตอร์ไฟ ออก</span><input type="number" id="fE2" min="0" value="${b.elecEnd ?? ''}"></label>
        <label class="f fin-only"><span>ค่าใช้จ่ายอื่น (บาท)</span><input type="number" id="fExtras" min="0" value="${+b.extras || 0}"></label>
        <label class="f fin-only"><span>ส่วนลด</span><div class="paid-row"><input type="number" id="fDisc" min="0" step="any" value="${+b.discVal || ''}" placeholder="0"><select id="fDiscType" style="width:auto"><option value="thb"${b.discType !== 'pct' ? ' selected' : ''}>บาท</option><option value="pct"${b.discType === 'pct' ? ' selected' : ''}>%</option></select></div></label>
        <label class="f fin-only w2" id="fDiscNoteWrap"><span>เหตุผลส่วนลด</span><input type="text" id="fDiscNote" list="discReasons" value="${esc(b.discNote || '')}"><datalist id="discReasons">${['ลูกค้าประจำ', 'พักยาว', 'โปรโมชั่น', 'ญาติ / คนรู้จัก', 'ชดเชยปัญหาห้องพัก'].map(x => `<option>${x}</option>`).join('')}</datalist></label>
        <label class="f fin-only"><span>มัดจำ (บาท)</span><input type="number" id="fDep" min="0" value="${+b.deposit || 0}"></label>
        <label class="f fin-only"><span>รับชำระแล้ว (บาท)</span><div class="paid-row"><input type="number" id="fPaid" min="0" value="${+b.paid || 0}"><button type="button" class="btn sm" id="fPaidMax" title="ใส่ยอดเต็ม = ค่าห้อง + มัดจำ">สูงสุด</button></div></label>
        <label class="f fin-only"><span>วิธีชำระ</span><select id="fPay">${['', 'เงินสด', 'โอนเงิน', 'บัตรเครดิต', 'OTA เก็บเงินแล้ว', 'จ่ายที่โรงแรม'].map(x => `<option${x === (b.payMethod || '') ? ' selected' : ''}>${x}</option>`).join('')}</select></label>
        <label class="f w2 fin-only"><span>เลขอ้างอิงการโอน / เลขที่สลิป</span><input type="text" id="fPayRef" value="${esc(b.payRef || '')}" placeholder="เช่น เลขอ้างอิงธนาคาร, เลขที่ใบเสร็จ"></label>
      </div><div class="hint fin-only" id="fPayHint"></div>
      <div class="row fin-only" id="fMoreRow" style="gap:6px"><button type="button" class="linkbtn" id="fFxOpen">+ แขกจ่ายเป็นเงินต่างประเทศ</button><button type="button" class="linkbtn" id="fCoOpen">+ ค่าปรับ / คืนมัดจำ</button></div>
      <div class="fx-box fin-only" id="fFxBox"><div class="fx-h"><b>แขกจ่ายเป็นเงินต่างประเทศ</b><span class="hint" id="fxSrc"></span></div>
        <div class="fx-row"><input type="number" id="fxAmt" min="0" step="0.01" placeholder="จำนวน"><select id="fxCur">${FX_CURS.map(c => `<option>${c}</option>`).join('')}</select>
          <span>×</span><input type="number" id="fxRate" min="0" step="0.0001" title="อัตราแลกเปลี่ยน (บาทต่อ 1 หน่วย) แก้ได้"><span>=</span><b id="fxThb">฿0</b>
          <button type="button" class="btn sm" data-fxto="deposit">+ ใส่เป็นมัดจำ</button><button type="button" class="btn sm" data-fxto="paid">+ ใส่เป็นรับชำระ</button></div>
        <div id="fxList" class="fx-list"></div></div>
      <div class="co-box fin-only" id="fCoBox"><div class="fx-h"><b>ตอนเช็คเอาท์ · ค่าปรับและคืนมัดจำ</b><div class="spacer"></div><button type="button" class="btn sm" id="fFineAdd">${icon('plus')} เพิ่มค่าปรับ</button></div>
        <div id="fFines" class="fine-list"></div><datalist id="fineSugg">${FINE_SUGG.map(s => `<option>${esc(s)}</option>`).join('')}</datalist>
        <div class="dep-row"><span class="dep-lbl">มัดจำ</span><select id="fDepSt">${Object.entries(DEP_ST).map(([k, l]) => `<option value="${k}"${k === ((b.depRefund && b.depRefund.st) || 'none') ? ' selected' : ''}>${l}</option>`).join('')}</select>
          <input type="number" id="fDepAmt" min="0" placeholder="คืนกี่บาท" value="${b.depRefund && b.depRefund.st === 'part' ? (+b.depRefund.amt || 0) : ''}">
          <input type="text" id="fDepNote" placeholder="หมายเหตุ เช่น หักค่ากุญแจ" value="${esc((b.depRefund && b.depRefund.note) || '')}">
          <button type="button" class="btn sm" id="fDepCalc" title="คืน = มัดจำ − ค่าปรับ">คำนวณให้</button></div>
        <div class="hint" id="fDepHint"></div></div>
      <div class="att-box"><div class="fx-h"><b>สลิปการโอน / เอกสารการจอง</b><span class="hint">รูปภาพหรือ PDF · ทุกคนแนบและเปิดดูได้</span><div class="spacer"></div><label class="btn sm">${icon('upload')} แนบไฟล์<input type="file" id="fAtt" accept="image/*,.pdf,.doc,.docx" multiple hidden></label></div><div id="fAttList" class="att-list"></div></div>
      <div class="sum fin-only" id="fSum"></div></fieldset>
      <label class="f st3"><span>หมายเหตุ</span><textarea id="fNotes" rows="3">${esc(b.notes || '')}</textarea></label>
      ${canFinance() && b.srcNote ? `<div class="hint">ข้อความเดิมใน Excel: ${esc(b.srcNote)}</div>` : ''}
      ${!isNew ? `<div class="hint">${b.src === 'excel' ? 'นำเข้าจาก Excel' : 'สร้างโดย ' + esc(nameOf(b.createdBy)) + (b.createdAt ? ' · ' + fmtTime(b.createdAt) : '')}${b.updatedAt ? ' · แก้ไขล่าสุดโดย ' + esc(nameOf(b.updatedBy)) + ' ' + fmtTime(b.updatedAt) : ''}</div>` : ''}
      <div id="fConfirm"></div></form>
    <div class="sheet-f">
      ${!isNew && b.kind !== 'block' && b.status !== 'checked_in' && b.status !== 'checked_out' ? '<button class="btn" id="fCheckin" type="button">เช็คอิน</button>' : ''}
      ${!isNew && b.status === 'checked_in' ? '<button class="btn" id="fCheckout" type="button">เช็คเอาท์</button>' : ''}
      ${!isNew ? '<button class="btn danger" id="fDel" type="button">ลบ</button>' : ''}${!isNew && existing.kind !== 'block' ? `<button class="btn" id="fPrint" type="button">${icon('print')} พิมพ์ใบจอง</button>` : ''}
      <div class="spacer"></div><button class="btn" id="fBack" type="button" hidden>${icon('left')} ย้อนกลับ</button><button class="btn" id="fFwd" type="button" hidden>ถัดไป ${icon('right')}</button><button class="btn" data-close type="button">ยกเลิก</button><button class="btn primary" id="fSave" type="button">${isNew ? 'บันทึกการจอง' : 'บันทึก'}</button></div></div>`;
  const m = openModal(html); const el = m.el, v = id => el.querySelector('#' + id);
  let kind = b.kind || 'booking', clashOk = false, step = 1, reached = !isNew, fxOpen = false, coOpen = false;
  let svcBf = (existing && existing.svc && existing.svc.bf) || null;
  let gid = b.guestId && M.guests.has(b.guestId) ? b.guestId : null;
  const reason = () => v('fReason').value === '__other' ? v('fReasonOther').value.trim() : v('fReason').value;
  function collect() {
    const o = { kind, roomId: v('fRoom').value, checkIn: v('fIn').value, checkOut: v('fOut').value, notes: v('fNotes').value.trim(), updatedAt: Date.now(), updatedBy: Store.me?.id };
    if (kind === 'block') { o.reason = reason() || 'ปิดซ่อม'; o.status = 'confirmed'; return o; }
    const num = id => { const x = v(id).value; return x === '' ? 0 : +x; };
    return Object.assign(o, { status: v('fStatus').value, eta: v('fEta').value, guest: v('fGuest').value.trim(), phone: v('fPhone').value.trim(), email: v('fEmail').value.trim(),
      nationality: normNat(v('fNat').value), passport: v('fPass').value.trim(), dob: v('fDob').value, adults: num('fAdults'), children: num('fKids'), breakfast: v('fBf').checked, extraBeds: num('fXbed'), extraBed: num('fXbed') > 0,
      babyCots: num('fCot'), babyCot: num('fCot') > 0, twin: v('fTwin').checked, channel: v('fChan').value, ref: v('fRef').value.trim(), rateType: v('fRateType').value, ...(canFinance() ? { rate: num('fRate') } : {}),
      ...(canFinance() ? { extras: num('fExtras'), deposit: num('fDep'), paid: num('fPaid'), payMethod: v('fPay').value, payRef: v('fPayRef').value.trim(), discType: v('fDiscType').value, discVal: num('fDisc'), discNote: v('fDiscNote').value.trim(), fines: readFines(), depRefund: readDep() } : {}), attachments: attItems.slice(),
      transfers: readTx(), ...(canFinance() ? { fx: fxItems.slice() } : {}), comp: readComp(),
      elecStart: v('fE1').value === '' ? null : +v('fE1').value, elecEnd: v('fE2').value === '' ? null : +v('fE2').value });
  }
  // ----- complimentary -----
  let compType = compOf(b)?.type || COMP_HOST, compExtra = [];
  function readComp() { if (!v('fComp').checked) return null; return { on: true, type: compType, by: v('fCompBy').value.trim(), note: v('fCompNote').value.trim() }; }
  function drawComp() {
    const on = v('fComp').checked; v('fCompBox').hidden = !on || kind === 'block'; if (!on) return;
    const types = [...new Set([...compTypes(), ...compExtra, compType])];
    v('fCompTypes').innerHTML = types.map(t => `<button type="button" class="chip" data-ctype="${esc(t)}" aria-pressed="${t === compType}">${esc(t === COMP_HOST ? 'ในนามของ…' : t)}</button>`).join('')
      + `<span class="comp-add" id="fCompAddWrap"><button type="button" class="chip add" id="fCompAdd">${icon('plus')} เพิ่มหัวข้อ</button></span>`;
    const host = compType === COMP_HOST;
    v('fCompByLbl').textContent = host ? 'ในนามของ (ชื่อผู้รับรอง) *' : 'ผู้อนุมัติ / ในนามของ (ถ้ามี)';
    v('fCompHint').textContent = 'แขกรับรองไม่ต้องใส่ราคาและการชำระเงิน';
  }
  v('fComp').addEventListener('change', () => {
    if (v('fComp').checked && canFinance()) { v('fRate').value = 0; rateTouched = true; }
    drawComp(); if (v('fComp').checked) setTimeout(() => v('fCompBy').focus(), 30);
  });
  v('fCompTypes').addEventListener('click', e => {
    const t = e.target.closest('[data-ctype]'); if (t) { compType = t.dataset.ctype; drawComp(); return; }
    if (e.target.closest('#fCompAdd')) { v('fCompAddWrap').innerHTML = '<input type="text" id="fCompNew" placeholder="ชื่อหัวข้อใหม่ เช่น สปอนเซอร์" style="width:200px"><button type="button" class="btn sm primary" id="fCompNewOk">เพิ่ม</button>'; v('fCompNew').focus(); return; }
    if (e.target.closest('#fCompNewOk')) addCompType();
  });
  v('fCompTypes').addEventListener('keydown', e => { if (e.target.id === 'fCompNew' && e.key === 'Enter') { e.preventDefault(); addCompType(); } });
  async function addCompType() {
    const name = (v('fCompNew')?.value || '').trim(); if (!name) return drawComp();
    compExtra.push(name); compType = name; drawComp();
    if (isAdmin() && !compTypes().includes(name)) { try { await Store.merge('settings', 'main', { compTypes: [...(settings().compTypes || []), name] }); } catch (er) { console.error(er); } }
  }
  // extra beds / cots: never more than are free on every night of the stay
  function eqLimit() {
    const ci = v('fIn').value, co = v('fOut').value; if (!validD(ci) || !validD(co) || co <= ci) return;
    for (const [k, id] of [['xbed', 'fXbed'], ['cot', 'fCot']]) {
      const inp = v(id), free = Math.max(0, EQ[k].stock() - equipPeak(k, ci, co, existing?.id));
      inp.max = free; inp.disabled = !free; inp.title = free ? `เลือกได้สูงสุด ${free}` : `ไม่มี${EQ[k].label}ว่างช่วงนี้`;
      if ((+inp.value || 0) > free) inp.value = free;
    }
  }
  // only rooms that are free for the chosen dates can be picked
  let roomsKey = '';
  function fillRooms() {
    const ci = v('fIn').value, co = v('fOut').value, key = ci + '|' + co;
    if (key === roomsKey) return; roomsKey = key;
    const sel = v('fRoom'), cur = sel.value || b.roomId, all = activeRooms();
    const okDates = validD(ci) && validD(co) && co > ci;
    const free = okDates ? all.filter(r => !overlapping(r.id, ci, co, existing?.id).length) : all;
    sel.innerHTML = free.length ? free.map(r => `<option value="${esc(r.id)}">ห้อง ${esc(r.no)} · ${esc(roomLabel(r))}</option>`).join('') : '<option value="">ไม่มีห้องว่างในช่วงวันที่นี้</option>';
    let note = okDates ? `ว่าง ${free.length} จาก ${all.length} ห้อง` : 'เลือกวันเช็คอินและเช็คเอาท์ก่อน';
    if (free.some(r => r.id === cur)) sel.value = cur;
    else if (cur && free.length && okDates) note = `ห้อง ${roomNo(cur)} ไม่ว่างในช่วงนี้ จึงเปลี่ยนเป็นห้อง ${free[0].no} · ` + note;
    v('fRoomHint').textContent = note;
  }
  function refresh() {
    fillRooms();
    el.querySelectorAll('.bk-only').forEach(x => x.hidden = kind === 'block');
    el.querySelectorAll('.blk-only').forEach(x => x.hidden = kind !== 'block');
    const wiz = kind === 'booking', gate = isNew && wiz && step < 3;
    el.querySelectorAll('.st1').forEach(x => { if (!x.classList.contains('bk-only') || kind !== 'block') x.hidden = wiz && step !== 1; });
    el.querySelectorAll('.st2').forEach(x => { if (!x.classList.contains('bk-only') || kind !== 'block') x.hidden = wiz && step !== 2; });
    el.querySelectorAll('.st3').forEach(x => { if (!x.classList.contains('bk-only') || kind !== 'block') x.hidden = wiz && step !== 3; });
    v('fNextWrap').hidden = true; v('fBack').hidden = !(wiz && step > 1); v('fFwd').hidden = !(wiz && step < 3 && !isNew);
    el.querySelectorAll('[data-step]').forEach(x => { x.setAttribute('aria-current', String(+x.dataset.step === step)); x.classList.toggle('done', +x.dataset.step < step); });
    v('fBfMore').hidden = kind === 'block' || !v('fBf').checked; v('fBfMore').textContent = bfHas(svcBf) ? 'แก้รายละเอียดอาหารเช้า' : '+ รายละเอียดอาหารเช้า';
    v('fReasonOtherWrap').hidden = kind !== 'block' || v('fReason').value !== '__other';
    el.querySelectorAll('[data-kind]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.kind === kind)));
    el.querySelectorAll('.month-only').forEach(x => x.hidden = kind === 'block' || v('fRateType').value !== 'month');
    const compOn = kind !== 'block' && v('fComp').checked;
    el.querySelectorAll('.fin-only').forEach(x => { if (!canFinance() || compOn) x.hidden = true; else if (!x.classList.contains('month-only')) x.hidden = false; });
    v('fFinLeg').textContent = canFinance() && !compOn ? 'ราคาและการชำระเงิน' : 'ช่องทางการจอง';
    if (canFinance() && !compOn) v('fDiscNoteWrap').hidden = !(+v('fDisc').value > 0);
    if (canFinance() && !compOn) {
      const fxShow = fxOpen || fxItems.length, coShow = !isNew && (coOpen || ['checked_in', 'checked_out'].includes(v('fStatus').value) || (b.fines || []).length || b.depRefund);
      v('fFxBox').hidden = !fxShow; v('fFxOpen').hidden = !!fxShow; v('fCoBox').hidden = !coShow; v('fCoOpen').hidden = !!coShow || isNew; v('fMoreRow').hidden = !!fxShow && (!!coShow || isNew);
    }
    if (kind !== 'block') eqLimit();
    const o = collect();
    v('fRateLbl').textContent = o.rateType === 'month' ? 'ราคาต่อเดือน (บาท)' : 'ราคาต่อคืน (บาท)';
    const n = (validD(o.checkIn) && validD(o.checkOut)) ? diffDays(o.checkIn, o.checkOut) : 0;
    if (kind !== 'block') { const bal = balanceOf(o); v('fSum').innerHTML = `<div>จำนวนคืน<b>${n > 0 ? n : '—'}</b></div><div>ค่าห้อง<b>${money(roomCharge(o))}</b></div>${o.rateType === 'month' ? `<div>ค่าไฟ<b>${money(elecCharge(o))}</b></div>` : ''}${discOf(o) ? `<div>ส่วนลด${o.discType === 'pct' ? ` ${+o.discVal}%` : ''}<b class="disc">−${money(discOf(o))}</b></div>` : ''}<div>รวมค่าห้อง<b>${money(totalOf(o))}</b></div>${finesOf(o) ? `<div>ค่าปรับ<b>${money(finesOf(o))}</b></div>` : ''}${+o.deposit ? `<div>มัดจำ<b>${money(o.deposit)}</b></div>` : ''}<div>ต้องเก็บทั้งหมด<b>${money(capOf(o))}</b></div>${depRefOf(o) ? `<div>คืนมัดจำ<b>${money(refundAmtOf(o))}</b></div>` : ''}<div>รับแล้ว<b>${money(+o.paid || 0)}</b></div><div>${bal > 0 ? 'ยังขาดอีก' : bal < 0 ? 'เกิน' : 'คงค้าง'}<b class="${bal > 0 ? 'owe' : 'paidok'}">${bal > 0 ? money(bal) : bal < 0 ? money(-bal) : capOf(o) > 0 ? 'ครบแล้ว ✓' : '—'}</b></div>`; }
    const c = n > 0 ? overlapping(o.roomId, o.checkIn, o.checkOut, existing?.id) : [];
    v('fClash').innerHTML = c.length ? `<div class="notice err">ห้อง ${esc(roomNo(o.roomId))} มีรายการซ้อนช่วงนี้: ${c.map(x => `${esc(x.kind === 'block' ? (x.reason || 'ปิดห้อง') : x.guest)} (${fmtD(x.checkIn)} → ${fmtD(x.checkOut)})`).join(', ')}</div>` : (n <= 0 && o.checkIn && o.checkOut ? '<div class="notice err">วันเช็คเอาท์ต้องหลังวันเช็คอิน</div>' : '');
    if (kind !== 'block') v('fEqHint').innerHTML = equipHint(o, existing?.id);
    if (canFinance() && kind !== 'block') depDraw();
    v('fCompBox').hidden = kind === 'block' || !v('fComp').checked;
    clashOk = false; v('fSave').textContent = gate ? 'ถัดไป' : isNew ? 'บันทึกการจอง' : 'บันทึก'; v('fConfirm').innerHTML = '';
  }
  function showLink() {
    const box = v('fGLink'), name = v('fGuest').value.trim();
    const g = gid ? M.guests.get(gid) : findGuest(name, v('fPhone').value.trim());
    if (g) { const s = guestStats().get(g.id); const bl = (g.tags || []).includes('blacklist');
      box.innerHTML = `<div class="glink${bl ? ' warn' : ''}">${bl ? '<b>แขกคนนี้ถูกติดป้าย “ห้ามรับจอง”</b> · ' : ''}${gid ? 'ผูกกับโปรไฟล์' : 'พบโปรไฟล์ชื่อนี้ จะผูกให้อัตโนมัติ'}: <b>${esc(g.name)}</b>${s ? ` · มาพักแล้ว ${s.stays} ครั้ง` : ''}${(g.tags || []).filter(t => t !== 'blacklist').map(t => ` <span class="pill p-vip">${esc(TAGS[t])}</span>`).join('')}${g.notes ? ` · ${esc(g.notes)}` : ''} <button type="button" class="btn sm" data-gopen="${esc(g.id)}">ดูโปรไฟล์</button></div>`; }
    else box.innerHTML = name ? '<div class="glink">แขกใหม่ · ระบบจะเพิ่มเข้าฐานข้อมูลแขกเมื่อบันทึก</div>' : '';
  }
  function fillFrom(g) { gid = g.id; v('fGuest').value = g.name; if (g.phone) v('fPhone').value = g.phone; if (g.email) v('fEmail').value = g.email; if (g.nationality) v('fNat').value = g.nationality; if (g.passport) v('fPass').value = g.passport; if (g.dob) { v('fDob').value = g.dob; labelDates(v('fDob').parentElement); } v('fSugg').hidden = true; showLink(); refresh(); }
  // taxi rows
  const txBox = v('fTx');
  const txRow = t => { const d = document.createElement('div'); d.className = 'tx-row'; d.dataset.id = t.id || Store.newId();
    d.innerHTML = txRowInner(t);
    txBox.appendChild(d); labelDates(d); };
  txBox.insertAdjacentHTML('beforebegin', `<datalist id="txPlaces">${[TX_HOTEL, ...TX_PLACES].map(p => `<option>${esc(p)}</option>`).join('')}</datalist>`);
  txOf(b).forEach(txRow);
  function readTx() { return readTxRows(txBox); }
  txBind(txBox);
  el.addEventListener('click', e => {
    const add = e.target.closest('[data-addtx]');
    if (add) { const ty = add.dataset.addtx, pax = (+v('fAdults').value || 0) + (+v('fKids').value || 0) || 1;
      txRow(txNew(ty, ty === 'dropoff' ? v('fOut').value : v('fIn').value, pax, v('fEta').value));
      txBox.lastElementChild.querySelector(ty === 'other' ? '[data-k=from]' : '[data-k=time]').focus(); return; }
    const del = e.target.closest('[data-deltx]'); if (del) del.closest('.tx-row').remove();
  });
  // ----- slips & booking documents -----
  let attItems = Array.isArray(b.attachments) ? b.attachments.slice() : [];
  const attDraw = () => { v('fAttList').innerHTML = attItems.length ? attItems.map((f, i) => `<div class="att"><span class="doc-ic t-${fileIcon(f.name)}">${fileIcon(f.name)}</span><div class="att-m"><b>${esc(f.name)}</b><span>${fmtSize(+f.size || 0)} · ${esc(nameOf(f.by))} · ${f.at ? fmtTime(f.at) : ''}</span></div><button type="button" class="btn sm" data-attopen="${i}">เปิด</button><button type="button" class="btn sm ghost" data-attsave="${i}">ดาวน์โหลด</button><button type="button" class="iconbtn" data-attdel="${i}" title="ลบไฟล์">✕</button></div>`).join('') : '<div class="hint">ยังไม่มีไฟล์แนบ</div>'; };
  attDraw();
  v('fAtt').onchange = async e => {
    const files = [...e.target.files]; e.target.value = '';
    for (const file of files) {
      if (file.size > 15 * 1048576) { toast(`${file.name} ใหญ่เกิน 15 MB`, 'err'); continue; }
      const path = `${bookingId}/${Date.now().toString(36)}_${file.name.replace(/[^\w.\-]+/g, '_').slice(-80)}`;
      toast(`กำลังอัปโหลด ${file.name}…`, 'info');
      try { await Store.uploadFile(path, file, 'attachments'); attItems.push({ path, name: file.name, size: file.size, type: file.type || '', at: Date.now(), by: Store.me?.id }); attDraw(); toast('แนบไฟล์แล้ว · กดบันทึกเพื่อเก็บไว้กับการจองนี้'); }
      catch (er) { console.error(er); toast(errMsg(er), 'err'); }
    }
  };
  v('fAttList').addEventListener('click', async e => {
    const o = e.target.closest('[data-attopen],[data-attsave]');
    if (o) { const f = attItems[+(o.dataset.attopen ?? o.dataset.attsave)]; if (f) openDoc({ ...f, bucket: 'attachments' }, o.dataset.attopen != null ? 'open' : 'save'); return; }
    const d = e.target.closest('[data-attdel]');
    if (d) { const f = attItems.splice(+d.dataset.attdel, 1)[0]; attDraw(); if (f) Store.removeFile(f.path, 'attachments').catch(() => {}); toast('ลบไฟล์แล้ว · กดบันทึกเพื่อยืนยัน'); }
  });
  // ----- foreign-currency payments -----
  let fxItems = Array.isArray(b.fx) ? b.fx.slice() : [];
  const fxCalc = () => { const amt = +v('fxAmt').value || 0, r = +v('fxRate').value || 0; v('fxThb').textContent = '฿' + money(amt * r); return Math.round(amt * r); };
  const fxSetRate = () => { v('fxRate').value = +fxRate(v('fxCur').value).toFixed(4); v('fxSrc').textContent = fxLive() ? `อัตรา ณ ${fmtShort(FX.date)} · แก้ตัวเลขอัตราได้` : 'อัตราประมาณ · ควรตรวจและแก้ตัวเลขอัตราให้ตรงกับที่รับจริง'; fxCalc(); };
  const fxDraw = () => { v('fxList').innerHTML = fxItems.map((x, i) => `<div class="fx-item"><span>${x.to === 'deposit' ? 'มัดจำ' : 'รับชำระ'}</span><b>${esc(x.cur)} ${money(x.amt)}</b><span>× ${x.rate} = ฿${money(x.thb)}</span><span class="hint">${esc(fmtShort(x.date))}</span><button type="button" class="iconbtn" data-fxdel="${i}" title="ลบ">✕</button></div>`).join(''); };
  if (canFinance()) {
    v('fxCur').onchange = fxSetRate; v('fxAmt').oninput = fxCalc; v('fxRate').oninput = fxCalc;
    fxSetRate(); fxDraw(); loadFx().then(() => { if (document.body.contains(el)) fxSetRate(); });
    el.addEventListener('click', e => {
      const t = e.target.closest('[data-fxto]');
      if (t) { const thb = fxCalc(); if (!thb) return toast('ใส่จำนวนเงินก่อน', 'err');
        const to = t.dataset.fxto, it = { to, amt: +v('fxAmt').value, cur: v('fxCur').value, rate: +v('fxRate').value, thb, date: todayStr() };
        fxItems.push(it);
        if (to === 'deposit') v('fDep').value = (+v('fDep').value || 0) + thb;
        v('fPaid').value = (+v('fPaid').value || 0) + thb;
        v('fxAmt').value = ''; fxCalc(); fxDraw(); capPay(); refresh(); return; }
      const d = e.target.closest('[data-fxdel]');
      if (d) { const it = fxItems.splice(+d.dataset.fxdel, 1)[0];
        if (it) { if (it.to === 'deposit') v('fDep').value = Math.max(0, (+v('fDep').value || 0) - it.thb); v('fPaid').value = Math.max(0, (+v('fPaid').value || 0) - it.thb); }
        fxDraw(); refresh(); }
    });
  }
  // ----- check-out fines & deposit refund -----
  const fineBox = v('fFines');
  const fineRow = (it = {}) => { const d = document.createElement('div'); d.className = 'fine-row';
    d.innerHTML = `<input type="text" data-fn="name" list="fineSugg" value="${esc(it.name || '')}" placeholder="รายการที่ปรับ"><input type="number" data-fn="amt" min="0" value="${+it.amt || ''}" placeholder="บาท"><button type="button" class="iconbtn" data-findel title="ลบ">✕</button>`;
    fineBox.appendChild(d); return d; };
  function readFines() { return [...fineBox.querySelectorAll('.fine-row')].map(r => ({ name: r.querySelector('[data-fn=name]').value.trim(), amt: +r.querySelector('[data-fn=amt]').value || 0 })).filter(x => x.name || x.amt); }
  const depOld = b.depRefund || null;
  function readDep() {
    const st = v('fDepSt').value; if (st === 'none') return null;
    const o = { st, amt: st === 'part' ? (+v('fDepAmt').value || 0) : 0, note: v('fDepNote').value.trim() };
    return depOld && depOld.st === o.st && +depOld.amt === o.amt ? { ...o, at: depOld.at, by: depOld.by } : { ...o, at: Date.now(), by: Store.me?.id };
  }
  function depDraw() {
    const dep = +v('fDep').value || 0, st = v('fDepSt').value, fines = readFines().reduce((s, x) => s + x.amt, 0);
    v('fDepSt').disabled = !dep; v('fDepAmt').hidden = st !== 'part'; v('fDepNote').hidden = st === 'none'; v('fDepCalc').hidden = !dep;
    const back = st === 'full' ? dep : st === 'part' ? Math.min(dep, +v('fDepAmt').value || 0) : 0, kept = st === 'none' ? 0 : dep - back;
    v('fDepHint').textContent = !dep ? (fines ? `ค่าปรับรวม ฿${money(fines)} · ไม่มีมัดจำ เก็บเพิ่มจากแขก` : 'ไม่มีมัดจำ') : st === 'none' ? `แขกวางมัดจำ ฿${money(dep)} · ยังไม่ได้คืน${fines ? ` · ค่าปรับรวม ฿${money(fines)}` : ''}`
      : `คืนแขก ฿${money(back)}${kept ? ` · หักจากมัดจำ ฿${money(kept)}` : ''}${fines ? ` · ค่าปรับรวม ฿${money(fines)}` : ''}${depOld && depOld.at && st === depOld.st ? ` · บันทึกเมื่อ ${fmtTime(depOld.at)} โดย ${nameOf(depOld.by)}` : ''}`;
  }
  if (canFinance()) {
    (Array.isArray(b.fines) ? b.fines : []).forEach(fineRow);
    v('fFineAdd').onclick = () => { fineRow().querySelector('input').focus(); };
    fineBox.addEventListener('click', e => { const d = e.target.closest('[data-findel]'); if (d) { d.closest('.fine-row').remove(); capPay(); refresh(); } });
    v('fDepCalc').onclick = () => { const dep = +v('fDep').value || 0, fines = readFines().reduce((s, x) => s + x.amt, 0);
      if (fines <= 0) v('fDepSt').value = 'full'; else if (fines >= dep) v('fDepSt').value = 'kept'; else { v('fDepSt').value = 'part'; v('fDepAmt').value = dep - fines; }
      if (fines && !v('fDepNote').value) v('fDepNote').value = 'หักค่าปรับ: ' + readFines().map(x => x.name).filter(Boolean).join(', ');
      refresh(); };
  }
  // paid / deposit can never be more than the booking total
  function capPay() {
    if (!canFinance() || kind === 'block') return;
    const o = collect(), due = capOf(o), hint = v('fPayHint'); let paid = +v('fPaid').value || 0, msg = '';
    if (paid > due && due > 0) { v('fPaid').value = due; paid = due; msg = `รับชำระได้สูงสุด ฿${money(due)} (ค่าห้อง + ค่าปรับ + มัดจำ) · ปรับให้แล้ว`; }
    if (due <= 0 && paid > 0) msg = 'ยังไม่ได้ใส่ราคา · ใส่ราคาก่อน แล้วระบบจะตรวจยอดรับชำระให้';
    hint.textContent = msg; hint.classList.toggle('owe', !!msg);
  }
  v('fPaidMax') && (v('fPaidMax').onclick = () => { const due = capOf(collect()); if (!due) return toast('ใส่ราคาห้องก่อน', 'err'); v('fPaid').value = due; capPay(); refresh(); });
  el.addEventListener('change', e => { if (['fPaid', 'fDep', 'fRate', 'fExtras', 'fDisc', 'fDiscType', 'fIn', 'fOut', 'fRateType'].includes(e.target.id)) { capPay(); refresh(); } });
  el.addEventListener('input', e => { if (e.target.id === 'fPaid') { const due = capOf(collect()); const over = due > 0 && (+e.target.value || 0) > due; v('fPayHint').textContent = over ? `เกินยอดที่ต้องเก็บ ฿${money(due)} · ระบบจะปรับให้` : ''; v('fPayHint').classList.toggle('owe', over); } });
  let rateTouched = !isNew || (+b.rate || 0) > 0;
  const autoRate = () => { if (rateTouched || kind === 'block' || !canFinance() || v('fComp').checked) return; const s = suggestRate(v('fRoom').value, v('fIn').value, v('fRateType').value, v('fBf').checked); v('fRate').value = s || 0; };
  const onEdit = e => { if (e.type === 'input' && e.target.id === 'fRate') rateTouched = true; refresh();
    if (e.target.id !== 'fRate') { const before = v('fRate').value; autoRate(); if (v('fRate').value !== before) refresh(); } };
  el.addEventListener('input', onEdit); el.addEventListener('change', onEdit);
  autoRate();
  el.querySelectorAll('[data-kind]').forEach(x => x.onclick = () => { kind = x.dataset.kind; refresh(); });
  v('fGuest').addEventListener('input', () => {
    const q = v('fGuest').value.trim().toLowerCase();
    if (gid && M.guests.get(gid) && normName(M.guests.get(gid).name) !== normName(q)) gid = null;
    const sg = v('fSugg'); if (q.length < 2) { sg.hidden = true; showLink(); return; }
    const gs = guestStats();
    const hits = [...M.guests.values()].filter(g => [g.name, g.phone, g.passport].some(x => x && String(x).toLowerCase().includes(q))).sort((a, b) => (gs.get(b.id)?.stays || 0) - (gs.get(a.id)?.stays || 0)).slice(0, 6);
    sg.innerHTML = hits.map(g => `<button type="button" data-gpick="${esc(g.id)}">${avatar(g.name, 'avatar sm')}<span>${esc(g.name)}</span><small>${esc([g.nationality, g.phone, (gs.get(g.id)?.stays || 0) + ' ครั้ง'].filter(Boolean).join(' · '))}</small></button>`).join('');
    sg.hidden = !hits.length; showLink();
  });
  v('fGuest').addEventListener('blur', () => setTimeout(() => { if (v('fSugg')) v('fSugg').hidden = true; }, 180));
  v('fPhone').addEventListener('input', showLink);
  el.addEventListener('click', e => {
    const p = e.target.closest('[data-gpick]'); if (p) { const g = M.guests.get(p.dataset.gpick); if (g) fillFrom(g); return; }
    const o = e.target.closest('[data-gopen]'); if (o) { m.close(); openGuest(o.dataset.gopen); }
  });
  drawComp(); refresh(); showLink();
  setTimeout(() => (kind === 'block' ? v('fReason') : v('fGuest')).focus(), 40);

  // breakfast details right where it is ticked
  const askBf = () => {
    if (!svcBf && isNew) { const gg = gid ? M.guests.get(gid) : findGuest(v('fGuest').value.trim(), v('fPhone').value.trim()); if (gg && gg.prefs && gg.prefs.bf) svcBf = JSON.parse(JSON.stringify(gg.prefs.bf)); }
    svcModal(`${icon('coffee')} อาหารเช้า`, `${esc(v('fGuest').value.trim() || 'แขกใหม่')} · ใช้ตลอดการเข้าพักครั้งนี้ · ไม่ต้องกรอกก็ได้`, bfBody(svcBf || {}), async m2 => { svcBf = bfRead(m2); refresh(); return true; });
  };
  v('fBf').addEventListener('change', () => { if (v('fBf').checked) askBf(); });
  v('fBfMore').onclick = askBf;
  const goStep = n => {
    if (n === step) return;
    if (n >= 2 && !v('fGuest').value.trim()) { toast('กรุณาใส่ชื่อแขกก่อน', 'err'); v('fGuest').focus(); return; }
    const form = v('bkForm'); form.classList.remove('slide-l', 'slide-r'); void form.offsetWidth; form.classList.add(n > step ? 'slide-l' : 'slide-r');
    step = n; if (n >= 2) reached = true; refresh(); el.scrollTop = 0;
    setTimeout(() => { const f = n === 3 ? v('fChan') : n === 1 ? v('fGuest') : null; if (f && !f.disabled) f.focus({ preventScroll: true }); }, 60);
  };
  const goNext = () => goStep(Math.min(3, step + 1));
  v('fNext').onclick = goNext;
  v('fBack').onclick = () => goStep(Math.max(1, step - 1));
  v('fFwd').onclick = () => goStep(Math.min(3, step + 1));
  v('fFxOpen').onclick = () => { fxOpen = true; refresh(); };
  v('fCoOpen').onclick = () => { coOpen = true; refresh(); };
  v('fSteps').addEventListener('click', e => { const s = e.target.closest('[data-step]'); if (s) goStep(+s.dataset.step); });
  v('fSave').onclick = async () => { if (isNew && kind === 'booking' && step < 3) return goNext(); capPay();
    const o = collect();
    if (!validD(o.checkIn) || !validD(o.checkOut) || o.checkOut <= o.checkIn) { goStep(1); return toast('กรุณาใส่วันเช็คอินและเช็คเอาท์ให้ถูกต้อง', 'err'); }
    if (!o.roomId) return toast('ไม่มีห้องว่างในช่วงวันที่นี้ ลองเปลี่ยนวัน', 'err');
    if (kind === 'booking' && !o.guest) { goStep(1); toast('กรุณาใส่ชื่อแขก', 'err'); v('fGuest').focus(); return; }
    if (kind === 'booking' && o.comp && o.comp.type === COMP_HOST && !o.comp.by) { toast('แขกรับรอง: ใส่ชื่อว่ามาในนามของใคร', 'err'); v('fCompBy').focus(); return; }
    const c = overlapping(o.roomId, o.checkIn, o.checkOut, existing?.id);
    if (c.length && !clashOk) { if (step !== 3 && kind === 'booking') goStep(3); clashOk = true; v('fSave').textContent = 'ยืนยันบันทึก ถึงห้องจะซ้อน'; v('fConfirm').innerHTML = '<div class="notice">ห้องนี้มีรายการซ้อนอยู่ กดปุ่มอีกครั้งเพื่อยืนยัน หรือเปลี่ยนห้อง/วันที่</div>'; return; }
    const id = bookingId;
    const base = existing ? { ...existing } : { createdAt: Date.now(), createdBy: Store.me?.id };
    if (kind === 'block') ['guest', 'phone', 'email', 'nationality', 'passport', 'adults', 'children', 'breakfast', 'channel', 'ref', 'rate', 'rateType', 'paid', 'deposit', 'extras', 'guestId', 'extraBeds', 'babyCots', 'extraBed', 'babyCot', 'transfers', 'attachments', 'payRef', 'comp', 'fines', 'depRefund', 'discType', 'discVal', 'discNote'].forEach(k => delete base[k]);
    const data = { ...base, ...o };
    if (existing && existing.xcolor && (o.channel || '') !== (existing.channel || '')) delete data.xcolor;
    if (isNew && kind === 'booking' && !data.svc) { const gg = gid ? M.guests.get(gid) : findGuest(o.guest, o.phone); if (gg && gg.prefs) data.svc = JSON.parse(JSON.stringify(gg.prefs)); }
    if (kind === 'booking' && svcBf) data.svc = { ...(data.svc || {}), bf: svcBf };
    v('fSave').disabled = true;
    const ok = await save(async () => {
      if (kind === 'booking') {
        const g = gid ? M.guests.get(gid) : findGuest(o.guest, o.phone);
        if (g) {
          const patch = {}; for (const [k, f] of [['name', 'guest'], ['phone', 'phone'], ['email', 'email'], ['nationality', 'nationality'], ['passport', 'passport'], ['dob', 'dob']]) if (o[f] && o[f] !== g[k]) patch[k] = o[f];
          if (Object.keys(patch).length) await Store.merge('guests', g.id, { ...patch, updatedAt: Date.now(), updatedBy: Store.me?.id });
          data.guestId = g.id;
        } else {
          const ngid = Store.newId();
          await Store.put('guests', ngid, { name: o.guest, phone: o.phone, email: o.email, nationality: o.nationality, passport: o.passport, dob: o.dob || '', tags: [], notes: '', createdAt: Date.now(), createdBy: Store.me?.id });
          data.guestId = ngid; gid = ngid;
        }
      }
      const fin = { ...(M.finance.get(id) || {}) }; FIN_FIELDS.forEach(f => { if (f in data) fin[f] = data[f]; delete data[f]; });
      await Store.put('bookings', id, data);
      if (canFinance() && kind === 'booking') await Store.put('finance', id, fin);
    }, isNew ? 'บันทึกการจองแล้ว' : 'บันทึกการแก้ไขแล้ว');
    v('fSave') && (v('fSave').disabled = false);
    if (ok) { logAct(`${isNew ? 'สร้าง' : 'แก้ไข'} ${kind === 'block' ? `ปิดห้อง ${roomNo(o.roomId)} (${o.reason})` : o.guest} · ห้อง ${roomNo(o.roomId)} · ${fmtD(o.checkIn)} → ${fmtD(o.checkOut)}`); m.close(); }
  };
  if (v('fCheckin')) v('fCheckin').onclick = async () => { if (await setBookingStatus(existing, 'checked_in')) m.close(); };
  if (v('fCheckout')) v('fCheckout').onclick = async () => {
    if (await setBookingStatus(existing, 'checked_out')) m.close();
  };
  if (v('fPrint')) v('fPrint').onclick = () => openReservation(M.bookings.get(existing.id) || existing);
  if (v('fDel')) v('fDel').onclick = async () => {
    const btn = v('fDel'); if (!btn.dataset.ok) { btn.dataset.ok = 1; btn.textContent = 'กดอีกครั้งเพื่อยืนยันการลบ'; return; }
    const ok = await save(async () => { await Store.del('bookings', existing.id); if (canFinance() && M.finance.has(existing.id)) await Store.del('finance', existing.id); }, 'ลบรายการแล้ว');
    if (ok) { logAct(`ลบ ${existing.kind === 'block' ? 'การปิดห้อง' : existing.guest} · ห้อง ${roomNo(existing.roomId)} · ${fmtD(existing.checkIn)}`); m.close(); }
  };
}
function openFinder() {
  const t = todayStr();
  const m = openModal(`<div class="sheet narrow"><div class="sheet-h"><h2>หาห้องว่าง</h2><div class="spacer"></div><button class="btn ghost" data-close>✕</button></div>
    <div class="sheet-b"><div class="fields"><label class="f"><span>เช็คอิน</span><input type="date" id="ffIn" value="${t}"></label><label class="f"><span>เช็คเอาท์</span><input type="date" id="ffOut" value="${addDays(t, 1)}"></label>
      <label class="f w2"><span>ประเภทห้อง</span><select id="ffType"><option value="">ทุกประเภท</option><option value="single">ห้องเดี่ยว</option><option value="family">Family 2 ห้องนอน</option></select></label></div><div id="ffRes"></div></div></div>`);
  const el = m.el;
  const run = () => {
    const ci = $('#ffIn', el).value, co = $('#ffOut', el).value, ty = $('#ffType', el).value;
    if (!validD(ci) || !validD(co) || co <= ci) { $('#ffRes', el).innerHTML = '<div class="hint">เลือกวันให้ถูกต้อง</div>'; return; }
    const free = activeRooms().filter(r => (!ty || (r.type === 'family' ? 'family' : 'single') === ty) && !overlapping(r.id, ci, co).length);
    $('#ffRes', el).innerHTML = `<div class="hint" style="margin-bottom:8px">ว่าง ${free.length} ห้อง · ${diffDays(ci, co)} คืน</div>` + (free.length ? `<table><tbody>${free.map(r => `<tr><td class="rn">${esc(r.no)}</td><td>${esc(roomLabel(r))}</td><td class="r"><button class="btn sm primary" data-book="${esc(r.id)}">จอง</button></td></tr>`).join('')}</tbody></table>` : '<div class="empty">ไม่มีห้องว่างตามเงื่อนไขนี้</div>');
  };
  el.addEventListener('change', run); run();
  el.addEventListener('click', e => { const b = e.target.closest('[data-book]'); if (b) { const ci = $('#ffIn', el).value, co = $('#ffOut', el).value; m.close(); openBooking(null, { roomId: b.dataset.book, checkIn: ci, checkOut: co }); } });
}

/* ================= DAILY ================= */
const bfFor = (b, d) => b.kind !== 'block' && b.checkIn < d && d <= b.checkOut;
function dailyRows(d) {
  const rows = [], ops = opsOf(d);
  for (const r of activeRooms()) {
    const list = allBookings().filter(b => isActive(b) && b.kind !== 'block' && b.roomId === r.id && b.checkIn <= d && d <= b.checkOut);
    if (!list.length) continue;
    const stay = list.find(b => b.checkIn < d && d < b.checkOut) || list.find(b => b.checkOut === d) || list[0];
    const bfB = list.find(b => bfFor(b, d)); const o = ops.rooms?.[r.id] || {};
    const who = bfB || stay; const bf = o.bf != null ? o.bf : !!(bfB && bfB.breakfast);
    rows.push({ r, b: stay, bfB, bf, pax: bf ? (((+who.adults || 0) + (+who.children || 0)) || 1) : 0, o });
  }
  return rows;
}
function renderDaily() {
  const d = S.day; $('#dlDate').value = d; $('#dlTitle').textContent = fmtLong(d);
  const all = allBookings().filter(b => isActive(b) && b.kind !== 'block');
  const byRoom = (a, b) => roomNo(a.roomId) < roomNo(b.roomId) ? -1 : 1;
  const arr = all.filter(b => b.checkIn === d).sort(byRoom), dep = all.filter(b => b.checkOut === d).sort(byRoom);
  const rows = dailyRows(d), m = dayMetrics(d);
  const bfPax = rows.reduce((s, x) => s + (x.bf ? x.pax : 0), 0), lRooms = rows.filter(x => x.o.laundry).length, txN = transfersOn(d).length;
  $('#dlStats').innerHTML = `<div class="stat"><span>ห้องมีแขกคืนนี้</span><b>${m.occ} / ${m.sellable}</b><small>${Math.round(m.pct)}% · ${m.pax} ท่าน</small></div>
    <div class="stat"><span>เช็คอิน</span><b>${arr.length}</b><small>เข้าแล้ว ${arr.filter(b => b.status === 'checked_in' || b.status === 'checked_out').length}</small></div>
    <div class="stat"><span>เช็คเอาท์</span><b>${dep.length}</b><small>ออกแล้ว ${dep.filter(b => b.status === 'checked_out').length}</small></div>
    <div class="stat"><span>อาหารเช้าเช้านี้</span><b>${bfPax}</b><small>${rows.filter(x => x.bf).length} ห้อง</small></div>
    <div class="stat"><span>ส่งผ้าซัก</span><b>${lRooms}</b><small>ห้อง</small></div><div class="stat"><span>รถรับส่ง</span><b>${txN}</b><small>เที่ยววันนี้</small></div>`;
  const fin = canFinance();
  const listT = (list, kind) => list.length ? `<table><thead><tr><th>ห้อง</th><th>แขก</th><th>ช่องทาง</th>${fin ? '<th class="r">คงค้าง</th>' : ''}<th></th></tr></thead><tbody>${list.map(b => {
    const bal = b.src === 'excel' ? 0 : balanceOf(b); const done = kind === 'arr' ? (b.status === 'checked_in' || b.status === 'checked_out') : b.status === 'checked_out';
    return `<tr class="click" data-id="${esc(b.id)}"><td class="rn">${esc(roomNo(b.roomId))}</td><td>${esc(b.guest)}<div class="hint">${nightsOf(b)} คืน${b.eta && kind === 'arr' ? ' · ถึง ' + esc(b.eta) : ''}${b.breakfast ? ' · BF' : ''}${fin && kind === 'dep' && +withFin(b).deposit && !depRefOf(b) ? ` · <span class="dep-tag">มัดจำ ฿${money(+withFin(b).deposit)} ยังไม่คืน</span>` : ''}</div></td><td>${esc(b.channel || '—')}</td>${fin ? `<td class="r num ${bal > 0 ? 'owe' : ''}">${bal > 0 ? money(bal) : '—'}</td>` : ''}
      <td class="r">${done ? `<span class="pill p-${b.status}">${STATUS[b.status]}</span>${(kind === 'arr' && b.status === 'checked_in') || (kind === 'dep' && b.status === 'checked_out') ? ` <button class="btn sm ghost" data-undo="${kind}" data-id="${esc(b.id)}" title="กดผิด? กลับไปสถานะก่อนหน้า">ยกเลิก</button>` : ''}` : `<button class="btn sm ${kind === 'arr' ? 'primary' : ''}" data-quick="${kind}" data-id="${esc(b.id)}">${kind === 'arr' ? 'เช็คอิน' : 'เช็คเอาท์'}</button>`}</td></tr>`; }).join('')}</tbody></table>` : `<div class="empty">${kind === 'arr' ? 'ไม่มีแขกเข้าวันนี้' : 'ไม่มีแขกออกวันนี้'}</div>`;
  $('#arrivals').innerHTML = listT(arr, 'arr'); $('#arrCount').textContent = arr.length ? `${arr.length} รายการ` : '';
  $('#departures').innerHTML = listT(dep, 'dep'); $('#depCount').textContent = dep.length ? `${dep.length} รายการ` : '';
  const focused = document.activeElement && $('#opsTable').contains(document.activeElement) && document.activeElement.type === 'text';
  if (focused) return;
  renderTaxiCard(d); renderTodos(d);
  $('#opsCount').textContent = rows.length ? `${rows.length} ห้อง · อาหารเช้า ${rows.filter(x => x.bf).length} · ทำความสะอาด ${rows.filter(x => cleanDue(x.b, d)).length} · ส่งผ้าซัก ${rows.filter(x => x.o.laundry).length}` : '';
  $('#opsTable').innerHTML = rows.length ? `<div class="ops-list">${rows.map(x => { const fam = x.r.type === 'family';
    const st = x.b.checkOut === d ? ['out', 'ออกวันนี้'] : x.b.checkIn === d ? ['in', 'เข้าวันนี้'] : ['stay', 'พักถึง ' + fmtShort(x.b.checkOut)];
    return `<div class="ops-row" data-room="${esc(x.r.id)}">
      <div class="roomtag ${fam ? 'rt-family' : 'rt-single'}">${esc(x.r.no)}<small>${fam ? 'FAMILY' : esc((x.r.bed || 'ROOM').toUpperCase())}</small></div>
      <div class="ops-g" data-sum title="ดูรายละเอียดทั้งหมดของห้องนี้"><b>${esc(x.b.guest)}</b><span><i class="ops-st ${st[0]}">${st[1]}</i></span>${xbedOf(x.b) || cotOf(x.b) ? `<span class="ops-eq">${xbedOf(x.b) ? `<em class="eqb xb">เตียงเสริม ${xbedOf(x.b)}</em>` : ''}${cotOf(x.b) ? `<em class="eqb ct">เปลเด็ก ${cotOf(x.b)}</em>` : ''}</span>` : ''}</div>
      <div class="ops-chips">
        ${(() => { const bfS = svcOf(x.bfB || x.b).bf, clS = svcOf(x.b).clean, li = x.o.linfo, tx = txOf(x.b).filter(t => t.status !== 'cancelled' && t.date >= d), txToday = tx.filter(t => t.date === d);
          const more = (k, has) => has ? '<i class="opdot" title="มีรายละเอียด"></i>' : '';
          return `<button type="button" class="opchip bf${!x.bf && x.b.breakfast && x.b.checkIn === d ? ' soon' : ''}" data-more="bf" aria-pressed="${!!x.bf}"${!x.bf && x.b.breakfast && x.b.checkIn === d ? ' title="เข้าวันนี้ · เริ่มทานอาหารเช้าพรุ่งนี้เช้า"' : ''}>${icon('coffee')}<span>อาหารเช้า</span>${more('bf', bfS && Object.values(bfS).some(v => v && v.length))}</button>
          <button type="button" class="opchip clean" data-more="clean" aria-pressed="${cleanDue(x.b, d)}"${cleanDue(x.b, d) ? ` title="ห้องนี้ต้องทำความสะอาดวันนี้ (${esc((svcOf(x.b).clean || {}).freq || 'ทุกวัน')})"` : ''}>${icon('sparkle')}<span>ทำความสะอาด</span>${more('clean', clS && Object.values(clS).some(v => v && v.length))}</button>
          <button type="button" class="opchip laundry" data-more="laundry" aria-pressed="${!!x.o.laundry}">${icon('shirt')}<span>ส่งผ้าซัก</span>${more('laundry', li && (li.shop || li.qty))}</button>
          <span class="opgrp"><button type="button" class="opchip taxi solo" data-more="taxi" aria-pressed="${tx.length > 0}">${icon('car')}<span>${txToday.length ? `รถ ${esc(txToday[0].time || 'วันนี้')}` : tx.length ? 'รถ ' + esc(fmtShort(tx[0].date)) : 'Taxi'}</span></button></span>
          <button type="button" class="opchip note" data-more="note" aria-pressed="${!!x.o.note}" title="${esc(x.o.note || 'หมายเหตุ')}">${icon('note')}<span>หมายเหตุ</span></button>`; })()}
      </div>
      <div class="ops-svc">${svcSummary(x)}</div>
      ${x.o.bf != null && x.o.bf !== !!(x.bfB && x.bfB.breakfast) ? '<span class="ops-flag">อาหารเช้าเปลี่ยนเฉพาะวันนี้</span>' : ''}
    </div>`; }).join('')}</div>` : '<div class="empty">ไม่มีห้องที่มีแขกในวันนี้</div>';
}
function bindDaily() {
  $('#p-daily').addEventListener('click', async e => {
    const u = e.target.closest('[data-undo]');
    if (u) { e.stopPropagation(); const b = M.bookings.get(u.dataset.id); if (!b) return; u.disabled = true; if (!await setBookingStatus(b, u.dataset.undo === 'arr' ? 'confirmed' : 'checked_in')) u.disabled = false; return; }
    const q = e.target.closest('[data-quick]');
    if (q) { e.stopPropagation(); const b = M.bookings.get(q.dataset.id); if (!b) return; q.disabled = true; if (!await setBookingStatus(b, q.dataset.quick === 'arr' ? 'checked_in' : 'checked_out')) q.disabled = false; return; }
    const tr = e.target.closest('tr.click[data-id]'); if (tr && !e.target.closest('button,input')) { const b = M.bookings.get(tr.dataset.id); if (b) openBooking(b); }
  });
  const setOp = (roomId, op, val) => save(() => Store.merge('ops', S.day, { date: S.day, rooms: { [roomId]: { [op]: val, by: Store.me?.id, at: Date.now() } } }));
  $('#opsTable').addEventListener('change', e => { const inp = e.target.closest('input[data-op]'); if (inp) setOp(inp.closest('[data-room]').dataset.room, inp.dataset.op, inp.value); });
  $('#opsTable').addEventListener('click', e => {
    const sm = e.target.closest('[data-sum], .ops-row > .roomtag');
    if (sm) { const rid = sm.closest('[data-room]').dataset.room, x = dailyRows(S.day).find(r => r.r.id === rid); if (x) openRoomSummary(x, S.day); return; }
    const mo = e.target.closest('[data-more]');
    if (mo) { const rid = mo.closest('[data-room]').dataset.room, x = dailyRows(S.day).find(r => r.r.id === rid); if (!x) return;
      const k = mo.dataset.more;
      const t = { roomId: rid, day: S.day };
      if (k === 'bf') openBfDetail(x.bfB || x.b, x.r.no); else if (k === 'clean') openCleanDetail(x.b, x.r.no); else if (k === 'laundry') openLaundryDetail(rid, x.b, S.day, !!x.o.laundry); else if (k === 'taxi') openTaxiDetail(x.b); else if (k === 'note') openNoteDetail(rid, x.b, S.day, x.o.note || '');
      return; }
    const b = e.target.closest('button[data-op]'); if (!b) return;
    const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(on)); setOp(b.closest('[data-room]').dataset.room, b.dataset.op, on); });
  $('#txList').addEventListener('change', e => { const s = e.target.closest('.tx-st'); if (s) setTxStatus(s.dataset.bid, s.dataset.tid, s.value); });
  $('#txList').addEventListener('click', async e => { if (e.target.closest('select')) return;
    const xb = e.target.closest('[data-xsnow]'); if (xb) { xb.disabled = true; xb.textContent = 'กำลังดึง…'; try { toast(xsMsg(await xsRun('manual'))); } catch (er) { toast(errMsg(er), 'err'); } render(); return; } const it = e.target.closest('.tx-item, .tx-soon-row'); if (it) { const b = M.bookings.get(it.dataset.id); if (b) openBooking(b); } });
  $('#copyTx').onclick = () => { const d = S.day, list = transfersOn(d); if (!list.length) return toast('ไม่มีรถรับส่งวันนี้');
    copyText(msgDoc(`รถรับส่ง · ${fmtLong(d)}`, `รวม ${list.length} เที่ยว`, list.map(({ b, t }, i) => msgItem(`${i + 1}) ${t.time || 'ยังไม่ระบุเวลา'} · ${TX_TYPES[t.type] || 'รถรับส่ง'}`, [
      `ห้อง ${roomNo(b.roomId)} · ${b.guest}${t.pax ? ` (${t.pax} คน)` : ''}`, `เส้นทาง: ${txLine(t)}`, t.flight && `เที่ยวบิน: ${t.flight}`,
      t.driver && `คนขับ: ${t.driver}`, (t.plate || t.phone) && [t.plate && `ทะเบียน ${t.plate}`, t.phone && `โทร ${t.phone}`].filter(Boolean).join(' · '), `สถานะ: ${TX_STATUS[t.status || 'need']}`, t.note && `หมายเหตุ: ${t.note}`])))); };
  $('#inHouseBtn').onclick = () => openInHouse(S.day);
  $('#copyBf').onclick = () => { const d = S.day, rows = dailyRows(d).filter(x => x.bf); if (!rows.length) return toast('ไม่มีอาหารเช้าวันนี้');
    copyText(msgDoc(`อาหารเช้า · ${fmtLong(d)}`, `รวม ${rows.reduce((s, x) => s + x.pax, 0)} ท่าน · ${rows.length} ห้อง`, rows.map(x => { const s = svcOf(x.bfB || x.b).bf || {};
      return msgItem(`ห้อง ${x.r.no} · ${x.pax} ท่าน`, [(x.bfB || x.b).guest, (s.diet || []).length && `อาหาร: ${s.diet.join(', ')}`, (s.allergy || []).length && `แพ้: ${s.allergy.join(', ')}`, s.note && `หมายเหตุ: ${s.note}`]); }))); };
  $('#copyLaundry').onclick = () => { const d = S.day, rows = dailyRows(d).filter(x => x.o.laundry); if (!rows.length) return toast('ไม่มีผ้าซักวันนี้');
    copyText(msgDoc(`ส่งผ้าซัก · ${fmtLong(d)}`, `รวม ${rows.length} ห้อง`, rows.map(x => { const l = x.o.linfo || {};
      return msgItem(`ห้อง ${x.r.no} · ${x.b.guest}`, [l.shop && `ร้าน: ${l.shop}${l.tel ? ` (${l.tel})` : ''}`, l.service && `บริการ: ${l.service}${l.urgent ? ' · ด่วน (ภายในวัน)' : ''}`, l.qty && `จำนวน: ${l.qty}`, l.back && `นัดรับคืน: ${fmtLong(l.back)}`, l.status && `สถานะ: ${SVC.lStatus[l.status]}`, l.note && `หมายเหตุ: ${l.note}`]); }))); };
  $('#copyTm30').onclick = () => {
    const d = S.day;
    const rows = allBookings().filter(b => isActive(b) && b.kind !== 'block' && b.checkIn === d).sort((a, b) => roomNo(a.roomId) < roomNo(b.roomId) ? -1 : 1)
      .map(b => { const g = b.guestId ? M.guests.get(b.guestId) : null; return { b, nat: g?.nationality || b.nationality || '', pass: g?.passport || b.passport || '' }; }).filter(x => !/^(thai|ไทย)$/i.test(x.nat.trim()));
    if (!rows.length) return toast('ไม่มีแขกต่างชาติเข้าพักวันนี้');
    const miss = rows.filter(x => !x.nat || !x.pass).length;
    copyText(msgDoc('แจ้งที่พักคนต่างด้าว (ตม.30)', `เข้าพัก ${fmtLong(d)} · ${rows.length} ราย`, rows.map((x, i) => msgItem(`${i + 1}. ${x.b.guest}`, [`สัญชาติ: ${x.nat || '— (ยังไม่ระบุ)'}`, `พาสปอร์ต: ${x.pass || '— (ยังไม่มี)'}`, `ห้อง ${roomNo(x.b.roomId)} · ${fmtShort(x.b.checkIn)} → ${fmtShort(x.b.checkOut)} (${nightsOf(x.b)} คืน)`])),
      miss ? `⚠ ยังขาดสัญชาติหรือเลขพาสปอร์ต ${miss} ราย · กรุณาเติมก่อนแจ้ง ตม.` : ''));
  };
}

/* ================= GUESTS ================= */
let _gs = null, _gsKey = '';
function guestStats() {
  const key = M.bookings.size + ':' + (Store._v || 0);
  if (_gs && _gsKey === key && !guestStats.dirty) return _gs;
  const t = todayStr(); _gs = new Map(); _gsKey = key; guestStats.dirty = false;
  for (const b of M.bookings.values()) {
    if (b.kind === 'block' || !b.guestId || !isActive(b)) continue;
    let s = _gs.get(b.guestId); if (!s) { s = { stays: 0, nights: 0, spent: 0, last: null, lastRoom: null, first: null, inhouse: false }; _gs.set(b.guestId, s); }
    s.stays++; s.nights += nightsOf(b); if (b.checkIn <= t) s.spent += totalOf(b);
    if (!s.last || b.checkIn > s.last) { s.last = b.checkIn; s.lastRoom = b.roomId; }
    if (!s.first || b.checkIn < s.first) s.first = b.checkIn;
    if (b.checkIn <= t && t < b.checkOut) s.inhouse = true;
  }
  return _gs;
}
Store.on(() => { guestStats.dirty = true; });
const normName = s => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
function findGuest(name, phone) {
  const n = normName(name); if (!n) return null;
  for (const g of M.guests.values()) { if (normName(g.name) !== n) continue; if (phone && g.phone && g.phone.replace(/\D/g, '') !== phone.replace(/\D/g, '')) continue; return g; }
  return null;
}
const unlinkedBookings = () => allBookings().filter(b => b.kind !== 'block' && b.guest && !GENERIC_NAME.test(b.guest.trim()) && b.guest.trim().length > 1 && (!b.guestId || !M.guests.has(b.guestId)));
function pager(cur, pages) {
  if (pages <= 1) return '';
  const nums = [...new Set([1, cur - 2, cur - 1, cur, cur + 1, cur + 2, pages].filter(x => x >= 1 && x <= pages))].sort((x, y) => x - y);
  let h = '', last = 0; for (const x of nums) { if (x - last > 1) h += '<span class="pg-gap">…</span>'; h += `<button type="button" data-pg="${x}" aria-current="${x === cur}">${x}</button>`; last = x; }
  return `<div class="pager"><button type="button" data-pg="${cur - 1}"${cur <= 1 ? ' disabled' : ''}>${icon('left')} ก่อนหน้า</button>${h}<button type="button" data-pg="${cur + 1}"${cur >= pages ? ' disabled' : ''}>ถัดไป ${icon('right')}</button></div>`;
}
function renderGuests() {
  const q = $('#gq').value.trim().toLowerCase(), tag = $('#gTag').value, sort = $('#gSort').value, gs = guestStats();
  let list = [...M.guests.values()].map(g => ({ g, s: gs.get(g.id) || { stays: 0, nights: 0, spent: 0 } }));
  $('#gCount').textContent = M.guests.size ? `แขกทั้งหมด ${money(M.guests.size)} คน · พักอยู่ตอนนี้ ${list.filter(x => x.s.inhouse).length} คน` : 'แขกจะถูกเพิ่มอัตโนมัติทุกครั้งที่บันทึกการจอง';
  if (q) list = list.filter(({ g }) => [g.name, g.phone, g.email, g.passport, g.nationality].some(x => x && String(x).toLowerCase().includes(q)));
  if (tag === 'inhouse') list = list.filter(x => x.s.inhouse); else if (tag === 'repeat') list = list.filter(x => x.s.stays > 1); else if (tag) list = list.filter(x => (x.g.tags || []).includes(tag));
  list.sort({ last: (a, b) => (b.s.last || '').localeCompare(a.s.last || ''), stays: (a, b) => b.s.stays - a.s.stays || (b.s.last || '').localeCompare(a.s.last || ''), spent: (a, b) => b.s.spent - a.s.spent, name: (a, b) => String(a.g.name).localeCompare(String(b.g.name)) }[sort]);
  const badNat = [...M.guests.values()].filter(g => g.nationality && normNat(g.nationality) !== g.nationality);
  const un = unlinkedBookings();
  $('#gBackfillBox').innerHTML = (badNat.length ? `<div class="notice">พบสัญชาติที่เขียนไม่ตรงมาตรฐาน ${money(badNat.length)} คน เช่น ${badNat.slice(0, 3).map(g => `“${esc(g.nationality)}” → ${esc(normNat(g.nationality))}`).join(', ')} <button class="btn sm" id="gFixNat">แก้ให้ถูกต้องทั้งหมด</button></div>` : '') + (un.length ? `<div class="notice">มีการจอง ${money(un.length)} รายการที่ยังไม่ได้ผูกกับโปรไฟล์แขก (เช่น ข้อมูลที่นำเข้าจาก Excel) <button class="btn sm" id="gBackfill">สร้างโปรไฟล์แขกจากการจองเหล่านี้</button></div>` : '');
  const box = $('#gResults');
  if (!list.length) { box.innerHTML = `<div class="empty">${M.guests.size ? 'ไม่พบแขกที่ตรงกับเงื่อนไข' : 'ยังไม่มีแขกในฐานข้อมูล'}</div>`; return; }
  const PER = 10, pages = Math.max(1, Math.ceil(list.length / PER)); S.gPage = Math.min(Math.max(1, S.gPage || 1), pages); const from = (S.gPage - 1) * PER;
  box.innerHTML = `<div class="hint" style="margin-bottom:6px">แสดง ${money(from + 1)}–${money(Math.min(list.length, from + PER))} จาก ${money(list.length)} คน</div><table><thead><tr><th>แขก</th><th>สัญชาติ</th><th class="r">มาพัก</th><th class="r">คืนรวม</th>${canStats() ? '<th class="r">ใช้จ่ายรวม</th>' : ''}<th>ครั้งล่าสุด</th></tr></thead><tbody>${list.slice(from, from + PER).map(({ g, s }) => `
    <tr class="click" data-gid="${esc(g.id)}"><td><div class="row" style="gap:10px;flex-wrap:nowrap">${avatar(g.name, 'avatar sm')}<div style="min-width:0"><b style="font-weight:600">${esc(g.name)}</b> ${s.inhouse ? '<span class="pill p-checked_in">พักอยู่</span>' : ''} ${validD(g.dob) && g.dob.slice(5, 7) === todayStr().slice(5, 7) ? `<span class="pill bday-soon">${icon('cake')} เกิดเดือนนี้</span>` : ''} ${(g.tags || []).map(t => `<span class="pill ${t === 'blacklist' ? 'p-bad' : 'p-vip'}">${esc(TAGS[t] || t)}</span>`).join(' ')}<div class="hint">${esc([g.phone, g.email, g.passport && 'PP ' + g.passport].filter(Boolean).join(' · '))}</div></div></div></td>
    <td>${esc(g.nationality || '—')}</td><td class="r num">${s.stays} ครั้ง</td><td class="r num">${money(s.nights)}</td>${canStats() ? `<td class="r num">${s.spent ? money(s.spent) : '—'}</td>` : ''}<td class="num">${s.last ? fmtD(s.last) + `<div class="hint">ห้อง ${esc(roomNo(s.lastRoom))}</div>` : '—'}</td></tr>`).join('')}</tbody></table>${pager(S.gPage, pages)}`;
}
function openGuest(id, prefill = {}) {
  const g = id ? M.guests.get(id) : null;
  if (id && !g) return toast('ไม่พบโปรไฟล์แขกนี้', 'err');
  const d = g ? { ...g } : { name: '', tags: [], ...prefill };
  const s = g ? (guestStats().get(g.id) || { stays: 0, nights: 0, spent: 0 }) : null;
  const hist = g ? allBookings().filter(b => b.guestId === g.id).sort((a, b) => a.checkIn < b.checkIn ? 1 : -1) : [];
  const m = openModal(`<div class="sheet"><div class="sheet-h">${g ? avatar(g.name) : ''}<h2>${g ? esc(g.name) : 'เพิ่มแขกใหม่'}</h2><div class="spacer"></div><button class="btn ghost" data-close>✕</button></div>
    <div class="sheet-b">
      ${s ? `<div class="sum"><div>มาพัก<b>${s.stays} ครั้ง</b></div><div>คืนรวม<b>${money(s.nights)}</b></div>${canStats() ? `<div>ใช้จ่ายรวม<b>${money(s.spent)}</b></div>` : ''}<div>มาครั้งแรก<b style="font-size:13px">${s.first ? fmtD(s.first) : '—'}</b></div><div>ครั้งล่าสุด<b style="font-size:13px">${s.last ? fmtD(s.last) : '—'}</b></div></div>` : ''}
      <fieldset><legend>ข้อมูลแขก</legend><div class="fields">
        <label class="f w2"><span>ชื่อ-นามสกุล *</span><input type="text" id="gName" value="${esc(d.name)}"></label>
        <label class="f"><span>โทรศัพท์ / WhatsApp</span><input type="tel" id="gPhone" value="${esc(d.phone || '')}"></label>
        <label class="f"><span>อีเมล</span><input type="email" id="gEmail" value="${esc(d.email || '')}"></label>
        <label class="f"><span>สัญชาติ</span><input type="text" id="gNat" list="natList" value="${esc(d.nationality || '')}"></label>
        <label class="f"><span>เลขพาสปอร์ต / บัตรประชาชน</span><input type="text" id="gPass" value="${esc(d.passport || '')}"></label>
        <label class="f"><span>วันเกิด</span><input type="date" id="gDob" value="${esc(d.dob || '')}"></label>
        <label class="f"><span>เพศ</span><select id="gSex">${['', 'ชาย', 'หญิง', 'อื่นๆ'].map(x => `<option${x === (d.sex || '') ? ' selected' : ''}>${x}</option>`).join('')}</select></label>
        <label class="f w2"><span>ที่อยู่</span><input type="text" id="gAddr" value="${esc(d.address || '')}"></label></div>
      <div class="tagrow">${Object.entries(TAGS).map(([k, v]) => `<label class="chk"><input type="checkbox" data-tag="${k}"${(d.tags || []).includes(k) ? ' checked' : ''}> ${v}</label>`).join('')}</div>
      <label class="f"><span>บันทึกเกี่ยวกับแขก (ความชอบ ข้อควรระวัง)</span><textarea id="gNotes" rows="3" placeholder="เช่น ชอบห้องใกล้สระ, แพ้ถั่ว">${esc(d.notes || '')}</textarea></label></fieldset>
      ${g ? `<div><h3 style="margin-bottom:8px">ประวัติการเข้าพัก</h3>${hist.length ? `<div class="tw"><table><thead><tr><th>ห้อง</th><th>เข้าพัก</th><th class="r">คืน</th><th>ช่องทาง</th><th>เลขที่จอง</th><th>สถานะ</th>${canFinance() ? '<th class="r">รวม</th>' : ''}<th></th></tr></thead><tbody>${hist.map(b => `<tr class="click" data-id="${esc(b.id)}"><td class="rn">${esc(roomNo(b.roomId))}</td><td class="num">${fmtD(b.checkIn)} → ${fmtD(b.checkOut)}</td><td class="r num">${nightsOf(b)}</td><td>${esc(b.channel || '—')}${compOf(b) ? ` <span class="pill p-comp" title="${esc(compLabel(compOf(b)))}">COMP</span>` : ''}</td><td class="num">${esc(b.ref || '—')}</td><td><span class="pill p-${b.status}">${STATUS[b.status] || ''}</span></td>${canFinance() ? `<td class="r num">${totalOf(b) ? money(totalOf(b)) : '—'}</td>` : ''}<td><button type="button" class="iconbtn" data-rsv="${esc(b.id)}" title="พิมพ์ใบจอง" style="width:30px;height:30px">${icon('print')}</button></td></tr>`).join('')}</tbody></table></div>` : '<div class="hint">ยังไม่มีประวัติการเข้าพัก</div>'}</div>` : ''}
      <datalist id="natList">${natOptions()}</datalist></div>
    <div class="sheet-f">${g ? '<button class="btn danger" id="gDel">ลบโปรไฟล์</button>' : ''}<div class="spacer"></div>${g ? `<button class="btn" id="gBook">${icon('plus')} จองให้แขกคนนี้</button>` : ''}<button class="btn primary" id="gSave">บันทึก</button></div></div>`);
  const el = m.el, v = x => el.querySelector('#' + x);
  el.addEventListener('click', e => { const rs = e.target.closest('[data-rsv]'); if (rs) { e.stopPropagation(); const b = M.bookings.get(rs.dataset.rsv); if (b) openReservation(b); return; } const tr = e.target.closest('tr[data-id]'); if (tr) { const b = M.bookings.get(tr.dataset.id); m.close(); if (b) openBooking(b); } });
  v('gSave').onclick = async () => {
    const name = v('gName').value.trim(); if (!name) { toast('กรุณาใส่ชื่อแขก', 'err'); v('gName').focus(); return; }
    const data = { ...(g || { createdAt: Date.now(), createdBy: Store.me?.id }), name, phone: v('gPhone').value.trim(), email: v('gEmail').value.trim(), nationality: normNat(v('gNat').value), passport: v('gPass').value.trim(), dob: v('gDob').value, sex: v('gSex').value, address: v('gAddr').value.trim(), notes: v('gNotes').value.trim(), tags: $$('[data-tag]', el).filter(x => x.checked).map(x => x.dataset.tag), updatedAt: Date.now(), updatedBy: Store.me?.id };
    const gid = g ? g.id : Store.newId(); const renamed = g && g.name !== name;
    const ok = await save(async () => { await Store.put('guests', gid, data); if (renamed && hist.length) await Store.putMany(hist.map(b => ({ col: 'bookings', id: b.id, data: { ...b, guest: name, id: undefined } }))); }, g ? 'บันทึกโปรไฟล์แขกแล้ว' : 'เพิ่มแขกแล้ว');
    if (ok) { logAct(`${g ? 'แก้ไข' : 'เพิ่ม'}โปรไฟล์แขก ${name}`); m.close(); }
  };
  if (v('gBook')) v('gBook').onclick = () => { m.close(); openBooking(null, { guestId: g.id, guest: g.name, phone: g.phone, email: g.email, nationality: g.nationality, checkIn: todayStr(), checkOut: addDays(todayStr(), 1) }); };
  if (v('gDel')) v('gDel').onclick = async () => {
    const btn = v('gDel'); if (!btn.dataset.ok) { btn.dataset.ok = 1; btn.textContent = 'กดอีกครั้งเพื่อลบ (ประวัติการจองยังอยู่)'; return; }
    if (await save(() => Store.del('guests', g.id), 'ลบโปรไฟล์แล้ว')) { logAct(`ลบโปรไฟล์แขก ${g.name}`); m.close(); }
  };
}
async function backfillGuests() {
  const un = unlinkedBookings(); const groups = new Map();
  for (const b of un) { const k = normName(b.guest); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(b); }
  const m = openModal(`<div class="sheet narrow"><div class="sheet-h"><h2>สร้างโปรไฟล์แขก</h2></div><div class="sheet-b"><div>จัดกลุ่มการจอง ${money(un.length)} รายการตามชื่อ ได้ ${money(groups.size)} คน ชื่อที่ตรงกับโปรไฟล์เดิมจะผูกเข้ากับโปรไฟล์นั้น</div><div class="progress"><div id="bfProg"></div></div><div class="hint" id="bfTxt">กำลังเตรียมข้อมูล…</div></div><div class="sheet-f"><div class="spacer"></div><button class="btn" data-close>ปิด</button></div></div>`);
  const rows = [];
  for (const list of groups.values()) {
    list.sort((a, b) => a.checkIn < b.checkIn ? 1 : -1);
    let gid = findGuest(list[0].guest)?.id;
    if (!gid) { gid = Store.newId(); const pick = k => (list.find(b => b[k]) || {})[k] || '';
      rows.push({ col: 'guests', id: gid, data: { name: list[0].guest.trim(), phone: pick('phone'), email: pick('email'), nationality: pick('nationality'), passport: pick('passport'), tags: list.length >= 3 ? ['regular'] : [], notes: '', src: 'backfill', createdAt: Date.now(), createdBy: Store.me?.id } }); }
    for (const b of list) { const data = { ...b, guestId: gid }; delete data.id; delete data._by; delete data._at; rows.push({ col: 'bookings', id: b.id, data }); }
  }
  try {
    await Store.putMany(rows, (done, total) => { const p = $('#bfProg', m.el); if (p) { p.style.width = (done / total * 100) + '%'; $('#bfTxt', m.el).textContent = `บันทึกแล้ว ${done} / ${total}`; } });
    logAct(`สร้างโปรไฟล์แขกจากการจองเดิม ${groups.size} คน`);
    const t = $('#bfTxt', m.el); if (t) t.textContent = `เสร็จแล้ว · ${groups.size} คน`;
  } catch (e) { const t = $('#bfTxt', m.el); if (t) t.textContent = errMsg(e) + ' · กดสร้างอีกครั้งเพื่อทำต่อได้'; }
}

/* ================= BIRTHDAYS ================= */
const isLeap = y => y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
function birthdayIn(dob, year) { const m = +dob.slice(5, 7), d = +dob.slice(8, 10); return `${year}-${pad(m)}-${pad(m === 2 && d === 29 && !isLeap(year) ? 28 : d)}`; }
function stayOn(gid, d) { return allBookings().find(b => b.guestId === gid && isActive(b) && b.kind !== 'block' && b.checkIn <= d && d <= b.checkOut); }
function bdayInfo(g, date) { const y = +String(g.dob).slice(0, 4); return { g, date, age: y > 1900 ? +date.slice(0, 4) - y : null, stay: stayOn(g.id, date), inDays: diffDays(todayStr(), date) }; }
// guests who will be at the resort on their birthday in the next few days
function upcomingBirthdays(days = 3) {
  const t = todayStr(), end = addDays(t, days), out = [];
  for (const g of M.guests.values()) {
    if (!validD(g.dob)) continue;
    let d = birthdayIn(g.dob, +t.slice(0, 4)); if (d < t) d = birthdayIn(g.dob, +t.slice(0, 4) + 1);
    if (d > end) continue;
    const x = bdayInfo(g, d); if (x.stay) out.push(x);
  }
  return out.sort((a, b) => a.inDays - b.inDays);
}
function birthdaysInMonth(ym) {
  const y = +ym.slice(0, 4), out = [];
  for (const g of M.guests.values()) if (validD(g.dob) && g.dob.slice(5, 7) === ym.slice(5, 7)) out.push(bdayInfo(g, birthdayIn(g.dob, y)));
  return out.sort((a, b) => a.date.localeCompare(b.date));
}
const whenLabel = n => n === 0 ? 'วันนี้' : n === 1 ? 'พรุ่งนี้' : `อีก ${n} วัน`;
function bdayRow(x, showStayHint) {
  return `<button class="bday-row${x.stay ? ' here' : ''}" data-bg="${esc(x.g.id)}">
    <span class="bday-date"><b>${parseD(x.date).getUTCDate()}</b><small>${MON[parseD(x.date).getUTCMonth()]}</small></span>
    <span class="bday-who"><b>${esc(x.g.name)}</b><small>${[DOW_FULL[parseD(x.date).getUTCDay()], x.age ? `ครบ ${x.age} ปี` : '', x.g.nationality ? esc(x.g.nationality) : ''].filter(Boolean).join(' · ')}</small></span>
    ${x.stay ? `<span class="pill p-checked_in">พักห้อง ${esc(roomNo(x.stay.roomId))}</span>` : (showStayHint ? '<span class="hint">ไม่ได้พักช่วงนี้</span>' : '')}
    ${x.stay && x.inDays >= 0 && x.inDays <= 3 ? `<span class="pill bday-soon">${whenLabel(x.inDays)} · เตรียมเค้ก</span>` : ''}</button>`;
}
function renderServices() {
  const el = $('#dSvc'); if (!el) return;
  const t = todayStr(), bf = dailyRows(t).filter(x => x.bf), tx = transfersOn(t), ih = inHouseData(t);
  const rate = ratesFor(t.slice(0, 7)).data, dbl = rate && rate.cats && rate.cats.double ? +rate.cats.double.night || 0 : 0;
  const up = upcomingBirthdays().length, xb = eqOnNight('xbed', t), cb = eqOnNight('cot', t);
  const tile = (q, ic, label, val, sub, cls = '') => `<button data-q="${q}" class="${cls}"><span class="qi">${icon(ic)}</span><span class="sv-l">${label}</span><b class="sv-v">${val}</b><small>${sub}</small></button>`;
  el.innerHTML = [
    tile('daily', 'coffee', 'อาหารเช้าเช้านี้', bf.reduce((s, x) => s + x.pax, 0) + ' <i class="u">ท่าน</i>', bf.length + ' ห้อง'),
    tile('taxi', 'car', 'รถรับส่งวันนี้', tx.length + ' <i class="u">เที่ยว</i>', tx.length ? `${tx.filter(x => x.t.status === 'need').length} ยังไม่ได้จองรถ` : 'ไม่มี', tx.some(x => x.t.status === 'need') ? 'warn' : ''),
    tile('equip', 'bed', 'เตียงเสริม / เปล', `${xb} <i class="u">/</i> ${cb}`, `จาก ${EQ.xbed.stock()} / ${EQ.cot.stock()} ตัว`),
    tile('inhouse', 'print', 'In House Report', ih.inHouse + ' <i class="u">ห้อง</i>', ih.pax + ' ท่าน'),
    tile('rates', 'tag', 'ราคาเดือนนี้', dbl ? money(dbl) : '—', dbl ? 'Double ต่อคืน' : 'ยังไม่ได้ตั้งราคา'),
    `<button data-q="bday" id="bdayBtn" class="qbday"><span class="qi">${icon('cake')}</span><span class="sv-l">วันเกิดแขก</span><b class="sv-v">${up} <i class="u">คน</i></b><small>ใน 3 วันข้างหน้า</small><em id="bdayBadge" hidden></em></button>`,
  ].join('');
  renderBirthdayBadge();
}
function renderBirthdayBadge() { const b = $('#bdayBadge'); if (!b) return; const n = upcomingBirthdays().length; b.hidden = !n; b.textContent = n; $('#bdayBtn').classList.toggle('has', !!n); }
function renderEquipCard() {
  const el = $('#dEquip'); if (!el) return;
  const t = todayStr(), wk = addDays(t, 7);
  const box = Object.entries(EQ).map(([k, q]) => { const n = eqOnNight(k, t), s = q.stock();
    return `<div class="eq-mini${n > s ? ' over' : ''}"><span>${q.label}คืนนี้</span><b>${n} <small>/ ${s}</small></b><div class="meter"><i style="width:${s ? Math.min(100, n / s * 100) : 0}%"></i></div></div>`; }).join('');
  const soon = allBookings().filter(b => isActive(b) && (xbedOf(b) || cotOf(b)) && b.checkIn >= t && b.checkIn <= wk).sort((a, b) => a.checkIn < b.checkIn ? -1 : 1);
  el.innerHTML = `<div class="eq-minis">${box}</div>` + (soon.length
    ? `<div class="hint" style="margin:10px 0 4px">เตรียมให้แขกที่จะเข้าใน 7 วัน</div>${soon.slice(0, 6).map(b => `<div class="eq-soon" data-open="${esc(b.id)}"><b>${esc(fmtShort(b.checkIn))}</b><span>ห้อง ${esc(roomNo(b.roomId))} · ${esc(b.guest)}</span><em>${[xbedOf(b) ? 'เตียงเสริม ' + xbedOf(b) : '', cotOf(b) ? 'เปล ' + cotOf(b) : ''].filter(Boolean).join(' · ')}</em></div>`).join('')}`
    : '<div class="hint" style="margin-top:10px">ไม่มีแขกที่ขอเตียงเสริมหรือเปลเด็กเข้าใน 7 วันนี้</div>');
}
document.addEventListener('click', e => { const r = e.target.closest('[data-open]'); if (r && r.closest('#dEquip')) { const b = M.bookings.get(r.dataset.open); if (b) openBooking(b); } });
function renderBirthdayCard() {
  const up = upcomingBirthdays(), month = birthdaysInMonth(todayStr().slice(0, 7));
  $('#dBday').innerHTML = (up.length ? `<div class="bday-list">${up.map(x => bdayRow(x)).join('')}</div>` : '<div class="hint">ไม่มีแขกที่จะพักอยู่ตรงกับวันเกิดใน 3 วันข้างหน้า</div>')
    + `<div class="hint" style="margin-top:8px">เดือนนี้มีแขกในฐานข้อมูลเกิด ${month.length} คน · ${month.filter(x => x.stay).length} คนพักอยู่ตรงวันเกิด</div>`;
}
document.addEventListener('click', e => { const r = e.target.closest('[data-bg]'); if (r) { closePop(); document.querySelectorAll('.overlay.bday-modal').forEach(o => o.remove()); openGuest(r.dataset.bg); } });
function openBirthdayPop(anchor) {
  closePop();
  const up = upcomingBirthdays();
  const el = document.createElement('div'); el.className = 'pop bday-pop';
  el.innerHTML = `<div class="pop-h">${icon('cake')}<div class="pop-t">วันเกิดใน 3 วันข้างหน้า</div></div>
    ${up.length ? `<div class="bday-list">${up.map(x => bdayRow(x)).join('')}</div>` : '<div class="hint">ไม่มีแขกที่พักอยู่ตรงกับวันเกิดในอีก 3 วัน</div>'}
    <button class="btn sm" id="bpAll">ดูวันเกิดทั้งเดือน</button>`;
  el.querySelector('#bpAll').onclick = () => { el.remove(); openBirthdays(todayStr().slice(0, 7)); };
  placePop(el, anchor);
}
function openBirthdays(ym) {
  let cur = ym, onlyHere = false;
  const m = openModal(`<div class="sheet narrow" style="width:min(620px,100%)"><div class="sheet-h">${icon('cake')}<h2>วันเกิดแขก</h2><div class="spacer"></div>
      <button class="iconbtn" id="bmPrev" style="width:32px;height:32px">${icon('left')}</button><b id="bmTitle" style="min-width:130px;text-align:center;font-family:var(--f-display)"></b><button class="iconbtn" id="bmNext" style="width:32px;height:32px">${icon('right')}</button>
      <button class="btn ghost" data-close>✕</button></div>
    <div class="sheet-b"><label class="chk"><input type="checkbox" id="bmHere"> แสดงเฉพาะแขกที่พักอยู่ตรงวันเกิด</label><div id="bmList"></div>
      <div class="hint">ใส่วันเกิดแขกได้ในหน้าการจอง หรือในโปรไฟล์แขก · กดที่ชื่อเพื่อเปิดโปรไฟล์</div></div></div>`);
  m.el.classList.add('bday-modal');
  const draw = () => {
    const d = parseD(cur + '-01'); $('#bmTitle', m.el).textContent = `${MON_FULL[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
    let list = birthdaysInMonth(cur); if (onlyHere) list = list.filter(x => x.stay);
    $('#bmList', m.el).innerHTML = list.length ? `<div class="bday-list">${list.map(x => bdayRow(x, true)).join('')}</div>` : `<div class="empty">${onlyHere ? 'ไม่มีแขกที่พักอยู่ตรงวันเกิดในเดือนนี้' : 'ยังไม่มีแขกที่บันทึกวันเกิดในเดือนนี้'}</div>`;
  };
  const shift = n => { const d = parseD(cur + '-01'); d.setUTCMonth(d.getUTCMonth() + n); cur = toStr(d).slice(0, 7); draw(); };
  $('#bmPrev', m.el).onclick = () => shift(-1); $('#bmNext', m.el).onclick = () => shift(1);
  $('#bmHere', m.el).onchange = e => { onlyHere = e.target.checked; draw(); };
  draw();
}

/* ================= REPORTS ================= */
function monthStats(y, mo) {
  const ms = `${y}-${pad(mo + 1)}-01`, me = toStr(new Date(Date.UTC(y, mo + 1, 1))), dim = diffDays(ms, me);
  let block = 0, sold = 0, rev = 0, comp = 0, compVal = 0, disc = 0; const chan = {};
  for (const b of M.bookings.values()) {
    if (!isActive(b) || b.checkOut <= ms || b.checkIn >= me) continue;
    const n = diffDays(b.checkIn < ms ? ms : b.checkIn, b.checkOut > me ? me : b.checkOut);
    if (b.kind === 'block') { block += n; continue; }
    sold += n; const rr = nightRate(b) * n - (nightsOf(b) ? discOf(b) * n / nightsOf(b) : 0); rev += rr; disc += nightsOf(b) ? discOf(b) * n / nightsOf(b) : 0;
    if (compOf(b)) { comp += n; compVal += compValue(b, ms, me).value; }
    const c = compOf(b) ? 'แขกรับรอง' : (b.channel || 'ไม่ระบุ'); chan[c] = chan[c] || { n: 0, nights: 0, rev: 0 }; chan[c].nights += n; chan[c].rev += rr; if (b.checkIn >= ms) chan[c].n++;
  }
  const avail = Math.max(0, activeRooms().length * dim - block);
  return { m: mo, avail, sold, rev, block, chan, comp, compVal, disc, occ: avail ? sold / avail : 0, adr: sold - comp ? rev / (sold - comp) : 0, revpar: avail ? rev / avail : 0 };
}
function barChart(vals, labels, fmt, max, hl) {
  const W = 560, H = 220, pl = 44, pb = 24, pt = 16, pr = 8, iw = W - pl - pr, ih = H - pt - pb; max = max || Math.max(1, ...vals);
  let g = ''; for (let i = 0; i <= 4; i++) { const v = max * i / 4, y = pt + ih - ih * i / 4; g += `<line x1="${pl}" x2="${W - pr}" y1="${y}" y2="${y}" stroke="var(--line-2)"/><text x="${pl - 6}" y="${y + 4}" text-anchor="end">${fmt(v, true)}</text>`; }
  const bw = iw / vals.length;
  vals.forEach((v, i) => { const h = ih * Math.min(1, v / max), x = pl + i * bw + bw * .18, y = pt + ih - h;
    g += `<rect x="${x}" y="${y}" width="${bw * .64}" height="${Math.max(0, h)}" rx="4" fill="${i === hl ? 'var(--accent)' : 'var(--accent-soft)'}"/>`;
    if (v > 0) g += `<text class="lbl" x="${x + bw * .32}" y="${y - 4}" text-anchor="middle">${fmt(v)}</text>`;
    g += `<text x="${x + bw * .32}" y="${H - 6}" text-anchor="middle">${labels[i]}</text>`; });
  return `<svg viewBox="0 0 ${W} ${H}" role="img">${g}</svg>`;
}
function renderReports() {
  const years = new Set([new Date().getFullYear()]); for (const b of M.bookings.values()) if (validD(b.checkIn)) years.add(+b.checkIn.slice(0, 4));
  const sel = $('#rYear'), cur = +sel.value || new Date().getFullYear();
  sel.innerHTML = [...years].sort((a, b) => b - a).map(y => `<option${y === cur ? ' selected' : ''}>${y}</option>`).join('');
  const y = +sel.value, stats = Array.from({ length: 12 }, (_, i) => monthStats(y, i));
  const tot = stats.reduce((a, s) => ({ avail: a.avail + s.avail, sold: a.sold + s.sold, rev: a.rev + s.rev, comp: a.comp + s.comp, compVal: a.compVal + s.compVal, disc: a.disc + s.disc }), { avail: 0, sold: 0, rev: 0, comp: 0, compVal: 0, disc: 0 });
  const nowM = new Date().getFullYear() === y ? new Date().getMonth() : -1;
  $('#rKpis').innerHTML = `<div class="stat"><span>อัตราเข้าพักทั้งปี</span><b>${tot.avail ? Math.round(tot.sold / tot.avail * 100) : 0}%</b><small>${money(tot.sold)} คืนที่ขายได้</small></div><div class="stat"><span>รายได้ค่าห้อง</span><b>฿${money(tot.rev)}</b><small>ทั้งปี ${y}${tot.disc ? ` · ให้ส่วนลดไป ฿${money(tot.disc)}` : ''}</small></div><div class="stat"><span>ราคาเฉลี่ยต่อคืน (ADR)</span><b>฿${money(tot.sold - tot.comp ? tot.rev / (tot.sold - tot.comp) : 0)}</b><small>ไม่นับแขกรับรอง</small></div><div class="stat"><span>รายได้ต่อห้องที่มี (RevPAR)</span><b>฿${money(tot.avail ? tot.rev / tot.avail : 0)}</b></div><div class="stat comp-stat" data-goto-comp><span>แขกรับรอง (มูลค่าห้องฟรี)</span><b>฿${money(tot.compVal)}</b><small>${money(tot.comp)} คืน · ทั้งปี ${y}</small></div>`;
  const cr = compRows(y); $('#rComp').innerHTML = cr.length ? compReportHtml(y, cr) : '<div class="empty">ยังไม่มีแขกรับรองในปีนี้</div>'; $('#rCompBtns').hidden = !cr.length;
  $('#chOcc').innerHTML = barChart(stats.map(s => s.occ * 100), MON, v => Math.round(v) + '%', 100, nowM);
  $('#chRev').innerHTML = barChart(stats.map(s => s.rev), MON, (v, t) => v >= 1000 ? (v / 1000).toFixed(v >= 100000 || t ? 0 : 1) + 'k' : Math.round(v), 0, nowM);
  $('#rMonths').innerHTML = `<table><thead><tr><th>เดือน</th><th class="r">ห้องคืนที่ขายได้</th><th class="r">ขายได้</th><th class="r">ปิดซ่อม</th><th class="r">อัตราเข้าพัก</th><th class="r">รายได้</th><th class="r">ADR</th><th class="r">RevPAR</th><th class="r">แขกรับรอง (คืน)</th><th class="r">มูลค่าห้องฟรี</th></tr></thead><tbody>${stats.map(s => `<tr><td>${MON_FULL[s.m]}</td><td class="r num">${money(s.avail)}</td><td class="r num">${money(s.sold)}</td><td class="r num">${s.block || '—'}</td><td class="r num">${Math.round(s.occ * 100)}%</td><td class="r num">${money(s.rev)}</td><td class="r num">${money(s.adr)}</td><td class="r num">${money(s.revpar)}</td><td class="r num">${s.comp || '—'}</td><td class="r num">${s.compVal ? money(s.compVal) : '—'}</td></tr>`).join('')}</tbody></table>`;
  const ch = {}; stats.forEach(s => Object.entries(s.chan).forEach(([k, v]) => { ch[k] = ch[k] || { n: 0, nights: 0, rev: 0 }; ch[k].n += v.n; ch[k].nights += v.nights; ch[k].rev += v.rev; }));
  const chs = Object.entries(ch).sort((a, b) => b[1].nights - a[1].nights), maxN = Math.max(1, ...chs.map(c => c[1].nights));
  $('#rChannels').innerHTML = chs.length ? `<table><thead><tr><th>ช่องทาง</th><th class="r">การจอง</th><th class="r">คืน</th><th class="r">รายได้</th><th style="width:30%"></th></tr></thead><tbody>${chs.map(([k, v]) => `<tr><td>${esc(k)}</td><td class="r num">${v.n}</td><td class="r num">${money(v.nights)}</td><td class="r num">${money(v.rev)}</td><td><div class="sharebar" style="width:${v.nights / maxN * 100}%"></div></td></tr>`).join('')}</tbody></table>` : '<div class="empty">ยังไม่มีการจองในปีนี้</div>';
  const owe = allBookings().filter(b => isActive(b) && b.kind !== 'block' && b.src !== 'excel' && balanceOf(b) > 0 && b.checkIn <= addDays(todayStr(), 30)).sort((a, b) => a.checkIn < b.checkIn ? -1 : 1);
  $('#rOwe').innerHTML = owe.length ? `<table><thead><tr><th>ห้อง</th><th>แขก</th><th>เข้าพัก</th><th class="r">คงค้าง</th></tr></thead><tbody>${owe.map(b => `<tr class="click" data-id="${esc(b.id)}"><td class="rn">${esc(roomNo(b.roomId))}</td><td>${esc(b.guest)}</td><td class="num">${fmtD(b.checkIn)}</td><td class="r num owe">${money(balanceOf(b))}</td></tr>`).join('')}</tbody></table>` : '<div class="empty">ไม่มียอดค้างชำระ</div>';
  const noRate = allBookings().filter(b => b.kind !== 'block' && b.src === 'excel' && !withFin(b).rate && String(b.checkIn).startsWith(String(y))).length;
  $('#rNote').textContent = noRate ? `หมายเหตุ: รายการที่นำเข้าจาก Excel ปีนี้ ${noRate} รายการไม่มีราคาในไฟล์เดิม จึงไม่ถูกนับในรายได้` : '';
}

/* ---- payments by booking platform (for the accountant) ---- */
function chRepData(y, mo, ch) {
  const pre = mo ? `${y}-${pad(mo)}` : String(y);
  const list = allBookings().filter(b => b.kind !== 'block' && isActive(b) && !compOf(b) && String(b.checkIn).startsWith(pre)).map(withFin)
    .filter(b => !ch || ((b.channel || '').trim() || 'ไม่ระบุช่องทาง') === ch);
  const map = new Map();
  for (const b of list) { const k = (b.channel || '').trim() || 'ไม่ระบุช่องทาง'; if (!map.has(k)) map.set(k, []); map.get(k).push(b); }
  const sum = l => l.reduce((s, b) => ({ n: s.n + 1, nights: s.nights + nightsOf(b), total: s.total + totalOf(b), fines: s.fines + finesOf(b), paid: s.paid + (+b.paid || 0), owe: s.owe + (b.src === 'excel' ? 0 : Math.max(0, balanceOf(b))) }), { n: 0, nights: 0, total: 0, fines: 0, paid: 0, owe: 0 });
  const groups = [...map].map(([k, l]) => ({ k, list: l.sort((p, q) => p.checkIn < q.checkIn ? -1 : 1), s: sum(l) })).sort((p, q) => q.s.total - p.s.total || q.s.n - p.s.n);
  return { groups, s: sum(list), noPrice: list.filter(b => !totalOf(b)).length };
}
function chRepHtml(y, mo, ch, forPrint) {
  const d = chRepData(y, mo, ch), per = (mo ? MON_FULL[mo - 1] + ' ' : '') + y;
  const tr = s => `<td class="r">${s.n}</td><td class="r">${money(s.nights)}</td><td class="r">${money(s.total)}</td><td class="r">${s.fines ? money(s.fines) : '—'}</td><td class="r">${money(s.paid)}</td><td class="r">${money(s.owe)}</td>`;
  return `<div class="ih chrep"><div class="ih-title">ยอดชำระแยกตามช่องทางการจอง · ${esc(per)}${ch ? ' · ' + esc(ch) : ''}<span>${esc(settings().hotelName || '')}</span></div>
    <table class="ih-t"><thead><tr><th>ช่องทาง</th><th class="r">การจอง</th><th class="r">คืน</th><th class="r">ยอดค่าห้อง (บาท)</th><th class="r">ค่าปรับ (บาท)</th><th class="r">รับชำระแล้ว (บาท)</th><th class="r">คงค้าง (บาท)</th></tr></thead><tbody>
      ${d.groups.map(g => `<tr><td>${esc(g.k)}</td>${tr(g.s)}</tr>`).join('')}<tr class="tot"><td>รวมทุกช่องทาง</td>${tr(d.s)}</tr></tbody></table>
    ${d.groups.map(g => `<h4 class="chrep-h">${esc(g.k)} <span>${g.s.n} การจอง · รับชำระ ฿${money(g.s.paid)}</span></h4>
      <table class="ih-t"><thead><tr><th>#</th><th>ชื่อแขก</th><th>เลขที่จอง</th><th>ห้อง</th><th>เข้า</th><th>ออก</th><th class="r">คืน</th><th class="r">ยอดค่าห้อง</th><th class="r">ค่าปรับ</th><th class="r">รับชำระแล้ว</th><th>วิธีชำระ</th><th>เลขอ้างอิง</th></tr></thead><tbody>
      ${g.list.map((b, i) => `<tr${forPrint ? '' : ` data-id="${esc(b.id)}"`}><td class="c">${i + 1}</td><td>${esc(b.guest)}</td><td>${esc(b.ref || '—')}</td><td class="c">${esc(roomNo(b.roomId))}</td><td>${fmtD(b.checkIn)}</td><td>${fmtD(b.checkOut)}</td><td class="r">${nightsOf(b)}</td><td class="r">${totalOf(b) ? money(totalOf(b)) : '—'}${discOf(b) ? `<div class="fine-note">ลด ${money(discOf(b))}${b.discNote ? ' · ' + esc(b.discNote) : ''}</div>` : ''}</td><td class="r">${finesOf(b) ? money(finesOf(b)) : '—'}${(b.fines || []).length ? `<div class="fine-note">${esc(b.fines.map(f => f.name).filter(Boolean).join(', '))}</div>` : ''}</td><td class="r">${money(+b.paid || 0)}${refundAmtOf(b) ? `<div class="fine-note">คืนมัดจำ ${money(refundAmtOf(b))}</div>` : ''}</td><td>${esc(b.payMethod || '')}</td><td>${esc(b.payRef || '')}</td></tr>`).join('')}
      <tr class="tot"><td></td><td colspan="5">รวม ${esc(g.k)}</td><td class="r">${money(g.s.nights)}</td><td class="r">${money(g.s.total)}</td><td class="r">${g.s.fines ? money(g.s.fines) : '—'}</td><td class="r">${money(g.s.paid)}</td><td colspan="2"></td></tr></tbody></table>`).join('') || '<p>ไม่มีการจองในช่วงนี้</p>'}
    <div class="chrep-note">นับตามวันเช็คอิน · ไม่รวมแขกรับรองและการจองที่ยกเลิก · คงค้างไม่นับรายการที่นำเข้าจาก Excel เดิม (ไม่มีข้อมูลการชำระ)${d.noPrice ? ` · มี ${d.noPrice} รายการที่ไม่มีราคาในระบบ (ส่วนใหญ่นำเข้าจาก Excel เดิม)` : ''} · พิมพ์เมื่อ ${esc(fmtTime(Date.now()))}</div></div>`;
}
function openChannelReport(y) {
  const years = [...new Set(allBookings().filter(b => validD(b.checkIn)).map(b => +b.checkIn.slice(0, 4)).concat(new Date().getFullYear()))].sort((p, q) => q - p);
  const chans = [...new Set(allBookings().filter(b => b.kind !== 'block' && !compOf(b)).map(b => (b.channel || '').trim() || 'ไม่ระบุช่องทาง'))].sort();
  const m = openModal(`<div class="sheet wide"><div class="sheet-h"><h2>ยอดชำระตามช่องทาง</h2><div class="spacer"></div>
      <select id="crY" class="inline">${years.map(x => `<option${x === y ? ' selected' : ''}>${x}</option>`).join('')}</select>
      <select id="crM" class="inline"><option value="0">ทั้งปี</option>${MON_FULL.map((x, i) => `<option value="${i + 1}">${x}</option>`).join('')}</select>
      <select id="crC" class="inline"><option value="">ทุกช่องทาง</option>${chans.map(c => `<option>${esc(c)}</option>`).join('')}</select>
      <button class="btn" id="crPdf">${icon('file')} PDF</button><button class="btn primary" id="crPrint">${icon('print')} พิมพ์</button><button class="btn ghost" data-close>✕</button></div>
    <div class="sheet-b"><div class="rsv-paper" id="crBody"></div></div></div>`);
  const $m = s => m.el.querySelector(s), args = () => [+$m('#crY').value, +$m('#crM').value, $m('#crC').value];
  const draw = () => { $m('#crBody').innerHTML = chRepHtml(...args(), false); };
  m.el.addEventListener('change', e => { if (e.target.matches('select')) draw(); });
  $m('#crBody').addEventListener('click', e => { const tr = e.target.closest('tr[data-id]'); if (tr) { const b = M.bookings.get(tr.dataset.id); if (b) openBooking(b); } });
  const fname = () => { const [yy, mm, cc] = args(); return `Payments_${cc || 'all'}_${yy}${mm ? '-' + pad(mm) : ''}`; };
  $m('#crPrint').onclick = () => printHtml(chRepHtml(...args(), true), true);
  $m('#crPdf').onclick = () => exportPdf(chRepHtml(...args(), true), fname(), true);
  draw();
}

/* ================= USERS (admin) ================= */
function renderUsers() {
  if (!isOwner()) return;
  const list = [...Store.staff.values()];
  $('#uTable').innerHTML = list.length ? `<table><thead><tr><th>ผู้ใช้</th><th>ชื่อผู้ใช้</th><th>สิทธิ์</th><th>สถานะ</th><th>สร้างเมื่อ</th><th></th></tr></thead><tbody>${list.map(s => `
    <tr><td><div class="row" style="gap:10px;flex-wrap:nowrap">${avatar(s.display_name || s.username, 'avatar sm')}<b style="font-weight:600">${esc(s.display_name || s.username)}</b>${s.id === Store.me?.id ? ' <span class="pill p-confirmed">คุณ</span>' : ''}</div></td>
    <td class="num">@${esc(s.username)}</td><td><span class="pill ${s.role === 'admin' ? 'p-vip' : s.role === 'manager' ? 'p-checked_in' : 'p-confirmed'}">${roleLabel(s.role)}</span></td>
    <td><span class="pill ${s.active ? 'p-checked_in' : 'p-bad'}">${s.active ? 'ใช้งาน' : 'ระงับ'}</span></td><td class="num">${fmtTime(s.created_at)}</td>
    <td class="r"><button class="btn sm" data-u="${esc(s.id)}" data-act="edit">แก้ไข</button> <button class="btn sm" data-u="${esc(s.id)}" data-act="pw">${icon('lock')} ตั้งรหัสใหม่</button></td></tr>`).join('')}</tbody></table>` : '<div class="empty">ยังไม่มีผู้ใช้</div>';
}
function openUser(id) {
  const s = id ? Store.staff.get(id) : null; const self = s && s.id === Store.me?.id;
  const m = openModal(`<div class="sheet narrow"><div class="sheet-h"><h2>${s ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้'}</h2><div class="spacer"></div><button class="btn ghost" data-close>✕</button></div>
    <div class="sheet-b">
      <label class="f"><span>ชื่อที่แสดง</span><input type="text" id="uName" value="${esc(s?.display_name || '')}" placeholder="เช่น พี่นก (ต้อนรับ)"></label>
      <label class="f"><span>ชื่อผู้ใช้สำหรับล็อกอิน (a-z, 0-9)</span><input type="text" id="uUser" value="${esc(s?.username || '')}"${s ? ' disabled' : ''} placeholder="เช่น nok"></label>
      ${s ? '' : '<label class="f"><span>รหัสผ่าน (อย่างน้อย 6 ตัว)</span><input type="text" id="uPass" autocomplete="off"></label>'}
      <label class="f"><span>สิทธิ์</span><select id="uRole"${self ? ' disabled' : ''}><option value="staff"${!s || s.role === 'staff' ? ' selected' : ''}>พนักงาน</option><option value="manager"${s?.role === 'manager' ? ' selected' : ''}>Admin</option><option value="admin"${s?.role === 'admin' ? ' selected' : ''}>ผู้ดูแล</option></select><span class="hint" id="uRoleHint"></span></label>
      ${s && !self ? `<label class="chk"><input type="checkbox" id="uActive"${s.active ? ' checked' : ''}> เปิดใช้งานบัญชีนี้ (ยกเลิกติ๊กเพื่อระงับการเข้าใช้)</label>` : ''}
      ${s ? '' : '<div class="hint">แจ้งชื่อผู้ใช้และรหัสผ่านให้พนักงาน เขาเปลี่ยนรหัสเองได้ภายหลังจากเมนูมุมขวาบน</div>'}
    </div>
    <div class="sheet-f">${s && !self ? '<button class="btn danger" id="uDel">ลบผู้ใช้</button>' : ''}<div class="spacer"></div><button class="btn" data-close>ยกเลิก</button><button class="btn primary" id="uSave">บันทึก</button></div></div>`);
  const v = x => m.el.querySelector('#' + x);
  const ROLE_HINT = { staff: 'จองห้อง ใส่ราคาและการชำระเงิน ตั้งราคาห้อง อัปโหลดเอกสาร เช็คอิน/เอาท์ แขก และงานประจำวัน · ไม่เห็นรายงานการเงินและสถิติรายได้', manager: 'ทำได้ทุกอย่างรวมถึงการเงิน ราคา ห้อง และนำเข้าข้อมูล · เข้าหน้าผู้ใช้งานและการเชื่อมต่อฐานข้อมูลไม่ได้', admin: 'ทำได้ทุกอย่าง รวมถึงจัดการผู้ใช้และการเชื่อมต่อฐานข้อมูล' };
  const showRoleHint = () => { v('uRoleHint').textContent = ROLE_HINT[v('uRole').value] || ''; };
  v('uRole').onchange = showRoleHint; showRoleHint();
  v('uSave').onclick = async () => {
    const display_name = v('uName').value.trim(), role = v('uRole').value;
    if (!display_name) return toast('กรอกชื่อที่แสดง', 'err');
    v('uSave').disabled = true;
    try {
      if (s) { const patch = { display_name }; if (!self) { patch.role = role; patch.active = v('uActive').checked; } await Store.updateStaff(s.id, patch); toast('บันทึกแล้ว'); logAct(`แก้ไขผู้ใช้ ${display_name}`); m.close(); }
      else {
        const username = v('uUser').value.trim().toLowerCase(), password = v('uPass').value;
        if (!/^[a-z0-9._-]{3,30}$/.test(username)) { v('uSave').disabled = false; return toast('ชื่อผู้ใช้ใช้ a-z, 0-9, จุด, ขีด ได้ 3–30 ตัว', 'err'); }
        if (password.length < 6) { v('uSave').disabled = false; return toast('รหัสผ่านต้องมีอย่างน้อย 6 ตัว', 'err'); }
        const r = await Store.createStaff({ username, display_name, password, role });
        toast(r.needsConfirm ? 'สร้างแล้ว แต่ต้องปิด “Confirm email” ใน Supabase ก่อน ผู้ใช้นี้จึงจะล็อกอินได้' : `เพิ่ม ${display_name} แล้ว`, r.needsConfirm ? 'err' : null);
        logAct(`เพิ่มผู้ใช้ ${display_name} (@${username})`); m.close();
      }
    } catch (e) { v('uSave').disabled = false; toast(e.code === 'user_exists' || /already registered/i.test(e.message) ? 'ชื่อผู้ใช้นี้ถูกใช้แล้ว' : /rate limit/i.test(e.message) ? 'สร้างผู้ใช้ถี่เกินไป รอสักครู่แล้วลองใหม่' : errMsg(e), 'err'); }
  };
  if (v('uDel')) v('uDel').onclick = async () => {
    const b = v('uDel'); if (!b.dataset.ok) { b.dataset.ok = 1; b.textContent = 'กดอีกครั้งเพื่อลบถาวร'; return; }
    try { await Store.deleteStaff(s.id); toast('ลบผู้ใช้แล้ว'); logAct(`ลบผู้ใช้ ${s.display_name}`); m.close(); } catch (e) { toast(errMsg(e), 'err'); }
  };
}
function openResetPw(id) {
  const s = Store.staff.get(id); if (!s) return;
  const m = openModal(`<div class="sheet narrow"><div class="sheet-h"><h2>ตั้งรหัสผ่านใหม่</h2><div class="spacer"></div><button class="btn ghost" data-close>✕</button></div>
    <div class="sheet-b"><div>สำหรับ <b>${esc(s.display_name)}</b> (@${esc(s.username)})</div><label class="f"><span>รหัสผ่านใหม่ (อย่างน้อย 6 ตัว)</span><input type="text" id="rp1" autocomplete="off"></label></div>
    <div class="sheet-f"><div class="spacer"></div><button class="btn" data-close>ยกเลิก</button><button class="btn primary" id="rpGo">ตั้งรหัสผ่าน</button></div></div>`);
  $('#rpGo', m.el).onclick = async () => {
    const p = $('#rp1', m.el).value; if (p.length < 6) return toast('รหัสผ่านต้องมีอย่างน้อย 6 ตัว', 'err');
    try { await Store.setPassword(id, p); toast(`ตั้งรหัสผ่านใหม่ให้ ${s.display_name} แล้ว`); logAct(`ตั้งรหัสผ่านใหม่ให้ ${s.display_name}`); m.close(); } catch (e) { toast(errMsg(e), 'err'); }
  };
}

/* ================= SETTINGS ================= */
function renderSettings() {
  renderXsCard(); renderNotifCard();
  const s = settings(), lock = !isAdmin();
  if (!$('#generalCard').contains(document.activeElement)) { $('#sName').value = s.hotelName || ''; $('#sAddr').value = s.hotelAddress || ''; $('#sPhone').value = s.hotelPhone || ''; $('#sEmail').value = s.hotelEmail || ''; $('#sElec').value = s.elecRate ?? 8; $('#sTimes').value = s.times || ''; $('#sXbed').value = s.extraBedStock ?? 6; $('#sCot').value = s.babyCotStock ?? 3; $('#sChannels').value = (s.channels || []).join('\n'); }
  ['sName', 'sAddr', 'sPhone', 'sEmail', 'sElec', 'sTimes', 'sXbed', 'sCot', 'sChannels', 'sSave', 'addRoom'].forEach(id => $('#' + id).disabled = lock);
  $('#adminHint').textContent = '';
  if (!$('#chanColorCard').contains(document.activeElement)) {
    const names = [...new Set(['Booking.com', 'Expedia', 'Direct', 'Hotelbeds', 'Agoda', 'Biblio Globus', 'Trip.com', ...(s.channels || [])])];
    $('#chanColors').innerHTML = names.map(n => `<label class="cc"><input type="color" data-cc="${esc(n)}" value="${chanColor(n) || '#9AA5AD'}"${lock ? ' disabled' : ''}><span>${esc(n)}</span></label>`).join('');
    $('#ccSave').hidden = $('#ccReset').hidden = lock;
  }
  $('#connUrl').textContent = Store.conn?.url || '';
  if (window.BV_DEMO_RESET && isOwner() && !$('#demoReset')) { $('#demoResetBox').innerHTML = '<div class="notice">เวอร์ชันทดลอง: การแก้ไขเก็บในเบราว์เซอร์นี้ <button class="btn sm" id="demoReset">กลับเป็นข้อมูลจาก Excel</button></div>'; $('#demoReset').onclick = e => { const b = e.currentTarget; if (!b.dataset.ok) { b.dataset.ok = 1; b.textContent = 'กดอีกครั้งเพื่อยืนยัน'; return; } window.BV_DEMO_RESET(); }; }
  const rooms = roomsList();
  $('#roomCount').textContent = `${rooms.filter(r => r.active !== false).length} ห้องที่เปิดใช้`;
  if (!$('#roomsTable').contains(document.activeElement)) $('#roomsTable').innerHTML = rooms.length ? `<table class="room-edit"><thead><tr><th>เลขห้อง</th><th>ประเภท</th><th>เตียง</th><th>ลำดับ</th><th>เปิดใช้</th><th>หมายเหตุ</th><th></th></tr></thead><tbody>${rooms.map(r => `<tr data-room="${esc(r.id)}">
    <td><input type="text" data-k="no" value="${esc(r.no)}" style="width:70px"${lock ? ' disabled' : ''}></td>
    <td><select data-k="type"${lock ? ' disabled' : ''}><option value="single"${r.type !== 'family' ? ' selected' : ''}>ห้องเดี่ยว</option><option value="family"${r.type === 'family' ? ' selected' : ''}>Family 2 ห้องนอน</option></select></td>
    <td><select data-k="bed"${lock ? ' disabled' : ''}>${['', 'Double', 'Twin', 'King', 'Double + Twin'].map(x => `<option${x === (r.bed || '') ? ' selected' : ''}>${x}</option>`).join('')}</select></td>
    <td><input type="number" data-k="sort" value="${+r.sort || 0}" style="width:76px"${lock ? ' disabled' : ''}></td><td><input type="checkbox" data-k="active"${r.active !== false ? ' checked' : ''}${lock ? ' disabled' : ''}></td>
    <td><input type="text" data-k="note" value="${esc(r.note || '')}"${lock ? ' disabled' : ''}></td><td class="hint" data-st></td></tr>`).join('')}</tbody></table>` : '<div class="empty">กำลังโหลด…</div>';
  const logs = [...M.log.values()].sort((a, b) => (b.at || 0) - (a.at || 0)).slice(0, 80);
  $('#logTable').innerHTML = logs.length ? `<table><thead><tr><th>เวลา</th><th>ผู้แก้ไข</th><th>รายการ</th></tr></thead><tbody>${logs.map(l => `<tr><td class="num" style="white-space:nowrap">${fmtTime(l.at)}</td><td style="white-space:nowrap">${esc(nameOf(l.by))}</td><td>${esc(l.text)}</td></tr>`).join('')}</tbody></table>` : '<div class="empty">ยังไม่มีการแก้ไข</div>';
}
function bindSettings() {
  $('#ccSave').onclick = async () => { const cc = {}; $$('#chanColors [data-cc]').forEach(i => { cc[i.dataset.cc] = i.value.toUpperCase(); });
    if (await save(() => Store.merge('settings', 'main', { chanColors: cc }), 'บันทึกสีแล้ว')) { logAct('แก้สีของช่องทางการจอง'); render(); } };
  $('#ccReset').onclick = async () => { if (await save(() => Store.put('settings', 'main', { ...(M.settings.get('main') || {}), chanColors: {} }), 'ใช้สีเริ่มต้นแล้ว')) render(); };
  $('#sSave').onclick = async () => {
    const data = { hotelName: $('#sName').value.trim() || DEFAULT_SETTINGS.hotelName, hotelAddress: $('#sAddr').value.trim(), hotelPhone: $('#sPhone').value.trim(), hotelEmail: $('#sEmail').value.trim(), elecRate: +$('#sElec').value || 0, times: $('#sTimes').value.trim(), extraBedStock: Math.max(0, +$('#sXbed').value || 0), babyCotStock: Math.max(0, +$('#sCot').value || 0), channels: $('#sChannels').value.split('\n').map(x => x.trim()).filter(Boolean) };
    if (await save(() => Store.merge('settings', 'main', data), 'บันทึกข้อมูลทั่วไปแล้ว')) logAct('แก้ไขข้อมูลทั่วไปของโรงแรม');
  };
  $('#roomsTable').addEventListener('change', async e => {
    const inp = e.target.closest('[data-k]'); if (!inp) return;
    const tr = inp.closest('tr'), id = tr.dataset.room, r = roomById(id); if (!r) return;
    const k = inp.dataset.k; let v = inp.type === 'checkbox' ? inp.checked : inp.value;
    if (k === 'sort') v = +v || 0; if (k === 'no') { v = String(v).trim(); if (/^\d$/.test(v)) v = '0' + v; if (!v) return; }
    const data = { ...r, [k]: v };
    if (await save(() => Store.put('rooms', id, data))) { tr.querySelector('[data-st]').textContent = 'บันทึกแล้ว'; logAct(`แก้ไขข้อมูลห้อง ${data.no}`); }
  });
  $('#addRoom').onclick = async () => {
    const nos = roomsList().map(r => +r.no).filter(n => !isNaN(n)); const no = pad((nos.length ? Math.max(...nos) : 0) + 1);
    const id = 'r' + no + (M.rooms.has('r' + no) ? '-' + Date.now().toString(36) : '');
    if (await save(() => Store.put('rooms', id, { no, type: 'single', bed: 'Double', sort: Math.max(0, ...roomsList().map(r => +r.sort || 0)) + 1, active: true, note: '' }), `เพิ่มห้อง ${no} แล้ว`)) logAct(`เพิ่มห้อง ${no}`);
  };
  $('#connCopy').onclick = () => { const c = Store.conn; copyText('BV1:' + btoa(unescape(encodeURIComponent(JSON.stringify({ u: c.url, k: c.key }))))); };
  $('#connChange').onclick = async () => { const b = $('#connChange'); if (!b.dataset.ok) { b.dataset.ok = 1; b.textContent = 'กดอีกครั้งเพื่อออกจากระบบและตั้งค่าใหม่'; return; } await Store.signOut().catch(() => {}); Store.clearConn(); location.reload(); };
  $('#eFrom').value = `${new Date().getFullYear()}-01-01`; $('#eTo').value = `${new Date().getFullYear()}-12-31`;
  const q = v => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  $('#eGo').onclick = () => {
    const f = $('#eFrom').value || '0000', t = $('#eTo').value || '9999';
    const list = allBookings().filter(b => b.checkIn <= t && b.checkOut >= f).sort((a, b) => a.checkIn < b.checkIn ? -1 : 1);
    const head = ['ห้อง', 'ประเภทรายการ', 'แขก', 'โทร', 'อีเมล', 'สัญชาติ', 'พาสปอร์ต', 'ผู้ใหญ่', 'เด็ก', 'เช็คอิน', 'เช็คเอาท์', 'คืน', 'สถานะ', 'ช่องทาง', 'เลขที่จอง', 'คิดราคา', 'ราคา', 'ค่าห้อง', 'ค่าไฟ', 'อื่นๆ', 'รวม', 'มัดจำ', 'ชำระแล้ว', 'คงค้าง', 'อาหารเช้า', 'หมายเหตุ'];
    const rows = list.map(b0 => withFin(b0)).map(b => [roomNo(b.roomId), b.kind === 'block' ? 'ปิดห้อง' : 'จอง', b.kind === 'block' ? b.reason : b.guest, b.phone, b.email, b.nationality, b.passport, b.adults, b.children, b.checkIn, b.checkOut, nightsOf(b), b.kind === 'block' ? '' : STATUS[b.status], b.channel, b.ref, b.rateType === 'month' ? 'รายเดือน' : 'ต่อคืน', b.rate, Math.round(roomCharge(b)), Math.round(elecCharge(b)), b.extras, totalOf(b), b.deposit, b.paid, b.kind === 'block' ? '' : balanceOf(b), b.breakfast ? 'BF' : '', b.notes].map(q).join(','));
    downloadFile(`bookings_${f}_${t}.csv`, '﻿' + [head.join(','), ...rows].join('\r\n'));
  };
  $('#eGuests').onclick = () => {
    const gs = guestStats(); const head = ['ชื่อ', 'โทร', 'อีเมล', 'สัญชาติ', 'พาสปอร์ต', 'วันเกิด', 'ป้าย', 'มาพัก (ครั้ง)', 'คืนรวม', 'ใช้จ่ายรวม', 'ครั้งล่าสุด', 'บันทึก'];
    const rows = [...M.guests.values()].map(g => { const s = gs.get(g.id) || {}; return [g.name, g.phone, g.email, g.nationality, g.passport, g.dob, (g.tags || []).map(t => TAGS[t]).join(' '), s.stays || 0, s.nights || 0, Math.round(s.spent || 0), s.last || '', g.notes].map(q).join(','); });
    downloadFile(`guests_${todayStr()}.csv`, '﻿' + [head.join(','), ...rows].join('\r\n'));
  };
  $('#xFile').onchange = e => importExcel(e.target.files[0]);
  bindXsCard(); bindNotifCard();
}
async function importExcel(file) {
  if (!file) return;
  const pv = $('#xPreview'); pv.innerHTML = '<div class="hint">กำลังอ่านไฟล์…</div>';
  try {
    const wb = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: false, cellStyles: true });
    const res = XP.extract(XLSX, wb);
    const byNo = new Map(roomsList().map(r => [r.no, r.id]));
    const known = res.items.filter(i => byNo.has(i.roomNo)), unknown = new Set(res.items.filter(i => !byNo.has(i.roomNo)).map(i => i.roomNo));
    const t = todayStr();
    pv.innerHTML = `<table><thead><tr><th>ชีต</th><th>ช่วงวันที่ที่อ่านได้</th><th class="r">รายการ</th></tr></thead><tbody>${res.sheets.map(s => `<tr><td>${esc(s.name)}</td><td class="num">${s.ok ? (s.first ? fmtD(s.first) + ' → ' + fmtD(s.last) : '—') : '<span class="owe">อ่านเดือนไม่ได้</span>'}</td><td class="r num">${s.count ?? 0}</td></tr>`).join('')}</tbody></table>
      ${unknown.size ? `<div class="notice">ข้ามห้องที่ยังไม่มีในระบบ: ${[...unknown].map(esc).join(', ')}</div>` : ''}
      <label class="f"><span>นำเข้าเฉพาะการจองที่เช็คเอาท์ตั้งแต่วันที่</span><input type="date" id="xFrom" value="${addDays(t, -730)}"></label>
      <div class="hint" id="xCount"></div><div class="row"><button class="btn primary" id="xGo">นำเข้า</button><button class="btn" id="xColors" title="ไม่เปลี่ยนวันที่ ชื่อ หรือสถานะ">${icon('refresh')} อัปเดตเฉพาะสีจาก Excel</button></div><div class="progress" hidden id="xProg"><div></div></div>`;
    labelDates(pv);
    const sel = () => { const f = $('#xFrom').value || '0000'; return known.filter(i => i.checkOut >= f); };
    const upd = () => { const s = sel(); $('#xCount').textContent = `จะนำเข้า ${s.filter(i => i.kind === 'booking').length} การจอง และ ${s.filter(i => i.kind === 'block').length} รายการปิดห้อง (นำเข้าซ้ำจะเขียนทับรายการเดิม ไม่เกิดรายการซ้ำ)`; };
    $('#xFrom').onchange = upd; upd();
    $('#xColors').onclick = async () => {
      const seen = new Set(), rows = [];
      for (const it of known) {
        let id = `x${it.roomNo}_${it.checkIn}${it.kind === 'block' ? 'b' : ''}`; while (seen.has(id)) id += '_'; seen.add(id);
        const old = M.bookings.get(id); if (!old || it.kind !== 'booking' || !it.color) continue;
        const ch = old.channel || XCOLOR_CHAN[it.color] || '';
        if (old.xcolor === it.color && (old.channel || '') === ch) continue;
        rows.push({ col: 'bookings', id, data: { ...old, xcolor: it.color, channel: ch } });
      }
      if (!rows.length) return toast('สีในแอปตรงกับ Excel อยู่แล้ว');
      $('#xColors').disabled = true; $('#xProg').hidden = false;
      try { await Store.putMany(rows, (d, n) => { $('#xProg div').style.width = (d / n * 100) + '%'; }); logAct(`อัปเดตสีการจองจาก Excel ${rows.length} รายการ`); toast(`อัปเดตสีแล้ว ${rows.length} การจอง`); }
      catch (e) { toast(errMsg(e), 'err'); }
      $('#xColors').disabled = false;
    };
    $('#xGo').onclick = async () => {
      const list = sel(); if (!list.length) return;
      $('#xGo').disabled = true; $('#xProg').hidden = false; const now = Date.now();
      const seen = new Set();
      const rows = list.map(it => {
        let id = `x${it.roomNo}_${it.checkIn}${it.kind === 'block' ? 'b' : ''}`; while (seen.has(id)) id += '_'; seen.add(id);
        const status = it.checkOut <= t ? 'checked_out' : (it.checkIn < t ? 'checked_in' : 'confirmed');
        const data = it.kind === 'block'
          ? { kind: 'block', roomId: byNo.get(it.roomNo), checkIn: it.checkIn, checkOut: it.checkOut, reason: it.reason, notes: it.notes, status: 'confirmed', src: 'excel', createdAt: now, createdBy: Store.me?.id }
          : { kind: 'booking', roomId: byNo.get(it.roomNo), checkIn: it.checkIn, checkOut: it.checkOut, guest: it.guest, channel: it.channel || XCOLOR_CHAN[it.color] || '', xcolor: it.color || '', breakfast: it.breakfast, rateType: it.rateType, notes: XP.redact(it.notes), status, adults: 2, children: 0, src: 'excel', createdAt: now, createdBy: Store.me?.id };
        const old = M.bookings.get(id); if (old && old.guestId) data.guestId = old.guestId;
        return [{ col: 'bookings', id, data }].concat(it.kind === 'booking' && (it.rate || XP.redact(it.notes) !== String(it.notes).trim()) ? [{ col: 'finance', id, data: { rate: it.rate || 0, paid: 0, srcNote: it.notes } }] : []);
      }).flat();
      try {
        await Store.putMany(rows, (d, n) => { $('#xProg div').style.width = (d / n * 100) + '%'; });
        logAct(`นำเข้าข้อมูลจาก Excel ${list.length} รายการ`);
        toast(`นำเข้าแล้ว ${list.length} รายการ · ไปที่ “ฐานข้อมูลแขก” เพื่อสร้างโปรไฟล์แขกจากข้อมูลนี้`);
      } catch (e) { toast(errMsg(e), 'err'); }
      $('#xGo').disabled = false;
    };
  } catch (e) { console.error(e); pv.innerHTML = '<div class="notice err">อ่านไฟล์ไม่ได้ ตรวจว่าเป็นไฟล์ .xlsx ที่ดาวน์โหลดจาก Google Drive (ไฟล์ → ดาวน์โหลด → Microsoft Excel)</div>'; }
}

/* ================= SERVICE DETAILS (breakfast · cleaning · laundry · taxi) ================= */
const SVC = {
  diet: ['มังสวิรัติ', 'วีแกน (Vegan)', 'ไม่ทานเนื้อวัว', 'ไม่ทานอาหารทะเล', 'ไม่ทานเผ็ด', 'ไม่ทานกลูเตน', 'ไม่ทานนม / แล็กโทส', 'อาหารเด็ก'],
  allergy: ['ถั่ว / ถั่วลิสง', 'กุ้ง / อาหารทะเล', 'ไข่', 'นม', 'แป้งสาลี', 'ถั่วเหลือง', 'งา'],
  cleanFreq: ['ทุกวัน', 'วันเว้นวัน', 'เมื่อแขกขอเท่านั้น', 'ไม่ต้องทำ (ห้ามรบกวน)'],
  cleanTime: ['ไม่ระบุ', 'ช่วงเช้า', 'ช่วงบ่าย', 'ตอนแขกออกไปข้างนอก'],
  cleanAllergy: ['ใบเตย', 'น้ำหอมปรับอากาศ', 'กลิ่นน้ำยาแรง / คลอรีน', 'ฝุ่น', 'ขนนก (หมอน)', 'ดอกไม้'],
  linen: ['ทุกวัน', 'ทุก 2 วัน', 'ทุก 3 วัน', 'เมื่อแขกขอ'],
  cleanExtra: ['ผ้าเช็ดตัวเพิ่ม', 'หมอนเพิ่ม', 'ผ้าห่มเพิ่ม', 'น้ำดื่มเพิ่ม', 'ไม่ต้องเปลี่ยนผ้าปู'],
  lService: ['ซัก อบ รีด', 'ซักอบ ไม่รีด', 'ซักแห้ง', 'รีดอย่างเดียว'],
  lStatus: { sent: 'ส่งร้านแล้ว', back: 'รับคืนจากร้านแล้ว', given: 'ส่งคืนแขกแล้ว' },
};
const svcOf = b => (b && b.svc) || {};
// is this stay due for room cleaning on day d? (from the cleaning frequency the guest asked for)
function cleanDue(b, d) {
  if (!b || b.checkIn >= d || d > b.checkOut) return false;
  const f = (svcOf(b).clean || {}).freq || 'ทุกวัน', n = diffDays(b.checkIn, d);
  if (f === 'ทุกวัน') return true;
  if (f === 'วันเว้นวัน') return n % 2 === 0 || d === b.checkOut;
  return d === b.checkOut;
}
function svcSummary(x) {
  const bf = svcOf(x.bfB || x.b).bf || {}, cl = svcOf(x.b).clean || {}, li = (x.o && x.o.linfo) || {};
  const out = [];
  const bfs = [...(bf.diet || []), ...(bf.allergy || []).map(a => 'แพ้' + a), bf.note].filter(Boolean);
  if (bfs.length) out.push(`<span class="sv bf">${icon('coffee')}${esc(bfs.join(' · '))}</span>`);
  const cls = [cl.freq && cl.freq !== 'ทุกวัน' ? cl.freq : '', cl.time && cl.time !== 'ไม่ระบุ' ? cl.time : '', ...(cl.allergy || []).map(a => 'แพ้' + a), ...(cl.extra || []), cl.note].filter(Boolean);
  if (cls.length) out.push(`<span class="sv clean">${icon('sparkle')}${esc(cls.join(' · '))}</span>`);
  const lis = [li.urgent ? 'ด่วน' : '', li.shop, li.service, li.back ? 'คืน ' + fmtShort(li.back) : '', li.status ? SVC.lStatus[li.status] : '', li.price ? '฿' + money(li.price) : '', li.note].filter(Boolean);
  if (x.o && x.o.laundry && lis.length) out.push(`<span class="sv laundry">${icon('shirt')}${esc(lis.join(' · '))}</span>`);
  if (x.o && x.o.note) out.push(`<span class="sv note">${icon('note')}${esc(x.o.note)}</span>`);
  return out.join('');
}
const chk = (name, list, sel) => `<div class="svc-chips">${list.map(v => `<label class="svc-c"><input type="checkbox" name="${name}" value="${esc(v)}"${(sel || []).includes(v) ? ' checked' : ''}><span>${esc(v)}</span></label>`).join('')}</div>`;
const rad = (name, list, cur) => `<div class="seg svc-seg">${list.map(v => `<label><input type="radio" name="${name}" value="${esc(v)}"${v === cur ? ' checked' : ''}><span>${esc(v)}</span></label>`).join('')}</div>`;
const vals = (root, name) => [...root.querySelectorAll(`input[name="${name}"]:checked`)].map(i => i.value);
const val1 = (root, name) => (root.querySelector(`input[name="${name}"]:checked`) || {}).value || '';
function svcModal(title, sub, body, onSave, toggle) {
  const m = openModal(`<div class="sheet narrow" style="width:min(620px,100%)"><div class="sheet-h"><div><h2>${title}</h2><div class="hint">${sub}</div></div><div class="spacer"></div><button class="btn ghost" data-close>✕</button></div>
    <div class="sheet-b svc-b">${toggle ? `<label class="svc-toggle"><input type="checkbox" id="svOn"${toggle.on ? ' checked' : ''}><span class="sw"></span><span>${toggle.label}</span></label>` : ''}${body}</div>
    <div class="sheet-f"><div class="spacer"></div><button class="btn" data-close>ยกเลิก</button><button class="btn primary" id="svSave">บันทึก</button></div></div>`);
  m.el.querySelector('#svSave').onclick = async () => { if (await onSave(m.el)) m.close(); };
  return m;
}
const opPatch = (t, key, el) => t ? Store.merge('ops', t.day, { date: t.day, rooms: { [t.roomId]: { [key]: el.querySelector('#svOn').checked, by: Store.me?.id, at: Date.now() } } }) : null;
const bfBody = s => `
    <div class="f"><span>อาหารที่ทาน / ไม่ทาน</span>${chk('diet', SVC.diet, s.diet)}</div>
    <div class="f"><span>แพ้อาหาร</span>${chk('allergy', SVC.allergy, (s.allergy || []).filter(x => x !== s.allergyOther))}<input type="text" id="svAllergyOther" value="${esc(s.allergyOther || '')}" placeholder="แพ้อย่างอื่น เช่น แพ้ผงชูรส"></div>
    <label class="f"><span>หมายเหตุถึงครัว</span><input type="text" id="svNote" value="${esc(s.note || '')}"></label>`;
const bfRead = el => { const allergy = vals(el, 'allergy'), other = el.querySelector('#svAllergyOther').value.trim(); if (other) allergy.push(other);
  return { diet: vals(el, 'diet'), allergy, allergyOther: other, note: el.querySelector('#svNote').value.trim() }; };
const bfHas = s => !!s && ((s.diet || []).length || (s.allergy || []).length || s.note);
function openBfDetail(b, roomNoTxt, t) {
  const s = svcOf(b).bf || {}, g = b.guestId ? M.guests.get(b.guestId) : null;
  svcModal(`${icon('coffee')} อาหารเช้า · ห้อง ${esc(roomNoTxt)}`, `${esc(b.guest)} · ใช้ตลอดการเข้าพักครั้งนี้`, `${bfBody(s)}
    ${g ? `<label class="chk"><input type="checkbox" id="svRemember"${g.prefs?.bf ? ' checked' : ''}> จำไว้ในโปรไฟล์แขก ใช้กับการเข้าพักครั้งต่อไป</label>` : ''}`,
  async el => {
    const bf = bfRead(el);
    const rem = el.querySelector('#svRemember');
    return save(async () => { await opPatch(t, 'bf', el); await Store.merge('bookings', b.id, { svc: { bf } }); if (g && rem && rem.checked) await Store.merge('guests', g.id, { prefs: { bf } }); }, 'บันทึกอาหารเช้าแล้ว');
  }, t && { on: t.on, label: `ทานอาหารเช้า ${esc(fmtShort(t.day))}` });
}
function openCleanDetail(b, roomNoTxt, t) {
  const s = svcOf(b).clean || {}, g = b.guestId ? M.guests.get(b.guestId) : null;
  svcModal(`${icon('sparkle')} ทำความสะอาด · ห้อง ${esc(roomNoTxt)}`, `${esc(b.guest)} · ใช้ตลอดการเข้าพักครั้งนี้`, `
    <div class="f"><span>ความถี่ในการทำความสะอาด</span>${rad('freq', SVC.cleanFreq, s.freq || 'ทุกวัน')}</div>
    <div class="f"><span>ช่วงเวลาที่สะดวก</span>${rad('time', SVC.cleanTime, s.time || 'ไม่ระบุ')}</div>
    <div class="f"><span>แพ้ / ห้ามใช้</span>${chk('allergy', SVC.cleanAllergy, s.allergy)}<input type="text" id="svAllergyOther" value="${esc(s.allergyOther || '')}" placeholder="อย่างอื่น เช่น ห้ามใช้สเปรย์กันยุง"></div>
    <div class="f"><span>เปลี่ยนผ้าปูที่นอน / ผ้าเช็ดตัว</span>${rad('linen', SVC.linen, s.linen || 'ทุก 2 วัน')}</div>
    <div class="f"><span>ขอเพิ่มเติม</span>${chk('extra', SVC.cleanExtra, s.extra)}</div>
    <label class="f"><span>หมายเหตุถึงแม่บ้าน</span><input type="text" id="svNote" value="${esc(s.note || '')}"></label>
    ${g ? `<label class="chk"><input type="checkbox" id="svRemember"${g.prefs?.clean ? ' checked' : ''}> จำไว้ในโปรไฟล์แขก ใช้กับการเข้าพักครั้งต่อไป</label>` : ''}`,
  async el => {
    const allergy = vals(el, 'allergy'), other = el.querySelector('#svAllergyOther').value.trim(); if (other) allergy.push(other);
    const clean = { freq: val1(el, 'freq'), time: val1(el, 'time'), allergy, allergyOther: other, linen: val1(el, 'linen'), extra: vals(el, 'extra'), note: el.querySelector('#svNote').value.trim() };
    const rem = el.querySelector('#svRemember');
    return save(async () => { await opPatch(t, 'clean', el); await Store.merge('bookings', b.id, { svc: { clean } }); if (g && rem && rem.checked) await Store.merge('guests', g.id, { prefs: { clean } }); }, 'บันทึกการทำความสะอาดแล้ว');
  }, t && { on: t.on, label: `ทำความสะอาดห้องนี้แล้ว ${esc(fmtShort(t.day))}` });
}
function laundryShops() { const s = new Set(); for (const o of M.ops.values()) for (const r of Object.values(o.rooms || {})) if (r.linfo && r.linfo.shop) s.add(r.linfo.shop); return [...s].sort(); }
function openLaundryDetail(roomId, b, day, on) {
  const o = (opsOf(day).rooms || {})[roomId] || {}, s = o.linfo || {};
  svcModal(`${icon('shirt')} ส่งผ้าซัก · ห้อง ${esc(roomNo(roomId))}`, `${esc(b.guest)} · ${esc(fmtLong(day))}`, `
    <div class="fields"><label class="f w2"><span>ส่งร้าน</span><input type="text" id="svShop" list="svShops" value="${esc(s.shop || '')}" placeholder="ชื่อร้านซักรีด"><datalist id="svShops">${laundryShops().map(x => `<option>${esc(x)}</option>`).join('')}</datalist></label>
      <label class="f"><span>เบอร์ร้าน</span><input type="tel" id="svShopTel" value="${esc(s.tel || '')}"></label></div>
    <div class="f"><span>บริการ</span>${rad('service', SVC.lService, SVC.lService.includes(s.service) ? s.service : 'ซัก อบ รีด')}</div>
    <label class="chk"><input type="checkbox" id="svUrgent"${s.urgent || s.service === 'ด่วน (ภายในวัน)' ? ' checked' : ''}> ด่วน (ได้คืนภายในวัน)</label>
    <div class="fields"><label class="f"><span>จำนวน (ชิ้น / กก.)</span><input type="text" id="svQty" value="${esc(s.qty || '')}" placeholder="เช่น 12 ชิ้น หรือ 3 กก."></label>
      <label class="f"><span>นัดรับคืน</span><input type="date" id="svBack" value="${esc(s.back || addDays(day, 1))}"></label>
      <label class="f"><span>ค่าบริการ (บาท)</span><input type="number" id="svPrice" min="0" value="${+s.price || ''}"></label></div>
    <div class="f"><span>สถานะ</span>${rad('status', Object.values(SVC.lStatus), SVC.lStatus[s.status || 'sent'])}</div>
    <label class="f"><span>หมายเหตุ</span><input type="text" id="svNote" value="${esc(s.note || '')}" placeholder="เช่น เสื้อขาวแยกซัก, มีชุดผ้าไหม"></label>`,
  async el => {
    const stTxt = val1(el, 'status'), status = Object.keys(SVC.lStatus).find(k => SVC.lStatus[k] === stTxt) || 'sent';
    const linfo = { shop: el.querySelector('#svShop').value.trim(), tel: el.querySelector('#svShopTel').value.trim(), service: val1(el, 'service'), urgent: el.querySelector('#svUrgent').checked, qty: el.querySelector('#svQty').value.trim(), back: el.querySelector('#svBack').value, price: +el.querySelector('#svPrice').value || 0, status, note: el.querySelector('#svNote').value.trim() };
    return save(() => Store.merge('ops', day, { date: day, rooms: { [roomId]: { laundry: !!(linfo.shop || linfo.qty || linfo.price || linfo.note), linfo, by: Store.me?.id, at: Date.now() } } }), 'บันทึกผ้าซักแล้ว');
  });
}
function openNoteDetail(roomId, b, day, cur) {
  const m = svcModal(`${icon('note')} หมายเหตุ · ห้อง ${esc(roomNo(roomId))}`, `${esc(b.guest)} · ${esc(fmtLong(day))}`,
    `<label class="f"><span>หมายเหตุ</span><textarea id="svNoteTxt" rows="4">${esc(cur)}</textarea></label>`,
    el => save(() => Store.merge('ops', day, { date: day, rooms: { [roomId]: { note: el.querySelector('#svNoteTxt').value.trim(), by: Store.me?.id, at: Date.now() } } }), 'บันทึกหมายเหตุแล้ว'));
  setTimeout(() => { const t = m.el.querySelector('#svNoteTxt'); t.focus(); t.setSelectionRange(t.value.length, t.value.length); }, 40);
}
// read-only overview of everything we know about the guest in this room today
function openRoomSummary(x, day) {
  const b = withFin(x.b), g = b.guestId ? M.guests.get(b.guestId) : null, r = x.r, o = x.o || {};
  const bf = svcOf(x.bfB || b).bf || {}, cl = svcOf(b).clean || {}, li = o.linfo || {}, tx = txOf(b).filter(t => t.status !== 'cancelled');
  const kv = (k, v) => v || v === 0 ? `<div class="rs-kv"><span>${k}</span><b>${v}</b></div>` : '';
  const list = a => (a || []).filter(Boolean).map(esc).join(', ');
  const sec = (ic, title, body, empty = 'ไม่มีข้อมูล') => `<section class="rs-sec"><h4>${icon(ic)} ${title}</h4>${body.replace(/\s/g, '') ? body : `<div class="hint">${empty}</div>`}</section>`;
  const cp = compOf(b), fin = canFinance() && !cp && b.src !== 'excel';
  const html = `<div class="sheet" style="width:min(760px,100%)"><div class="sheet-h"><div class="roomtag ${r.type === 'family' ? 'rt-family' : 'rt-single'}" style="margin-right:12px">${esc(r.no)}<small>${r.type === 'family' ? 'FAMILY' : esc((r.bed || 'ROOM').toUpperCase())}</small></div>
      <div><h2>${esc(b.guest)}</h2><div class="hint">${fmtD(b.checkIn)} → ${fmtD(b.checkOut)} · ${nightsOf(b)} คืน · <span class="pill p-${b.status}">${STATUS[b.status] || ''}</span></div></div><div class="spacer"></div><button class="btn ghost" data-close>✕</button></div>
    <div class="sheet-b rs">
      ${sec('users', 'ข้อมูลแขก', kv('โทรศัพท์', esc(g?.phone || b.phone || '')) + kv('อีเมล', esc(g?.email || b.email || '')) + kv('สัญชาติ', esc(g?.nationality || b.nationality || '')) + kv('พาสปอร์ต / บัตร', esc(g?.passport || b.passport || '')) + kv('วันเกิด', (g?.dob || b.dob) ? fmtD(g?.dob || b.dob) : '')
        + kv('ผู้เข้าพัก', `${+b.adults || 0} ผู้ใหญ่${+b.children ? ` · ${+b.children} เด็ก` : ''}`) + kv('ช่องทาง', esc(b.channel || '')) + kv('เลขที่จอง', esc(b.ref || '')) + kv('เวลาที่จะมาถึง', esc(b.eta || ''))
        + kv('เตียงเสริม / เปล', xbedOf(b) || cotOf(b) ? [xbedOf(b) ? `เตียงเสริม ${xbedOf(b)}` : '', cotOf(b) ? `เปลเด็ก ${cotOf(b)}` : ''].filter(Boolean).join(' · ') : '') + kv('เตียง', b.twin ? 'ขอเตียงแยก (Twin)' : '')
        + kv('แขกรับรอง', cp ? esc(compLabel(cp) + (cp.note ? ' · ' + cp.note : '')) : '') + (g && (g.tags || []).length ? kv('ป้าย', (g.tags || []).map(t => esc(TAGS[t] || t)).join(', ')) : '') + (g && g.notes ? kv('หมายเหตุแขก', esc(g.notes)) : ''))}
      ${sec('coffee', `อาหารเช้า${x.bf ? ' · <em class="rs-on">ทานวันนี้</em>' : (x.bfB || b).breakfast ? '' : ' · <em>ไม่รวมอาหารเช้า</em>'}`, kv('อาหาร', list(bf.diet)) + kv('แพ้อาหาร', list(bf.allergy)) + kv('หมายเหตุถึงครัว', esc(bf.note || '')))}
      ${sec('sparkle', `ทำความสะอาด${o.clean ? ' · <em class="rs-on">ทำแล้ววันนี้</em>' : ''}`, kv('ความถี่', esc(cl.freq || '')) + kv('ช่วงเวลา', cl.time && cl.time !== 'ไม่ระบุ' ? esc(cl.time) : '') + kv('แพ้ / ห้ามใช้', list(cl.allergy)) + kv('เปลี่ยนผ้า', esc(cl.linen || '')) + kv('ขอเพิ่มเติม', list(cl.extra)) + kv('หมายเหตุถึงแม่บ้าน', esc(cl.note || '')))}
      ${sec('shirt', `ส่งผ้าซัก${o.laundry ? ' · <em class="rs-on">ส่งวันนี้</em>' : ''}`, o.laundry || li.shop ? kv('ร้าน', esc([li.shop, li.tel].filter(Boolean).join(' · '))) + kv('บริการ', esc((li.service || '') + (li.urgent ? ' · ด่วน (ภายในวัน)' : ''))) + kv('จำนวน', esc(li.qty || '')) + kv('นัดรับคืน', li.back ? fmtD(li.back) : '') + kv('สถานะ', li.status ? esc(SVC.lStatus[li.status]) : '') + kv('หมายเหตุ', esc(li.note || '')) : '', 'ไม่ได้ส่งผ้าซัก')}
      ${sec('car', 'รถรับส่ง', tx.map(t => `<div class="rs-kv"><span>${esc(fmtShort(t.date))} ${esc(t.time || '')}</span><b>${esc(TX_TYPES[t.type] || '')} · ${esc(txLine(t))}${t.flight ? ' · ✈ ' + esc(t.flight) : ''}${t.pax ? ' · ' + t.pax + ' คน' : ''} · ${esc(TX_STATUS[t.status || 'need'])}${t.driver || t.plate || t.phone ? `<br><small>${esc([t.driver, t.plate, t.phone].filter(Boolean).join(' · '))}</small>` : ''}</b></div>`).join(''), 'ไม่มีรถรับส่ง')}
      ${sec('note', 'หมายเหตุ', kv(`วันนี้ (${esc(fmtShort(day))})`, esc(o.note || '')) + kv('การจอง', (() => { const n = String(b.notes || '').trim(); return n && normName(n) !== normName(b.guest) ? esc(n) : ''; })()))}
      ${fin ? sec('chart', 'การชำระเงิน', (discOf(b) ? kv('ส่วนลด', '−฿' + money(discOf(b)) + (b.discNote ? ' · ' + esc(b.discNote) : '')) : '') + kv('ยอดที่ต้องเก็บ', '฿' + money(capOf(b))) + kv('รับแล้ว', '฿' + money(+b.paid || 0) + (b.payMethod ? ' · ' + esc(b.payMethod) : '')) + kv('คงค้าง', balanceOf(b) > 0 ? `<span class="owe">฿${money(balanceOf(b))}</span>` : 'ครบแล้ว ✓') + (+b.deposit ? kv('มัดจำ', '฿' + money(+b.deposit) + (depRefOf(b) ? ' · ' + esc(DEP_ST[depRefOf(b).st]) : ' · ยังไม่คืน')) : '')) : ''}
    </div>
    <div class="sheet-f"><div class="spacer"></div><button class="btn primary" data-close>ปิด</button></div></div>`;
  openModal(html);
}
function openTxEditor(b) {
  const m = openModal(`<div class="sheet" style="width:min(860px,100%)"><div class="sheet-h"><div><h2>${icon('car')} รถรับส่ง · ห้อง ${esc(roomNo(b.roomId))}</h2><div class="hint">${esc(b.guest)} · ${esc(fmtD(b.checkIn))} → ${esc(fmtD(b.checkOut))}</div></div><div class="spacer"></div><button class="btn ghost" data-close>✕</button></div>
    <div class="sheet-b"><div id="teList" class="tx-list"></div><datalist id="txPlaces2">${[TX_HOTEL, ...TX_PLACES].map(p => `<option>${esc(p)}</option>`).join('')}</datalist>
      <div class="row" style="gap:8px"><button type="button" class="btn sm" data-addtx="pickup">${icon('plus')} รับจากสนามบิน</button><button type="button" class="btn sm" data-addtx="dropoff">${icon('plus')} ส่งไปสนามบิน</button><button type="button" class="btn sm" data-addtx="other">${icon('plus')} ที่อื่นๆ</button></div></div>
    <div class="sheet-f"><div class="spacer"></div><button class="btn" data-close>ยกเลิก</button><button class="btn primary" id="teSave">บันทึก</button></div></div>`);
  const box = m.el.querySelector('#teList');
  const row = t => { const d = document.createElement('div'); d.className = 'tx-row'; d.dataset.id = t.id || Store.newId(); d.innerHTML = txRowInner(t).replaceAll('list="txPlaces"', 'list="txPlaces2"'); box.appendChild(d); labelDates(d); return d; };
  txOf(b).forEach(row); txBind(box);
  m.el.addEventListener('click', e => {
    const add = e.target.closest('[data-addtx]');
    if (add) { const ty = add.dataset.addtx; const d = row(txNew(ty, ty === 'dropoff' ? b.checkOut : b.checkIn, (+b.adults || 0) + (+b.children || 0) || 1, b.eta));
      d.querySelector(ty === 'other' ? '[data-k=from]' : '[data-k=time]').focus(); return; }
    const del = e.target.closest('[data-deltx]'); if (del) del.closest('.tx-row').remove();
  });
  m.el.querySelector('#teSave').onclick = async () => {
    const list = readTxRows(box);
    if (await save(() => Store.merge('bookings', b.id, { transfers: list, updatedAt: Date.now(), updatedBy: Store.me?.id }), 'บันทึกรถรับส่งแล้ว')) { logAct(`แก้รถรับส่ง ${b.guest} · ห้อง ${roomNo(b.roomId)}`); m.close(); }
  };
  if (!txOf(b).length) row(txNew('pickup', b.checkIn, (+b.adults || 0) + (+b.children || 0) || 1, b.eta));
}
function openTaxiDetail(b) {
  const list = txOf(b);
  const m = openModal(`<div class="sheet narrow" style="width:min(620px,100%)"><div class="sheet-h"><div><h2>${icon('car')} รถรับส่ง · ห้อง ${esc(roomNo(b.roomId))}</h2><div class="hint">${esc(b.guest)} · ${esc(fmtD(b.checkIn))} → ${esc(fmtD(b.checkOut))}</div></div><div class="spacer"></div><button class="btn ghost" data-close>✕</button></div>
    <div class="sheet-b">${list.length ? `<div class="tx-day">${list.map(t => `<div class="tx-item st-${esc(t.status || 'need')}"><div class="tx-time"><b>${esc(fmtShort(t.date))} ${esc(t.time || '')}</b></div>
      <div class="tx-main"><b>${t.type === 'pickup' ? 'รับเข้าโรงแรม' : t.type === 'dropoff' ? 'ส่งออกจากโรงแรม' : 'อื่นๆ'}</b><span>${esc(txLine(t))}${t.flight ? ' · ✈ ' + esc(t.flight) : ''}${t.pax ? ' · ' + t.pax + ' คน' : ''}</span>${t.driver || t.plate || t.phone ? `<span class="tx-drv">${esc([t.driver, t.plate, t.phone].filter(Boolean).join(' · '))}</span>` : ''}</div>
      <select class="tx-st" data-tid="${esc(t.id)}">${Object.entries(TX_STATUS).map(([k, l]) => `<option value="${k}"${k === (t.status || 'need') ? ' selected' : ''}>${l}</option>`).join('')}</select></div>`).join('')}</div>` : '<div class="empty">ยังไม่ได้จองรถให้แขกคนนี้</div>'}</div>
    <div class="sheet-f"><div class="spacer"></div><button class="btn" data-close>ปิด</button><button class="btn primary" id="txEdit">${icon('plus')} เพิ่ม / แก้ไขรถ</button></div></div>`);
  m.el.addEventListener('change', e => { const s = e.target.closest('.tx-st'); if (s) setTxStatus(b.id, s.dataset.tid, s.value); });
  m.el.querySelector('#txEdit').onclick = () => { m.close(); openTxEditor(M.bookings.get(b.id) || b); };
}

/* ================= TAXI / TRANSFERS ================= */
const TX_HOTEL = 'โรงแรม';
const txFrom = t => t.from != null ? t.from : t.type === 'pickup' ? (t.place || '') : t.type === 'dropoff' ? TX_HOTEL : (t.place || '');
const txTo = t => t.to != null ? t.to : t.type === 'pickup' ? TX_HOTEL : t.type === 'dropoff' ? (t.place || '') : '';
const txRowInner = t => { const nm = 'txt_' + (t.id || Math.random().toString(36).slice(2)); return `
      <div class="tx-top"><div class="seg tx-seg">${Object.entries(TX_TYPES).map(([k, l]) => `<label><input type="radio" name="${nm}" data-k="type" value="${k}"${k === (t.type || 'pickup') ? ' checked' : ''}><span>${k === 'pickup' ? '↘ ' : k === 'dropoff' ? '↗ ' : ''}${l}</span></label>`).join('')}</div>
        <select data-k="status" class="tx-status">${Object.entries(TX_STATUS).map(([k, l]) => `<option value="${k}"${k === (t.status || 'need') ? ' selected' : ''}>${l}</option>`).join('')}</select>
        <button type="button" class="iconbtn" data-deltx title="ลบเที่ยวนี้">✕</button></div>
      <div class="tx-route"><label class="f"><span>รับที่</span><input type="text" data-k="from" value="${esc(txFrom(t))}" list="txPlaces" placeholder="จุดรับ"></label>
        <span class="tx-arrow">→</span><label class="f"><span>ส่งที่</span><input type="text" data-k="to" value="${esc(txTo(t))}" list="txPlaces" placeholder="จุดส่ง"></label>
        <button type="button" class="iconbtn tx-swap" data-txswap title="สลับรับ/ส่ง">⇄</button></div>
      <div class="tx-grid">
        <label class="f"><span>วันที่</span><div class="tx-d"><input type="date" data-k="date" value="${esc(t.date || '')}"></div></label>
        <label class="f"><span>เวลา</span><input type="time" data-k="time" value="${esc(t.time || '')}"></label>
        <label class="f"><span>เที่ยวบิน</span><input type="text" data-k="flight" value="${esc(t.flight || '')}"></label>
        <label class="f"><span>จำนวนคน</span><input type="number" data-k="pax" min="1" value="${+t.pax || ''}"></label>
        <label class="f"><span>ชื่อคนขับ</span><input type="text" data-k="driver" value="${esc(t.driver || '')}"></label>
        <label class="f"><span>ทะเบียนรถ</span><input type="text" data-k="plate" value="${esc(t.plate || '')}"></label>
        <label class="f w2"><span>เบอร์โทรคนขับ</span><input type="tel" data-k="phone" value="${esc(t.phone || '')}"></label>
        <label class="f w4"><span>หมายเหตุ</span><input type="text" data-k="note" value="${esc(t.note || '')}"></label></div>`; };
// read every transfer card inside a container
function readTxRows(box) {
  return [...box.querySelectorAll('.tx-row')].map(r => { const o = { id: r.dataset.id };
    r.querySelectorAll('[data-k]').forEach(i => { if (i.type === 'radio') { if (i.checked) o.type = i.value; return; } o[i.dataset.k] = i.type === 'number' ? (+i.value || 0) : i.value.trim(); });
    o.place = o.type === 'pickup' ? o.from : o.type === 'dropoff' ? o.to : [o.from, o.to].filter(Boolean).join(' → ');
    return o; }).filter(t => validD(t.date));
}
// pick-up / drop-off switches which side is the hotel
function txBind(box) {
  box.addEventListener('change', e => { const r = e.target.closest('.tx-row'); if (!r || e.target.type !== 'radio') return;
    const f = r.querySelector('[data-k=from]'), t = r.querySelector('[data-k=to]'), ty = e.target.value, other = [f.value, t.value].find(v => v && v !== TX_HOTEL) || '';
    if (ty === 'pickup') { f.value = other || TX_PLACES[0]; t.value = TX_HOTEL; } else if (ty === 'dropoff') { f.value = TX_HOTEL; t.value = other || TX_PLACES[0]; } });
  box.addEventListener('click', e => { const s = e.target.closest('[data-txswap]'); if (!s) return; const r = s.closest('.tx-row'), f = r.querySelector('[data-k=from]'), t = r.querySelector('[data-k=to]'); [f.value, t.value] = [t.value, f.value]; });
}
const txNew = (ty, date, pax, eta) => ({ id: Store.newId(), type: ty, date, time: ty === 'pickup' ? (eta || '') : '', from: ty === 'pickup' ? TX_PLACES[0] : ty === 'dropoff' ? TX_HOTEL : '', to: ty === 'pickup' ? TX_HOTEL : ty === 'dropoff' ? TX_PLACES[0] : '', pax, status: 'need' });
const TX_TYPES = { pickup: 'รับเข้าโรงแรม', dropoff: 'ส่งออกจากโรงแรม', other: 'อื่นๆ' };
const TX_STATUS = { need: 'ยังไม่ได้จองรถ', booked: 'จองรถแล้ว', done: 'เสร็จแล้ว', cancelled: 'ยกเลิก' };
const TX_PLACES = ['สนามบินภูเก็ต (HKT)', 'ท่าเรือรัษฎา', 'ตัวเมืองภูเก็ต', 'ป่าตอง', 'สนามบินกระบี่ (KBV)'];
const txOf = b => (b && b.kind !== 'block' && Array.isArray(b.transfers)) ? b.transfers : [];
function transfersOn(d) {
  const out = [];
  for (const b of allBookings()) if (isActive(b)) for (const t of txOf(b)) if (t.date === d && t.status !== 'cancelled') out.push({ b, t });
  return out.sort((x, y) => String(x.t.time || '99').localeCompare(String(y.t.time || '99')));
}
const txLine = t => `${txFrom(t) || '—'} → ${txTo(t) || '—'}`;
async function setTxStatus(bid, tid, status) {
  const b = M.bookings.get(bid); if (!b) return;
  const list = txOf(b).map(t => t.id === tid ? { ...t, status } : t);
  if (await save(() => Store.merge('bookings', bid, { transfers: list }), `อัปเดตรถ: ${TX_STATUS[status]}`)) logAct(`รถรับส่ง ${b.guest}: ${TX_STATUS[status]}`);
}
// where the ride list stands against the Excel sheet, so a sync that never ran or failed is visible
function xsTxStatus() {
  const st = M.state.get('xlsync') || {}, desk = !!(window.bvDesktop && window.bvDesktop.fetchSheet), err = st.error && (st.errorAt || 0) > (st.at || 0);
  const um = (st.tx && st.tx.unmatched || []).length;
  const line = !st.at && !err ? 'ยังไม่เคยดึงตารางรถจาก Excel' : err ? `ดึงจาก Excel ไม่สำเร็จ ${fmtTime(st.errorAt)} · ${esc(st.error)}` : `ดึงจาก Excel ล่าสุด ${fmtTime(st.at)}${um ? ` · หาการจองไม่เจอ ${um} รายการ (ดูที่ตั้งค่า)` : ''}`;
  if (!err) return ''; // syncing runs by itself; only a failure is shown here
  return `<div class="tx-sync owe"><span>${line}</span>${desk ? '<button class="btn sm ghost" data-xsnow>ลองใหม่</button>' : ''}</div>`;
}
function renderTaxiCard(d) {
  const list = transfersOn(d), el = $('#txList'); if (!el) return;
  const next = []; for (let i = 1; i <= 7; i++) { const dd = addDays(d, i); for (const x of transfersOn(dd)) next.push({ ...x, d: dd }); }
  const soon = next.length ? `<div class="tx-soon"><h4>ใน 7 วันข้างหน้า · ${next.length} เที่ยว</h4>${next.map(({ b, t, d: dd }) => `<div class="tx-soon-row" data-id="${esc(b.id)}"><span class="mono">${fmtShort(dd)} ${esc(t.time || '')}</span><span class="pill ${t.type === 'pickup' ? 'p-confirmed' : 'p-tentative'}">${t.type === 'pickup' ? 'รับ' : t.type === 'dropoff' ? 'ส่ง' : 'อื่นๆ'}</span><b>ห้อง ${esc(roomNo(b.roomId))} · ${esc(b.guest)}</b><span class="muted">${esc(txLine(t))}${t.flight ? ' · ✈ ' + esc(t.flight) : ''}${t.pax ? ' · ' + t.pax + ' คน' : ''}</span><span class="muted">${esc(TX_STATUS[t.status || 'need'])}</span></div>`).join('')}</div>` : '';
  $('#txCount').textContent = list.length ? `${list.length} เที่ยว · ยังไม่ได้จองรถ ${list.filter(x => x.t.status === 'need').length}` : '';
  el.innerHTML = list.length ? list.map(({ b, t }) => `<div class="tx-item st-${esc(t.status || 'need')}" data-id="${esc(b.id)}">
      <div class="tx-time"><b>${esc(t.time || '—')}</b><span class="pill ${t.type === 'pickup' ? 'p-confirmed' : t.type === 'dropoff' ? 'p-tentative' : 'p-checked_out'}">${t.type === 'pickup' ? 'รับ' : t.type === 'dropoff' ? 'ส่ง' : 'อื่นๆ'}</span></div>
      <div class="tx-main"><b>ห้อง ${esc(roomNo(b.roomId))} · ${esc(b.guest)}</b><span>${esc(txLine(t))}${t.flight ? ' · ✈ ' + esc(t.flight) : ''}${t.pax ? ' · ' + t.pax + ' คน' : ''}</span>${t.driver || t.plate || t.phone ? `<span class="tx-drv">${icon('car')} ${esc([t.driver, t.plate].filter(Boolean).join(' · ') || 'คนขับ')}${t.phone ? ` · <a href="tel:${esc(t.phone)}">${esc(t.phone)}</a>` : ''}</span>` : ''}${t.note ? `<span>${esc(t.note)}</span>` : ''}</div>
      <select class="tx-st" data-bid="${esc(b.id)}" data-tid="${esc(t.id)}">${Object.entries(TX_STATUS).map(([k, l]) => `<option value="${k}"${k === (t.status || 'need') ? ' selected' : ''}>${l}</option>`).join('')}</select></div>`).join('')
    : '<div class="empty">ไม่มีรถรับส่งวันนี้</div>';
  el.innerHTML += soon + (isAdmin() ? xsTxStatus() : '');
}

/* ================= RESERVATION SHEET (print for the guest) ================= */
function bookingGroup(b) {
  if (!b.ref) return [b];
  const g = allBookings().filter(x => x.kind !== 'block' && isActive(x) && x.ref === b.ref && x.checkIn === b.checkIn && x.checkOut === b.checkOut);
  return g.length ? g.sort((x, y) => roomNo(x.roomId) < roomNo(y.roomId) ? -1 : 1) : [b];
}
const fmtEN = s => validD(s) ? `${DOW[parseD(s).getUTCDay()]} ${parseD(s).getUTCDate()} ${MON[parseD(s).getUTCMonth()]} ${parseD(s).getUTCFullYear()}` : '—';
function reservationHtml(b0, withPrice) {
  const list = bookingGroup(b0).map(withFin), b = withFin(b0), st = settings(), tm = times();
  const g = b.guestId ? M.guests.get(b.guestId) : null, n = nightsOf(b);
  const ad = list.reduce((s, x) => s + (+x.adults || 0), 0), ch = list.reduce((s, x) => s + (+x.children || 0), 0);
  const tx = list.flatMap(x => txOf(x).filter(t => t.status !== 'cancelled'));
  const total = list.reduce((s, x) => s + totalOf(x), 0), paid = list.reduce((s, x) => s + (+x.paid || 0), 0), dep = list.reduce((s, x) => s + (+x.deposit || 0), 0), fineT = list.reduce((s, x) => s + finesOf(x), 0), discT = list.reduce((s, x) => s + discOf(x), 0), refT = list.reduce((s, x) => s + refundAmtOf(x), 0);
  const row = (k, v) => v ? `<div><span>${k}</span><b>${v}</b></div>` : '';
  const rType = r => r.type === 'family' ? 'Family Room · 2 bedrooms' : `${r.bed || 'Double'} Room`;
  let notes = String(b.notes || '').replace(/\s+/g, ' ').trim();
  if (b.guest) notes = notes.split(String(b.guest).trim()).join(' ');
  notes = notes.replace(/#\s*\d+/g, ' ').replace(/^[\s,/>.\-]+|[\s,/>.\-]+$/g, '').trim();
  if (notes.length < 3) notes = '';
  return `<div class="rsv">
    <div class="rsv-h"><div><div class="rsv-hotel">${esc(st.hotelName || '')}</div><div class="rsv-addr">${esc([st.hotelAddress, st.hotelPhone && 'Tel ' + st.hotelPhone, st.hotelEmail].filter(Boolean).join(' · '))}</div></div>
      <div class="rsv-t"><b>Reservation details</b><span>${esc(fmtEN(todayStr()))}</span></div></div>
    <div class="rsv-top"><div class="rsv-dates">
        <div><span>Check-in</span><b>${esc(fmtEN(b.checkIn))}</b><small>from ${esc(b.eta || tm.in)}</small></div>
        <div><span>Check-out</span><b>${esc(fmtEN(b.checkOut))}</b><small>until ${esc(tm.out)}</small></div>
        <div><span>Length of stay</span><b>${n} night${n === 1 ? '' : 's'}</b></div>
        <div><span>Total guests</span><b>${ad} adult${ad === 1 ? '' : 's'}${ch ? ` · ${ch} child${ch === 1 ? '' : 'ren'}` : ''}</b></div>
        <div><span>Total units</span><b>${list.length} room${list.length === 1 ? '' : 's'}</b></div></div>
      <div class="rsv-info">
        ${row('Guest name', esc(b.guest))}${row('Email', esc(g?.email || b.email || ''))}${row('Phone', esc(g?.phone || b.phone || ''))}${row('Nationality', esc(g?.nationality || b.nationality || ''))}
        ${row('Booked via', esc(b.channel || 'Direct'))}${row('Rate', compOf(b) ? esc(compEN(compOf(b))) : '')}${row('Booking number', esc(b.ref || ''))}${row('Received', b.createdAt && b.src !== 'excel' ? esc(fmtEN(toStr(new Date(b.createdAt)))) : '')}</div></div>
    <table class="rsv-rooms"><thead><tr><th>#</th><th>Room</th><th>Guest</th><th>Occupancy</th><th>Board</th>${withPrice ? '<th class="r">Price / night</th><th class="r">Subtotal</th>' : ''}</tr></thead><tbody>
      ${list.map((x, i) => { const r = roomById(x.roomId) || {}; return `<tr><td>${i + 1}</td><td><b>Room ${esc(r.no || '?')}</b><div>${esc(rType(r))}</div></td><td>${esc(x.guest)}</td><td>${+x.adults || 0} adult${(+x.adults || 0) === 1 ? '' : 's'}${+x.children ? ` · ${+x.children} child` : ''}${xbedOf(x) ? `<div>Extra bed × ${xbedOf(x)}</div>` : ''}${cotOf(x) ? `<div>Baby cot × ${cotOf(x)}</div>` : ''}</td><td>${x.breakfast ? 'Breakfast included' : 'Room only'}</td>${withPrice ? `<td class="r">${x.rateType === 'month' ? 'Monthly ' + money(x.rate) : money(nightRate(x))}</td><td class="r">THB ${money(grossOf(x))}</td>` : ''}</tr>`; }).join('')}
    </tbody></table>
    ${tx.length ? `<div class="rsv-sec"><h4>Airport transfer / taxi</h4><table class="rsv-rooms"><tbody>${tx.map(t => `<tr><td>${esc(fmtEN(t.date))} ${esc(t.time || '')}</td><td>${t.type === 'pickup' ? 'Pick-up' : t.type === 'dropoff' ? 'Drop-off' : 'Transfer'} · ${esc(`${txFrom(t) || '—'} → ${txTo(t) || '—'}`.replace(new RegExp(TX_HOTEL, 'g'), 'Hotel'))}${t.flight ? ' · Flight ' + esc(t.flight) : ''}</td><td>${t.pax ? t.pax + ' pax' : ''}</td><td>${esc([t.driver, t.plate, t.phone].filter(Boolean).join(' · '))}</td></tr>`).join('')}</tbody></table></div>` : ''}
    ${withPrice && list.some(x => (withFin(x).fines || []).length) ? `<div class="rsv-sec"><h4>Charges at check-out</h4><table class="rsv-rooms"><tbody>${list.flatMap(x => (withFin(x).fines || []).map(f => `<tr><td>Room ${esc(roomNo(x.roomId))}</td><td>${esc(f.name || 'Charge')}</td><td class="r">THB ${money(+f.amt || 0)}</td></tr>`)).join('')}</tbody></table></div>` : ''}
    ${withPrice ? `<div class="rsv-pay">${discT ? `<div><span>Room subtotal</span><b>THB ${money(total + discT)}</b></div><div><span>Discount${(() => { const n = list.map(x => withFin(x).discNote).filter(Boolean); return n.length ? ' · ' + esc([...new Set(n)].join(', ')) : ''; })()}</span><b>− THB ${money(discT)}</b></div>` : ''}<div><span>Total price</span><b>THB ${money(total)}</b></div>${fineT ? `<div><span>Check-out charges</span><b>THB ${money(fineT)}</b></div>` : ''}<div><span>Deposit${(() => { const f = list.flatMap(x => x.fx || []).filter(x => x.to === 'deposit'); return f.length ? ' (' + f.map(x => esc(x.cur) + ' ' + money(x.amt)).join(' + ') + ')' : ''; })()}</span><b>THB ${money(dep)}</b></div><div><span>Paid${b.payMethod ? ' · ' + esc(b.payMethod) : ''}${b.payRef ? ' · Ref ' + esc(b.payRef) : ''}</span><b>THB ${money(paid)}</b></div><div><span>Total to pay</span><b>THB ${money(total + fineT + dep)}</b></div>${refT ? `<div><span>Deposit refunded</span><b>THB ${money(refT)}</b></div>` : ''}<div class="due"><span>Balance due</span><b>THB ${money(Math.max(0, list.reduce((s, x) => s + balanceOf(x), 0)))}</b></div></div>` : ''}
    ${notes && normName(notes) !== normName(b.guest) ? `<div class="rsv-sec"><h4>Notes / special requests</h4><p>${esc(notes)}</p></div>` : ''}
    <div class="rsv-sign"><div><i></i><span>Guest signature</span></div><div><i></i><span>Reception</span></div></div>
    <div class="rsv-foot">Check-in from ${esc(tm.in)} · Check-out until ${esc(tm.out)} · Thank you for staying with us</div></div>`;
}
function openReservation(b) {
  const fin = canFinance();
  const m = openModal(`<div class="sheet wide"><div class="sheet-h"><h2>ใบจองสำหรับแขก</h2><div class="spacer"></div>
      ${fin ? '<label class="chk"><input type="checkbox" id="rsvPrice" checked> แสดงราคา</label>' : ''}
      <button class="btn" id="rsvPdf">${icon('file')} PDF</button><button class="btn primary" id="rsvPrint">${icon('print')} พิมพ์</button><button class="btn ghost" data-close>✕</button></div>
    <div class="sheet-b"><div class="rsv-paper" id="rsvBody"></div></div></div>`);
  const $m = s => m.el.querySelector(s), price = () => fin && $m('#rsvPrice').checked;
  const draw = () => { $m('#rsvBody').innerHTML = reservationHtml(b, price()); };
  if (fin) $m('#rsvPrice').onchange = draw;
  $m('#rsvPrint').onclick = () => printHtml(reservationHtml(b, price()), false);
  $m('#rsvPdf').onclick = () => exportPdf(reservationHtml(b, price()), `Reservation_${(b.guest || 'guest').replace(/\s+/g, '_')}_${b.checkIn}`, false);
  draw();
}

/* ================= BOOKING CHANNELS ================= */
const COMP_CH = 'แขกรับรอง';
function channelStats(year) {
  const map = new Map();
  for (const b of allBookings()) {
    if (b.kind === 'block' || !isActive(b) || (year && b.checkIn.slice(0, 4) !== year)) continue;
    const k = compOf(b) ? COMP_CH : ((b.channel || '').trim() || 'ไม่ระบุช่องทาง');
    if (!map.has(k)) map.set(k, { name: k, list: [], guests: new Set(), nights: 0, rev: 0 });
    const c = map.get(k); c.list.push(b); c.guests.add(b.guestId || normName(b.guest)); c.nights += nightsOf(b); c.rev += totalOf(withFin(b));
  }
  return [...map.values()].sort((a, b) => b.list.length - a.list.length);
}
function renderChannels() {
  const box = $('#gChannels'); if (!box) return;
  const years = [...new Set(allBookings().filter(b => b.kind !== 'block').map(b => String(b.checkIn).slice(0, 4)))].sort().reverse();
  if (S.chYear == null) S.chYear = todayStr().slice(0, 4);
  const stats = channelStats(S.chYear), all = stats.reduce((s, c) => s + c.list.length, 0) || 1, fin = canStats();
  if (S.chSel && !stats.some(c => c.name === S.chSel)) S.chSel = null;
  let sel = stats.find(c => c.name === S.chSel), compChips = '';
  if (sel && sel.name === COMP_CH) {
    const gm = new Map(); sel.list.forEach(b => { const k = compGroup(compOf(b)); gm.set(k, (gm.get(k) || 0) + 1); });
    if (S.chComp && !gm.has(S.chComp)) S.chComp = '';
    compChips = `<div class="plan-filters comp-filter">${[['', sel.list.length], ...[...gm].sort((x, y) => y[1] - x[1])].map(([k, n]) => `<button class="chip" data-chcomp="${esc(k)}" aria-pressed="${k === (S.chComp || '')}">${esc(k || 'ทั้งหมด')} <b>${n}</b></button>`).join('')}</div>`;
    if (S.chComp) sel = { ...sel, list: sel.list.filter(b => compGroup(compOf(b)) === S.chComp) };
  }
  box.innerHTML = `<div class="row" style="margin-bottom:12px"><span class="hint">ปีที่เข้าพัก</span><select id="chYear" class="inline"><option value="">ทุกปี</option>${years.map(y => `<option${y === S.chYear ? ' selected' : ''}>${y}</option>`).join('')}</select><span class="hint">${money(all)} การจอง · กดที่ช่องทางเพื่อดูรายชื่อแขก</span></div>
    <div class="ch-grid">${stats.map(c => `<button class="ch-card${c.name === S.chSel ? ' on' : ''}${c.name === COMP_CH ? ' comp' : ''}" data-ch="${esc(c.name)}"><div class="ch-n">${esc(c.name)}</div><div class="ch-v">${money(c.list.length)}<small> การจอง</small></div>
      <div class="ch-bar"><i style="width:${Math.max(2, c.list.length / all * 100)}%"></i></div><div class="ch-s">${Math.round(c.list.length / all * 100)}% · แขก ${money(c.guests.size)} คน · ${money(c.nights)} คืน${fin && c.rev ? ` · ฿${money(c.rev)}` : ''}</div></button>`).join('') || '<div class="empty">ยังไม่มีการจองในปีนี้</div>'}</div>
    ${sel ? `<div class="card" style="margin-top:14px"><div class="card-head"><h3>${esc(sel.name)}${S.chComp && sel.name === COMP_CH ? ' · ' + esc(S.chComp) : ''} · ${money(sel.list.length)} การจอง</h3><div class="spacer"></div><button class="btn sm" id="chPdf">${icon('file')} PDF</button><button class="btn sm" id="chPrint">${icon('print')} พิมพ์รายชื่อ</button><button class="btn sm ghost" id="chClose">ปิด</button></div>${compChips}<div class="tw" id="chTable">${channelTable(sel)}</div></div>` : ''}`;
}
function channelTable(sel) {
  const rows = [...sel.list].sort((a, b) => a.checkIn < b.checkIn ? 1 : -1), cp = sel.name === COMP_CH;
  return `<table class="ch-t"><thead><tr><th>แขก</th>${cp ? '<th>ในนามของ / หัวข้อ</th><th>รายละเอียด</th>' : ''}<th>ห้อง</th><th>เข้า</th><th>ออก</th><th class="r">คืน</th><th>เลขที่จอง</th><th>สถานะ</th></tr></thead><tbody>${rows.map(b => `<tr class="click" data-id="${esc(b.id)}"><td>${esc(b.guest)}</td>${cp ? `<td>${esc(compGroup(compOf(b)))}</td><td>${esc(compOf(b).note || '')}</td>` : ''}<td class="rn">${esc(roomNo(b.roomId))}</td><td class="num">${fmtD(b.checkIn)}</td><td class="num">${fmtD(b.checkOut)}</td><td class="r num">${nightsOf(b)}</td><td class="num">${esc(b.ref || '—')}</td><td><span class="pill p-${b.status}">${STATUS[b.status] || ''}</span></td></tr>`).join('')}</tbody></table>`;
}
function bindChannels() {
  const box = $('#gChannels');
  box.addEventListener('change', e => { if (e.target.id === 'chYear') { S.chYear = e.target.value; S.chSel = null; renderChannels(); } });
  box.addEventListener('click', e => {
    const c = e.target.closest('[data-ch]'); if (c) { S.chComp = ''; S.chSel = S.chSel === c.dataset.ch ? null : c.dataset.ch; renderChannels(); const t = $('#chTable'); if (t) t.closest('.card').scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    const cc = e.target.closest('[data-chcomp]'); if (cc) { S.chComp = cc.dataset.chcomp; renderChannels(); return; }
    if (e.target.closest('#chClose')) { S.chSel = null; renderChannels(); return; }
    if (e.target.closest('#chPrint') || e.target.closest('#chPdf')) { const pdf = !!e.target.closest('#chPdf'); let sel = channelStats(S.chYear).find(x => x.name === S.chSel); if (sel && sel.name === COMP_CH && S.chComp) sel = { ...sel, name: COMP_CH, list: sel.list.filter(b => compGroup(compOf(b)) === S.chComp) }; if (sel) (pdf ? h => exportPdf(h, `Channel_${sel.name}_${S.chYear || 'all'}`) : printHtml)(`<div class="ih"><div class="ih-title">${esc(sel.name)}${sel.name === COMP_CH && S.chComp ? ' · ' + esc(S.chComp) : ''} · ${S.chYear || 'ทุกปี'} · ${sel.list.length} การจอง<span>${esc(settings().hotelName)}</span></div>${channelTable(sel).replace('class="ch-t"', 'class="ih-t"')}</div>`); return; }
    const tr = e.target.closest('tr[data-id]'); if (tr) { const b = M.bookings.get(tr.dataset.id); if (b) openBooking(b); }
  });
}

/* ================= DOCUMENTS ================= */
const DOC_CATS = ['ใบมัดจำ / ใบเสร็จ', 'สัญญาเช่า', 'แบบฟอร์มแขก', 'กฎระเบียบ', 'อื่นๆ'];
const fileIcon = n => /\.pdf$/i.test(n) ? 'PDF' : /\.(docx?|odt|rtf)$/i.test(n) ? 'DOC' : /\.(xlsx?|csv|ods)$/i.test(n) ? 'XLS' : /\.(png|jpe?g|gif|webp)$/i.test(n) ? 'IMG' : 'FILE';
const fmtSize = n => n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB';
function renderDocs() {
  const q = ($('#docQ').value || '').trim().toLowerCase(), cat = S.docCat || '';
  const files = [...M.files.values()].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  $('#docUpload').hidden = false;
  $('#docCats').innerHTML = ['', ...DOC_CATS].map(c => `<button class="chip" data-cat="${esc(c)}" aria-pressed="${c === cat}">${c || 'ทั้งหมด'} <b>${c ? files.filter(f => f.category === c).length : files.length}</b></button>`).join('');
  const list = files.filter(f => (!cat || f.category === cat) && (!q || [f.title, f.name, f.note].some(x => String(x || '').toLowerCase().includes(q))));
  $('#docList').innerHTML = list.length ? list.map(f => `<div class="doc" data-fid="${esc(f.id)}"><div class="doc-ic t-${fileIcon(f.name)}">${fileIcon(f.name)}</div>
      <div class="doc-m"><b>${esc(f.title || f.name)}</b><span>${esc(f.category || 'อื่นๆ')} · ${fmtSize(+f.size || 0)} · อัปโหลด ${f.createdAt ? fmtTime(f.createdAt) : ''} โดย ${esc(nameOf(f.createdBy))}</span>${f.note ? `<span>${esc(f.note)}</span>` : ''}</div>
      <div class="doc-a"><button class="btn sm primary" data-dact="open">${icon('print')} เปิด / พิมพ์</button><button class="btn sm" data-dact="save">ดาวน์โหลด</button><button class="btn sm ghost" data-dact="edit">แก้ไข</button></div></div>`).join('')
    : `<div class="empty">${files.length ? 'ไม่พบเอกสารที่ค้นหา' : 'ยังไม่มีเอกสาร · กด “อัปโหลดเอกสาร” เพื่อเพิ่มใบมัดจำ สัญญา หรือแบบฟอร์มต่างๆ'}</div>`;
}
async function fetchDoc(f) { toast('กำลังโหลดไฟล์…', 'info'); return Store.downloadFile(f.path, f.bucket || 'documents'); }
async function openDoc(f, mode) {
  try {
    const blob = await fetchDoc(f);
    if (mode === 'open' && window.bvDesktop && window.bvDesktop.openFile) { await window.bvDesktop.openFile(f.name, await blob.arrayBuffer()); toast('เปิดไฟล์ในโปรแกรมของเครื่องแล้ว สั่งพิมพ์จากหน้านั้นได้เลย'); return; }
    if (mode === 'open' && /^image\//.test(blob.type || '') ) { const url = URL.createObjectURL(blob); printHtml(`<img src="${url}" style="max-width:100%;max-height:270mm;display:block;margin:0 auto">`); return; }
    await downloadFile(f.name, blob);
  } catch (e) { console.error(e); toast(errMsg(e), 'err'); }
}
function openDocEdit(f) {
  const m = openModal(`<div class="sheet narrow"><div class="sheet-h"><h2>${f ? 'แก้ไขเอกสาร' : 'อัปโหลดเอกสาร'}</h2><div class="spacer"></div><button class="btn ghost" data-close>✕</button></div>
    <div class="sheet-b">
      ${f ? `<div class="hint">ไฟล์: ${esc(f.name)} · ${fmtSize(+f.size || 0)}</div>` : '<label class="f"><span>เลือกไฟล์ (PDF, Word, Excel หรือรูปภาพ · ไม่เกิน 20 MB)</span><input type="file" id="dfFile"></label>'}
      <label class="f"><span>ชื่อเอกสาร</span><input type="text" id="dfTitle" value="${esc(f?.title || '')}" placeholder="เช่น ใบรับเงินมัดจำ"></label>
      <label class="f"><span>หมวด</span><select id="dfCat">${DOC_CATS.map(c => `<option${c === (f?.category || DOC_CATS[0]) ? ' selected' : ''}>${c}</option>`).join('')}</select></label>
      <label class="f"><span>คำอธิบาย (ไม่บังคับ)</span><input type="text" id="dfNote" value="${esc(f?.note || '')}" placeholder="เช่น ใช้กับแขกรายเดือน"></label>
    </div>
    <div class="sheet-f">${f && isAdmin() ? '<button class="btn danger" id="dfDel">ลบเอกสาร</button>' : ''}<div class="spacer"></div><button class="btn" data-close>ยกเลิก</button><button class="btn primary" id="dfSave">${f ? 'บันทึก' : 'อัปโหลด'}</button></div></div>`);
  const v = id => m.el.querySelector('#' + id);
  if (!f) v('dfFile').onchange = e => { const x = e.target.files[0]; if (x && !v('dfTitle').value) v('dfTitle').value = x.name.replace(/\.[^.]+$/, ''); };
  v('dfSave').onclick = async () => {
    const meta = { title: v('dfTitle').value.trim(), category: v('dfCat').value, note: v('dfNote').value.trim() };
    if (f) { if (await save(() => Store.put('files', f.id, { ...f, ...meta, updatedAt: Date.now() }), 'บันทึกแล้ว')) m.close(); return; }
    const file = v('dfFile').files[0]; if (!file) return toast('เลือกไฟล์ก่อน', 'err');
    if (file.size > 20 * 1048576) return toast('ไฟล์ใหญ่เกิน 20 MB', 'err');
    const id = Store.newId(), safe = file.name.replace(/[^\w.\-]+/g, '_').slice(-80), path = `${id}/${safe}`;
    v('dfSave').disabled = true; v('dfSave').textContent = 'กำลังอัปโหลด…';
    try {
      await Store.uploadFile(path, file);
      await Store.put('files', id, { ...meta, title: meta.title || file.name, name: file.name, path, size: file.size, type: file.type || '', createdAt: Date.now(), createdBy: Store.me?.id });
      logAct(`อัปโหลดเอกสาร ${meta.title || file.name}`); toast('อัปโหลดแล้ว'); m.close();
    } catch (e) { console.error(e); toast(errMsg(e), 'err'); v('dfSave').disabled = false; v('dfSave').textContent = 'อัปโหลด'; }
  };
  if (f && v('dfDel')) v('dfDel').onclick = async () => {
    const b = v('dfDel'); if (!b.dataset.ok) { b.dataset.ok = 1; b.textContent = 'กดอีกครั้งเพื่อยืนยัน'; return; }
    try { await Store.del('files', f.id); await Store.removeFile(f.path).catch(() => {}); logAct(`ลบเอกสาร ${f.title || f.name}`); toast('ลบเอกสารแล้ว'); m.close(); } catch (e) { toast(errMsg(e), 'err'); }
  };
}
function bindDocs() {
  $('#docQ').addEventListener('input', renderDocs);
  $('#docUpload').onclick = () => openDocEdit(null);
  $('#docCats').addEventListener('click', e => { const c = e.target.closest('[data-cat]'); if (c) { S.docCat = c.dataset.cat; renderDocs(); } });
  $('#docList').addEventListener('click', e => { const b = e.target.closest('[data-dact]'); if (!b) return; const f = M.files.get(b.closest('[data-fid]').dataset.fid); if (!f) return;
    if (b.dataset.dact === 'edit') openDocEdit(f); else openDoc(f, b.dataset.dact); });
}

/* ================= TO-DO (left for the team) ================= */
const todoDone = id => M.tododone.get(id) || null;
function todosFor(d) {
  const all = [...M.todos.values()];
  const open = all.filter(t => !todoDone(t.id)?.done).sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999') || (b.prio === 'high') - (a.prio === 'high'));
  const done = all.filter(t => todoDone(t.id)?.done && String(todoDone(t.id).date || '') === d);
  return { open, done };
}
function renderTodos(d) {
  const el = $('#todoList'); if (!el) return;
  $('#todoAdd').hidden = !Store.me;
  const { open, done } = todosFor(d), me = Store.me?.id;
  { const c = $('#todoCount'), late = open.filter(t => t.due && t.due < d).length; c.hidden = !open.length; c.textContent = open.length; c.classList.toggle('red', !!late); }
  // compact chips: tick to finish, click the text to open it
  el.innerHTML = open.map(t => { const late = t.due && t.due < d;
    return `<div class="mchip${late ? ' late' : ''}${t.prio === 'high' ? ' high' : ''}" data-tid="${esc(t.id)}" title="${esc([t.detail, t.due ? 'ภายใน ' + fmtShort(t.due) : '', 'โดย ' + nameOf(t.createdBy)].filter(Boolean).join(' · '))}"><button class="mchip-ck" data-tdone aria-pressed="false" title="ทำเสร็จแล้ว">${icon('check')}</button><span data-tedit>${t.prio === 'high' ? '<b class="red">ด่วน</b> ' : ''}${esc(t.title)}${late ? ` <small class="red">เลยกำหนด</small>` : ''}</span></div>`; }).join('');
}
function openTodo(t) {
  const m = openModal(`<div class="sheet narrow"><div class="sheet-h"><h2>${t ? 'แก้ไขงาน' : 'ฝากงานใหม่'}</h2><div class="spacer"></div><button class="btn ghost" data-close>✕</button></div>
    <div class="sheet-b">
      <label class="f"><span>งาน *</span><input type="text" id="tdTitle" value="${esc(t?.title || '')}"></label>
      <label class="f"><span>รายละเอียด</span><textarea id="tdDetail" rows="3">${esc(t?.detail || '')}</textarea></label>
      <div class="fields"><label class="f"><span>ทำภายในวันที่</span><input type="date" id="tdDue" value="${esc(t?.due || S.day)}"></label>
      </div>
      <label class="chk"><input type="checkbox" id="tdHigh"${t?.prio === 'high' ? ' checked' : ''}> งานด่วน</label>
    </div>
    <div class="sheet-f">${t ? '<button class="btn danger" id="tdDel">ลบงาน</button>' : ''}<div class="spacer"></div><button class="btn" data-close>ยกเลิก</button><button class="btn primary" id="tdSave">บันทึก</button></div></div>`);
  const v = id => m.el.querySelector('#' + id);
  v('tdSave').onclick = async () => {
    const title = v('tdTitle').value.trim(); if (!title) return toast('ใส่ชื่องานก่อน', 'err');
    const id = t?.id || Store.newId();
    const data = { ...(t || { createdAt: Date.now(), createdBy: Store.me?.id }), title, detail: v('tdDetail').value.trim(), due: v('tdDue').value, prio: v('tdHigh').checked ? 'high' : 'normal', updatedAt: Date.now() };
    if (await save(() => Store.put('todos', id, data), t ? 'แก้ไขงานแล้ว' : 'ฝากงานแล้ว')) { logAct(`${t ? 'แก้ไข' : 'ฝาก'}งาน: ${title}`); m.close(); }
  };
  if (t) v('tdDel').onclick = async () => { if (await save(async () => { await Store.del('todos', t.id); if (M.tododone.has(t.id)) await Store.del('tododone', t.id); }, 'ลบงานแล้ว')) { logAct(`ลบงาน: ${t.title}`); m.close(); } };
}
function bindTodos() {
  $('#todoAdd').onclick = () => openTodo(null);
  $('#todoList').addEventListener('click', async e => {
    const it = e.target.closest('[data-tid]'); if (!it) return; const t = M.todos.get(it.dataset.tid); if (!t) return;
    if (e.target.closest('[data-tedit]')) return openTodo(t);
    if (e.target.closest('[data-tdone]')) { const was = !!todoDone(t.id)?.done;
      if (await save(() => Store.put('tododone', t.id, { done: !was, by: Store.me?.id, at: Date.now(), date: S.day }), was ? 'ยกเลิกว่าเสร็จแล้ว' : `เสร็จแล้ว: ${t.title}`)) logAct(`${was ? 'ยกเลิกว่าเสร็จ' : 'ทำเสร็จ'}: ${t.title}`); }
  });
}

/* ================= EXTRA BEDS & BABY COTS ================= */
/* ---- complimentary (guest of the house) ---- */
const COMP_HOST = 'ในนามของ';
const COMP_BASE = [COMP_HOST, 'Gift voucher', 'การกุศล / มัสยิด'];
const compOf = b => b && b.kind !== 'block' && b.comp && b.comp.on ? b.comp : null;
const compTypes = () => [...new Set([...COMP_BASE, ...(settings().compTypes || []), ...allBookings().map(b => compOf(b)?.type).filter(Boolean)])];
const compHosts = () => [...new Set([...allBookings().map(b => compOf(b)).filter(c => c && c.type === COMP_HOST && c.by).map(c => c.by)])];
const compLabel = c => !c ? '' : c.type === COMP_HOST ? `แขกของ${c.by ? ' ' + c.by : ''}` : (c.type || 'แขกรับรอง') + (c.by ? ' · ' + c.by : '');
const compEN = c => !c ? '' : 'Complimentary' + (c.type === COMP_HOST ? (c.by ? ' · guest of ' + c.by : '') : ' · ' + (c.type || '') + (c.by ? ' ' + c.by : ''));
/* ---- booking colours: the same colours reception used in the Excel chart ---- */
const CHAN_COLOR_DEFAULT = [[/booking/i, '#3C78D8'], [/expedia/i, '#FF9900'], [/agoda/i, '#EA9999'], [/trip/i, '#FFE599'], [/hotel ?beds?/i, '#93C47D'], [/biblio/i, '#9900FF'], [/walk|direct|e-?mail|โทร|whats ?app|line|phone|facebook/i, '#00FF00']];
// Excel legend colour → channel, only for the swatches in the sheet's own legend
const XCOLOR_CHAN = { '#3C78D8': 'Booking.com', '#FF9900': 'Expedia', '#00FF00': 'Direct', '#93C47D': 'Hotelbeds', '#EA9999': 'Agoda', '#FA6CF0': 'Agoda', '#9900FF': 'Biblio Globus', '#FFE599': 'Trip.com', '#FFD966': 'Trip.com', '#F6B26B': 'Trip.com' };
function chanColor(name) {
  if (!name) return '';
  const own = (settings().chanColors || {})[name]; if (own) return own;
  const d = CHAN_COLOR_DEFAULT.find(([re]) => re.test(name)); return d ? d[1] : '';
}
const barColor = b => b.kind === 'block' ? '' : (b.xcolor || chanColor(b.channel) || '');
// dark or light text so names stay readable on any fill
function inkOn(hex) { const h = String(hex).replace('#', ''); if (h.length !== 6) return '#fff'; const [r, g, b2] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(c => c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4); return 0.2126 * r + 0.7152 * g + 0.0722 * b2 > 0.36 ? '#14202a' : '#fff'; }
const xbedOf = b => !b || b.kind === 'block' ? 0 : (b.extraBeds != null ? Math.max(0, +b.extraBeds || 0) : (b.extraBed ? 1 : 0));
const cotOf = b => !b || b.kind === 'block' ? 0 : (b.babyCots != null ? Math.max(0, +b.babyCots || 0) : (b.babyCot ? 1 : 0));
const EQ = {
  xbed: { label: 'เตียงเสริม', en: 'Extra Bed', of: xbedOf, stock: () => Math.max(0, +(settings().extraBedStock ?? 6) || 0), cls: 's-confirmed' },
  cot: { label: 'เปลเด็ก', en: 'Baby Cot', of: cotOf, stock: () => Math.max(0, +(settings().babyCotStock ?? 3) || 0), cls: 's-cot' },
};
const eqUsers = (kind, ci, co, exceptId) => allBookings().filter(b => isActive(b) && b.id !== exceptId && EQ[kind].of(b) > 0 && b.checkIn < co && b.checkOut > ci);
const eqOnNight = (kind, d, list) => (list || eqUsers(kind, d, addDays(d, 1))).reduce((s, b) => s + (b.checkIn <= d && d < b.checkOut ? EQ[kind].of(b) : 0), 0);
// highest number in use on any night of [ci, co)
function equipPeak(kind, ci, co, exceptId) {
  if (!validD(ci) || !validD(co) || co <= ci) return 0;
  const list = eqUsers(kind, ci, co, exceptId); let peak = 0;
  for (let d = ci, i = 0; d < co && i < 400; d = addDays(d, 1), i++) peak = Math.max(peak, eqOnNight(kind, d, list));
  return peak;
}
function equipHint(o, exceptId) {
  if (!validD(o.checkIn) || !validD(o.checkOut) || o.checkOut <= o.checkIn) return '';
  return Object.entries(EQ).map(([k, q]) => {
    const stock = q.stock(), free = Math.max(0, stock - equipPeak(k, o.checkIn, o.checkOut, exceptId)), want = q.of(o);
    return !free ? `<span class="owe">ไม่มี${q.label}ว่างช่วงนี้</span>` : want > free ? `<span class="owe">${q.label}: ต้องการ ${want} แต่ว่างแค่ ${free} จาก ${stock} ในบางคืน</span>` : `${q.label}ว่าง ${free} จาก ${stock}${want < free ? ` · เพิ่มได้อีก ${free - want}` : ' · ใช้ครบแล้ว'}`;
  }).join(' · ') + ' (ตลอดช่วงวันที่นี้)' + (() => { const ex = (ratesFor(o.checkIn.slice(0, 7)).data || {}).extras || {}; const p = [ex.xbed ? `เตียงเสริม ${money(ex.xbed)}` : '', ex.cot ? `เปล ${money(ex.cot)}` : ''].filter(Boolean); return p.length ? ` · ราคา ${p.join(', ')} บาท/คืน` : ''; })();
}
// give every booking its own unit numbers (#1, #2, …) so the chart reads like the old Excel sheet
function assignUnits(kind, from, to) {
  const q = EQ[kind], list = eqUsers(kind, from, to).sort((a, b) => a.checkIn < b.checkIn ? -1 : a.checkIn > b.checkIn ? 1 : String(a.id) < String(b.id) ? -1 : 1);
  const units = [];
  for (const b of list) {
    let need = q.of(b);
    for (let i = 0; need > 0; i++) {
      if (!units[i]) units[i] = [];
      if (units[i].every(x => x.checkOut <= b.checkIn || x.checkIn >= b.checkOut)) { units[i].push(b); need--; }
    }
  }
  return units;
}
function renderEquip() {
  if (!S.eqMonth) S.eqMonth = todayStr().slice(0, 7);
  const box = $('#eqScroll'), start = S.eqMonth + '-01', ms = parseD(start); ms.setUTCMonth(ms.getUTCMonth() + 1);
  const end = toStr(ms), N = diffDays(start, end), t = todayStr();
  $('#eqMonthLabel').textContent = ymLabel(S.eqMonth);
  const roomW = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--roomw')) || 104;
  const W = Math.max(34, Math.floor((box.clientWidth - roomW - 4) / N));
  box.style.setProperty('--cw', W + 'px');
  const days = Array.from({ length: N }, (_, i) => addDays(start, i));
  let dayrow = '', colsOv = '';
  days.forEach((d, k) => { const dow = parseD(d).getUTCDay(), we = dow === 0 || dow === 6, td = d === t;
    dayrow += `<div class="g-day${we ? ' we' : ''}${td ? ' td' : ''}" title="${fmtLong(d)}"><b>${parseD(d).getUTCDate()}</b>${DOW[dow]}</div>`;
    if (we || td) colsOv += `<div class="${td ? 'td' : 'we'}" style="left:${k * W}px"></div>`; });
  let rows = '', stats = '';
  for (const [k, q] of Object.entries(EQ)) {
    const stock = q.stock(), units = assignUnits(k, addDays(start, -62), end);
    const nRows = Math.max(stock, units.length);
    let overNights = 0, peak = 0;
    for (const d of days) { const n = eqOnNight(k, d); peak = Math.max(peak, n); if (n > stock) overNights++; }
    const tonight = eqOnNight(k, t);
    stats += `<div class="stat"><span>${q.label}ที่ใช้คืนนี้</span><b>${tonight} / ${stock}</b><small>${tonight > stock ? '<span class="owe">เกินจำนวนที่มี</span>' : `ว่าง ${stock - tonight} ตัว`}</small></div>
      <div class="stat"><span>${q.label} · สูงสุดในเดือนนี้</span><b>${peak}</b><small>${overNights ? `<span class="owe">เกิน ${overNights} คืน</span>` : 'ไม่เกินจำนวนที่มี'}</small></div>`;
    rows += `<div class="g-group">${q.label} (${q.en}) · มี ${stock} ตัว</div>`;
    if (!nRows) rows += `<div class="g-row"><div class="g-rh"><span class="ty">—</span></div><div class="g-lane" style="width:${N * W}px"><span class="hint" style="padding:8px">ยังไม่ได้ตั้งจำนวนที่ตั้งค่า</span></div></div>`;
    for (let i = 0; i < nRows; i++) {
      const over = i >= stock; let bars = '';
      for (const b of (units[i] || []).filter(b => b.checkIn < end && b.checkOut > start)) {
        const s = b.checkIn < start ? start : b.checkIn, e = b.checkOut > end ? end : b.checkOut;
        const left = diffDays(start, s) * W + (b.checkIn >= start ? W / 2 : 0), right = diffDays(start, e) * W + (b.checkOut <= end ? W / 2 : 0);
        const bw = Math.max(14, right - left - 3), label = `${b.guest} · ห้อง ${roomNo(b.roomId)}`;
        bars += `<div class="bk ${over ? 's-over' : q.cls}" data-id="${esc(b.id)}" style="left:${left + 1}px;width:${bw}px" title="${esc(`${label} · ${fmtD(b.checkIn)} → ${fmtD(b.checkOut)} · ${q.label} ${q.of(b)}`)}"><span class="nm">${esc(label)}</span></div>`;
      }
      rows += `<div class="g-row${over ? ' over' : ''}"><div class="g-rh"><span class="no">#${i + 1}</span><span class="ty">${over ? 'เกิน' : esc(q.en)}</span></div><div class="g-lane" style="width:${N * W}px">${bars}</div></div>`;
    }
  }
  $('#eqStats').innerHTML = stats;
  box.innerHTML = `<div class="g" style="width:calc(var(--roomw) + ${N * W}px)"><div class="g-head"><div class="g-corner">ตัวที่</div><div class="g-days"><div class="g-months"><div class="g-month" style="width:${N * W}px">${ymLabel(S.eqMonth)}</div></div><div class="g-dayrow">${dayrow}</div></div></div><div class="g-body"><div class="g-cols">${colsOv}</div>${rows}</div></div>`;
  const list = allBookings().filter(b => isActive(b) && (xbedOf(b) || cotOf(b)) && b.checkIn < end && b.checkOut > start).sort((a, b) => a.checkIn < b.checkIn ? -1 : 1);
  $('#eqCount').textContent = list.length ? `${list.length} การจอง` : '';
  $('#eqList').innerHTML = list.length ? `<table><thead><tr><th>ห้อง</th><th>แขก</th><th>เข้า</th><th>ออก</th><th class="r">เตียงเสริม</th><th class="r">เปลเด็ก</th></tr></thead><tbody>${list.map(b => `<tr class="click" data-id="${esc(b.id)}"><td class="rn">${esc(roomNo(b.roomId))}</td><td>${esc(b.guest)}</td><td class="num">${fmtD(b.checkIn)}</td><td class="num">${fmtD(b.checkOut)}</td><td class="r num">${xbedOf(b) || '—'}</td><td class="r num">${cotOf(b) || '—'}</td></tr>`).join('')}</tbody></table>`
    : '<div class="empty">เดือนนี้ยังไม่มีการจองที่ใช้เตียงเสริมหรือเปลเด็ก · ใส่จำนวนได้ในหน้าการจอง</div>';
}
function bindEquip() {
  const go = n => { S.eqMonth = ymAdd(S.eqMonth || todayStr().slice(0, 7), n); renderEquip(); };
  $('#eqPrev').onclick = () => go(-1); $('#eqNext').onclick = () => go(1); $('#eqToday').onclick = () => { S.eqMonth = todayStr().slice(0, 7); renderEquip(); };
  $('#eqScroll').addEventListener('click', e => { const bar = e.target.closest('.bk'); if (bar) { e.stopPropagation(); showStayCard(bar); } });
  $('#eqScroll').addEventListener('scroll', closePop, { passive: true });
  $('#eqList').addEventListener('click', e => { const tr = e.target.closest('tr[data-id]'); if (tr) { const b = M.bookings.get(tr.dataset.id); if (b) openBooking(b); } });
  let tm = null; window.addEventListener('resize', () => { clearTimeout(tm); tm = setTimeout(() => { if (S.page === 'equip') renderEquip(); }, 150); });
  $('#eqImportBtn').onclick = () => $('#eqFile').click();
  $('#eqFile').onchange = e => { const f = e.target.files[0]; e.target.value = ''; if (f) importEquipExcel(f); };
}

/* ----- import the old "Booking Extra bed & Baby cot" workbook ----- */
const EQ_MON = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
function parseEquipBook(wb) {
  const out = [];
  const lab = s => { const t = String(s || '').toLowerCase(), m = t.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/); if (!m) return null;
    const y = t.match(/(20\d\d)/) || t.match(/'\s*(\d\d)\b/) || t.match(/\b(\d\d)\s*$/); return y ? { m: EQ_MON.indexOf(m[1]), y: y[1].length === 2 ? 2000 + +y[1] : +y[1] } : null; };
  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name]; if (!ws || !ws['!ref']) continue;
    const R = XLSX.utils.decode_range(ws['!ref']);
    const cellOf = (r, c) => ws[XLSX.utils.encode_cell({ r, c })];
    const txt = (r, c) => { const x = cellOf(r, c); return x ? String(x.w ?? x.v ?? '').trim() : ''; };
    let colDate = null, kind = null;
    for (let r = R.s.r; r <= R.e.r; r++) {
      if (/date\s*\//i.test(txt(r, 1))) {
        const L = lab(txt(r, 1)); colDate = null; kind = null;
        for (let k = r + 1; L && k <= Math.min(R.e.r, r + 3); k++) {
          const v1 = cellOf(k, 1); if (!v1 || typeof v1.v !== 'number') continue;
          colDate = {}; let y = L.y, m = L.m, prev = 0;
          for (let c = 1; c <= R.e.c; c++) {
            const x = cellOf(k, c); let v = x && typeof x.v === 'number' ? x.v : null;
            if (v == null) { if (!txt(k, c) && !txt(k - 1, c)) break; v = prev + 1; } // e.g. a note typed over the day number
            if (v < prev) { m++; if (m > 11) { m = 0; y++; } }
            prev = v; const dim = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
            if (v >= 1 && v <= dim) colDate[c] = `${y}-${pad(m + 1)}-${pad(v)}`;
          }
          break;
        }
      }
      const a = txt(r, 0);
      if (/extra\s*bed/i.test(a)) kind = 'xbed';
      else if (/baby\s*cot/i.test(a)) kind = 'cot';
      else if (kind && colDate && /^\d+$/.test(a)) for (const c in colDate) { const t = txt(r, +c); if (t && t.replace(/\s/g, '')) out.push({ kind, unit: +a, date: colDate[c], text: t, sheet: name.trim() }); }
    }
  }
  return out;
}
const eqTokens = s => (String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').match(/[a-z฀-๿]{2,}/g) || []).filter(w => !['mr', 'mrs', 'ms', 'bf', 'rb', 'ro', 'bk', 'id', 'no', 'baht', 'night'].includes(w));
function matchEquip(entries) {
  const cache = new Map(), toks = b => { if (!cache.has(b.id)) cache.set(b.id, eqTokens(b.guest)); return cache.get(b.id); };
  const stays = allBookings().filter(b => isActive(b) && b.kind !== 'block');
  const res = new Map(), miss = [];
  for (const e of entries) {
    const first = String(e.text).split(/>|\n/)[0];
    const rm = first.match(/\bR\.?\s*(\d{1,2})\b/i) || first.match(/\bNo\.?\s*(\d{1,2})\b/i) || first.match(/#R\s*(\d{1,2})/i);
    const room = rm ? pad(+rm[1]) : null;
    const words = eqTokens(first.replace(/#\s*\d+/g, ' ').replace(/\bR\.?\s*\d{1,2}\b/gi, ' '));
    let best = null, bestS = 0;
    for (const tol of [0, 1, 3]) {
      for (const b of stays) {
        if (!(addDays(b.checkIn, -tol) <= e.date && e.date < addDays(b.checkOut, tol))) continue;
        const bt = toks(b); let s = 0;
        for (const w of words) { if (bt.includes(w)) s += 2; else if (w.length >= 4 && bt.some(x => x.length >= 4 && (x.startsWith(w.slice(0, 4)) || w.startsWith(x.slice(0, 4))))) s += 1; }
        if (room && roomNo(b.roomId) === room) s += 3;
        if (s > bestS || (s === bestS && best && Math.abs(diffDays(b.checkIn, e.date)) < Math.abs(diffDays(best.checkIn, e.date)))) { if (s > 0) { best = b; bestS = s; } }
      }
      if (bestS >= 2) break;
    }
    if (best && bestS >= 2) { const k = best.id; if (!res.has(k)) res.set(k, { b: best, xbed: new Set(), cot: new Set() }); res.get(k)[e.kind].add(e.unit); }
    else miss.push(e);
  }
  return { res, miss };
}
async function importEquipExcel(file) {
  let entries;
  try { entries = parseEquipBook(XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: false })); }
  catch (e) { console.error(e); return toast('อ่านไฟล์ไม่ได้ ตรวจว่าเป็นไฟล์ .xlsx', 'err'); }
  if (!entries.length) return toast('ไม่พบรายการเตียงเสริมหรือเปลเด็กในไฟล์นี้', 'err');
  const { res, miss } = matchEquip(entries);
  const list = [...res.values()].sort((a, b) => a.b.checkIn < b.b.checkIn ? -1 : 1);
  const changes = list.filter(x => x.xbed.size > xbedOf(x.b) || x.cot.size > cotOf(x.b));
  const m = openModal(`<div class="sheet"><div class="sheet-h"><h2>นำเข้าเตียงเสริม / เปลเด็ก</h2><div class="spacer"></div><button class="btn ghost" data-close>✕</button></div>
    <div class="sheet-b">
      <div class="notice">อ่านได้ ${entries.length} ช่อง · จับคู่กับการจองได้ ${entries.length - miss.length} ช่อง (${list.length} การจอง) · จะอัปเดต ${changes.length} การจอง</div>
      <div class="hint" style="margin:8px 0">ระบบจับคู่ชื่อในไฟล์กับชื่อแขกที่พักอยู่วันนั้น และนับจำนวนเตียงจากแถว #1 #2 … ถ้าการจองมีจำนวนมากกว่าอยู่แล้วจะไม่ลดลง</div>
      <div class="tw" style="max-height:34vh;overflow:auto"><table><thead><tr><th>ห้อง</th><th>แขก</th><th>เข้า → ออก</th><th class="r">เตียงเสริม</th><th class="r">เปลเด็ก</th></tr></thead><tbody>
      ${list.map(x => `<tr><td class="rn">${esc(roomNo(x.b.roomId))}</td><td>${esc(x.b.guest)}</td><td class="num">${fmtD(x.b.checkIn)} → ${fmtD(x.b.checkOut)}</td><td class="r num">${x.xbed.size || '—'}</td><td class="r num">${x.cot.size || '—'}</td></tr>`).join('')}</tbody></table></div>
      ${miss.length ? `<h3 style="margin:14px 0 6px">จับคู่ไม่ได้ ${miss.length} ช่อง</h3><div class="hint">ไม่พบแขกชื่อนี้ที่พักในวันนั้น ใส่จำนวนเองได้ในหน้าการจอง</div>
      <div class="tw" style="max-height:22vh;overflow:auto"><table><tbody>${miss.slice(0, 200).map(e => `<tr><td class="num">${fmtD(e.date)}</td><td>${EQ[e.kind].label} #${e.unit}</td><td>${esc(e.text)}</td></tr>`).join('')}</tbody></table></div>` : ''}
    </div>
    <div class="sheet-f"><div class="progress" hidden id="eqProg"><div></div></div><div class="spacer"></div><button class="btn" data-close>ยกเลิก</button><button class="btn primary" id="eqGo"${changes.length ? '' : ' disabled'}>บันทึก ${changes.length} การจอง</button></div></div>`);
  m.el.querySelector('#eqGo').onclick = async () => {
    const btn = m.el.querySelector('#eqGo'); btn.disabled = true; m.el.querySelector('#eqProg').hidden = false;
    const rows = changes.map(x => { const xb = Math.max(xbedOf(x.b), x.xbed.size), cb = Math.max(cotOf(x.b), x.cot.size);
      return { col: 'bookings', id: x.b.id, data: { ...x.b, extraBeds: xb, extraBed: xb > 0, babyCots: cb, babyCot: cb > 0 } }; });
    try {
      await Store.putMany(rows, (d, n) => { m.el.querySelector('#eqProg div').style.width = (d / n * 100) + '%'; });
      logAct(`นำเข้าเตียงเสริม/เปลเด็กจาก Excel ${rows.length} การจอง`); toast(`บันทึกแล้ว ${rows.length} การจอง`); m.close(); render();
    } catch (e) { toast(errMsg(e), 'err'); btn.disabled = false; }
  };
}

/* ================= IN HOUSE GUEST DAILY REPORT ================= */
const typeCode = r => !r ? '' : r.type === 'family' ? 'FMR' : /twin/i.test(r.bed || '') ? 'TWN' : 'DBL';
const fmtIH = s => { if (!validD(s)) return ''; const d = parseD(s); return `${pad(d.getUTCDate())} ${MON[d.getUTCMonth()]}'${String(d.getUTCFullYear()).slice(2)}`; };
const fmtIHLong = s => { const d = parseD(s); return `${pad(d.getUTCDate())} ${MON_FULL[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };
function inHouseData(d) {
  const act = allBookings().filter(isActive);
  const rows = activeRooms().map(r => {
    const here = act.filter(b => b.roomId === r.id && b.checkIn <= d && d < b.checkOut);
    const b = here.find(x => x.kind !== 'block'), blk = here.find(x => x.kind === 'block');
    if (!b) return { r, room: r.no, type: typeCode(r), remark: blk ? ('OOO' + (blk.reason ? ' · ' + blk.reason : '')) : '', state: blk ? 'ooo' : 'vacant' };
    const g = b.guestId ? M.guests.get(b.guestId) : null, w = String(b.guest || '').trim().split(/\s+/);
    let note = String(b.notes || '').replace(/\s+/g, ' ').trim();
    if (b.guest) note = note.split(String(b.guest).trim()).join(' ');
    note = note.replace(/\b(BF|RO)\b/gi, ' ').replace(/#\s*\d+/g, ' ').replace(/^[\s,/>.\-]+|[\s,/>.\-]+$/g, '').replace(/\s{2,}/g, ' ');
    const remark = [compOf(b) ? compEN(compOf(b)) : '', b.breakfast ? 'BF' : 'RO', xbedOf(b) ? `Extra bed ${xbedOf(b)}` : '', cotOf(b) ? `Baby cot ${cotOf(b)}` : '', note.length > 2 && normName(note) !== normName(b.guest) ? note.slice(0, 70) : ''].filter(Boolean).join(' / ');
    return { r, b, room: r.no, first: w[0] || '', last: w.slice(1).join(' '), type: typeCode(r), adult: +b.adults || '', child: +b.children || '', arr: fmtIH(b.checkIn), dep: fmtIH(b.checkOut),
      agent: [b.channel, b.ref].filter(Boolean).join(' '), nat: natCode(g?.nationality || b.nationality || ''), remark, state: b.checkIn === d ? 'arr' : 'in' };
  });
  const stays = act.filter(b => b.kind !== 'block'), byNo = (x, y) => x < y ? -1 : 1;
  const arrivals = stays.filter(b => b.checkIn === d).map(b => roomNo(b.roomId)).sort(byNo);
  const departures = stays.filter(b => b.checkOut === d).map(b => roomNo(b.roomId)).sort(byNo);
  const bf = dailyRows(d).filter(x => x.bf), bfPax = bf.reduce((s, x) => s + x.pax, 0);
  const inRooms = rows.filter(x => x.b), pax = inRooms.reduce((s, x) => s + (+x.b.adults || 0) + (+x.b.children || 0), 0);
  return { d, rows, arrivals, departures, bfPax, bfRooms: bf.length, inHouse: inRooms.length, pax, vacant: rows.filter(x => x.state === 'vacant').length, ooo: rows.filter(x => x.state === 'ooo').length,
    xbed: eqOnNight('xbed', d), cot: eqOnNight('cot', d) };
}
function inHouseHtml(x) {
  return `<div class="ih"><div class="ih-title">In House Date ${esc(fmtIHLong(x.d))}<span>${esc(settings().hotelName || '')}</span></div>
    <table class="ih-t"><thead><tr><th>Room</th><th>Name</th><th>Last Name</th><th>Type</th><th>Adult</th><th>Child</th><th>Arrival</th><th>Departure</th><th>Agent</th><th>National</th><th>Remark</th></tr></thead><tbody>
    ${x.rows.map(r => `<tr class="ih-${r.state}"${r.b ? ` data-id="${esc(r.b.id)}"` : ''}><td class="c"><b>${esc(r.room)}</b></td><td>${esc(r.first || '')}</td><td>${esc(r.last || '')}</td><td class="c">${r.type}</td><td class="c">${r.adult ?? ''}</td><td class="c">${r.child ?? ''}</td><td class="c">${r.arr || ''}</td><td class="c">${r.dep || ''}</td><td>${esc(r.agent || '')}</td><td class="c">${esc(r.nat || '')}</td><td>${esc(r.remark || '')}</td></tr>`).join('')}
    </tbody></table>
    <div class="ih-foot">
      <div><b>Check In</b><span>${x.arrivals.length ? esc(x.arrivals.join(', ')) : '—'}</span></div>
      <div><b>Check Out</b><span>${x.departures.length ? esc(x.departures.join(', ')) : '—'}</span></div>
      <div><b>Breakfast</b><span>${x.bfPax} pax · ${x.bfRooms} rooms</span></div>
      <div><b>In House</b><span>${x.inHouse} rooms · ${x.pax} pax</span></div>
      <div><b>Vacant</b><span>${x.vacant}</span></div>
      <div><b>OOO</b><span>${x.ooo}</span></div>
      <div><b>Extra bed / Baby cot</b><span>${x.xbed} / ${x.cot}</span></div>
    </div></div>`;
}
function openInHouse(d = todayStr()) {
  const m = openModal(`<div class="sheet wide"><div class="sheet-h"><h2>In House Guest</h2><div class="spacer"></div>
      <button class="btn sm" id="ihPrev">${icon('left')}</button><input type="date" id="ihDate" value="${d}" style="width:auto"><button class="btn sm" id="ihNext">${icon('right')}</button>
      <button class="btn" id="ihPdf">${icon('file')} PDF</button><button class="btn" id="ihPrint">${icon('print')} พิมพ์</button><button class="btn primary" id="ihXls">${icon('xls')} Excel</button><button class="btn ghost" data-close>✕</button></div>
    <div class="sheet-b" id="ihBody"></div></div>`);
  const $m = s => m.el.querySelector(s);
  const draw = () => { d = $m('#ihDate').value || todayStr(); $m('#ihBody').innerHTML = inHouseHtml(inHouseData(d)); labelDates(m.el); };
  $m('#ihDate').onchange = draw;
  $m('#ihPrev').onclick = () => { $m('#ihDate').value = addDays(d, -1); draw(); };
  $m('#ihNext').onclick = () => { $m('#ihDate').value = addDays(d, 1); draw(); };
  $m('#ihBody').addEventListener('click', e => { const tr = e.target.closest('tr[data-id]'); if (tr) { const b = M.bookings.get(tr.dataset.id); if (b) openBooking(b); } });
  $m('#ihPrint').onclick = () => printHtml(inHouseHtml(inHouseData(d)));
  $m('#ihPdf').onclick = () => exportPdf(inHouseHtml(inHouseData(d)), `In_House_Guest_${d}`);
  $m('#ihXls').onclick = () => exportInHouse(d);
  draw();
}
function setPrintRoot(html, landscape) {
  let p = document.getElementById('printRoot'); if (!p) { p = document.createElement('div'); p.id = 'printRoot'; document.body.appendChild(p); }
  let st = document.getElementById('pageStyle'); if (!st) { st = document.createElement('style'); st.id = 'pageStyle'; document.head.appendChild(st); }
  st.textContent = `@page{size:A4 ${landscape ? 'landscape' : 'portrait'};margin:9mm}`;
  p.innerHTML = html; document.body.classList.add('printing');
  return () => { document.body.classList.remove('printing'); p.innerHTML = ''; };
}
function printHtml(html, landscape = true) {
  if (window.bvDesktop && window.bvDesktop.print) {
    const done = setPrintRoot(html, landscape);
    setTimeout(async () => {
      try { const r = await window.bvDesktop.print(landscape);
        if (r && r.reason === 'noprinter') toast('คอมเครื่องนี้ยังไม่ได้ติดตั้งเครื่องพิมพ์ · กดปุ่ม PDF เพื่อบันทึกไฟล์แทน', 'err');
        else if (r && !r.ok && r.reason && !/cancel/i.test(r.reason)) toast('พิมพ์ไม่สำเร็จ: ' + r.reason + ' · ลองกดปุ่ม PDF แทน', 'err'); }
      catch (e) { toast('พิมพ์ไม่สำเร็จ · ลองกดปุ่ม PDF แทน', 'err'); } finally { done(); }
    }, 120);
    return;
  }
  const done = setPrintRoot(html, landscape);
  window.addEventListener('afterprint', done, { once: true });
  setTimeout(() => { try { window.print(); } catch { done(); } setTimeout(() => { if (!window.bvDesktop) { done(); toast('ถ้าหน้าต่างพิมพ์ไม่ขึ้น ให้กดปุ่ม PDF แล้วพิมพ์จากไฟล์ PDF แทน', 'info'); } }, 1500); }, 60);
}
// save anything printable as a PDF: native in the Windows app, rendered in the page elsewhere
async function exportPdf(html, name, landscape = true) {
  const file = name.replace(/[\\/:*?"<>|\s]+/g, '_').replace(/_+/g, '_') + '.pdf';
  if (window.bvDesktop && window.bvDesktop.savePdf) {
    const done = setPrintRoot(html, landscape);
    try { await new Promise(r => setTimeout(r, 120)); const ok = await window.bvDesktop.savePdf(file, landscape); if (ok) toast('บันทึก PDF แล้ว'); }
    catch (e) { toast('บันทึก PDF ไม่สำเร็จ: ' + (e.message || e), 'err'); } finally { done(); }
    return;
  }
  if (!window.html2canvas || !window.jspdf) return toast('สร้าง PDF จากหน้านี้ไม่ได้', 'err');
  toast('กำลังสร้าง PDF…', 'info');
  const stage = document.createElement('div'); stage.className = 'pdf-stage' + (landscape ? ' land' : ''); stage.innerHTML = html; document.body.appendChild(stage);
  try {
    await new Promise(r => setTimeout(r, 80));
    const canvas = await window.html2canvas(stage, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
    const pdf = new window.jspdf.jsPDF({ orientation: landscape ? 'l' : 'p', unit: 'mm', format: 'a4' });
    const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight(), m = 9, w = pw - m * 2, pageH = ph - m * 2;
    const pxPerMm = canvas.width / w, slice = Math.floor(pageH * pxPerMm);
    for (let y = 0, i = 0; y < canvas.height; y += slice, i++) {
      const c = document.createElement('canvas'); c.width = canvas.width; c.height = Math.min(slice, canvas.height - y);
      c.getContext('2d').drawImage(canvas, 0, y, canvas.width, c.height, 0, 0, canvas.width, c.height);
      if (i) pdf.addPage(); pdf.addImage(c.toDataURL('image/jpeg', 0.92), 'JPEG', m, m, w, c.height / pxPerMm);
    }
    await downloadFile(file, pdf.output('blob'));
  } catch (e) { console.error(e); toast('สร้าง PDF ไม่สำเร็จ', 'err'); } finally { stage.remove(); }
}
function exportInHouse(d) {
  const x = inHouseData(d);
  const aoa = [[`In House Date ${fmtIHLong(d)}`], ['Room', 'Name', 'Last Name', 'Type', 'Adult', 'Child', 'Arrival', 'Departure', 'Agent', 'National', 'Remark'],
    ...x.rows.map(r => [r.room, r.first || '', r.last || '', r.type, r.adult ?? '', r.child ?? '', r.arr || '', r.dep || '', r.agent || '', r.nat || '', r.remark || '']), [],
    ['Check In', x.arrivals.join(', ')], ['Check Out', x.departures.join(', ')], ['Breakfast', `${x.bfPax} pax`, `${x.bfRooms} rooms`],
    ['In House', `${x.inHouse} rooms`, `${x.pax} pax`], ['Vacant', x.vacant], ['OOO', x.ooo], ['Extra bed', x.xbed], ['Baby cot', x.cot]];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 10 } }];
  ws['!cols'] = [6, 14, 18, 6, 6, 6, 10, 10, 22, 9, 34].map(wch => ({ wch }));
  const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'In House');
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  downloadFile(`In_House_Guest_${d}.xlsx`, new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
}

// ----- automatic update notice (desktop installer only) -----
if (window.bvDesktop && window.bvDesktop.onUpdate) window.bvDesktop.onUpdate(info => {
  let el = document.getElementById('updBar');
  if (!el) { el = document.createElement('div'); el.id = 'updBar'; document.body.appendChild(el); }
  if (info.state === 'ready') {
    el.innerHTML = `<span>มีเวอร์ชันใหม่ ${esc(info.version)} พร้อมแล้ว</span><button class="btn primary sm" id="updGo">รีสตาร์ทเพื่ออัปเดต</button><button class="btn ghost sm" id="updLater">ภายหลัง</button>`;
    el.querySelector('#updGo').onclick = () => window.bvDesktop.restartToUpdate();
    el.querySelector('#updLater').onclick = () => { el.remove(); toast('จะอัปเดตเองตอนปิดโปรแกรม'); };
  } else el.innerHTML = `<span>กำลังดาวน์โหลดเวอร์ชันใหม่ ${esc(info.version)}…</span>`;
});
boot();

/* ================= ONE-WAY SYNC: Excel on Google Drive → app ================= */
// The head of reception works in the Excel sheet. Every few hours the desktop app downloads it and copies what
// changed there into the app. Nothing is ever written back to Excel.
// Rules: whatever the sheet changed wins (even if the app also changed it) · what only the app changed is kept,
// and every sync lists the stays where the app no longer matches the sheet, so the sheet can be brought up to date.
// The "Airport transfer service Schedule" tables in the sheet go into each guest's ride list.
const XS_EVERY = 30 * 60e3; // pull the sheet every 30 minutes
const xsDriveId = url => { const m = String(url || '').match(/\/d\/([\w-]{20,})/) || String(url || '').match(/[?&]id=([\w-]{20,})/); return m ? m[1] : ''; };
const xsHash = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
const xsSig = it => xsHash(JSON.stringify([it.kind, it.roomNo, it.checkIn, it.checkOut, it.kind === 'block' ? it.reason : it.guest, it.notes, it.color || '']));
const xsBase = b => ({ roomId: b.roomId, checkIn: b.checkIn, checkOut: b.checkOut, name: b.kind === 'block' ? (b.reason || '') : (b.guest || '') });
const xsSame = (x, y) => !!x && !!y && x.roomId === y.roomId && x.checkIn === y.checkIn && x.checkOut === y.checkOut && normName(x.name) === normName(y.name);
function xsStatusFor(ci, co) { const t = todayStr(); return co <= t ? 'checked_out' : ci < t ? 'checked_in' : 'confirmed'; }
const XS_F = { roomId: 'ห้อง', checkIn: 'วันเข้า', checkOut: 'วันออก', name: 'ชื่อ' };
// field by field: a field the sheet changed takes the sheet value; a field only the app changed stays and is reported
function xsMerge(b, v) {
  const cur = xsBase(b), base = b.xbase || null, eq = (f, x, y) => f === 'name' ? normName(x) === normName(y) : x === y;
  const m = { ...cur }, diff = [];
  for (const f of Object.keys(XS_F)) {
    if (eq(f, v[f], cur[f])) continue;
    if (!base || !eq(f, v[f], base[f])) m[f] = v[f]; else diff.push(XS_F[f]);
  }
  if (m.checkOut <= m.checkIn) { m.checkIn = v.checkIn; m.checkOut = v.checkOut; }
  return { m, diff, cur, changed: !xsSame(m, cur) };
}
const xsClashName = x => x.kind === 'block' ? (x.reason || 'ปิดห้อง') : (x.guest || '');
// turn the parsed sheet into a plan of changes (pure: no writes)
function xsPlan(items) {
  const byNo = new Map(roomsList().map(r => [r.no, r.id])), now = Date.now(), today = todayStr();
  const seen = new Set(), incoming = new Map();
  for (const it of items) { if (!byNo.has(it.roomNo)) continue; let id = `x${it.roomNo}_${it.checkIn}${it.kind === 'block' ? 'b' : ''}`; while (seen.has(id)) id += '_'; seen.add(id); incoming.set(id, it); }
  const fromSheet = new Map(); for (const b of M.bookings.values()) if (b.src === 'excel') fromSheet.set(b.xid || b.id, b);
  const lo = items.reduce((m, i) => !m || i.checkIn < m ? i.checkIn : m, ''), hi = items.reduce((m, i) => i.checkOut > m ? i.checkOut : m, '');
  const plan = { add: [], update: [], move: [], cancel: [], conflicts: [], same: 0 };
  const view = it => ({ kind: it.kind, roomId: byNo.get(it.roomNo), checkIn: it.checkIn, checkOut: it.checkOut, name: it.kind === 'block' ? it.reason : it.guest });
  const issue = (b, xid, sheet, why) => plan.conflicts.push({ kind: 'issue', id: b ? b.id : null, xid, sheet, app: b ? xsBase(b) : null, why });
  // stays that vanished from the sheet: moved (same guest, other room/date) or removed
  const gone = [...fromSheet].filter(([xid, b]) => !incoming.has(xid) && isActive(b) && !b.xgone && !b.xkeep && b.checkIn >= lo && b.checkOut <= hi);
  const fresh = [...incoming].filter(([xid]) => !fromSheet.has(xid));
  const usedGone = new Set(), pending = []; // pending = stays whose room/dates may change: checked for clashes at the end
  const take = (list, b, xid, it, v) => { const r = xsMerge(b, v);
    if (r.diff.length && r.cur.checkOut >= today) plan.conflicts.push({ kind: 'diff', id: b.id, xid, sheet: v, app: r.cur, why: `${r.diff.join(', ')} ในแอปไม่ตรงกับ Excel` });
    if (r.changed || list === plan.move) pending.push({ list, x: { b, xid, it, v: r.m, sheet: v } });
    else if (b.xsig !== xsSig(it) || !xsSame(b.xbase, v) || b.xid !== xid) plan.update.push({ b, xid, it, v: r.m, sheet: v, quiet: true });
    else plan.same++; };
  for (const [xid, it] of fresh) {
    const v = view(it), mv = it.kind === 'booking' && gone.find(([gx, b]) => !usedGone.has(gx) && b.kind === 'booking' && normName(b.guest) === normName(it.guest) && Math.abs(diffDays(b.checkIn, it.checkIn)) <= 21);
    if (mv) { usedGone.add(mv[0]); take(plan.move, mv[1], xid, it, v); continue; }
    // the same guest already typed into the app by hand → adopt that booking instead of making a second one
    const twin = it.kind === 'booking' && overlapping(v.roomId, v.checkIn, v.checkOut).find(x => x.src !== 'excel' && x.kind === 'booking' && normName(x.guest) === normName(it.guest));
    if (twin) { take(plan.move, twin, xid, it, v); continue; }
    pending.push({ list: plan.add, x: { xid, it, v, sheet: v } });
  }
  for (const [gx, b] of gone) {
    if (usedGone.has(gx)) continue;
    if (b.status === 'checked_in' || b.status === 'checked_out' || b.checkIn < today) issue(b, gx, null, 'ถูกลบออกจาก Excel แต่แขกเข้าพักแล้ว');
    else plan.cancel.push({ b });
  }
  for (const [xid, it] of incoming) {
    const b = fromSheet.get(xid); if (!b) continue;
    if (b.xgone) { const v = view(it); pending.push({ list: plan.update, x: { b, xid, it, v, sheet: v, back: true } }); continue; } // removed earlier, now back
    take(plan.update, b, xid, it, view(it));
  }
  // where every stay will sit after this sync; a change that would put two stays in one room on one night is held back
  const pos = new Map();
  for (const b of M.bookings.values()) if (isActive(b) && !b.xgone) pos.set(b.id, { roomId: b.roomId, checkIn: b.checkIn, checkOut: b.checkOut, b });
  for (const x of plan.cancel) pos.delete(x.b.id);
  for (const { x } of pending) pos.set(x.b ? x.b.id : x.xid, { roomId: x.v.roomId, checkIn: x.v.checkIn, checkOut: x.v.checkOut, b: x.b || { kind: x.it.kind, guest: x.it.guest, reason: x.it.reason } });
  const byRoom = new Map(); for (const [id, p] of pos) { if (!byRoom.has(p.roomId)) byRoom.set(p.roomId, []); byRoom.get(p.roomId).push([id, p]); }
  for (const { list, x } of pending) {
    const id = x.b ? x.b.id : x.xid, p = pos.get(id);
    const clash = (byRoom.get(p.roomId) || []).filter(([oid, o]) => oid !== id && o.checkIn < p.checkOut && p.checkIn < o.checkOut).map(([, o]) => o.b);
    if (!clash.length) { list.push(x); continue; }
    const why = `ใช้ห้อง/วันตาม Excel ไม่ได้ · ซ้อนกับ ${clash.slice(0, 2).map(xsClashName).join(', ')}${clash.length > 2 ? ` และอีก ${clash.length - 2}` : ''}`;
    if (!x.b) { issue(null, x.xid, x.sheet, why); continue; }
    const cur = xsBase(x.b); issue(x.b, x.xid, x.sheet, why);
    x.v = { ...x.v, roomId: cur.roomId, checkIn: cur.checkIn, checkOut: cur.checkOut }; // still take the name etc.
    if (!xsSame(x.v, cur) || x.back) list.push(x); else plan.update.push({ ...x, quiet: true, keepBase: true });
  }
  // stays typed into the app that the sheet does not have (from today on)
  for (const b of M.bookings.values()) if (b.src !== 'excel' && b.kind === 'booking' && isActive(b) && b.checkOut >= today && b.checkIn <= hi)
    plan.conflicts.push({ kind: 'diff', id: b.id, xid: 'app:' + b.id, sheet: null, app: xsBase(b), why: 'มีในแอปแต่ไม่มีใน Excel' });
  plan.lo = lo; plan.hi = hi; plan.at = now;
  return plan;
}
// docs to write for one stay coming from the sheet
function xsDoc(b, xid, it, v, sheet = v) {
  const now = Date.now(), d = b ? { ...b } : { createdAt: now, createdBy: Store.me?.id, src: 'excel', adults: 2, children: 0 };
  const xn = it.kind === 'block' ? (it.notes || '') : XP.redact(it.notes || '');
  // notes: a note the sheet changed wins; a note only rewritten in the app stays
  const notes = b && b.xnotes !== undefined && xn === b.xnotes ? b.notes : xn;
  Object.assign(d, { kind: it.kind, roomId: v.roomId, checkIn: v.checkIn, checkOut: v.checkOut, notes, xnotes: xn, xid, xsig: xsSig(it), xsyncAt: now, src: 'excel' });
  if (it.kind === 'block') { d.reason = v.name; if (!b) d.status = 'confirmed'; }
  else {
    d.guest = v.name; d.xcolor = it.color || d.xcolor || '';
    if (!d.channel) d.channel = it.channel || XCOLOR_CHAN[it.color] || '';
    if (!b || b.xgone) { d.status = xsStatusFor(v.checkIn, v.checkOut); if (!b) { d.breakfast = it.breakfast; d.rateType = it.rateType; } }
    else if (d.status !== 'checked_in' && d.status !== 'checked_out') d.breakfast = b.breakfast || it.breakfast;
  }
  if (b && b.xgone) d.xgone = false;
  d.xbase = { roomId: sheet.roomId, checkIn: sheet.checkIn, checkOut: sheet.checkOut, name: sheet.name };
  return d;
}

/* ---- airport transfer tables in the sheet ---- */
const xsTime = s => { const m = String(s || '').match(/(\d{1,2})\s*[:.]\s*(\d{2})/); if (!m) return ''; let h = +m[1]; if (/p\.?\s*m/i.test(s) && h < 12) h += 12; if (/a\.?\s*m/i.test(s) && h === 12) h = 0; return h > 23 ? '' : `${String(h).padStart(2, '0')}:${m[2]}`; };
const xsPax = v => typeof v === 'number' ? v : String(v || '').split('+').reduce((s, x) => s + (parseInt(x, 10) || 0), 0);
function xsDate(XLSX, v) {
  if (typeof v === 'number' && v > 30000) { const d = XLSX.SSF.parse_date_code(v); return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`; }
  const m = String(v || '').match(/^\s*(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/); if (!m) return '';
  const y = m[3].length === 2 ? '20' + m[3] : m[3]; return `${y}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
}
function xsTransfers(XLSX, wb) {
  const out = [];
  for (const sn of wb.SheetNames) {
    const ws = wb.Sheets[sn]; if (!ws || !ws['!ref']) continue;
    const R = XLSX.utils.decode_range(ws['!ref']), val = (r, c) => { const x = ws[XLSX.utils.encode_cell({ r, c })]; return x ? x.v : undefined; };
    for (let r = R.s.r; r <= R.e.r; r++) for (let c = R.s.c; c <= R.e.c; c++) {
      const t = val(r, c); if (typeof t !== 'string' || !/airport\s*transfer.*schedule/i.test(t)) continue;
      // header row: Date · Guest name · Pax · Flight details · Landing time · Departure time
      let hr = -1, heads = [];
      for (let rr = r + 1; rr <= Math.min(r + 3, R.e.r) && hr < 0; rr++) {
        const hs = []; for (let cc = c; cc <= Math.min(c + 40, R.e.c); cc++) { const h = String(val(rr, cc) || '').toLowerCase();
          const k = /date/.test(h) ? 'date' : /guest|name/.test(h) ? 'guest' : /pax|person/.test(h) ? 'pax' : /flight/.test(h) ? 'flight' : /land|arriv/.test(h) ? 'land' : /depart/.test(h) ? 'depart' : /remark|note/.test(h) ? 'note' : ''; if (k) hs.push({ c: cc, k }); }
        if (hs.some(h => h.k === 'date') && hs.some(h => h.k === 'guest')) { hr = rr; heads = hs; }
      }
      if (hr < 0) continue;
      const last = heads[heads.length - 1].c + 6, keyAt = cc => { let k = heads[0].k; for (const h of heads) if (h.c <= cc + 1) k = h.k; return k; };
      for (let rr = hr + 1, blank = 0; rr <= R.e.r && blank < 3; rr++) {
        const row = {}; let any = false;
        for (let cc = c; cc <= Math.min(last, R.e.c); cc++) { const v = val(rr, cc); if (v === undefined || String(v).trim() === '') continue; any = true; const k = keyAt(cc); (row[k] = row[k] || []).push(v); }
        if (!any) { blank++; continue; } blank = 0;
        if (row.guest && /airport\s*transfer/i.test(String(row.guest[0]))) break;
        const date = row.date ? xsDate(XLSX, row.date[0]) : ''; if (!date || !row.guest) continue;
        const txt = k => (row[k] || []).map(x => String(x).trim()).filter(Boolean);
        const land = txt('land').map(xsTime).find(Boolean) || '', dep = txt('depart').map(xsTime).find(Boolean) || '';
        const extra = [...txt('depart'), ...txt('land'), ...txt('note')].filter(s => !xsTime(s));
        out.push({ date, guest: txt('guest').join(' '), pax: xsPax(row.pax ? row.pax[0] : 0), flight: txt('flight').join(' · '), land, dep, note: extra.join(' · '), done: extra.some(s => /\bdone\b/i.test(s)) });
      }
    }
  }
  return out;
}
const xsTok = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[\/(].*$/, '').replace(/#\s*\d+/g, ' ').replace(/[^a-z฀-๿ ]+/g, ' ').split(/\s+/).filter(w => w.length >= 3);
const xsNear = (a, b) => { if (a === b) return true; if (Math.abs(a.length - b.length) > 1 || a.length < 5) return false; // one typo allowed
  let i = 0, j = 0, e = 0; while (i < a.length && j < b.length) { if (a[i] === b[j]) { i++; j++; continue; } if (++e > 1) return false; if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; } } return e + (a.length - i) + (b.length - j) <= 1; };
function xsMatchTx(t) {
  const tk = xsTok(t.guest); if (!tk.length) return null;
  const cands = [];
  for (const b of M.bookings.values()) {
    if (b.kind !== 'booking' || !isActive(b)) continue;
    const dIn = Math.abs(diffDays(b.checkIn, t.date)), dOut = Math.abs(diffDays(b.checkOut, t.date)); if (dIn > 2 && dOut > 2) continue;
    const bt = xsTok(b.guest); const score = tk.filter(w => bt.some(x => xsNear(w, x))).length; if (!score) continue;
    if (score < 2 && tk.length > 1 && bt.length > 1) continue; // one shared first name is not enough
    const type = t.land && !t.dep ? 'pickup' : t.dep && !t.land ? 'dropoff' : dIn <= dOut ? 'pickup' : 'dropoff';
    cands.push({ b, type, score: score + (Math.min(type === 'pickup' ? dIn : dOut, 2) === 0 ? 0.5 : 0) - Math.min(dIn, dOut) * 0.1 });
  }
  cands.sort((x, y) => y.score - x.score);
  if (!cands.length || (cands[1] && cands[1].score === cands[0].score && cands[1].b.id !== cands[0].b.id)) return null;
  return cands[0];
}
// rides from the sheet: the sheet decides date, time, flight, pax and type; driver, plate and status stay as set in the app
function xsTxPlan(list) {
  const rows = new Map(), unmatched = [], seenIds = new Set();
  let added = 0, changed = 0, removed = 0;
  const months = new Set(list.map(t => t.date.slice(0, 7)));
  const work = id => { if (!rows.has(id)) { const b = M.bookings.get(id); rows.set(id, { ...b, transfers: [...txOf(b)] }); } return rows.get(id); };
  for (const t of list) {
    const m = xsMatchTx(t); if (!m) { unmatched.push(t); continue; }
    const tid = 'xt' + xsHash(m.type + '|' + t.date + '|' + xsTok(t.guest).join(' ')), d = work(m.b.id); seenIds.add(tid);
    const time = m.type === 'pickup' ? (t.land || t.dep) : (t.dep || t.land);
    const old = d.transfers.find(x => x.id === tid);
    const fromSheet = { type: m.type, date: t.date, time, pax: t.pax || (m.b.adults || 0) + (m.b.children || 0), flight: t.flight, xnote: t.note };
    if (!old) {
      const nt = { ...txNew(m.type, t.date, fromSheet.pax, time), ...fromSheet, id: tid, note: t.note, src: 'excel', status: t.done ? 'done' : 'need' };
      nt.place = nt.type === 'pickup' ? nt.from : nt.to; d.transfers.push(nt); added++;
    } else {
      const nx = { ...old, ...fromSheet };
      if (old.xnote !== undefined && (old.note || '') !== (old.xnote || '') && t.note === old.xnote) nx.note = old.note; else nx.note = t.note; // keep a note rewritten in the app
      if (t.done && (old.status === 'need' || old.status === 'booked')) nx.status = 'done';
      if (JSON.stringify(nx) !== JSON.stringify(old)) { d.transfers[d.transfers.indexOf(old)] = nx; changed++; }
    }
  }
  // rides that were taken off the sheet (only in months the sheet still lists, and not already driven)
  for (const b of M.bookings.values()) for (const x of txOf(b)) if (x.src === 'excel' && !seenIds.has(x.id) && months.has(String(x.date).slice(0, 7)) && x.status !== 'done') {
    const d = work(b.id); d.transfers = d.transfers.filter(y => y.id !== x.id); removed++;
  }
  for (const [id, d] of rows) if (JSON.stringify(d.transfers) === JSON.stringify(txOf(M.bookings.get(id)))) rows.delete(id);
  return { rows: [...rows].map(([id, data]) => ({ col: 'bookings', id, data })), added, changed, removed, unmatched };
}
async function xsApply(plan, opts = {}) {
  const rows = [];
  for (const x of plan.add) { const id = x.xid; rows.push({ col: 'bookings', id, data: xsDoc(null, x.xid, x.it, x.v) }); if (x.it.kind === 'booking' && (x.it.rate || XP.redact(x.it.notes) !== String(x.it.notes).trim())) rows.push({ col: 'finance', id, data: { rate: x.it.rate || 0, paid: 0, srcNote: x.it.notes } }); }
  for (const x of plan.update.filter(x => x.quiet)) rows.push({ col: 'bookings', id: x.b.id, data: { ...x.b, src: 'excel', xid: x.xid, xsig: xsSig(x.it), xbase: x.keepBase && x.b.xbase ? x.b.xbase : { ...x.sheet }, xnotes: x.b.xnotes ?? x.b.notes ?? '', xcolor: x.it.color || x.b.xcolor || '', xsyncAt: Date.now() } });
  for (const x of [...plan.update.filter(x => !x.quiet), ...plan.move]) rows.push({ col: 'bookings', id: x.b.id, data: xsDoc(x.b, x.xid, x.it, x.v, x.sheet) });
  for (const x of plan.cancel) rows.push({ col: 'bookings', id: x.b.id, data: { ...x.b, status: 'cancelled', xgone: true, xsyncAt: Date.now() } });
  if (rows.length) await Store.putMany(rows, opts.onProgress);
  let tx = { added: 0, changed: 0, removed: 0, unmatched: [] };
  if (opts.transfers) { tx = xsTxPlan(opts.transfers); if (tx.rows.length) await Store.putMany(tx.rows); }
  const issues = plan.conflicts.filter(c => c.kind !== 'diff'), diffs = plan.conflicts.filter(c => c.kind === 'diff');
  const summary = { at: Date.now(), by: Store.me?.id, src: opts.src || 'manual', hash: opts.hash || '', added: plan.add.length, updated: plan.update.filter(x => !x.quiet).length, moved: plan.move.length, cancelled: plan.cancel.length, same: plan.same,
    conflicts: [...issues.slice(0, 100), ...diffs.slice(0, 200)].map(c => ({ ...c, at: Date.now() })), nIssues: issues.length, nDiffs: diffs.length,
    tx: { added: tx.added, changed: tx.changed, removed: tx.removed, unmatched: tx.unmatched.slice(0, 60) } };
  await Store.put('state', 'xlsync', { ...summary, running: null });
  const n = summary.added + summary.updated + summary.moved + summary.cancelled + tx.added + tx.changed + tx.removed;
  if (n) logAct(`ดึงข้อมูลจาก Excel: เพิ่ม ${summary.added} · แก้ ${summary.updated} · ย้าย ${summary.moved} · ยกเลิก ${summary.cancelled} · รถรับส่ง ${tx.added + tx.changed + tx.removed}`);
  return summary;
}
async function xsDownload() {
  const id = xsDriveId(settings().xlsxUrl); if (!id) throw new Error('ยังไม่ได้ใส่ลิงก์ไฟล์ Excel');
  if (!window.bvDesktop || !window.bvDesktop.fetchSheet) throw new Error('ดึงไฟล์อัตโนมัติได้เฉพาะในโปรแกรมที่ติดตั้งในคอม · ใช้ปุ่ม "เลือกไฟล์" แทน');
  return window.bvDesktop.fetchSheet(id);
}
async function xsRun(src = 'manual', file = null) {
  const st = M.state.get('xlsync') || {};
  if (src === 'auto' && st.running && Date.now() - st.running < 10 * 60e3) return null; // another PC is syncing right now
  if (src === 'auto') await Store.merge('state', 'xlsync', { running: Date.now(), runBy: Store.me?.id }).catch(() => {});
  try {
    const buf = file ? await file.arrayBuffer() : await xsDownload();
    const bytes = new Uint8Array(buf); let h = 5381; for (let i = 0; i < bytes.length; i += 7) h = ((h << 5) + h + bytes[i]) | 0; const hash = (h >>> 0).toString(36) + ':' + bytes.length;
    // even when the file did not change, run the check again: the app may have changed since
    const wb = XLSX.read(buf, { type: 'array', cellDates: false, cellStyles: true });
    const { items } = XP.extract(XLSX, wb);
    if (items.length < 50) throw new Error('อ่านไฟล์ได้น้อยผิดปกติ · ไม่ได้อัปเดตอะไร');
    let transfers = null; try { transfers = xsTransfers(XLSX, wb); } catch (e) { console.warn('transfer table', e); }
    return await xsApply(xsPlan(items), { src, hash, transfers });
  } catch (e) { await Store.merge('state', 'xlsync', { running: null, error: String(e.message || e), errorAt: Date.now() }).catch(() => {}); throw e; }
}
const xsMsg = r => `ดึงจาก Excel แล้ว · เพิ่ม ${r.added} · แก้ ${r.updated} · ย้าย ${r.moved} · ยกเลิก ${r.cancelled}${r.tx && (r.tx.added + r.tx.changed) ? ` · รถรับส่ง ${r.tx.added + r.tx.changed}` : ''}${r.nDiffs ? ` · ไม่ตรงกับ Excel ${r.nDiffs}` : ''}`;
let xsStarted = false;
function xsAutoStart() {
  if (xsStarted || !window.bvDesktop || !window.bvDesktop.fetchSheet) return; xsStarted = true;
  const tick = () => { const s = settings(), st = M.state.get('xlsync') || {}; if (!s.xlsxAuto || !xsDriveId(s.xlsxUrl) || !Store.online) return;
    if (Date.now() - (st.at || 0) < XS_EVERY) return;
    xsRun('auto').then(r => { if (r && (r.added || r.updated || r.moved || r.cancelled || (r.tx && r.tx.added + r.tx.changed))) { toast(xsMsg(r)); pushNotif('excel', null, null, xsMsg(r).replace('ดึงจาก Excel แล้ว · ', '')); } }).catch(e => { console.warn('excel sync', e); if (isAdmin()) toast('ดึงข้อมูลจาก Excel ไม่สำเร็จ: ' + errMsg(e), 'err'); }); };
  setTimeout(tick, 15000); setInterval(tick, 5 * 60e3);
}
function renderXsCard() {
  const box = $('#xsCard'); if (!box) return;
  const s = settings(), st = M.state.get('xlsync') || {}, admin = isAdmin(), cf = st.conflicts || [], tx = st.tx || {};
  if (!box.contains(document.activeElement)) { $('#xsUrl').value = s.xlsxUrl || ''; $('#xsAuto').checked = !!s.xlsxAuto; }
  $('#xsUrl').disabled = $('#xsAuto').disabled = !admin; $('#xsSaveCfg').hidden = !admin;
  $('#xsStatus').innerHTML = st.at ? `ดึงล่าสุด ${fmtTime(st.at)} โดย ${esc(nameOf(st.by))} · เพิ่ม ${st.added || 0} · แก้ ${st.updated || 0} · ย้าย ${st.moved || 0} · ยกเลิก ${st.cancelled || 0} · รถรับส่ง เพิ่ม ${tx.added || 0} แก้ ${tx.changed || 0}`
    + (st.error && (st.errorAt || 0) > (st.at || 0) ? `<div class="owe">ดึงไม่สำเร็จ ${fmtTime(st.errorAt)}: ${esc(st.error)}</div>` : '') : 'ยังไม่เคยดึงข้อมูล';
  const fmt = x => x ? `ห้อง ${esc(roomNo(x.roomId))} · ${esc(x.name || '')} · ${fmtShort(x.checkIn)} → ${fmtShort(x.checkOut)}` : '—';
  const row = c => `<tr><td>${esc(c.why)}</td><td>${fmt(c.sheet)}</td><td>${fmt(c.app)}</td><td class="r">${c.id ? `<button class="btn sm" data-xsopen="${esc(c.id)}">เปิด</button>` : ''}${c.sheet && c.id ? ` <button class="btn sm" data-xsuse="${esc(c.xid)}">ใช้ตาม Excel</button>` : ''}${c.kind !== 'diff' && !c.sheet && c.id ? ` <button class="btn sm ghost" data-xsok="${esc(c.xid)}">เก็บไว้ในแอป</button>` : ''}</td></tr>`;
  const tbl = (title, list, more) => list.length ? `<h4 style="margin:14px 0 6px">${title}</h4>${more || ''}<div class="tw"><table><thead><tr><th>เรื่อง</th><th>ใน Excel</th><th>ในแอปตอนนี้</th><th></th></tr></thead><tbody>${list.map(row).join('')}</tbody></table></div>` : '';
  const diffs = cf.filter(c => c.kind === 'diff'), issues = cf.filter(c => c.kind !== 'diff'), um = tx.unmatched || [];
  $('#xsConflicts').innerHTML = (diffs.length ? '' : st.at ? '<div class="hint" style="margin-top:10px">✓ ข้อมูลในแอปตรงกับ Excel</div>' : '')
    + tbl(`ในแอปไม่ตรงกับ Excel ${st.nDiffs || diffs.length} รายการ`, diffs, '<div class="hint">มีการแก้ในแอปที่ Excel ยังไม่มี · ให้หัวหน้า reception อัปเดตใน Excel หรือกด "ใช้ตาม Excel" เพื่อเปลี่ยนแอปกลับ</div>')
    + tbl(`อัปเดตจาก Excel ไม่ได้ ${st.nIssues || issues.length} รายการ`, issues)
    + (um.length ? `<h4 style="margin:14px 0 6px">รถรับส่งใน Excel ที่หาการจองไม่เจอ ${um.length} รายการ</h4><div class="hint">ชื่อใน Excel ไม่ตรงกับแขกที่เข้าหรือออกวันนั้น · เพิ่มเองในการจองของแขก</div><div class="tw"><table><thead><tr><th>วันที่</th><th>ชื่อ</th><th>คน</th><th>เที่ยวบิน</th><th>ถึง / ออก</th></tr></thead><tbody>${um.map(t => `<tr><td>${fmtShort(t.date)}</td><td>${esc(t.guest)}</td><td>${t.pax || ''}</td><td>${esc(t.flight || '')}</td><td>${esc(t.land ? 'ถึง ' + t.land : t.dep ? 'ออก ' + t.dep : '')}</td></tr>`).join('')}</tbody></table></div>` : '');
}
function bindXsCard() {
  const box = $('#xsCard'); if (!box) return;
  $('#xsSaveCfg').onclick = async () => { const url = $('#xsUrl').value.trim(); if (url && !xsDriveId(url)) return toast('ลิงก์ไม่ถูกต้อง · ใช้ลิงก์จาก Google Drive / Google Sheets', 'err');
    if (await save(() => Store.merge('settings', 'main', { xlsxUrl: url, xlsxAuto: $('#xsAuto').checked }), 'บันทึกการตั้งค่าแล้ว')) renderXsCard(); };
  const go = async file => { const b = $('#xsNow'); b.disabled = true; b.classList.add('spin');
    try { const r = await xsRun('manual', file); toast(xsMsg(r)); }
    catch (e) { toast(errMsg(e), 'err'); } finally { b.disabled = false; b.classList.remove('spin'); renderXsCard(); } };
  $('#xsNow').onclick = () => go(null);
  $('#xsFile').onchange = e => { const f = e.target.files[0]; e.target.value = ''; if (f) go(f); };
  box.addEventListener('click', async e => {
    const o = e.target.closest('[data-xsopen]'); if (o) { const b = M.bookings.get(o.dataset.xsopen); if (b) openBooking(b); return; }
    const drop = async xid => { const st = M.state.get('xlsync') || {}; const left = (st.conflicts || []).filter(c => c.xid !== xid);
      await Store.put('state', 'xlsync', { ...st, conflicts: left, nDiffs: left.filter(c => c.kind === 'diff').length, nIssues: left.filter(c => c.kind !== 'diff').length }); renderXsCard(); };
    const k = e.target.closest('[data-xsok]'); if (k) { const st = M.state.get('xlsync') || {}, c = (st.conflicts || []).find(x => x.xid === k.dataset.xsok); const b = c && c.id && M.bookings.get(c.id);
      if (b) await Store.merge('bookings', b.id, { xkeep: true, xsyncAt: Date.now() }).catch(() => {});
      await drop(k.dataset.xsok); toast('เก็บการจองนี้ไว้ในแอป'); return; }
    const u = e.target.closest('[data-xsuse]'); if (u) { const st = M.state.get('xlsync') || {}, c = (st.conflicts || []).find(x => x.xid === u.dataset.xsuse); const b = c && M.bookings.get(c.id); if (!b || !c.sheet) return;
      const sh = c.sheet, clash = overlapping(sh.roomId, sh.checkIn, sh.checkOut, b.id);
      if (clash.length) return toast(`ห้อง ${roomNo(sh.roomId)} ไม่ว่าง · ซ้อนกับ ${clash.map(xsClashName).join(', ')}`, 'err');
      if (await save(() => Store.merge('bookings', b.id, { roomId: sh.roomId, checkIn: sh.checkIn, checkOut: sh.checkOut, ...(b.kind === 'block' ? { reason: sh.name } : { guest: sh.name }), xbase: { roomId: sh.roomId, checkIn: sh.checkIn, checkOut: sh.checkOut, name: sh.name }, xsyncAt: Date.now() }), 'ใช้ข้อมูลตาม Excel แล้ว')) await drop(c.xid); }
  });
}

/* ================= REPAIRS (แจ้งซ่อม) ================= */
// Stored in the shared docs table as col = 'repairs' (Supabase view public.repairs shows them as a table).
// Each change is kept in `history`, so a LINE bot can later be told about new reports and status changes.
const RP_CATS = ['แอร์', 'ไฟฟ้า / หลอดไฟ', 'ประปา / น้ำ', 'ห้องน้ำ / สุขภัณฑ์', 'เฟอร์นิเจอร์ / ประตู', 'ทีวี / Wi-Fi', 'เครื่องใช้ไฟฟ้า', 'สระว่ายน้ำ / สวน', 'อื่นๆ'];
const RP_STATUS = { open: 'รอซ่อม', doing: 'กำลังซ่อม', done: 'ซ่อมเสร็จ', cancelled: 'ยกเลิก' };
const RP_PILL = { open: 'p-bad', doing: 'p-tentative', done: 'p-confirmed', cancelled: 'p-checked_out' };
const RP_PLACES = ['ล็อบบี้ / Reception', 'ห้องอาหาร', 'ครัว', 'สระว่ายน้ำ', 'สวน / ทางเดิน', 'ที่จอดรถ', 'ห้องซักรีด', 'ห้องพนักงาน'];
const rpList = () => [...(M.repairs || new Map()).values()].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
const rpOpen = () => rpList().filter(r => r.status === 'open' || r.status === 'doing');
const rpWhere = r => r.roomId ? `ห้อง ${roomNo(r.roomId)}` : (r.place || '—');
const rpNo = r => 'R' + String(r.no || 0).padStart(4, '0');
function rpNextNo() { return rpList().reduce((m, r) => Math.max(m, +r.no || 0), 0) + 1; }
function renderRepairs() {
  const el = $('#rpList'); if (!el) return;
  const f = S.rpFilter || 'active', q = ($('#rpQ').value || '').trim().toLowerCase(), all = rpList();
  const count = k => k === 'active' ? all.filter(r => r.status === 'open' || r.status === 'doing').length : k === 'all' ? all.length : all.filter(r => r.status === k).length;
  $('#rpChips').innerHTML = [['active', 'ยังไม่เสร็จ'], ['open', 'รอซ่อม'], ['doing', 'กำลังซ่อม'], ['done', 'ซ่อมเสร็จ'], ['all', 'ทั้งหมด']].map(([k, l]) => `<button class="chip" data-rpf="${k}" aria-pressed="${f === k}">${l} <b>${count(k)}</b></button>`).join('');
  const list = all.filter(r => (f === 'all' || (f === 'active' ? r.status === 'open' || r.status === 'doing' : r.status === f)) && (!q || [r.title, r.detail, r.category, rpWhere(r), r.tech, rpNo(r)].some(x => String(x || '').toLowerCase().includes(q))));
  el.innerHTML = list.length ? list.map(r => `<div class="rp-item st-${esc(r.status)}${r.urgent ? ' urgent' : ''}" data-rid="${esc(r.id)}">
      <div class="rp-where"><b>${esc(rpWhere(r))}</b><span class="mono">${rpNo(r)}</span></div>
      <div class="rp-main"><b>${r.urgent ? '<span class="pill p-bad">ด่วน</span> ' : ''}${esc(r.title)}</b>
        <span>${esc(r.category || '')}${r.detail ? ' · ' + esc(r.detail) : ''}</span>
        <small>แจ้งโดย ${esc(nameOf(r.reportedBy))} ${fmtTime(r.createdAt)}${r.tech ? ' · ช่าง ' + esc(r.tech) : ''}${r.status === 'done' && r.doneAt ? ' · เสร็จ ' + fmtTime(r.doneAt) : ''}${(r.photos || []).length ? ` · 📷 ${r.photos.length}` : ''}</small></div>
      <span class="pill ${RP_PILL[r.status] || ''}">${RP_STATUS[r.status] || r.status}</span></div>`).join('')
    : `<div class="empty">${f === 'active' ? 'ไม่มีงานซ่อมค้าง ✓' : 'ไม่มีรายการ'}</div>`;
}
function renderRepairCard() { // compact chips on the daily page
  const el = $('#dlRepairs'); if (!el) return; const open = rpOpen();
  { const c = $('#dlRpCount'); c.hidden = !open.length; c.textContent = open.length; c.classList.toggle('red', open.some(r => r.urgent)); }
  el.innerHTML = open.slice(0, 8).map(r => `<div class="mchip rp st-${esc(r.status)}${r.urgent ? ' high' : ''}" data-rid="${esc(r.id)}" title="${esc(RP_STATUS[r.status] + (r.category ? ' · ' + r.category : '') + (r.detail ? ' · ' + r.detail : ''))}"><i class="dot"></i><span>${r.urgent ? '<b class="red">ด่วน</b> ' : ''}${esc(rpWhere(r))} · ${esc(r.title)}</span></div>`).join('') + (open.length > 8 ? `<button class="mchip more" data-gorp>+${open.length - 8}</button>` : '');
  const nb = $('#navRepairs'); if (nb) { nb.hidden = !open.length; nb.textContent = open.length; }
}
function openRepair(r, preset = {}) {
  const isNew = !r, d = r || { status: 'open', roomId: preset.roomId || '', place: '', category: '', urgent: false, photos: [] };
  const rooms = roomsList();
  let photos = (d.photos || []).slice();
  const m = openModal(`<div class="sheet narrow"><div class="sheet-h"><h2>${isNew ? 'แจ้งซ่อม' : 'งานซ่อม ' + rpNo(d)}</h2><div class="spacer"></div><button class="btn ghost" data-close>✕</button></div>
    <div class="sheet-b">
      <div class="fields"><label class="f"><span>ห้อง</span><select id="rpRoom"><option value="">— ไม่ใช่ห้องพัก —</option>${rooms.map(x => `<option value="${esc(x.id)}"${x.id === d.roomId ? ' selected' : ''}>ห้อง ${esc(x.no)}</option>`).join('')}</select></label>
        <label class="f" id="rpPlaceF"><span>สถานที่</span><input type="text" id="rpPlace" list="rpPlaces" value="${esc(d.place || '')}"><datalist id="rpPlaces">${RP_PLACES.map(p => `<option value="${esc(p)}">`).join('')}</datalist></label></div>
      <label class="f"><span>ประเภท</span><select id="rpCat"><option value="">เลือกประเภท</option>${RP_CATS.map(c => `<option${c === d.category ? ' selected' : ''}>${esc(c)}</option>`).join('')}</select></label>
      <label class="f"><span>อะไรเสีย *</span><input type="text" id="rpTitle" value="${esc(d.title || '')}"></label>
      <label class="f"><span>รายละเอียด</span><textarea id="rpDetail" rows="3">${esc(d.detail || '')}</textarea></label>
      <label class="chk"><input type="checkbox" id="rpUrgent"${d.urgent ? ' checked' : ''}> ด่วน</label>
      <div class="f"><span>รูปถ่าย</span><div class="rp-photos" id="rpPhotos"></div><label class="btn sm" style="align-self:flex-start">${icon('upload')} เพิ่มรูป<input type="file" id="rpFile" accept="image/*" multiple hidden></label></div>
      ${isNew ? '' : `<hr><div class="fields"><label class="f"><span>สถานะ</span><select id="rpStatus">${Object.entries(RP_STATUS).map(([k, l]) => `<option value="${k}"${k === d.status ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
        <label class="f"><span>ช่าง / ผู้รับผิดชอบ</span><input type="text" id="rpTech" value="${esc(d.tech || '')}"></label></div>
        <div class="fields"><label class="f"><span>ค่าใช้จ่าย (บาท)</span><input type="number" id="rpCost" min="0" value="${d.cost || ''}"></label><label class="f"><span>ซ่อมอะไรไป</span><input type="text" id="rpFix" value="${esc(d.fixNote || '')}"></label></div>
        <div class="rp-hist">${(d.history || []).map(h => `<div><span class="mono">${fmtTime(h.at)}</span> ${esc(nameOf(h.by))} · ${esc(h.text)}</div>`).join('')}</div>`}
    </div>
    <div class="sheet-f">${!isNew && isAdmin() ? '<button class="btn danger" id="rpDel">ลบ</button>' : ''}<div class="spacer"></div><button class="btn" data-close>ยกเลิก</button><button class="btn primary" id="rpSave">${isNew ? 'แจ้งซ่อม' : 'บันทึก'}</button></div></div>`);
  const v = id => m.el.querySelector('#' + id);
  const syncPlace = () => { v('rpPlaceF').hidden = !!v('rpRoom').value; }; v('rpRoom').onchange = syncPlace; syncPlace();
  const rid = d.id || Store.newId();
  const drawPhotos = () => { v('rpPhotos').innerHTML = photos.map((p, i) => `<div class="rp-ph"><button class="btn sm ghost" data-phopen="${i}">${esc(p.name)}</button><button class="btn sm ghost" data-phdel="${i}" title="ลบ">✕</button></div>`).join('') || '<span class="hint">ยังไม่มีรูป</span>'; };
  drawPhotos();
  v('rpFile').onchange = async e => { const files = [...e.target.files]; e.target.value = '';
    for (const file of files) { if (file.size > 15 * 1048576) { toast(`${file.name} ใหญ่เกิน 15 MB`, 'err'); continue; }
      const path = `repairs/${rid}/${Date.now().toString(36)}_${file.name.replace(/[^\w.\-]+/g, '_').slice(-60)}`;
      try { toast('กำลังอัปโหลดรูป…', 'info'); await Store.uploadFile(path, file, 'attachments'); photos.push({ path, name: file.name, size: file.size, type: file.type || '', at: Date.now(), by: Store.me?.id }); drawPhotos(); }
      catch (er) { toast(errMsg(er), 'err'); } } };
  v('rpPhotos').addEventListener('click', e => { const o = e.target.closest('[data-phopen]'); if (o) { const p = photos[+o.dataset.phopen]; if (p) openDoc({ ...p, bucket: 'attachments' }, 'open'); return; }
    const x = e.target.closest('[data-phdel]'); if (x) { const p = photos.splice(+x.dataset.phdel, 1)[0]; drawPhotos(); if (p) Store.removeFile(p.path, 'attachments').catch(() => {}); } });
  v('rpSave').onclick = async () => {
    const title = v('rpTitle').value.trim(); if (!title) return toast('ใส่ว่าอะไรเสียก่อน', 'err');
    const roomId = v('rpRoom').value, place = roomId ? '' : v('rpPlace').value.trim(); if (!roomId && !place) return toast('เลือกห้องหรือใส่สถานที่', 'err');
    const now = Date.now(), me = Store.me?.id, hist = (d.history || []).slice();
    const data = { ...d, roomId, place, category: v('rpCat').value, title, detail: v('rpDetail').value.trim(), urgent: v('rpUrgent').checked, photos, updatedAt: now, updatedBy: me };
    if (isNew) Object.assign(data, { no: rpNextNo(), status: 'open', reportedBy: me, createdAt: now }), hist.push({ at: now, by: me, status: 'open', text: 'แจ้งซ่อม' });
    else {
      const st = v('rpStatus').value; Object.assign(data, { status: st, tech: v('rpTech').value.trim(), cost: +v('rpCost').value || 0, fixNote: v('rpFix').value.trim() });
      if (st !== d.status) { hist.push({ at: now, by: me, status: st, text: RP_STATUS[st] + (data.fixNote && st === 'done' ? ' · ' + data.fixNote : '') }); if (st === 'done') Object.assign(data, { doneAt: now, doneBy: me }); }
    }
    data.history = hist; delete data.id;
    if (await save(() => Store.put('repairs', rid, data), isNew ? `แจ้งซ่อมแล้ว · ${rpNo(data)}` : 'บันทึกแล้ว')) { logAct(`${isNew ? 'แจ้งซ่อม' : 'แก้งานซ่อม'} ${rpNo(data)}: ${rpWhere(data)} · ${title}`); m.close(); }
  };
  if (!isNew && isAdmin()) v('rpDel').onclick = async e => { const btn = e.currentTarget; if (!btn.dataset.sure) { btn.dataset.sure = 1; btn.textContent = 'กดอีกครั้งเพื่อลบ'; return; } if (await save(() => Store.del('repairs', d.id), 'ลบแล้ว')) { for (const p of photos) Store.removeFile(p.path, 'attachments').catch(() => {}); m.close(); } };
}
function bindRepairs() {
  $('#rpNew').onclick = () => openRepair(null);
  $('#rpQ').addEventListener('input', renderRepairs);
  $('#rpChips').addEventListener('click', e => { const c = e.target.closest('[data-rpf]'); if (c) { S.rpFilter = c.dataset.rpf; renderRepairs(); } });
  const open = e => { if (e.target.closest('[data-gorp]')) return setPage('repairs'); const it = e.target.closest('[data-rid]'); if (it) { const r = M.repairs.get(it.dataset.rid); if (r) openRepair(r); } };
  $('#rpList').addEventListener('click', open);
  const dl = $('#dlRepairs'); if (dl) dl.addEventListener('click', open);
  const b = $('#dlRpNew'); if (b) b.onclick = () => openRepair(null);
}
