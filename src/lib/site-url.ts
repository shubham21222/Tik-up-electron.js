/**
 * Returns the canonical site origin for auth redirects and external links.
 * In production, always uses the custom domain to prevent preview URLs
 * from leaking into confirmation emails.
 */
export function getSiteUrl(): string {
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    if (origin.includes("tikup.xyz")) return "https://tikup.xyz";
    // If on the published Lovable domain, still prefer custom domain
    if (origin.includes("lovable.app") && import.meta.env.PROD) return "https://tikup.xyz";
  }
  // Fallback for dev / preview
  return typeof window !== "undefined" ? window.location.origin : "https://tikup.xyz";
}
