"use client";

import type { CoverLetterContext } from "@/lib/llm/types";
import { Card } from "./Card";
import { FormField } from "./FormField";
import { TextInput } from "./TextInput";
import { Textarea } from "./Textarea";

interface CoverLetterContextFieldsProps {
  context: CoverLetterContext;
  onChange: (patch: Partial<CoverLetterContext>) => void;
  disabled?: boolean;
}

export function CoverLetterContextFields({
  context,
  onChange,
  disabled,
}: CoverLetterContextFieldsProps) {
  return (
    <Card
      padding="sm"
      className="flex flex-col gap-5"
      data-component="CoverLetterContextFields"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-subtle">
        Cover letter context
      </p>

      <FormField htmlFor="cl-role-title" label="Role title" hint="(optional)">
        <TextInput
          id="cl-role-title"
          type="text"
          fieldSize="sm"
          placeholder="React Developer"
          value={context.roleTitle ?? ""}
          disabled={disabled}
          onChange={(e) => onChange({ roleTitle: e.target.value || undefined })}
        />
      </FormField>

      <FormField
        htmlFor="cl-company-name"
        label="Hiring company name"
        hint="(optional)"
      >
        <TextInput
          id="cl-company-name"
          type="text"
          fieldSize="sm"
          placeholder="Leave empty if the hiring company is unknown"
          value={context.hiringCompanyName ?? ""}
          disabled={disabled}
          onChange={(e) =>
            onChange({ hiringCompanyName: e.target.value || undefined })
          }
        />
      </FormField>

      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={context.visibleCompanyIsRecruiter ?? false}
          disabled={disabled}
          onChange={(e) =>
            onChange({
              visibleCompanyIsRecruiter: e.target.checked || undefined,
            })
          }
          className="mt-0.5 h-4 w-4 shrink-0 accent-foreground disabled:cursor-not-allowed"
        />
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">
            The visible company appears to be a recruiter or agency, not the
            hiring company
          </span>
          <span className="text-xs text-muted">
            If selected, the cover letter will not refer to that company as the
            employer.
          </span>
        </div>
      </label>

      <FormField
        htmlFor="cl-motivation"
        label="Why are you interested?"
        hint="(optional)"
      >
        <Textarea
          id="cl-motivation"
          rows={3}
          fieldSize="sm"
          placeholder="Example: I'm interested in this role because it combines React, product engineering, and AI-enabled features."
          value={context.motivation ?? ""}
          disabled={disabled}
          onChange={(e) =>
            onChange({ motivation: e.target.value || undefined })
          }
        />
      </FormField>

      <FormField
        htmlFor="cl-location"
        label="Location or right-to-work note"
        hint="(optional)"
      >
        <TextInput
          id="cl-location"
          type="text"
          fieldSize="sm"
          placeholder="Example: I am currently based in the UK with full right to work."
          value={context.locationRightToWork ?? ""}
          disabled={disabled}
          onChange={(e) =>
            onChange({ locationRightToWork: e.target.value || undefined })
          }
        />
      </FormField>

      <FormField
        htmlFor="cl-do-not-mention"
        label="Do not mention"
        hint="(optional)"
      >
        <Textarea
          id="cl-do-not-mention"
          rows={2}
          fieldSize="sm"
          placeholder="Example: Do not mention Azure. Do not mention Huxley as the employer."
          value={context.doNotMention ?? ""}
          disabled={disabled}
          onChange={(e) =>
            onChange({ doNotMention: e.target.value || undefined })
          }
        />
      </FormField>

      <FormField
        htmlFor="cl-additional-notes"
        label="Additional cover letter notes"
        hint="(optional)"
      >
        <Textarea
          id="cl-additional-notes"
          rows={3}
          fieldSize="sm"
          placeholder='e.g. "Make the tone warm but professional." or "Mention I am looking for a senior IC role, not management."'
          value={context.additionalNotes ?? ""}
          disabled={disabled}
          onChange={(e) =>
            onChange({ additionalNotes: e.target.value || undefined })
          }
        />
      </FormField>
    </Card>
  );
}
