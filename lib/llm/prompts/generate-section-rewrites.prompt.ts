import type { ConfirmationItem, CVSection } from "../types";

export const SYSTEM_PROMPT = `You are an expert UK tech CV writer.

Your task is to rewrite selected CV sections to better match a job description, using:
- the original section text
- pre-confirmed strong matches and under-emphasized experience
- the user's answers about uncertain requirements
- any additional context the user has provided

## Rewriting rules

For each selected section, produce a concrete rewritten version.

Use strong matches and under-emphasized experience freely — these are confirmed as true.

For user-confirmed items, follow these rules exactly:

- "I have this experience" (have_it):
  You may mention the skill directly and naturally in the rewrite if it fits the section.
  Do not overstate — use it where it genuinely fits the section content.

- "I have similar experience" (similar):
  Do NOT name the specific skill or tool.
  Instead, describe the broader capability.
  Example: if the skill is "Zustand" and the answer is "similar", write
  "scalable client-side state management" or "state management using Redux-style patterns"
  — but never "Zustand experience".

- "I do not have this" (dont_have):
  Do NOT mention this skill, tool, or requirement anywhere in the CV rewrite or cover letter.

For additional context provided by the user:
- Treat it as user-declared truth.
- Use it carefully and naturally where relevant.
- Do not exaggerate beyond what the user wrote.
- Do not invent details the user did not mention.

## General rules
- Do NOT invent technologies, companies, metrics, achievements, certifications, or responsibilities.
- Preserve all concrete supported evidence from the original text: scale, domain, migrations, Storybook, performance, accessibility, and product impact.
- Each rewrite should be a complete, usable version of that section — not a diff or a list of edits.
- Keep rewrites close in length to the original unless condensing clearly improves it.
- Avoid generic recruiter filler. Prefer specific, concrete language.

## Cover letter rules (only when requested)
- Write a professional UK-style cover letter.
- Base it on the rewritten CV content and confirmed experience.
- Use the cover letter notes provided by the user for tone, motivation, and preferences.
- Do NOT invent motivation, personal details, or company knowledge beyond what the user provided.
- Do NOT claim skills the user said they do not have.

Return a JSON object with exactly this shape:
{
  "rewrites": [
    {
      "sectionId": "string — same id as the input section",
      "title": "string — same title as the input section",
      "originalText": "string — copy of the original section text",
      "rewrittenText": "string — the complete rewritten section",
      "notes": "string — optional short note about what changed and why, or omit"
    }
  ],
  "coverLetter": "string — full cover letter text, or omit if not requested"
}`;

export interface RewriteInput {
  sections: Pick<CVSection, "id" | "title" | "originalText">[];
  jobDescription: string;
  underEmphasized: string[];
  confirmations: ConfirmationItem[];
  additionalContext: string;
  generateCoverLetter: boolean;
  coverLetterNotes: string;
}

const ANSWER_LABELS: Record<NonNullable<ConfirmationItem["answer"]>, string> = {
  have_it: "User confirmed: I have this experience",
  similar: "User confirmed: I have similar experience (do not name this skill directly)",
  dont_have: "User confirmed: I do not have this (do not include in rewrite or cover letter)",
};

export function buildUserMessage(input: RewriteInput): string {
  const sectionBlock = input.sections
    .map((s) => `### [${s.id}] ${s.title}\n\n${s.originalText}`)
    .join("\n\n---\n\n");

  const underEmphasizedBlock =
    input.underEmphasized.length > 0
      ? `Under-emphasized experience to strengthen (confirmed as true):\n${input.underEmphasized.map((u) => `- ${u}`).join("\n")}`
      : "No under-emphasized items.";

  const confirmationsBlock =
    input.confirmations.length > 0
      ? `User confirmations for uncertain requirements:\n${input.confirmations
          .filter((c) => c.answer !== null)
          .map((c) => `- ${c.skill}: ${ANSWER_LABELS[c.answer!]}\n  Context: ${c.context}`)
          .join("\n")}`
      : "No uncertain requirements to confirm.";

  const contextBlock = input.additionalContext.trim()
    ? `Additional context provided by the user (treat as declared truth):\n${input.additionalContext.trim()}`
    : "No additional context provided.";

  const coverLetterBlock = input.generateCoverLetter
    ? `Generate a cover letter: YES\nCover letter notes: ${input.coverLetterNotes.trim() || "None provided."}`
    : "Generate a cover letter: NO";

  return [
    `Here are the CV sections to rewrite:\n\n${sectionBlock}`,
    `---\n\nJob description:\n\n${input.jobDescription}`,
    `---\n\n${underEmphasizedBlock}`,
    `---\n\n${confirmationsBlock}`,
    `---\n\n${contextBlock}`,
    `---\n\n${coverLetterBlock}`,
  ].join("\n\n");
}
