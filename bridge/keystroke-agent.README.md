# TikUp Keystroke Agent

Desktop companion that fires OS-level keystrokes when TikTok gifts arrive on your stream.

## How It Works

1. You set up gift → keystroke mappings in the TikUp dashboard (Keystroke Triggers page)
2. The agent runs on your computer and listens for gift events in real-time
3. When a matching gift is received, it fires the configured keystroke on your OS
4. This can trigger OBS hotkeys, game macros, sound boards, or any keyboard-driven tool

## Requirements

- **Node.js** 18+
- **robotjs** (native keyboard control — requires build tools)
  - Windows: `npm install --global windows-build-tools`
  - macOS: Xcode Command Line Tools
  - Linux: `sudo apt install build-essential libxtst-dev`

## Install

```bash
cd bridge
npm install @supabase/supabase-js robotjs
```

## Setup

Set these environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Your project's service role key |
| `TIKUP_USER_ID` | ✅ | Your user UUID (find in Settings) |
| `SUPABASE_URL` | ❌ | Defaults to the TikUp project URL |
| `ACTIVE_PROFILE_ID` | ❌ | Game profile ID (auto-detects first profile if not set) |

## Run

```bash
# Basic
SUPABASE_SERVICE_ROLE_KEY=xxx TIKUP_USER_ID=xxx node keystroke-agent.js

# With specific game profile
ACTIVE_PROFILE_ID=abc123 SUPABASE_SERVICE_ROLE_KEY=xxx TIKUP_USER_ID=xxx node keystroke-agent.js
```

## Game Profiles

If you've set up multiple game profiles in the dashboard (e.g., "Fortnite", "Just Chatting"), you can switch which profile the agent uses:

- **Auto-detect**: Leave `ACTIVE_PROFILE_ID` empty — uses your first profile
- **Specific profile**: Set `ACTIVE_PROFILE_ID` to the profile ID
- **Switch profiles**: Restart the agent with a different `ACTIVE_PROFILE_ID`

## Running Alongside the Bridge

The keystroke agent is separate from the TikTok bridge. Run both:

```bash
# Terminal 1 — Bridge (captures TikTok events)
node index.js

# Terminal 2 — Keystroke Agent (fires keystrokes)
node keystroke-agent.js
```

## Supported Keys

All standard keys, function keys (F1-F12), and modifier combos:
- Single keys: `SPACE`, `ENTER`, `A`-`Z`, `0`-`9`
- Combos: `CTRL + SPACE`, `CTRL + SHIFT + H`, `ALT + F`
- Function keys: `F1` through `F12`

## Security Note

The agent uses your service role key to read trigger configs and subscribe to realtime events. Keep this key private and never share it.

## Troubleshooting

- **"robotjs not installed"**: Run `npm install robotjs` with build tools installed
- **"No active gift_alert widgets"**: Make sure you have a Gift Alert overlay created and active in the dashboard
- **Keys not firing**: On macOS, grant Terminal/Node accessibility permissions (System Preferences → Privacy → Accessibility)
- **Agent not receiving events**: Ensure the TikTok bridge is running and your TikTok account is connected
