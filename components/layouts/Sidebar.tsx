import { Button } from "../ui/Button";
import { CloseIcon } from "../icons/CloseIcon";
import { FileIcon } from "../icons/FileIcon";
import { StepNav, type StepId } from "@/components/layouts/StepNav";

interface AppSidebarProps {
  currentStep: StepId;
  maxReachedStep: StepId;
  onStepClick: (step: StepId) => void;
  closeDrawer: () => void;
}

export function Sidebar({
  currentStep,
  maxReachedStep,
  onStepClick,
  closeDrawer,
}: AppSidebarProps) {
  return (
    <div
      data-component="Sidebar"
      className="w-[280px] h-full flex-col border-r border-zinc-100 bg-white flex flex-1 overflow-y-auto"
    >
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <div className="flex gap-2">
          <FileIcon className="w-7 h-7 text-brand-secondary" />
          <h1 className="text-2xl font-bold text-foreground">CV Tailor</h1>
        </div>
        <Button
          variant="icon"
          onClick={closeDrawer}
          className="block md:hidden "
        >
          <CloseIcon />
        </Button>
      </div>
      <StepNav
        currentStep={currentStep}
        maxReachedStep={maxReachedStep}
        onStepClick={onStepClick}
      />
    </div>
  );
}
