import type { TailorStatus } from "@/hooks/useTailorCV";

interface StatusMessageProps {
  status: TailorStatus;
  error?: string | null;
}

export function StatusMessage({ status, error }: StatusMessageProps) {
  return (
    <div data-component="StatusMessage" className="flex flex-col gap-3">
      {status === "loading" && (
        <p className="text-sm text-zinc-500">
          Processing your CV — this may take a moment...
        </p>
      )}
      {status === "error" && error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <p className="text-xs text-zinc-400">
        Your CV is processed in memory and is never stored on our servers.
      </p>
    </div>
  );
}
