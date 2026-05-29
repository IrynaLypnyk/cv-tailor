"use client";

import { useState } from "react";
import { useTailorCV } from "@/hooks/useTailorCV";
import { CVUploadForm } from "./CVUploadForm";
import { GlobalAssessmentView } from "./GlobalAssessmentView";
import { ConfirmAndGenerateForm } from "./ConfirmAndGenerateForm";
import { SectionRewriteResult } from "./SectionRewriteResult";
import { StatusMessage } from "./StatusMessage";
import type { AccessInfo } from "@/lib/auth/session";

// ---------------------------------------------------------------------------
// Access banners — shown based on server-resolved access info
// ---------------------------------------------------------------------------

function DemoBanner() {
  return (
    <div
      data-component="DemoBanner"
      className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
    >
      <span className="font-semibold">Demo mode:</span> you can try up to 2
      real AI requests. Full access is available only to the admin.
    </div>
  );
}

function DemoLimitBanner() {
  return (
    <div
      data-component="DemoLimitBanner"
      className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      <span className="font-semibold">Demo limit reached.</span> You've used
      your 2 demo requests. Please try again in 3 days.
    </div>
  );
}

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

interface TailorPageProps {
  /** Resolved server-side from cookies; determines which access banner to show. */
  accessInfo?: AccessInfo;
}

export function TailorPage({ accessInfo }: TailorPageProps) {
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

  const isAdmin = accessInfo?.isAdmin === true;
  const demoLimitReached = accessInfo?.demoLimitReached === true;
  // Show the demo info banner to guests who still have requests remaining.
  const showDemoBanner = !isAdmin && !demoLimitReached;

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

      {showDemoBanner && <DemoBanner />}

      {showForm && (
        <>
          {demoLimitReached ? (
            <DemoLimitBanner />
          ) : (
            <>
              <CVUploadForm
                onSubmit={assess}
                isLoading={status === "assessing"}
              />
              <StatusMessage status={status} error={error} />
            </>
          )}
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
