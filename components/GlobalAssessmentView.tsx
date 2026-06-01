"use client";

import type {
  GlobalAssessment,
  ConfirmationItem,
  ConfirmationStatus,
  EvidenceSource,
} from "@/lib/llm/types";
import { Card } from "./Card";
import { Select } from "./Select";
import { SectionHeader, Subsection } from "./SectionHeader";
import { TagList } from "./Tag";
import { Textarea } from "./Textarea";

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

const STATUS_OPTIONS: {
  value: NonNullable<ConfirmationStatus>;
  label: string;
}[] = [
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

export function GlobalAssessmentView({
  assessment,
  confirmations,
  onUpdateConfirmation,
}: GlobalAssessmentViewProps) {
  return (
    <div data-component="GlobalAssessmentView" className="flex flex-col gap-8">
      <SectionHeader
        level="page"
        title="Global CV assessment"
        description="Here is how your CV matches this role. Answer any uncertain items below before generating rewrites."
      />

      {assessment.strongMatches.length > 0 && (
        <Subsection
          title="Already supported"
          description="These requirements are clearly demonstrated in your CV."
        >
          <TagList items={assessment.strongMatches} variant="green" />
        </Subsection>
      )}

      {assessment.underEmphasized.length > 0 && (
        <Subsection
          title="Should be emphasised"
          description="These are present in your CV but should be made more prominent for this role."
        >
          <TagList items={assessment.underEmphasized} variant="amber" />
        </Subsection>
      )}

      {assessment.nonActionableGaps.length > 0 && (
        <Subsection
          title="Non-actionable gaps"
          description="These are real gaps that cannot be addressed by rewriting your CV."
        >
          <TagList items={assessment.nonActionableGaps} variant="red" />
        </Subsection>
      )}

      {confirmations.length > 0 && (
        <Subsection
          title="Needs your input"
          description="These requirements are unclear or only partially supported. Select the option that best describes your experience for each."
        >
          <ul className="flex flex-col gap-4">
            {confirmations.map((item) => {
              const showEvidence =
                item.status === "direct" || item.status === "similar";
              return (
                <li key={item.id}>
                  <Card padding="sm" className="flex flex-col gap-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-foreground">
                        {item.skill}
                      </span>
                      {item.context && (
                        <span className="text-xs text-muted">
                          {item.context}
                        </span>
                      )}
                    </div>

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

                    {showEvidence && (
                      <div className="flex flex-col gap-3 border-t border-border-subtle pt-3">
                        <div className="flex flex-col gap-1.5">
                          <label
                            htmlFor={`evidence-source-${item.id}`}
                            className="text-xs font-medium text-muted-foreground"
                          >
                            Experience context / source
                          </label>
                          <Select
                            id={`evidence-source-${item.id}`}
                            fieldSize="sm"
                            value={item.evidenceSource ?? ""}
                            onChange={(e) =>
                              onUpdateConfirmation(item.id, {
                                evidenceSource:
                                  (e.target.value as EvidenceSource) ||
                                  undefined,
                              })
                            }
                          >
                            <option value="">Select source…</option>
                            {EVIDENCE_SOURCE_OPTIONS.map(({ value, label }) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </Select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label
                            htmlFor={`evidence-note-${item.id}`}
                            className="text-xs font-medium text-muted-foreground"
                          >
                            Add short evidence/context{" "}
                            <span className="font-normal text-muted-subtle">
                              (optional)
                            </span>
                          </label>
                          <Textarea
                            id={`evidence-note-${item.id}`}
                            rows={2}
                            fieldSize="sm"
                            placeholder='e.g. "AWS only, through cloud bootcamp. No Azure production experience." or "Used Vite in a portfolio project."'
                            value={item.evidenceNote ?? ""}
                            onChange={(e) =>
                              onUpdateConfirmation(item.id, {
                                evidenceNote: e.target.value || undefined,
                              })
                            }
                          />
                        </div>
                      </div>
                    )}
                  </Card>
                </li>
              );
            })}
          </ul>
        </Subsection>
      )}
    </div>
  );
}
