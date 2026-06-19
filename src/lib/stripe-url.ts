import { env } from "~/env";

/**
 * Helper function to build base URL consistently across the app.
 * Used for Stripe redirects (checkout success/cancel, onboarding refresh).
 * Fallback chain: NEXTAUTH_URL → VERCEL_URL → localhost:3000
 */
export function getBaseUrl(): string {
  return (
    env.NEXTAUTH_URL ??
    (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : "http://localhost:3000")
  );
}
