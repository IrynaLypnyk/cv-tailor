"use client";

import { useState } from "react";
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
// Actionability badge (shown on each suggested edit)
// ---------------------------------------------------------------------------

const ACTIONABILITY_LABELS: Record<SuggestedEdit["actionability"], string> = {
  safe_to_use: "Safe to use",
  verify_first: "Verify first",
  do_not_claim: "Do not claim",
};

const ACTIONABILITY_STYLES: Record<SuggestedEdit["actionability"], string> = {
  safe_to_use: "border-zinc-200 bg-zinc-50 text-zinc-600",
  verify_first: "border-amber-200 bg-amber-50 text-amber-800",
  do_not_claim: "border-red-200 bg-red-50 text-red-700",
};

function ActionabilityBadge({ level }: { level: SuggestedEdit["actionability"] }) {
  return (
    <span className={`shrink-0 rounded border px-1.5 py-0.5 text-xs font-medium ${ACTIONABILITY_STYLES[level]}`}>
      {ACTIONABILITY_LABELS[level]}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Generic labelled sub-section
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
// Pill list — for JD matches, strongly demonstrated
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
// Plain text list — for analysis groups
// ---------------------------------------------------------------------------

function PlainList({
  items,
  className = "text-zinc-600",
}: {
  items: string[];
  className?: string;
}) {
  if (items.length === 0) return null;
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item, i) => (
        <li key={i} className={`text-sm leading-6 ${className}`}>
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
  const [showDetails, setShowDetails] = useState(false);

  const hasDetails =
    insight.keyJDMatches.length > 0 ||
    insight.stronglyDemonstrated.length > 0 ||
    insight.underEmphasized.length > 0 ||
    insight.adjacentEvidence.length > 0 ||
    insight.nonActionableGaps.length > 0 ||
    insight.trulyMissing.length > 0 ||
    insight.suggestedStrategy.length > 0;

  return (
    <div
      data-component="SectionInsightCard"
      className="flex flex-col gap-5 rounded-md border border-zinc-200 px-5 py-5"
    >
      {/* Header: title + relevance */}
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

      {/* Why it matters — always visible */}
      <p className="text-sm leading-6 text-zinc-600">{insight.relevanceReason}</p>

      {/* Actionable improvements — always visible */}
      {insight.actionableImprovements.length > 0 && (
        <InsightSection label="Actionable improvements">
          <PlainList items={insight.actionableImprovements} />
        </InsightSection>
      )}

      {/* Suggested edits — always visible, main practical section */}
      {insight.suggestedEdits.length > 0 && (
        <InsightSection label="Suggested edits">
          <ul className="flex flex-col gap-5">
            {insight.suggestedEdits.map((edit, i) => (
              <li key={i} className="flex flex-col gap-2">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0 text-zinc-400" aria-hidden>
                    &ndash;
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm leading-6 text-foreground">{edit.text}</span>
                    {edit.suggestedReplacement && (
                      <p className="whitespace-pre-wrap rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm leading-6 text-foreground">
                        {edit.suggestedReplacement}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 pl-5">
                  <ActionabilityBadge level={edit.actionability} />
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

      {/* Collapsible detail toggle */}
      {hasDetails && (
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            className="self-start text-xs text-zinc-400 underline underline-offset-2 hover:text-zinc-600"
          >
            {showDetails ? "Hide full analysis" : "Show full analysis"}
          </button>

          {showDetails && (
            <div className="flex flex-col gap-4 border-t border-zinc-100 pt-4">
              {/* Original text */}
              <InsightSection label="Original section">
                <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-500">
                  {insight.originalText}
                </p>
              </InsightSection>

              {/* Suggested strategy */}
              {insight.suggestedStrategy && (
                <InsightSection label="Suggested strategy">
                  <p className="text-sm leading-6 text-zinc-600">{insight.suggestedStrategy}</p>
                </InsightSection>
              )}

              {/* JD keyword matches */}
              {insight.keyJDMatches.length > 0 && (
                <InsightSection label="JD keyword matches">
                  <SignalPillList items={insight.keyJDMatches} />
                </InsightSection>
              )}

              {/* Strongly demonstrated */}
              {insight.stronglyDemonstrated.length > 0 && (
                <InsightSection label="Strongly demonstrated">
                  <SignalPillList items={insight.stronglyDemonstrated} />
                </InsightSection>
              )}

              {/* Present but under-emphasized */}
              {insight.underEmphasized.length > 0 && (
                <InsightSection label="Present but under-emphasized">
                  <PlainList items={insight.underEmphasized} className="text-amber-800" />
                </InsightSection>
              )}

              {/* Adjacent evidence */}
              {insight.adjacentEvidence.length > 0 && (
                <InsightSection label="Adjacent evidence">
                  <PlainList items={insight.adjacentEvidence} className="text-zinc-500" />
                </InsightSection>
              )}

              {/* Non-actionable gaps */}
              {insight.nonActionableGaps.length > 0 && (
                <InsightSection label="Non-actionable gaps">
                  <PlainList items={insight.nonActionableGaps} className="text-zinc-400" />
                </InsightSection>
              )}

              {/* Do not claim */}
              {insight.trulyMissing.length > 0 && (
                <InsightSection label="Do not claim unless true">
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
        </div>
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
