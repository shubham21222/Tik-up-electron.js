/**
 * ─── TikTok Gift → Coin Value Mapping ───────────────────────────────────────
 *
 * This is a curated mapping of TikTok LIVE gift IDs to their official
 * coin values. TikTok uses "coins" as the in-app currency (1 coin ≈ $0.0105 USD).
 *
 * HOW VALUES ARE DETERMINED:
 * - Values come from TikTok's gift_info API via EulerStream's
 *   `webcast/gift_info` endpoint (`diamond_count` field).
 * - TikTok internally calls them "diamonds" but they map 1:1 to coins
 *   that viewers spend (1 diamond = 1 coin).
 *
 * HOW TO UPDATE WHEN NEW GIFTS ARE RELEASED:
 * 1. Call the EulerStream gift_info endpoint:
 *    GET https://tiktok.eulerstream.com/webcast/gift_info?room_id={ROOM_ID}
 * 2. Parse `response.data.gifts[]` — each gift has `id`, `name`, `diamond_count`.
 * 3. Add new entries below: GIFT_VALUE_MAP[gift.id] = { name: gift.name, coins: gift.diamond_count }
 * 4. The `normalizeGift()` function falls back to the live API if a gift ID
 *    isn't in this static map, so new gifts still work — just slower.
 *
 * ACCURACY NOTE:
 * - Some gifts are "combo gifts" where `repeatCount` multiplies the base value.
 * - The total coin value = base_coin_value × repeatCount.
 * - Streak/combo gifts send multiple WebcastGiftMessage events with increasing repeatCount.
 */

export interface GiftEntry {
  name: string;
  coins: number;         // Official coin cost (1 coin = 1 diamond)
  category?: "small" | "medium" | "large" | "premium";
}

/**
 * Static gift value map indexed by TikTok gift ID.
 * Values accurate as of February 2026.
 *
 * Categories:
 *   small   = 1–49 coins
 *   medium  = 50–499 coins
 *   large   = 500–4999 coins
 *   premium = 5000+ coins
 */
export const GIFT_VALUE_MAP: Record<string, GiftEntry> = {
  // ── Small Gifts (1–49 coins) ──────────────────────────────────────
  "5655":  { name: "Rose",               coins: 1,     category: "small" },
  "5487":  { name: "GG",                 coins: 1,     category: "small" },
  "5879":  { name: "Heart",              coins: 1,     category: "small" },
  "6064":  { name: "Ice Cream Cone",     coins: 1,     category: "small" },
  "6090":  { name: "Finger Heart",       coins: 5,     category: "small" },
  "5939":  { name: "Perfume",            coins: 20,    category: "small" },
  "7093":  { name: "Doughnut",           coins: 30,    category: "small" },
  "6560":  { name: "Tiny Diny",          coins: 5,     category: "small" },
  "7167":  { name: "Thumbs Up",          coins: 1,     category: "small" },
  "7169":  { name: "Hello",              coins: 1,     category: "small" },
  "6426":  { name: "TikTok",             coins: 1,     category: "small" },
  "5827":  { name: "Weights",            coins: 1,     category: "small" },
  "6080":  { name: "BFF Necklace",       coins: 1,     category: "small" },
  "5500":  { name: "Like",               coins: 5,     category: "small" },
  "7520":  { name: "Kiss Your Heart",    coins: 5,     category: "small" },
  "5570":  { name: "Friendship Necklace", coins: 10,   category: "small" },
  "7125":  { name: "Hat and Mustache",   coins: 10,    category: "small" },
  "7274":  { name: "LIVE Star",          coins: 10,    category: "small" },

  // ── Medium Gifts (50–499 coins) ───────────────────────────────────
  "5900":  { name: "Panda",              coins: 5,     category: "small" },
  "6532":  { name: "Hand Hearts",        coins: 100,   category: "medium" },
  "5917":  { name: "Love You",           coins: 25,    category: "small" },
  "7934":  { name: "Corgi",              coins: 30,    category: "small" },
  "6027":  { name: "Sunglasses",         coins: 50,    category: "medium" },
  "6432":  { name: "Birthday Cake",      coins: 50,    category: "medium" },
  "5928":  { name: "Concert",            coins: 100,   category: "medium" },
  "7316":  { name: "Cap",                coins: 99,    category: "medium" },
  "7095":  { name: "Family",             coins: 100,   category: "medium" },
  "5919":  { name: "Heart Me",           coins: 100,   category: "medium" },
  "6784":  { name: "Garland",            coins: 100,   category: "medium" },
  "6334":  { name: "Glowing Jellyfish",  coins: 100,   category: "medium" },
  "7103":  { name: "Gift Box",           coins: 100,   category: "medium" },
  "7510":  { name: "Cheer You Up",       coins: 199,   category: "medium" },
  "6346":  { name: "Hands Up",           coins: 100,   category: "medium" },
  "6349":  { name: "Confetti",           coins: 100,   category: "medium" },
  "6088":  { name: "Paper Crane",        coins: 99,    category: "medium" },
  "6425":  { name: "Lock and Key",       coins: 199,   category: "medium" },
  "7086":  { name: "Butterfly",          coins: 200,   category: "medium" },
  "7305":  { name: "Star",               coins: 99,    category: "medium" },
  "7046":  { name: "Hands Heart",        coins: 100,   category: "medium" },
  "6431":  { name: "VIP Entrance",       coins: 200,   category: "medium" },
  "11046": { name: "Gem Gun",            coins: 500,   category: "large" },

  // ── Large Gifts (500–4999 coins) ──────────────────────────────────
  "6537":  { name: "Travel with You",    coins: 500,   category: "large" },
  "7521":  { name: "Lucky Airdrop Box",  coins: 500,   category: "large" },
  "7100":  { name: "Money Gun",          coins: 500,   category: "large" },
  "6535":  { name: "Galaxy",             coins: 1000,  category: "large" },
  "6539":  { name: "Whale Diving",       coins: 1000,  category: "large" },
  "6523":  { name: "Rocket",             coins: 1000,  category: "large" },
  "6525":  { name: "Sports Car",         coins: 1000,  category: "large" },
  "7089":  { name: "Sunset Speedway",    coins: 1000,  category: "large" },
  "6208":  { name: "Fireworks",          coins: 1088,  category: "large" },
  "6533":  { name: "Private Jet",        coins: 2000,  category: "large" },
  "6581":  { name: "Interstellar",       coins: 2000,  category: "large" },
  "6271":  { name: "Golden Party",       coins: 3000,  category: "large" },
  "6340":  { name: "Yacht",              coins: 3000,  category: "large" },
  "7381":  { name: "Lucky Airdrop",      coins: 3000,  category: "large" },
  "7097":  { name: "Lion",               coins: 29999, category: "premium" },

  // ── Premium Gifts (5000+ coins) ───────────────────────────────────
  "6534":  { name: "Rose Carriage",      coins: 5000,  category: "premium" },
  "7382":  { name: "Meteor Shower",      coins: 5000,  category: "premium" },
  "6547":  { name: "Dragon",             coins: 5000,  category: "premium" },
  "13651": { name: "Castle Fantasy",     coins: 5000,  category: "premium" },
  "7383":  { name: "Love Bomb",          coins: 5000,  category: "premium" },
  "5760":  { name: "TikTok Universe",    coins: 34999, category: "premium" },
  "7087":  { name: "Adam's Dream",       coins: 10000, category: "premium" },
  "6584":  { name: "Leon and Lion",      coins: 10000, category: "premium" },
  "6536":  { name: "Rosa Nebula",        coins: 15000, category: "premium" },
  "7384":  { name: "Elephant on Stage",  coins: 20000, category: "premium" },
  "6541":  { name: "Level Ship",         coins: 21000, category: "premium" },
  "7385":  { name: "Orca Leap",          coins: 25000, category: "premium" },
  "6542":  { name: "Falcon",             coins: 29999, category: "premium" },
  "6543":  { name: "Gorilla",            coins: 29999, category: "premium" },
  "6544":  { name: "Lion",               coins: 29999, category: "premium" },
};

/**
 * Look up the coin value of a gift by its ID.
 * Returns the static mapping entry, or null if unknown.
 */
export function lookupGift(giftId: string | number): GiftEntry | null {
  return GIFT_VALUE_MAP[String(giftId)] ?? null;
}

/**
 * Get all gifts in a specific category.
 */
export function getGiftsByCategory(category: GiftEntry["category"]): Array<GiftEntry & { id: string }> {
  return Object.entries(GIFT_VALUE_MAP)
    .filter(([, entry]) => entry.category === category)
    .map(([id, entry]) => ({ id, ...entry }));
}
