import type { TailoringInsight } from "@/lib/llm/types";

interface SectionInsightCardProps {
  insight: TailoringInsight;
}

function RelevanceDots({ score }: { score: TailoringInsight["relevanceScore"] }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`Relevance ${score} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`inline-block h-2 w-2 rounded-full ${
            i < score ? "bg-foreground" : "bg-zinc-200"
          }`}
        />
      ))}
    </span>
  );
}

export function SectionInsightCard({ insight }: SectionInsightCardProps) {
  return (
    <div
      data-component="SectionInsightCard"
      className="flex flex-col gap-5 rounded-md border border-zinc-200 px-5 py-5"
    >
      {/* Header: title + relevance score */}
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-sm font-semibold text-foreground">{insight.title}</h3>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs text-zinc-500">Relevance</span>
          <RelevanceDots score={insight.relevanceScore} />
          <span className="text-xs font-medium text-foreground">
            {insight.relevanceScore}/5
          </span>
        </div>
      </div>

      {/* Original text */}
      <InsightSection label="Original">
        <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-500">
          {insight.originalText}
        </p>
      </InsightSection>

      {/* Why it matters + strategy */}
      <div className="grid gap-4 sm:grid-cols-2">
        <InsightSection label="Why it matters">
          <p className="text-sm leading-6 text-foreground">{insight.relevanceReason}</p>
        </InsightSection>
        <InsightSection label="Suggested strategy">
          <p className="text-sm leading-6 text-foreground">{insight.suggestedStrategy}</p>
        </InsightSection>
      </div>

      {/* JD matches */}
      {insight.keyJDMatches.length > 0 && (
        <InsightSection label="JD keyword matches">
          <ul className="flex flex-wrap gap-2">
            {insight.keyJDMatches.map((match) => (
              <li
                key={match}
                className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-foreground"
              >
                {match}
              </li>
            ))}
          </ul>
        </InsightSection>
      )}

      {/* Missing / weak signals */}
      {insight.missingOrWeakSignals.length > 0 && (
        <InsightSection label="Weak or missing signals">
          <ul className="flex flex-col gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
            {insight.missingOrWeakSignals.map((signal, i) => (
              <li key={i} className="text-sm leading-6 text-amber-900">
                {signal}
              </li>
            ))}
          </ul>
        </InsightSection>
      )}

      {/* Suggested rewrites */}
      {insight.suggestedRewrites.length > 0 && (
        <InsightSection label="Suggested rewrites">
          <ul className="flex flex-col gap-3">
            {insight.suggestedRewrites.map((rewrite, i) => (
              <li key={i} className="flex gap-3 text-sm leading-6 text-foreground">
                <span className="mt-0.5 shrink-0 text-zinc-400" aria-hidden>
                  &ndash;
                </span>
                <span>{rewrite}</span>
              </li>
            ))}
          </ul>
        </InsightSection>
      )}

      {/* Final suggested version */}
      {insight.finalSuggestedText && (
        <InsightSection label="Final suggested version">
          <p className="whitespace-pre-wrap rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm leading-6 text-foreground">
            {insight.finalSuggestedText}
          </p>
        </InsightSection>
      )}
    </div>
  );
}

function InsightSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
        {label}
      </span>
      {children}
    </div>
  );
}

interface TailoredSectionsResultProps {
  insights: TailoringInsight[];
  onReset: () => void;
}

export function TailoredSectionsResult({
  insights,
  onReset,
}: TailoredSectionsResultProps) {
  return (
    <div data-component="TailoredSectionsResult" className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          CV editing suggestions
        </h2>
        <button
          onClick={onReset}
          className="text-sm text-zinc-500 underline underline-offset-2 hover:text-foreground"
        >
          Start again
        </button>
      </div>

      {insights.length === 0 ? (
        <p className="text-sm text-zinc-500">No sections were tailored.</p>
      ) : (
        <ul className="flex flex-col gap-6">
          {insights.map((insight) => (
            <li key={insight.sectionId}>
              <SectionInsightCard insight={insight} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
