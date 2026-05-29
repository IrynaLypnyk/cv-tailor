/**
 * lib/auth/session.ts
 *
 * All authentication and access-control logic for the demo/admin system.
 *
 * Two independent mechanisms live here:
 *
 *  1. Admin session  — a stateless HMAC-signed token stored in an httpOnly
 *     cookie. The server signs a fixed payload ("admin") with
 *     ADMIN_SESSION_SECRET, so no database is required. The signature is
 *     verified on every protected request by recomputing the HMAC and
 *     comparing with a timing-safe equality check.
 *
 *  2. Demo counter   — a small JSON object { count, firstUsed } stored in a
 *     server-set httpOnly cookie. Because it is httpOnly, browser JavaScript
 *     cannot read or modify it — only the server can. Each time a guest makes
 *     a real AI request (/api/assess-cv), the server increments the count and
 *     writes the updated cookie back in the response. After DEMO_LIMIT
 *     requests are used up, further AI calls are blocked (HTTP 403) for
 *     DEMO_TTL_MS (3 days), after which the counter resets automatically.
 *
 * Exported helpers are used in three places:
 *  - app/page.tsx            (server component — uses ReadonlyRequestCookies)
 *  - app/api/assess-cv       (API route handler — parses the raw Cookie header)
 *  - app/api/generate-rewrites (API route handler — same)
 *  - app/api/admin-login     (sets the admin session cookie on successful login)
 */

import { createHmac, timingSafeEqual } from "crypto";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Name of the httpOnly cookie that holds the signed admin session token. */
const ADMIN_COOKIE = "adminSession";

/** Name of the httpOnly cookie that tracks demo request usage. */
const DEMO_COOKIE = "demoSession";

/** Maximum number of AI requests a guest user may make before being blocked. */
const DEMO_LIMIT = 2;

/** How long the demo block lasts before the counter resets (3 days in ms). */
const DEMO_TTL_MS = 3 * 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Admin session — HMAC-signed stateless token
// ---------------------------------------------------------------------------

/**
 * Reads ADMIN_SESSION_SECRET from the environment.
 * Throws at startup time if the variable is missing, so misconfiguration is
 * caught immediately rather than silently allowing all requests through.
 */
function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set.");
  return secret;
}

/** Returns the HMAC-SHA256 hex digest of `value` signed with `secret`. */
function hmac(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("hex");
}

/**
 * Creates a signed admin session token.
 *
 * Format: "admin.<hmac-sha256-hex>"
 *
 * The payload is always the literal string "admin". Signing it with the
 * server-only secret means the token cannot be forged without knowing the
 * secret, and no server-side session store is needed.
 */
export function signAdminToken(): string {
  const payload = "admin";
  const sig = hmac(payload, getSessionSecret());
  return `${payload}.${sig}`;
}

/**
 * Verifies a token produced by signAdminToken().
 *
 * Uses timingSafeEqual to prevent timing-based side-channel attacks that
 * could otherwise allow an attacker to guess the signature one byte at a time.
 * Returns false for any malformed, missing, or tampered token.
 */
export function verifyAdminToken(token: string): boolean {
  const dotIdx = token.lastIndexOf(".");
  if (dotIdx === -1) return false;
  const payload = token.slice(0, dotIdx);
  const sig = token.slice(dotIdx + 1);
  const expectedSig = hmac(payload, getSessionSecret());
  try {
    // Both buffers must be the same length for timingSafeEqual to work.
    return timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expectedSig, "hex"));
  } catch {
    // Buffer.from will throw if the hex string has an odd length (tampered).
    return false;
  }
}

// ---------------------------------------------------------------------------
// Demo counter — stored as JSON in an httpOnly cookie
// ---------------------------------------------------------------------------

/**
 * Shape of the demo session counter stored in the demoSession cookie.
 *
 * - count      — how many /api/assess-cv calls this guest has made
 * - firstUsed  — Unix millisecond timestamp of the very first request;
 *                used to calculate when the 3-day cooldown expires
 */
export interface DemoCounter {
  count: number;
  firstUsed: number;
}

/**
 * Reads and parses the demo counter from a Next.js server-component
 * cookie store (next/headers → cookies()).
 *
 * Returns null if the cookie is absent or its value cannot be parsed,
 * treating both cases as "no requests made yet".
 */
export function readDemoCounter(
  cookieStore: ReadonlyRequestCookies
): DemoCounter | null {
  const raw = cookieStore.get(DEMO_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as Record<string, unknown>).count === "number" &&
      typeof (parsed as Record<string, unknown>).firstUsed === "number"
    ) {
      return parsed as DemoCounter;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Returns true when the guest has exhausted their demo allowance AND the
 * 3-day cooldown period has not yet elapsed.
 *
 * Note: if counter is null the user has made 0 requests — not blocked.
 * If the TTL has expired the counter resets implicitly — not blocked.
 */
export function isDemoLimitReached(counter: DemoCounter | null): boolean {
  if (counter === null) return false;
  if (counter.count < DEMO_LIMIT) return false;
  // Auto-reset: if the cooldown window has passed, treat as unblocked.
  if (Date.now() - counter.firstUsed >= DEMO_TTL_MS) return false;
  return true;
}

/**
 * Builds the Set-Cookie header value for the demo counter cookie.
 *
 * Called by /api/assess-cv after a successful AI response so the counter
 * is only incremented when a real request was actually served (not on
 * validation errors or server failures).
 *
 * If `existing` is null or its TTL has expired, a fresh counter starting
 * at count=1 is created. Otherwise the existing count is incremented.
 *
 * The cookie is:
 *  - httpOnly  — JS cannot read or modify it
 *  - SameSite=Strict — not sent on cross-site requests
 *  - Max-Age   — matches DEMO_TTL_MS so the cookie expires with the block
 */
export function buildDemoCounterCookie(existing: DemoCounter | null): string {
  const now = Date.now();
  let counter: DemoCounter;

  if (existing === null || now - existing.firstUsed >= DEMO_TTL_MS) {
    counter = { count: 1, firstUsed: now };
  } else {
    counter = { count: existing.count + 1, firstUsed: existing.firstUsed };
  }

  const value = encodeURIComponent(JSON.stringify(counter));
  const maxAge = Math.ceil(DEMO_TTL_MS / 1000);
  return `${DEMO_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}`;
}

// ---------------------------------------------------------------------------
// Unified access info — used by server components and API routes
// ---------------------------------------------------------------------------

/**
 * Describes the current user's access level.
 *
 * Used by:
 *  - app/page.tsx to decide which UI banner to display
 *  - API routes to allow or block AI calls
 */
export interface AccessInfo {
  /** True when a valid signed admin session cookie is present. */
  isAdmin: boolean;
  /** Number of demo requests used within the current TTL window. */
  demoRequestsUsed: number;
  /** True when the demo limit is reached and the cooldown has not expired. */
  demoLimitReached: boolean;
}

/**
 * Derives the current user's access info from the Next.js cookie store.
 *
 * Admin check takes priority: if a valid admin token is found, the user
 * is treated as admin regardless of any demo counter cookie.
 *
 * Used in server components (app/page.tsx) where next/headers cookies()
 * is available. For API route handlers, use getAdminTokenFromRequest /
 * getDemoCounterFromRequest instead.
 */
export function getAccessInfo(
  cookieStore: ReadonlyRequestCookies
): AccessInfo {
  const adminToken = cookieStore.get(ADMIN_COOKIE)?.value;
  if (adminToken && verifyAdminToken(adminToken)) {
    return { isAdmin: true, demoRequestsUsed: 0, demoLimitReached: false };
  }

  const counter = readDemoCounter(cookieStore);
  // Treat an expired counter as 0 requests used.
  const used =
    counter && Date.now() - counter.firstUsed < DEMO_TTL_MS
      ? counter.count
      : 0;

  return {
    isAdmin: false,
    demoRequestsUsed: used,
    demoLimitReached: isDemoLimitReached(counter),
  };
}

// ---------------------------------------------------------------------------
// Admin cookie header builders
// ---------------------------------------------------------------------------

/**
 * Returns the Set-Cookie header value that installs a valid admin session.
 * Called by /api/admin-login on successful password verification.
 */
export function buildAdminSessionCookie(token: string): string {
  const sevenDaysInSeconds = 7 * 24 * 60 * 60;
  return `${ADMIN_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${sevenDaysInSeconds}`;
}

/**
 * Returns the Set-Cookie header value that clears the admin session cookie.
 * Used by /api/admin-logout (optional logout route).
 */
export function buildAdminSessionClearCookie(): string {
  return `${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
}

// ---------------------------------------------------------------------------
// Request-level cookie parsers — for use inside API route handlers
// ---------------------------------------------------------------------------

/**
 * Extracts the raw admin session token from a Request's Cookie header.
 *
 * Next.js API route handlers receive a standard Request object. The
 * next/headers cookies() helper is not available inside route handlers,
 * so we parse the Cookie header manually.
 */
export function getAdminTokenFromRequest(req: Request): string | undefined {
  const cookieHeader = req.headers.get("cookie") ?? "";
  return parseCookieHeader(cookieHeader)[ADMIN_COOKIE];
}

/**
 * Extracts and parses the demo counter from a Request's Cookie header.
 * Returns null if the cookie is absent or its JSON is malformed.
 */
export function getDemoCounterFromRequest(req: Request): DemoCounter | null {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const raw = parseCookieHeader(cookieHeader)[DEMO_COOKIE];
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded) as unknown;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as Record<string, unknown>).count === "number" &&
      typeof (parsed as Record<string, unknown>).firstUsed === "number"
    ) {
      return parsed as DemoCounter;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Parses a raw Cookie header string into a key→value map.
 * Handles cookies with `=` signs in their values (e.g. base64).
 */
function parseCookieHeader(header: string): Record<string, string> {
  return Object.fromEntries(
    header.split(";").map((part) => {
      const [k, ...v] = part.trim().split("=");
      return [k?.trim() ?? "", v.join("=")];
    })
  );
}

// ---------------------------------------------------------------------------
// Shared access check for API route handlers
// ---------------------------------------------------------------------------

/**
 * Determines whether an incoming API request is allowed to proceed.
 *
 * Reads both the admin session cookie and the demo counter cookie from the
 * raw request headers (since next/headers is not available in route handlers).
 *
 * Returns:
 *  - allowed        — false means the handler should respond with HTTP 403
 *  - isAdmin        — true means the request carries a valid admin session;
 *                     the caller should skip demo-counter updates
 *  - existingCounter — the current demo counter value, needed by assess-cv
 *                     to build the incremented Set-Cookie header on success
 */
export function checkAccessFromRequest(req: Request): {
  allowed: boolean;
  isAdmin: boolean;
  existingCounter: DemoCounter | null;
} {
  const adminToken = getAdminTokenFromRequest(req);
  if (adminToken && verifyAdminToken(adminToken)) {
    return { allowed: true, isAdmin: true, existingCounter: null };
  }

  const counter = getDemoCounterFromRequest(req);
  if (isDemoLimitReached(counter)) {
    return { allowed: false, isAdmin: false, existingCounter: counter };
  }

  return { allowed: true, isAdmin: false, existingCounter: counter };
}

// ---------------------------------------------------------------------------
// Re-export constants for use in API routes
// ---------------------------------------------------------------------------

export { DEMO_LIMIT, DEMO_TTL_MS };
