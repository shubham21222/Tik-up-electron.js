/**
 * Returns the base URL for overlay links.
 * Always uses the custom domain so overlay URLs work
 * in OBS / TikTok Live Studio without login.
 */
export function getOverlayBaseUrl(): string {
  return "https://tikup.pro";
}
