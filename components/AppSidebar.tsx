import type { TailorStatus } from "@/hooks/useTailorCV";
import { StepNav, type StepId } from "./StepNav";

interface AppSidebarProps {
  status: TailorStatus;
  onStepClick: (step: StepId) => void;
}

export function AppSidebar({ status, onStepClick }: AppSidebarProps) {
  return (
    <div data-component="AppSidebar">
      <StepNav status={status} onStepClick={onStepClick} />
    </div>
  );
}
