const { app, BrowserWindow, shell, Menu, ipcMain, protocol, net } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
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
    win.loadURL('app://tikup/');
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

// Register custom protocols before ready
app.setAsDefaultProtocolClient('tikup');

// 'app://' protocol — serves the React SPA from dist/ in production.
// This lets BrowserRouter work correctly (no 404 on reload/deep links).
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

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

// IPC: start Google OAuth via temporary localhost server (RFC 8252)
ipcMain.handle('auth:google-oauth-start', async () => {
  return new Promise((resolve) => {
    // Start a temporary HTTP server on a random available port
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, 'http://localhost');

      // Supabase sends tokens as hash fragment — we need a page that reads the hash
      // and sends it back as a query param via redirect
      if (url.pathname === '/auth/callback') {
        // Send HTML page that extracts hash tokens and posts them back
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`<!DOCTYPE html><html><body>
          <p>Signing you in... you can close this tab.</p>
          <script>
            const hash = window.location.hash.slice(1);
            const params = new URLSearchParams(hash);
            const access_token = params.get('access_token');
            const refresh_token = params.get('refresh_token');
            if (access_token) {
              fetch('/auth/token?access_token=' + encodeURIComponent(access_token) + '&refresh_token=' + encodeURIComponent(refresh_token || ''))
                .then(() => { document.body.innerHTML = '<p>✅ Signed in! You can close this tab.</p>'; });
            }
          </script>
        </body></html>`);
        return;
      }

      if (url.pathname === '/auth/token') {
        const access_token = url.searchParams.get('access_token');
        const refresh_token = url.searchParams.get('refresh_token');
        res.writeHead(200);
        res.end('ok');
        server.close();

        if (access_token && mainWindow) {
          mainWindow.webContents.send('auth:oauth-callback', { access_token, refresh_token });
          mainWindow.show();
          mainWindow.focus();
        }
        resolve({ ok: true });
      }
    });

    server.listen(54321, '127.0.0.1', async () => {
      const port = server.address().port;
      const redirectTo = `http://127.0.0.1:${port}/auth/callback`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      });

      if (error) {
        server.close();
        return resolve({ error: error.message });
      }

      shell.openExternal(data.url);

      // Timeout after 5 minutes
      setTimeout(() => {
        server.close();
        resolve({ error: 'OAuth timed out' });
      }, 5 * 60 * 1000);
    });
  });
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
      // All unknown routes → index.html (SPA fallback)
      return net.fetch('file://' + path.join(distDir, 'index.html'));
    });
  }

  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
