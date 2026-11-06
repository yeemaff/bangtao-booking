const { app, BrowserWindow, shell, Menu, ipcMain, dialog, net } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// dd/mm/yyyy date pickers on every PC, whatever the Windows language
app.commandLine.appendSwitch('lang', 'en-GB');
if (!app.requestSingleInstanceLock()) { app.quit(); }
let win = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1440, height: 900, minWidth: 1100, minHeight: 680,
    title: 'Bangtao Village Booking',
    icon: path.join(__dirname, 'renderer', 'icon.png'),
    backgroundColor: '#f2f5f6', show: false, autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: false },
  });
  Menu.setApplicationMenu(null);
  win.once('ready-to-show', () => { win.maximize(); win.show(); });
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  // links open in the normal web browser, never inside the app
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/i.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('file://')) { e.preventDefault(); if (/^https?:/i.test(url)) shell.openExternal(url); } });
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F5' && input.shift) { win.webContents.reload(); e.preventDefault(); }
    if (input.key === 'F12') { win.webContents.toggleDevTools(); e.preventDefault(); }
    if (input.control && (input.key === '=' || input.key === '+')) { win.webContents.setZoomLevel(Math.min(3, win.webContents.getZoomLevel() + 0.5)); e.preventDefault(); }
    if (input.control && input.key === '-') { win.webContents.setZoomLevel(Math.max(-3, win.webContents.getZoomLevel() - 0.5)); e.preventDefault(); }
    if (input.control && input.key === '0') { win.webContents.setZoomLevel(0); e.preventDefault(); }
  });
}

app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
// Windows shows notifications only for an app with this id (same as appId in package.json)
if (process.platform === 'win32') app.setAppUserModelId('com.bangtaovillage.booking');
ipcMain.handle('bv-focus', () => { if (win) { if (win.isMinimized()) win.restore(); win.show(); win.focus(); } });
app.whenReady().then(() => {
  createWindow(); setupUpdates();
  // tell the page the PC woke up so it reconnects to the database straight away
  const { powerMonitor } = require('electron');
  const ping = () => { if (win && !win.isDestroyed()) win.webContents.send('bv-resume'); };
  powerMonitor.on('resume', ping); powerMonitor.on('unlock-screen', ping);
});

// save what is on the print sheet as a PDF file
ipcMain.handle('bv-pdf', async (e, name, landscape) => {
  const w = BrowserWindow.fromWebContents(e.sender);
  const data = await e.sender.printToPDF({ landscape: !!landscape, pageSize: 'A4', printBackground: true, preferCSSPageSize: true });
  const r = await dialog.showSaveDialog(w, { title: 'บันทึก PDF', defaultPath: path.join(app.getPath('documents'), path.basename(String(name || 'document.pdf'))), filters: [{ name: 'PDF', extensions: ['pdf'] }] });
  if (r.canceled || !r.filePath) return false;
  fs.writeFileSync(r.filePath, data); shell.openPath(r.filePath);
  return true;
});
// print what is on the print sheet; tells the page when the PC has no printer at all
ipcMain.handle('bv-print', async (e, landscape) => {
  const printers = await e.sender.getPrintersAsync().catch(() => []);
  if (!printers.length) return { ok: false, reason: 'noprinter' };
  return await new Promise(res => e.sender.print({ silent: false, printBackground: true, landscape: !!landscape }, (ok, reason) => res({ ok, reason: ok ? '' : String(reason || '') })));
});
// open a document from the app in the PC's default program (PDF reader, Word, …) so it can be printed there
// download the shared booking sheet from Google Drive (read only; only Google hosts, only a file id).
// Redirects are followed by hand so every hop can be checked to stay on Google.
function bvGet(url, hops = 0) {
  return new Promise((ok, no) => {
    let u; try { u = new URL(url); } catch { return no(new Error('bad link')); }
    if (u.protocol !== 'https:' || !/(^|\.)(google|googleusercontent)\.com$/.test(u.hostname)) return no(new Error('not a Google address: ' + u.hostname));
    const req = require('https').get(u, { headers: { 'User-Agent': 'Mozilla/5.0 BangtaoBooking' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) { res.resume(); if (hops > 8) return no(new Error('too many redirects')); return ok(bvGet(new URL(res.headers.location, u).toString(), hops + 1)); }
      if (res.statusCode !== 200) { res.resume(); return no(new Error('HTTP ' + res.statusCode)); }
      const parts = []; let n = 0;
      res.on('data', c => { parts.push(c); n += c.length; if (n > 60 * 1048576) req.destroy(new Error('file too big')); });
      res.on('end', () => ok(Buffer.concat(parts))); res.on('error', no);
    });
    req.setTimeout(60000, () => req.destroy(new Error('timeout')));
    req.on('error', no);
  });
}
ipcMain.handle('bv-fetch-sheet', async (_e, id) => {
  if (!/^[\w-]{20,}$/.test(String(id))) throw new Error('bad id');
  const urls = [`https://drive.google.com/uc?export=download&id=${id}`, `https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`, `https://docs.google.com/spreadsheets/d/${id}/export?format=xlsx`];
  const errs = [];
  for (const u of urls) {
    try {
      const buf = await bvGet(u);
      if (buf.length < 1000 || buf[0] !== 0x50 || buf[1] !== 0x4b) { errs.push('not an xlsx (sharing must be “Anyone with the link”)'); continue; }
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
    } catch (e) { errs.push(e.message); }
  }
  throw new Error('ดาวน์โหลดไฟล์ไม่ได้: ' + errs.join(' / '));
});
ipcMain.handle('bv-open-file', async (_e, name, data) => {
  const dir = path.join(os.tmpdir(), 'BangtaoDocs'); fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, path.basename(String(name || 'document')).replace(/[<>:"/\\|?*]+/g, '_'));
  fs.writeFileSync(file, Buffer.from(data));
  const err = await shell.openPath(file); if (err) throw new Error(err);
  return true;
});

// ----- automatic updates from GitHub Releases (installed version only) -----
function setupUpdates() {
  if (!app.isPackaged || process.env.PORTABLE_EXECUTABLE_DIR) return;
  let autoUpdater;
  try { ({ autoUpdater } = require('electron-updater')); } catch { return; }
  const send = (ch, v) => { if (win && !win.isDestroyed()) win.webContents.send(ch, v); };
  if (process.platform === 'darwin') return setupMacUpdates(autoUpdater, send);
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.on('update-available', i => send('bv-update', { state: 'downloading', version: i.version }));
  autoUpdater.on('update-downloaded', i => send('bv-update', { state: 'ready', version: i.version }));
  autoUpdater.on('error', () => {});
  ipcMain.on('bv-restart', () => autoUpdater.quitAndInstall(false, true));
  ipcMain.handle('bv-check', async () => { try { const r = await autoUpdater.checkForUpdates(); return r && r.updateInfo ? r.updateInfo.version : null; } catch { return null; } });
  const check = () => autoUpdater.checkForUpdates().catch(() => {});
  setTimeout(check, 8000);
  setInterval(check, 4 * 60 * 60 * 1000);
}
// Mac: the app is not signed with an Apple certificate, so the built-in updater (Squirrel) refuses it.
// We download the zip from the GitHub release ourselves, check its checksum, and swap the .app after the app quits.
function setupMacUpdates(autoUpdater, send) {
  const { execFile, spawn } = require('child_process'), crypto = require('crypto');
  autoUpdater.autoDownload = false;
  let ready = null, busy = false;
  const bundle = () => path.resolve(path.dirname(app.getPath('exe')), '..', '..'); // …/Bangtao Village Booking.app
  autoUpdater.on('update-available', async info => {
    if (busy || ready) return; busy = true;
    try {
      const want = process.arch === 'arm64' ? 'arm64' : 'x64';
      const f = (info.files || []).find(x => /\.zip$/i.test(x.url) && x.url.includes(want)) || (info.files || []).find(x => /\.zip$/i.test(x.url));
      if (!f) return;
      send('bv-update', { state: 'downloading', version: info.version });
      const url = /^https?:/.test(f.url) ? f.url : `https://github.com/yeemaff/bangtao-booking/releases/download/v${info.version}/${encodeURIComponent(f.url)}`;
      const r = await net.fetch(url, { redirect: 'follow' }); if (!r.ok) throw new Error('download ' + r.status);
      const buf = Buffer.from(await r.arrayBuffer());
      if (f.sha512 && crypto.createHash('sha512').update(buf).digest('base64') !== f.sha512) throw new Error('checksum');
      const dir = path.join(os.tmpdir(), 'bv-update-' + info.version); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
      const zip = path.join(dir, 'u.zip'); fs.writeFileSync(zip, buf);
      await new Promise((ok, no) => execFile('/usr/bin/ditto', ['-x', '-k', zip, dir], e => e ? no(e) : ok()));
      const appDir = fs.readdirSync(dir).find(n => n.endsWith('.app')); if (!appDir) throw new Error('no app in zip');
      ready = { src: path.join(dir, appDir), version: info.version };
      send('bv-update', { state: 'ready', version: info.version });
    } catch (e) { console.warn('mac update', e); } finally { busy = false; }
  });
  autoUpdater.on('error', () => {});
  const install = relaunch => {
    if (!ready) return false;
    const dest = bundle(); if (!dest.endsWith('.app')) return false;
    const sh = path.join(os.tmpdir(), 'bv-swap.sh'), q = s => "'" + s.replace(/'/g, "'\\''") + "'";
    fs.writeFileSync(sh, `#!/bin/sh
while kill -0 ${process.pid} 2>/dev/null; do sleep 0.5; done
D=${q(dest)}; S=${q(ready.src)}
rm -rf "$D.old"
if mv "$D" "$D.old" && /usr/bin/ditto "$S" "$D"; then rm -rf "$D.old"; /usr/bin/xattr -cr "$D" 2>/dev/null; else rm -rf "$D"; mv "$D.old" "$D"; fi
${relaunch ? 'open "$D"' : ''}
`, { mode: 0o755 });
    spawn('/bin/sh', [sh], { detached: true, stdio: 'ignore' }).unref();
    ready = null; return true;
  };
  ipcMain.on('bv-restart', () => { if (install(true)) app.quit(); });
  app.on('before-quit', () => { install(false); }); // "later": swap in the new version when the app is closed
  ipcMain.handle('bv-check', async () => { try { const r = await autoUpdater.checkForUpdates(); return r && r.updateInfo ? r.updateInfo.version : null; } catch { return null; } });
  const check = () => autoUpdater.checkForUpdates().catch(() => {});
  setTimeout(check, 8000);
  setInterval(check, 4 * 60 * 60 * 1000);
}
app.on('window-all-closed', () => app.quit());
