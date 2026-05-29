"use client";

import type { CVSection, CoverLetterContext } from "@/lib/llm/types";
import { Button } from "./Button";
import { TextInput } from "./TextInput";
import { Textarea } from "./Textarea";

interface ConfirmAndGenerateFormProps {
  sections: CVSection[];
  selectedSectionIds: string[];
  onToggleSection: (id: string) => void;
  additionalContext: string;
  onAdditionalContextChange: (text: string) => void;
  generateCoverLetter: boolean;
  onGenerateCoverLetterChange: (value: boolean) => void;
  coverLetterContext: CoverLetterContext;
  onCoverLetterContextChange: (patch: Partial<CoverLetterContext>) => void;
  hasUnansweredConfirmations: boolean;
  onGenerate: () => void;
  isLoading: boolean;
}

export function ConfirmAndGenerateForm({
  sections,
  selectedSectionIds,
  onToggleSection,
  additionalContext,
  onAdditionalContextChange,
  generateCoverLetter,
  onGenerateCoverLetterChange,
  coverLetterContext,
  onCoverLetterContextChange,
  hasUnansweredConfirmations,
  onGenerate,
  isLoading,
}: ConfirmAndGenerateFormProps) {
  const selectedCount = selectedSectionIds.length;
  const isDisabled =
    selectedCount === 0 || hasUnansweredConfirmations || isLoading;

  let buttonLabel = isLoading
    ? "Generating…"
    : `Generate rewrites for ${selectedCount} section${selectedCount !== 1 ? "s" : ""}`;

  if (!isLoading && hasUnansweredConfirmations) {
    buttonLabel = "Answer all uncertain items above to continue";
  } else if (!isLoading && selectedCount === 0) {
    buttonLabel = "Select at least one section to continue";
  }

  return (
    <div data-component="ConfirmAndGenerateForm" className="flex flex-col gap-8">
      {/* Section selection */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-sm font-semibold text-foreground">
            Sections to rewrite
          </h3>
          <p className="text-xs text-zinc-500">
            The most relevant sections are pre-selected. Adjust as needed.
          </p>
        </div>
        <ul className="flex flex-col gap-2">
          {sections.map((section) => {
            const isSelected = selectedSectionIds.includes(section.id);
            return (
              <li key={section.id}>
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-md border px-4 py-3 transition-colors ${
                    isSelected
                      ? "border-zinc-400 bg-zinc-50"
                      : "border-zinc-200 bg-background"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={isLoading}
                    onChange={() => onToggleSection(section.id)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-foreground disabled:cursor-not-allowed"
                  />
                  <span className="text-sm font-medium text-foreground">
                    {section.title}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Additional context */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="additional-context"
          className="text-sm font-semibold text-foreground"
        >
          Additional CV context{" "}
          <span className="font-normal text-zinc-500">(optional)</span>
        </label>
        <p className="text-xs text-zinc-500">
          Add any truthful experience or details not visible in your uploaded CV. The AI will use this carefully and will not exaggerate beyond what you write.
        </p>
        <Textarea
          id="additional-context"
          rows={4}
          placeholder='e.g. "I have used Zustand in a personal project." or "I have basic Playwright testing experience."'
          value={additionalContext}
          disabled={isLoading}
          onChange={(e) => onAdditionalContextChange(e.target.value)}
        />
      </div>

      {/* Cover letter */}
      <div className="flex flex-col gap-4">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={generateCoverLetter}
            disabled={isLoading}
            onChange={(e) => onGenerateCoverLetterChange(e.target.checked)}
            className="h-4 w-4 accent-foreground disabled:cursor-not-allowed"
          />
          <span className="text-sm font-semibold text-foreground">
            Generate cover letter
          </span>
        </label>

        {generateCoverLetter && (
          <div className="flex flex-col gap-5 rounded-md border border-zinc-200 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Cover letter context
            </p>

            {/* Role title */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cl-role-title" className="text-sm font-medium text-foreground">
                Role title{" "}
                <span className="font-normal text-zinc-500">(optional)</span>
              </label>
              <TextInput
                id="cl-role-title"
                type="text"
                fieldSize="sm"
                placeholder="React Developer"
                value={coverLetterContext.roleTitle ?? ""}
                disabled={isLoading}
                onChange={(e) =>
                  onCoverLetterContextChange({ roleTitle: e.target.value || undefined })
                }
              />
            </div>

            {/* Hiring company name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cl-company-name" className="text-sm font-medium text-foreground">
                Hiring company name{" "}
                <span className="font-normal text-zinc-500">(optional)</span>
              </label>
              <TextInput
                id="cl-company-name"
                type="text"
                fieldSize="sm"
                placeholder="Leave empty if the hiring company is unknown"
                value={coverLetterContext.hiringCompanyName ?? ""}
                disabled={isLoading}
                onChange={(e) =>
                  onCoverLetterContextChange({ hiringCompanyName: e.target.value || undefined })
                }
              />
            </div>

            {/* Recruiter / agency checkbox */}
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={coverLetterContext.visibleCompanyIsRecruiter ?? false}
                disabled={isLoading}
                onChange={(e) =>
                  onCoverLetterContextChange({
                    visibleCompanyIsRecruiter: e.target.checked || undefined,
                  })
                }
                className="mt-0.5 h-4 w-4 shrink-0 accent-foreground disabled:cursor-not-allowed"
              />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">
                  The visible company appears to be a recruiter or agency, not the hiring company
                </span>
                <span className="text-xs text-zinc-500">
                  If selected, the cover letter will not refer to that company as the employer.
                </span>
              </div>
            </label>

            {/* Motivation */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cl-motivation" className="text-sm font-medium text-foreground">
                Why are you interested?{" "}
                <span className="font-normal text-zinc-500">(optional)</span>
              </label>
              <Textarea
                id="cl-motivation"
                rows={3}
                fieldSize="sm"
                placeholder="Example: I'm interested in this role because it combines React, product engineering, and AI-enabled features."
                value={coverLetterContext.motivation ?? ""}
                disabled={isLoading}
                onChange={(e) =>
                  onCoverLetterContextChange({ motivation: e.target.value || undefined })
                }
              />
            </div>

            {/* Location / right to work */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cl-location" className="text-sm font-medium text-foreground">
                Location or right-to-work note{" "}
                <span className="font-normal text-zinc-500">(optional)</span>
              </label>
              <TextInput
                id="cl-location"
                type="text"
                fieldSize="sm"
                placeholder="Example: I am currently based in the UK with full right to work."
                value={coverLetterContext.locationRightToWork ?? ""}
                disabled={isLoading}
                onChange={(e) =>
                  onCoverLetterContextChange({ locationRightToWork: e.target.value || undefined })
                }
              />
            </div>

            {/* Do not mention */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cl-do-not-mention" className="text-sm font-medium text-foreground">
                Do not mention{" "}
                <span className="font-normal text-zinc-500">(optional)</span>
              </label>
              <Textarea
                id="cl-do-not-mention"
                rows={2}
                fieldSize="sm"
                placeholder="Example: Do not mention Azure. Do not mention Huxley as the employer."
                value={coverLetterContext.doNotMention ?? ""}
                disabled={isLoading}
                onChange={(e) =>
                  onCoverLetterContextChange({ doNotMention: e.target.value || undefined })
                }
              />
            </div>

            {/* Additional notes */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cl-additional-notes" className="text-sm font-medium text-foreground">
                Additional cover letter notes{" "}
                <span className="font-normal text-zinc-500">(optional)</span>
              </label>
              <Textarea
                id="cl-additional-notes"
                rows={3}
                fieldSize="sm"
                placeholder='e.g. "Make the tone warm but professional." or "Mention I am looking for a senior IC role, not management."'
                value={coverLetterContext.additionalNotes ?? ""}
                disabled={isLoading}
                onChange={(e) =>
                  onCoverLetterContextChange({ additionalNotes: e.target.value || undefined })
                }
              />
            </div>
          </div>
        )}
      </div>

      {/* Generate button */}
      <Button variant="primary" disabled={isDisabled} onClick={onGenerate} className="self-start">
        {buttonLabel}
      </Button>
    </div>
  );
}
