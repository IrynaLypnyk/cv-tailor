import { NextRequest, NextResponse } from "next/server";
import { generateSectionRewrites } from "@/lib/llm/generate-section-rewrites";
import { generateCoverLetter as generateCoverLetterText } from "@/lib/llm/generate-cover-letter";
import type { ConfirmationItem, CVSection } from "@/lib/llm/types";

interface RequestBody {
  sections: Pick<CVSection, "id" | "title" | "originalText">[];
  jobDescription: string;
  strongMatches: string[];
  underEmphasized: string[];
  confirmations: ConfirmationItem[];
  additionalContext: string;
  generateCoverLetter: boolean;
  coverLetterNotes: string;
}

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

  const data = body as Record<string, unknown>;

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

  if (!Array.isArray(data.confirmations)) {
    return NextResponse.json(
      { error: "Missing field: confirmations." },
      { status: 400 }
    );
  }

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
    coverLetterNotes:
      typeof data.coverLetterNotes === "string" ? data.coverLetterNotes : "",
  };

  try {
    const rewrites = await generateSectionRewrites({
      sections: input.sections,
      jobDescription: input.jobDescription,
      underEmphasized: input.underEmphasized,
      confirmations: input.confirmations,
      additionalContext: input.additionalContext,
    });

    if (!input.generateCoverLetter) {
      return NextResponse.json({ rewrites });
    }

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
      coverLetterNotes: input.coverLetterNotes,
    });

    return NextResponse.json({ rewrites, coverLetter });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
