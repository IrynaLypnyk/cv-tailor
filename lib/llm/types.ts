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
