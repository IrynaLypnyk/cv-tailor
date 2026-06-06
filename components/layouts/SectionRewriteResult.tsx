"use client";

import { useState } from "react";
import type { SectionRewrite } from "@/lib/llm/types";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { SectionHeader } from "../ui/SectionHeader";
import { Textarea } from "../ui/Textarea";
import { CopyIcon } from "../icons/CopyIcon";
import { CheckIcon } from "../icons/CheckIcon";

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
      <CopyIcon className="w-4 h-4" /> {copied ? "Copied!" : "Copy text"}
    </Button>
  );
}

function RewriteCard({
  rewrite,
  onUpdateRewrite,
}: {
  rewrite: SectionRewrite;
  onUpdateRewrite: (sectionId: string, text: string) => void;
}) {
  return (
    <Card
      padding="md"
      className="flex flex-col gap-5"
      data-component="RewriteCard"
    >
      <h3 className="text-sm font-semibold text-foreground">{rewrite.title}</h3>
      {rewrite.notes && (
        <p className="leading-5 flex items-center gap-2">
          <span className="font-semibold text-brand-secondary">
            <CheckIcon className="w-5 h-5" />
          </span>
          {rewrite.notes}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <span className="font-semibold uppercase tracking-widest">
            Before
          </span>
          <p className="h-full whitespace-pre-wrap rounded-md border border-border px-4 py-3 text-sm leading-6 text-muted">
            {rewrite.originalText}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-semibold uppercase tracking-widest">After</span>

          <Textarea
            className="h-full whitespace-pre-wrap rounded-md border border-border bg-surface-muted px-4 py-3 text-sm leading-6 text-foreground"
            value={rewrite.rewrittenText}
            onChange={(e) => onUpdateRewrite(rewrite.sectionId, e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <CopyButton text={rewrite.rewrittenText} />
      </div>
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
  onUpdateRewrite: (sectionId: string, text: string) => void;
  coverLetter?: string;
  onReset: () => void;
}

export function SectionRewriteResult({
  rewrites,
  onUpdateRewrite,
  coverLetter,
  onReset,
}: SectionRewriteResultProps) {
  return (
    <div data-component="SectionRewriteResult" className="flex flex-col gap-8">
      <SectionHeader level="page" title="Tailored CV sections" />

      {rewrites.length === 0 ? (
        <p className="text-sm text-muted">No rewrites were generated.</p>
      ) : (
        <ul className="flex flex-col gap-6">
          {rewrites.map((rewrite) => (
            <li key={rewrite.sectionId}>
              <RewriteCard
                rewrite={rewrite}
                onUpdateRewrite={onUpdateRewrite}
              />
            </li>
          ))}
        </ul>
      )}

      {coverLetter && <CoverLetterCard text={coverLetter} />}
    </div>
  );
}
