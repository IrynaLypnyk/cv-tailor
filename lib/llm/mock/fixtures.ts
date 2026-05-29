/**
 * Canned LLM responses used when LLM_PROVIDER=mock.
 *
 * These fixtures are realistic enough to exercise every UI state:
 * - loading indicators (achieved via simulateDelay)
 * - all four assessment categories
 * - confirmation items (triggering the confirmation step)
 * - before/after section rewrites
 * - cover letter output
 *
 * No real API tokens are consumed.
 */

import type { CVSection, GlobalAssessment, SectionRewrite } from "../types";
import type { RewriteInput } from "../prompts/generate-section-rewrites.prompt";

/** Waits for `ms` milliseconds, mimicking a real network round-trip. */
export function simulateDelay(ms = 1500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// extractCVSections
// ---------------------------------------------------------------------------

export const MOCK_CV_SECTIONS: CVSection[] = [
  {
    id: "summary",
    type: "summary",
    title: "Professional Summary",
    originalText:
      "Full-stack developer with 4 years of experience building React/Node applications. Focused on clean code and collaborative agile teams.",
    selected: true,
    relevanceReason: "Role explicitly requires a full-stack generalist.",
  },
  {
    id: "experience",
    type: "experience",
    title: "Work Experience",
    originalText:
      "Software Engineer at Acme Ltd (2021–present)\n- Built React dashboards consumed by 10,000 daily users.\n- Led migration from REST to GraphQL, reducing average payload size by 40%.\n- Mentored two junior developers.",
    selected: true,
    relevanceReason: "Strong match with React and API requirements.",
  },
  {
    id: "skills",
    type: "skills",
    title: "Technical Skills",
    originalText:
      "Languages: TypeScript, JavaScript, Python\nFrameworks: React, Next.js, Express\nInfrastructure: Docker, basic AWS (EC2, S3)\nTesting: Jest, React Testing Library",
    selected: true,
    relevanceReason: "Overlaps directly with required technology stack.",
  },
  {
    id: "education",
    type: "education",
    title: "Education",
    originalText: "BSc Computer Science, University of Bristol, 2017–2020, First Class Honours.",
    selected: false,
  },
];

// ---------------------------------------------------------------------------
// assessCVGlobally
// ---------------------------------------------------------------------------

export const MOCK_GLOBAL_ASSESSMENT: GlobalAssessment = {
  strongMatches: [
    "React / Next.js — extensive production usage aligns with role requirements.",
    "TypeScript — used throughout current role, matches JD.",
    "REST & GraphQL APIs — demonstrated practical experience.",
  ],
  underEmphasized: [
    "Testing depth — Jest mentioned in skills but no concrete examples; worth elaborating.",
    "Mentoring / leadership — briefly noted; the JD asks for senior collaboration skills.",
  ],
  needsConfirmation: [
    {
      id: "conf-aws",
      skill: "AWS — EC2, RDS, or similar cloud services",
      context: "The JD requires ownership of cloud deployments. CV lists only 'basic AWS'.",
      status: null,
    },
    {
      id: "conf-ci",
      skill: "CI/CD pipelines (GitHub Actions, CircleCI, etc.)",
      context:
        "The JD expects familiarity with automated deployment pipelines; not mentioned in the CV.",
      status: null,
    },
  ],
  nonActionableGaps: [
    "Requires 6+ years of experience — CV shows 4 years.",
    "Kotlin / Android development listed as a nice-to-have; not on CV and not actionable to add.",
  ],
  recommendedSectionIds: ["summary", "experience", "skills"],
};

// ---------------------------------------------------------------------------
// generateSectionRewrites — derived from actual input sections
// ---------------------------------------------------------------------------

/** Canned rewritten text keyed by section id. */
const MOCK_REWRITTEN_TEXTS: Record<string, { rewrittenText: string; notes?: string }> = {
  summary: {
    rewrittenText:
      "Full-stack engineer with 4 years of production experience delivering scalable React/Node.js applications. Proven track record of improving API performance, mentoring junior engineers, and contributing to high-output agile teams.",
    notes:
      "Added 'scalable' and 'production experience' to better match the seniority implied by the JD.",
  },
  experience: {
    rewrittenText:
      "Software Engineer – Acme Ltd (2021–present)\n• Designed and delivered React dashboards serving 10,000 daily active users, with a focus on performance and accessibility.\n• Led a REST-to-GraphQL migration that reduced average response payload by 40%, improving mobile client performance.\n• Mentored two junior engineers through code reviews and pair-programming sessions, accelerating their onboarding by ~30%.",
    notes:
      "Bullet points quantified and reordered to front-load the strongest evidence for the JD's requirements.",
  },
  skills: {
    rewrittenText:
      "Languages: TypeScript (primary), JavaScript, Python\nFrameworks: React, Next.js, Express.js\nTesting: Jest, React Testing Library (unit & integration)\nInfrastructure: Docker, AWS (EC2, S3) — production experience\nTooling: Git, GitHub Actions",
    notes: "Testing and infrastructure sections expanded; AWS clarified as production experience.",
  },
};

export function mockGenerateSectionRewrites(input: RewriteInput): SectionRewrite[] {
  return input.sections.map((section) => {
    const canned = MOCK_REWRITTEN_TEXTS[section.id];
    return {
      sectionId: section.id,
      title: section.title,
      originalText: section.originalText,
      rewrittenText:
        canned?.rewrittenText ??
        `[Mock rewrite] ${section.originalText.slice(0, 120).trim()}…`,
      notes: canned?.notes,
    };
  });
}

// ---------------------------------------------------------------------------
// generateCoverLetter
// ---------------------------------------------------------------------------

export const MOCK_COVER_LETTER = `Dear Hiring Team,

I am writing to express my interest in the Senior Full-Stack Engineer role. With four years of hands-on experience building React and Node.js applications in production, I am confident I can contribute meaningfully from day one.

At Acme Ltd, I led a REST-to-GraphQL migration that reduced payload sizes by 40% and owned dashboards used by 10,000 daily users. These projects required close collaboration with product and design teams — an environment I find highly motivating. I also mentored junior engineers, and take genuine satisfaction in growing team capability alongside my own.

I am particularly interested in the breadth of infrastructure responsibility described in your job description. My experience with Docker and AWS gives me a solid foundation, and I am actively deepening my CI/CD knowledge.

I would welcome the opportunity to discuss how my background aligns with your team's goals.

Sincerely,`;
