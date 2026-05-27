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

export interface SuggestedEdit {
  text: string;
  evidenceLevel: "supported" | "partially_supported" | "requires_verification";
  actionability: "safe_to_use" | "verify_first" | "do_not_claim";
  reason: string;
}

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
