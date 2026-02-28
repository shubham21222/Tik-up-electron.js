/**
 * Returns the base URL for overlay links.
 * Uses the custom domain when available, falls back to published domain.
 * Never uses preview/localhost URLs since those require login.
 */
export function getOverlayBaseUrl(): string {
  const origin = window.location.origin;
  // Use origin if we're on the actual custom domain (tikup.xyz)
  if (origin.includes("tikup.xyz")) {
    return origin;
  }
  // Use origin if we're on the published lovable.app domain
  if (origin.includes("tik-pro-suite.lovable.app")) {
    return origin;
  }
  // For preview/dev, fall back to the custom domain
  return "https://tikup.xyz";
}
