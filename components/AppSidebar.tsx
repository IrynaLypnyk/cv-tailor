"use client";

import { useState } from "react";
import type { TailorStatus } from "@/hooks/useTailorCV";
import { StepNav, type StepId } from "./StepNav";

interface AppSidebarProps {
  status: TailorStatus;
  onStepClick: (step: StepId) => void;
}

export function AppSidebar({ status, onStepClick }: AppSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = <StepNav status={status} onStepClick={onStepClick} />;

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
