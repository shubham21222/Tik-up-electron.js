const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { createClient } = require('@supabase/supabase-js');

// ─── Config ──────────────────────────────────────────────
const SUPABASE_URL = 'https://jrgjveefowmxyocbggmf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyZ2p2ZWVmb3dteHlvY2JnZ21mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MzY5NzYsImV4cCI6MjA4NjQxMjk3Nn0.09yTxtJ5C0xGi7Ni6be8JemLQIe-5S09fNj1SGWlFaY';

const store = new Store({ encryptionKey: 'tikup-desktop-v1' });
let mainWindow = null;
let tray = null;
let supabase = null;
let realtimeChannel = null;

// ─── App lifecycle ───────────────────────────────────────
app.whenReady().then(() => {
  createWindow();
  createTray();
  initSupabase();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ─── Window ──────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#000000',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile('renderer/index.html');
}

// ─── System tray ─────────────────────────────────────────
function createTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname, 'assets', 'tray-icon.png'));
  tray = new Tray(icon.resize({ width: 16, height: 16 }));
  tray.setToolTip('TikUp Desktop');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Show TikUp', click: () => mainWindow?.show() },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]));
}

// ─── Supabase init ───────────────────────────────────────
function initSupabase() {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
}

// ─── IPC Handlers ────────────────────────────────────────

// Auth: sign in with email/password
ipcMain.handle('auth:sign-in', async (_e, { email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  store.set('session', data.session);
  return { user: data.user };
});

// Auth: sign out
ipcMain.handle('auth:sign-out', async () => {
  await supabase.auth.signOut();
  store.delete('session');
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }
  return { ok: true };
});

// Auth: restore session
ipcMain.handle('auth:restore-session', async () => {
  const session = store.get('session');
  if (!session) return { user: null };
  const { data, error } = await supabase.auth.setSession(session);
  if (error) { store.delete('session'); return { user: null }; }
  return { user: data.user };
});

// Profile: fetch TikTok username
ipcMain.handle('profile:get', async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { data } = await supabase
    .from('profiles')
    .select('tiktok_username, display_name, avatar_url, plan_type')
    .eq('user_id', user.id)
    .single();
  return { profile: data };
});

// Audio: detect virtual audio devices
ipcMain.handle('audio:detect-devices', async () => {
  // In production, use node-audio-volume-mixer or platform-specific APIs
  // For now, return instructions for the renderer to use Web Audio API
  return {
    tip: 'Use navigator.mediaDevices.enumerateDevices() in renderer for full device list',
    knownVirtualDrivers: [
      'CABLE Input (VB-Audio Virtual Cable)',
      'VoiceMeeter Input',
      'BlackHole 2ch',
      'Soundflower (2ch)',
    ],
  };
});

// Realtime: subscribe to TikTok LIVE events for TTS routing
ipcMain.handle('realtime:subscribe', async (_e, { tiktokUsername }) => {
  if (realtimeChannel) supabase.removeChannel(realtimeChannel);

  realtimeChannel = supabase
    .channel(`desktop_events_${tiktokUsername}`)
    .on('broadcast', { event: 'tts_audio' }, (payload) => {
      mainWindow?.webContents.send('tts:play', payload.payload);
    })
    .on('broadcast', { event: 'gift' }, (payload) => {
      mainWindow?.webContents.send('event:gift', payload.payload);
    })
    .on('broadcast', { event: 'chat' }, (payload) => {
      mainWindow?.webContents.send('event:chat', payload.payload);
    })
    .subscribe();

  return { ok: true };
});

// Realtime: unsubscribe
ipcMain.handle('realtime:unsubscribe', async () => {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }
  return { ok: true };
});

// Store: save/load preferences
ipcMain.handle('store:get', (_e, key) => store.get(key));
ipcMain.handle('store:set', (_e, key, value) => { store.set(key, value); return { ok: true }; });
