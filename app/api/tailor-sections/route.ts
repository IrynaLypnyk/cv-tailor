import { NextRequest, NextResponse } from "next/server";
import { tailorSelectedSections } from "@/lib/llm/tailor-selected-sections";
import type { CVSection } from "@/lib/llm/types";

export async function POST(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request: could not parse JSON body." },
      { status: 400 }
    );
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const { sections, jobDescription } = body as Record<string, unknown>;

  if (!Array.isArray(sections) || sections.length === 0) {
    return NextResponse.json(
      { error: "Missing field: sections (must be a non-empty array)." },
      { status: 400 }
    );
  }

  if (
    typeof jobDescription !== "string" ||
    jobDescription.trim().length === 0
  ) {
    return NextResponse.json(
      { error: "Missing field: jobDescription." },
      { status: 400 }
    );
  }

  try {
    const insights = await tailorSelectedSections(
      sections as CVSection[],
      jobDescription.trim()
    );

    return NextResponse.json({ insights });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
