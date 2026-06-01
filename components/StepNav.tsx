export type StepId = "upload" | "assessment" | "options" | "tailored-cv";

type StepState = "active" | "completed" | "reached" | "disabled";

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

const STEP_ORDER: StepId[] = ["upload", "assessment", "options", "tailored-cv"];

function deriveStepState(
  stepId: StepId,
  currentStep: StepId,
  maxReachedStep: StepId
): StepState {
  const currentIdx = STEP_ORDER.indexOf(currentStep);
  const maxIdx = STEP_ORDER.indexOf(maxReachedStep);
  const thisIdx = STEP_ORDER.indexOf(stepId);

  if (stepId === currentStep) return "active";
  if (thisIdx < currentIdx) return "completed"; // behind current tab, done
  if (thisIdx <= maxIdx) return "reached";      // ahead of current but accessible
  return "disabled";
}

interface StepNavProps {
  /** The step the user is currently viewing (controls the active highlight). */
  currentStep: StepId;
  /** The furthest step ever reached — never goes backward on tab navigation. */
  maxReachedStep: StepId;
  onStepClick: (step: StepId) => void;
}

export function StepNav({ currentStep, maxReachedStep, onStepClick }: StepNavProps) {
  return (
    <nav aria-label="Progress steps">
      <ol className="flex flex-col gap-1">
        {STEPS.map((step, index) => {
          const state = deriveStepState(step.id, currentStep, maxReachedStep);
          const isActive = state === "active";
          const isCompleted = state === "completed";
          const isReached = state === "reached";
          const isDisabled = state === "disabled";
          const isClickable = !isDisabled;

          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => isClickable && onStepClick(step.id)}
                aria-current={isActive ? "step" : undefined}
                aria-disabled={isDisabled ? "true" : undefined}
                disabled={isDisabled}
                className={[
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                  isActive && "bg-zinc-100 font-semibold text-foreground",
                  isCompleted && "font-medium text-zinc-600 hover:bg-zinc-50 hover:text-foreground",
                  isReached && "font-medium text-zinc-500 hover:bg-zinc-50 hover:text-foreground",
                  isDisabled && "cursor-not-allowed text-zinc-300",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {/* Step indicator */}
                <span
                  aria-hidden="true"
                  className={[
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    isActive && "bg-foreground text-background",
                    isCompleted && "bg-zinc-200 text-zinc-600",
                    isReached && "bg-zinc-100 text-zinc-500",
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
