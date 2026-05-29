import { NextRequest, NextResponse } from "next/server";
import {
  signAdminToken,
  buildAdminSessionCookie,
} from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const password =
    typeof (body as Record<string, unknown>)?.password === "string"
      ? ((body as Record<string, unknown>).password as string)
      : "";

  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    // Misconfigured server — do not reveal details to the client.
    console.error("ADMIN_PASSWORD environment variable is not set.");
    return NextResponse.json(
      { error: "Server configuration error." },
      { status: 500 }
    );
  }

  if (!password || password !== adminPassword) {
    // Use a fixed response time to avoid timing-based enumeration.
    await new Promise((resolve) => setTimeout(resolve, 300));
    return NextResponse.json(
      { error: "Incorrect password." },
      { status: 401 }
    );
  }

  const token = signAdminToken();
  const cookieHeader = buildAdminSessionCookie(token);

  return NextResponse.json(
    { ok: true },
    {
      status: 200,
      headers: { "Set-Cookie": cookieHeader },
    }
  );
}
