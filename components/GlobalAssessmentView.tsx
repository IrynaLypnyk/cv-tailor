"use client";

import type { GlobalAssessment, ConfirmationItem } from "@/lib/llm/types";

interface GlobalAssessmentViewProps {
  assessment: GlobalAssessment;
  confirmations: ConfirmationItem[];
  onUpdateConfirmation: (id: string, answer: ConfirmationItem["answer"]) => void;
}

const ANSWER_OPTIONS: { value: NonNullable<ConfirmationItem["answer"]>; label: string }[] = [
  { value: "have_it", label: "I have this experience" },
  { value: "similar", label: "I have similar experience" },
  { value: "dont_have", label: "I do not have this" },
];

function TagList({ items, variant }: { items: string[]; variant: "green" | "amber" | "red" }) {
  const colours = {
    green: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    amber: "bg-amber-50 text-amber-800 border border-amber-200",
    red: "bg-zinc-100 text-zinc-600 border border-zinc-200",
  };

  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className={`rounded-full px-3 py-1 text-xs font-medium ${colours[variant]}`}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-xs text-zinc-500">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

export function GlobalAssessmentView({
  assessment,
  confirmations,
  onUpdateConfirmation,
}: GlobalAssessmentViewProps) {
  return (
    <div data-component="GlobalAssessmentView" className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-foreground">
          Global CV assessment
        </h2>
        <p className="text-sm text-zinc-500">
          Here is how your CV matches this role. Answer any uncertain items below before generating rewrites.
        </p>
      </div>

      {/* Strong matches */}
      {assessment.strongMatches.length > 0 && (
        <Section
          title="Already supported"
          description="These requirements are clearly demonstrated in your CV."
        >
          <TagList items={assessment.strongMatches} variant="green" />
        </Section>
      )}

      {/* Under-emphasised */}
      {assessment.underEmphasized.length > 0 && (
        <Section
          title="Should be emphasised"
          description="These are present in your CV but should be made more prominent for this role."
        >
          <TagList items={assessment.underEmphasized} variant="amber" />
        </Section>
      )}

      {/* Needs confirmation */}
      {confirmations.length > 0 && (
        <Section
          title="Needs your input"
          description="These requirements are unclear or only partially supported. Select the option that best describes your experience for each."
        >
          <ul className="flex flex-col gap-4">
            {confirmations.map((item) => (
              <li
                key={item.id}
                className="rounded-md border border-zinc-200 bg-background px-4 py-4 flex flex-col gap-3"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">
                    {item.skill}
                  </span>
                  {item.context && (
                    <span className="text-xs text-zinc-500">{item.context}</span>
                  )}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
                  {ANSWER_OPTIONS.map(({ value, label }) => (
                    <label
                      key={value}
                      className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
                    >
                      <input
                        type="radio"
                        name={`confirmation-${item.id}`}
                        value={value}
                        checked={item.answer === value}
                        onChange={() => onUpdateConfirmation(item.id, value)}
                        className="h-4 w-4 accent-foreground"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Non-actionable gaps */}
      {assessment.nonActionableGaps.length > 0 && (
        <Section
          title="Non-actionable gaps"
          description="These are real gaps that cannot be addressed by rewriting your CV."
        >
          <TagList items={assessment.nonActionableGaps} variant="red" />
        </Section>
      )}
    </div>
  );
}
