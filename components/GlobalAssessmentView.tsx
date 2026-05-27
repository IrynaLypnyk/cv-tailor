"use client";

import type {
  GlobalAssessment,
  ConfirmationItem,
  ConfirmationStatus,
  EvidenceSource,
} from "@/lib/llm/types";

interface UpdateConfirmationPatch {
  status?: ConfirmationStatus;
  evidenceSource?: EvidenceSource;
  evidenceNote?: string;
}

interface GlobalAssessmentViewProps {
  assessment: GlobalAssessment;
  confirmations: ConfirmationItem[];
  onUpdateConfirmation: (id: string, patch: UpdateConfirmationPatch) => void;
}

const STATUS_OPTIONS: { value: NonNullable<ConfirmationStatus>; label: string }[] = [
  { value: "direct", label: "I have direct experience" },
  { value: "similar", label: "I have related / similar experience" },
  { value: "none", label: "I do not have this" },
];

const EVIDENCE_SOURCE_OPTIONS: { value: EvidenceSource; label: string }[] = [
  { value: "production", label: "Professional / production work" },
  { value: "freelance", label: "Freelance / client project" },
  { value: "personal_project", label: "Personal project / portfolio" },
  { value: "coursework", label: "Coursework / training" },
  { value: "basic_exposure", label: "Basic exposure only" },
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
            {confirmations.map((item) => {
              const showEvidence =
                item.status === "direct" || item.status === "similar";
              return (
                <li
                  key={item.id}
                  className="rounded-md border border-zinc-200 bg-background px-4 py-4 flex flex-col gap-4"
                >
                  {/* Skill + context */}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">
                      {item.skill}
                    </span>
                    {item.context && (
                      <span className="text-xs text-zinc-500">{item.context}</span>
                    )}
                  </div>

                  {/* Main radio choice */}
                  <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
                    {STATUS_OPTIONS.map(({ value, label }) => (
                      <label
                        key={value}
                        className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
                      >
                        <input
                          type="radio"
                          name={`confirmation-${item.id}`}
                          value={value}
                          checked={item.status === value}
                          onChange={() =>
                            onUpdateConfirmation(item.id, { status: value })
                          }
                          className="h-4 w-4 accent-foreground"
                        />
                        {label}
                      </label>
                    ))}
                  </div>

                  {/* Evidence follow-up (only when direct or similar) */}
                  {showEvidence && (
                    <div className="flex flex-col gap-3 border-t border-zinc-100 pt-3">
                      {/* Evidence source select */}
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor={`evidence-source-${item.id}`}
                          className="text-xs font-medium text-zinc-600"
                        >
                          Experience context / source
                        </label>
                        <select
                          id={`evidence-source-${item.id}`}
                          value={item.evidenceSource ?? ""}
                          onChange={(e) =>
                            onUpdateConfirmation(item.id, {
                              evidenceSource: (e.target.value as EvidenceSource) || undefined,
                            })
                          }
                          className="w-full rounded-md border border-zinc-300 bg-background px-3 py-2 text-sm text-foreground focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                        >
                          <option value="">Select source…</option>
                          {EVIDENCE_SOURCE_OPTIONS.map(({ value, label }) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Evidence note textarea */}
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor={`evidence-note-${item.id}`}
                          className="text-xs font-medium text-zinc-600"
                        >
                          Add short evidence/context{" "}
                          <span className="font-normal text-zinc-400">(optional)</span>
                        </label>
                        <textarea
                          id={`evidence-note-${item.id}`}
                          rows={2}
                          placeholder='e.g. "AWS only, through cloud bootcamp. No Azure production experience." or "Used Vite in a portfolio project."'
                          value={item.evidenceNote ?? ""}
                          onChange={(e) =>
                            onUpdateConfirmation(item.id, {
                              evidenceNote: e.target.value || undefined,
                            })
                          }
                          className="w-full rounded-md border border-zinc-300 bg-background px-3 py-2 text-sm text-foreground placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                        />
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
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
