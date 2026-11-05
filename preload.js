const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('bvDesktop', {
  platform: process.platform,
  onUpdate: cb => ipcRenderer.on('bv-update', (_e, info) => cb(info)),
  restartToUpdate: () => ipcRenderer.send('bv-restart'),
  checkUpdate: () => ipcRenderer.invoke('bv-check'),
  openFile: (name, data) => ipcRenderer.invoke('bv-open-file', name, data),
  focus: () => ipcRenderer.invoke('bv-focus'),
  fetchSheet: id => ipcRenderer.invoke('bv-fetch-sheet', id),
  savePdf: (name, landscape) => ipcRenderer.invoke('bv-pdf', name, landscape),
  print: landscape => ipcRenderer.invoke('bv-print', landscape),
  onResume: cb => ipcRenderer.on('bv-resume', () => cb()),
});
