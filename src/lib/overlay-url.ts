/**
 * Returns the base URL for overlay links.
 * On preview/localhost, falls back to the published domain so
 * overlay URLs always work in OBS / TikTok Live Studio without login.
 */
export function getOverlayBaseUrl(): string {
  const origin = window.location.origin;
  // If we're on the published domain or a custom domain, use it directly
  if (
    !origin.includes("localhost") &&
    !origin.includes("-preview--") &&
    !origin.includes("127.0.0.1")
  ) {
    return origin;
  }
  // Fallback to the published Lovable domain
  return "https://tik-pro-suite.lovable.app";
}
