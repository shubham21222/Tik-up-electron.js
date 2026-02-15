/**
 * ─── Types for Euler Stream Webhook Payloads ────────────────────────────────
 *
 * These types represent the raw gift event payloads received from the
 * EulerStream TikTok LIVE webhook/WebSocket.
 */

/** Raw gift event as received from EulerStream WebSocket or webhook */
export interface RawGiftPayload {
  type?: string;              // "WebcastGiftMessage"
  event?: string;             // Alternative event type field

  /** Gift metadata */
  giftId?: number | string;
  gift_id?: number | string;
  giftName?: string;
  gift_name?: string;

  /** Value fields — EulerStream uses `diamondCount` which equals coin value */
  diamondCount?: number;
  diamond_count?: number;
  coinValue?: number;
  coin_value?: number;

  /** Combo/streak count — total coins = base_value × repeatCount */
  repeatCount?: number;
  repeat_count?: number;
  repeatEnd?: boolean;        // true when the combo streak finishes

  /** Sender info */
  uniqueId?: string;          // TikTok username (e.g. "user123")
  userId?: string | number;   // Numeric TikTok user ID
  user_id?: string | number;
  user?: {
    uniqueId?: string;
    userId?: string | number;
    profilePictureUrl?: string;
  };

  /** Optional metadata */
  profilePictureUrl?: string;
  timestamp?: number;
}

/** Webhook wrapper — the full POST body from EulerStream */
export interface EulerStreamWebhookBody {
  event?: string;             // "gift", "WebcastGiftMessage"
  data?: RawGiftPayload;
  messages?: RawGiftPayload[];
  timestamp?: number;
  roomId?: string;
}

/**
 * Normalized gift event — the clean output after processing.
 * Uses standardized field names: {SENDER_NAME}, {SENDER_ID}, {GIFT_NAME}, {GIFT_VALUE_COINS}
 */
export interface NormalizedGift {
  /** {SENDER_NAME} — TikTok username of the gift sender */
  sender: string;

  /** {SENDER_ID} — Numeric TikTok user ID */
  user_id: string;

  /** {GIFT_NAME} — Human-readable gift name (e.g. "Rose", "Falcon") */
  gift_name: string;

  /** {GIFT_VALUE_COINS} — Total coin value (base_value × repeat_count) */
  coins: number;

  /** Base coin value of one unit of this gift */
  base_coin_value: number;

  /** Combo/streak count */
  repeat_count: number;

  /** TikTok gift ID for reference */
  gift_id: string;

  /** Gift size category */
  category: "small" | "medium" | "large" | "premium" | "unknown";

  /** Whether this is the final message in a combo streak */
  is_combo_end: boolean;

  /** ISO timestamp of the event */
  timestamp: string;
}
