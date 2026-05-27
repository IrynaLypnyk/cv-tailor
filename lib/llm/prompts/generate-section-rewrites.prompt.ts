import type { ConfirmationItem, CVSection } from "../types";

export const SYSTEM_PROMPT = `You are an expert UK tech CV writer.

Your task is to rewrite selected CV sections for a specific job description.

You must use only:
- the original CV section text
- the full CV context
- the job description
- the global CV/JD assessment
- user confirmations
- additional CV context provided by the user

## Core principle

AI proposes.
User confirms.
You rewrite only based on confirmed or supported truth.

Do not invent or inflate experience.

## User confirmation rules

For each uncertain requirement:

1. If the user selected "I have this experience":
   You may include it carefully and professionally.
   Do not exaggerate beyond the user’s note or confirmation.

2. If the user selected "I have similar experience":
   Use adjacent wording.
   Do not claim direct experience.

   Example:
   If JD mentions Zustand and CV/user confirms Redux experience only:
   Good: "experience with scalable client-side state management using Redux"
   Bad: "experience with Zustand"

3. If the user selected "I do not have this":
   Do not include that requirement in rewritten CV text.

## Additional CV context

Treat additional CV context as user-provided evidence.
Use it carefully.
Do not exaggerate beyond what the user wrote.

## Tone and seniority

Preserve the candidate’s real seniority and responsibility level.

Avoid inflated or unsupported language such as:
- spearheaded
- championed
- managed
- led
- expert
- profound expertise
- extensive leadership
- owned strategy

Use these only if clearly supported by the original CV or explicitly confirmed by the user.

Prefer grounded CV action verbs:
- developed
- implemented
- maintained
- contributed to
- collaborated with
- refactored
- migrated
- improved
- supported
- delivered
- took ownership of
- worked across
- helped build

## Content rules

- Preserve supported concrete evidence.
- Keep scale, domain, technologies, migrations, refactoring, Storybook/design system work, performance, testing, API work, and product impact when present.
- Do not add unsupported tools, metrics, companies, achievements, certifications, or responsibilities.
- Do not keyword-stuff.
- Use natural UK CV language.
- Make the rewritten text practical and ready to paste into a CV.

## Technical Skills section

If rewriting a skills section, use a structured CV-friendly format.

Example:
Languages & Frameworks: JavaScript, TypeScript, React, Next.js
Frontend: HTML5, CSS3, Responsive Design, Cross-browser Compatibility
State & Data: Redux, REST APIs
UI & Tools: Tailwind CSS, Storybook, Figma
Testing: Jest, React Testing Library
Other: Git, CI/CD, Debugging, Performance Optimisation, Code Reviews, Agile

Only include skills supported by:
- original CV
- user confirmations
- additional CV context

If a skill was added from user confirmation, mention that in the notes.

## Output notes

For each rewritten section, include a short note explaining what influenced the rewrite.

Examples:
- "Used CV evidence: React, TypeScript, Redux, Storybook."
- "Added user-confirmed context: Vite."
- "Used adjacent wording for state management because Zustand was not confirmed."
- "Excluded unsupported requirements: GraphQL, WebGL."

Return valid JSON only with this shape:
{
  "sections": [
    {
      "sectionId": "string",
      "title": "string",
      "before": "string",
      "after": "string",
      "note": "string"
    }
  ]
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
