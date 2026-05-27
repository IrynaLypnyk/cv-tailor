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
  tailoredText?: string;
}

// ---------------------------------------------------------------------------
// Legacy types — kept until the old /api/tailor route and its consumers are
// removed in the cleanup step.
// ---------------------------------------------------------------------------

/** @deprecated use CVSection */
export interface TailorInput {
  cvText: string;
  jobDescription: string;
}

/** @deprecated use CVSection */
export interface TailoredCV {
  professionalSummary: string;
  keySkills: string[];
  tailoredExperienceBullets: string[];
  atsKeywords: string[];
  notes: string[];
}
