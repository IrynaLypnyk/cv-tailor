"use client";

import { useState } from "react";
import type { SectionRewrite } from "@/lib/llm/types";

// ---------------------------------------------------------------------------
// Copy button with transient "Copied!" confirmation
// ---------------------------------------------------------------------------

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard access denied — silently ignore
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="shrink-0 rounded border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Per-section rewrite card
// ---------------------------------------------------------------------------

function RewriteCard({ rewrite }: { rewrite: SectionRewrite }) {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <div
      data-component="RewriteCard"
      className="flex flex-col gap-5 rounded-md border border-zinc-200 px-5 py-5"
    >
      <h3 className="text-sm font-semibold text-foreground">{rewrite.title}</h3>

      {/* After — primary focus */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            After
          </span>
          <CopyButton text={rewrite.rewrittenText} />
        </div>
        <p className="whitespace-pre-wrap rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm leading-6 text-foreground">
          {rewrite.rewrittenText}
        </p>
      </div>

      {/* Notes */}
      {rewrite.notes && (
        <p className="text-xs leading-5 text-zinc-500">
          <span className="font-semibold">Note: </span>
          {rewrite.notes}
        </p>
      )}

      {/* Collapsible original */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setShowOriginal((v) => !v)}
          className="self-start text-xs text-zinc-400 underline underline-offset-2 hover:text-zinc-600"
        >
          {showOriginal ? "Hide original" : "Show original"}
        </button>
        {showOriginal && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Before
            </span>
            <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-500">
              {rewrite.originalText}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cover letter card
// ---------------------------------------------------------------------------

function CoverLetterCard({ text }: { text: string }) {
  return (
    <div
      data-component="CoverLetterCard"
      className="flex flex-col gap-5 rounded-md border border-zinc-200 px-5 py-5"
    >
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold text-foreground">Cover letter</h3>
        <CopyButton text={text} />
      </div>
      <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
        {text}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page-level result wrapper
// ---------------------------------------------------------------------------

interface SectionRewriteResultProps {
  rewrites: SectionRewrite[];
  coverLetter?: string;
  onReset: () => void;
}

export function SectionRewriteResult({
  rewrites,
  coverLetter,
  onReset,
}: SectionRewriteResultProps) {
  return (
    <div data-component="SectionRewriteResult" className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">
          Tailored CV sections
        </h2>
        <button
          type="button"
          onClick={onReset}
          className="text-sm text-zinc-500 underline underline-offset-2 hover:text-foreground"
        >
          Start again
        </button>
      </div>

      {rewrites.length === 0 ? (
        <p className="text-sm text-zinc-500">No rewrites were generated.</p>
      ) : (
        <ul className="flex flex-col gap-6">
          {rewrites.map((rewrite) => (
            <li key={rewrite.sectionId}>
              <RewriteCard rewrite={rewrite} />
            </li>
          ))}
        </ul>
      )}

      {coverLetter && <CoverLetterCard text={coverLetter} />}
    </div>
  );
}
