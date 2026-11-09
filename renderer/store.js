/* Data layer: keeps every document in memory, mirrors Supabase in real time,
   and writes through to the shared database. */
const Store = (() => {
  const EMAIL_DOMAIN = 'staff.bangtaovillage.app';
  const COLS = ['rooms', 'bookings', 'finance', 'guests', 'ops', 'state', 'settings', 'log', 'files', 'todos', 'tododone', 'repairs'];
  const maps = Object.fromEntries(COLS.map(c => [c, new Map()]));
  const staff = new Map();
  const listeners = new Set();
  let client = null, conn = null, channel = null, me = null, user = null;
  let online = false, needReload = false, statusText = 'กำลังเชื่อมต่อ…';

  const emit = (what, info) => listeners.forEach(fn => { try { fn(what, info); } catch (e) { console.error(e); } });
  const toEmail = u => `${String(u).trim().toLowerCase()}@${EMAIL_DOMAIN}`;
  const deepMerge = (a, b) => {
    if (!a || typeof a !== 'object' || Array.isArray(a) || !b || typeof b !== 'object' || Array.isArray(b)) return b;
    const out = { ...a };
    for (const k of Object.keys(b)) out[k] = deepMerge(a[k], b[k]);
    return out;
  };
  const rowToDoc = r => ({ id: r.id, ...(r.data || {}), _by: r.updated_by, _at: r.updated_at });

  function readConn() { try { return JSON.parse(localStorage.getItem('bv.conn') || 'null'); } catch { return null; } }
  function saveConn(c) { try { localStorage.setItem('bv.conn', JSON.stringify(c)); } catch {} }
  function clearConn() { try { localStorage.removeItem('bv.conn'); } catch {} }
  function makeClient(c, opts = {}) {
    return supabase.createClient(c.url, c.key, {
      auth: { persistSession: opts.persist !== false, autoRefreshToken: opts.persist !== false, detectSessionInUrl: false, storageKey: opts.storageKey || 'bv-auth' },
      realtime: { params: { eventsPerSecond: 20 } },
    });
  }
  function normaliseUrl(u) { u = String(u || '').trim().replace(/\/+$/, ''); if (u && !/^https?:\/\//i.test(u)) u = 'https://' + u; return u; }

  async function testConnection(c) {
    const cl = makeClient(c, { persist: false, storageKey: 'bv-test' });
    const { data, error } = await cl.rpc('setup_needed');
    if (error) throw error;
    return data;
  }
  function init(c) { conn = c; client = makeClient(c); return client; }

  async function currentSession() {
    const { data } = await client.auth.getSession();
    return data.session || null;
  }
  async function loadMe() {
    const { data: s } = await client.auth.getUser();
    user = s.user || null;
    if (!user) return null;
    const { data, error } = await client.from('staff').select('*').eq('id', user.id).maybeSingle();
    if (error) throw error;
    me = data && data.active ? data : null;
    return me;
  }
  async function setupNeeded() { const { data, error } = await client.rpc('setup_needed'); if (error) throw error; return !!data; }
  async function signIn(username, password) {
    const { error } = await client.auth.signInWithPassword({ email: toEmail(username), password });
    if (error) throw error;
    const m = await loadMe();
    if (!m) { await client.auth.signOut(); const e = new Error('inactive'); e.code = 'inactive'; throw e; }
    return m;
  }
  async function createFirstAdmin(username, display, password) {
    const { data, error } = await client.auth.signUp({ email: toEmail(username), password });
    if (error) throw error;
    if (!data.session) { const e = new Error('confirm'); e.code = 'confirm_email_on'; throw e; }
    const { data: ok, error: e2 } = await client.rpc('claim_first_admin', { p_username: username.toLowerCase(), p_display: display });
    if (e2) throw e2;
    if (!ok) { const e = new Error('taken'); e.code = 'already_setup'; throw e; }
    return loadMe();
  }
  async function signOut() { try { channel && client.removeChannel(channel); } catch {} channel = null; me = null; await client.auth.signOut(); COLS.forEach(c => maps[c].clear()); staff.clear(); lastAt = null; }

  // first load pulls everything; later reloads (wake, reconnect) pull only rows changed since then
  // plus the bare list of ids to spot deletions — keeps Supabase egress (bandwidth quota) small.
  let lastAt = null;
  async function pages(cols, q) {
    const all = [];
    for (let from = 0; ; from += 1000) {
      let r = client.from('docs').select(cols); if (q) r = q(r);
      const { data, error } = await r.order('col').order('id').range(from, from + 999);
      if (error) throw error;
      all.push(...data);
      if (data.length < 1000) break;
    }
    return all;
  }
  async function loadAll(full) {
    const since = !full && lastAt ? new Date(Date.parse(lastAt) - 5 * 60000).toISOString() : null; // 5 min overlap for clock skew
    const rows = await pages('col,id,data,updated_by,updated_at', since ? r => r.gt('updated_at', since) : null);
    if (since) {
      const live = new Set((await pages('col,id')).map(r => r.col + '\u0000' + r.id));
      for (const c of Object.keys(maps)) for (const id of [...maps[c].keys()]) if (!live.has(c + '\u0000' + id)) maps[c].delete(id);
    } else COLS.forEach(c => maps[c].clear());
    for (const r of rows) { if (!maps[r.col]) maps[r.col] = new Map(); maps[r.col].set(r.id, rowToDoc(r)); if (!lastAt || r.updated_at > lastAt) lastAt = r.updated_at; }
    await loadStaff();
    emit('all');
  }
  async function loadStaff() {
    const { data, error } = await client.from('staff').select('*').order('created_at');
    if (error) throw error;
    staff.clear(); data.forEach(s => staff.set(s.id, s));
    if (me && staff.has(me.id)) me = staff.get(me.id);
  }
  function setStatus(on, text) { online = on; statusText = text; emit('status'); }
  function subscribe() {
    if (channel) { try { client.removeChannel(channel); } catch {} }
    const ch = channel = client.channel('bv-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'docs' }, p => {
        if (p.eventType === 'DELETE') {
          const o = p.old || {}; const m = maps[o.col];
          if (m && m.has(o.id)) { const prev = m.get(o.id); m.delete(o.id); emit('doc', { col: o.col, id: o.id, type: 'delete', prev }); }
          else if (!o.col) { needReload = true; reload(); }
          return;
        }
        const r = p.new; if (!maps[r.col]) maps[r.col] = new Map();
        const prev = maps[r.col].get(r.id);
        maps[r.col].set(r.id, rowToDoc(r));
        emit('doc', { col: r.col, id: r.id, type: p.eventType === 'INSERT' ? 'insert' : 'update', by: r.updated_by, prev });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff' }, () => { loadStaff().then(() => emit('staff')).catch(() => {}); })
      .subscribe(status => {
        if (ch !== channel) return; // an old channel we already replaced
        if (status === 'SUBSCRIBED') { retry = 0; lastOk = Date.now(); setStatus(true, 'ออนไลน์ · อัปเดตอัตโนมัติ'); if (needReload) reload(); needReload = false; }
        else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') { setStatus(false, 'ขาดการเชื่อมต่อ · กำลังเชื่อมต่อใหม่…'); needReload = true; scheduleReconnect(); }
      });
  }
  // ----- self-healing connection: after sleep, Wi-Fi drops or long idle the app reconnects by itself -----
  let retry = 0, retryTimer = null, lastOk = Date.now(), lastTick = Date.now(), reconnecting = null;
  function scheduleReconnect() {
    if (retryTimer || !client || !me) return;
    const wait = Math.min(60000, 2000 * Math.pow(2, retry++));
    retryTimer = setTimeout(() => { retryTimer = null; reconnect(); }, wait);
  }
  async function freshSession() {
    try {
      let { data } = await client.auth.getSession(); let s = data && data.session;
      if (!s || (s.expires_at && s.expires_at * 1000 - Date.now() < 120000)) { const r = await client.auth.refreshSession(); s = (r.data && r.data.session) || s; }
      if (s && client.realtime && client.realtime.setAuth) client.realtime.setAuth(s.access_token);
      return !!s;
    } catch { return false; }
  }
  function reconnect(full) {
    if (reconnecting) return reconnecting;
    reconnecting = (async () => {
      if (!client || !me) return;
      if (typeof navigator !== 'undefined' && navigator.onLine === false) { setStatus(false, 'ออฟไลน์ · ไม่มีอินเทอร์เน็ต'); return; }
      setStatus(false, 'กำลังเชื่อมต่อใหม่…');
      await freshSession();
      try { if (client.realtime && !client.realtime.isConnected()) client.realtime.connect(); } catch {}
      needReload = true; subscribe();
      if (full) await reload();
    })().finally(() => { reconnecting = null; });
    return reconnecting;
  }
  const channelOk = () => { try { return online && channel && channel.state === 'joined' && (!client.realtime.isConnected || client.realtime.isConnected()); } catch { return online; } };
  // every 30 s: notice a dead socket, or that the PC slept (the timer was frozen), and heal
  setInterval(() => {
    const now = Date.now(), slept = now - lastTick > 90000; lastTick = now;
    if (!client || !me) return;
    if (slept) { reconnect(true); return; }
    if (!channelOk()) { setStatus(false, 'ขาดการเชื่อมต่อ · กำลังเชื่อมต่อใหม่…'); scheduleReconnect(); } else lastOk = now;
  }, 30000);
  const wake = () => { if (!client || !me) return; if (!channelOk() || Date.now() - lastOk > 5 * 60000) reconnect(true); };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') wake(); });
  window.addEventListener('focus', wake);
  if (window.bvDesktop && window.bvDesktop.onResume) window.bvDesktop.onResume(() => reconnect(true));
  let reloading = null;
  function reload() { if (reloading) return reloading; reloading = loadAll().catch(() => {}).finally(() => { reloading = null; }); return reloading; }
  window.addEventListener('online', () => { retry = 0; reconnect(true); });
  window.addEventListener('offline', () => setStatus(false, 'ออฟไลน์ · ไม่มีอินเทอร์เน็ต'));

  function check(res) { if (res.error) throw res.error; return res.data; }
  const staleAuth = e => e && (e.status === 401 || /jwt|token.*expired|invalid claim/i.test(String(e.message || e.code || '')));
  async function withAuth(fn) { const r = await fn(); if (r && r.error && staleAuth(r.error) && await freshSession()) return fn(); if (r && r.error && /fetch|network/i.test(String(r.error.message || ''))) { scheduleReconnect(); } return r; }
  // ----- undo: remember what a group of writes replaced, so a mistake can be put back -----
  let rec = null;
  const record = (col, id, prev) => { if (!rec || col === 'log' || rec.some(x => x.col === col && x.id === id)) return; rec.push({ col, id, prev: prev ? JSON.parse(JSON.stringify(prev)) : null }); };
  async function track(fn) { const mine = [], outer = rec; rec = mine; try { await fn(); } finally { rec = outer; } return mine; }
  async function undo(entries) { for (const x of [...entries].reverse()) { if (x.prev) await put(x.col, x.id, x.prev); else await del(x.col, x.id); } }
  async function put(col, id, data) {
    const clean = JSON.parse(JSON.stringify(data)); delete clean.id; delete clean._by; delete clean._at;
    const prev = maps[col]?.get(id); record(col, id, prev);
    if (!maps[col]) maps[col] = new Map();
    maps[col].set(id, { id, ...clean, _by: me?.id, _at: new Date().toISOString() }); emit('doc', { col, id, type: 'local' });
    try { check(await withAuth(() => client.from('docs').upsert({ col, id, data: clean }))); }
    catch (e) { if (prev) maps[col].set(id, prev); else maps[col].delete(id); emit('doc', { col, id, type: 'local' }); throw e; }
  }
  async function merge(col, id, patch) {
    const clean = JSON.parse(JSON.stringify(patch));
    if (!maps[col]) maps[col] = new Map();
    const prev = maps[col].get(id); record(col, id, prev);
    maps[col].set(id, { ...(deepMerge(prev || { id }, clean)), id }); emit('doc', { col, id, type: 'local' });
    try { check(await withAuth(() => client.rpc('doc_merge', { p_col: col, p_id: id, p_patch: clean }))); }
    catch (e) { if (prev) maps[col].set(id, prev); else maps[col].delete(id); emit('doc', { col, id, type: 'local' }); throw e; }
  }
  async function del(col, id) {
    const prev = maps[col]?.get(id); record(col, id, prev);
    maps[col]?.delete(id); emit('doc', { col, id, type: 'local' });
    try { check(await withAuth(() => client.from('docs').delete().eq('col', col).eq('id', id))); }
    catch (e) { if (prev) maps[col].set(id, prev); emit('doc', { col, id, type: 'local' }); throw e; }
  }
  async function putMany(rows, onProgress) {
    let done = 0;
    const last = new Map(); rows.forEach(r => last.set(r.col + '\u0001' + r.id, r)); rows = [...last.values()];
    if (rows.length <= 60) rows.forEach(r => record(r.col, r.id, maps[r.col]?.get(r.id)));
    for (let i = 0; i < rows.length; i += 200) {
      const chunk = rows.slice(i, i + 200).map(r => { const d = JSON.parse(JSON.stringify(r.data)); delete d.id; delete d._by; delete d._at; return { col: r.col, id: r.id, data: d }; });
      check(await client.from('docs').upsert(chunk));
      for (const r of chunk) { if (!maps[r.col]) maps[r.col] = new Map(); maps[r.col].set(r.id, { ...r.data, id: r.id, _by: me?.id, _at: new Date().toISOString() }); }
      done += chunk.length; onProgress && onProgress(done, rows.length);
    }
    emit('all');
  }
  // ----- document files (Supabase Storage bucket "documents") -----
  async function uploadFile(path, file, bucket = 'documents') { check(await client.storage.from(bucket).upload(path, file, { upsert: false, contentType: file.type || 'application/octet-stream' })); }
  async function downloadFile(path, bucket = 'documents') { return check(await client.storage.from(bucket).download(path)); }
  async function removeFile(path, bucket = 'documents') { check(await client.storage.from(bucket).remove([path])); }
  const newId = () => (crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '').slice(0, 20) : Date.now().toString(36) + Math.random().toString(36).slice(2, 10));

  // ----- staff management (admin) -----
  async function createStaff({ username, display_name, password, role }) {
    const tmp = makeClient(conn, { persist: false, storageKey: 'bv-tmp-' + Date.now() });
    const { data, error } = await tmp.auth.signUp({ email: toEmail(username), password });
    if (error) throw error;
    if (!data.user || (data.user.identities && data.user.identities.length === 0)) { const e = new Error('exists'); e.code = 'user_exists'; throw e; }
    check(await client.from('staff').insert({ id: data.user.id, username: username.toLowerCase(), display_name, role, active: true }));
    await loadStaff(); emit('staff');
    return { needsConfirm: !data.session };
  }
  async function updateStaff(id, patch) { check(await client.from('staff').update(patch).eq('id', id)); await loadStaff(); emit('staff'); }
  async function setPassword(id, password) { check(await client.rpc('admin_set_password', { p_user: id, p_password: password })); }
  async function deleteStaff(id) { check(await client.rpc('admin_delete_user', { p_user: id })); await loadStaff(); emit('staff'); }
  async function changeOwnPassword(oldPw, newPw) {
    const { error: e1 } = await client.auth.signInWithPassword({ email: toEmail(me.username), password: oldPw });
    if (e1) { const e = new Error('wrong'); e.code = 'wrong_password'; throw e; }
    const { error } = await client.auth.updateUser({ password: newPw }); if (error) throw error;
  }

  return {
    maps, staff, get me() { return me; }, get online() { return online; }, get statusText() { return statusText; }, get conn() { return conn; },
    on: fn => { listeners.add(fn); return () => listeners.delete(fn); },
    readConn, saveConn, clearConn, normaliseUrl, testConnection, init, currentSession, loadMe, setupNeeded, signIn, signOut, createFirstAdmin,
    loadAll, subscribe, reload, reconnect, put, merge, del, putMany, newId, track, undo, uploadFile, downloadFile, removeFile, createStaff, updateStaff, setPassword, deleteStaff, changeOwnPassword,
  };
})();
