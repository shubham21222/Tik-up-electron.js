const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
  auth: {
    startGoogleOAuth: () => ipcRenderer.invoke('auth:google-oauth-start'),
    onOAuthCallback: (cb) => {
      ipcRenderer.on('auth:oauth-callback', (_event, tokens) => cb(tokens));
    },
  },
  store: {
    get: (key) => ipcRenderer.invoke('store:get', key),
    set: (key, value) => ipcRenderer.invoke('store:set', key, value),
  },
});
