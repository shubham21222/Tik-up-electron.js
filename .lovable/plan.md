
# Fix: Capture Viewer Avatar Images

## The Problem
The Points & Loyalty table shows letter-initial circles instead of real TikTok profile pictures. The database column `viewer_avatar_url` exists and the UI already renders it when available (line 243 of Points.tsx), but all 208 viewer records have `null` avatars.

## Root Cause
There are two webhook entry paths, and avatar capture may be failing in both:

1. **Bridge path** (desktop bridge sends events): The bridge sends `avatar` inside `event.data`, and the webhook reads it correctly on line 238. However, the EulerStream SDK field `data.user?.profilePictureUrl` may be `undefined` depending on the SDK version -- the field could be named `data.profilePictureUrl` or `data.user?.avatarThumb?.urlList?.[0]` instead.

2. **EulerStream native alert webhook path** (direct API alerts): The avatar comes in as `alert_creator_avatar_url` but may not be mapped into `eventData` correctly when calling `upsertViewerPoints`.

## Fix Plan

### 1. Update Bridge Avatar Extraction (bridge/index.js)
Add additional fallback fields for the EulerStream SDK avatar:
- `data.user?.avatarThumb?.urlList?.[0]` (protobuf format used by newer SDK versions)
- `data.user?.avatarMedium?.urlList?.[0]`
- `data.profilePictureUrl`

Apply this to all event handlers (GIFT, LIKE, FOLLOW, SHARE, CHAT).

### 2. Fix Native Alert Webhook Avatar Mapping (tiktok-webhook/index.ts)
Ensure the `parseAlertPayload` function passes `avatar` / `alert_creator_avatar_url` into the event data object so that `upsertViewerPoints` can extract it.

### 3. Backfill Script: Populate Existing Viewer Avatars
Since 208 existing viewers have no avatar, create a one-time approach:
- When a viewer interacts again and the avatar IS captured this time, the existing `upsertViewerPoints` update logic (line 315) already backfills it: `...(avatarUrl ? { viewer_avatar_url: avatarUrl } : {})`
- No separate migration needed -- avatars will populate naturally as viewers interact again after the fix

### 4. No UI Changes Needed
The Points.tsx table (line 243-253) already renders `viewer.avatar_url` as an `<img>` when it exists, with the letter-initial fallback. Once data flows in, images will appear automatically.

## Technical Details

### Files to Modify
- **bridge/index.js** -- Broaden avatar field extraction across all event handlers
- **supabase/functions/tiktok-webhook/index.ts** -- Ensure `parseAlertPayload` maps avatar into event data for `upsertViewerPoints`; also add the same broader fallback fields in the webhook's own avatar extraction

### Changes in bridge/index.js
For each event handler, update the avatar line from:
```javascript
avatar: data.user?.profilePictureUrl || data.profilePictureUrl || null
```
to:
```javascript
avatar: data.user?.profilePictureUrl
  || data.user?.avatarThumb?.urlList?.[0]
  || data.user?.avatarMedium?.urlList?.[0]
  || data.profilePictureUrl
  || null
```

### Changes in tiktok-webhook/index.ts
In `parseAlertPayload` (around line 1510), ensure `data.avatar` is set from `alert_creator_avatar_url`:
```typescript
const data: Record<string, unknown> = {
  avatar: avatarUrl,
  profilePictureUrl: avatarUrl,  // Add this fallback alias
};
```

Also add a log line to debug avatar presence during the next live session.
