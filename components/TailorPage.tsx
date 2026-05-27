"use client";

import { useTailorCV } from "@/hooks/useTailorCV";
import { CVUploadForm } from "./CVUploadForm";
import { CVSectionList } from "./CVSectionList";
import { TailoredSectionsResult } from "./SectionBeforeAfter";
import { StatusMessage } from "./StatusMessage";

export function TailorPage() {
  const {
    status,
    sections,
    error,
    extractSections,
    toggleSection,
    tailorSelected,
    reset,
  } = useTailorCV();

  const showForm = status === "idle" || status === "extracting" || status === "error";
  const showSections = status === "sectionsReady" || status === "tailoring";
  const showResult = status === "tailored";

  return (
    <div
      data-component="TailorPage"
      className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-4 py-12 sm:px-6"
    >
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          CV Tailor
        </h1>
        <p className="text-sm text-zinc-500">
          Upload your CV and a job description. Select which sections to tailor,
          then review a before/after view for each one.
        </p>
      </header>

      {showForm && (
        <>
          <CVUploadForm
            onSubmit={extractSections}
            isLoading={status === "extracting"}
          />
          <StatusMessage status={status} error={error} />
        </>
      )}

      {showSections && (
        <>
          <CVSectionList
            sections={sections}
            isLoading={status === "tailoring"}
            onToggle={toggleSection}
            onTailor={tailorSelected}
          />
          <StatusMessage status={status} error={null} />
        </>
      )}

      {showResult && (
        <TailoredSectionsResult sections={sections} onReset={reset} />
      )}
    </div>
  );
}
