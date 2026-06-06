"use client";

import type { CVSection, CoverLetterContext } from "@/lib/llm/types";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { CoverLetterContextFields } from "@/components/layouts/CoverLetterContextFields";
import { Subsection } from "../ui/SectionHeader";
import { Textarea } from "../ui/Textarea";

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
    <div
      data-component="ConfirmAndGenerateForm"
      className="flex flex-col gap-8"
    >
      <Subsection
        title="Sections to rewrite"
        description="The most relevant sections are pre-selected. Adjust as needed."
      >
        <ul className="flex flex-col gap-2">
          {sections.map((section) => {
            const isSelected = selectedSectionIds.includes(section.id);
            return (
              <li key={section.id}>
                <Card
                  as="label"
                  padding="sm"
                  selected={isSelected}
                  className="flex cursor-pointer items-start gap-3 transition-colors"
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
                </Card>
              </li>
            );
          })}
        </ul>
      </Subsection>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="additional-context"
          className="text-sm font-semibold text-foreground"
        >
          Additional CV context{" "}
          <span className="font-normal text-muted">(optional)</span>
        </label>
        <p className="text-xs text-muted">
          Add any truthful experience or details not visible in your uploaded
          CV. The AI will use this carefully and will not exaggerate beyond what
          you write.
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
          <CoverLetterContextFields
            context={coverLetterContext}
            onChange={onCoverLetterContextChange}
            disabled={isLoading}
          />
        )}
      </div>

      <Button
        variant="primary"
        disabled={isDisabled}
        onClick={onGenerate}
        className="self-start"
      >
        {buttonLabel}
      </Button>
    </div>
  );
}
