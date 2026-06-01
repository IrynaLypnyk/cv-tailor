import type { TailorStatus } from "@/hooks/useTailorCV";

export type StepId = "upload" | "assessment" | "options" | "tailored-cv";

type StepState = "active" | "completed" | "disabled";

interface StepDefinition {
  id: StepId;
  label: string;
}

const STEPS: StepDefinition[] = [
  { id: "upload", label: "Upload" },
  { id: "assessment", label: "Global CV assessment" },
  { id: "options", label: "Options & sections" },
  { id: "tailored-cv", label: "Tailored CV" },
];

function deriveStepState(stepId: StepId, status: TailorStatus): StepState {
  switch (status) {
    case "idle":
    case "assessing":
    case "error":
      return stepId === "upload" ? "active" : "disabled";

    case "confirming":
      if (stepId === "upload") return "completed";
      if (stepId === "assessment") return "active";
      return "disabled";

    case "generating":
      if (stepId === "upload" || stepId === "assessment") return "completed";
      if (stepId === "options") return "active";
      return "disabled";

    case "done":
      if (stepId === "tailored-cv") return "active";
      return "completed";
  }
}

interface StepNavProps {
  status: TailorStatus;
  onStepClick: (step: StepId) => void;
}

export function StepNav({ status, onStepClick }: StepNavProps) {
  return (
    <nav aria-label="Progress steps">
      <ol className="flex flex-col gap-1">
        {STEPS.map((step, index) => {
          const state = deriveStepState(step.id, status);
          const isActive = state === "active";
          const isCompleted = state === "completed";
          const isDisabled = state === "disabled";

          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => !isDisabled && onStepClick(step.id)}
                aria-current={isActive ? "step" : undefined}
                aria-disabled={isDisabled ? "true" : undefined}
                disabled={isDisabled}
                className={[
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                  isActive &&
                    "bg-zinc-100 font-semibold text-foreground",
                  isCompleted &&
                    "font-medium text-zinc-600 hover:bg-zinc-50 hover:text-foreground",
                  isDisabled &&
                    "cursor-not-allowed text-zinc-300",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {/* Step number indicator */}
                <span
                  aria-hidden="true"
                  className={[
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    isActive && "bg-foreground text-background",
                    isCompleted && "bg-zinc-200 text-zinc-600",
                    isDisabled && "bg-zinc-100 text-zinc-300",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {isCompleted ? "✓" : index + 1}
                </span>

                <span className="leading-tight">{step.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
