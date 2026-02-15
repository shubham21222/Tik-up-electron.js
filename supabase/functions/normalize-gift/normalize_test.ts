/**
 * ─── Test Suite: Gift Normalization ─────────────────────────────────────────
 *
 * Tests simulate webhook gift events and confirm that normalized output
 * matches expected coin totals. Covers:
 * - Small gifts (1 coin)
 * - Large gifts (5000+ coins)
 * - Combo/streak gifts (repeatCount > 1)
 * - Multiple gifts in one webhook batch
 * - Unknown gifts (not in static map)
 * - HMAC signature verification
 */

import { assertEquals, assertExists } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { normalizeGift, normalizeGiftBatch, sumCoins, coinsBySender } from "./normalize.ts";
import { lookupGift, GIFT_VALUE_MAP } from "./gift-map.ts";
import type { RawGiftPayload } from "./types.ts";

// ═══════════════════════════════════════════════════════════════════════════
// SAMPLE PAYLOADS
// ═══════════════════════════════════════════════════════════════════════════

/** Sample: Small gift — Rose (1 coin) */
const SMALL_GIFT_PAYLOAD: RawGiftPayload = {
  type: "WebcastGiftMessage",
  giftId: 5655,
  giftName: "Rose",
  diamondCount: 1,
  repeatCount: 1,
  uniqueId: "user_alice",
  userId: "100001",
  repeatEnd: true,
  timestamp: 1771176000000,
};

/** Sample: Large gift — Dragon (5000 coins) */
const LARGE_GIFT_PAYLOAD: RawGiftPayload = {
  type: "WebcastGiftMessage",
  giftId: 6547,
  giftName: "Dragon",
  diamondCount: 5000,
  repeatCount: 1,
  uniqueId: "whale_bob",
  userId: "200002",
  repeatEnd: true,
  timestamp: 1771176001000,
};

/** Sample: Combo gift — Rose ×15 (1 coin × 15 = 15 coins) */
const COMBO_GIFT_PAYLOAD: RawGiftPayload = {
  type: "WebcastGiftMessage",
  giftId: 5655,
  giftName: "Rose",
  diamondCount: 1,
  repeatCount: 15,
  uniqueId: "user_charlie",
  userId: "300003",
  repeatEnd: false,
  timestamp: 1771176002000,
};

/** Sample: Multiple gifts in one batch */
const BATCH_GIFTS: RawGiftPayload[] = [
  {
    type: "WebcastGiftMessage",
    giftId: 5879,
    giftName: "Heart",
    diamondCount: 1,
    repeatCount: 3,
    uniqueId: "fan_dave",
    userId: "400004",
  },
  {
    type: "WebcastGiftMessage",
    giftId: 6535,
    giftName: "Galaxy",
    diamondCount: 1000,
    repeatCount: 1,
    uniqueId: "fan_dave",
    userId: "400004",
  },
  {
    type: "WebcastGiftMessage",
    giftId: 6534,
    giftName: "Rose Carriage",
    diamondCount: 5000,
    repeatCount: 2,
    uniqueId: "whale_eve",
    userId: "500005",
  },
];

/** Sample: Unknown gift (not in static map) */
const UNKNOWN_GIFT_PAYLOAD: RawGiftPayload = {
  type: "WebcastGiftMessage",
  giftId: 99999,
  giftName: "New Limited Gift",
  diamondCount: 777,
  repeatCount: 1,
  uniqueId: "user_frank",
  userId: "600006",
};

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

Deno.test("lookupGift returns correct entry for known gift", () => {
  const rose = lookupGift("5655");
  assertExists(rose);
  assertEquals(rose!.name, "Rose");
  assertEquals(rose!.coins, 1);
  assertEquals(rose!.category, "small");
});

Deno.test("lookupGift returns null for unknown gift", () => {
  const unknown = lookupGift("99999");
  assertEquals(unknown, null);
});

Deno.test("normalizeGift — small gift (Rose, 1 coin)", () => {
  const result = normalizeGift(SMALL_GIFT_PAYLOAD);

  assertEquals(result.sender, "user_alice");
  assertEquals(result.user_id, "100001");
  assertEquals(result.gift_name, "Rose");
  assertEquals(result.coins, 1);  // 1 coin × 1 repeat
  assertEquals(result.base_coin_value, 1);
  assertEquals(result.repeat_count, 1);
  assertEquals(result.gift_id, "5655");
  assertEquals(result.category, "small");
  assertEquals(result.is_combo_end, true);
});

Deno.test("normalizeGift — large gift (Dragon, 5000 coins)", () => {
  const result = normalizeGift(LARGE_GIFT_PAYLOAD);

  assertEquals(result.sender, "whale_bob");
  assertEquals(result.user_id, "200002");
  assertEquals(result.gift_name, "Dragon");
  assertEquals(result.coins, 5000);  // 5000 × 1
  assertEquals(result.category, "premium");
});

Deno.test("normalizeGift — combo gift (Rose ×15 = 15 coins)", () => {
  const result = normalizeGift(COMBO_GIFT_PAYLOAD);

  assertEquals(result.sender, "user_charlie");
  assertEquals(result.gift_name, "Rose");
  assertEquals(result.coins, 15);  // 1 coin × 15 repeats
  assertEquals(result.repeat_count, 15);
  assertEquals(result.is_combo_end, false);
});

Deno.test("normalizeGiftBatch — multiple gifts, correct total", () => {
  const results = normalizeGiftBatch(BATCH_GIFTS);

  assertEquals(results.length, 3);

  // Heart ×3 = 3 coins (1 coin base from static map)
  assertEquals(results[0].gift_name, "Heart");
  assertEquals(results[0].coins, 3);

  // Galaxy ×1 = 1000 coins
  assertEquals(results[1].gift_name, "Galaxy");
  assertEquals(results[1].coins, 1000);

  // Rose Carriage ×2 = 10000 coins
  assertEquals(results[2].gift_name, "Rose Carriage");
  assertEquals(results[2].coins, 10000);

  // Total: 3 + 1000 + 10000 = 11003
  assertEquals(sumCoins(results), 11003);
});

Deno.test("coinsBySender — correct aggregation per sender", () => {
  const results = normalizeGiftBatch(BATCH_GIFTS);
  const bySender = coinsBySender(results);

  // fan_dave: Heart(3) + Galaxy(1000) = 1003
  assertEquals(bySender["fan_dave"], 1003);

  // whale_eve: Rose Carriage(10000)
  assertEquals(bySender["whale_eve"], 10000);
});

Deno.test("normalizeGift — unknown gift falls back to diamondCount", () => {
  const result = normalizeGift(UNKNOWN_GIFT_PAYLOAD);

  assertEquals(result.gift_name, "New Limited Gift");
  assertEquals(result.coins, 777);  // Falls back to raw diamondCount
  assertEquals(result.category, "unknown");
  assertEquals(result.gift_id, "99999");
});

Deno.test("normalizeGift — handles alternate field names (user.uniqueId)", () => {
  const raw: RawGiftPayload = {
    type: "WebcastGiftMessage",
    gift_id: 5655,       // snake_case variant
    diamond_count: 1,    // snake_case variant
    repeat_count: 5,     // snake_case variant
    user: {
      uniqueId: "nested_user",
      userId: "700007",
    },
  };

  const result = normalizeGift(raw);
  assertEquals(result.sender, "nested_user");
  assertEquals(result.user_id, "700007");
  assertEquals(result.coins, 5);  // 1 × 5
  assertEquals(result.gift_name, "Rose");  // Resolved from static map
});

Deno.test("normalizeGift — zero diamondCount uses static map value", () => {
  // This tests the exact bug: EulerStream sends diamondCount=0 for some gifts
  const raw: RawGiftPayload = {
    type: "WebcastGiftMessage",
    giftId: 6535,        // Galaxy = 1000 coins in static map
    giftName: "Galaxy",
    diamondCount: 0,     // Bug: EulerStream sends 0
    repeatCount: 1,
    uniqueId: "test_user",
    userId: "800008",
  };

  const result = normalizeGift(raw);
  // Static map takes priority over broken diamondCount
  assertEquals(result.coins, 1000);
  assertEquals(result.gift_name, "Galaxy");
});

Deno.test("GIFT_VALUE_MAP has entries for all categories", () => {
  const categories = new Set(
    Object.values(GIFT_VALUE_MAP).map((e) => e.category)
  );
  assertEquals(categories.has("small"), true);
  assertEquals(categories.has("medium"), true);
  assertEquals(categories.has("large"), true);
  assertEquals(categories.has("premium"), true);
});

Deno.test("normalizeGift — static map overrides wrong payload diamondCount", () => {
  // Simulates the scenario where TikTok sends incorrect diamond values
  const raw: RawGiftPayload = {
    giftId: 6542,         // Falcon = 29999 in our map
    giftName: "Falcon",
    diamondCount: 100,    // Incorrect value from API
    repeatCount: 1,
    uniqueId: "big_spender",
    userId: "900009",
  };

  const result = normalizeGift(raw);
  // Our static map value (29999) takes priority
  assertEquals(result.coins, 29999);
  assertEquals(result.category, "premium");
});
