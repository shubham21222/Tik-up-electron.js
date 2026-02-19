

## Cost-Based TTS Cap ($3/user/month)

Instead of a rigid 500-snippet daily cap, we'll track actual ElevenLabs cost per user per billing cycle and block TTS once they exceed $3 of estimated usage.

### How It Works

ElevenLabs charges approximately **$0.30 per 1,000 characters**. So a $3 cap equals roughly **10,000 characters per month**.

The `tts_queue` table already logs every TTS generation with the `text_content` field, so we can calculate monthly character usage without any new tables.

### Changes

**1. New DB table: `tts_usage_monthly`** (migration)

A lightweight table to track monthly character consumption per user, avoiding expensive full-table scans on `tts_queue` every request.

| Column | Type | Purpose |
|--------|------|---------|
| `id` | uuid | Primary key |
| `user_id` | uuid | Owner |
| `month_key` | text | e.g. `"2026-02"` |
| `total_characters` | integer | Running total of chars used |
| `estimated_cost_cents` | integer | Running cost in cents (chars * 0.03) |
| `updated_at` | timestamptz | Last update |

Unique constraint on `(user_id, month_key)`. RLS: users can read/insert/update own rows.

**2. Update `tts-generate` Edge Function**

Before calling ElevenLabs:
- Query `tts_usage_monthly` for the current month
- If `estimated_cost_cents >= 300` (i.e. $3.00), return a 429 error: "Monthly TTS budget reached"
- After successful generation, upsert the usage row adding `text.length` characters and recalculating cost

**3. Update `tiktok-webhook` auto-TTS path**

Same check before generating auto-TTS during live streams -- query the user's monthly usage and skip TTS if the $3 cap is hit.

**4. Update `use-subscription.tsx` (frontend)**

- Change `daily_tts_snippets` references to a cost-based model
- Update `FEATURE_COMPARISON` to show `"$3/mo budget*"` instead of `"500/day*"` for Pro TTS
- Keep Free tier at a lower cap (e.g. `$0.50/mo budget`)

**5. Update `Pro.tsx` disclaimer**

Change the fair usage footnote from "500 snippets/day" to reference the $3/month TTS budget.

### Technical Details

**Cost formula used in the edge function:**
```
cost_cents = Math.ceil(total_characters * 0.03)
```
(Since ElevenLabs = $0.30/1k chars = 0.03 cents per character)

**Month key format:** `YYYY-MM` derived from `new Date().toISOString().slice(0, 7)`

**Upsert pattern** (edge function, after successful TTS generation):
```sql
INSERT INTO tts_usage_monthly (user_id, month_key, total_characters, estimated_cost_cents)
VALUES ($1, $2, $chars, $cost)
ON CONFLICT (user_id, month_key)
DO UPDATE SET
  total_characters = tts_usage_monthly.total_characters + $chars,
  estimated_cost_cents = CEIL((tts_usage_monthly.total_characters + $chars) * 0.03),
  updated_at = now();
```

**Free vs Pro caps:**
- Free: $0.50/month (approx 1,667 characters)
- Pro: $3.00/month (approx 10,000 characters)

The edge function will check the user's plan via `check-subscription` or the local `subscriptions` table to determine which cap applies.

