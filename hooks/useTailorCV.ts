"use client";

import { useState } from "react";
import type { CVSection } from "@/lib/llm/types";

export type TailorStatus =
  | "idle"
  | "extracting"
  | "sectionsReady"
  | "tailoring"
  | "tailored"
  | "error";

export interface TailorCVState {
  status: TailorStatus;
  sections: CVSection[];
  jobDescription: string;
  error: string | null;
}

export interface TailorCVActions {
  extractSections: (cvFile: File, jobDescription: string) => Promise<void>;
  toggleSection: (id: string) => void;
  tailorSelected: () => Promise<void>;
  reset: () => void;
}

function extractApiError(data: unknown, fallback: string): string {
  if (typeof data === "object" && data !== null && "error" in data) {
    return String((data as { error: unknown }).error);
  }
  return fallback;
}

export function useTailorCV(): TailorCVState & TailorCVActions {
  const [status, setStatus] = useState<TailorStatus>("idle");
  const [sections, setSections] = useState<CVSection[]>([]);
  const [jobDescription, setJobDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function extractSections(cvFile: File, jd: string) {
    setStatus("extracting");
    setSections([]);
    setError(null);
    setJobDescription(jd);

    try {
      const formData = new FormData();
      formData.append("cv", cvFile);
      formData.append("jobDescription", jd);

      const response = await fetch("/api/extract-sections", {
        method: "POST",
        body: formData,
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        throw new Error(
          extractApiError(data, "Failed to extract CV sections. Please try again.")
        );
      }

      if (
        typeof data !== "object" ||
        data === null ||
        !Array.isArray((data as Record<string, unknown>).sections)
      ) {
        throw new Error("Unexpected response from server.");
      }

      setSections((data as { sections: CVSection[] }).sections);
      setStatus("sectionsReady");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setStatus("error");
    }
  }

  function toggleSection(id: string) {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s))
    );
  }

  async function tailorSelected() {
    const selected = sections.filter((s) => s.selected);
    if (selected.length === 0) return;

    setStatus("tailoring");
    setError(null);

    try {
      const response = await fetch("/api/tailor-sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: selected, jobDescription }),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        throw new Error(
          extractApiError(data, "Failed to tailor sections. Please try again.")
        );
      }

      if (
        typeof data !== "object" ||
        data === null ||
        !Array.isArray((data as Record<string, unknown>).sections)
      ) {
        throw new Error("Unexpected response from server.");
      }

      const tailored = (data as { sections: CVSection[] }).sections;
      const tailoredById = new Map(tailored.map((s) => [s.id, s]));

      setSections((prev) =>
        prev.map((s) => tailoredById.get(s.id) ?? s)
      );
      setStatus("tailored");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setStatus("error");
    }
  }

  function reset() {
    setStatus("idle");
    setSections([]);
    setJobDescription("");
    setError(null);
  }

  return { status, sections, jobDescription, error, extractSections, toggleSection, tailorSelected, reset };
}
