# Tik-Pro-Suite — Premium Features & Improvements Plan

**Created:** March 13, 2026
**Goal:** Premium overlays, working API, download app, TTS audio routing, user profile pictures in Points

---

## 1. TikTok API Provider — Current State & Fixes

### What You Have
- **EulerStream API** — WebSocket connection via `euler-jwt` edge function
- Events received: `roomInfo`, `WebcastLikeMessage`, `WebcastGiftMessage`, `WebcastMemberMessage` (follow), `WebcastSocialMessage` (share), `WebcastChatMessage`
- Avatar comes from: `data.profilePictureUrl` or `data.user?.profilePictureUrl`

### Known Issues
- **Some events may not include `profilePictureUrl`** — depends on EulerStream payload structure
- **WebcastRoomUserSeqMessage** — gives viewer count, not individual users with profiles
- Different API providers may send different field names: `profilePictureUrl`, `avatar_url`, `user.avatarThumb.urlList[0]`

### Plan
| Step | Task | Priority |
|------|------|----------|
| 1.1 | Audit `use-tiktok-live.tsx` — ensure all event types extract avatar from all possible field names | High |
| 1.2 | Add fallback: if `profilePictureUrl` is missing, call EulerStream user info endpoint `GET https://tiktok.eulerstream.com/webcast/user_info?uniqueId={username}` | Medium |
| 1.3 | Log missing-avatar events in dev to identify which event types fail | Low |

---

## 2. Premium-Looking Overlays & Alerts

### Current Design
- Glass, neon, solid background styles
- Framer Motion animations (slide, explosion, flip_3d, glitch, etc.)
- Multiple font options (Inter, Space Grotesk, Orbitron, Bebas, Press Start)
- Gift alerts, like alerts, follow, share, leaderboard, TTS, etc.

### Plan for Premium Look
| Step | Task | Files |
|------|------|-------|
| 2.1 | Add new "premium" overlay style preset: subtle grain, soft glow, refined borders | GiftAlertRenderer, LikeAlertRenderer, etc. |
| 2.2 | Improve typography: better font pairing, letter-spacing, text shadows | All overlay renderers |
| 2.3 | Add micro-interactions: hover states, entrance delays, stagger | Framer Motion variants |
| 2.4 | Higher-quality gift images: use TikTok CDN URLs or local fallbacks | Gift map / alert data |
| 2.5 | Consistent color palette: CSS variables for premium accent colors | tailwind.config / overlay settings |
| 2.6 | Reference competitor websites for design inspiration | External |

---

## 3. App Download Capability

### Current State
- **Download page exists** at `/download`
- Fetches GitHub releases from `tikup-gg/tikup`
- Offers Windows (.exe), macOS (.dmg), Linux (.appimage, .deb)

### What Works
- Download links for platform-specific installers
- "Virtual Audio Routing" — TTS → VB-Audio Cable / BlackHole → Live Studio
- Keystroke triggers for GTA etc.
- System tray mode

### Plan
| Step | Task | Notes |
|------|------|-------|
| 3.1 | Ensure GitHub releases exist and are up-to-date | Check tikup-gg/tikup releases |
| 3.2 | Desktop app must select virtual audio device for TTS → stream | Already in plan per Download page |

---

## 4. TTS Chat — Audio Through Computer to Live Studio

### How It Works
- **TTSRenderer** subscribes to Supabase Realtime `tts-{publicToken}`
- Plays via: (1) ElevenLabs (pre-generated audio) or (2) Browser Web Speech API
- Audio plays on **system default output** (speakers/headphones)

### For Live Studio Capture
- OBS and TikTok Live Studio browser sources **can** capture audio from a browser tab when "capture audio" is enabled on the source — but this only captures to the default audio mix.
- **The real reason for the desktop app** is to route TTS to a **specific virtual audio device** (VB-Audio Cable / BlackHole) that the streamer selects as a mic input in Live Studio. This gives precise control over which audio channel TTS plays on, independently of system audio.

### Plan
| Step | Task | Notes |
|------|------|-------|
| 4.1 | Document setup: Install VB-Audio Cable or BlackHole | Add to /download or /setup |
| 4.2 | Desktop app: implement virtual device selection and route TTS there | In tikup desktop repo |
| 4.3 | Web-only users: show clear message "TTS plays on your speakers — use desktop app to route to a specific audio channel in Live Studio" | TTSOverlayPage, Setup |

---

## 5. User Points — Fetch & Show TikTok Profile Pictures

### Current Flow
- Events (gift, like, chat, follow, share) include `profilePictureUrl` or `avatar_url`
- `tiktok-webhook` upserts `viewer_points` and sets `viewer_avatar_url` when available
- Points page shows: avatar if present, else fallback to first letter

### Problem
- **Not all events** from the API include avatar URLs
- **Room users who haven't interacted** — no event = no avatar
- **Existing rows** may have `viewer_avatar_url = null` if past events didn't have it

### Plan

| Step | Task | Implementation |
|------|------|----------------|
| 5.1 | Ensure avatar is extracted for every event type in **both** `use-tiktok-live.tsx` (client-side) and `bridge/index.js` (server-side, primary production path — avatar extraction at lines 170, 179, 187, 194, 202, 216) | Add `user?.avatarThumb?.urlList?.[0]`, `avatar_url` fallbacks in both files |
| 5.2 | Add edge function `fetch-avatar` | Call EulerStream `GET /webcast/user_info?uniqueId={username}` to get profile pic by username |
| 5.3 | On Points page load: for each viewer where `viewer_avatar_url IS NULL`, call the `fetch-avatar` edge function by `viewer_username` and update the row | Trigger on page load; Supabase pg_cron is overkill for this use case |
| 5.4 | Points page: lazy-load avatar with retry if 404 | Use `onError` fallback to initials |
| 5.5 | TikTok public profile APIs — **caveat:** Official API is restricted. Use EulerStream's `GET /webcast/user_info?uniqueId={username}` endpoint | EulerStream base URL: `https://tiktok.eulerstream.com` |

### Avatar Fallback Priority
1. `eventData.profilePictureUrl`
2. `eventData.avatar_url`
3. `eventData.avatar`
4. `eventData.user?.profilePictureUrl`
5. `eventData.user?.avatarThumb?.urlList?.[0]`
6. **Fetch from EulerStream profile API** by username
7. **Final fallback:** Initial letter + gradient background (already in place)

---

## 6. Implementation Order (Suggested)

1. **API & Avatars (5.1, 1.1)** — Fix event parsing in both `use-tiktok-live.tsx` and `bridge/index.js` so avatars are captured whenever API sends them
2. **Points profile fetch (5.2, 5.3)** — Backfill missing avatars via EulerStream profile API on Points page load
3. **Premium overlay styling (2.1–2.5)** — Visual refresh
4. **TTS & download docs (4.1, 4.3)** — Clear setup instructions
5. **Desktop app (4.2, 3.1)** — Ensure releases exist and virtual audio works

---

## 7. Quick Wins

- [ ] Add `user?.avatarThumb?.urlList?.[0]` fallback in `use-tiktok-live.tsx` and `bridge/index.js` for all event types
- [ ] Points page: add `referrerPolicy="no-referrer"` on avatar `<img>` to avoid blocked loads — **and** handle `onError` to re-fetch when the URL has expired (TikTok CDN URLs on `p16-sign.tiktokcdn.com` / `p77-sign.tiktokcdn.com` include expiry tokens that make cached URLs from old events go stale)
- [ ] Add "Premium" badge or style toggle in overlay settings
- [ ] Link to Download page from dashboard/sidebar if not already present
