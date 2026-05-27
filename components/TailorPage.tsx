"use client";

import { useState } from "react";
import { useTailorCV } from "@/hooks/useTailorCV";
import { CVUploadForm } from "./CVUploadForm";
import { GlobalAssessmentView } from "./GlobalAssessmentView";
import { ConfirmAndGenerateForm } from "./ConfirmAndGenerateForm";
import { SectionRewriteResult } from "./SectionRewriteResult";
import { StatusMessage } from "./StatusMessage";

// ---------------------------------------------------------------------------
// Local collapsible wrapper — only used on this page
// ---------------------------------------------------------------------------

function CollapsibleStep({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="flex flex-col gap-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 border-b border-zinc-200 pb-3 text-left"
      >
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <span className="shrink-0 text-xs text-zinc-400">
          {open ? "Hide" : "Show"}
        </span>
      </button>
      {open && <div className="pt-6">{children}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function TailorPage() {
  const {
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
    error,
    assess,
    updateConfirmation,
    toggleSection,
    setAdditionalContext,
    setGenerateCoverLetter,
    setCoverLetterContext,
    generateRewrites,
    reset,
  } = useTailorCV();

  const showForm =
    status === "idle" || status === "assessing" || status === "error";
  const showGuidedFlow =
    status === "confirming" ||
    status === "generating" ||
    status === "done";
  const isDone = status === "done";

  const hasUnansweredConfirmations = confirmations.some(
    (c) => c.status === null
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

      {showGuidedFlow && assessment && (
        <>
          {isDone ? (
            <CollapsibleStep title="Global CV assessment" defaultOpen={false}>
              <GlobalAssessmentView
                assessment={assessment}
                confirmations={confirmations}
                onUpdateConfirmation={updateConfirmation}
              />
            </CollapsibleStep>
          ) : (
            <GlobalAssessmentView
              assessment={assessment}
              confirmations={confirmations}
              onUpdateConfirmation={updateConfirmation}
            />
          )}

          {isDone ? (
            <CollapsibleStep title="Options and sections" defaultOpen={false}>
              <ConfirmAndGenerateForm
                sections={sections}
                selectedSectionIds={selectedSectionIds}
                onToggleSection={toggleSection}
                additionalContext={additionalContext}
                onAdditionalContextChange={setAdditionalContext}
                generateCoverLetter={generateCoverLetter}
                onGenerateCoverLetterChange={setGenerateCoverLetter}
                coverLetterContext={coverLetterContext}
                onCoverLetterContextChange={setCoverLetterContext}
                hasUnansweredConfirmations={hasUnansweredConfirmations}
                onGenerate={generateRewrites}
                isLoading={false}
              />
            </CollapsibleStep>
          ) : (
            <ConfirmAndGenerateForm
              sections={sections}
              selectedSectionIds={selectedSectionIds}
              onToggleSection={toggleSection}
              additionalContext={additionalContext}
              onAdditionalContextChange={setAdditionalContext}
              generateCoverLetter={generateCoverLetter}
              onGenerateCoverLetterChange={setGenerateCoverLetter}
              coverLetterContext={coverLetterContext}
              onCoverLetterContextChange={setCoverLetterContext}
              hasUnansweredConfirmations={hasUnansweredConfirmations}
              onGenerate={generateRewrites}
              isLoading={status === "generating"}
            />
          )}

          <StatusMessage status={status} error={null} />

          {isDone && (
            <SectionRewriteResult
              rewrites={rewrites}
              coverLetter={coverLetter}
              onReset={reset}
            />
          )}
        </>
      )}
    </div>
  );
}
