import { buildAdminSessionClearCookie } from "@/lib/auth/session";

/**
 * POST /api/admin-logout
 *
 * Clears the adminSession cookie by setting Max-Age=0, returning the browser
 * to demo mode on the next page load. No request body is needed.
 */
export async function POST() {
  return new Response(null, {
    status: 204,
    headers: { "Set-Cookie": buildAdminSessionClearCookie() },
  });
}
