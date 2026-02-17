# TikUp Desktop Companion

A native Electron desktop app that connects to your TikUp account and routes TTS audio through virtual audio devices for TikTok LIVE Studio.

## Features

- 🔐 **Secure Auth** – Sign in with your TikUp account (encrypted token storage)
- 🔊 **Virtual Audio Routing** – Route TTS audio to a virtual mic (VB-Audio Cable, VoiceMeeter, BlackHole)
- 📡 **Realtime Events** – Live feed of gifts, chats, follows from your TikTok LIVE stream
- 🗣️ **TTS Playback** – Plays TTS audio through your selected output device
- 🖥️ **System Tray** – Runs in background with quick access

## Prerequisites

1. **Node.js 18+** and **npm** or **yarn**
2. **Virtual Audio Driver** (pick one):
   - 🪟 Windows: [VB-Audio Virtual Cable](https://vb-audio.com/Cable/) (free)
   - 🍎 macOS: [BlackHole](https://existential.audio/blackhole/) (free)
   - 🐧 Linux: PulseAudio null sink

## Setup

```bash
cd desktop
npm install
npm start
```

## Build for Distribution

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

## How It Works

1. **Sign in** with your TikUp email/password
2. **Select a virtual audio device** from the detected list
3. **Click "Connect to LIVE"** to start receiving TikTok events
4. **In TikTok LIVE Studio**, set your microphone to the virtual audio cable output
5. TTS audio plays through the virtual device → LIVE Studio picks it up → viewers hear it

## Architecture

```
┌─────────────────────────────────────────────┐
│  TikUp Desktop (Electron)                   │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
│  │ Auth     │  │ Realtime │  │ Audio     │ │
│  │ (IPC)    │──│ (Supa RT)│──│ (Web API) │ │
│  └──────────┘  └──────────┘  └───────────┘ │
│       │              │              │       │
│       ▼              ▼              ▼       │
│  electron-store  Supabase WS   setSinkId()  │
│  (encrypted)     channels      → Virtual    │
│                                  Audio Dev  │
└─────────────────────────────────────────────┘
         │                            │
         ▼                            ▼
   TikUp Cloud API            TikTok LIVE Studio
   (auth, profiles)           (mic input = virtual cable)
```

## Phone Stream Mode (Coming Soon)

For creators streaming from their phone:
- EQ presets optimized for speaker-to-phone-mic pickup
- Audio compression and noise gate
- Live audio meter for positioning
- Step-by-step guided setup

## Security

- Sessions are encrypted at rest via `electron-store`
- Context isolation enabled (no `nodeIntegration`)
- All Supabase communication over TLS
- No credentials stored in plain text
```
