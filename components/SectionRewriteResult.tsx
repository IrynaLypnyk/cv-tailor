"use client";

import { useState } from "react";
import type { SectionRewrite } from "@/lib/llm/types";
import { Button } from "./Button";
import { Card } from "./Card";
import { SectionHeader } from "./SectionHeader";

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
    <Button variant="secondary" onClick={handleCopy} className="shrink-0">
      {copied ? "Copied!" : "Copy"}
    </Button>
  );
}

function RewriteCard({ rewrite }: { rewrite: SectionRewrite }) {
  return (
    <Card
      padding="md"
      className="flex flex-col gap-5"
      data-component="RewriteCard"
    >
      <h3 className="text-sm font-semibold text-foreground">{rewrite.title}</h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-subtle">
            Before
          </span>
          <p className="h-full whitespace-pre-wrap rounded-md border border-border bg-background px-4 py-3 text-sm leading-6 text-muted">
            {rewrite.originalText}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-subtle">
            After
          </span>
          <p className="h-full whitespace-pre-wrap rounded-md border border-border bg-surface-muted px-4 py-3 text-sm leading-6 text-foreground">
            {rewrite.rewrittenText}
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <CopyButton text={rewrite.rewrittenText} />
      </div>

      {rewrite.notes && (
        <p className="text-sm leading-5 text-muted">
          <span className="font-semibold">Note: </span>
          {rewrite.notes}
        </p>
      )}
    </Card>
  );
}

function CoverLetterCard({ text }: { text: string }) {
  return (
    <Card
      padding="md"
      className="flex flex-col gap-5"
      data-component="CoverLetterCard"
    >
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold text-foreground">Cover letter</h3>
        <CopyButton text={text} />
      </div>
      <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
        {text}
      </p>
    </Card>
  );
}

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
      <SectionHeader
        level="page"
        title="Tailored CV sections"
        actions={
          <Button variant="ghost" onClick={onReset}>
            Start again
          </Button>
        }
      />

      {rewrites.length === 0 ? (
        <p className="text-sm text-muted">No rewrites were generated.</p>
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
