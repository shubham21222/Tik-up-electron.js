/**
 * Returns the base URL for overlay links.
 * Uses the custom domain when available, falls back to published domain.
 * Never uses preview/localhost URLs since those require login.
 */
export function getOverlayBaseUrl(): string {
  const origin = window.location.origin;
  // If on the custom domain or published domain, use it
  if (
    !origin.includes("localhost") &&
    !origin.includes("-preview--") &&
    !origin.includes("127.0.0.1")
  ) {
    return origin;
  }
  // Fallback: prefer custom domain, but use published domain as safe default
  return "https://tik-pro-suite.lovable.app";
}
