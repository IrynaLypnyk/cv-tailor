"use client";

import { useEffect, useState } from "react";
import { useTailorCV } from "@/hooks/useTailorCV";
import { CVUploadForm } from "@/components/layouts/CVUploadForm";
import { GlobalAssessmentView } from "@/components/layouts/GlobalAssessmentView";
import { ConfirmAndGenerateForm } from "@/components/layouts/ConfirmAndGenerateForm";
import { SectionRewriteResult } from "@/components/layouts/SectionRewriteResult";
import { StatusMessage } from "@/components/ui/StatusMessage";
import type { AccessInfo } from "@/lib/auth/session";
import { AlertBanner } from "@/components/ui/AlertBanner";
import { Sidebar } from "@/components/layouts/Sidebar";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/layouts/PageHeader";
import { PanelDivider } from "@/components/ui/PanelDivider";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StepPanel } from "@/components/ui/StepPanel";
import type { StepId } from "@/components/layouts/StepNav";

interface TailorPageProps {
  /** Resolved server-side from cookies; determines which access banner to show. */
  accessInfo?: AccessInfo;
  /**
   * True when an admin visits with ?mode=demo to preview the demo experience.
   * Downgrades effective access to demo mode without clearing the session.
   */
  isForcedDemoMode?: boolean;
}

export function TailorPage({
  accessInfo,
  isForcedDemoMode = false,
}: TailorPageProps) {
  const {
    status,
    sections,
    assessment,
    confirmations,
    selectedSectionIds,
    additionalContext,
    updateRewriteText,
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
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);

  function openMobileSidebar() {
    setMobileSidebarVisible(true);
  }

  function closeMobileSidebar() {
    setMobileSidebarVisible(false);
  }
  // Auto-advance to the relevant tab when the workflow reaches key milestones.
  useEffect(() => {
    if (status === "confirming") setActiveStep("assessment");
    if (status === "done") setActiveStep("tailored-cv");
  }, [status]);

  // Furthest step reached — derived from data presence, never goes backward on
  // tab navigation. Resets naturally when assess() clears assessment/rewrites.
  const maxReachedStep: StepId =
    rewrites.length > 0
      ? "tailored-cv"
      : assessment !== null
        ? "options"
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

  return (
    <div data-component="TailorPage">
      <div className="md:ml-[280px]">
        <div className="mx-auto max-w-[1000px] px-4 sm:px-8">
          <PageHeader
            activeStep={activeStep}
            isAdmin={isAdmin}
            handleLogout={handleLogout}
            openMobileSidebar={openMobileSidebar}
            isForcedDemoMode={isForcedDemoMode}
          />

          {/* Mobile overlay */}
          {mobileSidebarVisible && (
            <div
              className="fixed inset-0 z-5 bg-foreground/40 md:hidden"
              onClick={closeMobileSidebar}
            />
          )}

          <div
            className={`fixed inset-y-0 left-0 z-20 transition-transform  -translate-x-full duration-200 ${mobileSidebarVisible ? "translate-x-0" : "-translate-x-full"} md:block md:translate-x-0`}
          >
            <Sidebar
              currentStep={activeStep}
              maxReachedStep={maxReachedStep}
              onStepClick={handleStepClick}
              closeDrawer={closeMobileSidebar}
            />
          </div>

          <main className="pb-12">
            {/* {showDemoBanner && (
              <AlertBanner variant="amber">
                <span className="font-semibold">Demo mode:</span> you can try up
                to 2 real AI requests. Full access is available only to the
                admin.
              </AlertBanner>
            )} */}
            {/* Upload panel — always mounted to preserve local file/JD state.
            Visibility toggled by CSS so the form never remounts on tab switch. */}
            <StepPanel hidden={activeStep !== "upload"}>
              {demoLimitReached ? (
                <AlertBanner
                  variant="red"
                  title="Demo limit reached."
                  description="You've used your 2 demo requests. Please try again in 3 days."
                ></AlertBanner>
              ) : (
                <>
                  <SectionHeader
                    level="page"
                    title="Upload documents"
                    description="Upload your CV and a job description to get a global assessment and targeted section rewrites."
                  />
                  <CVUploadForm
                    onSubmit={assess}
                    isLoading={status === "assessing"}
                  />
                  <StatusMessage status={status} error={error} />
                </>
              )}
            </StepPanel>

            {activeStep === "assessment" && assessment && (
              <StepPanel>
                <GlobalAssessmentView
                  assessment={assessment}
                  confirmations={confirmations}
                  onUpdateConfirmation={updateConfirmation}
                />
                <PanelDivider>
                  <Button
                    variant="primary"
                    onClick={() => handleStepClick("options")}
                    className="self-start"
                  >
                    Continue to Options &amp; sections →
                  </Button>
                </PanelDivider>
              </StepPanel>
            )}

            {activeStep === "options" && assessment && (
              <StepPanel>
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
              </StepPanel>
            )}

            {activeStep === "tailored-cv" && rewrites.length > 0 && (
              <StepPanel>
                <SectionRewriteResult
                  rewrites={rewrites}
                  coverLetter={coverLetter}
                  onReset={reset}
                  onUpdateRewrite={updateRewriteText}
                />
              </StepPanel>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
