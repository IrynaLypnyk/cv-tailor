import { useState } from "react";
import type { TailoredCV } from "@/lib/llm/types";

export type TailorStatus = "idle" | "loading" | "success" | "error";

export interface TailorCVState {
  status: TailorStatus;
  result: TailoredCV | null;
  error: string | null;
}

export interface TailorCVActions {
  submit: (cvFile: File, jobDescription: string) => Promise<void>;
  reset: () => void;
}

export function useTailorCV(): TailorCVState & TailorCVActions {
  const [status, setStatus] = useState<TailorStatus>("idle");
  const [result, setResult] = useState<TailoredCV | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(cvFile: File, jobDescription: string) {
    setStatus("loading");
    setResult(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("cv", cvFile);
      formData.append("jobDescription", jobDescription);

      const response = await fetch("/api/tailor", {
        method: "POST",
        body: formData,
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof data === "object" && data !== null && "error" in data
            ? String((data as { error: unknown }).error)
            : "Something went wrong. Please try again.";
        throw new Error(message);
      }

      setResult(data as TailoredCV);
      setStatus("success");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
      setStatus("error");
    }
  }

  function reset() {
    setStatus("idle");
    setResult(null);
    setError(null);
  }

  return { status, result, error, submit, reset };
}
