const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('tassel', {
  onState: (cb) => ipcRenderer.on('state', (_e, state) => cb(state)),
  ready: () => ipcRenderer.send('ready'),
  setClickThrough: (on) => ipcRenderer.send('click-through', on),
});
