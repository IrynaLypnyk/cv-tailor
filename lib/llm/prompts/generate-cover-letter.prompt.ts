import type { ConfirmationItem, SectionRewrite } from "../types";

export const COVER_LETTER_SYSTEM_PROMPT = `You are an expert UK cover letter writer for tech roles.

Your task is to write a concise, professional cover letter based on:
- the candidate's rewritten CV sections
- the job description
- global CV/JD assessment (strong matches and under-emphasised experience)
- user confirmations for uncertain requirements
- additional CV context provided by the user
- cover letter notes / company context provided by the user

## Rules

- Do not invent company facts.
- Do not invent motivation.
- Do not invent location, right-to-work status, personal background, or achievements.
- Use company, product, or domain information only if it appears in the job description or user cover letter notes.
- If no company-specific reason is provided, keep motivation general and professional.
- Do not include unsupported tools or skills.
- If the user selected "I do not have this" for a requirement, do not include it.
- If the user selected "I have similar experience", use careful adjacent wording.
- If the user selected "I have this experience", include it carefully without exaggeration.

## Tone

Use concise professional UK-style language.

Avoid exaggerated phrases such as:
- profound expertise
- uniquely qualified
- exceptional passion
- I am particularly drawn to this opportunity
unless the user provided a real reason.

Prefer language that is:
- clear
- confident
- grounded
- human
- specific where evidence exists

## Structure

Write:
- greeting
- short opening paragraph
- 1–2 body paragraphs linking CV evidence to the role
- short closing paragraph

Do not make it too long.
Do not output "Your Name" unless the candidate name is clearly available from the CV.
If the name is unavailable, end with:
"Sincerely,"

Return valid JSON only:
{
  "coverLetter": "string"
}`;

export interface CoverLetterInput {
  rewrites: Pick<SectionRewrite, "title" | "rewrittenText">[];
  jobDescription: string;
  strongMatches: string[];
  underEmphasized: string[];
  confirmations: ConfirmationItem[];
  additionalContext: string;
  coverLetterNotes: string;
}

const ANSWER_LABELS: Record<NonNullable<ConfirmationItem["answer"]>, string> = {
  have_it: "User confirmed: I have this experience",
  similar: "User confirmed: I have similar experience (do not name this skill directly)",
  dont_have: "User confirmed: I do not have this (do not include in cover letter)",
};

export function buildCoverLetterUserMessage(input: CoverLetterInput): string {
  const rewritesBlock = input.rewrites
    .map((r) => `### ${r.title}\n\n${r.rewrittenText}`)
    .join("\n\n---\n\n");

  const strongMatchesBlock =
    input.strongMatches.length > 0
      ? `Strong matches already supported by the CV:\n${input.strongMatches.map((s) => `- ${s}`).join("\n")}`
      : "No strong matches identified.";

  const underEmphasizedBlock =
    input.underEmphasized.length > 0
      ? `Under-emphasised experience to reflect:\n${input.underEmphasized.map((u) => `- ${u}`).join("\n")}`
      : "No under-emphasised items.";

  const confirmationsBlock =
    input.confirmations.length > 0
      ? `User confirmations for uncertain requirements:\n${input.confirmations
          .filter((c) => c.answer !== null)
          .map((c) => `- ${c.skill}: ${ANSWER_LABELS[c.answer!]}\n  Context: ${c.context}`)
          .join("\n")}`
      : "No uncertain requirements to confirm.";

  const contextBlock = input.additionalContext.trim()
    ? `Additional CV context (treat as declared truth):\n${input.additionalContext.trim()}`
    : "No additional context provided.";

  const notesBlock = input.coverLetterNotes.trim()
    ? `Cover letter notes / company context:\n${input.coverLetterNotes.trim()}`
    : "No cover letter notes provided.";

  return [
    `Here are the rewritten CV sections to base the cover letter on:\n\n${rewritesBlock}`,
    `---\n\nJob description:\n\n${input.jobDescription}`,
    `---\n\n${strongMatchesBlock}`,
    `---\n\n${underEmphasizedBlock}`,
    `---\n\n${confirmationsBlock}`,
    `---\n\n${contextBlock}`,
    `---\n\n${notesBlock}`,
  ].join("\n\n");
}
