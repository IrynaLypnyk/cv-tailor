import { StepNav, type StepId } from "./StepNav";

interface AppSidebarProps {
  currentStep: StepId;
  maxReachedStep: StepId;
  onStepClick: (step: StepId) => void;
}

export function AppSidebar({
  currentStep,
  maxReachedStep,
  onStepClick,
}: AppSidebarProps) {
  return (
    <div data-component="AppSidebar">
      <StepNav
        currentStep={currentStep}
        maxReachedStep={maxReachedStep}
        onStepClick={onStepClick}
      />
    </div>
  );
}
