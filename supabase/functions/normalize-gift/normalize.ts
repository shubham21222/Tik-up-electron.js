/**
 * ─── Gift Normalization Logic ───────────────────────────────────────────────
 *
 * This module takes raw EulerStream gift payloads and produces a clean,
 * normalized JSON object with accurate coin values.
 *
 * NORMALIZATION STEPS:
 * 1. Extract gift ID from the raw payload (handles multiple field names)
 * 2. Look up the gift in our static GIFT_VALUE_MAP for accurate coin values
 * 3. If the gift is not in the static map, fall back to the payload's
 *    `diamondCount` field (which may be inaccurate for some gifts)
 * 4. Multiply base coin value by `repeatCount` to get total coins
 * 5. Extract sender info (username + numeric ID)
 * 6. Return a clean NormalizedGift object
 *
 * WHY NORMALIZATION IS NEEDED:
 * - EulerStream's `diamondCount` field is sometimes 0 for certain gifts
 * - The `coinValue` field may not be present in all payload formats
 * - Gift names may be missing or use internal codes
 * - repeatCount handling varies between single and combo gifts
 */

import { lookupGift, type GiftEntry } from "./gift-map.ts";
import type { RawGiftPayload, NormalizedGift } from "./types.ts";

/**
 * Normalize a single raw gift payload into a clean NormalizedGift.
 *
 * @param raw - The raw gift event from EulerStream webhook/WebSocket
 * @param fallbackMap - Optional dynamic gift map fetched from the live API
 * @returns NormalizedGift with accurate {GIFT_VALUE_COINS}
 */
export function normalizeGift(
  raw: RawGiftPayload,
  fallbackMap?: Record<string, GiftEntry>
): NormalizedGift {
  // ── Step 1: Extract gift ID ───────────────────────────────────────
  const giftId = String(raw.giftId ?? raw.gift_id ?? "0");

  // ── Step 2: Look up in static map, then fallback map ─────────────
  const staticEntry = lookupGift(giftId);
  const dynamicEntry = fallbackMap?.[giftId] ?? null;
  const entry = staticEntry ?? dynamicEntry;

  // ── Step 3: Determine base coin value ─────────────────────────────
  // Priority: static map > dynamic map > raw payload diamondCount > 0
  const baseCoinValue = entry?.coins
    ?? Number(raw.diamondCount ?? raw.diamond_count ?? raw.coinValue ?? raw.coin_value ?? 0);

  // ── Step 4: Calculate total coins (base × repeatCount) ────────────
  const repeatCount = Number(raw.repeatCount ?? raw.repeat_count ?? 1);
  const totalCoins = baseCoinValue * repeatCount;

  // ── Step 5: Extract sender info ───────────────────────────────────
  const SENDER_NAME = raw.uniqueId ?? raw.user?.uniqueId ?? "unknown";
  const SENDER_ID = String(raw.userId ?? raw.user_id ?? raw.user?.userId ?? "0");
  const GIFT_NAME = raw.giftName ?? raw.gift_name ?? entry?.name ?? "Unknown Gift";

  // ── Step 6: Build normalized output ───────────────────────────────
  return {
    sender: SENDER_NAME,
    user_id: SENDER_ID,
    gift_name: GIFT_NAME,
    coins: totalCoins,
    base_coin_value: baseCoinValue,
    repeat_count: repeatCount,
    gift_id: giftId,
    category: entry?.category ?? "unknown",
    is_combo_end: raw.repeatEnd === true,
    timestamp: new Date(raw.timestamp ?? Date.now()).toISOString(),
  };
}

/**
 * Normalize an array of raw gift payloads (e.g. from a batched webhook).
 */
export function normalizeGiftBatch(
  raws: RawGiftPayload[],
  fallbackMap?: Record<string, GiftEntry>
): NormalizedGift[] {
  return raws.map((raw) => normalizeGift(raw, fallbackMap));
}

/**
 * Calculate total coins from a batch of normalized gifts,
 * useful for per-user aggregation.
 *
 * HOW TO STORE ACCURATE COIN TOTALS PER USER IN A DATABASE:
 * 1. On each gift event, call normalizeGift() to get the accurate coin value
 * 2. INSERT into your events table: { user_id, gift_id, coins, timestamp }
 * 3. To get a user's total: SELECT SUM(coins) FROM gifts WHERE creator_id = ?
 * 4. For real-time totals, maintain a running counter in a `viewer_points`
 *    table and UPDATE ... SET total_coins = total_coins + normalized.coins
 * 5. Use database transactions to prevent race conditions on concurrent gifts
 */
export function sumCoins(gifts: NormalizedGift[]): number {
  return gifts.reduce((sum, g) => sum + g.coins, 0);
}

/**
 * Group normalized gifts by sender and sum their coins.
 * Returns a map of { sender_name => total_coins }.
 */
export function coinsBySender(gifts: NormalizedGift[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const g of gifts) {
    map[g.sender] = (map[g.sender] ?? 0) + g.coins;
  }
  return map;
}
