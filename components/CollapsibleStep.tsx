"use client";

import { useState } from "react";

interface CollapsibleStepProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function CollapsibleStep({
  title,
  defaultOpen = true,
  children,
}: CollapsibleStepProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="flex flex-col gap-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 border-b border-zinc-200 pb-3 text-left"
      >
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <span className="shrink-0 text-xs text-zinc-400">
          {open ? "Hide" : "Show"}
        </span>
      </button>
      {open && <div className="pt-6">{children}</div>}
    </div>
  );
}
