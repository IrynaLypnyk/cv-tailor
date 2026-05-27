import type { SuggestedEdit, TailoringInsight } from "@/lib/llm/types";

// ---------------------------------------------------------------------------
// Relevance dots
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Evidence level badge
// ---------------------------------------------------------------------------

const EVIDENCE_LABELS: Record<SuggestedEdit["evidenceLevel"], string> = {
  supported: "Supported",
  partially_supported: "Partially supported",
  requires_verification: "Verify with user",
};

const EVIDENCE_STYLES: Record<SuggestedEdit["evidenceLevel"], string> = {
  supported: "border-zinc-200 bg-zinc-50 text-zinc-600",
  partially_supported: "border-amber-200 bg-amber-50 text-amber-800",
  requires_verification: "border-red-200 bg-red-50 text-red-700",
};

function EvidenceBadge({ level }: { level: SuggestedEdit["evidenceLevel"] }) {
  return (
    <span
      className={`shrink-0 rounded border px-1.5 py-0.5 text-xs font-medium ${EVIDENCE_STYLES[level]}`}
    >
      {EVIDENCE_LABELS[level]}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Generic labelled section within the card
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Signal group: a simple pill list (used for the three classification groups)
// ---------------------------------------------------------------------------

function SignalPillList({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-foreground"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// Main insight card
// ---------------------------------------------------------------------------

interface SectionInsightCardProps {
  insight: TailoringInsight;
}

export function SectionInsightCard({ insight }: SectionInsightCardProps) {
  const hasSignals =
    insight.stronglyDemonstrated.length > 0 ||
    insight.underEmphasized.length > 0 ||
    insight.trulyMissing.length > 0;

  return (
    <div
      data-component="SectionInsightCard"
      className="flex flex-col gap-5 rounded-md border border-zinc-200 px-5 py-5"
    >
      {/* Header */}
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

      {/* JD keyword matches */}
      {insight.keyJDMatches.length > 0 && (
        <InsightSection label="JD keyword matches">
          <SignalPillList items={insight.keyJDMatches} />
        </InsightSection>
      )}

      {/* Three signal groups */}
      {hasSignals && (
        <div className="flex flex-col gap-4">
          {insight.stronglyDemonstrated.length > 0 && (
            <InsightSection label="Strongly demonstrated">
              <SignalPillList items={insight.stronglyDemonstrated} />
            </InsightSection>
          )}

          {insight.underEmphasized.length > 0 && (
            <InsightSection label="Present but under-emphasized">
              <ul className="flex flex-col gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
                {insight.underEmphasized.map((item, i) => (
                  <li key={i} className="text-sm leading-6 text-amber-900">
                    {item}
                  </li>
                ))}
              </ul>
            </InsightSection>
          )}

          {insight.trulyMissing.length > 0 && (
            <InsightSection label="Truly missing">
              <ul className="flex flex-col gap-1.5 rounded-md border border-red-200 bg-red-50 px-4 py-3">
                {insight.trulyMissing.map((item, i) => (
                  <li key={i} className="text-sm leading-6 text-red-800">
                    {item}
                  </li>
                ))}
              </ul>
            </InsightSection>
          )}
        </div>
      )}

      {/* Suggested edits */}
      {insight.suggestedEdits.length > 0 && (
        <InsightSection label="Suggested edits">
          <ul className="flex flex-col gap-4">
            {insight.suggestedEdits.map((edit, i) => (
              <li key={i} className="flex flex-col gap-1.5">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0 text-zinc-400" aria-hidden>
                    &ndash;
                  </span>
                  <span className="text-sm leading-6 text-foreground">{edit.text}</span>
                </div>
                <div className="flex items-start gap-2 pl-5">
                  <EvidenceBadge level={edit.evidenceLevel} />
                  <span className="text-xs leading-5 text-zinc-500">{edit.reason}</span>
                </div>
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

// ---------------------------------------------------------------------------
// Page-level result wrapper
// ---------------------------------------------------------------------------

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
