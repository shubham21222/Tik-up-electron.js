const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('tikup', {
  // ─── Auth ────────────────────────────
  auth: {
    signIn: (creds) => ipcRenderer.invoke('auth:sign-in', creds),
    signOut: () => ipcRenderer.invoke('auth:sign-out'),
    restoreSession: () => ipcRenderer.invoke('auth:restore-session'),
  },

  // ─── Profile ─────────────────────────
  profile: {
    get: () => ipcRenderer.invoke('profile:get'),
  },

  // ─── Audio ───────────────────────────
  audio: {
    detectDevices: () => ipcRenderer.invoke('audio:detect-devices'),
  },

  // ─── Realtime ────────────────────────
  realtime: {
    subscribe: (opts) => ipcRenderer.invoke('realtime:subscribe', opts),
    unsubscribe: () => ipcRenderer.invoke('realtime:unsubscribe'),
  },

  // ─── Store ───────────────────────────
  store: {
    get: (key) => ipcRenderer.invoke('store:get', key),
    set: (key, val) => ipcRenderer.invoke('store:set', key, val),
  },

  // ─── Event listeners ─────────────────
  on: {
    ttsPlay: (cb) => ipcRenderer.on('tts:play', (_e, data) => cb(data)),
    gift: (cb) => ipcRenderer.on('event:gift', (_e, data) => cb(data)),
    chat: (cb) => ipcRenderer.on('event:chat', (_e, data) => cb(data)),
  },
});
