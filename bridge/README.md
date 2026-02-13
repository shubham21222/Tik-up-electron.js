# TikUp Bridge v2.0 — Auto-Connect

A multi-user Node.js bridge that **automatically connects to all linked TikTok LIVE streams** and forwards events to TikUp.

## Requirements

- **Node.js 18+**
- **EulerStream API key** (set as `TIKTOK_DATA_API_KEY`)
- **Supabase service role key** (set as `SUPABASE_SERVICE_ROLE_KEY`)

## Setup

```bash
cd bridge
npm install
```

## Usage

```bash
# Set required environment variables
export TIKTOK_DATA_API_KEY="your_euler_api_key"
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

# Start the bridge
npm start
```

## How it works

1. Polls the database every 30s for users with `tiktok_connected = true`
2. Automatically connects to each user's TikTok LIVE stream using EulerStream signed WebSocket
3. Batches events every 500ms and sends them to the TikUp webhook
4. Automatically disconnects when users unlink their TikTok username
5. Retries offline users on the next poll cycle

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TIKTOK_DATA_API_KEY` | ✅ | EulerStream API key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key |
| `SUPABASE_URL` | ❌ | Defaults to project URL |
| `WEBHOOK_URL` | ❌ | Defaults to tiktok-webhook function |
| `POLL_INTERVAL_MS` | ❌ | Polling interval (default: 30000ms) |

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
