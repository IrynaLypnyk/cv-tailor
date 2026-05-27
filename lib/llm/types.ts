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
  trulyMissing: string[];
  suggestedEdits: SuggestedEdit[];
  finalSuggestedText?: string;
}
