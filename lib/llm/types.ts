export type CVSectionType =
  | "summary"
  | "skills"
  | "experience"
  | "education"
  | "projects"
  | "certifications"
  | "other";

export interface CVSection {
  id: string;
  type: CVSectionType;
  title: string;
  originalText: string;
  selected: boolean;
  relevanceReason?: string;
}

// ---------------------------------------------------------------------------
// New types — global assessment guided tailoring flow
// ---------------------------------------------------------------------------

export interface ConfirmationItem {
  id: string;
  skill: string;
  context: string;
  answer: "have_it" | "similar" | "dont_have" | null;
}

export interface GlobalAssessment {
  strongMatches: string[];
  underEmphasized: string[];
  needsConfirmation: ConfirmationItem[];
  nonActionableGaps: string[];
  recommendedSectionIds: string[];
}

export interface SectionRewrite {
  sectionId: string;
  title: string;
  originalText: string;
  rewrittenText: string;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Legacy types — kept until cleanup step
// ---------------------------------------------------------------------------

/** @deprecated */
export interface SuggestedEdit {
  text: string;
  evidenceLevel: "supported" | "partially_supported" | "requires_verification";
  actionability: "safe_to_use" | "verify_first" | "do_not_claim";
  reason: string;
  suggestedReplacement?: string;
}

/** @deprecated */
export interface TailoringInsight {
  sectionId: string;
  title: string;
  originalText: string;
  relevanceScore: 1 | 2 | 3 | 4 | 5;
  relevanceReason: string;
  suggestedStrategy: string;
  keyJDMatches: string[];
  stronglyDemonstrated: string[];
  underEmphasized: string[];
  adjacentEvidence: string[];
  actionableImprovements: string[];
  nonActionableGaps: string[];
  trulyMissing: string[];
  suggestedEdits: SuggestedEdit[];
  finalSuggestedText?: string;
}
