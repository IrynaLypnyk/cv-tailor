export interface TailorInput {
  cvText: string;
  jobDescription: string;
}

export interface TailoredCV {
  professionalSummary: string;
  keySkills: string[];
  tailoredExperienceBullets: string[];
  atsKeywords: string[];
  notes: string[];
}
