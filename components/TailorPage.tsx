"use client";

import { useTailorCV } from "@/hooks/useTailorCV";
import { CVUploadForm } from "./CVUploadForm";
import { GlobalAssessmentView } from "./GlobalAssessmentView";
import { ConfirmAndGenerateForm } from "./ConfirmAndGenerateForm";
import { SectionRewriteResult } from "./SectionRewriteResult";
import { StatusMessage } from "./StatusMessage";

export function TailorPage() {
  const {
    status,
    sections,
    assessment,
    confirmations,
    selectedSectionIds,
    additionalContext,
    generateCoverLetter,
    coverLetterNotes,
    rewrites,
    coverLetter,
    error,
    assess,
    updateConfirmation,
    toggleSection,
    setAdditionalContext,
    setGenerateCoverLetter,
    setCoverLetterNotes,
    generateRewrites,
    reset,
  } = useTailorCV();

  const showForm =
    status === "idle" || status === "assessing" || status === "error";
  const showConfirming =
    status === "confirming" || status === "generating";
  const showResult = status === "done";

  const hasUnansweredConfirmations = confirmations.some(
    (c) => c.answer === null
  );

  return (
    <div
      data-component="TailorPage"
      className="mx-auto flex w-full max-w-[1024px] flex-col gap-10 px-4 py-12 sm:px-6"
    >
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          CV Tailor
        </h1>
        <p className="text-sm text-zinc-500">
          Upload your CV and a job description to get a global assessment and
          targeted section rewrites.
        </p>
      </header>

      {showForm && (
        <>
          <CVUploadForm
            onSubmit={assess}
            isLoading={status === "assessing"}
          />
          <StatusMessage status={status} error={error} />
        </>
      )}

      {showConfirming && assessment && (
        <>
          <GlobalAssessmentView
            assessment={assessment}
            confirmations={confirmations}
            onUpdateConfirmation={updateConfirmation}
          />
          <ConfirmAndGenerateForm
            sections={sections}
            selectedSectionIds={selectedSectionIds}
            onToggleSection={toggleSection}
            additionalContext={additionalContext}
            onAdditionalContextChange={setAdditionalContext}
            generateCoverLetter={generateCoverLetter}
            onGenerateCoverLetterChange={setGenerateCoverLetter}
            coverLetterNotes={coverLetterNotes}
            onCoverLetterNotesChange={setCoverLetterNotes}
            hasUnansweredConfirmations={hasUnansweredConfirmations}
            onGenerate={generateRewrites}
            isLoading={status === "generating"}
          />
          <StatusMessage status={status} error={null} />
        </>
      )}

      {showResult && (
        <SectionRewriteResult
          rewrites={rewrites}
          coverLetter={coverLetter}
          onReset={reset}
        />
      )}
    </div>
  );
}
