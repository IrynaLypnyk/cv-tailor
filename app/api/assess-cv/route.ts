/**
 * POST /api/assess-cv
 *
 * Entry point for a new tailoring session.
 *
 * Accepts a multipart/form-data request containing:
 *  - cv             — the candidate's CV as a .docx file
 *  - jobDescription — the full job description as plain text
 *
 * Pipeline:
 *  1. Access check  — block guests who have exhausted the demo allowance
 *  2. Input validation — verify both fields are present and the file is .docx
 *  3. Text extraction  — convert the .docx binary to plain text via mammoth
 *  4. Section extraction — ask the LLM to split the CV into named sections
 *  5. Global assessment  — ask the LLM to assess the CV against the JD
 *  6. Counter increment  — write an updated demoSession cookie for guests
 *
 * Returns:
 *  { sections: CVSection[], assessment: GlobalAssessment }
 *
 * Access control:
 *  - Admin users (valid adminSession cookie) always pass through.
 *  - Guests are allowed up to DEMO_LIMIT requests; after that a 403 is
 *    returned before any LLM work is performed.
 *  - The demo counter is incremented only on a successful response so that
 *    validation errors and server failures don't consume the allowance.
 */

import { NextRequest, NextResponse } from "next/server";
import { extractTextFromDocx } from "@/lib/docx/extract-text";
import { extractCVSections } from "@/lib/llm/extract-cv-sections";
import { assessCVGlobally } from "@/lib/llm/assess-cv-globally";
import {
  checkAccessFromRequest,
  buildDemoCounterCookie,
} from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  // -------------------------------------------------------------------------
  // 1. Access check
  // Runs before any parsing or LLM calls to avoid wasting resources on
  // blocked requests.
  // -------------------------------------------------------------------------
  const { allowed, isAdmin, existingCounter } = checkAccessFromRequest(req);
  if (!allowed) {
    return NextResponse.json(
      { error: "You've reached the demo limit. Please try again in 3 days." },
      { status: 403 }
    );
  }

  // -------------------------------------------------------------------------
  // 2. Parse multipart form data
  // -------------------------------------------------------------------------
  let formData: FormData;

  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid request: could not parse form data." },
      { status: 400 }
    );
  }

  const cvFile = formData.get("cv");
  const jobDescription = formData.get("jobDescription");

  if (!cvFile || !(cvFile instanceof File)) {
    return NextResponse.json(
      { error: "Missing field: cv (must be a .docx file)." },
      { status: 400 }
    );
  }

  if (
    !jobDescription ||
    typeof jobDescription !== "string" ||
    jobDescription.trim().length === 0
  ) {
    return NextResponse.json(
      { error: "Missing field: jobDescription." },
      { status: 400 }
    );
  }

  // Only .docx is supported; mammoth cannot parse .doc, .pdf, or .odt.
  if (!cvFile.name.endsWith(".docx")) {
    return NextResponse.json(
      { error: "Unsupported file type. Please upload a .docx file." },
      { status: 415 }
    );
  }

  // -------------------------------------------------------------------------
  // 3–5. Text extraction → section extraction → global assessment
  // Each step depends on the previous, so they run sequentially.
  // -------------------------------------------------------------------------
  try {
    const arrayBuffer = await cvFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert the .docx binary to plain text (mammoth strips all formatting).
    const cvText = await extractTextFromDocx(buffer);
    const jd = jobDescription.trim();

    // Ask the LLM to identify and extract named CV sections.
    const sections = await extractCVSections(cvText, jd);

    // Ask the LLM to assess the extracted sections against the job description,
    // returning strong matches, gaps, and items needing user confirmation.
    const assessment = await assessCVGlobally(sections, jd);

    // -----------------------------------------------------------------------
    // 6. Demo counter increment
    // Writes an updated demoSession cookie only when the full pipeline
    // succeeded. Admin requests skip this entirely.
    // -----------------------------------------------------------------------
    const responseHeaders: HeadersInit = {};
    if (!isAdmin) {
      responseHeaders["Set-Cookie"] = buildDemoCounterCookie(existingCounter);
    }

    return NextResponse.json(
      { sections, assessment },
      { headers: responseHeaders }
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
