"use client";

import { useState } from "react";
import type {
  CVSection,
  ConfirmationItem,
  ConfirmationStatus,
  CoverLetterContext,
  EvidenceSource,
  GlobalAssessment,
  SectionRewrite,
} from "@/lib/llm/types";

export type TailorStatus =
  | "idle"
  | "assessing"
  | "confirming"
  | "generating"
  | "done"
  | "error";

export interface TailorCVState {
  status: TailorStatus;
  sections: CVSection[];
  assessment: GlobalAssessment | null;
  confirmations: ConfirmationItem[];
  selectedSectionIds: string[];
  additionalContext: string;
  generateCoverLetter: boolean;
  coverLetterContext: CoverLetterContext;
  rewrites: SectionRewrite[];
  coverLetter: string | undefined;
  jobDescription: string;
  error: string | null;
}

export interface TailorCVActions {
  assess: (cvFile: File, jobDescription: string) => Promise<void>;
  updateConfirmation: (
    id: string,
    patch: { status?: ConfirmationStatus; evidenceSource?: EvidenceSource; evidenceNote?: string }
  ) => void;
  toggleSection: (id: string) => void;
  setAdditionalContext: (text: string) => void;
  setGenerateCoverLetter: (value: boolean) => void;
  setCoverLetterContext: (patch: Partial<CoverLetterContext>) => void;
  generateRewrites: () => Promise<void>;
  reset: () => void;
}

function extractApiError(data: unknown, fallback: string): string {
  if (typeof data === "object" && data !== null && "error" in data) {
    return String((data as { error: unknown }).error);
  }
  return fallback;
}

const INITIAL_STATE: TailorCVState = {
  status: "idle",
  sections: [],
  assessment: null,
  confirmations: [],
  selectedSectionIds: [],
  additionalContext: "",
  generateCoverLetter: false,
  coverLetterContext: {},
  rewrites: [],
  coverLetter: undefined,
  jobDescription: "",
  error: null,
};

export function useTailorCV(): TailorCVState & TailorCVActions {
  const [status, setStatus] = useState<TailorStatus>(INITIAL_STATE.status);
  const [sections, setSections] = useState<CVSection[]>(INITIAL_STATE.sections);
  const [assessment, setAssessment] = useState<GlobalAssessment | null>(INITIAL_STATE.assessment);
  const [confirmations, setConfirmations] = useState<ConfirmationItem[]>(INITIAL_STATE.confirmations);
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>(INITIAL_STATE.selectedSectionIds);
  const [additionalContext, setAdditionalContext] = useState(INITIAL_STATE.additionalContext);
  const [generateCoverLetter, setGenerateCoverLetter] = useState(INITIAL_STATE.generateCoverLetter);
  const [coverLetterContext, setCoverLetterContextState] = useState<CoverLetterContext>(INITIAL_STATE.coverLetterContext);
  const [rewrites, setRewrites] = useState<SectionRewrite[]>(INITIAL_STATE.rewrites);
  const [coverLetter, setCoverLetter] = useState<string | undefined>(INITIAL_STATE.coverLetter);
  const [jobDescription, setJobDescription] = useState(INITIAL_STATE.jobDescription);
  const [error, setError] = useState<string | null>(INITIAL_STATE.error);

  async function assess(cvFile: File, jd: string) {
    setStatus("assessing");
    setSections([]);
    setAssessment(null);
    setConfirmations([]);
    setSelectedSectionIds([]);
    setAdditionalContext("");
    setGenerateCoverLetter(false);
    setCoverLetterContextState({});
    setRewrites([]);
    setCoverLetter(undefined);
    setError(null);
    setJobDescription(jd);

    try {
      const formData = new FormData();
      formData.append("cv", cvFile);
      formData.append("jobDescription", jd);

      const response = await fetch("/api/assess-cv", {
        method: "POST",
        body: formData,
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        throw new Error(
          extractApiError(data, "Failed to assess CV. Please try again.")
        );
      }

      if (
        typeof data !== "object" ||
        data === null ||
        !Array.isArray((data as Record<string, unknown>).sections) ||
        typeof (data as Record<string, unknown>).assessment !== "object"
      ) {
        throw new Error("Unexpected response from server.");
      }

      const { sections: extractedSections, assessment: globalAssessment } =
        data as { sections: CVSection[]; assessment: GlobalAssessment };

      setSections(extractedSections);
      setAssessment(globalAssessment);

      // Initialise confirmations from the assessment — all statuses start as null
      setConfirmations(
        globalAssessment.needsConfirmation.map((item) => ({
          ...item,
          status: null,
        }))
      );

      // Pre-select sections recommended by the AI
      setSelectedSectionIds(globalAssessment.recommendedSectionIds ?? []);

      setStatus("confirming");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
      setStatus("error");
    }
  }

  function updateConfirmation(
    id: string,
    patch: { status?: ConfirmationStatus; evidenceSource?: EvidenceSource; evidenceNote?: string }
  ) {
    setConfirmations((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const updated = { ...c, ...patch };
        // Clear evidence fields when the user selects "none" or resets
        if (updated.status === "none" || updated.status === null) {
          delete updated.evidenceSource;
          delete updated.evidenceNote;
        }
        return updated;
      })
    );
  }

  function setCoverLetterContext(patch: Partial<CoverLetterContext>) {
    setCoverLetterContextState((prev) => ({ ...prev, ...patch }));
  }

  function toggleSection(id: string) {
    setSelectedSectionIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  async function generateRewrites() {
    if (selectedSectionIds.length === 0 || !assessment) return;

    setStatus("generating");
    setRewrites([]);
    setCoverLetter(undefined);
    setError(null);

    const selectedSections = sections
      .filter((s) => selectedSectionIds.includes(s.id))
      .map(({ id, title, originalText }) => ({ id, title, originalText }));

    try {
      const response = await fetch("/api/generate-rewrites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sections: selectedSections,
          jobDescription,
          strongMatches: assessment.strongMatches,
          underEmphasized: assessment.underEmphasized,
          confirmations,
          additionalContext,
          generateCoverLetter,
          coverLetterContext,
        }),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        throw new Error(
          extractApiError(data, "Failed to generate rewrites. Please try again.")
        );
      }

      if (
        typeof data !== "object" ||
        data === null ||
        !Array.isArray((data as Record<string, unknown>).rewrites)
      ) {
        throw new Error("Unexpected response from server.");
      }

      const result = data as { rewrites: SectionRewrite[]; coverLetter?: string };
      setRewrites(result.rewrites);
      setCoverLetter(result.coverLetter);
      setStatus("done");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
      setStatus("error");
    }
  }

  function reset() {
    setStatus(INITIAL_STATE.status);
    setSections(INITIAL_STATE.sections);
    setAssessment(INITIAL_STATE.assessment);
    setConfirmations(INITIAL_STATE.confirmations);
    setSelectedSectionIds(INITIAL_STATE.selectedSectionIds);
    setAdditionalContext(INITIAL_STATE.additionalContext);
    setGenerateCoverLetter(INITIAL_STATE.generateCoverLetter);
    setCoverLetterContextState(INITIAL_STATE.coverLetterContext);
    setRewrites(INITIAL_STATE.rewrites);
    setCoverLetter(INITIAL_STATE.coverLetter);
    setJobDescription(INITIAL_STATE.jobDescription);
    setError(INITIAL_STATE.error);
  }

  return {
    status,
    sections,
    assessment,
    confirmations,
    selectedSectionIds,
    additionalContext,
    generateCoverLetter,
    coverLetterContext,
    rewrites,
    coverLetter,
    jobDescription,
    error,
    assess,
    updateConfirmation,
    toggleSection,
    setAdditionalContext,
    setGenerateCoverLetter,
    setCoverLetterContext,
    generateRewrites,
    reset,
  };
}
