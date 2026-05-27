import type { CVSection } from "@/lib/llm/types";

interface SectionBeforeAfterProps {
  section: CVSection;
}

export function SectionBeforeAfter({ section }: SectionBeforeAfterProps) {
  return (
    <div
      data-component="SectionBeforeAfter"
      className="flex flex-col gap-4 rounded-md border border-zinc-200 px-5 py-4"
    >
      <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Before
          </span>
          <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-500">
            {section.originalText}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-700">
            After
          </span>
          <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
            {section.tailoredText}
          </p>
        </div>
      </div>
    </div>
  );
}

interface TailoredSectionsResultProps {
  sections: CVSection[];
  onReset: () => void;
}

export function TailoredSectionsResult({
  sections,
  onReset,
}: TailoredSectionsResultProps) {
  const tailored = sections.filter((s) => s.tailoredText !== undefined);

  return (
    <div data-component="TailoredSectionsResult" className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          Tailored sections
        </h2>
        <button
          onClick={onReset}
          className="text-sm text-zinc-500 underline underline-offset-2 hover:text-foreground"
        >
          Start again
        </button>
      </div>

      {tailored.length === 0 ? (
        <p className="text-sm text-zinc-500">No sections were tailored.</p>
      ) : (
        <ul className="flex flex-col gap-6">
          {tailored.map((section) => (
            <li key={section.id}>
              <SectionBeforeAfter section={section} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
