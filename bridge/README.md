# TikUp Bridge — TikTok LIVE Connector

A lightweight Node.js script that connects to a TikTok LIVE stream and forwards all events (gifts, likes, follows, shares, chat, viewer count) to the TikUp webhook.

## Requirements

- **Node.js 18+** (for native `fetch`)
- The TikTok user must be **currently LIVE**

## Setup

```bash
cd bridge
npm install
```

## Usage

```bash
# Pass username as argument
node index.js your_tiktok_username

# Or use environment variables
TIKTOK_USERNAME=your_tiktok_username node index.js
```

## How it works

1. Connects to the TikTok LIVE stream using `tiktok-live-connector`
2. Listens for gifts, likes, follows, shares, chat messages, and viewer count updates
3. Batches events every 500ms and sends them to the TikUp webhook edge function
4. The webhook broadcasts events to all active overlays via Supabase Realtime

## Events forwarded

| Event | Data |
|-------|------|
| 🎁 Gift | gift name, diamond count, repeat count |
| ❤️ Like | like count, total likes |
| ➕ Follow | username, avatar |
| 🔗 Share | username, avatar |
| 💬 Chat | message, avatar |
| 👁 Viewer Count | current viewer count |
| ⭐ Subscribe | username, avatar |
