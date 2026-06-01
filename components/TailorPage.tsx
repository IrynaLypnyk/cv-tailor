"use client";

import { useTailorCV } from "@/hooks/useTailorCV";
import { CVUploadForm } from "./CVUploadForm";
import { GlobalAssessmentView } from "./GlobalAssessmentView";
import { ConfirmAndGenerateForm } from "./ConfirmAndGenerateForm";
import { SectionRewriteResult } from "./SectionRewriteResult";
import { StatusMessage } from "./StatusMessage";
import type { AccessInfo } from "@/lib/auth/session";
import { AlertBanner } from "./AlertBanner";
import { CollapsibleStep } from "./CollapsibleStep";

// ---------------------------------------------------------------------------
// Helper — wraps content in a CollapsibleStep only when collapsed is true
// ---------------------------------------------------------------------------

function maybeCollapse(
  title: string,
  collapsed: boolean,
  children: React.ReactNode
): React.ReactNode {
  return collapsed ? (
    <CollapsibleStep title={title} defaultOpen={false}>
      {children}
    </CollapsibleStep>
  ) : (
    children
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface TailorPageProps {
  /** Resolved server-side from cookies; determines which access banner to show. */
  accessInfo?: AccessInfo;
  /**
   * True when an admin visits with ?mode=demo to preview the demo experience.
   * Downgrades effective access to demo mode without clearing the session.
   */
  isForcedDemoMode?: boolean;
}

export function TailorPage({ accessInfo, isForcedDemoMode = false }: TailorPageProps) {
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
  // Effective access: admin viewing ?mode=demo is treated as a demo user for
  // banner and block logic, but the session itself is not cleared.
  const effectiveIsAdmin = isAdmin && !isForcedDemoMode;
  const demoLimitReached = !effectiveIsAdmin && (accessInfo?.demoLimitReached === true);
  // Show the demo info banner to non-admin users who still have requests left.
  const showDemoBanner = !effectiveIsAdmin && !demoLimitReached;

  async function handleLogout() {
    await fetch("/api/admin-logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <div
      data-component="TailorPage"
      className="mx-auto flex w-full max-w-[1024px] flex-col gap-10 px-4 py-12 sm:px-6"
    >
      <header className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            CV Tailor
          </h1>
          {isAdmin && (
            <button
              type="button"
              onClick={handleLogout}
              className="mt-1 text-xs text-zinc-400 underline underline-offset-2 hover:text-zinc-600"
            >
              Log out
            </button>
          )}
        </div>
        <p className="text-sm text-zinc-500">
          Upload your CV and a job description to get a global assessment and
          targeted section rewrites.
        </p>
      </header>

      {isAdmin && isForcedDemoMode && (
        <AlertBanner variant="amber">
          Viewing as demo user.{" "}
          <a href="/" className="underline underline-offset-2 hover:opacity-70">
            Exit demo preview
          </a>
        </AlertBanner>
      )}

      {showDemoBanner && (
        <AlertBanner variant="amber">
          <span className="font-semibold">Demo mode:</span> you can try up to 2
          real AI requests. Full access is available only to the admin.
        </AlertBanner>
      )}

      {showForm && (
        <>
          {demoLimitReached ? (
            <AlertBanner variant="red">
              <span className="font-semibold">Demo limit reached.</span> You've used
              your 2 demo requests. Please try again in 3 days.
            </AlertBanner>
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
          {maybeCollapse(
            "Global CV assessment",
            isDone,
            <GlobalAssessmentView
              assessment={assessment}
              confirmations={confirmations}
              onUpdateConfirmation={updateConfirmation}
            />
          )}

          {maybeCollapse(
            "Options and sections",
            isDone,
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
