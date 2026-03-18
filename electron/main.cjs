const { app, BrowserWindow, shell, Menu, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { createClient } = require('@supabase/supabase-js');

const isDev = !app.isPackaged;

const SUPABASE_URL = 'https://jrgjveefowmxyocbggmf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyZ2p2ZWVmb3dteHlvY2JnZ21mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MzY5NzYsImV4cCI6MjA4NjQxMjk3Nn0.09yTxtJ5C0xGi7Ni6be8JemLQIe-5S09fNj1SGWlFaY';

const store = new Store({ encryptionKey: 'tikup-pro-v1' });
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

/** @type {BrowserWindow | null} */
let mainWindow = null;

function createWindow() {
  const savedBounds = store.get('windowBounds', {
    width: 1400,
    height: 900,
  });

  const win = new BrowserWindow({
    ...savedBounds,
    minWidth: 1024,
    minHeight: 680,
    backgroundColor: '#0a0a0f',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
  });

  mainWindow = win;

  if (isDev) {
    win.loadURL('http://localhost:8080');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Open external links in system browser instead of a new Electron window
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) shell.openExternal(url);
    return { action: 'deny' };
  });

  // Persist window bounds
  win.on('close', () => {
    if (!win.isMinimized() && !win.isMaximized()) {
      store.set('windowBounds', win.getBounds());
    }
  });

  // Remove default menu bar in production
  if (!isDev) Menu.setApplicationMenu(null);
}

function handleOAuthCallback(url) {
  if (!mainWindow) return;
  try {
    const parsed = new URL(url);
    if (!parsed.hash) return;
    const fragment = new URLSearchParams(parsed.hash.slice(1));
    const access_token = fragment.get('access_token');
    const refresh_token = fragment.get('refresh_token');
    if (access_token && refresh_token) {
      mainWindow.webContents.send('auth:oauth-callback', {
        access_token,
        refresh_token,
      });
    }
  } catch {
    // ignore malformed URLs
  }
}

// Register custom protocol before ready
app.setAsDefaultProtocolClient('tikup');

// Single instance handling (Windows deep link support)
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, argv) => {
    const deeplink = argv.find((arg) => typeof arg === 'string' && arg.startsWith('tikup://'));
    if (deeplink) handleOAuthCallback(deeplink);
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// macOS deep link
app.on('open-url', (_event, url) => {
  handleOAuthCallback(url);
});

// IPC: start Google OAuth flow in system browser
ipcMain.handle('auth:google-oauth-start', async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'tikup://auth/callback',
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data?.url) {
    shell.openExternal(data.url);
  }

  return { ok: true };
});

// electron-store IPC
ipcMain.handle('store:get', (_event, key) => {
  return store.get(key);
});

ipcMain.handle('store:set', (_event, key, value) => {
  store.set(key, value);
  return { ok: true };
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
