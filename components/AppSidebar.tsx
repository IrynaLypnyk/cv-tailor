"use client";

import { useState } from "react";
import type { TailorStatus } from "@/hooks/useTailorCV";
import { StepNav, type StepId } from "./StepNav";
import { CollapsibleStep } from "./CollapsibleStep";

interface AppSidebarProps {
  status: TailorStatus;
  onStepClick: (step: StepId) => void;
  /**
   * Content for the "Global CV assessment" collapsible panel.
   * Omit until assessment data is available.
   */
  assessmentPanel?: React.ReactNode;
  /**
   * Content for the "Options & sections" collapsible panel.
   * Omit until sections data is available.
   */
  optionsPanel?: React.ReactNode;
  /**
   * When true, collapsible panels default to closed (results are in the main area).
   * When false, panels default to open (user is actively working through them).
   */
  isDone: boolean;
}

export function AppSidebar({
  status,
  onStepClick,
  assessmentPanel,
  optionsPanel,
  isDone,
}: AppSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const hasPanels = assessmentPanel != null || optionsPanel != null;

  const sidebarContent = (
    <div className="flex flex-col gap-6">
      <StepNav status={status} onStepClick={onStepClick} />

      {hasPanels && (
        <div className="flex flex-col gap-4 border-t border-zinc-100 pt-4">
          {assessmentPanel != null && (
            <CollapsibleStep
              title="Global CV assessment"
              defaultOpen={!isDone}
            >
              {assessmentPanel}
            </CollapsibleStep>
          )}

          {optionsPanel != null && (
            <CollapsibleStep
              title="Options & sections"
              defaultOpen={!isDone}
            >
              {optionsPanel}
            </CollapsibleStep>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div data-component="AppSidebar">
      {/* Mobile toggle — hidden on md+ */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-foreground"
          aria-expanded={mobileOpen}
          aria-controls="sidebar-content"
        >
          <span aria-hidden="true">{mobileOpen ? "▲" : "▼"}</span>
          {mobileOpen ? "Hide steps" : "Show steps"}
        </button>

        {mobileOpen && (
          <div
            id="sidebar-content"
            className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
          >
            {sidebarContent}
          </div>
        )}
      </div>

      {/* Always visible on desktop */}
      <div className="hidden md:block">{sidebarContent}</div>
    </div>
  );
}
