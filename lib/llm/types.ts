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

export type ConfirmationStatus = "direct" | "similar" | "none" | null;

export type EvidenceSource =
  | "production"
  | "freelance"
  | "personal_project"
  | "coursework"
  | "basic_exposure";

export interface ConfirmationItem {
  id: string;
  skill: string;
  context: string;
  status: ConfirmationStatus;
  evidenceSource?: EvidenceSource;
  evidenceNote?: string;
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
