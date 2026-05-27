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

export interface TailoringInsight {
  sectionId: string;
  title: string;
  originalText: string;
  relevanceScore: 1 | 2 | 3 | 4 | 5;
  relevanceReason: string;
  suggestedStrategy: string;
  keyJDMatches: string[];
  missingOrWeakSignals: string[];
  suggestedRewrites: string[];
  finalSuggestedText?: string;
}
