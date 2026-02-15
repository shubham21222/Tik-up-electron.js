/**
 * Returns the base URL for overlay links.
 * Uses the custom domain when available, falls back to published domain.
 * Never uses preview/localhost URLs since those require login.
 */
export function getOverlayBaseUrl(): string {
  const origin = window.location.origin;
  // Only use origin if we're on the actual custom domain (tikup.xyz)
  if (
    origin.includes("tikup.xyz")
  ) {
    return origin;
  }
  // Always fall back to the production custom domain for OBS/TikTok Live Studio compatibility
  return "https://tikup.xyz";
}
