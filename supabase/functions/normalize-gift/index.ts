/**
 * ─── Webhook Handler: normalize-gift ────────────────────────────────────────
 *
 * This Edge Function receives raw gift webhook payloads from EulerStream,
 * verifies the HMAC SHA-256 signature, normalizes the gift values to
 * accurate TikTok coin values, and returns clean JSON.
 *
 * SIGNATURE VERIFICATION:
 * - EulerStream sends `x-webhook-signature` header containing an HMAC SHA-256
 *   digest of the raw request body, keyed with your webhook secret.
 * - We recompute the HMAC and compare to reject tampered payloads.
 *
 * ENDPOINT: POST /functions/v1/normalize-gift
 * HEADERS:  x-webhook-signature: <hmac-sha256-hex>
 * BODY:     EulerStream webhook JSON (single event or batch)
 */

import { normalizeGift, normalizeGiftBatch, sumCoins, coinsBySender } from "./normalize.ts";
import type { EulerStreamWebhookBody, RawGiftPayload } from "./types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-signature",
};

/**
 * Verify HMAC SHA-256 webhook signature.
 * Returns true if the signature matches, false otherwise.
 */
async function verifySignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string
): Promise<boolean> {
  if (!signatureHeader || !secret) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
  const expectedHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Constant-time comparison to prevent timing attacks
  if (expectedHex.length !== signatureHeader.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expectedHex.length; i++) {
    mismatch |= expectedHex.charCodeAt(i) ^ signatureHeader.charCodeAt(i);
  }
  return mismatch === 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // ── Step 1: Read raw body for signature verification ────────────
    const rawBody = await req.text();

    // ── Step 2: Verify webhook signature ────────────────────────────
    const webhookSecret = Deno.env.get("EULER_WEBHOOK_SECRET") || "";
    const signatureHeader = req.headers.get("x-webhook-signature");

    // If a webhook secret is configured, enforce signature verification
    if (webhookSecret) {
      const isValid = await verifySignature(rawBody, signatureHeader, webhookSecret);
      if (!isValid) {
        console.error("❌ Invalid webhook signature");
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ── Step 3: Parse the gift data ─────────────────────────────────
    const body: EulerStreamWebhookBody = JSON.parse(rawBody);

    let gifts: RawGiftPayload[] = [];

    // Handle batched messages (multiple gifts in one webhook)
    if (body.messages && Array.isArray(body.messages)) {
      gifts = body.messages.filter(
        (m) => m.type === "WebcastGiftMessage" || m.event === "gift"
      );
    }
    // Handle single gift event
    else if (body.data) {
      gifts = [body.data];
    }
    // Handle flat payload (the body itself is the gift)
    else if (body.event === "gift" || (body as unknown as RawGiftPayload).giftId) {
      gifts = [body as unknown as RawGiftPayload];
    }

    if (gifts.length === 0) {
      return new Response(
        JSON.stringify({ error: "No gift events found in payload", raw_keys: Object.keys(body) }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Step 4: Normalize all gifts ─────────────────────────────────
    const normalized = normalizeGiftBatch(gifts);

    // ── Step 5: Log normalized output ───────────────────────────────
    for (const gift of normalized) {
      console.log(
        `🎁 ${JSON.stringify({
          sender: gift.sender,
          user_id: gift.user_id,
          gift_name: gift.gift_name,
          coins: gift.coins,
        })}`
      );
    }

    // ── Step 6: Return response with summary ────────────────────────
    return new Response(
      JSON.stringify({
        gifts: normalized,
        summary: {
          total_gifts: normalized.length,
          total_coins: sumCoins(normalized),
          coins_by_sender: coinsBySender(normalized),
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Webhook processing error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
