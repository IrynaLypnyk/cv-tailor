"use client";

import type { CVSection } from "@/lib/llm/types";

interface CVSectionListProps {
  sections: CVSection[];
  isLoading: boolean;
  onToggle: (id: string) => void;
  onTailor: () => void;
}

const TYPE_LABELS: Record<CVSection["type"], string> = {
  summary: "Summary",
  skills: "Skills",
  experience: "Experience",
  education: "Education",
  projects: "Projects",
  certifications: "Certifications",
  other: "Other",
};

export function CVSectionList({
  sections,
  isLoading,
  onToggle,
  onTailor,
}: CVSectionListProps) {
  const selectedCount = sections.filter((s) => s.selected).length;

  return (
    <div data-component="CVSectionList" className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-foreground">
          Detected CV sections
        </h2>
        <p className="text-sm text-zinc-500">
          Select the sections you want to tailor for this role.
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {sections.map((section) => (
          <li key={section.id}>
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-md border px-4 py-3 transition-colors ${
                section.selected
                  ? "border-zinc-400 bg-zinc-50"
                  : "border-zinc-200 bg-background"
              }`}
            >
              <input
                type="checkbox"
                checked={section.selected}
                disabled={isLoading}
                onChange={() => onToggle(section.id)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-foreground disabled:cursor-not-allowed"
              />
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {section.title}
                  </span>
                  <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500">
                    {TYPE_LABELS[section.type]}
                  </span>
                </div>
                {section.relevanceReason && (
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    {section.relevanceReason}
                  </p>
                )}
              </div>
            </label>
          </li>
        ))}
      </ul>

      <button
        type="button"
        disabled={selectedCount === 0 || isLoading}
        onClick={onTailor}
        className="self-start rounded-md bg-foreground px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isLoading
          ? "Tailoring..."
          : `Tailor ${selectedCount} selected section${selectedCount !== 1 ? "s" : ""}`}
      </button>
    </div>
  );
}
