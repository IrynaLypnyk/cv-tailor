/**
 * POST /api/generate-rewrites
 *
 * Second step of the tailoring session (called after /api/assess-cv).
 *
 * Accepts a JSON body containing the selected CV sections, job description,
 * assessment context, user confirmations, and optional cover letter settings.
 *
 * Pipeline:
 *  1. Access check     — block guests who have exhausted the demo allowance
 *  2. Input validation — verify required fields are present and well-formed
 *  3. Section rewrites — ask the LLM to rewrite each selected section
 *  4. Cover letter     — optionally ask a second LLM call to write a cover
 *                        letter using the rewritten sections as context
 *
 * Returns:
 *  { rewrites: SectionRewrite[] }
 *  or { rewrites: SectionRewrite[], coverLetter: string } when requested
 *
 * Access control:
 *  - Admin users always pass through.
 *  - Guests are blocked with 403 if the demo limit has been reached.
 *  - This route does NOT increment the demo counter. Counting happens only
 *    in /api/assess-cv, which is always the entry point of a new session.
 *    One assess call + one generate call together count as one tailoring
 *    session, so incrementing here too would double-count.
 */

import { NextRequest, NextResponse } from "next/server";
import { generateSectionRewrites } from "@/lib/llm/generate-section-rewrites";
import { generateCoverLetter as generateCoverLetterText } from "@/lib/llm/generate-cover-letter";
import type {
  ConfirmationItem,
  CoverLetterContext,
  CVSection,
} from "@/lib/llm/types";
import { checkAccessFromRequest } from "@/lib/auth/session";

/** Shape of the expected JSON request body. */
interface RequestBody {
  sections: Pick<CVSection, "id" | "title" | "originalText">[];
  jobDescription: string;
  strongMatches: string[];
  underEmphasized: string[];
  confirmations: ConfirmationItem[];
  additionalContext: string;
  generateCoverLetter: boolean;
  coverLetterContext: CoverLetterContext;
}

export async function POST(req: NextRequest) {
  // -------------------------------------------------------------------------
  // 1. Access check
  // Unlike /api/assess-cv, this route does not write back a Set-Cookie header
  // because it does not count toward the demo limit.
  // -------------------------------------------------------------------------
  const { allowed } = checkAccessFromRequest(req);
  if (!allowed) {
    return NextResponse.json(
      { error: "You've reached the demo limit. Please try again in 3 days." },
      { status: 403 }
    );
  }

  // -------------------------------------------------------------------------
  // 2. Parse and validate JSON body
  // -------------------------------------------------------------------------
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

  const data = body as Record<string, unknown>;

  // sections must be a non-empty array — at least one section must be selected.
  if (!Array.isArray(data.sections) || data.sections.length === 0) {
    return NextResponse.json(
      { error: "Missing or empty field: sections." },
      { status: 400 }
    );
  }

  if (
    typeof data.jobDescription !== "string" ||
    data.jobDescription.trim().length === 0
  ) {
    return NextResponse.json(
      { error: "Missing field: jobDescription." },
      { status: 400 }
    );
  }

  // confirmations may be an empty array (no uncertain requirements), but the
  // field must be present so the LLM prompt always has a defined confirmations
  // block to include.
  if (!Array.isArray(data.confirmations)) {
    return NextResponse.json(
      { error: "Missing field: confirmations." },
      { status: 400 }
    );
  }

  // Normalise optional fields with safe fallbacks.
  const input: RequestBody = {
    sections: data.sections as RequestBody["sections"],
    jobDescription: data.jobDescription.trim(),
    strongMatches: Array.isArray(data.strongMatches)
      ? (data.strongMatches as string[])
      : [],
    underEmphasized: Array.isArray(data.underEmphasized)
      ? (data.underEmphasized as string[])
      : [],
    confirmations: data.confirmations as ConfirmationItem[],
    additionalContext:
      typeof data.additionalContext === "string" ? data.additionalContext : "",
    generateCoverLetter:
      typeof data.generateCoverLetter === "boolean"
        ? data.generateCoverLetter
        : false,
    coverLetterContext:
      typeof data.coverLetterContext === "object" &&
      data.coverLetterContext !== null
        ? (data.coverLetterContext as CoverLetterContext)
        : {},
  };

  // -------------------------------------------------------------------------
  // 3. Section rewrites
  // -------------------------------------------------------------------------
  try {
    const rewrites = await generateSectionRewrites({
      sections: input.sections,
      jobDescription: input.jobDescription,
      underEmphasized: input.underEmphasized,
      confirmations: input.confirmations,
      additionalContext: input.additionalContext,
    });

    // If no cover letter was requested, return early — no second LLM call.
    if (!input.generateCoverLetter) {
      return NextResponse.json({ rewrites });
    }

    // -----------------------------------------------------------------------
    // 4. Cover letter (optional, separate LLM call)
    // Uses the rewritten sections as input so the cover letter references the
    // same polished language rather than the original CV text.
    // This is intentionally a second call so the two prompts stay independent
    // and the cover letter can apply different tone and structure rules.
    // -----------------------------------------------------------------------
    const coverLetter = await generateCoverLetterText({
      rewrites: rewrites.map(({ title, rewrittenText }) => ({
        title,
        rewrittenText,
      })),
      jobDescription: input.jobDescription,
      strongMatches: input.strongMatches,
      underEmphasized: input.underEmphasized,
      confirmations: input.confirmations,
      additionalContext: input.additionalContext,
      coverLetterContext: input.coverLetterContext,
    });

    return NextResponse.json({ rewrites, coverLetter });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
