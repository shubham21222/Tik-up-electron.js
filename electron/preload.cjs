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

  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
    onMaximizeChange: (cb) => {
      ipcRenderer.on('window:maximized', (_event, isMaximized) => cb(isMaximized));
    },
  },

  keystroke: {
    fire: (opts) => ipcRenderer.invoke('keystroke:fire', opts),
  },

  tray: {
    setTooltip: (text) => ipcRenderer.invoke('tray:setTooltip', text),
  },

  updater: {
    install: () => ipcRenderer.send('updater:install'),
    onUpdateDownloaded: (cb) => {
      ipcRenderer.on('updater:downloaded', () => cb());
    },
  },
});
