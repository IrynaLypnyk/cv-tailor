"use client";

import { useEffect, useState } from "react";
import { useTailorCV } from "@/hooks/useTailorCV";
import { CVUploadForm } from "./CVUploadForm";
import { GlobalAssessmentView } from "./GlobalAssessmentView";
import { ConfirmAndGenerateForm } from "./ConfirmAndGenerateForm";
import { SectionRewriteResult } from "./SectionRewriteResult";
import { StatusMessage } from "./StatusMessage";
import type { AccessInfo } from "@/lib/auth/session";
import { AlertBanner } from "./AlertBanner";
import { AppShell } from "./AppShell";
import { AppSidebar } from "./AppSidebar";
import { Button } from "./Button";
import type { StepId } from "./StepNav";

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

  // Active tab — controls which single content panel is visible.
  // Pure UI concern, decoupled from workflow status.
  const [activeStep, setActiveStep] = useState<StepId>("upload");

  // Auto-advance to the relevant tab when the workflow reaches key milestones.
  useEffect(() => {
    if (status === "confirming") setActiveStep("assessment");
    if (status === "done") setActiveStep("tailored-cv");
  }, [status]);

  // Furthest step reached — derived from data presence, never goes backward on
  // tab navigation. Resets naturally when assess() clears assessment/rewrites.
  const maxReachedStep: StepId =
    rewrites.length > 0 ? "tailored-cv"
    : assessment !== null ? "options"
    : "upload";

  const hasUnansweredConfirmations = confirmations.some(
    (c) => c.status === null
  );

  const isAdmin = accessInfo?.isAdmin === true;
  // Effective access: admin viewing ?mode=demo is treated as a demo user for
  // banner and block logic, but the session itself is not cleared.
  const effectiveIsAdmin = isAdmin && !isForcedDemoMode;
  const demoLimitReached =
    !effectiveIsAdmin && accessInfo?.demoLimitReached === true;
  // Show the demo info banner to non-admin users who still have requests left.
  const showDemoBanner = !effectiveIsAdmin && !demoLimitReached;

  async function handleLogout() {
    await fetch("/api/admin-logout", { method: "POST" });
    window.location.href = "/";
  }

  function handleStepClick(step: StepId) {
    // Pure tab switch — no state or data reset.
    setActiveStep(step);
  }

  const header = (
    <header className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            CV Tailor
          </h1>
          <p className="text-sm text-zinc-500">
            AI-powered CV optimization for your dream job
          </p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={handleLogout}
            className="mt-1 shrink-0 text-xs text-zinc-400 underline underline-offset-2 hover:text-zinc-600"
          >
            Log out
          </button>
        )}
      </div>

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
    </header>
  );

  const sidebar = (
    <AppSidebar
      currentStep={activeStep}
      maxReachedStep={maxReachedStep}
      onStepClick={handleStepClick}
    />
  );

  return (
    <div data-component="TailorPage">
      <AppShell header={header} sidebar={sidebar}>
        {/* Upload panel — always mounted to preserve local file/JD state.
            Visibility toggled by CSS so the form never remounts on tab switch. */}
        <div className={activeStep === "upload" ? "flex flex-col gap-8" : "hidden"}>
          {demoLimitReached ? (
            <AlertBanner variant="red">
              <span className="font-semibold">Demo limit reached.</span>{" "}
              You've used your 2 demo requests. Please try again in 3 days.
            </AlertBanner>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-semibold text-foreground">
                  Upload documents
                </h2>
                <p className="text-sm text-zinc-500">
                  Upload your CV and a job description to get a global assessment
                  and targeted section rewrites.
                </p>
              </div>
              <CVUploadForm
                onSubmit={assess}
                isLoading={status === "assessing"}
              />
              <StatusMessage status={status} error={error} />
            </>
          )}
        </div>

        {/* Assessment panel */}
        {activeStep === "assessment" && assessment && (
          <div className="flex flex-col gap-8">
            <GlobalAssessmentView
              assessment={assessment}
              confirmations={confirmations}
              onUpdateConfirmation={updateConfirmation}
            />
            <div className="border-t border-zinc-100 pt-6">
              <Button
                variant="primary"
                onClick={() => handleStepClick("options")}
                className="self-start"
              >
                Continue to Options &amp; sections →
              </Button>
            </div>
          </div>
        )}

        {/* Options & sections panel */}
        {activeStep === "options" && assessment && (
          <div className="flex flex-col gap-8">
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
            {status === "generating" && (
              <StatusMessage status={status} error={null} />
            )}
          </div>
        )}

        {/* Tailored CV panel */}
        {activeStep === "tailored-cv" && rewrites.length > 0 && (
          <SectionRewriteResult
            rewrites={rewrites}
            coverLetter={coverLetter}
            onReset={reset}
          />
        )}
      </AppShell>
    </div>
  );
}
