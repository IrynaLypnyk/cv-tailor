import type { TailoredCV } from "@/lib/llm/types";

interface TailoredCVResultProps {
  result: TailoredCV;
  onReset: () => void;
}

export function TailoredCVResult({ result, onReset }: TailoredCVResultProps) {
  return (
    <div data-component="TailoredCVResult" className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Tailored CV</h2>
        <button
          onClick={onReset}
          className="text-sm text-zinc-500 underline underline-offset-2 hover:text-foreground"
        >
          Start again
        </button>
      </div>

      <ResultSection title="Professional Summary">
        <p className="text-sm leading-7 text-foreground">
          {result.professionalSummary}
        </p>
      </ResultSection>

      <ResultSection title="Key Skills">
        <ul className="flex flex-wrap gap-2">
          {result.keySkills.map((skill) => (
            <li
              key={skill}
              className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-foreground"
            >
              {skill}
            </li>
          ))}
        </ul>
      </ResultSection>

      <ResultSection title="Tailored Experience Bullets">
        <ul className="flex flex-col gap-3">
          {result.tailoredExperienceBullets.map((bullet, i) => (
            <li key={i} className="flex gap-3 text-sm leading-6 text-foreground">
              <span className="mt-0.5 shrink-0 text-zinc-400" aria-hidden>
                {"\u2013"}
              </span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </ResultSection>

      <ResultSection title="ATS Keywords">
        <ul className="flex flex-wrap gap-2">
          {result.atsKeywords.map((keyword) => (
            <li
              key={keyword}
              className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700"
            >
              {keyword}
            </li>
          ))}
        </ul>
      </ResultSection>

      {result.notes.length > 0 && (
        <ResultSection title="Notes & Gaps">
          <ul className="flex flex-col gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
            {result.notes.map((note, i) => (
              <li key={i} className="text-sm leading-6 text-amber-900">
                {note}
              </li>
            ))}
          </ul>
        </ResultSection>
      )}
    </div>
  );
}

function ResultSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3
        className="text-xs font-semibold uppercase tracking-widest text-zinc-500"
      >
        {title}
      </h3>
      {children}
    </section>
  );
}
