const { app, BrowserWindow, shell, Menu, ipcMain, protocol, net, Tray, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const Store = require('electron-store');
const { createClient } = require('@supabase/supabase-js');
const { autoUpdater } = require('electron-updater');

const isDev = !app.isPackaged;

const SUPABASE_URL = 'https://jrgjveefowmxyocbggmf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyZ2p2ZWVmb3dteHlvY2JnZ21mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MzY5NzYsImV4cCI6MjA4NjQxMjk3Nn0.09yTxtJ5C0xGi7Ni6be8JemLQIe-5S09fNj1SGWlFaY';

const store = new Store({ encryptionKey: 'tikup-pro-v1' });
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });

// Lazy-load nut-js (native binary — may not be available on all systems)
let nutjs = null;
try { nutjs = require('@nut-tree-fork/nut-js'); } catch { /* keystroke unavailable */ }

/** @type {BrowserWindow | null} */
let mainWindow = null;
/** @type {Tray | null} */
let tray = null;
app.isQuiting = false;

// ─── Window ──────────────────────────────────────────────────────────────────

function createWindow() {
  const savedBounds = store.get('windowBounds', { width: 1400, height: 900 });

  const win = new BrowserWindow({
    ...savedBounds,
    minWidth: 1024,
    minHeight: 680,
    backgroundColor: '#0a0a0f',
    frame: process.platform === 'win32' ? false : true,
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
    win.loadURL('app://tikup/');
  }

  // Open external links in system browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) shell.openExternal(url);
    return { action: 'deny' };
  });

  // Minimize to tray on close (instead of quitting)
  win.on('close', (e) => {
    if (!app.isQuiting) {
      e.preventDefault();
      win.hide();
    } else {
      if (!win.isMinimized() && !win.isMaximized()) {
        store.set('windowBounds', win.getBounds());
      }
    }
  });

  // Push maximize state changes to renderer (for custom titlebar)
  win.on('maximize', () => win.webContents.send('window:maximized', true));
  win.on('unmaximize', () => win.webContents.send('window:maximized', false));

  if (!isDev) Menu.setApplicationMenu(null);
}

// ─── System Tray ─────────────────────────────────────────────────────────────

function createTray() {
  const iconPath = path.join(__dirname, '../public/favicon.ico');
  let icon;
  try {
    if (fs.existsSync(iconPath)) {
      icon = nativeImage.createFromPath(iconPath);
      if (process.platform !== 'darwin') icon = icon.resize({ width: 16, height: 16 });
    } else {
      icon = nativeImage.createEmpty();
    }
  } catch {
    icon = nativeImage.createEmpty();
  }

  tray = new Tray(icon);
  tray.setToolTip('TikUp Pro');

  const buildMenu = () => Menu.buildFromTemplate([
    { label: 'Open TikUp Pro', click: () => { mainWindow?.show(); mainWindow?.focus(); } },
    { type: 'separator' },
    { label: 'Quit', click: () => { app.isQuiting = true; app.quit(); } },
  ]);

  tray.setContextMenu(buildMenu());
  tray.on('click', () => { mainWindow?.show(); mainWindow?.focus(); });
  tray.on('double-click', () => { mainWindow?.show(); mainWindow?.focus(); });
}

// ─── OAuth ───────────────────────────────────────────────────────────────────

function handleOAuthCallback(url) {
  if (!mainWindow) return;
  try {
    const parsed = new URL(url);
    if (!parsed.hash) return;
    const fragment = new URLSearchParams(parsed.hash.slice(1));
    const access_token = fragment.get('access_token');
    const refresh_token = fragment.get('refresh_token');
    if (access_token && refresh_token) {
      mainWindow.webContents.send('auth:oauth-callback', { access_token, refresh_token });
    }
  } catch { /* ignore */ }
}

// ─── Protocol setup (before app ready) ───────────────────────────────────────

app.setAsDefaultProtocolClient('tikup');

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

// Single instance lock (Windows deep link)
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, argv) => {
    const deeplink = argv.find((a) => typeof a === 'string' && a.startsWith('tikup://'));
    if (deeplink) handleOAuthCallback(deeplink);
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

app.on('open-url', (_event, url) => handleOAuthCallback(url));

// ─── IPC: Window controls ────────────────────────────────────────────────────

ipcMain.on('window:minimize', () => mainWindow?.minimize());
ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize();
  else mainWindow?.maximize();
});
ipcMain.on('window:close', () => { mainWindow?.hide(); });
ipcMain.handle('window:isMaximized', () => mainWindow?.isMaximized() ?? false);

// ─── IPC: Tray ───────────────────────────────────────────────────────────────

ipcMain.handle('tray:setTooltip', (_e, text) => { tray?.setToolTip(text); });

// ─── IPC: Google OAuth ───────────────────────────────────────────────────────

ipcMain.handle('auth:google-oauth-start', () => {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, 'http://localhost');

      if (url.pathname === '/auth/callback') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`<!DOCTYPE html><html><body>
          <p style="font-family:sans-serif;text-align:center;margin-top:40px">Signing you in…</p>
          <script>
            const p = new URLSearchParams(location.hash.slice(1));
            const at = p.get('access_token'), rt = p.get('refresh_token');
            if (at) fetch('/auth/token?access_token='+encodeURIComponent(at)+'&refresh_token='+encodeURIComponent(rt||''))
              .then(()=>{ document.body.innerHTML='<p style="font-family:sans-serif;text-align:center;margin-top:40px">✅ Signed in! You can close this tab.</p>'; });
          </script></body></html>`);
        return;
      }

      if (url.pathname === '/auth/token') {
        const access_token = url.searchParams.get('access_token');
        const refresh_token = url.searchParams.get('refresh_token');
        res.writeHead(200); res.end('ok');
        server.close();
        if (access_token && mainWindow) {
          mainWindow.webContents.send('auth:oauth-callback', { access_token, refresh_token });
          mainWindow.show(); mainWindow.focus();
        }
        resolve({ ok: true });
      }
    });

    server.on('error', (err) => resolve({ error: err.message }));

    server.listen(54321, '127.0.0.1', async () => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: 'http://127.0.0.1:54321/auth/callback', skipBrowserRedirect: true },
      });
      if (error) { server.close(); return resolve({ error: error.message }); }
      shell.openExternal(data.url);
      setTimeout(() => { server.close(); resolve({ error: 'OAuth timed out' }); }, 5 * 60 * 1000);
    });
  });
});

// ─── IPC: electron-store ─────────────────────────────────────────────────────

ipcMain.handle('store:get', (_e, key) => store.get(key));
ipcMain.handle('store:set', (_e, key, value) => { store.set(key, value); return { ok: true }; });

// ─── IPC: Keystroke triggers ─────────────────────────────────────────────────

ipcMain.handle('keystroke:fire', async (_e, { key, modifiers = [] }) => {
  if (!nutjs) return { error: 'Keystroke module not available on this system' };
  const { keyboard, Key } = nutjs;

  const keyMap = {
    SPACE: Key.Space, ENTER: Key.Return, TAB: Key.Tab, ESCAPE: Key.Escape,
    BACKSPACE: Key.Backspace, DELETE: Key.Delete,
    LEFT: Key.Left, RIGHT: Key.Right, UP: Key.Up, DOWN: Key.Down,
    HOME: Key.Home, END: Key.End, PAGEUP: Key.PageUp, PAGEDOWN: Key.PageDown,
    F1: Key.F1, F2: Key.F2, F3: Key.F3, F4: Key.F4, F5: Key.F5, F6: Key.F6,
    F7: Key.F7, F8: Key.F8, F9: Key.F9, F10: Key.F10, F11: Key.F11, F12: Key.F12,
    A: Key.A, B: Key.B, C: Key.C, D: Key.D, E: Key.E, F: Key.F, G: Key.G,
    H: Key.H, I: Key.I, J: Key.J, K: Key.K, L: Key.L, M: Key.M, N: Key.N,
    O: Key.O, P: Key.P, Q: Key.Q, R: Key.R, S: Key.S, T: Key.T, U: Key.U,
    V: Key.V, W: Key.W, X: Key.X, Y: Key.Y, Z: Key.Z,
    '0': Key.Num0, '1': Key.Num1, '2': Key.Num2, '3': Key.Num3, '4': Key.Num4,
    '5': Key.Num5, '6': Key.Num6, '7': Key.Num7, '8': Key.Num8, '9': Key.Num9,
  };
  const modMap = {
    CTRL: Key.LeftControl, ALT: Key.LeftAlt, SHIFT: Key.LeftShift, WIN: Key.LeftSuper, CMD: Key.LeftSuper,
  };

  try {
    const keys = [
      ...modifiers.map((m) => modMap[m?.toUpperCase()]).filter(Boolean),
      keyMap[key?.toUpperCase()],
    ].filter(Boolean);

    if (keys.length === 0) return { error: `Unknown key: ${key}` };
    await keyboard.pressKey(...keys);
    await keyboard.releaseKey(...keys);
    return { ok: true };
  } catch (e) {
    return { error: e.message };
  }
});

// ─── IPC: Auto-updater ───────────────────────────────────────────────────────

ipcMain.on('updater:install', () => autoUpdater.quitAndInstall());

// ─── App ready ───────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  // Serve React SPA via app:// so BrowserRouter works in production
  if (!isDev) {
    const distDir = path.join(__dirname, '../dist');
    protocol.handle('app', (request) => {
      let filePath = request.url.replace('app://tikup', '').split('?')[0];
      if (!filePath || filePath === '/') filePath = '/index.html';
      const fullPath = path.join(distDir, filePath);
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        return net.fetch('file://' + fullPath);
      }
      return net.fetch('file://' + path.join(distDir, 'index.html'));
    });
  }

  createWindow();
  createTray();

  // Auto-updater (production only)
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
    autoUpdater.on('update-downloaded', () => {
      mainWindow?.webContents.send('updater:downloaded');
    });
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  // Stay in tray — only quit when app.isQuiting = true
  if (process.platform === 'darwin') app.quit();
});

app.on('before-quit', () => { app.isQuiting = true; });
