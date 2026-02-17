// ═══════════════════════════════════════════════════════════
// TikUp Desktop – Renderer Process
// ═══════════════════════════════════════════════════════════

const $ = (sel) => document.querySelector(sel);
const show = (id) => { document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); $(id).classList.add('active'); };

let audioContext = null;
let selectedDevice = null;
let isConnected = false;

// ─── Boot ────────────────────────────────────────────────
(async () => {
  const { user } = await window.tikup.auth.restoreSession();
  if (user) {
    await loadDashboard();
  }
})();

// ─── Login ───────────────────────────────────────────────
$('#btn-login').addEventListener('click', async () => {
  const email = $('#login-email').value.trim();
  const password = $('#login-password').value;
  if (!email || !password) return;

  const result = await window.tikup.auth.signIn({ email, password });
  if (result.error) {
    $('#login-error').textContent = result.error;
    $('#login-error').style.display = 'block';
    return;
  }
  await loadDashboard();
});

// ─── Dashboard ───────────────────────────────────────────
async function loadDashboard() {
  show('#screen-dashboard');
  const { profile } = await window.tikup.profile.get();
  if (profile) {
    $('#dash-greeting').textContent = `Welcome, ${profile.display_name || 'Creator'}`;
    $('#dash-username').textContent = profile.tiktok_username
      ? `@${profile.tiktok_username} · ${profile.plan_type.toUpperCase()}`
      : 'No TikTok username set';
  }
  await scanAudioDevices();
}

// ─── Sign Out ────────────────────────────────────────────
$('#btn-signout').addEventListener('click', async () => {
  await window.tikup.auth.signOut();
  show('#screen-login');
});

// ─── Audio Device Scanning ───────────────────────────────
async function scanAudioDevices() {
  const container = $('#device-list');
  try {
    // Request permission first
    await navigator.mediaDevices.getUserMedia({ audio: true });
    const devices = await navigator.mediaDevices.enumerateDevices();
    const outputs = devices.filter(d => d.kind === 'audiooutput');
    const { knownVirtualDrivers } = await window.tikup.audio.detectDevices();

    if (outputs.length === 0) {
      container.innerHTML = '<p class="text-sm" style="color:var(--danger)">No audio output devices found.</p>';
      return;
    }

    const savedDevice = await window.tikup.store.get('selectedAudioDevice');
    container.innerHTML = '';

    outputs.forEach(device => {
      const isVirtual = knownVirtualDrivers.some(d =>
        device.label.toLowerCase().includes(d.toLowerCase().split(' ')[0])
      );
      const div = document.createElement('div');
      div.className = `device-item${savedDevice === device.deviceId ? ' selected' : ''}`;
      div.innerHTML = `
        <div>
          <div class="device-name">${device.label || 'Unknown Device'}</div>
          <div class="device-type">${isVirtual ? '🟢 Virtual Audio Device' : 'System Audio'}</div>
        </div>
        ${isVirtual ? '<span class="text-accent text-sm">Recommended</span>' : ''}
      `;
      div.addEventListener('click', () => selectDevice(device.deviceId, div));
      container.appendChild(div);

      if (savedDevice === device.deviceId) {
        selectedDevice = device.deviceId;
      }
    });
  } catch (err) {
    container.innerHTML = `<p class="text-sm" style="color:var(--danger)">Audio permission denied. Please allow microphone access.</p>`;
  }
}

function selectDevice(deviceId, element) {
  document.querySelectorAll('.device-item').forEach(el => el.classList.remove('selected'));
  element.classList.add('selected');
  selectedDevice = deviceId;
  window.tikup.store.set('selectedAudioDevice', deviceId);
}

// ─── Connect to LIVE ─────────────────────────────────────
$('#btn-connect').addEventListener('click', async () => {
  const { profile } = await window.tikup.profile.get();
  if (!profile?.tiktok_username) {
    addEvent('⚠️ Set your TikTok username in the TikUp web dashboard first.');
    return;
  }

  await window.tikup.realtime.subscribe({ tiktokUsername: profile.tiktok_username });
  isConnected = true;
  updateConnectionUI(true, profile.tiktok_username);
  addEvent(`✅ Connected to @${profile.tiktok_username}`);
});

$('#btn-disconnect').addEventListener('click', async () => {
  await window.tikup.realtime.unsubscribe();
  isConnected = false;
  updateConnectionUI(false);
  addEvent('🔴 Disconnected');
});

function updateConnectionUI(connected, username) {
  const dot = $('#connection-dot');
  dot.className = `status-dot ${connected ? 'online' : 'offline'}`;
  $('#connection-status').textContent = connected
    ? `Connected to @${username} · Listening for events`
    : 'Not connected';
  $('#btn-connect').style.display = connected ? 'none' : '';
  $('#btn-disconnect').style.display = connected ? '' : 'none';
}

// ─── Event Feed ──────────────────────────────────────────
function addEvent(msg) {
  const feed = $('#event-feed');
  const time = new Date().toLocaleTimeString();
  const div = document.createElement('div');
  div.className = 'text-sm';
  div.style.padding = '6px 0';
  div.style.borderBottom = '1px solid rgba(255,255,255,0.04)';
  div.innerHTML = `<span style="color:var(--text-muted)">${time}</span> ${msg}`;
  feed.prepend(div);
  // Keep max 50 items
  while (feed.children.length > 50) feed.removeChild(feed.lastChild);
}

// ─── TTS Playback via Virtual Audio ──────────────────────
window.tikup.on.ttsPlay(async (data) => {
  addEvent(`🗣️ TTS: "${data.text}" by ${data.username}`);
  if (data.audio_url) {
    try {
      const audio = new Audio(data.audio_url);
      if (selectedDevice && audio.setSinkId) {
        await audio.setSinkId(selectedDevice);
      }
      audio.volume = (data.volume || 80) / 100;
      await audio.play();
      animateMeter();
    } catch (err) {
      addEvent(`⚠️ Audio playback error: ${err.message}`);
    }
  }
});

// ─── Gift & Chat Events ─────────────────────────────────
window.tikup.on.gift((data) => {
  addEvent(`🎁 <span class="text-accent">${data.username}</span> sent ${data.gift_name} (${data.coins} coins)`);
});

window.tikup.on.chat((data) => {
  addEvent(`💬 <span style="color:#aaa">${data.username}:</span> ${data.message}`);
});

// ─── Audio Meter Animation ───────────────────────────────
function animateMeter() {
  const meter = $('#audio-meter');
  let width = 80;
  meter.style.width = width + '%';
  const interval = setInterval(() => {
    width -= 4;
    if (width <= 0) { clearInterval(interval); width = 0; }
    meter.style.width = width + '%';
  }, 50);
}
