import type {
  ConfirmationItem,
  CoverLetterContext,
  EvidenceSource,
  SectionRewrite,
} from "../types";

export const COVER_LETTER_SYSTEM_PROMPT = `You are an expert UK cover letter writer for tech roles.

Your task is to write a concise, professional, evidence-based cover letter.

Base the cover letter only on:
- the candidate's rewritten CV sections
- the job description
- global CV/JD assessment
- user confirmations for uncertain requirements
- evidence levels and evidence notes provided by the user
- additional CV context provided by the user
- cover letter notes / company context provided by the user

## Core principle

The cover letter must be credible in an interview.

Do not make the candidate sound more experienced, senior, specialised, or company-specific than the evidence supports.

## Structured context rules

The user may provide structured cover letter context. Follow these rules strictly:

### Role title
- If roleTitle is provided, use it as the role title in the opening paragraph.
- If not provided, infer from the job description title.

### Company name
- If hiringCompanyName is provided, use it as the employer name.
- If hiringCompanyName is not provided, check the job description for a clear hiring company name.
- Do not assume the company listed is the hiring company if it appears to be a recruiter, agency, job board, or staffing firm.
- If visibleCompanyIsRecruiter is true, do not name that company as the employer under any circumstances.
- If the hiring company is unclear and not provided, use neutral wording: "this role", "this opportunity", or "the team".

### Motivation
- If motivation is provided, use it as the basis for expressing interest.
- If motivation is not provided, do not invent company-specific motivation.
- Keep motivation grounded and general if no specific reason is given.

### Location / right-to-work
- Only include location or right-to-work details if locationRightToWork is provided.
- Do not invent or assume the candidate's location or work eligibility.

### Do not mention
- If doNotMention is provided, strictly exclude those topics, tools, companies, or claims.
- This overrides any other instruction.

### Additional notes
- Use additionalNotes for tone, preferences, and any other guidance.

## General company rules

- Do not invent company facts, achievements, team structure, or product details.
- Do not invent motivation.
- Do not invent personal background.
- Use company, product, or domain information only if it appears in the job description or user-provided context.
## Unsupported claims

- Do not include unsupported tools, skills, domains, achievements, or responsibilities.
- Do not include a requirement just because it appears in the JD.
- Do not include anything the user marked as not having.
- Do not turn weak evidence into a strong claim.

## Confirmation status rules

- If status is "I do not have this": do not mention that requirement.
- If status is "I have related / similar experience": use adjacent wording only; do not claim direct experience.
- If status is "I have direct experience": include it only if the evidence level supports how strongly it is phrased.

## Evidence level rules

- "professional / production work": may present as genuine professional experience.
- "freelance / client project": may present as professional experience, but not as in-house product/platform experience.
- "personal project / portfolio": phrase as project or portfolio exposure; do not present as commercial experience.
- "coursework / training": phrase as training, exposure, fundamentals, or coursework; do not present as real-world production experience.
- "basic exposure only": avoid mentioning it in the cover letter unless it is directly relevant and clearly phrased as basic exposure.

## Evidence note rules

If the user provided an evidence note, treat it as declared truth.

However:
- Do not invent details beyond what the note states.
- Do not broaden one tool into a wider category.
- If the user confirms only AWS, do not mention Azure.
- If the user confirms only Redux as similar experience, do not mention Zustand.
- If the user confirms coursework only, do not phrase it as professional experience.

If the user confirms a requirement but gives no evidence note, be cautious:
- prefer CV-supported evidence
- use softer wording
- avoid making it a central selling point in the cover letter

## Tone

Use concise professional UK-style language.

Avoid exaggerated or generic phrases such as:
- profound expertise
- uniquely qualified
- exceptional passion
- spearheaded
- championed
- expert in
- I am particularly drawn to this opportunity

Use stronger wording only when clearly supported by CV evidence or explicit user context.

Prefer language that is:
- clear
- confident
- grounded
- human
- specific where evidence exists

## Content priorities

Prioritise:
- the candidate's strongest supported experience
- relevant React / TypeScript / frontend engineering evidence
- relevant product, domain, scale, collaboration, and delivery evidence
- company/product/domain context only when safely provided

Do not over-focus on weakly evidenced user confirmations.

## Structure

Write:
- greeting
- short opening paragraph
- 1–2 body paragraphs linking evidence to the role
- short closing paragraph

Keep it concise.
Do not make it sound like a template.
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
  coverLetterContext: CoverLetterContext;
}

const STATUS_LABELS: Record<NonNullable<ConfirmationItem["status"]>, string> = {
  direct: "User confirmed: I have direct experience",
  similar: "User confirmed: I have related / similar experience (do not claim direct experience)",
  none: "User confirmed: I do not have this (do not include in cover letter)",
};

const EVIDENCE_SOURCE_LABELS: Record<EvidenceSource, string> = {
  production: "professional / production work",
  freelance: "freelance / client project",
  personal_project: "personal project / portfolio",
  coursework: "coursework / training",
  basic_exposure: "basic exposure only",
};

function formatConfirmation(c: ConfirmationItem): string {
  const lines: string[] = [
    `- ${c.skill}: ${STATUS_LABELS[c.status!]}`,
    `  Context: ${c.context}`,
  ];
  if (c.evidenceSource) {
    lines.push(`  Evidence level: ${EVIDENCE_SOURCE_LABELS[c.evidenceSource]}`);
  }
  if (c.evidenceNote?.trim()) {
    lines.push(`  Evidence note: ${c.evidenceNote.trim()}`);
  }
  return lines.join("\n");
}

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
          .filter((c) => c.status !== null)
          .map(formatConfirmation)
          .join("\n")}`
      : "No uncertain requirements to confirm.";

  const contextBlock = input.additionalContext.trim()
    ? `Additional CV context (treat as declared truth):\n${input.additionalContext.trim()}`
    : "No additional context provided.";

  const ctx = input.coverLetterContext;
  const coverLetterContextLines: string[] = [];

  if (ctx.roleTitle?.trim()) {
    coverLetterContextLines.push(`Role title: ${ctx.roleTitle.trim()}`);
  }
  if (ctx.hiringCompanyName?.trim()) {
    coverLetterContextLines.push(`Hiring company name: ${ctx.hiringCompanyName.trim()}`);
  }
  if (ctx.visibleCompanyIsRecruiter) {
    coverLetterContextLines.push(
      "Visible company is a recruiter/agency: true — do NOT name this company as the employer."
    );
  }
  if (ctx.motivation?.trim()) {
    coverLetterContextLines.push(`Candidate motivation: ${ctx.motivation.trim()}`);
  }
  if (ctx.locationRightToWork?.trim()) {
    coverLetterContextLines.push(`Location / right-to-work: ${ctx.locationRightToWork.trim()}`);
  }
  if (ctx.doNotMention?.trim()) {
    coverLetterContextLines.push(`Do NOT mention: ${ctx.doNotMention.trim()}`);
  }
  if (ctx.additionalNotes?.trim()) {
    coverLetterContextLines.push(`Additional notes: ${ctx.additionalNotes.trim()}`);
  }

  const coverLetterContextBlock =
    coverLetterContextLines.length > 0
      ? `Cover letter context (follow strictly):\n${coverLetterContextLines.join("\n")}`
      : "No cover letter context provided. Use neutral wording for company and motivation.";

  return [
    `Here are the rewritten CV sections to base the cover letter on:\n\n${rewritesBlock}`,
    `---\n\nJob description:\n\n${input.jobDescription}`,
    `---\n\n${strongMatchesBlock}`,
    `---\n\n${underEmphasizedBlock}`,
    `---\n\n${confirmationsBlock}`,
    `---\n\n${contextBlock}`,
    `---\n\n${coverLetterContextBlock}`,
  ].join("\n\n");
}
