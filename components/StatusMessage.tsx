import type { TailorStatus } from "@/hooks/useTailorCV";
import { AlertBanner } from "./AlertBanner";

interface StatusMessageProps {
  status: TailorStatus;
  error?: string | null;
}

const LOADING_MESSAGES: Partial<Record<TailorStatus, string>> = {
  assessing:
    "Analysing your CV against the job description — this may take a moment...",
  generating: "Generating tailored rewrites — this may take a moment...",
};

export function StatusMessage({ status, error }: StatusMessageProps) {
  const loadingMessage = LOADING_MESSAGES[status];

  return (
    <div data-component="StatusMessage" className="flex flex-col gap-3">
      {loadingMessage && (
        <p className="text-sm text-zinc-500">{loadingMessage}</p>
      )}
      {status === "error" && error && (
        <AlertBanner variant="red">{error}</AlertBanner>
      )}
      <p className="text-xs text-zinc-400">
        Your CV is processed in memory and is never stored on our servers.
      </p>
    </div>
  );
}
