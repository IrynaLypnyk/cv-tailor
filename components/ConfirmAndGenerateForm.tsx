"use client";

import type { CVSection } from "@/lib/llm/types";

interface ConfirmAndGenerateFormProps {
  sections: CVSection[];
  selectedSectionIds: string[];
  onToggleSection: (id: string) => void;
  additionalContext: string;
  onAdditionalContextChange: (text: string) => void;
  generateCoverLetter: boolean;
  onGenerateCoverLetterChange: (value: boolean) => void;
  coverLetterNotes: string;
  onCoverLetterNotesChange: (text: string) => void;
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
  coverLetterNotes,
  onCoverLetterNotesChange,
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
        <textarea
          id="additional-context"
          rows={4}
          placeholder='e.g. "I have used Zustand in a personal project." or "I have basic Playwright testing experience."'
          value={additionalContext}
          disabled={isLoading}
          onChange={(e) => onAdditionalContextChange(e.target.value)}
          className="w-full rounded-md border border-zinc-300 bg-background px-4 py-3 text-sm text-foreground placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {/* Cover letter */}
      <div className="flex flex-col gap-3">
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
          <div className="flex flex-col gap-2 pl-7">
            <label
              htmlFor="cover-letter-notes"
              className="text-sm font-medium text-foreground"
            >
              Cover letter notes / company context{" "}
              <span className="font-normal text-zinc-500">(optional)</span>
            </label>
            <p className="text-xs text-zinc-500">
              Add anything you want reflected in the cover letter: company name, why you are interested, tone, location/right-to-work details, or specific motivation.
            </p>
            <textarea
              id="cover-letter-notes"
              rows={4}
              placeholder='e.g. "I am applying to Acme because I care about healthcare tech." or "Mention I am based in the UK with right to work."'
              value={coverLetterNotes}
              disabled={isLoading}
              onChange={(e) => onCoverLetterNotesChange(e.target.value)}
              className="w-full rounded-md border border-zinc-300 bg-background px-4 py-3 text-sm text-foreground placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        )}
      </div>

      {/* Generate button */}
      <button
        type="button"
        disabled={isDisabled}
        onClick={onGenerate}
        className="self-start rounded-md bg-foreground px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {buttonLabel}
      </button>
    </div>
  );
}
